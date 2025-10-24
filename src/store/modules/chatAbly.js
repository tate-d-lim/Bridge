import { 
  initializeAbly, 
  getAblyClients, 
  closeAblyConnection, 
  getConnectionStatus,
  createRoomName,
  parseRoomName 
} from '../../services/ably'
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore'
import { db } from '../../firebase/config'

export default {
  namespaced: true,
  
  state: {
    // Connection state
    isConnected: false,
    connectionStatus: 'disconnected',
    clientId: null,
    
    // Rooms and messages
    rooms: new Map(), // roomName -> room instance
    messages: new Map(), // roomName -> messages array
    activeRoom: null,
    
    // Presence and typing
    presence: new Map(), // roomName -> presence data
    typing: new Map(), // roomName -> typing users
    onlineUsers: new Set(),
    
    // UI state
    loading: false,
    error: null,
    
    // Chat rooms list
    chatRooms: [], // List of available chat rooms
  },
  
  mutations: {
    SET_CONNECTION_STATUS(state, { status, isConnected }) {
      state.connectionStatus = status
      state.isConnected = isConnected
    },
    
    SET_CLIENT_ID(state, clientId) {
      state.clientId = clientId
    },
    
    SET_ACTIVE_ROOM(state, roomName) {
      state.activeRoom = roomName
    },
    
    ADD_MESSAGE(state, { roomName, message }) {
      if (!state.messages.has(roomName)) {
        state.messages.set(roomName, [])
      }
      const messages = state.messages.get(roomName)
      
      // Check if message already exists (avoid duplicates)
      const exists = messages.some(msg => msg.serial === message.serial)
      if (!exists) {
        messages.push(message)
        
        // Sort messages by timestamp to maintain chronological order
        messages.sort((a, b) => {
          const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0
          const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0
          return timeA - timeB // Oldest first, newest last
        })
        
        // Keep only last 100 messages per room
        if (messages.length > 100) {
          messages.splice(0, messages.length - 100)
        }
        
        // Force reactivity update by creating a new array reference
        state.messages.set(roomName, [...messages])
        
        // Update the chat room's last message in local state
        const room = state.chatRooms.find(r => r.id === roomName || r.roomName === roomName)
        if (room) {
          room.lastMessage = message.text
          room.lastMessageSender = message.clientId
          room.lastMessageAt = new Date(message.timestamp)
        }
      }
    },
    
    UPDATE_MESSAGE(state, { roomName, message }) {
      if (!state.messages.has(roomName)) return
      
      const messages = state.messages.get(roomName)
      const index = messages.findIndex(msg => msg.serial === message.serial)
      if (index !== -1) {
        messages[index] = message
      }
    },
    
    DELETE_MESSAGE(state, { roomName, messageSerial }) {
      if (!state.messages.has(roomName)) return
      
      const messages = state.messages.get(roomName)
      const index = messages.findIndex(msg => msg.serial === messageSerial)
      if (index !== -1) {
        messages.splice(index, 1)
      }
    },
    
    SET_PRESENCE(state, { roomName, presenceData }) {
      state.presence.set(roomName, presenceData)
    },
    
    SET_TYPING(state, { roomName, typingUsers }) {
      state.typing.set(roomName, typingUsers)
    },
    
    SET_ONLINE_USERS(state, users) {
      state.onlineUsers = new Set(users)
    },
    
    SET_CHAT_ROOMS(state, rooms) {
      state.chatRooms = rooms
    },
    
    ADD_CHAT_ROOM(state, room) {
      const exists = state.chatRooms.some(r => r.id === room.id)
      if (!exists) {
        state.chatRooms.push(room)
      }
    },
    
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    
    SET_ERROR(state, error) {
      state.error = error
    },
    
    CLEAR_ERROR(state) {
      state.error = null
    }
  },
  
  actions: {
    // Initialize Ably connection
    async initializeConnection({ commit }, { clientId }) {
      try {
        console.log('Store: Starting Ably connection initialization...')
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        
        const { realtimeClient, chatClient } = initializeAbly(clientId)
        console.log('Store: Ably clients obtained:', { realtimeClient: !!realtimeClient, chatClient: !!chatClient })
        
        commit('SET_CLIENT_ID', clientId)
        
        // Listen for connection status changes
        realtimeClient.connection.on('statechange', (stateChange) => {
          console.log('Store: Connection state changed:', stateChange.current)
          const isConnected = stateChange.current === 'connected'
          commit('SET_CONNECTION_STATUS', {
            status: stateChange.current,
            isConnected
          })
          console.log('Store: Updated connection status in store:', { status: stateChange.current, isConnected })
        })
        
        // Set initial connection status
        const currentStatus = realtimeClient.connection.state
        console.log('Store: Initial connection status:', currentStatus)
        commit('SET_CONNECTION_STATUS', {
          status: currentStatus,
          isConnected: currentStatus === 'connected'
        })
        
        commit('SET_LOADING', false)
        console.log('Store: Ably connection initialization completed')
        
        // Force update connection status after initialization
        setTimeout(() => {
          const currentStatus = realtimeClient.connection.state
          console.log('Store: Final connection status check:', currentStatus)
          commit('SET_CONNECTION_STATUS', {
            status: currentStatus,
            isConnected: currentStatus === 'connected'
          })
        }, 500)
        
        return { realtimeClient, chatClient }
        
      } catch (error) {
        console.error('Store: Error initializing Ably connection:', error)
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    },
    
    // Load user's chat rooms from Firebase
    async loadChatRooms({ commit, state }, { userId }) {
      try {
        console.log('Loading chat rooms for user:', userId)
        
        // Query Firebase for chat rooms where user is a participant
        const q = query(
          collection(db, 'chatRooms'),
          where('participants', 'array-contains', userId),
          orderBy('lastMessageAt', 'desc')
        )
        
        const querySnapshot = await getDocs(q)
        const rooms = []
        
        querySnapshot.forEach((doc) => {
          const roomData = doc.data()
          rooms.push({
            id: doc.id,
            ...roomData,
            // Ensure we have all required fields
            participants: roomData.participants || [],
            participantNames: roomData.participantNames || [],
            participantRoles: roomData.participantRoles || [],
            lastMessage: roomData.lastMessage || '',
            lastMessageAt: roomData.lastMessageAt?.toDate() || new Date(),
            createdAt: roomData.createdAt?.toDate() || new Date()
          })
        })
        
        commit('SET_CHAT_ROOMS', rooms)
        console.log('Loaded chat rooms:', rooms.length)
        
        return rooms
        
      } catch (error) {
        console.error('Error loading chat rooms:', error)
        
        // If it's a permissions error, show helpful message
        if (error.code === 'permission-denied') {
          console.warn('Firebase permissions not set up yet. Please deploy firestore.rules')
          commit('SET_ERROR', 'Chat rooms permissions not configured. Please deploy Firebase rules.')
        } else {
          commit('SET_ERROR', error.message)
        }
        
        return []
      }
    },
    
    // Listen for real-time chat room updates
    async listenToChatRoomUpdates({ commit, state }, { userId }) {
      try {
        const q = query(
          collection(db, 'chatRooms'),
          where('participants', 'array-contains', userId),
          orderBy('lastMessageAt', 'desc')
        )
        
        // Set up real-time listener
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const rooms = []
          
          querySnapshot.forEach((doc) => {
            const roomData = doc.data()
            rooms.push({
              id: doc.id,
              ...roomData,
              participants: roomData.participants || [],
              participantNames: roomData.participantNames || [],
              participantRoles: roomData.participantRoles || [],
              lastMessage: roomData.lastMessage || '',
              lastMessageAt: roomData.lastMessageAt?.toDate() || new Date(),
              createdAt: roomData.createdAt?.toDate() || new Date()
            })
          })
          
          commit('SET_CHAT_ROOMS', rooms)
          console.log('Real-time chat rooms update:', rooms.length)
        })
        
        return unsubscribe
        
      } catch (error) {
        console.error('Error setting up chat room listener:', error)
        commit('SET_ERROR', error.message)
        return null
      }
    },
    
    // Save chat room to Firebase
    async saveChatRoom({ commit }, { participants, participantNames = [], participantRoles = [], roomName = null }) {
      try {
        console.log('Saving chat room to Firebase:', { participants, participantNames, participantRoles })
        
        const roomData = {
          participants,
          participantNames,
          participantRoles,
          roomName: roomName || createRoomName(participants),
          createdAt: serverTimestamp(),
          lastMessageAt: serverTimestamp(),
          lastMessage: '',
          lastMessageSender: null
        }
        
        const docRef = await addDoc(collection(db, 'chatRooms'), roomData)
        console.log('Chat room saved with ID:', docRef.id)
        
        // Add to local state
        const newRoom = {
          id: docRef.id,
          ...roomData,
          createdAt: new Date(),
          lastMessageAt: new Date()
        }
        
        commit('ADD_CHAT_ROOM', newRoom)
        return docRef.id
        
      } catch (error) {
        console.error('Error saving chat room:', error)
        commit('SET_ERROR', error.message)
        throw error
      }
    },
    
    // Update chat room last message
    async updateChatRoomLastMessage({ commit }, { roomId, message, senderId }) {
      try {
        const roomRef = doc(db, 'chatRooms', roomId)
        await updateDoc(roomRef, {
          lastMessage: message,
          lastMessageSender: senderId,
          lastMessageAt: serverTimestamp()
        })
        
        // Update local state
        const rooms = [...state.chatRooms]
        const roomIndex = rooms.findIndex(r => r.id === roomId)
        if (roomIndex !== -1) {
          rooms[roomIndex].lastMessage = message
          rooms[roomIndex].lastMessageSender = senderId
          rooms[roomIndex].lastMessageAt = new Date()
          commit('SET_CHAT_ROOMS', rooms)
        }
        
      } catch (error) {
        console.error('Error updating chat room:', error)
      }
    },
    
    // Create or get a room
    async createRoom({ commit, state, dispatch }, { participants, participantNames = [], participantRoles = [], roomName = null }) {
      try {
        console.log('Creating room with participants:', participants)
        
        // Check if room already exists in Firebase
        const existingRooms = state.chatRooms.filter(room => {
          if (room.participants.length !== participants.length) return false
          return participants.every(p => room.participants.includes(p))
        })
        
        if (existingRooms.length > 0) {
          console.log('Room already exists:', existingRooms[0].id)
          return existingRooms[0].id
        }
        
        // Create new room in Firebase
        const roomId = await dispatch('saveChatRoom', {
          participants,
          participantNames,
          participantRoles,
          roomName
        })
        
        // Create Ably room
        const { chatClient } = getAblyClients()
        const ablyRoomName = roomName || createRoomName(participants)
        const room = chatClient.rooms.get(ablyRoomName)
        await room.attach()
        
        // Store room in Ably state
        commit('ADD_ROOM', {
          name: ablyRoomName,
          firebaseId: roomId,
          participants: participants,
          messages: [],
          presence: [],
          typing: [],
          unreadCount: 0
        })
        
        console.log('Created room:', roomId, 'with Ably name:', ablyRoomName)
        return roomId
        
      } catch (error) {
        console.error('Error creating room:', error)
        commit('SET_ERROR', error.message)
        throw error
      }
    },
    
    // Join a room
    async joinRoom({ commit, state }, { roomName }) {
      try {
        const { chatClient } = getAblyClients()
        
        // Get room instance
        const room = await chatClient.rooms.get(roomName)
        
        // Attach to room
        await room.attach()
        
        // Store room reference
        state.rooms.set(roomName, room)
        
        // Subscribe to messages
        room.messages.subscribe((messageEvent) => {
          commit('ADD_MESSAGE', {
            roomName,
            message: messageEvent.message
          })
        })
        
        // Subscribe to presence
        room.presence.subscribe((presenceEvent) => {
          const presenceData = Array.from(room.presence.members.values())
          commit('SET_PRESENCE', { roomName, presenceData })
        })
        
        // Subscribe to typing indicators
        room.typing.subscribe((typingEvent) => {
          const typingUsers = Array.from(typingEvent.currentlyTyping)
          commit('SET_TYPING', { roomName, typingUsers })
        })
        
        // Load message history
        const history = await room.messages.history({ limit: 50 })
        
        // Sort history messages by timestamp (oldest first)
        const sortedHistory = history.items.sort((a, b) => {
          const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0
          const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0
          return timeA - timeB
        })
        
        sortedHistory.forEach(message => {
          commit('ADD_MESSAGE', { roomName, message })
        })
        
        commit('SET_ACTIVE_ROOM', roomName)
        
        return room
        
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },
    
    // Leave a room
    async leaveRoom({ commit, state }, { roomName }) {
      try {
        const room = state.rooms.get(roomName)
        if (room) {
          await room.detach()
          state.rooms.delete(roomName)
        }
        
        if (state.activeRoom === roomName) {
          commit('SET_ACTIVE_ROOM', null)
        }
        
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },
    
    // Send a message
    async sendMessage({ commit, state, dispatch }, { roomName, text, roomId = null }) {
      try {
        const room = state.rooms.get(roomName)
        if (!room) {
          throw new Error('Room not found')
        }
        
        const message = await room.messages.send({ text })
        
        // Update Firebase with last message if roomId is provided
        if (roomId) {
          await dispatch('updateChatRoomLastMessage', {
            roomId,
            message: text,
            senderId: state.clientId
          })
        }
        
        // Immediately update local chat room state for real-time UI updates
        const chatRoom = state.chatRooms.find(r => r.id === roomId)
        if (chatRoom) {
          chatRoom.lastMessage = text
          chatRoom.lastMessageSender = state.clientId
          chatRoom.lastMessageAt = new Date()
        }
        
        return message
        
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },
    
    // Edit a message
    async editMessage({ commit, state }, { roomName, messageSerial, newText }) {
      try {
        const room = state.rooms.get(roomName)
        if (!room) {
          throw new Error('Room not found')
        }
        
        const updatedMessage = await room.messages.update(messageSerial, { text: newText })
        commit('UPDATE_MESSAGE', { roomName, message: updatedMessage })
        
        return updatedMessage
        
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },
    
    // Delete a message
    async deleteMessage({ commit, state }, { roomName, messageSerial }) {
      try {
        const room = state.rooms.get(roomName)
        if (!room) {
          throw new Error('Room not found')
        }
        
        await room.messages.delete(messageSerial)
        commit('DELETE_MESSAGE', { roomName, messageSerial })
        
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },
    
    // Send typing indicator
    async sendTypingIndicator({ state }, { roomName }) {
      try {
        const room = state.rooms.get(roomName)
        if (!room) return
        
        await room.typing.keystroke()
        
      } catch (error) {
        console.error('Error sending typing indicator:', error)
      }
    },
    
    // Stop typing indicator
    async stopTypingIndicator({ state }, { roomName }) {
      try {
        const room = state.rooms.get(roomName)
        if (!room) return
        
        await room.typing.stop()
        
      } catch (error) {
        console.error('Error stopping typing indicator:', error)
      }
    },
    
    // Enter presence
    async enterPresence({ state }, { roomName, data = null }) {
      try {
        const room = state.rooms.get(roomName)
        if (!room) return
        
        await room.presence.enter(data)
        
      } catch (error) {
        console.error('Error entering presence:', error)
      }
    },
    
    // Leave presence
    async leavePresence({ state }, { roomName }) {
      try {
        const room = state.rooms.get(roomName)
        if (!room) return
        
        await room.presence.leave()
        
      } catch (error) {
        console.error('Error leaving presence:', error)
      }
    },
    
    // Send room reaction
    async sendRoomReaction({ state }, { roomName, reaction }) {
      try {
        const room = state.rooms.get(roomName)
        if (!room) return
        
        await room.reactions.send({ name: reaction })
        
      } catch (error) {
        console.error('Error sending room reaction:', error)
      }
    },
    
    // Close connection
    async closeConnection({ commit }) {
      try {
        closeAblyConnection()
        commit('SET_CONNECTION_STATUS', {
          status: 'disconnected',
          isConnected: false
        })
        commit('SET_CLIENT_ID', null)
        
      } catch (error) {
        commit('SET_ERROR', error.message)
      }
    }
  },
  
  getters: {
    // Connection
    isConnected: state => state.isConnected,
    connectionStatus: state => state.connectionStatus,
    clientId: state => state.clientId,
    
    // Rooms
    activeRoom: state => state.activeRoom,
    chatRooms: state => state.chatRooms,
    getRoomById: (state) => (roomId) => state.chatRooms.find(room => room.id === roomId),
    
    // Messages
    getMessages: state => roomName => {
      return state.messages.get(roomName) || []
    },
    
    // Presence
    getPresence: state => roomName => {
      return state.presence.get(roomName) || []
    },
    
    // Typing
    getTypingUsers: state => roomName => {
      return state.typing.get(roomName) || []
    },
    
    // Online users
    onlineUsers: state => Array.from(state.onlineUsers),
    
    // UI state
    loading: state => state.loading,
    error: state => state.error,
    
    // Helper getters
    getRoomById: state => roomId => {
      return state.chatRooms.find(room => room.id === roomId)
    },
    
    getUnreadCount: state => roomName => {
      const room = state.chatRooms.find(r => r.id === roomName)
      return room ? room.unreadCount : 0
    }
  }
}

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

// Helper function to auto-subscribe to all rooms to receive messages
const autoSubscribeToAllRooms = async ({ commit, state }, userId) => {
  console.log('🔔 Auto-subscribing to all chat rooms for user:', userId)
  
  try {
    const { chatClient } = getAblyClients()
    const subscribedRooms = new Set()
    
    // Subscribe to message events for all rooms where user is participant
    for (const room of state.chatRooms) {
      const roomName = room.roomName || room.id
      
      // Skip if already subscribed
      if (state.rooms.has(roomName) || subscribedRooms.has(roomName)) {
        continue
      }
      
      try {
        console.log('Auto-subscribing to room:', roomName)
        const ablyRoom = await chatClient.rooms.get(roomName)
        
        // Attach to room (this is required to receive messages)
        await ablyRoom.attach()
        
        // Store in state
        state.rooms.set(roomName, ablyRoom)
        subscribedRooms.add(roomName)
        
        // Subscribe to messages
        ablyRoom.messages.subscribe((messageEvent) => {
          const msg = messageEvent.message
          console.log('📥 [Background] Received message in room', roomName, ':', msg.text.substring(0, 30))
          
          commit('ADD_MESSAGE', {
            roomName,
            message: msg
          })
        })
        
        console.log('✅ Auto-subscribed to room:', roomName)
      } catch (error) {
        console.error('Error auto-subscribing to room', roomName, ':', error)
      }
    }
    
    console.log('✅ Auto-subscribed to', subscribedRooms.size, 'rooms')
  } catch (error) {
    console.error('Error in autoSubscribeToAllRooms:', error)
  }
}

// Helper function to auto-subscribe to a new room
const subscribeToNewRoom = async ({ commit, state }, { roomData, roomId, userId }) => {
  try {
    const { chatClient } = getAblyClients()
    const roomName = roomData.roomName || roomId
    
    console.log('Auto-subscribing to new room:', roomName)
    const ablyRoom = await chatClient.rooms.get(roomName)
    
    // Attach to room
    await ablyRoom.attach()
    
    // Store in state
    state.rooms.set(roomName, ablyRoom)
    
    // Subscribe to messages
    ablyRoom.messages.subscribe((messageEvent) => {
      const msg = messageEvent.message
      console.log('📥 [New Room] Received message:', msg.text.substring(0, 30))
      
      commit('ADD_MESSAGE', {
        roomName,
        message: msg
      })
    })
    
    console.log('✅ Auto-subscribed to new room:', roomName)
  } catch (error) {
    console.error('Error auto-subscribing to new room:', error)
  }
}

// Helper function to auto-create rooms when receiving messages
const startAutoCreateRoomsListener = ({ commit, state }, userId) => {
  console.log('🔔 Starting auto-create rooms listener for user:', userId)
  
  // Query for any room where user is participant
  const q = query(
    collection(db, 'chatRooms'),
    where('participants', 'array-contains', userId)
  )
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const roomData = change.doc.data()
        const roomId = change.doc.id
        const deletedFor = roomData.deletedFor || []
        
        // Don't auto-load if room is deleted for this user
        if (deletedFor.includes(userId)) {
          return
        }
        
        // Check if room already exists in local state
        const exists = state.chatRooms.find(r => r.id === roomId)
        if (!exists) {
          console.log('🆕 Auto-detected new chat room:', roomId, roomData)
          
          // Create room object
          const newRoom = {
            id: roomId,
            ...roomData,
            participants: roomData.participants || [],
            participantNames: roomData.participantNames || [],
            participantRoles: roomData.participantRoles || [],
            deletedFor: deletedFor,
            roomName: roomData.roomName,
            lastMessage: roomData.lastMessage || '',
            lastMessageAt: roomData.lastMessageAt?.toDate() || new Date(),
            createdAt: roomData.createdAt?.toDate() || new Date()
          }
          
          // Add to chat rooms
          commit('ADD_CHAT_ROOM', newRoom)
          
          // Auto-subscribe to the new room to receive messages (fire and forget)
          subscribeToNewRoom({ commit, state }, { roomData, roomId, userId }).catch(err => {
            console.error('Error in background subscription:', err)
          })
          
          // If room has a last message and it's not from current user, show as unread
          if (roomData.lastMessage && roomData.lastMessageSender !== userId) {
            const currentCount = state.unreadCounts.get(roomId) || 0
            state.unreadCounts.set(roomId, currentCount + 1)
            console.log('📬 Marked as unread:', roomId, 'count:', currentCount + 1, 'lastMessage:', roomData.lastMessage)
          }
          
          console.log('✅ Auto-added room to list:', roomId, 'name:', newRoom.participantNames)
        }
      }
    })
  })
  
  return unsubscribe
}

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
    
    // Track reactivated rooms to skip loading history
    reactivatedRooms: new Set(), // room IDs that were just reactivated
    
    // Track unread messages per room
    unreadCounts: new Map(), // roomId -> unreadCount
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
        
        // Increment unread count if message is not from current user and room is not active
        if (message.clientId !== state.clientId) {
          // Find the room in local state by roomName or id
          const targetRoom = state.chatRooms.find(r => r.roomName === roomName || r.id === roomName)
          if (targetRoom) {
            // Check if this is the active room
            const activeRoomId = state.chatRooms.find(r => state.activeRoom === (r.roomName || r.id))?.id
            if (targetRoom.id !== activeRoomId) {
              const currentCount = state.unreadCounts.get(targetRoom.id) || 0
              state.unreadCounts.set(targetRoom.id, currentCount + 1)
              console.log('📬 Unread count for room', targetRoom.id, ':', currentCount + 1)
            }
          }
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
    
    REMOVE_CHAT_ROOM(state, roomId) {
      state.chatRooms = state.chatRooms.filter(room => room.id !== roomId)
      // Also remove unread count when room is deleted
      state.unreadCounts.delete(roomId)
    },
    
    INCREMENT_UNREAD(state, roomId) {
      const currentCount = state.unreadCounts.get(roomId) || 0
      state.unreadCounts.set(roomId, currentCount + 1)
      console.log('📬 Incremented unread for room', roomId, ':', currentCount + 1)
    },
    
    CLEAR_UNREAD(state, roomId) {
      state.unreadCounts.set(roomId, 0)
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
          
          // Verify clientId on connect
          if (stateChange.current === 'connected') {
            const actualClientId = realtimeClient.auth.clientId
            console.log('✅ Connected with clientId:', actualClientId, 'Store clientId:', clientId)
            if (actualClientId !== clientId) {
              console.error('❌ CRITICAL: clientId mismatch!', {
                actual: actualClientId,
                expected: clientId
              })
            }
          }
          
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
          // Handle deletedFor field - it can be undefined, null, or an array
          const deletedFor = Array.isArray(roomData.deletedFor) ? roomData.deletedFor : []
          
          // Skip rooms that are deleted for this user
          if (deletedFor.includes(userId)) {
            console.log('🚫 Skipping deleted room in loadChatRooms:', doc.id, 'userId:', userId)
            return
          }
          
          rooms.push({
            id: doc.id,
            ...roomData,
            // Ensure we have all required fields
            participants: roomData.participants || [],
            participantNames: roomData.participantNames || [],
            participantRoles: roomData.participantRoles || [],
            deletedFor: deletedFor,
            roomName: roomData.roomName, // Ensure roomName is included
            lastMessage: roomData.lastMessage || '',
            lastMessageAt: roomData.lastMessageAt?.toDate() || new Date(),
            createdAt: roomData.createdAt?.toDate() || new Date()
          })
        })
        
        commit('SET_CHAT_ROOMS', rooms)
        console.log('Loaded chat rooms:', rooms.length)
        
        // Auto-subscribe to all rooms to receive messages even when not viewing them
        await autoSubscribeToAllRooms({ commit, state }, userId)
        
        // Note: Real-time updates for new rooms are handled by listenToChatRoomUpdates
        // (called from the Vue component). This avoids duplicate listeners.
        
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
          let skippedCount = 0
          let newRooms = 0
          
          querySnapshot.forEach((doc) => {
            const roomData = doc.data()
            // Handle deletedFor field - it can be undefined, null, or an array
            const deletedFor = Array.isArray(roomData.deletedFor) ? roomData.deletedFor : []
            
            // Skip rooms that are deleted for this user
            if (deletedFor.includes(userId)) {
              skippedCount++
              console.log('🚫 Skipping deleted room:', doc.id, 'userId:', userId, 'deletedFor:', deletedFor)
              return
            }
            
            const roomId = doc.id
            
            // Check if this is a new room that wasn't in local state
            const existingRoom = state.chatRooms.find(r => r.id === roomId)
            if (!existingRoom) {
              newRooms++
              console.log('🆕 Detected new room in real-time:', roomId)
              
              // If it has a last message from someone else, mark as unread
              if (roomData.lastMessage && roomData.lastMessageSender !== userId) {
                commit('INCREMENT_UNREAD', roomId)
                console.log('📬 Marked new room as unread:', roomId)
              }
              
              // CRITICAL: Subscribe to this new room to receive messages
              subscribeToNewRoom({ commit, state }, { roomData, roomId, userId }).catch(err => {
                console.error('Error subscribing to new room in listener:', err)
              })
            }
            
            rooms.push({
              id: roomId,
              ...roomData,
              participants: roomData.participants || [],
              participantNames: roomData.participantNames || [],
              participantRoles: roomData.participantRoles || [],
              deletedFor: deletedFor,
              roomName: roomData.roomName, // Ensure roomName is included
              lastMessage: roomData.lastMessage || '',
              lastMessageAt: roomData.lastMessageAt?.toDate() || new Date(),
              createdAt: roomData.createdAt?.toDate() || new Date()
            })
          })
          
          console.log('📋 Real-time chat rooms update:', {
            total: querySnapshot.size,
            added: rooms.length,
            skipped: skippedCount,
            newRooms: newRooms,
            roomIds: rooms.map(r => r.id)
          })
          
          commit('SET_CHAT_ROOMS', rooms)
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
    
    // Delete chat room for a specific user (doesn't affect other party)
    async deleteChatRoomForUser({ commit, state }, { roomId, userId }) {
      try {
        console.log('🗑️ Deleting chat room for user:', { roomId, userId })
        
        // Get the current room document to update deletedFor array
        const roomRef = doc(db, 'chatRooms', roomId)
        
        // Read current state to get deletedFor array and roomName
        const roomData = state.chatRooms.find(r => r.id === roomId)
        if (!roomData) {
          console.warn('Room not found in local state:', roomId)
          return
        }
        
        const deletedFor = roomData?.deletedFor || []
        const roomName = roomData?.roomName || roomId // Use roomName from Firebase if available
        
        console.log('🗑️ Deleting room:', { roomId, roomName, userId, currentDeletedFor: deletedFor })
        
        // Add userId to deletedFor array if not already present
        if (!deletedFor.includes(userId)) {
          const updatedDeletedFor = [...deletedFor, userId]
          console.log('📝 Updating Firebase with deletedFor:', updatedDeletedFor)
          
          // Update Firebase to mark room as deleted for this user
          await updateDoc(roomRef, {
            deletedFor: updatedDeletedFor
          })
          
          console.log('✅ Firebase successfully updated with deletedFor:', updatedDeletedFor)
          
          // Wait a moment to ensure Firebase sync
          await new Promise(resolve => setTimeout(resolve, 100))
        } else {
          console.log('⚠️ User already in deletedFor, skipping Firebase update')
        }
        
        // Update local state - remove room from chatRooms array immediately
        commit('REMOVE_CHAT_ROOM', roomId)
        console.log('✅ Room removed from local state')
        
        // Also clear messages for this room locally
        if (state.messages.has(roomName)) {
          state.messages.delete(roomName)
          console.log('✅ Messages cleared for room:', roomName)
        }
        
        // Leave the Ably room
        const room = state.rooms.get(roomName)
        if (room) {
          await room.detach()
          state.rooms.delete(roomName)
          console.log('✅ Left Ably room:', roomName)
        }
        
        // Clear active room if it's the deleted room
        if (state.activeRoom === roomName || state.activeRoom === roomId) {
          commit('SET_ACTIVE_ROOM', null)
          console.log('✅ Active room cleared')
        }
        
        console.log('✅ Chat room deleted successfully for user')
        
      } catch (error) {
        console.error('❌ Error deleting chat room:', error)
        commit('SET_ERROR', error.message)
        throw error
      }
    },
    
    // Create or get a room
    async createRoom({ commit, state, dispatch }, { participants, participantNames = [], participantRoles = [], roomName = null }) {
      try {
        console.log('Creating room with participants:', participants)
        
        // First check local state
        let existingRooms = state.chatRooms.filter(room => {
          if (room.participants.length !== participants.length) return false
          return participants.every(p => room.participants.includes(p))
        })
        
        // If not found locally, query Firebase to find any room with these participants
        if (existingRooms.length === 0) {
          const q = query(
            collection(db, 'chatRooms'),
            where('participants', 'array-contains', participants[0])
          )
          const querySnapshot = await getDocs(q)
          
          querySnapshot.forEach((doc) => {
            const roomData = doc.data()
            // Check if all participants match
            if (roomData.participants && roomData.participants.length === participants.length &&
                participants.every(p => roomData.participants.includes(p))) {
              existingRooms.push({
                id: doc.id,
                ...roomData,
                participants: roomData.participants || [],
                participantNames: roomData.participantNames || [],
                participantRoles: roomData.participantRoles || [],
                deletedFor: roomData.deletedFor || [],
                roomName: roomData.roomName,
                lastMessage: roomData.lastMessage || '',
                lastMessageAt: roomData.lastMessageAt?.toDate() || new Date(),
                createdAt: roomData.createdAt?.toDate() || new Date()
              })
            }
          })
        }
        
        if (existingRooms.length > 0) {
          const existingRoom = existingRooms[0]
          console.log('Room already exists:', existingRoom.id)
          
          // If current user has deleted this room, remove them from deletedFor array
          const currentUserId = state.clientId
          if (existingRoom.deletedFor && existingRoom.deletedFor.includes(currentUserId)) {
            console.log('Reactivating deleted room for user:', currentUserId)
            const updatedDeletedFor = existingRoom.deletedFor.filter(id => id !== currentUserId)
            
            // Update Firebase to remove user from deletedFor and clear message preview
            const roomRef = doc(db, 'chatRooms', existingRoom.id)
            await updateDoc(roomRef, {
              deletedFor: updatedDeletedFor,
              lastMessage: '',
              lastMessageSender: null
            })
            console.log('✅ Cleared lastMessage and lastMessageSender in Firebase')
            
            // Update local state - add room back if it was removed
            let rooms = [...state.chatRooms]
            const roomIndex = rooms.findIndex(r => r.id === existingRoom.id)
            if (roomIndex === -1) {
              // Room was removed from local state, add it back with cleared lastMessage
              rooms.push({
                ...existingRoom,
                deletedFor: updatedDeletedFor,
                lastMessage: '', // Clear the message preview
                lastMessageSender: null
              })
            } else {
              // Room exists, just update deletedFor and clear lastMessage
              rooms[roomIndex] = { 
                ...rooms[roomIndex], 
                deletedFor: updatedDeletedFor,
                lastMessage: '', // Clear the message preview
                lastMessageSender: null
              }
            }
            commit('SET_CHAT_ROOMS', rooms)
            
            // Clear any existing messages for this room to start fresh
            const ablyRoomName = existingRoom.roomName || existingRoom.id
            if (state.messages.has(ablyRoomName)) {
              console.log('Clearing old messages for reactivated room')
              state.messages.delete(ablyRoomName)
            }
            
            // Mark this room as reactivated to skip loading history
            state.reactivatedRooms.add(existingRoom.id)
            
            // Remove from reactivated set after 2 seconds
            setTimeout(() => {
              state.reactivatedRooms.delete(existingRoom.id)
            }, 2000)
          }
          
          return existingRoom.id
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
        
        // Store room reference in state
        state.rooms.set(ablyRoomName, room)
        
        console.log('Created room:', roomId, 'with Ably name:', ablyRoomName)
        return roomId
        
      } catch (error) {
        console.error('Error creating room:', error)
        commit('SET_ERROR', error.message)
        throw error
      }
    },
    
    // Join a room
    async joinRoom({ commit, state }, { roomName, skipHistory = false }) {
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
          const msg = messageEvent.message
          console.log('📥 Received message:', {
            text: msg.text.substring(0, 50),
            clientId: msg.clientId,
            myClientId: state.clientId,
            isFromMe: msg.clientId === state.clientId,
            roomName
          })
          commit('ADD_MESSAGE', {
            roomName,
            message: msg
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
        
        // Check if this room was just reactivated
        const isReactivated = Array.from(state.reactivatedRooms).some(roomId => {
          const r = state.chatRooms.find(rm => rm.id === roomId && (rm.roomName === roomName || rm.id === roomName))
          return r !== undefined
        })
        
        // Load message history only if not skipping and not reactivated
        if (!skipHistory && !isReactivated) {
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
        } else if (isReactivated) {
          console.log('Skipping history load for reactivated room')
        }
        
        commit('SET_ACTIVE_ROOM', roomName)
        
        // Clear unread count when joining a room
        const roomId = state.chatRooms.find(r => r.roomName === roomName || r.id === roomName)?.id
        if (roomId) {
          commit('CLEAR_UNREAD', roomId)
          console.log('✅ Cleared unread count for room:', roomId)
        }
        
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
        
        console.log('📤 Sending message:', {
          text: text.substring(0, 50),
          roomName,
          myClientId: state.clientId,
          roomClient: room.clientId
        })
        
        const message = await room.messages.send({ text })
        
        console.log('✅ Message sent:', {
          serial: message.serial,
          msgClientId: message.clientId,
          myClientId: state.clientId,
          match: message.clientId === state.clientId
        })
        
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
    
    getUnreadCount: state => roomId => {
      // Get unread count from the unreadCounts Map
      const count = state.unreadCounts.get(roomId) || 0
      return count
    }
  }
}

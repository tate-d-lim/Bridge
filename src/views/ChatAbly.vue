  <template>
  <div class="chat-page">
    <Toast />
    <ConfirmationDialog
      :show="showDeleteConfirm"
      title="Delete Conversation"
      :message="deleteConfirmMessage"
      confirm-text="Delete"
      cancel-text="Cancel"
      @confirm="confirmDeleteChatRoom"
      @cancel="cancelDeleteChatRoom"
      @update:show="showDeleteConfirm = $event"
    />
    <ConfirmationDialog
      :show="showDeleteMessageConfirm"
      title="Delete Message"
      message="Are you sure you want to delete this message? This action cannot be undone."
      confirm-text="Delete"
      cancel-text="Cancel"
      @confirm="confirmDeleteMessage"
      @cancel="showDeleteMessageConfirm = false"
      @update:show="showDeleteMessageConfirm = $event"
    />
    <div class="chat-container">
      <!-- Chat Sidebar -->
      <div class="chat-sidebar">
        <div class="sidebar-header">
          <div class="header-top">
            <div class="messages-header-content">
              <svg class="messages-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <h2>Messages</h2>
            </div>
            <div class="connection-badge" :class="{ connected: isConnected }">
              <div class="status-dot"></div>
              <span>{{ isConnected ? 'Online' : 'Offline' }}</span>
            </div>
          </div>
          <button @click="openNewChatModal" class="btn-new-chat">
            <svg class="plus-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5v14m-7-7h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>New Chat</span>
          </button>
        </div>
        
        <div class="chat-rooms-list">
          <div
            v-for="room in chatRooms"
            :key="room.id"
            :class="['chat-room-item', { active: activeRoom === (room.roomName || room.id) }]"
            @click="selectRoom(room)"
            @contextmenu.prevent="openContextMenu($event, room)"
          >
            <div class="room-avatar">
              <img 
                v-if="getRoomPictureSync(room)" 
                :src="getRoomPictureSync(room)" 
                :alt="getRoomDisplayName(room)"
                class="avatar-image"
                @error="(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }"
              />
              <span v-show="!getRoomPictureSync(room)">{{ getRoomInitials(room) }}</span>
            </div>
            <div class="room-info">
              <h3>{{ getRoomDisplayName(room) }}</h3>
              <p class="last-message">{{ room.lastMessage || 'No messages yet' }}</p>
              <div v-if="getTypingUsers(room.roomName || room.id).length > 0" class="typing-indicator">
                {{ getTypingUsers(room.roomName || room.id).map(userId => getCachedUsername(userId, room)).join(', ') }} is typing...
              </div>
            </div>
            <div class="room-meta">
              <span v-if="room.lastMessageAt" class="room-time">
                {{ formatTime(room.lastMessageAt) }}
              </span>
              <div v-if="getUnreadCount(room.id) > 0" class="unread-badge">
                {{ getUnreadCount(room.id) > 99 ? '99+' : getUnreadCount(room.id) }}
              </div>
            </div>
          </div>
          
          <div v-if="chatRooms.length === 0" class="empty-rooms">
            <div class="empty-icon">💬</div>
            <p>No conversations yet</p>
            <button @click="showNewChatModal = true" class="btn btn-primary">
              Start your first chat
            </button>
          </div>
        </div>
      </div>

      <!-- Chat Window -->
      <div class="chat-window">
        <div v-if="!activeRoom" class="no-room-selected">
          <div class="welcome-icon">👋</div>
          <GradientText>
            <h3>Welcome to Bridge Chat</h3>
          </GradientText>
          <p>Select a conversation to start messaging</p>
        </div>

        <div v-else class="chat-content">
          <!-- Chat Header -->
          <div class="chat-header">
            <div class="chat-header-info">
              <div class="chat-avatar">
                <img 
                  v-if="getCurrentRoom() && getRoomPictureSync(getCurrentRoom())" 
                  :src="getRoomPictureSync(getCurrentRoom())" 
                  :alt="getRoomDisplayName(getCurrentRoom())"
                  class="avatar-image"
                  @error="(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }"
                />
                <span v-show="!getCurrentRoom() || !getRoomPictureSync(getCurrentRoom())">{{ getRoomInitials(getCurrentRoom()) }}</span>
              </div>
              <div class="chat-details">
                <h3>{{ getRoomDisplayName(getCurrentRoom()) }}</h3>
              </div>
            </div>
          </div>

          <!-- Messages Container -->
          <div class="messages-container" ref="messagesContainer">
            <div class="messages-list">
              <div
                v-for="message in filteredMessages"
                :key="message.serial"
                :class="['message', { 'message-sent': message.clientId === clientId }]"
              >
                <div class="message-content">
                  <div v-if="message.clientId !== clientId" class="sender-name">
                    {{ getCachedUsername(message.clientId, getCurrentRoom()) }}
                  </div>
                  <div 
                    class="message-bubble"
                    @contextmenu.prevent="message.clientId === clientId ? openMessageContextMenu($event, message) : null"
                  >
                    <div v-if="editingMessageSerial === message.serial" class="edit-mode">
                      <textarea
                        v-model="editMessageText"
                        class="edit-textarea"
                        @keydown.enter.exact.prevent="saveInlineEdit"
                        @keydown.esc="cancelInlineEdit"
                        ref="editTextarea"
                      ></textarea>
                      <div class="edit-actions">
                        <button @click="cancelInlineEdit" class="edit-btn cancel-btn">
                          <svg class="edit-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                        </button>
                        <button @click="saveInlineEdit" class="edit-btn save-btn">
                          <svg class="edit-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                        </button>
                      </div>
                      <span class="edit-hint">Press Enter to save • Esc to cancel</span>
                    </div>
                    <div v-else>
                      <p>{{ message.text }}</p>
                      <div class="message-footer">
                        <span class="message-time">{{ formatMessageTime(message.timestamp) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Typing Indicator -->
              <div v-if="getTypingUsers(activeRoom).length > 0" class="typing-indicator-message">
                <div class="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span class="typing-text">{{ getTypingUsers(activeRoom).map(userId => getCachedUsername(userId, getCurrentRoom())).join(', ') }} is typing...</span>
              </div>
            </div>
          </div>

          <!-- Message Input -->
          <div class="message-input-container">
            <div class="input-wrapper">
              <input
                ref="messageInput"
                type="text"
                v-model="newMessage"
                @keyup.enter="sendMessage"
                @input="handleTyping"
                @focus="handleFocus"
                @blur="handleBlur"
                placeholder="Type a message..."
                class="message-input"
                :disabled="!isConnected"
              />
              <button 
                @click="sendMessage" 
                class="send-btn"
                :disabled="!newMessage.trim() || !isConnected"
              >
                <svg class="send-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Send message">
                  <path d="M3 20l18-8L3 4l.01 6.02L15 12 3.01 13.98z" fill="currentColor"/>
                </svg>
              </button>
            </div>
            <div v-if="!isConnected" class="connection-status">
              <span class="status-indicator offline"></span>
              Connecting...
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chat Room Context Menu -->
    <div 
      v-if="contextMenu.show" 
      class="context-menu"
      :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
      @click.stop
    >
      <button @click="deleteContextRoom" class="context-menu-item delete-item">
        <svg class="context-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6m4-6v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Delete Conversation</span>
      </button>
    </div>

    <!-- Message Context Menu -->
    <div 
      v-if="messageContextMenu.show" 
      class="context-menu"
      :style="{ top: messageContextMenu.y + 'px', left: messageContextMenu.x + 'px' }"
      @click.stop
    >
      <button @click="editContextMessage" class="context-menu-item edit-item">
        <svg class="context-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Edit Message</span>
      </button>
      <button @click="deleteContextMessage" class="context-menu-item delete-item">
        <svg class="context-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6m4-6v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Delete Message</span>
      </button>
    </div>

    <!-- New Chat Modal -->
    <div v-if="showNewChatModal" class="modal-overlay" @click="closeNewChatModal">
      <div class="modal-content new-chat-modal" @click.stop>
        <div class="modal-header">
          <div class="header-content">
            <h3>Start New Chat</h3>
            <p class="header-subtitle">Search and select a user to start chatting</p>
          </div>
          <button @click="closeNewChatModal" class="btn-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="search-section">
            <div class="form-group">
              <label class="search-label">
                <span class="search-icon">🔍</span>
                Search Users
              </label>
              <input 
                v-model="searchQuery" 
                @input="searchUsers" 
                placeholder="Type a name to search users..."
                class="form-input search-input"
                ref="searchInput"
              />
            </div>
          </div>
          
          <div class="results-section">
            <div v-if="searchQuery && searchResults.length > 0" class="search-results">
              <div class="results-header">
                <h4>Found {{ searchResults.length }} user(s)</h4>
              </div>
              <div class="users-list">
                <div 
                  v-for="user in searchResults" 
                  :key="user.id"
                  @click="startChatWithUser(user)"
                  class="user-result"
                >
                  <div class="user-avatar">
                    {{ getInitials(user.name) }}
                  </div>
                  <div class="user-info">
                    <h4>{{ user.name }}</h4>
                    <p class="user-role">{{ user.role || 'user' }}</p>
                    <p v-if="user.email" class="user-email">{{ user.email }}</p>
                  </div>
                  <div class="user-action">
                    <span class="action-text">Start Chat</span>
                    <span class="action-icon">💬</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-if="searchQuery && searchResults.length === 0" class="no-results">
              <div class="no-results-icon">👥</div>
              <h4>No users found</h4>
              <p>No users found matching "{{ searchQuery }}"</p>
              <p class="suggestion">Try searching with a different name</p>
            </div>
            
            <div v-if="!searchQuery" class="search-prompt">
              <div class="prompt-icon">💬</div>
              <h4>Start a conversation</h4>
              <p>Type a name above to search for users and start chatting</p>
              <div class="quick-actions">
                <button @click="searchQuery = 'John'; searchUsers()" class="quick-btn">
                  Try "John"
                </button>
                <button @click="searchQuery = 'Jane'; searchUsers()" class="quick-btn">
                  Try "Jane"
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useStore } from 'vuex'
import { collection, query, where, getDocs, orderBy, limit, getDoc, doc } from 'firebase/firestore'
import { db } from '../firebase/config'
import GradientText from '../components/GradientText.vue'
import Toast from '../components/Toast.vue'
import ConfirmationDialog from '../components/ConfirmationDialog.vue'
import { useToast } from '../composables/useToast'

export default {
  name: 'ChatAbly',
  setup() {
    const store = useStore()
    const { showToast } = useToast()
    
    // Reactive data
    const newMessage = ref('')
    const messagesContainer = ref(null)
    const messageInput = ref(null)
    const showNewChatModal = ref(false)
    const searchQuery = ref('')
    const searchResults = ref([])
    const editMessageText = ref('')
    const editingMessageSerial = ref(null)
    const editTextarea = ref(null)
    const typingTimeout = ref(null)
    const chatRoomUnsubscribe = ref(null)
    const contextMenu = ref({
      show: false,
      x: 0,
      y: 0,
      room: null
    })
    const messageContextMenu = ref({
      show: false,
      x: 0,
      y: 0,
      message: null
    })
    
    // Computed properties
    const currentUser = computed(() => store.getters['auth/currentUser'])
    const userProfile = computed(() => store.getters['auth/userProfile'])
    const isConnected = computed(() => {
      return store.getters['chatAbly/isConnected']
    })
    const clientId = computed(() => store.getters['chatAbly/clientId'])
    const activeRoom = computed(() => store.getters['chatAbly/activeRoom'])
    const chatRooms = computed(() => store.getters['chatAbly/chatRooms'])
    
    // Methods
    const getInitials = (name) => {
      if (!name) return '?'
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    
    const getRoomInitials = (room) => {
      if (!room) return '?'
      return getInitials(getRoomDisplayName(room))
    }
    
    // Cache for user profile pictures
    const userPictureCache = new Map()
    
    // Get user profile picture URL
    const getUserPicture = async (userId, room = null) => {
      if (!userId) {
        console.log('[头像检查] userId为空')
        return null
      }
      
      // Check cache first
      if (userPictureCache.has(userId)) {
        const cached = userPictureCache.get(userId)
        console.log('[头像检查] 从缓存获取:', userId, cached)
        return cached
      }
      
      // If current user, return from userProfile
      if (userId === currentUser.value?.uid) {
        const pictureUrl = userProfile.value?.photoURL || userProfile.value?.profilePicture || userProfile.value?.profile_picture
        console.log('[头像检查] 当前用户头像:', userId, pictureUrl)
        if (pictureUrl) {
          userPictureCache.set(userId, pictureUrl)
          return pictureUrl
        }
        return null
      }
      
      // Check if room has participant profile pictures
      if (room && room.participantPictures && Array.isArray(room.participantPictures)) {
        const participantIndex = room.participants?.indexOf(userId)
        if (participantIndex !== -1 && room.participantPictures[participantIndex]) {
          const pictureUrl = room.participantPictures[participantIndex]
          console.log('[头像检查] 从room获取:', userId, pictureUrl)
          userPictureCache.set(userId, pictureUrl)
          return pictureUrl
        }
      }
      
      // Fetch from Firestore if not cached
      try {
        console.log('[头像检查] 从Firestore获取:', userId)
        const userDoc = await getDoc(doc(db, 'users', userId))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          console.log('[头像检查] 用户数据:', userId, {
            hasPhotoURL: !!userData.photoURL,
            hasProfilePicture: !!userData.profilePicture,
            hasProfile_picture: !!userData.profile_picture,
            photoURL: userData.photoURL ? 'base64 image (length: ' + userData.photoURL.length + ')' : undefined,
            profilePicture: userData.profilePicture,
            profile_picture: userData.profile_picture,
            allKeys: Object.keys(userData)
          })
          
          // Check photoURL first (used by uploadProfilePicture), then fallback to profilePicture/profile_picture
          const pictureUrl = userData.photoURL || userData.profilePicture || userData.profile_picture || null
          
          // Validate URL format
          if (pictureUrl) {
            // Check if it's a base64 image (data:image/...)
            if (typeof pictureUrl === 'string' && pictureUrl.startsWith('data:image/')) {
              console.log('[头像检查] Base64图片:', userId, '长度:', pictureUrl.length)
              userPictureCache.set(userId, pictureUrl)
              return pictureUrl
            }
            // Check if it's a valid URL (starts with http:// or https://)
            else if (typeof pictureUrl === 'string' && (pictureUrl.startsWith('http://') || pictureUrl.startsWith('https://'))) {
              console.log('[头像检查] 有效URL:', userId, pictureUrl)
              userPictureCache.set(userId, pictureUrl)
              return pictureUrl
            } else if (typeof pictureUrl === 'string' && pictureUrl.trim().length > 0) {
              // If it's a storage path, we might need to construct a download URL
              // For now, just return it and let the @error handler deal with invalid URLs
              console.log('[头像检查] 可能是存储路径:', userId, pictureUrl)
              userPictureCache.set(userId, pictureUrl)
              return pictureUrl
            }
          } else {
            console.log('[头像检查] 用户没有头像:', userId)
          }
        } else {
          console.log('[头像检查] 用户文档不存在:', userId)
        }
      } catch (error) {
        console.error('[头像检查] 错误获取用户头像:', userId, error)
      }
      
      return null
    }
    
    // Get room participant picture (for room display)
    const getRoomPicture = async (room) => {
      if (!room || !room.participants) {
        console.log('[头像检查] Room或participants为空:', room?.id)
        return null
      }
      
      // For direct messages, get the other participant's picture
      if (room.participants.length === 2) {
        const otherParticipantId = room.participants.find(p => p !== currentUser.value?.uid)
        console.log('[头像检查] 查找其他参与者:', room.id, {
          currentUserId: currentUser.value?.uid,
          otherParticipantId,
          participants: room.participants
        })
        if (otherParticipantId) {
          const picture = await getUserPicture(otherParticipantId, room)
          console.log('[头像检查] Room头像结果:', room.id, picture)
          return picture
        }
      }
      
      // For group chats, return null (use initials)
      console.log('[头像检查] 群聊或无其他参与者:', room.id)
      return null
    }
    
    // Reactive refs for storing profile pictures
    const roomPictures = ref(new Map())
    
    // Load pictures for all rooms
    const loadRoomPictures = async () => {
      if (!chatRooms.value || chatRooms.value.length === 0) {
        console.log('[头像检查] 没有聊天房间')
        return
      }
      
      console.log('[头像检查] 开始加载房间头像，房间数量:', chatRooms.value.length)
      const newPictures = new Map(roomPictures.value)
      let hasChanges = false
      
      // Load pictures for all rooms in parallel for better performance
      const picturePromises = chatRooms.value.map(async (room) => {
        if (!newPictures.has(room.id)) {
          try {
            const picture = await getRoomPicture(room)
            if (picture) {
              newPictures.set(room.id, picture)
              hasChanges = true
              console.log('[头像检查] 成功加载房间头像:', room.id, picture)
            } else {
              console.log('[头像检查] 房间没有头像:', room.id)
            }
          } catch (error) {
            console.error('[头像检查] 加载房间头像错误:', room.id, error)
          }
        } else {
          console.log('[头像检查] 房间头像已缓存:', room.id, newPictures.get(room.id))
        }
      })
      
      await Promise.all(picturePromises)
      
      // Only update if there are new pictures to trigger reactivity
      if (hasChanges) {
        console.log('[头像检查] 更新头像Map，新头像数量:', newPictures.size)
        roomPictures.value = newPictures
      } else {
        console.log('[头像检查] 没有新头像需要更新')
      }
    }
    
    // Watch chatRooms to load pictures when rooms change
    // Use nextTick to ensure this doesn't block message rendering
    watch(chatRooms, () => {
      nextTick(() => {
        loadRoomPictures()
      })
    }, { immediate: true })
    
    // Get picture for a specific room (synchronous access to cached data)
    const getRoomPictureSync = (room) => {
      if (!room) {
        return null
      }
      const picture = roomPictures.value.get(room.id) || null
      if (!picture) {
        console.log('[头像检查] getRoomPictureSync: 房间没有头像缓存', room.id, 'Map大小:', roomPictures.value.size)
      }
      return picture
    }
    
    const getRoomDisplayName = (room) => {
      if (!room) return 'Unknown'
      // For direct messages, show the other participant's name
      if (room.participants && room.participants.length === 2) {
        const otherParticipantId = room.participants.find(p => p !== currentUser.value.uid)
        if (otherParticipantId && room.participantNames && room.participantNames.length === 2) {
          // Find which index the other participant is at
          const otherParticipantIndex = room.participants.indexOf(otherParticipantId)
          // Get the corresponding name from participantNames array
          if (otherParticipantIndex !== -1 && room.participantNames[otherParticipantIndex]) {
            return room.participantNames[otherParticipantIndex]
          }
        }
        return otherParticipantId || 'Unknown User'
      }
      return room.name || 'Unknown Room'
    }
    
    const getUsernameFromId = (userId, room = null) => {
      if (!userId) return 'Unknown User'
      
      // If we have room data with participant names
      if (room && room.participants && room.participantNames) {
        const participantIndex = room.participants.indexOf(userId)
        if (participantIndex !== -1 && room.participantNames[participantIndex]) {
          return room.participantNames[participantIndex]
        }
      }
      
      // Check if this is the current user
      if (userId === currentUser.value?.uid) {
        return userProfile.value?.name || currentUser.value?.displayName || currentUser.value?.email || 'You'
      }
      
      // Return the ID as fallback (instead of showing email)
      return userId.substring(0, 8) // Show first 8 chars of ID
    }
    
    // Memoized username mapping for better performance
    const usernameCache = new Map()
    const getCachedUsername = (userId, room = null) => {
      const cacheKey = `${userId}-${room?.id || 'no-room'}`
      
      if (usernameCache.has(cacheKey)) {
        return usernameCache.get(cacheKey)
      }
      
      const username = getUsernameFromId(userId, room)
      usernameCache.set(cacheKey, username)
      
      // Clear cache when room changes to prevent memory leaks
      if (usernameCache.size > 100) {
        usernameCache.clear()
      }
      
      return username
    }
    
    const formatTime = (timestamp) => {
      if (!timestamp) return ''
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now - date
      
      if (diff < 60000) return 'Just now'
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
      return date.toLocaleDateString()
    }
    
    const formatMessageTime = (timestamp) => {
      const date = new Date(timestamp)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    
    const getMessages = (roomName) => {
      return store.getters['chatAbly/getMessages'](roomName)
    }
    
    const getTypingUsers = (roomName) => {
      return store.getters['chatAbly/getTypingUsers'](roomName)
    }
    
    const getUnreadCount = (roomId) => {
      return store.getters['chatAbly/getUnreadCount'](roomId)
    }
    
    const getCurrentRoom = () => {
      const activeRoomName = activeRoom.value
      if (!activeRoomName) return null
      // Find room by roomName (Ably room name) or by id
      return chatRooms.value.find(room => (room.roomName || room.id) === activeRoomName) || null
    }
    
    
    const selectRoom = async (room) => {
      const roomName = room.roomName || room.id
      if (activeRoom.value === roomName) return
      
      try {
        await store.dispatch('chatAbly/joinRoom', { roomName })
        await nextTick()
        // Force scroll to bottom when entering a room
        setTimeout(() => {
          forceScrollToBottom()
        }, 200)
      } catch (error) {
        console.error('Error selecting room:', error)
      }
    }
    
    const sendMessage = async () => {
      if (!newMessage.value.trim() || !activeRoom.value || !isConnected.value) return
      
      try {
        const currentRoom = getCurrentRoom()
        await store.dispatch('chatAbly/sendMessage', {
          roomName: activeRoom.value,
          text: newMessage.value,
          roomId: currentRoom?.id
        })
        
        newMessage.value = ''
        await nextTick()
        // Small delay to ensure message is rendered
        setTimeout(() => {
          forceScrollToBottom()
        }, 100)
      } catch (error) {
        console.error('Error sending message:', error)
        showToast('Error sending message: ' + error.message, 'error')
      }
    }
    
    
    const showDeleteMessageConfirm = ref(false)
    const messageToDelete = ref(null)
    
    const deleteMessage = async (message) => {
      messageToDelete.value = message
      showDeleteMessageConfirm.value = true
    }
    
    const confirmDeleteMessage = async () => {
      if (!messageToDelete.value) return
      
      try {
        await store.dispatch('chatAbly/deleteMessage', {
          roomName: activeRoom.value,
          messageSerial: messageToDelete.value.serial
        })
        showToast('Message deleted successfully', 'success')
        messageToDelete.value = null
      } catch (error) {
        console.error('Error deleting message:', error)
        showToast('Error deleting message: ' + error.message, 'error')
      }
    }
    
    const showDeleteConfirm = ref(false)
    const roomToDelete = ref(null)
    const deleteConfirmMessage = computed(() => {
      if (!roomToDelete.value) return ''
      return `Are you sure you want to delete this conversation with ${getRoomDisplayName(roomToDelete.value)}? This will hide it from your chat list, but the other participant will still see it.`
    })
    
    const deleteChatRoom = async (room) => {
      roomToDelete.value = room
      showDeleteConfirm.value = true
    }
    
    const confirmDeleteChatRoom = async () => {
      if (!roomToDelete.value) return
      
      try {
        await store.dispatch('chatAbly/deleteChatRoomForUser', {
          roomId: roomToDelete.value.id,
          userId: currentUser.value.uid
        })
        showToast('Conversation deleted successfully', 'success')
        roomToDelete.value = null
      } catch (error) {
        console.error('Error deleting chat room:', error)
        showToast('Error deleting conversation: ' + error.message, 'error')
      }
    }
    
    const cancelDeleteChatRoom = () => {
      roomToDelete.value = null
      showDeleteConfirm.value = false
    }
    
    const openContextMenu = (event, room) => {
      contextMenu.value.show = true
      contextMenu.value.x = event.clientX
      contextMenu.value.y = event.clientY
      contextMenu.value.room = room
    }
    
    const closeContextMenu = () => {
      contextMenu.value.show = false
      contextMenu.value.room = null
    }
    
    const deleteContextRoom = () => {
      if (contextMenu.value.room) {
        deleteChatRoom(contextMenu.value.room)
      }
      closeContextMenu()
    }
    
    const openMessageContextMenu = (event, message) => {
      messageContextMenu.value.show = true
      messageContextMenu.value.x = event.clientX
      messageContextMenu.value.y = event.clientY
      messageContextMenu.value.message = message
    }
    
    const closeMessageContextMenu = () => {
      messageContextMenu.value.show = false
      messageContextMenu.value.message = null
    }
    
    const editContextMessage = () => {
      if (messageContextMenu.value.message) {
        startInlineEdit(messageContextMenu.value.message)
      }
      closeMessageContextMenu()
    }
    
    const deleteContextMessage = () => {
      if (messageContextMenu.value.message) {
        deleteMessage(messageContextMenu.value.message)
      }
      closeMessageContextMenu()
    }
    
    const startInlineEdit = (message) => {
      editingMessageSerial.value = message.serial
      editMessageText.value = message.text
      // Focus textarea after DOM updates
      nextTick(() => {
        const textarea = document.querySelector('.edit-textarea')
        if (textarea) {
          textarea.focus()
          textarea.select()
        }
      })
    }
    
    const cancelInlineEdit = () => {
      editingMessageSerial.value = null
      editMessageText.value = ''
    }
    
    const saveInlineEdit = async () => {
      if (!editMessageText.value.trim() || !editingMessageSerial.value) return
      
      try {
        await store.dispatch('chatAbly/editMessage', {
          roomName: activeRoom.value,
          messageSerial: editingMessageSerial.value,
          newText: editMessageText.value
        })
        
        showToast('Message updated successfully', 'success')
        editingMessageSerial.value = null
        editMessageText.value = ''
      } catch (error) {
        console.error('Error editing message:', error)
        showToast('Error editing message: ' + error.message, 'error')
      }
    }
    
    const handleTyping = () => {
      if (!activeRoom.value) return
      
      // Send typing indicator
      store.dispatch('chatAbly/sendTypingIndicator', {
        roomName: activeRoom.value
      })
      
      // Clear previous timeout
      if (typingTimeout.value) {
        clearTimeout(typingTimeout.value)
      }
      
      // Set timeout to stop typing indicator
      typingTimeout.value = setTimeout(() => {
        store.dispatch('chatAbly/stopTypingIndicator', {
          roomName: activeRoom.value
        })
      }, 1000)
    }
    
    const handleFocus = () => {
      // Focus handling if needed
    }
    
    const handleBlur = () => {
      // Stop typing indicator when input loses focus
      if (activeRoom.value) {
        store.dispatch('chatAbly/stopTypingIndicator', {
          roomName: activeRoom.value
        })
      }
    }
    
    const scrollToBottom = () => {
      if (messagesContainer.value) {
        // Use requestAnimationFrame for better performance
        requestAnimationFrame(() => {
          const container = messagesContainer.value
          const isNearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 100
          
          // Only scroll if user is near the bottom (not scrolled up)
          if (isNearBottom) {
            container.scrollTop = container.scrollHeight
          }
        })
      }
    }
    
    const forceScrollToBottom = () => {
      if (messagesContainer.value) {
        // Always scroll to bottom, regardless of current position
        requestAnimationFrame(() => {
          const container = messagesContainer.value
          container.scrollTop = container.scrollHeight
        })
      }
    }
    
    const searchUsers = async () => {
      if (!searchQuery.value.trim()) {
        searchResults.value = []
        return
      }
      
      try {
        // Search users by name in Firebase
        const q = query(
          collection(db, 'users'),
          where('name', '>=', searchQuery.value),
          where('name', '<=', searchQuery.value + '\uf8ff'),
          orderBy('name'),
          limit(20)
        )
        
        const querySnapshot = await getDocs(q)
        const users = []
        
        querySnapshot.forEach((doc) => {
          const userData = doc.data()
          // Don't include current user in results
          if (doc.id !== currentUser.value.uid) {
            users.push({ 
              id: doc.id, 
              name: userData.name || 'Unknown User',
              role: userData.role || 'user',
              email: userData.email,
              profilePicture: userData.profilePicture,
              ...userData
            })
          }
        })
        
        // If no exact matches, try a broader search
        if (users.length === 0) {
          const broadQuery = query(
            collection(db, 'users'),
            orderBy('name'),
            limit(50)
          )
          
          const broadSnapshot = await getDocs(broadQuery)
          const allUsers = []
          
          broadSnapshot.forEach((doc) => {
            const userData = doc.data()
            if (doc.id !== currentUser.value.uid && 
                userData.name && 
                userData.name.toLowerCase().includes(searchQuery.value.toLowerCase())) {
              allUsers.push({ 
                id: doc.id, 
                name: userData.name,
                role: userData.role || 'user',
                email: userData.email,
                profilePicture: userData.profilePicture,
                ...userData
              })
            }
          })
          
          searchResults.value = allUsers.slice(0, 20)
        } else {
          searchResults.value = users
        }
        
      } catch (error) {
        console.error('Error searching users:', error)
        // Fallback to mock users if Firebase search fails
        const mockUsers = [
          { id: 'user1', name: 'John Doe', role: 'jobseeker' },
          { id: 'user2', name: 'Jane Smith', role: 'employer' },
          { id: 'user3', name: 'Mike Johnson', role: 'jobseeker' },
          { id: 'user4', name: 'Sarah Wilson', role: 'employer' }
        ]
        
        searchResults.value = mockUsers.filter(user => 
          user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) &&
          user.id !== currentUser.value.uid
        )
      }
    }
    
    const startChatWithUser = async (user) => {
      try {
        const participants = [currentUser.value.uid, user.id]
        // Get current user's name from profile, fall back to auth displayName or email
        const currentUserName = userProfile.value?.name || currentUser.value?.displayName || currentUser.value?.email || 'You'
        const otherUserName = user.name || user.displayName || 'Unknown User'
        const participantNames = [currentUserName, otherUserName]
        // Get current user's role from profile
        const currentUserRole = userProfile.value?.role || 'user'
        const participantRoles = [currentUserRole, user.role]
        
        const roomId = await store.dispatch('chatAbly/createRoom', { 
          participants,
          participantNames,
          participantRoles
        })
        
        // Close modal
        closeNewChatModal()
        
        // Select the new room
        const newRoom = store.getters['chatAbly/getRoomById'](roomId)
        if (newRoom) {
          await selectRoom(newRoom)
          showToast(`Started chat with ${user.name}`, 'success')
        }
      } catch (error) {
        console.error('Error starting chat:', error)
        showToast('Error starting chat: ' + error.message, 'error')
      }
    }
    
    const closeNewChatModal = () => {
      showNewChatModal.value = false
      searchQuery.value = ''
      searchResults.value = []
    }
    
    const openNewChatModal = () => {
      showNewChatModal.value = true
      // Focus search input after modal opens
      nextTick(() => {
        const searchInput = document.querySelector('.search-input')
        if (searchInput) {
          searchInput.focus()
        }
      })
    }
    
    // Close context menu when clicking anywhere
    const handleClickOutside = (event) => {
      if (contextMenu.value.show || messageContextMenu.value.show) {
        // Don't close if clicking inside the context menu
        const contextMenuElements = document.querySelectorAll('.context-menu')
        for (const element of contextMenuElements) {
          if (element && element.contains(event.target)) {
            return
          }
        }
        closeContextMenu()
        closeMessageContextMenu()
      }
    }
    
    // Lifecycle
    onMounted(async () => {
      // Add global click listener for context menu with slight delay
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside)
      }, 100)
      if (currentUser.value) {
        try {
          await store.dispatch('chatAbly/initializeConnection', {
            clientId: currentUser.value.uid
          })
          
          // Load existing chat rooms from Firebase
          await store.dispatch('chatAbly/loadChatRooms', {
            userId: currentUser.value.uid
          })
          
          // Set up real-time listener for chat room updates
          chatRoomUnsubscribe.value = await store.dispatch('chatAbly/listenToChatRoomUpdates', {
            userId: currentUser.value.uid
          })
        } catch (error) {
          console.error('Error initializing Ably:', error)
        }
      } else {
        // Try to get user from auth store
        const authUser = store.getters['auth/currentUser']
        if (authUser) {
          try {
            await store.dispatch('chatAbly/initializeConnection', {
              clientId: authUser.uid
            })
          } catch (error) {
            console.error('Error initializing Ably with auth user:', error)
          }
        }
      }
    })
    
    onUnmounted(() => {
      // Cleanup
      if (typingTimeout.value) {
        clearTimeout(typingTimeout.value)
      }
      
      // Cleanup chat room listener
      if (chatRoomUnsubscribe.value) {
        chatRoomUnsubscribe.value()
      }
      
      if (activeRoom.value) {
        store.dispatch('chatAbly/leaveRoom', {
          roomName: activeRoom.value
        })
      }
      
      // Remove global listeners
      document.removeEventListener('click', handleClickOutside)
    })
    
    // Watch for new messages to scroll to bottom
    watch(() => store.getters['chatAbly/getMessages'](activeRoom.value), () => {
      nextTick(() => {
        scrollToBottom()
      })
    }, { deep: true }) // 深度监听消息数组变化
    
    // Watch connection status changes
    watch(() => store.getters['chatAbly/isConnected'], () => {
      // Connection status changed - UI will update automatically
    })
    
    // Watch for active room changes to scroll to bottom
    watch(() => activeRoom.value, (newRoom, oldRoom) => {
      if (newRoom && newRoom !== oldRoom) {
        // Force scroll to bottom when switching rooms
        nextTick(() => {
          setTimeout(() => {
            forceScrollToBottom()
          }, 300)
        })
      }
    })
    
    // Computed property to filter out empty messages with memoization
    const filteredMessages = computed(() => {
      const roomName = activeRoom.value
      
      if (!roomName) {
        return []
      }
      
      const messages = getMessages(roomName)
      
      if (!messages || messages.length === 0) {
        return []
      }
      
      // Use a more efficient filter
      return messages.filter(msg => {
        return msg && msg.text && typeof msg.text === 'string' && msg.text.trim().length > 0
      })
    })
    
    return {
      newMessage,
      messagesContainer,
      messageInput,
      showNewChatModal,
      searchQuery,
      searchResults,
      editMessageText,
      currentUser,
      userProfile,
      isConnected,
      clientId,
      activeRoom,
      chatRooms,
      getInitials,
      getRoomInitials,
      getRoomDisplayName,
      getUsernameFromId,
      getCachedUsername,
      getUserPicture,
      getRoomPicture,
      getRoomPictureSync,
      formatTime,
      formatMessageTime,
      scrollToBottom,
      forceScrollToBottom,
      getMessages,
      getTypingUsers,
      getUnreadCount,
      getCurrentRoom,
      filteredMessages,
      selectRoom,
      sendMessage,
      deleteMessage,
      deleteChatRoom,
      handleTyping,
      handleFocus,
      handleBlur,
      searchUsers,
      startChatWithUser,
      openNewChatModal,
      closeNewChatModal,
      showDeleteConfirm,
      showDeleteMessageConfirm,
      deleteConfirmMessage,
      confirmDeleteChatRoom,
      cancelDeleteChatRoom,
      confirmDeleteMessage,
      showToast,
      contextMenu,
      openContextMenu,
      closeContextMenu,
      deleteContextRoom,
      messageContextMenu,
      openMessageContextMenu,
      closeMessageContextMenu,
      editContextMessage,
      deleteContextMessage,
      editingMessageSerial,
      editTextarea,
      startInlineEdit,
      cancelInlineEdit,
      saveInlineEdit
    }
  },
  components: {
    GradientText,
    Toast,
    ConfirmationDialog
  }
}
</script>

<style scoped>
/* Chat page specific styles */
.chat-page {
  height: calc(100vh - 70px);
  max-height: calc(100vh - 70px);
  background: var(--bg-dark);
  overflow: hidden;
}

.chat-container {
  height: 100%;
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  box-shadow: var(--shadow-lg);
  border-radius: 0;
}

/* Sidebar */
.chat-sidebar {
  width: 380px;
  background: linear-gradient(180deg, var(--bg) 0%, var(--bg-light) 100%);
  border-right: 2px solid var(--border);
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(10px);
  position: relative;
}

.chat-sidebar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%);
  pointer-events: none;
}

.sidebar-header {
  padding: 24px;
  border-bottom: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: var(--bg);
  position: relative;
  z-index: 1;
}

.dark-mode .sidebar-header {
  background: var(--bg-dark);
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.messages-header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.messages-icon {
  width: 28px;
  height: 28px;
  color: var(--primary);
  stroke-width: 2;
}

.dark-mode .messages-icon {
  color: var(--primary);
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.02em;
}

.connection-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #ef4444;
  transition: all 0.3s ease;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.connection-badge.connected {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.2);
}

.dark-mode .connection-badge {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.25);
}

.dark-mode .connection-badge.connected {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.25);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
  animation: pulse-red 2s infinite;
}

.connection-badge.connected .status-dot {
  background: #10b981;
  animation: pulse-green 2s infinite;
}

.btn-new-chat {
  width: 100%;
  padding: 12px 16px;
  background: transparent;
  color: #6b7280;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 0.95rem;
  font-weight: 500;
}

.btn-new-chat:hover {
  background: rgba(79, 70, 229, 0.05);
  color: var(--primary);
  border-color: var(--primary);
}

.btn-new-chat:active {
  transform: scale(0.98);
}

.plus-icon {
  width: 18px;
  height: 18px;
  stroke-width: 2.5;
}

.dark-mode .btn-new-chat {
  color: #9ca3af;
  border-color: #374151;
}

.dark-mode .btn-new-chat:hover {
  background: rgba(79, 70, 229, 0.1);
  color: var(--primary);
  border-color: var(--primary);
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
  background: rgba(255, 255, 255, 0.15);
  padding: 8px 12px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--danger);
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
}


@keyframes pulse-green {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.chat-rooms-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
  position: relative;
  z-index: 1;
}

.chat-room-item {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 18px 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid var(--border-muted);
  position: relative;
  margin: 0 15px;
  border-radius: 15px;
  margin-bottom: 8px;
  overflow: hidden;
}

.chat-room-item:hover {
  background: linear-gradient(135deg, var(--bg-light) 0%, rgba(79, 70, 229, 0.05) 100%);
  transform: translateX(5px);
  box-shadow: var(--shadow-sm);
}

.chat-room-item.active {
  background: #f0f0ff;
  border-left: 3px solid var(--primary);
  transform: translateX(0);
  box-shadow: none;
}

.dark-mode .chat-room-item.active {
  background: #2a2a3e;
  border-left-color: var(--primary);
}

.chat-room-item.active .room-info h3 {
  color: var(--text);
  font-weight: 700;
}

.chat-room-item.active .last-message,
.chat-room-item.active .room-time {
  color: var(--text-muted);
}

.room-avatar {
  position: relative;
  width: 55px;
  height: 55px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bg-light);
  font-weight: bold;
  flex-shrink: 0;
  font-size: 1.1rem;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  overflow: hidden;
}

.room-avatar .avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.room-avatar > span {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.chat-room-item:hover .room-avatar {
  transform: scale(1.05);
  box-shadow: var(--shadow-md);
}

.chat-room-item.active .room-avatar {
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  border: none;
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
}

/* Context Menu */
.context-menu {
  position: fixed;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25), 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 10001;
  min-width: 220px;
  padding: 8px;
  animation: contextMenuSlideIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid rgba(79, 70, 229, 0.2);
  backdrop-filter: blur(20px);
}

.dark-mode .context-menu {
  background: #2a2a2a;
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3);
}

@keyframes contextMenuSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.context-menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  font-weight: 500;
  text-align: left;
  color: var(--text);
}

.context-menu-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.dark-mode .context-menu-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.context-menu-item.delete-item {
  color: #ef4444;
}

.context-menu-item.delete-item:hover {
  background: rgba(239, 68, 68, 0.1);
}

.dark-mode .context-menu-item.delete-item:hover {
  background: rgba(239, 68, 68, 0.15);
}

.context-menu-item.edit-item {
  color: #3b82f6;
}

.context-menu-item.edit-item:hover {
  background: rgba(59, 130, 246, 0.1);
}

.dark-mode .context-menu-item.edit-item:hover {
  background: rgba(59, 130, 246, 0.15);
}

.context-icon {
  width: 18px;
  height: 18px;
  stroke-width: 2;
  flex-shrink: 0;
}

.room-info {
  flex: 1;
  min-width: 0;
}

.room-info h3 {
  font-size: 1.05rem;
  color: var(--text);
  margin-bottom: 6px;
  font-weight: 600;
  transition: color 0.3s ease;
}

.last-message {
  font-size: 0.9rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  transition: color 0.3s ease;
}

.typing-indicator {
  font-size: 0.85rem;
  color: var(--primary);
  font-style: italic;
  font-weight: 500;
}

.chat-room-item.active .typing-indicator {
  color: var(--primary);
  font-weight: 600;
}

.room-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.room-time {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: 500;
  transition: color 0.3s ease;
}

.unread-badge {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border-radius: 50%;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
  animation: pulse-badge 2s infinite;
  border: 2px solid var(--bg-light);
}

@keyframes pulse-badge {
  0%, 100% { 
    transform: scale(1);
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
  }
  50% { 
    transform: scale(1.15);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.6);
  }
}

.empty-rooms {
  padding: 60px 25px;
  text-align: center;
  color: var(--text-muted);
  position: relative;
  z-index: 1;
}

.empty-icon {
  font-size: 3.5rem;
  margin-bottom: 25px;
  opacity: 0.7;
}

.empty-rooms p {
  font-size: 1.1rem;
  margin-bottom: 25px;
  color: var(--text-muted);
}

.empty-rooms .btn {
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-weight: 600;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.empty-rooms .btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* Chat Window */
.chat-window {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, var(--bg-light) 0%, var(--bg) 100%);
  height: 100%;
  overflow: hidden;
  position: relative;
}

.chat-window::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.02) 0%, rgba(124, 58, 237, 0.02) 100%);
  pointer-events: none;
}

.no-room-selected {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  text-align: center;
  position: relative;
  z-index: 1;
}

.welcome-icon {
  font-size: 4.5rem;
  margin-bottom: 25px;
  opacity: 0.8;
}

.no-room-selected :deep(.animated-gradient-text) {
  margin-bottom: 15px;
}

.no-room-selected h3 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
}

.no-room-selected p {
  font-size: 1.1rem;
  color: var(--text-muted);
  max-width: 400px;
  line-height: 1.6;
}

.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 140px);
  max-height: calc(100vh - 140px);
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.chat-header {
  padding: 25px;
  border-bottom: 2px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, var(--bg-light) 0%, var(--bg) 100%);
  backdrop-filter: blur(10px);
  position: relative;
}

.chat-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%);
  pointer-events: none;
}

.chat-header-info {
  display: flex;
  align-items: center;
  gap: 18px;
  position: relative;
  z-index: 1;
}

.chat-avatar {
  position: relative;
  width: 55px;
  height: 55px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bg-light);
  font-weight: bold;
  font-size: 1.2rem;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  overflow: hidden;
}

.chat-avatar .avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.chat-avatar > span {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.chat-avatar:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-md);
}

.chat-details h3 {
  margin: 0;
  color: var(--text);
  font-size: 1.3rem;
  font-weight: 600;
}

/* Messages */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 25px;
  max-height: calc(100vh - 350px);
  min-height: 200px;
  scroll-behavior: smooth;
  position: relative;
  z-index: 1;
  
  /* Custom scrollbar styling */
  scrollbar-width: thin;
  scrollbar-color: var(--primary) var(--bg-light);
}

.messages-container::-webkit-scrollbar {
  width: 8px;
}

.messages-container::-webkit-scrollbar-track {
  background: var(--bg-light);
  border-radius: 4px;
}

.messages-container::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  border-radius: 4px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, var(--primary-dark) 0%, var(--secondary-dark) 100%);
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.message {
  display: flex;
  animation: messageSlideIn 0.3s ease-out;
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-sent {
  justify-content: flex-end;
}

.message-content {
  max-width: 45%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sender-name {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 6px;
  font-weight: 500;
}

.message-bubble {
  background: white;
  padding: 14px 18px;
  border-radius: 20px;
  word-wrap: break-word;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-block;
  max-width: 100%;
  border: 1px solid rgba(0, 0, 0, 0.05);
  color: #000000;
}

.message-bubble:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08);
  border-color: rgba(0, 0, 0, 0.08);
}

.message-sent .message-bubble {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25), 0 2px 4px rgba(59, 130, 246, 0.15);
}

.message-sent .message-bubble:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.35), 0 4px 8px rgba(59, 130, 246, 0.2);
}

.message-bubble p {
  margin: 0 0 8px 0;
  line-height: 1.5;
  color: inherit;
}

.message-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.8;
  font-weight: 500;
}

.message-sent .message-bubble {
  cursor: context-menu;
}

/* Inline Edit Mode */
.edit-mode {
  width: 100%;
}

.edit-textarea {
  width: 100%;
  min-height: 80px;
  padding: 10px;
  border: 2px solid var(--primary);
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  color: var(--text);
  background: white;
  resize: vertical;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.dark-mode .edit-textarea {
  background: #1a1a1a;
  border-color: var(--primary);
  color: white;
}

.edit-textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.edit-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-bottom: 6px;
}

.edit-btn {
  background: transparent;
  border: none;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-icon {
  width: 18px;
  height: 18px;
  stroke-width: 2.5;
}

.cancel-btn {
  color: #6b7280;
}

.cancel-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.save-btn {
  color: #10b981;
}

.save-btn:hover {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.edit-hint {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-style: italic;
  display: block;
  text-align: right;
}

.message-sent .edit-textarea {
  background: rgba(255, 255, 255, 0.95);
  color: var(--text);
}

.dark-mode .message-sent .edit-textarea {
  background: rgba(0, 0, 0, 0.3);
  color: white;
}

/* Typing Indicator */
.typing-indicator-message {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 25px;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  margin: 0 25px;
  backdrop-filter: blur(10px);
  animation: typingPulse 2s infinite;
}

@keyframes typingPulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

.typing-dots {
  display: flex;
  gap: 6px;
}

.typing-dots span {
  width: 10px;
  height: 10px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
  box-shadow: 0 2px 4px rgba(79, 70, 229, 0.3);
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  30% {
    transform: translateY(-12px);
    opacity: 1;
  }
}

.typing-text {
  font-size: 0.9rem;
  font-style: italic;
  font-weight: 500;
}

/* Message Input */
.message-input-container {
  padding: 20px 30px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  background: white;
  position: relative;
}

.dark-mode .message-input-container {
  background: #1a1a1a;
  border-top-color: rgba(255, 255, 255, 0.08);
}

.input-wrapper {
  display: flex;
  gap: 12px;
  align-items: center;
  background: #f5f5f5;
  border-radius: 24px;
  padding: 6px 8px 6px 20px;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.dark-mode .input-wrapper {
  background: #2a2a2a;
}

.input-wrapper:focus-within {
  background: white;
  border-color: #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.dark-mode .input-wrapper:focus-within {
  background: #333;
  border-color: #404040;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.message-input {
  flex: 1;
  padding: 10px 0;
  border: none;
  background: transparent;
  font-size: 0.95rem;
  color: var(--text);
  font-weight: 400;
  outline: none;
}

.message-input::placeholder {
  color: #9ca3af;
  font-weight: 400;
}

.dark-mode .message-input::placeholder {
  color: #6b7280;
}

.message-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  background: #4338ca;
  transform: scale(1.05);
}

.send-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: #d1d5db;
}

.dark-mode .send-btn:disabled {
  background: #4b5563;
}

.send-icon {
  width: 18px;
  height: 18px;
  color: white;
  fill: white;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  font-size: 0.85rem;
  color: var(--text-muted);
  padding-left: 4px;
}

.connection-status .status-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--danger);
}

.connection-status .status-indicator.offline {
  background: var(--danger);
  animation: pulse-red 2s infinite;
}

@keyframes pulse-red {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(12px);
  animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  border-radius: 25px;
  width: 90%;
  max-width: 600px;
  max-height: 85vh;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  border: 2px solid var(--primary);
  backdrop-filter: blur(20px);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.new-chat-modal {
  max-width: 700px;
  background: white;
  border: 3px solid var(--primary);
  box-shadow: 0 25px 80px rgba(79, 70, 229, 0.2);
}

.modal-header {
  padding: 30px 30px 25px 30px;
  border-bottom: 2px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  position: relative;
}

.modal-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  pointer-events: none;
}

.header-content h3 {
  margin: 0 0 10px 0;
  color: white;
  font-size: 1.8rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
}

.header-subtitle {
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.05rem;
  font-weight: 400;
  position: relative;
  z-index: 1;
}

.btn-close {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  font-size: 1.8rem;
  color: white;
  cursor: pointer;
  padding: 10px;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.btn-close:hover {
  color: white;
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.1) rotate(90deg);
}

.modal-body {
  padding: 30px;
  max-height: 60vh;
  overflow-y: auto;
  position: relative;
}

.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: var(--bg-light);
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  border-radius: 4px;
}

/* Search Section */
.search-section {
  margin-bottom: 30px;
}

.search-label {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  color: var(--text);
  font-weight: 600;
  font-size: 1.1rem;
}

.search-icon {
  font-size: 1.2rem;
}

.search-input {
  width: 100%;
  padding: 18px 25px;
  border: 3px solid var(--border);
  border-radius: 20px;
  font-size: 1.1rem;
  background: rgba(255, 255, 255, 0.1);
  color: var(--text);
  transition: all 0.3s ease;
  font-weight: 500;
  backdrop-filter: blur(10px);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.15);
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.search-input::placeholder {
  color: var(--text-muted);
  font-weight: 400;
}

/* Results Section */
.results-section {
  min-height: 200px;
}

.results-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid var(--border);
}

.results-header h4 {
  margin: 0;
  color: var(--text);
  font-size: 1.2rem;
  font-weight: 600;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.user-result {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 20px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 3px solid var(--border);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(10px);
}

.user-result:hover {
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  border-color: var(--primary);
  transform: translateY(-4px) scale(1.02);
  box-shadow: var(--shadow-lg);
  color: white;
}

.user-avatar {
  position: relative;
  width: 55px;
  height: 55px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bg-light);
  font-weight: bold;
  flex-shrink: 0;
  font-size: 1.2rem;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.user-result:hover .user-avatar {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-info h4 {
  margin: 0 0 8px 0;
  color: var(--text);
  font-size: 1.3rem;
  font-weight: 700;
  transition: color 0.3s ease;
}

.user-result:hover .user-info h4 {
  color: white;
}

.user-role {
  margin: 0 0 6px 0;
  color: var(--text-muted);
  font-size: 0.95rem;
  text-transform: capitalize;
  font-weight: 500;
  transition: color 0.3s ease;
}

.user-result:hover .user-role {
  color: rgba(255, 255, 255, 0.9);
}

.user-email {
  margin: 0 0 10px 0;
  color: var(--text-muted);
  font-size: 0.85rem;
  transition: color 0.3s ease;
}

.user-result:hover .user-email {
  color: rgba(255, 255, 255, 0.7);
}

.user-status {
  display: flex;
  align-items: center;
  gap: 8px;
}


.user-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  opacity: 0.8;
  transition: all 0.3s ease;
}

.user-result:hover .user-action {
  opacity: 1;
  transform: scale(1.1);
}

.action-text {
  font-size: 0.9rem;
  color: var(--text-muted);
  font-weight: 600;
  transition: color 0.3s ease;
}

.user-result:hover .action-text {
  color: white;
}

.action-icon {
  font-size: 1.5rem;
  transition: transform 0.3s ease;
}

.user-result:hover .action-icon {
  transform: scale(1.2);
}

/* No Results */
.no-results {
  padding: 50px 25px;
  text-align: center;
  color: var(--text-muted);
}

.no-results-icon {
  font-size: 3.5rem;
  margin-bottom: 20px;
  opacity: 0.7;
}

.no-results h4 {
  margin: 0 0 15px 0;
  color: var(--text);
  font-size: 1.3rem;
  font-weight: 600;
}

.no-results p {
  margin: 0 0 10px 0;
  font-size: 1rem;
  line-height: 1.6;
}

.suggestion {
  font-size: 0.95rem;
  color: var(--text-muted);
  font-style: italic;
}

/* Search Prompt */
.search-prompt {
  padding: 50px 25px;
  text-align: center;
  color: var(--text-muted);
}

.prompt-icon {
  font-size: 3.5rem;
  margin-bottom: 20px;
  opacity: 0.7;
}

.search-prompt h4 {
  margin: 0 0 15px 0;
  color: var(--text);
  font-size: 1.3rem;
  font-weight: 600;
}

.search-prompt p {
  margin: 0 0 30px 0;
  font-size: 1rem;
  line-height: 1.6;
}

.quick-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.quick-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid var(--border);
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 0.95rem;
  color: var(--text);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  font-weight: 500;
}

.quick-btn:hover {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

/* Form Styles */
.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  margin-bottom: 10px;
  color: var(--text);
  font-weight: 600;
  font-size: 1rem;
}

.form-input {
  width: 100%;
  padding: 15px 20px;
  border: 2px solid var(--border);
  border-radius: 12px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.1);
  color: var(--text);
  resize: vertical;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  font-weight: 500;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
}

.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 25px;
}

.modal-actions .btn {
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.modal-actions .btn-primary {
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  border: none;
  box-shadow: var(--shadow-sm);
}

.modal-actions .btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.modal-actions .btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text);
  border: 2px solid var(--border);
  backdrop-filter: blur(10px);
}

.modal-actions .btn-secondary:hover {
  background: var(--text-muted);
  color: white;
  border-color: var(--text-muted);
}

/* Responsive Design */

/* Tablet (768px - 1024px) */
@media (min-width: 769px) and (max-width: 1024px) {
  .chat-sidebar {
    width: 320px;
  }
  
  .sidebar-header {
    padding: 20px;
  }
  
  .chat-room-item {
    padding: 14px 18px;
    margin: 0 12px;
  }
  
  .room-avatar,
  .chat-avatar {
    width: 48px;
    height: 48px;
    font-size: 1.05rem;
  }
  
  .message-content {
    max-width: 55%;
  }
  
  .messages-container {
    padding: 20px;
  }
  
  .modal-content {
    max-width: 85%;
  }
}

/* Mobile & Small Tablet (max-width: 768px) */
@media (max-width: 768px) {
  .chat-page {
    height: 100vh;
    max-height: 100vh;
  }
  
  .chat-container {
    flex-direction: row;
    max-width: 100%;
  }
  
  .chat-sidebar {
    width: 100%;
    max-width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--border);
    position: fixed;
    top: 70px;
    left: 0;
    right: 0;
    height: auto;
    max-height: 50vh;
    z-index: 10;
    overflow-y: auto;
  }
  
  .chat-window {
    width: 100%;
    height: calc(100vh - 70px);
    margin-top: 0;
  }
  
  .sidebar-header {
    padding: 16px 20px;
    flex-direction: row;
    gap: 12px;
  }
  
  .header-top {
    flex-wrap: wrap;
  }
  
  .sidebar-header h2 {
    font-size: 1.3rem;
  }
  
  .connection-badge {
    font-size: 0.75rem;
    padding: 4px 10px;
  }
  
  .btn-new-chat {
    padding: 10px 14px;
    font-size: 0.9rem;
  }
  
  .plus-icon {
    width: 16px;
    height: 16px;
  }
  
  .chat-rooms-list {
    max-height: calc(50vh - 120px);
  }
  
  .chat-room-item {
    padding: 12px 16px;
    margin: 0 8px;
    border-radius: 12px;
  }
  
  .chat-room-item:hover {
    transform: translateX(3px);
  }
  
  .room-avatar {
    width: 48px;
    height: 48px;
    font-size: 1rem;
  }
  
  .room-info h3 {
    font-size: 0.95rem;
  }
  
  .last-message {
    font-size: 0.85rem;
  }
  
  .room-time {
    font-size: 0.75rem;
  }
  
  .unread-badge {
    min-width: 20px;
    height: 20px;
    font-size: 0.65rem;
  }
  
  .chat-header {
    padding: 16px 20px;
  }
  
  .chat-avatar {
    width: 48px;
    height: 48px;
    font-size: 1rem;
  }
  
  .chat-details h3 {
    font-size: 1.05rem;
  }
  
  .messages-container {
    padding: 16px;
    max-height: calc(100vh - 280px);
  }
  
  .message-content {
    max-width: 75%;
  }
  
  .message-bubble {
    padding: 12px 16px;
    border-radius: 16px;
  }
  
  .sender-name {
    font-size: 0.8rem;
    margin-bottom: 4px;
  }
  
  .message-time {
    font-size: 0.7rem;
  }
  
  .message-input-container {
    padding: 14px 16px;
  }
  
  .input-wrapper {
    padding: 5px 8px 5px 16px;
  }
  
  .message-input {
    font-size: 0.95rem;
  }
  
  .send-btn {
    width: 38px;
    height: 38px;
  }
  
  .send-icon {
    width: 16px;
    height: 16px;
  }
  
  .connection-status {
    font-size: 0.8rem;
    margin-top: 10px;
  }
  
  /* Modal adjustments */
  .modal-content {
    width: 95%;
    max-width: 95%;
    margin: 10px;
    max-height: 90vh;
  }
  
  .modal-header {
    padding: 20px;
  }
  
  .header-content h3 {
    font-size: 1.4rem;
  }
  
  .header-subtitle {
    font-size: 0.95rem;
  }
  
  .btn-close {
    width: 40px;
    height: 40px;
    font-size: 1.5rem;
  }
  
  .modal-body {
    padding: 20px;
    max-height: calc(90vh - 150px);
  }
  
  .search-input {
    padding: 14px 20px;
    font-size: 1rem;
  }
  
  .user-result {
    padding: 14px;
    gap: 12px;
    border-radius: 16px;
  }
  
  .user-avatar {
    width: 48px;
    height: 48px;
    font-size: 1rem;
  }
  
  .user-info h4 {
    font-size: 1.05rem;
  }
  
  .user-role,
  .user-email {
    font-size: 0.85rem;
  }
  
  .action-text {
    font-size: 0.85rem;
  }
  
  .quick-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .quick-btn {
    width: 100%;
    max-width: 250px;
  }
  
  /* Context menu adjustments */
  .context-menu {
    min-width: 200px;
    max-width: 90vw;
  }
  
  .context-menu-item {
    padding: 12px 14px;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .chat-sidebar {
    height: 200px;
  }
  
  .chat-window {
    height: calc(100vh - 270px);
  }
  
  .sidebar-header h2 {
    font-size: 1.3rem;
  }
  
  .chat-room-item {
    padding: 12px 15px;
    margin: 0 8px;
  }
  
  .room-avatar {
    width: 40px;
    height: 40px;
    font-size: 0.9rem;
  }
  
  .chat-header {
    padding: 15px;
  }
  
  .chat-avatar {
    width: 40px;
    height: 40px;
    font-size: 0.9rem;
  }
  
  .chat-details h3 {
    font-size: 1rem;
  }
  
  .messages-container {
    padding: 15px;
  }
  
  .message-content {
    max-width: 75%;
  }
  
  .message-input-container {
    padding: 15px 20px;
  }
  
  .input-wrapper {
    padding: 4px 6px 4px 14px;
  }
  
  .message-input {
    font-size: 0.9rem;
  }
  
  .send-btn {
    width: 36px;
    height: 36px;
  }
  
  .send-icon {
    width: 15px;
    height: 15px;
  }
  
  .modal-header {
    padding: 20px 20px 15px 20px;
  }
  
  .header-content h3 {
    font-size: 1.3rem;
  }
  
  .modal-body {
    padding: 20px;
  }
  
  .user-result {
    padding: 12px;
    gap: 12px;
  }
  
  .user-avatar {
    width: 40px;
    height: 40px;
    font-size: 0.9rem;
  }
  
  .user-info h4 {
    font-size: 1rem;
  }
}
</style>

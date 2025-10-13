<template>
  <div class="chat-page">
    <div class="chat-container">
      <!-- Chat List -->
      <div class="chat-list">
        <div class="chat-list-header">
          <h2>Messages</h2>
        </div>
        <div class="chat-list-items">
          <div
            v-for="chat in chats"
            :key="chat.id"
            :class="['chat-item', { active: activeChat?.id === chat.id }]"
            @click="selectChat(chat)"
          >
            <div class="chat-avatar">{{ getInitials(chat.name) }}</div>
            <div class="chat-info">
              <h3>{{ chat.name }}</h3>
              <p>{{ chat.lastMessage }}</p>
            </div>
            <div class="chat-time">{{ formatTime(chat.lastMessageAt) }}</div>
          </div>
          
          <div v-if="chats.length === 0" class="empty-chats">
            <p>No conversations yet</p>
          </div>
        </div>
      </div>

      <!-- Chat Window -->
      <div class="chat-window">
        <div v-if="!activeChat" class="no-chat-selected">
          <p>Select a conversation to start messaging</p>
        </div>

        <div v-else class="chat-content">
          <!-- Chat Header -->
          <div class="chat-header">
            <div class="chat-avatar">{{ getInitials(activeChat.name) }}</div>
            <div class="chat-header-info">
              <h3>{{ activeChat.name }}</h3>
              <p>{{ activeChat.role }}</p>
            </div>
          </div>

          <!-- Messages -->
          <div class="messages-container" ref="messagesContainer">
            <div
              v-for="message in messages"
              :key="message.id"
              :class="['message', { 'message-sent': message.senderId === currentUser.uid }]"
            >
              <div class="message-content">
                <p>{{ message.text }}</p>
                <span class="message-time">{{ formatTime(message.timestamp) }}</span>
              </div>
            </div>
          </div>

          <!-- Message Input -->
          <div class="message-input-container">
            <input
              type="text"
              v-model="newMessage"
              @keyup.enter="sendMessage"
              placeholder="Type a message..."
              class="message-input"
            />
            <button @click="sendMessage" class="btn btn-primary send-btn">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'Chat',
  setup() {
    const store = useStore()
    
    const chats = ref([])
    const activeChat = ref(null)
    const messages = ref([])
    const newMessage = ref('')
    const messagesContainer = ref(null)
    const unsubscribe = ref(null)

    const currentUser = computed(() => store.getters['auth/currentUser'])

    const selectChat = async (chat) => {
      activeChat.value = chat
      
      // Unsubscribe from previous chat
      if (unsubscribe.value) {
        unsubscribe.value()
      }
      
      // Subscribe to messages
      unsubscribe.value = store.dispatch('chat/subscribeToMessages', chat.id)
    }

    const sendMessage = async () => {
      if (!newMessage.value.trim() || !activeChat.value) return

      try {
        await store.dispatch('chat/sendMessage', {
          chatId: activeChat.value.id,
          senderId: currentUser.value.uid,
          text: newMessage.value
        })
        
        newMessage.value = ''
      } catch (error) {
        console.error('Error sending message:', error)
      }
    }

    const getInitials = (name) => {
      if (!name) return '?'
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }

    const formatTime = (timestamp) => {
      if (!timestamp) return ''
      const date = new Date(timestamp.seconds * 1000)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    watch(() => store.getters['chat/messages'], (newMessages) => {
      messages.value = newMessages
      // Scroll to bottom
      setTimeout(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
      }, 100)
    })

    onMounted(async () => {
      if (currentUser.value) {
        chats.value = await store.dispatch('chat/fetchChats', currentUser.value.uid)
      }
    })

    return {
      chats,
      activeChat,
      messages,
      newMessage,
      currentUser,
      messagesContainer,
      selectChat,
      sendMessage,
      getInitials,
      formatTime
    }
  }
}
</script>

<style scoped>
.chat-page {
  height: calc(100vh - 70px);
  background: #f8f9fa;
}

.chat-container {
  height: 100%;
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
}

.chat-list {
  width: 350px;
  background: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
}

.chat-list-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.chat-list-header h2 {
  font-size: 1.5rem;
  color: #2c3e50;
}

.chat-list-items {
  flex: 1;
  overflow-y: auto;
}

.chat-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 20px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #f0f0f0;
}

.chat-item:hover {
  background: #f8f9fa;
}

.chat-item.active {
  background: #e8f4f8;
}

.chat-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  flex-shrink: 0;
}

.chat-info {
  flex: 1;
  min-width: 0;
}

.chat-info h3 {
  font-size: 1rem;
  color: #2c3e50;
  margin-bottom: 5px;
}

.chat-info p {
  font-size: 0.9rem;
  color: #7f8c8d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-time {
  font-size: 0.8rem;
  color: #95a5a6;
}

.empty-chats {
  padding: 60px 20px;
  text-align: center;
  color: #7f8c8d;
}

.chat-window {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
}

.no-chat-selected {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7f8c8d;
  font-size: 1.1rem;
}

.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 15px;
}

.chat-header-info h3 {
  font-size: 1.2rem;
  color: #2c3e50;
  margin-bottom: 3px;
}

.chat-header-info p {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.message {
  display: flex;
}

.message-sent {
  justify-content: flex-end;
}

.message-content {
  max-width: 60%;
  padding: 12px 16px;
  border-radius: 12px;
  background: #e8f4f8;
}

.message-sent .message-content {
  background: #3498db;
  color: white;
}

.message-content p {
  margin-bottom: 5px;
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.7;
}

.message-input-container {
  padding: 20px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 15px;
}

.message-input {
  flex: 1;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 25px;
  font-size: 1rem;
}

.message-input:focus {
  outline: none;
  border-color: #3498db;
}

.send-btn {
  border-radius: 25px;
  padding: 12px 30px;
}

@media (max-width: 768px) {
  .chat-list {
    width: 100%;
    display: none;
  }

  .chat-list.active {
    display: flex;
  }

  .chat-window {
    width: 100%;
  }
}
</style>


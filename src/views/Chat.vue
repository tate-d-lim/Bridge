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
/* Chat page specific styles - most styles are now in external stylesheet */
</style>


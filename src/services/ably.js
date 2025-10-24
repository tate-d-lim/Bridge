import * as Ably from 'ably'
import { ChatClient, LogLevel } from '@ably/chat'

// Ably configuration
let realtimeClient = null
let chatClient = null

// Initialize Ably clients
export const initializeAbly = (clientId) => {
  console.log('Initializing Ably with clientId:', clientId)
  
  if (realtimeClient && chatClient) {
    console.log('Ably clients already exist, returning existing clients')
    return { realtimeClient, chatClient }
  }

  const apiKey = import.meta.env.VITE_ABLY_API_KEY
  console.log('Ably API Key loaded:', apiKey ? 'Yes' : 'No')
  
  if (!apiKey) {
    console.error('VITE_ABLY_API_KEY environment variable is required')
    throw new Error('VITE_ABLY_API_KEY environment variable is required')
  }

  console.log('Creating Ably Realtime client...')
  // Create Ably Realtime client
  realtimeClient = new Ably.Realtime({
    key: apiKey,
    clientId: clientId,
    recover: true, // Enable connection recovery
    echoMessages: false // Don't echo our own messages
  })

  // Add connection event listeners for debugging
  realtimeClient.connection.on('connecting', () => {
    console.log('Ably: Connecting...')
  })
  
  realtimeClient.connection.on('connected', () => {
    console.log('Ably: Connected successfully!')
    // Force a state change event to ensure UI updates
    setTimeout(() => {
      console.log('Ably: Triggering state change event for UI update')
      realtimeClient.connection.emit('statechange', {
        current: 'connected',
        previous: 'connecting'
      })
    }, 100)
  })
  
  realtimeClient.connection.on('disconnected', () => {
    console.log('Ably: Disconnected')
  })
  
  realtimeClient.connection.on('failed', (error) => {
    console.error('Ably: Connection failed:', error)
  })

  console.log('Creating Ably Chat client...')
  // Create Chat client
  chatClient = new ChatClient(realtimeClient, {
    logLevel: LogLevel.Error
  })

  console.log('Ably clients created successfully')
  return { realtimeClient, chatClient }
}

// Get existing clients
export const getAblyClients = () => {
  if (!realtimeClient || !chatClient) {
    throw new Error('Ably clients not initialized. Call initializeAbly first.')
  }
  return { realtimeClient, chatClient }
}

// Close connection
export const closeAblyConnection = () => {
  if (realtimeClient) {
    realtimeClient.connection.close()
    realtimeClient = null
    chatClient = null
  }
}

// Connection status helper
export const getConnectionStatus = () => {
  if (!realtimeClient) return 'disconnected'
  return realtimeClient.connection.state
}

// Room helper functions
export const createRoomName = (participants) => {
  // Sort participants to ensure consistent room names
  const sortedParticipants = [...participants].sort()
  return `chat_${sortedParticipants.join('_')}`
}

export const parseRoomName = (roomName) => {
  if (roomName.startsWith('chat_')) {
    return roomName.replace('chat_', '').split('_')
  }
  return [roomName]
}

export default {
  initializeAbly,
  getAblyClients,
  closeAblyConnection,
  getConnectionStatus,
  createRoomName,
  parseRoomName
}

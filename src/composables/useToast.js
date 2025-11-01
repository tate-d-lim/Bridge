import { ref } from 'vue'

const toasts = ref([])
let toastIdCounter = 0

const removeToast = (id) => {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

export const useToast = () => {
  const showToast = (message, type = 'info', duration = 3000) => {
    const id = ++toastIdCounter
    const toast = {
      id,
      message,
      type, // 'success', 'error', 'warning', 'info'
      duration
    }
    
    toasts.value.push(toast)
    
    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
    
    return id
  }
  
  return {
    showToast,
    removeToast,
    toasts
  }
}

export { toasts }


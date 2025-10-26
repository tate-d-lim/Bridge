<template>
  <div 
    class="stat-card"
    :style="{ 
      opacity, 
      transform: `translateY(${opacity === 1 ? '0' : '20px'})` 
    }"
  >
    <div class="stat-icon">
      <img :src="icon" :alt="label" />
    </div>
    <div class="stat-content">
      <div class="stat-value">
        {{ count.toLocaleString() }}{{ suffix }}
      </div>
      <div class="stat-label">{{ label }}</div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'AnimatedStat',
  props: {
    icon: {
      type: String,
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    suffix: {
      type: String,
      default: ''
    },
    delay: {
      type: Number,
      default: 0
    }
  },
  setup(props) {
    const count = ref(0)
    const opacity = ref(0)

    const animateCount = () => {
      const duration = 2000
      const steps = 60
      const increment = props.value / steps
      let current = 0

      setTimeout(() => {
        const counter = setInterval(() => {
          current += increment
          if (current >= props.value) {
            count.value = props.value
            clearInterval(counter)
          } else {
            count.value = Math.floor(current)
          }
        }, duration / steps)

        return () => clearInterval(counter)
      }, props.delay)
    }

    const animateOpacity = () => {
      setTimeout(() => {
        opacity.value = 1
      }, props.delay)
    }

    onMounted(() => {
      animateCount()
      animateOpacity()
    })

    return { count, opacity }
  }
}
</script>

<style scoped>
.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  border-radius: 8px;
  background: var(--bg);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.dark-mode .stat-card {
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-card:hover {
  border-color: rgba(0, 0, 0, 0.1);
  box-shadow: var(--shadow-sm);
}

.dark-mode .stat-card:hover {
  border-color: rgba(255, 255, 255, 0.1);
}

.stat-icon {
  height: 48px;
  width: 48px;
  border-radius: 50%;
  background: var(--bg-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.dark-mode .stat-icon {
  background: rgba(255, 255, 255, 0.05);
}

.stat-icon img {
  width: 24px;
  height: 24px;
}

.stat-content {
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .stat-card {
    padding: 20px;
  }
  
  .stat-value {
    font-size: 1.75rem;
  }
}
</style>


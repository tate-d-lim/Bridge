<template>
  <div
    :class="['achievement-card', { unlocked, locked: !unlocked }]"
    :style="{ animationDelay: `${index * 0.05}s` }"
  >
    <div class="card-content">
      <div class="card-icon" :class="unlocked ? tierClass : 'locked-icon'">
        <img v-if="unlocked && iconType === 'svg'" :src="`/icons/${icon}.svg`" :alt="title" class="badge-svg-icon" />
        <span v-else-if="unlocked" class="badge-emoji">{{ icon }}</span>
        <img v-else src="/icons/lock.svg" alt="Locked" class="lock-icon" />
      </div>
      <div class="card-details">
        <div class="card-header">
          <div>
            <h3>{{ title }}</h3>
            <p class="description">{{ description }}</p>
          </div>
          <span v-if="unlocked" class="unlocked-badge">Unlocked</span>
        </div>
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${progressPercent}%` }"></div>
          </div>
          <p class="progress-text">{{ progress }} / {{ requirement }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AchievementCard',
  props: {
    icon: {
      type: String,
      required: true
    },
    iconType: {
      type: String,
      default: 'emoji'
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    progress: {
      type: Number,
      default: 0
    },
    requirement: {
      type: Number,
      required: true
    },
    unlocked: {
      type: Boolean,
      default: false
    },
    tier: {
      type: String,
      default: 'bronze'
    },
    index: {
      type: Number,
      default: 0
    }
  },
  computed: {
    progressPercent() {
      return Math.min((this.progress / this.requirement) * 100, 100)
    },
    tierClass() {
      return `tier-${this.tier}`
    }
  }
}
</script>

<style scoped>
.achievement-card {
  background: var(--bg-light);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 1rem;
  padding: 1.5rem;
  transition: all 0.3s ease;
  animation: fadeIn 0.6s ease-out both;
  box-shadow: var(--shadow-sm);
}

.achievement-card.locked {
  opacity: 0.6;
}

.achievement-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: rgba(0, 0, 0, 0.12);
}

.card-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.card-icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.3s ease;
  position: relative;
}

.achievement-card:hover .card-icon {
  transform: rotate(12deg);
}

.badge-emoji {
  font-size: 1.75rem;
}

.badge-svg-icon {
  width: 28px;
  height: 28px;
  filter: brightness(0) invert(1);
}

.lock-icon {
  width: 24px;
  height: 24px;
  opacity: 0.5;
}

.locked-icon {
  background: #e5e7eb;
  color: #9ca3af;
}

.tier-bronze {
  background: linear-gradient(135deg, #cd7f32 0%, #b8860b 100%);
}

.tier-silver {
  background: linear-gradient(135deg, #c0c0c0 0%, #a8a8a8 100%);
}

.tier-gold {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
}

.tier-platinum {
  background: linear-gradient(135deg, #e5e4e2 0%, #b0c4de 100%);
}

.card-details {
  flex: 1;
  min-width: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.card-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 0.25rem;
}

.description {
  font-size: 0.875rem;
  color: var(--text-muted);
  line-height: 1.4;
}

.unlocked-badge {
  background: var(--bg);
  color: var(--text);
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
}

.progress-container {
  margin-top: 0.75rem;
}

.progress-bar {
  height: 8px;
  background: var(--border);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: var(--primary);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.75rem;
  color: var(--text-muted);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>


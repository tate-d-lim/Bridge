<template>
  <div class="stats-grid" :class="{ 'stats-grid-5': stats.length === 5 }">
    <div
      v-for="(stat, index) in stats"
      :key="stat.label"
      class="stat-card"
      :style="{ animationDelay: `${index * 0.1}s` }"
    >
      <div class="stat-icon" :class="stat.colorClass">
        <img :src="stat.iconUrl" :alt="stat.label" />
      </div>
      <div class="stat-content">
        <p class="stat-label">{{ stat.label }}</p>
        <p class="stat-value">{{ stat.value }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatsOverview',
  props: {
    plays: {
      type: Number,
      default: 0
    },
    wins: {
      type: Number,
      default: 0
    },
    winRate: {
      type: Number,
      default: 0
    },
    streak: {
      type: Number,
      default: 0
    },
    badges: {
      type: Number,
      default: null
    }
  },
  computed: {
    stats() {
      const baseStats = [
        {
          label: 'Total Plays',
          value: this.plays,
          iconUrl: '/icons/target.svg',
          colorClass: 'blue-bg'
        },
        {
          label: 'Total Wins',
          value: this.wins,
          iconUrl: '/icons/award.svg',
          colorClass: 'green-bg'
        },
        {
          label: 'Win Rate',
          value: `${this.winRate}%`,
          iconUrl: '/icons/trending-up.svg',
          colorClass: 'purple-bg'
        },
        {
          label: 'Current Streak',
          value: this.streak,
          iconUrl: '/icons/flame.svg',
          colorClass: 'orange-bg'
        }
      ]
      
      // Add badges if provided
      if (this.badges !== null) {
        return [
          {
            label: 'Total Badges',
            value: this.badges,
            iconUrl: '/icons/trophy.svg',
            colorClass: 'gold-bg'
          },
          ...baseStats
        ]
      }
      
      return baseStats
    }
  }
}
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1rem;
}

@media (min-width: 640px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .stats-grid-5 {
    grid-template-columns: repeat(5, 1fr);
  }
}

.stat-card {
  background: var(--bg-light);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s;
  animation: fadeInUp 0.6s ease-out both;
  box-shadow: var(--shadow-sm);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon img {
  width: 24px;
  height: 24px;
}

.blue-bg {
  background: rgba(59, 130, 246, 0.1);
}

.blue-bg img {
  filter: brightness(0) saturate(100%) invert(42%) sepia(93%) saturate(1421%) hue-rotate(200deg) brightness(99%) contrast(101%);
}

.green-bg {
  background: rgba(34, 197, 94, 0.1);
}

.green-bg img {
  filter: brightness(0) saturate(100%) invert(69%) sepia(69%) saturate(1913%) hue-rotate(89deg) brightness(99%) contrast(88%);
}

.purple-bg {
  background: rgba(147, 51, 234, 0.1);
}

.purple-bg img {
  filter: brightness(0) saturate(100%) invert(55%) sepia(88%) saturate(2324%) hue-rotate(250deg) brightness(99%) contrast(104%);
}

.orange-bg {
  background: rgba(249, 115, 22, 0.1);
}

.orange-bg img {
  filter: brightness(0) saturate(100%) invert(62%) sepia(99%) saturate(2462%) hue-rotate(0deg) brightness(100%) contrast(101%);
}

.gold-bg {
  background: rgba(255, 215, 0, 0.1);
}

.gold-bg img {
  filter: brightness(0) saturate(100%) invert(88%) sepia(96%) saturate(1821%) hue-rotate(351deg) brightness(104%) contrast(101%);
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.875rem;
  font-weight: bold;
  color: var(--text);
  line-height: 1.2;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>


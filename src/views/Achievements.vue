<template>
  <div class="achievements-page">
    <div class="achievements-container">
      <!-- Simplified Header -->
      <div class="achievements-header">
        <h1>Achievements</h1>
        <p class="subtitle">{{ earnedBadgeCount }} of {{ totalBadgeCount }} badges unlocked</p>
        
        <!-- Minimal Progress Bar -->
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${badgeProgress}%` }"></div>
        </div>
        
        <!-- Streamlined Stats -->
        <div class="stats-row">
          <div class="stat">
            <span class="stat-value">{{ userStats?.totalPlays || 0 }}</span>
            <span class="stat-label">Plays</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ userStats?.totalWins || 0 }}</span>
            <span class="stat-label">Wins</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ userStats?.winPercentage || 0 }}%</span>
            <span class="stat-label">Win Rate</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ userStats?.currentDayStreak || 0 }}</span>
            <span class="stat-label">Streak</span>
          </div>
        </div>
      </div>

      <!-- Simplified Badge Categories -->
      <div class="badges-section">
        <!-- Performance Badges -->
        <div class="badge-category">
          <h2 class="category-title">Performance</h2>
          <div class="badges-grid">
            <div
              v-for="badge in allBadges.performance"
              :key="badge.id"
              :class="['badge-card', { earned: badge.earned }]"
            >
              <div class="badge-icon" :class="`tier-${badge.tier}`">
                {{ badge.icon }}
              </div>
              <div class="badge-content">
                <h3>{{ badge.name }}</h3>
                <p class="badge-progress">{{ getCurrentValue(badge) }} / {{ badge.requirement }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Participation Badges -->
        <div class="badge-category">
          <h2 class="category-title">Participation</h2>
          <div class="badges-grid">
            <div
              v-for="badge in allBadges.participation"
              :key="badge.id"
              :class="['badge-card', { earned: badge.earned }]"
            >
              <div class="badge-icon" :class="`tier-${badge.tier}`">
                {{ badge.icon }}
              </div>
              <div class="badge-content">
                <h3>{{ badge.name }}</h3>
                <p class="badge-progress">{{ getCurrentValue(badge) }} / {{ badge.requirement }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Streak Badges -->
        <div class="badge-category">
          <h2 class="category-title">Daily Streaks</h2>
          <div class="badges-grid">
            <div
              v-for="badge in allBadges.streak"
              :key="badge.id"
              :class="['badge-card', { earned: badge.earned }]"
            >
              <div class="badge-icon" :class="`tier-${badge.tier}`">
                {{ badge.icon }}
              </div>
              <div class="badge-content">
                <h3>{{ badge.name }}</h3>
                <p class="badge-progress">{{ getCurrentValue(badge) }} / {{ badge.requirement }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Win Streak Badges -->
        <div class="badge-category">
          <h2 class="category-title">Win Streaks</h2>
          <div class="badges-grid">
            <div
              v-for="badge in allBadges.winStreak"
              :key="badge.id"
              :class="['badge-card', { earned: badge.earned }]"
            >
              <div class="badge-icon" :class="`tier-${badge.tier}`">
                {{ badge.icon }}
              </div>
              <div class="badge-content">
                <h3>{{ badge.name }}</h3>
                <p class="badge-progress">{{ getCurrentValue(badge) }} / {{ badge.requirement }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Perfect Score Badges -->
        <div class="badge-category">
          <h2 class="category-title">Perfect Scores</h2>
          <div class="badges-grid">
            <div
              v-for="badge in allBadges.perfect"
              :key="badge.id"
              :class="['badge-card', { earned: badge.earned }]"
            >
              <div class="badge-icon" :class="`tier-${badge.tier}`">
                {{ badge.icon }}
              </div>
              <div class="badge-content">
                <h3>{{ badge.name }}</h3>
                <p class="badge-progress">{{ getCurrentValue(badge) }} / {{ badge.requirement }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'Achievements',
  setup() {
    const store = useStore()
    
    const allBadges = computed(() => store.getters['badges/allBadges'] || {
      performance: [],
      participation: [],
      streak: [],
      winStreak: [],
      perfect: []
    })
    
    const userStats = computed(() => store.getters['badges/userStats'])
    const earnedBadgeCount = computed(() => store.getters['badges/earnedBadgeCount'])
    const totalBadgeCount = computed(() => store.getters['badges/totalBadgeCount'])
    const badgeProgress = computed(() => store.getters['badges/badgeProgress'])
    
    const getCurrentValue = (badge) => {
      if (!userStats.value) return 0
      
      switch (badge.type) {
        case 'wins':
          return userStats.value.totalWins || 0
        case 'plays':
          return userStats.value.totalPlays || 0
        case 'day_streak':
          return userStats.value.maxDayStreak || 0
        case 'win_streak':
          return userStats.value.maxWinStreak || 0
        case 'perfect_scores':
          return userStats.value.perfectScores || 0
        default:
          return 0
      }
    }
    
    const getProgress = (badge) => {
      const current = getCurrentValue(badge)
      return Math.min((current / badge.requirement) * 100, 100)
    }
    
    onMounted(async () => {
      const user = store.getters['auth/currentUser']
      if (user) {
        try {
          await Promise.all([
            store.dispatch('badges/initializeUserStats', user.uid),
            store.dispatch('badges/getAllBadgesWithStatus', user.uid)
          ])
        } catch (error) {
          console.error('Error loading achievements:', error)
        }
      }
    })
    
    return {
      allBadges,
      userStats,
      earnedBadgeCount,
      totalBadgeCount,
      badgeProgress,
      getCurrentValue,
      getProgress
    }
  }
}
</script>

<style scoped>
.achievements-page {
  min-height: calc(100vh - 70px);
  background: var(--bg);
  padding: 60px 20px;
}

.achievements-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Simplified Header */
.achievements-header {
  text-align: center;
  margin-bottom: 60px;
}

.achievements-header h1 {
  font-size: 2.5rem;
  color: var(--text);
  margin-bottom: 12px;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.subtitle {
  color: var(--text-muted);
  font-size: 1rem;
  margin-bottom: 30px;
  font-weight: 400;
}

/* Minimal Progress Bar */
.progress-bar {
  max-width: 500px;
  margin: 0 auto 40px;
  height: 6px;
  background: var(--border);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary);
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Streamlined Stats Row */
.stats-row {
  display: flex;
  justify-content: center;
  gap: 48px;
  flex-wrap: wrap;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 2rem;
  color: var(--text);
  font-weight: 600;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-muted);
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Simplified Badge Section */
.badges-section {
  margin-top: 60px;
}

.badge-category {
  margin-bottom: 48px;
}

.category-title {
  font-size: 1.25rem;
  color: var(--text);
  margin-bottom: 20px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

/* Clean Badge Grid */
.badges-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
}

/* Minimalist Badge Card */
.badge-card {
  background: var(--bg-light);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s ease;
  cursor: pointer;
  width: 280px;
  max-width: 100%;
}

.badge-card:not(.earned) {
  opacity: 0.5;
}

.badge-card:hover {
  transform: translateY(-2px);
  border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.badge-card.earned {
  border-color: var(--primary);
  background: var(--bg-light);
}

/* Compact Badge Icon */
.badge-icon {
  font-size: 2rem;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.badge-card:hover .badge-icon {
  transform: scale(1.05);
}

.badge-icon.tier-bronze {
  background: linear-gradient(135deg, #cd7f32 0%, #b8860b 100%);
}

.badge-icon.tier-silver {
  background: linear-gradient(135deg, #c0c0c0 0%, #a8a8a8 100%);
}

.badge-icon.tier-gold {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
}

.badge-icon.tier-platinum {
  background: linear-gradient(135deg, #e5e4e2 0%, #b0c4de 100%);
}

/* Badge Content */
.badge-content {
  flex: 1;
  text-align: left;
  min-width: 0;
}

.badge-card h3 {
  font-size: 1rem;
  color: var(--text);
  margin-bottom: 4px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.badge-progress {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0;
  font-weight: 400;
}

/* Responsive Design */
@media (max-width: 768px) {
  .achievements-page {
    padding: 40px 16px;
  }

  .achievements-header h1 {
    font-size: 2rem;
  }
  
  .stats-row {
    gap: 32px;
  }

  .stat-value {
    font-size: 1.75rem;
  }

  .badges-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .category-title {
    font-size: 1.125rem;
  }
}

@media (max-width: 480px) {
  .stats-row {
    gap: 24px;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .badge-card {
    padding: 20px 16px;
    gap: 12px;
  }

  .badge-icon {
    font-size: 1.75rem;
    width: 48px;
    height: 48px;
  }

  .badge-card h3 {
    font-size: 0.9375rem;
  }
}
</style>


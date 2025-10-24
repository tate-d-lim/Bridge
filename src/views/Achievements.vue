<template>
  <div class="achievements-page">
    <div class="achievements-container">
      <!-- Header with Stats -->
      <div class="achievements-header">
        <h1>🏆 Achievements</h1>
        <p>Track your progress and unlock badges through your quiz journey</p>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">🎮</div>
            <div class="stat-info">
              <h3>{{ userStats?.totalPlays || 0 }}</h3>
              <p>Total Plays</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">🏆</div>
            <div class="stat-info">
              <h3>{{ userStats?.totalWins || 0 }}</h3>
              <p>Wins</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-info">
              <h3>{{ userStats?.winPercentage || 0 }}%</h3>
              <p>Win Rate</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-info">
              <h3>{{ userStats?.bestScore || 0 }}%</h3>
              <p>Best Score</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">🔥</div>
            <div class="stat-info">
              <h3>{{ userStats?.currentDayStreak || 0 }}</h3>
              <p>Day Streak</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">🎯</div>
            <div class="stat-info">
              <h3>{{ earnedBadgeCount }}/{{ totalBadgeCount }}</h3>
              <p>Badges</p>
            </div>
          </div>
        </div>
        
        <div class="progress-section">
          <div class="progress-header">
            <span>Badge Collection Progress</span>
            <span>{{ badgeProgress }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${badgeProgress}%` }"></div>
          </div>
        </div>
      </div>

      <!-- Badge Categories -->
      <div class="badges-section">
        <!-- Performance Badges -->
        <div class="badge-category">
          <div class="category-header">
            <h2>🥇 Performance Badges</h2>
            <p>Earned by achieving quiz wins</p>
          </div>
          <div class="badges-grid">
            <div
              v-for="badge in allBadges.performance"
              :key="badge.id"
              :class="['badge-card', { earned: badge.earned, locked: !badge.earned }]"
            >
              <div class="badge-icon" :class="`tier-${badge.tier}`">
                {{ badge.icon }}
              </div>
              <h3>{{ badge.name }}</h3>
              <p>{{ badge.description }}</p>
              <div class="badge-requirement">
                <div class="requirement-bar">
                  <div 
                    class="requirement-fill" 
                    :style="{ width: `${getProgress(badge)}%` }"
                  ></div>
                </div>
                <span class="requirement-text">
                  {{ getCurrentValue(badge) }} / {{ badge.requirement }}
                </span>
              </div>
              <span v-if="badge.earned" class="earned-badge">✓ Unlocked</span>
              <span v-else class="locked-badge">🔒 Locked</span>
            </div>
          </div>
        </div>

        <!-- Participation Badges -->
        <div class="badge-category">
          <div class="category-header">
            <h2>📚 Participation Badges</h2>
            <p>Unlocked by completing quizzes</p>
          </div>
          <div class="badges-grid">
            <div
              v-for="badge in allBadges.participation"
              :key="badge.id"
              :class="['badge-card', { earned: badge.earned, locked: !badge.earned }]"
            >
              <div class="badge-icon" :class="`tier-${badge.tier}`">
                {{ badge.icon }}
              </div>
              <h3>{{ badge.name }}</h3>
              <p>{{ badge.description }}</p>
              <div class="badge-requirement">
                <div class="requirement-bar">
                  <div 
                    class="requirement-fill" 
                    :style="{ width: `${getProgress(badge)}%` }"
                  ></div>
                </div>
                <span class="requirement-text">
                  {{ getCurrentValue(badge) }} / {{ badge.requirement }}
                </span>
              </div>
              <span v-if="badge.earned" class="earned-badge">✓ Unlocked</span>
              <span v-else class="locked-badge">🔒 Locked</span>
            </div>
          </div>
        </div>

        <!-- Streak Badges -->
        <div class="badge-category">
          <div class="category-header">
            <h2>🔥 Streak Badges</h2>
            <p>Maintain consecutive days of play</p>
          </div>
          <div class="badges-grid">
            <div
              v-for="badge in allBadges.streak"
              :key="badge.id"
              :class="['badge-card', { earned: badge.earned, locked: !badge.earned }]"
            >
              <div class="badge-icon" :class="`tier-${badge.tier}`">
                {{ badge.icon }}
              </div>
              <h3>{{ badge.name }}</h3>
              <p>{{ badge.description }}</p>
              <div class="badge-requirement">
                <div class="requirement-bar">
                  <div 
                    class="requirement-fill" 
                    :style="{ width: `${getProgress(badge)}%` }"
                  ></div>
                </div>
                <span class="requirement-text">
                  {{ getCurrentValue(badge) }} / {{ badge.requirement }}
                </span>
              </div>
              <span v-if="badge.earned" class="earned-badge">✓ Unlocked</span>
              <span v-else class="locked-badge">🔒 Locked</span>
            </div>
          </div>
        </div>

        <!-- Win Streak Badges -->
        <div class="badge-category">
          <div class="category-header">
            <h2>⭐ Win Streak Badges</h2>
            <p>Win multiple quizzes in a row</p>
          </div>
          <div class="badges-grid">
            <div
              v-for="badge in allBadges.winStreak"
              :key="badge.id"
              :class="['badge-card', { earned: badge.earned, locked: !badge.earned }]"
            >
              <div class="badge-icon" :class="`tier-${badge.tier}`">
                {{ badge.icon }}
              </div>
              <h3>{{ badge.name }}</h3>
              <p>{{ badge.description }}</p>
              <div class="badge-requirement">
                <div class="requirement-bar">
                  <div 
                    class="requirement-fill" 
                    :style="{ width: `${getProgress(badge)}%` }"
                  ></div>
                </div>
                <span class="requirement-text">
                  {{ getCurrentValue(badge) }} / {{ badge.requirement }}
                </span>
              </div>
              <span v-if="badge.earned" class="earned-badge">✓ Unlocked</span>
              <span v-else class="locked-badge">🔒 Locked</span>
            </div>
          </div>
        </div>

        <!-- Perfect Score Badges -->
        <div class="badge-category">
          <div class="category-header">
            <h2>💯 Perfect Score Badges</h2>
            <p>Achieve 100% quiz scores</p>
          </div>
          <div class="badges-grid">
            <div
              v-for="badge in allBadges.perfect"
              :key="badge.id"
              :class="['badge-card', { earned: badge.earned, locked: !badge.earned }]"
            >
              <div class="badge-icon" :class="`tier-${badge.tier}`">
                {{ badge.icon }}
              </div>
              <h3>{{ badge.name }}</h3>
              <p>{{ badge.description }}</p>
              <div class="badge-requirement">
                <div class="requirement-bar">
                  <div 
                    class="requirement-fill" 
                    :style="{ width: `${getProgress(badge)}%` }"
                  ></div>
                </div>
                <span class="requirement-text">
                  {{ getCurrentValue(badge) }} / {{ badge.requirement }}
                </span>
              </div>
              <span v-if="badge.earned" class="earned-badge">✓ Unlocked</span>
              <span v-else class="locked-badge">🔒 Locked</span>
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
  padding: 40px 20px;
}

.achievements-container {
  max-width: 1400px;
  margin: 0 auto;
}

.achievements-header {
  text-align: center;
  margin-bottom: 50px;
}

.achievements-header h1 {
  font-size: 3rem;
  color: var(--text);
  margin-bottom: 10px;
  font-weight: 700;
}

.achievements-header > p {
  color: var(--text-muted);
  font-size: 1.2rem;
  margin-bottom: 40px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: var(--bg-light);
  padding: 25px;
  border-radius: 15px;
  border: 2px solid var(--border);
  display: flex;
  align-items: center;
  gap: 15px;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  border-color: var(--primary);
}

.stat-icon {
  font-size: 2.5rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 12px;
  flex-shrink: 0;
}

.stat-info h3 {
  font-size: 2rem;
  color: var(--text);
  margin-bottom: 5px;
  font-weight: 700;
}

.stat-info p {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.progress-section {
  max-width: 800px;
  margin: 0 auto;
  padding: 30px;
  background: var(--bg-light);
  border-radius: 15px;
  border: 2px solid var(--border);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-weight: 600;
  color: var(--text);
  font-size: 1.1rem;
}

.progress-bar {
  height: 20px;
  background: var(--border);
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  transition: width 0.5s ease;
  border-radius: 10px;
}

.badges-section {
  margin-top: 50px;
}

.badge-category {
  margin-bottom: 60px;
}

.category-header {
  margin-bottom: 30px;
}

.category-header h2 {
  font-size: 2rem;
  color: var(--text);
  margin-bottom: 8px;
  font-weight: 700;
}

.category-header p {
  color: var(--text-muted);
  font-size: 1.1rem;
}

.badges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
}

.badge-card {
  background: var(--bg-light);
  border: 2px solid var(--border);
  border-radius: 15px;
  padding: 30px;
  text-align: center;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.badge-card.earned {
  border-color: var(--primary);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.badge-card.locked {
  opacity: 0.6;
}

.badge-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.badge-icon {
  font-size: 4rem;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin: 0 auto 20px;
  transition: transform 0.3s;
}

.badge-card:hover .badge-icon {
  transform: scale(1.1) rotate(5deg);
}

.badge-icon.tier-bronze {
  background: linear-gradient(135deg, #cd7f32 0%, #b8860b 100%);
  box-shadow: 0 4px 15px rgba(205, 127, 50, 0.3);
}

.badge-icon.tier-silver {
  background: linear-gradient(135deg, #c0c0c0 0%, #a8a8a8 100%);
  box-shadow: 0 4px 15px rgba(192, 192, 192, 0.3);
}

.badge-icon.tier-gold {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.5);
}

.badge-icon.tier-platinum {
  background: linear-gradient(135deg, #e5e4e2 0%, #b0c4de 100%);
  box-shadow: 0 4px 15px rgba(176, 196, 222, 0.5);
}

.badge-card h3 {
  font-size: 1.4rem;
  color: var(--text);
  margin-bottom: 10px;
  font-weight: 600;
}

.badge-card p {
  color: var(--text-muted);
  margin-bottom: 20px;
  font-size: 0.95rem;
  min-height: 40px;
}

.badge-requirement {
  margin: 20px 0;
}

.requirement-bar {
  height: 8px;
  background: var(--border);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.requirement-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  transition: width 0.5s ease;
  border-radius: 4px;
}

.requirement-text {
  font-size: 0.9rem;
  color: var(--text-muted);
  font-weight: 600;
}

.earned-badge {
  display: inline-block;
  padding: 8px 20px;
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  color: white;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.locked-badge {
  display: inline-block;
  padding: 8px 20px;
  background: var(--border);
  color: var(--text-muted);
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .achievements-header h1 {
    font-size: 2rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .badges-grid {
    grid-template-columns: 1fr;
  }
  
  .category-header h2 {
    font-size: 1.5rem;
  }
}
</style>


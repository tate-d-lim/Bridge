<template>
  <div class="profile-page">
    <div class="profile-container">
      <div class="profile-header">
        <div class="avatar">
          <span>{{ getInitials }}</span>
        </div>
        <div class="header-info">
          <h1>{{ userProfile?.name || 'User Profile' }}</h1>
          <p v-if="userProfile?.role === 'jobseeker'">
            {{ userProfile?.experience }} years of experience
          </p>
          <p v-else>{{ userProfile?.company }}</p>
        </div>
        <button @click="editing = !editing" class="btn btn-primary">
          {{ editing ? 'Cancel' : 'Edit Profile' }}
        </button>
      </div>

      <!-- Job Seeker Profile -->
      <div v-if="userProfile?.role === 'jobseeker'" class="profile-content">
        <div class="profile-section">
          <h2>Personal Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <label>Email</label>
              <p>{{ userProfile?.email }}</p>
            </div>
            <div class="info-item">
              <label>Phone</label>
              <p>{{ userProfile?.phone }}</p>
            </div>
          </div>
        </div>

        <div class="profile-section">
          <h2>Skills</h2>
          <div class="skills-container">
            <span v-for="skill in userProfile?.skills" :key="skill" class="skill-tag">
              {{ skill }}
            </span>
          </div>
        </div>

        <div class="profile-section">
          <div class="section-header">
            <h2>🏆 Badges & Achievements</h2>
            <router-link to="/achievements" class="view-all-link">
              View All →
            </router-link>
          </div>
          
          <div v-if="loading" class="loading-state">
            <p>Loading badges...</p>
          </div>
          
          <div v-else-if="earnedBadges.length === 0" class="empty-badges">
            <div class="empty-icon">🎯</div>
            <p>No badges earned yet</p>
            <p class="empty-subtitle">Complete quizzes to earn your first badge!</p>
            <router-link to="/quizzes" class="btn btn-primary">Start Learning</router-link>
          </div>
          
          <div v-else class="badges-grid">
            <div 
              v-for="badge in earnedBadges.slice(0, 6)" 
              :key="badge.id"
              class="badge-card"
            >
              <div class="badge-icon" :class="`tier-${badge.badgeTier}`">
                {{ badge.badgeIcon }}
              </div>
              <div class="badge-details">
                <h3>{{ badge.badgeName }}</h3>
                <p>{{ badge.badgeDescription }}</p>
                <span class="earned-date">
                  {{ formatDate(badge.earnedAt) }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- Stats Summary -->
          <div class="stats-summary">
            <div class="stat-item">
              <span class="stat-label">Total Badges</span>
              <span class="stat-value">{{ earnedBadges.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Quiz Wins</span>
              <span class="stat-value">{{ userStats?.totalWins || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Win Rate</span>
              <span class="stat-value">{{ userStats?.winPercentage || 0 }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Current Streak</span>
              <span class="stat-value">{{ userStats?.currentDayStreak || 0 }} days</span>
            </div>
          </div>
        </div>

        <!-- Recent Applications (for job seekers) -->
        <div class="profile-section">
          <h2>Recent Applications</h2>
          <div class="empty-state">
            <p>You haven't applied to any jobs yet.</p>
            <router-link to="/" class="btn btn-primary">Browse Jobs</router-link>
          </div>
        </div>
      </div>

      <!-- Employer Profile -->
      <div v-else class="profile-content">
        <div class="profile-section">
          <h2>Company Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <label>Company Name</label>
              <p>{{ userProfile?.company }}</p>
            </div>
            <div class="info-item">
              <label>Industry</label>
              <p>{{ userProfile?.industry }}</p>
            </div>
            <div class="info-item">
              <label>Email</label>
              <p>{{ userProfile?.email }}</p>
            </div>
            <div class="info-item">
              <label>Phone</label>
              <p>{{ userProfile?.phone }}</p>
            </div>
          </div>
        </div>

        <!-- Recent Applications (for employers) -->
        <div v-if="userProfile?.role === 'employer'" class="profile-section">
          <h2>Recent Applications</h2>
          <div class="empty-state">
            <p>No applications yet.</p>
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
  name: 'Profile',
  setup() {
    const store = useStore()
    const editing = ref(false)
    const loading = ref(false)

    const userProfile = computed(() => store.getters['auth/userProfile'])
    const currentUser = computed(() => store.getters['auth/currentUser'])
    const earnedBadges = computed(() => store.getters['badges/earnedBadges'] || [])
    const userStats = computed(() => store.getters['badges/userStats'])

    const getInitials = computed(() => {
      if (!userProfile.value?.name) return '?'
      return userProfile.value.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    })

    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = dateString.toDate ? dateString.toDate() : new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    }

    onMounted(async () => {
      if (userProfile.value?.role === 'jobseeker' && currentUser.value) {
        loading.value = true
        try {
          await Promise.all([
            store.dispatch('badges/fetchEarnedBadges', currentUser.value.uid),
            store.dispatch('badges/initializeUserStats', currentUser.value.uid)
          ])
        } catch (error) {
          console.error('Error fetching badges:', error)
        } finally {
          loading.value = false
        }
      }
    })

    return {
      editing,
      userProfile,
      earnedBadges,
      userStats,
      loading,
      getInitials,
      formatDate
    }
  }
}
</script>

<style scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.view-all-link {
  color: var(--primary);
  font-weight: 600;
  text-decoration: none;
  transition: color 0.3s;
}

.view-all-link:hover {
  color: var(--primary-dark);
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: var(--text-muted);
}

.empty-badges {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-badges p {
  color: var(--text);
  font-size: 1.2rem;
  margin-bottom: 10px;
}

.empty-subtitle {
  color: var(--text-muted);
  font-size: 1rem;
  margin-bottom: 20px;
}

.badges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.badge-card {
  background: var(--bg);
  border: 2px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  gap: 15px;
  transition: all 0.3s;
}

.badge-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border-color: var(--primary);
}

.badge-icon {
  font-size: 3rem;
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
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

.badge-details {
  flex: 1;
}

.badge-details h3 {
  font-size: 1.1rem;
  color: var(--text);
  margin-bottom: 5px;
  font-weight: 600;
}

.badge-details p {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.earned-date {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-style: italic;
}

.stats-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  padding: 25px;
  background: var(--bg);
  border-radius: 12px;
  border: 2px solid var(--border);
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.stat-value {
  display: block;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--primary);
}

.btn {
  padding: 10px 25px;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  display: inline-block;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .badges-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-summary {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>


<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>Welcome back, {{ userProfile?.name }}!</h1>
      <p>Manage your job applications and profile</p>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📝</div>
        <div class="stat-info">
          <h3>{{ applications.length }}</h3>
          <p>Applications</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🏆</div>
        <div class="stat-info">
          <h3>{{ badges.length }}</h3>
          <p>Badges Earned</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💬</div>
        <div class="stat-info">
          <h3>{{ chats.length }}</h3>
          <p>Messages</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">👁️</div>
        <div class="stat-info">
          <h3>0</h3>
          <p>Profile Views</p>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <h2>Quick Actions</h2>
      <div class="actions-grid">
        <router-link to="/jobs" class="action-card">
          <span class="action-icon">🔍</span>
          <h3>Browse Jobs</h3>
          <p>Find your next opportunity</p>
        </router-link>
        <router-link to="/quizzes" class="action-card">
          <span class="action-icon">📚</span>
          <h3>Take Quizzes</h3>
          <p>Upskill and earn badges</p>
        </router-link>
        <router-link to="/applications" class="action-card">
          <span class="action-icon">📋</span>
          <h3>My Applications</h3>
          <p>Track your applications</p>
        </router-link>
        <router-link to="/profile" class="action-card">
          <span class="action-icon">👤</span>
          <h3>Edit Profile</h3>
          <p>Update your information</p>
        </router-link>
      </div>
    </div>

    <!-- Recent Applications -->
    <div class="recent-section">
      <h2>Recent Applications</h2>
      <div v-if="applications.length === 0" class="empty-state">
        <p>You haven't applied to any jobs yet.</p>
        <router-link to="/jobs" class="btn btn-primary">Browse Jobs</router-link>
      </div>
      <div v-else class="applications-list">
        <div v-for="app in applications.slice(0, 5)" :key="app.id" class="application-item">
          <div class="app-info">
            <h3>{{ app.jobTitle }}</h3>
            <p>{{ app.company }} • Applied {{ formatDate(app.createdAt) }}</p>
          </div>
          <span :class="['status-badge', app.status]">
            {{ app.status }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'JobSeekerDashboard',
  setup() {
    const store = useStore()

    const applications = ref([])
    const badges = ref([])
    const chats = ref([])

    const userProfile = computed(() => store.getters['auth/userProfile'])
    const currentUser = computed(() => store.getters['auth/currentUser'])

    const fetchDashboardData = async () => {
      try {
        if (currentUser.value) {
          applications.value = await store.dispatch('applications/fetchUserApplications', currentUser.value.uid)
          badges.value = await store.dispatch('quizzes/fetchUserBadges', currentUser.value.uid)
          chats.value = await store.dispatch('chat/fetchChats', currentUser.value.uid)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      }
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString()
    }

    onMounted(() => {
      fetchDashboardData()
    })

    return {
      userProfile,
      applications,
      badges,
      chats,
      formatDate
    }
  }
}
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.dashboard-header {
  margin-bottom: 40px;
}

.dashboard-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 10px;
}

.dashboard-header p {
  font-size: 1.1rem;
  color: #7f8c8d;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  font-size: 3rem;
}

.stat-info h3 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 5px;
}

.stat-info p {
  color: #7f8c8d;
}

.quick-actions {
  margin-bottom: 40px;
}

.quick-actions h2 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 20px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.action-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  text-decoration: none;
  transition: transform 0.3s, box-shadow 0.3s;
}

.action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.action-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 15px;
}

.action-card h3 {
  font-size: 1.3rem;
  color: #2c3e50;
  margin-bottom: 10px;
}

.action-card p {
  color: #7f8c8d;
}

.recent-section h2 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 20px;
}

.empty-state {
  background: white;
  padding: 60px 20px;
  border-radius: 12px;
  text-align: center;
}

.empty-state p {
  color: #7f8c8d;
  margin-bottom: 20px;
}

.applications-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.application-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.application-item:last-child {
  border-bottom: none;
}

.app-info h3 {
  font-size: 1.2rem;
  color: #2c3e50;
  margin-bottom: 5px;
}

.app-info p {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.status-badge {
  padding: 6px 15px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.accepted {
  background: #d4edda;
  color: #155724;
}

.status-badge.rejected {
  background: #f8d7da;
  color: #721c24;
}
</style>


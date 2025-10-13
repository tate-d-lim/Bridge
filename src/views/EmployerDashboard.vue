<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>Welcome, {{ userProfile?.company }}!</h1>
      <p>Manage your job postings and applications</p>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">💼</div>
        <div class="stat-info">
          <h3>0</h3>
          <p>Active Jobs</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📝</div>
        <div class="stat-info">
          <h3>0</h3>
          <p>Applications</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-info">
          <h3>0</h3>
          <p>Candidates</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <h3>0</h3>
          <p>Hired</p>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <h2>Quick Actions</h2>
      <div class="actions-grid">
        <router-link to="/employer/post-job" class="action-card">
          <span class="action-icon">➕</span>
          <h3>Post New Job</h3>
          <p>Create a job listing</p>
        </router-link>
        <router-link to="/candidates" class="action-card">
          <span class="action-icon">🔍</span>
          <h3>Browse Candidates</h3>
          <p>Find qualified workers</p>
        </router-link>
        <router-link to="/chat" class="action-card">
          <span class="action-icon">💬</span>
          <h3>Messages</h3>
          <p>Chat with candidates</p>
        </router-link>
        <router-link to="/profile" class="action-card">
          <span class="action-icon">🏢</span>
          <h3>Company Profile</h3>
          <p>Edit your profile</p>
        </router-link>
      </div>
    </div>

    <!-- Recent Jobs -->
    <div class="recent-section">
      <div class="section-header">
        <h2>Your Job Postings</h2>
        <router-link to="/employer/post-job" class="btn btn-primary">Post New Job</router-link>
      </div>
      
      <div class="empty-state">
        <p>You haven't posted any jobs yet.</p>
        <router-link to="/employer/post-job" class="btn btn-primary">Post Your First Job</router-link>
      </div>
    </div>

    <!-- Recent Applications -->
    <div class="recent-section">
      <h2>Recent Applications</h2>
      <div class="empty-state">
        <p>No applications yet.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'EmployerDashboard',
  setup() {
    const store = useStore()

    const userProfile = computed(() => store.getters['auth/userProfile'])

    return {
      userProfile
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

.recent-section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.recent-section h2 {
  font-size: 2rem;
  color: #2c3e50;
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
</style>


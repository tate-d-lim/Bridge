<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>Welcome, {{ userProfile?.name }}!</h1>
      <p>Manage your job postings and applications</p>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="card stat-card">
        <div class="stat-icon">💼</div>
        <div class="stat-info">
          <h3>0</h3>
          <p>Active Jobs</p>
        </div>
      </div>
      <div class="card stat-card">
        <div class="stat-icon">📝</div>
        <div class="stat-info">
          <h3>0</h3>
          <p>Applications</p>
        </div>
      </div>
      <div class="card stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-info">
          <h3>0</h3>
          <p>Candidates</p>
        </div>
      </div>
      <div class="card stat-card">
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
        <router-link to="/employer/post-job" class="card card-interactive action-card">
          <span class="action-icon">➕</span>
          <h3>Post New Job</h3>
          <p>Create a job listing</p>
        </router-link>
        <router-link to="/candidates" class="card card-interactive action-card">
          <span class="action-icon">🔍</span>
          <h3>Browse Candidates</h3>
          <p>Find qualified workers</p>
        </router-link>
        <router-link to="/chat" class="card card-interactive action-card">
          <span class="action-icon">💬</span>
          <h3>Messages</h3>
          <p>Chat with candidates</p>
        </router-link>
        <router-link to="/profile" class="card card-interactive action-card">
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
      
      <div v-if="loading" class="loading-state">
        <p>Loading your jobs...</p>
      </div>
      
      <div v-else-if="employerJobs.length === 0" class="empty-state">
        <p>You haven't posted any jobs yet.</p>
        <router-link to="/employer/post-job" class="btn btn-primary">Post Your First Job</router-link>
      </div>
      
      <div v-else class="jobs-list">
        <div v-for="job in employerJobs" :key="job.id" class="card job-item">
          <div class="job-content">
            <h3>{{ job.title }}</h3>
            <p class="job-company">{{ job.company }}</p>
            <p class="job-location">📍 {{ job.location }}</p>
            <p class="job-category">🏷️ {{ job.category }}</p>
            <p class="job-description">{{ job.description.substring(0, 150) }}...</p>
            <div class="job-meta">
              <span class="job-salary">💰 ${{ job.salary }}/month</span>
              <span class="job-status" :class="job.status">{{ job.status }}</span>
            </div>
          </div>
          <div class="job-actions">
            <router-link :to="`/jobs/${job.id}`" class="btn btn-secondary">View</router-link>
            <button @click="editJob(job.id)" class="btn btn-primary">Edit</button>
          </div>
        </div>
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
import { computed, ref, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'EmployerDashboard',
  setup() {
    const store = useStore()
    
    const employerJobs = ref([])
    const loading = ref(false)

    const userProfile = computed(() => store.getters['auth/userProfile'])
    const currentUser = computed(() => store.getters['auth/currentUser'])

    const fetchEmployerJobs = async () => {
      if (!currentUser.value) {
        console.log('No current user found')
        return
      }
      
      console.log('Fetching jobs for employer:', currentUser.value.uid)
      loading.value = true
      try {
        await store.dispatch('jobs/fetchJobsByEmployer', currentUser.value.uid)
        employerJobs.value = store.getters['jobs/allJobs']
        console.log('Fetched jobs:', employerJobs.value)
      } catch (error) {
        console.error('Error fetching employer jobs:', error)
      } finally {
        loading.value = false
      }
    }

    const editJob = (jobId) => {
      // For now, show an alert that edit functionality is coming soon
      alert('Edit job functionality is coming soon! For now, you can view the job details.')
    }

    onMounted(() => {
      fetchEmployerJobs()
    })

    return {
      userProfile,
      employerJobs,
      loading,
      editJob
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
  color: var(--text);
  margin-bottom: 10px;
}

.dashboard-header p {
  font-size: 1.1rem;
  color: var(--text-muted);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  font-size: 3rem;
}

.stat-info h3 {
  font-size: 2rem;
  color: var(--text);
  margin-bottom: 5px;
}

.stat-info p {
  color: var(--text-muted);
}

.quick-actions {
  margin-bottom: 40px;
}

.quick-actions h2 {
  font-size: 2rem;
  color: var(--text);
  margin-bottom: 20px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.action-card {
  text-align: center;
  text-decoration: none;
}

.action-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 15px;
}

.action-card h3 {
  font-size: 1.3rem;
  color: var(--text);
  margin-bottom: 10px;
}

.action-card p {
  color: var(--text-muted);
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
  color: var(--text);
}

.empty-state {
  background: var(--bg-light);
  padding: 60px 20px;
  border-radius: 12px;
  text-align: center;
  border: 1px solid var(--border);
}

.empty-state p {
  color: var(--text-muted);
  margin-bottom: 20px;
}

.loading-state {
  background: var(--bg-light);
  padding: 60px 20px;
  border-radius: 12px;
  text-align: center;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
}

.loading-state p {
  color: var(--text-muted);
}

.jobs-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.job-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.job-content {
  flex: 1;
}

.job-content h3 {
  font-size: 1.5rem;
  color: var(--text);
  margin-bottom: 8px;
}

.job-company {
  color: var(--primary);
  font-weight: 600;
  margin-bottom: 8px;
}

.job-location,
.job-category {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.job-description {
  color: var(--text);
  line-height: 1.5;
  margin: 10px 0;
}

.job-meta {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-top: 10px;
}

.job-salary {
  color: var(--success);
  font-weight: 600;
}

.job-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.job-status.active {
  background: var(--success);
  color: white;
}

.job-status.inactive {
  background: var(--text-muted);
  color: white;
}

.job-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 120px;
}

.job-actions .btn {
  padding: 8px 16px;
  font-size: 0.9rem;
  text-align: center;
}

@media (max-width: 768px) {
  .job-item {
    flex-direction: column;
    gap: 15px;
  }
  
  .job-actions {
    flex-direction: row;
    min-width: auto;
  }
  
  .job-actions .btn {
    flex: 1;
  }
}
</style>


<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>Welcome, {{ userProfile?.name }}!</h1>
      <p>Manage your job postings and applications</p>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <AnimatedStat
        :icon="briefcaseIcon"
        :value="employerJobs.length"
        label="Active Jobs"
        :delay="0"
      />
      <AnimatedStat
        :icon="taskIcon"
        :value="totalApplications"
        label="Applications"
        :delay="100"
      />
      <AnimatedStat
        :icon="candidatesIcon"
        :value="uniqueCandidates"
        label="Candidates"
        :delay="200"
      />
      <AnimatedStat
        :icon="hiredIcon"
        :value="hiredCount"
        label="Hired"
        :delay="300"
      />
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
      <div class="section-header">
        <h2>Recent Applications</h2>
        <div class="header-actions">
          <button @click="fetchRecentApplications" class="btn btn-secondary" :disabled="loadingApplications">
            {{ loadingApplications ? 'Refreshing...' : 'Refresh' }}
          </button>
          <router-link to="/employer/applications" class="btn btn-primary">View All Applications</router-link>
        </div>
      </div>
      
      <div v-if="loadingApplications" class="loading-state">
        <p>Loading applications...</p>
      </div>
      
      <div v-else-if="recentApplications.length === 0" class="empty-state">
        <p>No applications yet.</p>
        <p class="empty-subtitle">Applications will appear here when candidates apply to your jobs.</p>
      </div>
      
      <div v-else class="applications-list">
        <div v-for="application in recentApplications" :key="application.id" class="card application-card">
          <div class="application-header">
            <div>
              <h3>{{ application.jobTitle }}</h3>
              <p class="candidate-info">Applied by: {{ application.candidateName || 'Unknown Candidate' }}</p>
              <p class="application-date">Applied {{ formatDate(application.createdAt) }}</p>
            </div>
            <span :class="['status-badge', application.status]">
              {{ application.status.charAt(0).toUpperCase() + application.status.slice(1) }}
            </span>
          </div>
          
          <div class="application-details">
            <div class="detail-item">
              <img src="../assets/location.svg" alt="Location" class="detail-icon" />
              <span>{{ application.location }}</span>
            </div>
            <div class="detail-item">
              <img src="../assets/salary.svg" alt="Salary" class="detail-icon" />
              <span>${{ application.salary }}</span>
            </div>
          </div>

          <!-- Application Information -->
          <div class="application-info">
            <div class="info-section">
              <h4>Cover Letter</h4>
              <p class="cover-letter">{{ application.coverLetter }}</p>
            </div>
            
            <div class="info-section">
              <h4>Resume</h4>
              <p class="resume-info">{{ application.resume }}</p>
            </div>
          </div>

          <div class="application-actions">
            <router-link :to="`/applications/${application.id}`" class="btn btn-secondary">
              View Application
            </router-link>
            <button @click="updateApplicationStatus(application.id, 'accepted')" 
                    v-if="application.status === 'pending'" 
                    class="btn btn-success">
              Accept
            </button>
            <button @click="updateApplicationStatus(application.id, 'rejected')" 
                    v-if="application.status === 'pending'" 
                    class="btn btn-danger">
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import AnimatedStat from '../components/AnimatedStat.vue'
import briefcaseIcon from '../assets/briefcase.svg'
import taskIcon from '../assets/task-checklist.svg'
import candidatesIcon from '../assets/candidates.svg'
import hiredIcon from '../assets/hired.svg'

export default {
  name: 'EmployerDashboard',
  components: {
    AnimatedStat
  },
  setup() {
    const store = useStore()
    
    const employerJobs = ref([])
    const recentApplications = ref([])
    const allApplications = ref([])
    const loading = ref(false)
    const loadingApplications = ref(false)

    const userProfile = computed(() => store.getters['auth/userProfile'])
    const currentUser = computed(() => store.getters['auth/currentUser'])
    
    const totalApplications = computed(() => {
      return allApplications.value.length
    })

    const uniqueCandidates = computed(() => {
      const uniqueCandidateIds = new Set(allApplications.value.map(app => app.candidateId))
      return uniqueCandidateIds.size
    })

    const hiredCount = computed(() => {
      return allApplications.value.filter(app => app.status === 'accepted').length
    })

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

    const fetchRecentApplications = async () => {
      if (!currentUser.value || employerJobs.value.length === 0) {
        return
      }
      
      loadingApplications.value = true
      try {
        // Get all applications for the employer's jobs
        const fetchedApplications = []
        
        for (const job of employerJobs.value) {
          try {
            const jobApplications = await store.dispatch('applications/fetchJobApplications', job.id)
            fetchedApplications.push(...jobApplications)
          } catch (error) {
            console.error('Error fetching applications for job:', job.id, error)
          }
        }
        
        // Sort by creation date
        fetchedApplications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        
        // Store all applications for total count
        allApplications.value = fetchedApplications
        
        // Take the most recent 5 for display
        recentApplications.value = fetchedApplications.slice(0, 5)
        
        console.log('Fetched all applications:', allApplications.value.length)
        console.log('Recent applications:', recentApplications.value.length)
      } catch (error) {
        console.error('Error fetching recent applications:', error)
      } finally {
        loadingApplications.value = false
      }
    }

    const updateApplicationStatus = async (applicationId, status) => {
      try {
        await store.dispatch('applications/updateApplicationStatus', {
          applicationId,
          status
        })
        
        // Update the local state
        const application = recentApplications.value.find(app => app.id === applicationId)
        if (application) {
          application.status = status
        }
        
        alert(`Application ${status} successfully!`)
      } catch (error) {
        console.error('Error updating application status:', error)
        alert('Failed to update application status. Please try again.')
      }
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    }

    const editJob = (jobId) => {
      // For now, show an alert that edit functionality is coming soon
      alert('Edit job functionality is coming soon! For now, you can view the job details.')
    }

    onMounted(async () => {
      await fetchEmployerJobs()
      // Fetch applications after jobs are loaded
      await fetchRecentApplications()
      
      // Set up auto-refresh every 30 seconds
      setInterval(async () => {
        await fetchRecentApplications()
      }, 30000)
    })

    return {
      userProfile,
      employerJobs,
      recentApplications,
      allApplications,
      totalApplications,
      uniqueCandidates,
      hiredCount,
      loading,
      loadingApplications,
      editJob,
      updateApplicationStatus,
      formatDate,
      briefcaseIcon,
      taskIcon,
      candidatesIcon,
      hiredIcon
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

/* AnimatedStat component handles its own styling */

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

/* Recent Applications Styles */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.section-header h2 {
  font-size: 1.8rem;
  color: var(--text);
}

.applications-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.application-card {
  /* Card styling handled by global .card class */
}

.application-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 20px;
}

.application-header h3 {
  font-size: 1.5rem;
  color: var(--text);
  margin-bottom: 5px;
}

.candidate-info {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin-bottom: 3px;
}

.application-date {
  color: var(--text-muted);
  font-size: 0.85rem;
}

.status-badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.status-badge.pending {
  background: var(--warning);
  color: var(--text);
}

.status-badge.accepted {
  background: var(--success);
  color: white;
}

.status-badge.rejected {
  background: var(--danger);
  color: white;
}

.application-details {
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.detail-item {
  display: flex;
  gap: 8px;
  align-items: center;
}

.detail-icon {
  width: 16px;
  height: 16px;
  opacity: 0.7;
}

.application-info {
  margin: 20px 0;
  padding: 20px;
  background: var(--bg-light);
  border-radius: 8px;
  border: 1px solid var(--border);
}

.info-section {
  margin-bottom: 20px;
}

.info-section:last-child {
  margin-bottom: 0;
}

.info-section h4 {
  font-size: 1rem;
  color: var(--text);
  margin-bottom: 8px;
  font-weight: 600;
}

.cover-letter {
  color: var(--text-muted);
  line-height: 1.6;
  font-size: 0.95rem;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.resume-info {
  color: var(--text-muted);
  line-height: 1.6;
  font-size: 0.95rem;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.application-actions {
  display: flex;
  gap: 15px;
}

.btn-success {
  background: var(--success);
  color: white;
}

.btn-success:hover {
  background: oklch(0.4 0.1 145);
}

.btn-danger {
  background: var(--danger);
  color: white;
}

.btn-danger:hover {
  background: oklch(0.4 0.1 15);
}

.empty-subtitle {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-top: 5px;
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


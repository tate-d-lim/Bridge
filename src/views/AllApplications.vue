<template>
  <div class="all-applications-page">
    <div class="applications-container">
      <div class="page-header">
        <h1>All Applications</h1>
        <p>Manage applications for all your job postings</p>
      </div>

      <!-- Filter and Search -->
      <div class="filters-section">
        <div class="filter-tabs">
          <button
            :class="['tab', { active: activeFilter === 'all' }]"
            @click="activeFilter = 'all'"
          >
            All Applications
          </button>
          <button
            :class="['tab', { active: activeFilter === 'pending' }]"
            @click="activeFilter = 'pending'"
          >
            Pending
          </button>
          <button
            :class="['tab', { active: activeFilter === 'accepted' }]"
            @click="activeFilter = 'accepted'"
          >
            Accepted
          </button>
          <button
            :class="['tab', { active: activeFilter === 'rejected' }]"
            @click="activeFilter = 'rejected'"
          >
            Rejected
          </button>
        </div>
        
        <div class="search-section">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by candidate name, job title, or company..."
            class="search-input"
          />
          <button @click="refreshApplications" class="btn btn-secondary" :disabled="loading">
            {{ loading ? 'Refreshing...' : 'Refresh' }}
          </button>
        </div>
      </div>

      <!-- Applications List -->
      <div v-if="loading" class="loading-state">
        <p>Loading applications...</p>
      </div>

      <div v-else-if="filteredApplications.length === 0" class="empty-state">
        <p>No applications found.</p>
        <p class="empty-subtitle">Applications will appear here when candidates apply to your jobs.</p>
        <router-link to="/employer/post-job" class="btn btn-primary">Post a Job</router-link>
      </div>

      <div v-else class="applications-list">
        <div
          v-for="application in filteredApplications"
          :key="application.id"
          class="card application-card"
        >
          <div class="application-header">
            <div class="application-main">
              <h3>{{ application.jobTitle }}</h3>
              <p class="candidate-info">Applied by: {{ application.candidateName }}</p>
              <p class="application-date">Applied {{ formatDate(application.createdAt) }}</p>
            </div>
            <div class="application-meta">
              <span :class="['status-badge', application.status]">
                {{ application.status.charAt(0).toUpperCase() + application.status.slice(1) }}
              </span>
              <div class="meta-details">
                <div class="meta-item">
                  <img src="../assets/location.svg" alt="Location" class="meta-icon" />
                  <span>{{ application.location }}</span>
                </div>
                <div class="meta-item">
                  <img src="../assets/salary.svg" alt="Salary" class="meta-icon" />
                  <span>${{ application.salary }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Application Preview -->
          <div class="application-preview">
            <div class="preview-section">
              <h4>Cover Letter</h4>
              <p class="preview-text">{{ application.coverLetter.substring(0, 150) }}{{ application.coverLetter.length > 150 ? '...' : '' }}</p>
            </div>
            
            <div class="preview-section">
              <h4>Resume</h4>
              <p class="preview-text">{{ application.resume.substring(0, 100) }}{{ application.resume.length > 100 ? '...' : '' }}</p>
            </div>
          </div>

          <!-- Application Actions -->
          <div class="application-actions">
            <router-link :to="`/applications/${application.id}`" class="btn btn-primary">
              View Full Application
            </router-link>
            <router-link :to="`/jobs/${application.jobId}`" class="btn btn-secondary">
              View Job
            </router-link>
            <div v-if="application.status === 'pending'" class="status-actions">
              <button @click="updateApplicationStatus(application.id, 'accepted')" class="btn btn-success">
                Accept
              </button>
              <button @click="updateApplicationStatus(application.id, 'rejected')" class="btn btn-danger">
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          @click="currentPage = Math.max(1, currentPage - 1)"
          :disabled="currentPage === 1"
          class="btn btn-secondary"
        >
          Previous
        </button>
        <span class="page-info">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        <button 
          @click="currentPage = Math.min(totalPages, currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="btn btn-secondary"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'AllApplications',
  setup() {
    const store = useStore()
    
    const applications = ref([])
    const loading = ref(false)
    const activeFilter = ref('all')
    const searchQuery = ref('')
    const currentPage = ref(1)
    const itemsPerPage = 10

    const currentUser = computed(() => store.getters['auth/currentUser'])

    const filteredApplications = computed(() => {
      let filtered = applications.value

      // Filter by status
      if (activeFilter.value !== 'all') {
        filtered = filtered.filter(app => app.status === activeFilter.value)
      }

      // Filter by search query
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(app => 
          app.candidateName.toLowerCase().includes(query) ||
          app.jobTitle.toLowerCase().includes(query) ||
          app.company.toLowerCase().includes(query)
        )
      }

      return filtered
    })

    const paginatedApplications = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage
      const end = start + itemsPerPage
      return filteredApplications.value.slice(start, end)
    })

    const totalPages = computed(() => {
      return Math.ceil(filteredApplications.value.length / itemsPerPage)
    })

    const fetchAllApplications = async () => {
      if (!currentUser.value) return
      
      loading.value = true
      try {
        // Get all jobs for the employer
        const employerJobs = await store.dispatch('jobs/fetchJobsByEmployer', currentUser.value.uid)
        
        // Get all applications for these jobs
        const allApplications = []
        
        for (const job of employerJobs) {
          try {
            const jobApplications = await store.dispatch('applications/fetchJobApplications', job.id)
            allApplications.push(...jobApplications)
          } catch (error) {
            console.error('Error fetching applications for job:', job.id, error)
          }
        }
        
        // Sort by creation date (newest first)
        allApplications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        applications.value = allApplications
        
        console.log('Fetched all applications:', applications.value.length)
      } catch (error) {
        console.error('Error fetching applications:', error)
      } finally {
        loading.value = false
      }
    }

    const updateApplicationStatus = async (applicationId, status) => {
      try {
        await store.dispatch('applications/updateApplicationStatus', {
          applicationId,
          status
        })
        
        // Update the local state
        const application = applications.value.find(app => app.id === applicationId)
        if (application) {
          application.status = status
        }
        
        alert(`Application ${status} successfully!`)
      } catch (error) {
        console.error('Error updating application status:', error)
        alert('Failed to update application status. Please try again.')
      }
    }

    const refreshApplications = async () => {
      await fetchAllApplications()
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    }

    // Reset to first page when filter changes
    watch(activeFilter, () => {
      currentPage.value = 1
    })

    watch(searchQuery, () => {
      currentPage.value = 1
    })

    onMounted(() => {
      fetchAllApplications()
    })

    return {
      applications,
      loading,
      activeFilter,
      searchQuery,
      currentPage,
      filteredApplications,
      paginatedApplications,
      totalPages,
      updateApplicationStatus,
      refreshApplications,
      formatDate
    }
  }
}
</script>

<style scoped>
.all-applications-page {
  min-height: calc(100vh - 70px);
  background: var(--bg-light);
  padding: 40px 20px;
}

.applications-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 2.5rem;
  color: var(--text);
  margin-bottom: 10px;
}

.page-header p {
  font-size: 1.1rem;
  color: var(--text-muted);
}

.filters-section {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.filter-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.tab {
  flex: 1;
  min-width: 120px;
  padding: 12px 20px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 1rem;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s;
}

.tab:hover {
  background: var(--bg-light);
}

.tab.active {
  background: var(--primary);
  color: white;
}

.search-section {
  display: flex;
  gap: 15px;
  align-items: center;
}

.search-input {
  flex: 1;
  padding: 12px 15px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 1rem;
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
  font-size: 1.1rem;
  color: var(--text-muted);
}

.empty-state {
  background: white;
  padding: 60px 20px;
  border-radius: 12px;
  text-align: center;
  border: 1px solid var(--border);
}

.empty-state p {
  color: var(--text-muted);
  margin-bottom: 10px;
  font-size: 1.1rem;
}

.empty-subtitle {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.applications-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.application-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 25px;
  transition: all 0.3s;
}

.application-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.application-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 20px;
}

.application-main h3 {
  font-size: 1.5rem;
  color: var(--text);
  margin-bottom: 8px;
}

.candidate-info {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin-bottom: 5px;
}

.application-date {
  color: var(--text-muted);
  font-size: 0.85rem;
}

.application-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.status-badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: capitalize;
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

.meta-details {
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: flex-end;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.meta-icon {
  width: 14px;
  height: 14px;
  opacity: 0.7;
}

.application-preview {
  margin: 20px 0;
  padding: 20px;
  background: var(--bg-light);
  border-radius: 8px;
  border: 1px solid var(--border);
}

.preview-section {
  margin-bottom: 15px;
}

.preview-section:last-child {
  margin-bottom: 0;
}

.preview-section h4 {
  font-size: 1rem;
  color: var(--text);
  margin-bottom: 8px;
  font-weight: 600;
}

.preview-text {
  color: var(--text-muted);
  line-height: 1.5;
  font-size: 0.9rem;
}

.application-actions {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.status-actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  display: inline-block;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: oklch(0.3 0.1 245);
  transform: translateY(-2px);
}

.btn-secondary {
  background: var(--bg-light);
  color: var(--text);
  border: 2px solid var(--border);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--bg);
  border-color: var(--primary);
}

.btn-success {
  background: var(--success);
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: oklch(0.4 0.1 145);
  transform: translateY(-2px);
}

.btn-danger {
  background: var(--danger);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: oklch(0.4 0.1 15);
  transform: translateY(-2px);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 40px;
  padding: 20px;
}

.page-info {
  color: var(--text-muted);
  font-weight: 500;
}

@media (max-width: 768px) {
  .filter-tabs {
    flex-direction: column;
  }
  
  .tab {
    min-width: auto;
  }
  
  .search-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .application-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .application-meta {
    align-items: flex-start;
  }
  
  .meta-details {
    align-items: flex-start;
  }
  
  .application-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .status-actions {
    justify-content: center;
  }
}
</style>

<template>
  <div class="applications-page">
    <div class="applications-container">
      <div class="page-header">
        <h1>My Applications</h1>
        <p>Track your job applications</p>
      </div>

      <!-- Filter Tabs -->
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

      <!-- Applications List -->
      <div v-if="filteredApplications.length === 0" class="empty-state">
        <p>No applications found.</p>
        <router-link to="/jobs" class="btn btn-primary">Browse Jobs</router-link>
      </div>

      <div v-else class="applications-list">
        <div
          v-for="application in filteredApplications"
          :key="application.id"
          class="card application-card"
        >
          <div class="application-header">
            <div>
              <h3>{{ application.jobTitle || 'Job Title Not Available' }}</h3>
              <p class="company">{{ application.company || 'Company Not Available' }}</p>
            </div>
            <span :class="['status-badge', application.status]">
              {{ application.status.charAt(0).toUpperCase() + application.status.slice(1) }}
            </span>
          </div>
          
          <div class="application-details">
            <div class="detail-item">
              <span class="label">Applied:</span>
              <span>{{ formatDate(application.createdAt) }}</span>
            </div>
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
            <router-link :to="`/jobs/${application.jobId}`" class="btn btn-secondary">
              View Job
            </router-link>
            <button v-if="application.status === 'accepted'" class="btn btn-primary">
              Contact Employer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'

export default {
  name: 'Applications',
  setup() {
    const store = useStore()
    const route = useRoute()
    const activeFilter = ref('all')
    const applications = ref([])

    const currentUser = computed(() => store.getters['auth/currentUser'])

    const filteredApplications = computed(() => {
      if (activeFilter.value === 'all') {
        return applications.value
      }
      return applications.value.filter(app => app.status === activeFilter.value)
    })

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    }

    const fetchApplications = async () => {
      if (currentUser.value) {
        try {
          applications.value = await store.dispatch(
            'applications/fetchUserApplications',
            currentUser.value.uid
          )
          
          console.log('Fetched applications:', applications.value)
          console.log('First application:', applications.value[0])
          
          // If there are pending applications and we're on the default "all" filter,
          // switch to "pending" to highlight new applications
          if (activeFilter.value === 'all' && applications.value.some(app => app.status === 'pending')) {
            activeFilter.value = 'pending'
          }
        } catch (error) {
          console.error('Error fetching applications:', error)
        }
      }
    }

    onMounted(() => {
      fetchApplications()
    })

    // Watch for route changes to refresh applications
    watch(() => route.path, () => {
      fetchApplications()
    })

    return {
      activeFilter,
      filteredApplications,
      formatDate
    }
  }
}
</script>

<style scoped>
.applications-page {
  min-height: calc(100vh - 70px);
  background: var(--bg-light);
  padding: 40px 20px;
}

.applications-container {
  max-width: 1000px;
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

.filter-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  background: var(--bg-light);
  padding: 10px;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
}

.tab {
  flex: 1;
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
  font-size: 1.1rem;
}

.applications-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
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

.company {
  color: var(--text-muted);
  font-size: 1rem;
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
  color: var(--text);
}

.status-badge.rejected {
  background: var(--danger);
  color: var(--text);
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

.label {
  color: var(--text-muted);
  font-weight: 500;
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

@media (max-width: 768px) {
  .filter-tabs {
    flex-wrap: wrap;
  }

  .application-header {
    flex-direction: column;
    gap: 15px;
  }

  .application-actions {
    flex-direction: column;
  }

  .application-actions .btn {
    width: 100%;
  }
}
</style>


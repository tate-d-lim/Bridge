<template>
  <div class="job-details">
    <div v-if="loading" class="loading">Loading job details...</div>

    <div v-else-if="job" class="job-content">
      <!-- Job Header -->
      <div class="job-header">
        <div class="job-header-content">
          <h1>{{ job.title }}</h1>
          <div class="job-meta">
            <span class="company">🏢 {{ job.company }}</span>
            <span class="location">📍 {{ job.location }}</span>
            <span class="salary">💰 ${{ job.salary }}</span>
          </div>
          <div class="job-tags">
            <span class="tag">{{ job.category }}</span>
            <span class="tag">{{ job.type }}</span>
          </div>
        </div>
        <div class="job-actions">
          <button @click="applyForJob" class="btn btn-primary btn-large">
            Apply Now
          </button>
          <button @click="saveJob" class="btn btn-secondary">
            💾 Save
          </button>
        </div>
      </div>

      <!-- Job Description -->
      <div class="job-section">
        <h2>Job Description</h2>
        <p>{{ job.description }}</p>
      </div>

      <!-- Requirements -->
      <div class="job-section">
        <h2>Requirements</h2>
        <ul>
          <li v-for="(req, index) in job.requirements" :key="index">
            {{ req }}
          </li>
        </ul>
      </div>

      <!-- Responsibilities -->
      <div class="job-section" v-if="job.responsibilities">
        <h2>Responsibilities</h2>
        <ul>
          <li v-for="(resp, index) in job.responsibilities" :key="index">
            {{ resp }}
          </li>
        </ul>
      </div>

      <!-- Benefits -->
      <div class="job-section" v-if="job.benefits">
        <h2>Benefits</h2>
        <ul>
          <li v-for="(benefit, index) in job.benefits" :key="index">
            {{ benefit }}
          </li>
        </ul>
      </div>

      <!-- Application Form Modal -->
      <div v-if="showApplicationForm" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <h2>Apply for {{ job.title }}</h2>
          <form @submit.prevent="submitApplication">
            <div class="form-group">
              <label>Cover Letter</label>
              <textarea
                v-model="application.coverLetter"
                rows="6"
                placeholder="Tell us why you're a great fit..."
                required
              ></textarea>
            </div>

            <div class="form-group">
              <label>Resume (URL or text)</label>
              <input
                type="text"
                v-model="application.resume"
                placeholder="Paste resume URL or brief summary"
                required
              />
            </div>

            <div class="modal-actions">
              <button type="button" @click="closeModal" class="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                Submit Application
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

export default {
  name: 'JobDetails',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    
    const job = ref(null)
    const loading = ref(true)
    const showApplicationForm = ref(false)

    const application = reactive({
      coverLetter: '',
      resume: ''
    })

    const fetchJob = async () => {
      loading.value = true
      try {
        const jobData = await store.dispatch('jobs/fetchJobById', route.params.id)
        job.value = jobData
      } catch (error) {
        console.error('Error fetching job:', error)
      } finally {
        loading.value = false
      }
    }

    const applyForJob = () => {
      const isAuthenticated = store.getters['auth/isAuthenticated']
      if (!isAuthenticated) {
        router.push('/login')
        return
      }
      showApplicationForm.value = true
    }

    const saveJob = () => {
      // TODO: Implement save job functionality
      console.log('Job saved')
    }

    const submitApplication = async () => {
      try {
        const user = store.getters['auth/currentUser']
        await store.dispatch('applications/submitApplication', {
          jobId: job.value.id,
          userId: user.uid,
          coverLetter: application.coverLetter,
          resume: application.resume
        })
        
        alert('Application submitted successfully!')
        showApplicationForm.value = false
        router.push('/applications')
      } catch (error) {
        console.error('Error submitting application:', error)
        alert('Failed to submit application. Please try again.')
      }
    }

    const closeModal = () => {
      showApplicationForm.value = false
    }

    onMounted(() => {
      fetchJob()
    })

    return {
      job,
      loading,
      showApplicationForm,
      application,
      applyForJob,
      saveJob,
      submitApplication,
      closeModal
    }
  }
}
</script>

<style scoped>
.job-details {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  font-size: 1.1rem;
  color: #7f8c8d;
}

.job-header {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.job-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 15px;
}

.job-meta {
  display: flex;
  gap: 25px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.job-meta span {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.job-tags {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.tag {
  background: #e8f4f8;
  color: #3498db;
  padding: 6px 15px;
  border-radius: 20px;
  font-size: 0.9rem;
}

.job-actions {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.job-section {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 25px;
}

.job-section h2 {
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 15px;
}

.job-section p {
  color: #555;
  line-height: 1.8;
  font-size: 1.05rem;
}

.job-section ul {
  list-style: none;
  padding: 0;
}

.job-section li {
  padding: 10px 0;
  color: #555;
  border-bottom: 1px solid #f0f0f0;
}

.job-section li:before {
  content: "✓ ";
  color: #3498db;
  font-weight: bold;
  margin-right: 10px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 40px;
  border-radius: 15px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h2 {
  margin-bottom: 25px;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #2c3e50;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3498db;
}

.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 25px;
}
</style>


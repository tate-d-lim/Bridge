<template>
  <div class="post-job-page">
    <div class="post-job-container">
      <h1>Post a New Job</h1>
      <p class="subtitle">Fill in the details to create your job listing</p>

      <form @submit.prevent="handleSubmit" class="card job-form">
        <div class="form-section">
          <h2>Basic Information</h2>
          
          <div class="form-group">
            <label for="title">Job Title *</label>
            <input
              type="text"
              id="title"
              v-model="formData.title"
              placeholder="e.g., Construction Worker"
              required
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="category">Category *</label>
              <select id="category" v-model="formData.category" required>
                <option value="">Select Category</option>
                <option value="construction">Construction</option>
                <option value="hospitality">Hospitality</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="healthcare">Healthcare</option>
                <option value="logistics">Logistics</option>
              </select>
            </div>

            <div class="form-group">
              <label for="type">Job Type *</label>
              <select id="type" v-model="formData.type" required>
                <option value="">Select Type</option>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="location">Location *</label>
              <select id="location" v-model="formData.location" required>
                <option value="">Select Location</option>
                <option value="central">Central</option>
                <option value="east">East</option>
                <option value="west">West</option>
                <option value="north">North</option>
                <option value="south">South</option>
              </select>
            </div>

            <div class="form-group">
              <label for="salary">Salary (SGD) *</label>
              <input
                type="number"
                id="salary"
                v-model="formData.salary"
                placeholder="e.g., 3000"
                required
              />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h2>Job Details</h2>
          
          <div class="form-group">
            <label for="description">Job Description *</label>
            <textarea
              id="description"
              v-model="formData.description"
              rows="6"
              placeholder="Describe the role and responsibilities..."
              required
            ></textarea>
          </div>

          <div class="form-group">
            <label for="requirements">Requirements (one per line)</label>
            <textarea
              id="requirements"
              v-model="requirementsText"
              rows="4"
              placeholder="List the job requirements..."
            ></textarea>
          </div>

          <div class="form-group">
            <label for="benefits">Benefits (one per line)</label>
            <textarea
              id="benefits"
              v-model="benefitsText"
              rows="4"
              placeholder="List the benefits offered..."
            ></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" @click="$router.back()" class="btn btn-danger">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Posting...' : 'Post Job' }}
          </button>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'PostJob',
  setup() {
    const store = useStore()
    const router = useRouter()
    
    const loading = ref(false)
    const error = ref(null)
    const requirementsText = ref('')
    const benefitsText = ref('')

    const userProfile = computed(() => store.getters['auth/userProfile'])
    const currentUser = computed(() => store.getters['auth/currentUser'])

    const formData = reactive({
      title: '',
      category: '',
      type: '',
      location: '',
      salary: '',
      description: '',
      company: userProfile.value?.company || '',
      employerId: currentUser.value?.uid || ''
    })

    const handleSubmit = async () => {
      loading.value = true
      error.value = null

      try {
        const jobData = {
          ...formData,
          requirements: requirementsText.value.split('\n').filter(r => r.trim()),
          benefits: benefitsText.value.split('\n').filter(b => b.trim())
        }

        await store.dispatch('jobs/createJob', jobData)
        
        alert('Job posted successfully!')
        router.push('/employer/dashboard')
      } catch (err) {
        error.value = err.message || 'Failed to post job. Please try again.'
      } finally {
        loading.value = false
      }
    }

    return {
      formData,
      requirementsText,
      benefitsText,
      loading,
      error,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.post-job-page {
  min-height: calc(100vh - 70px);
  background: var(--bg-dark);
  padding: 40px 20px;
}

.post-job-container {
  max-width: 800px;
  margin: 0 auto;
}

.post-job-container h1 {
  font-size: 2.5rem;
  color: var(--text);
  margin-bottom: 10px;
}

.subtitle {
  color: var(--text-muted);
  margin-bottom: 30px;
  font-size: 1.1rem;
}

.job-form {
  /* Card styling handled by global .card class */
}

.form-section {
  margin-bottom: 35px;
  padding-bottom: 35px;
  border-bottom: 1px solid var(--border);
}

.form-section:last-of-type {
  border-bottom: none;
}

.form-section h2 {
  font-size: 1.5rem;
  color: var(--text);
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: var(--text);
  font-weight: 500;
}

.form-group input{
  color: var(--bg-light);
}

.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary);
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
}

.error-message {
  margin-top: 20px;
  padding: 12px;
  background: var(--danger);
  color: var(--text);
  border-radius: 8px;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>


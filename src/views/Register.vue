<template>
  <div class="auth-page">
    <div class="register-container">
      <div class="auth-card">
        <h1>Create Account</h1>
        <p class="auth-subtitle">Join Bridge today</p>

        <form @submit.prevent="handleRegister">
          <!-- User Type Selection -->
          <div class="user-type-selector">
            <button
              type="button"
              :class="['type-btn', { active: userType === 'jobseeker' }]"
              @click="userType = 'jobseeker'"
            >
              👷 Job Seeker
            </button>
            <button
              type="button"
              :class="['type-btn', { active: userType === 'employer' }]"
              @click="userType = 'employer'"
            >
              🏢 Employer
            </button>
          </div>

          <div class="form-group">
            <label for="name">Full Name</label>
            <input
              type="text"
              id="name"
              v-model="formData.name"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              v-model="formData.email"
              placeholder="Enter your email"
              required
            />
          </div>

          <div class="form-group">
            <label for="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              v-model="formData.phone"
              placeholder="Enter your phone number"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              v-model="formData.password"
              placeholder="Create a password"
              required
            />
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              v-model="confirmPassword"
              placeholder="Confirm your password"
              required
            />
          </div>

          <!-- Job Seeker Specific Fields -->
          <div v-if="userType === 'jobseeker'" class="role-specific-fields">
            <div class="form-group">
              <label for="skills">Skills (comma-separated)</label>
              <input
                type="text"
                id="skills"
                v-model="formData.skills"
                placeholder="e.g., Construction, Plumbing, Electrical"
              />
            </div>

            <div class="form-group">
              <label for="experience">Years of Experience</label>
              <input
                type="number"
                id="experience"
                v-model="formData.experience"
                placeholder="Years"
                min="0"
              />
            </div>
          </div>

          <!-- Employer Specific Fields -->
          <div v-if="userType === 'employer'" class="role-specific-fields">
            <div class="form-group">
              <label for="company">Company Name</label>
              <input
                type="text"
                id="company"
                v-model="formData.company"
                placeholder="Enter company name"
                required
              />
            </div>

            <div class="form-group">
              <label for="industry">Industry</label>
              <input
                type="text"
                id="industry"
                v-model="formData.industry"
                placeholder="e.g., Construction, Hospitality"
              />
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
            {{ loading ? 'Creating Account...' : 'Create Account' }}
          </button>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>
        </form>

        <p class="login-link">
          Already have an account? <router-link to="/login">Sign in</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'Register',
  setup() {
    const store = useStore()
    const router = useRouter()
    
    const userType = ref('jobseeker')
    const confirmPassword = ref('')
    const loading = ref(false)
    const error = ref(null)

    const formData = reactive({
      name: '',
      email: '',
      phone: '',
      password: '',
      skills: '',
      experience: '',
      company: '',
      industry: ''
    })

    const handleRegister = async () => {
      if (formData.password !== confirmPassword.value) {
        error.value = 'Passwords do not match'
        return
      }

      loading.value = true
      error.value = null

      try {
        const userData = {
          name: formData.name,
          phone: formData.phone,
          role: userType.value
        }

        if (userType.value === 'jobseeker') {
          userData.skills = formData.skills.split(',').map(s => s.trim())
          userData.experience = formData.experience
        } else {
          userData.company = formData.company
          userData.industry = formData.industry
        }

        await store.dispatch('auth/register', {
          email: formData.email,
          password: formData.password,
          userData
        })

        // Redirect based on role
        if (userType.value === 'employer') {
          router.push('/employer/dashboard')
        } else {
          router.push('/jobseeker/dashboard')
        }
      } catch (err) {
        error.value = err.message || 'Failed to create account. Please try again.'
      } finally {
        loading.value = false
      }
    }

    return {
      userType,
      formData,
      confirmPassword,
      loading,
      error,
      handleRegister
    }
  }
}
</script>

<style scoped>
/* Register page specific styles - most styles are now in external stylesheet */
</style>


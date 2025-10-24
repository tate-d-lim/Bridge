<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <h1>Welcome Back</h1>
        <p class="auth-subtitle">Sign in to continue to Bridge</p>

        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              v-model="email"
              placeholder="Enter your email"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              v-model="password"
              placeholder="Enter your password"
              required
            />
          </div>

          <div class="form-options">
            <label class="checkbox">
              <input type="checkbox" v-model="rememberMe" />
              <span>Remember me</span>
            </label>
            <a href="#" class="forgot-password">Forgot password?</a>
          </div>

          <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>
        </form>

        <div class="divider">
          <span>or</span>
        </div>

        <p class="signup-link">
          Don't have an account? <router-link to="/register">Sign up</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'Login',
  setup() {
    const store = useStore()
    const router = useRouter()
    
    const email = ref('')
    const password = ref('')
    const rememberMe = ref(false)
    const loading = ref(false)
    const error = ref(null)

    const handleLogin = async () => {
      loading.value = true
      error.value = null

      try {
        await store.dispatch('auth/login', {
          email: email.value,
          password: password.value
        })

        // Get user profile to determine redirect
        const userProfile = store.getters['auth/userProfile']
        
        if (userProfile.role === 'employer') {
          router.push('/employer/dashboard')
        } else {
          router.push('/')
        }
      } catch (err) {
        error.value = err.message || 'Failed to sign in. Please check your credentials.'
      } finally {
        loading.value = false
      }
    }

    return {
      email,
      password,
      rememberMe,
      loading,
      error,
      handleLogin
    }
  }
}
</script>

<style scoped>
/* Login page specific styles - most styles are now in external stylesheet */
.checkbox span {
  margin-left: 8px;
}
</style>


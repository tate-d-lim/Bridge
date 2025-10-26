<template>
  <div id="app">
    <NavBar />
    <main class="main-content">
      <router-view />
    </main>
    <BadgeNotification />
    <footer class="app-footer">
      <div class="footer-content">
        <div class="footer-section footer-brand">
          <div class="footer-brand-header">
            <img :src="bridgeLogo" alt="Bridge Logo" class="footer-logo" />
            <h3>Bridge</h3>
          </div>
          <p>Connecting employers with skilled migrant workers in Singapore</p>
        </div>
        <div class="footer-section">
          <h4>For Job Seekers</h4>
          <ul>
            <li><router-link to="/browse-jobs">Browse Jobs</router-link></li>
            <li><router-link to="/quizzes">Take Quizzes</router-link></li>
            <li><router-link to="/applications">My Applications</router-link></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>For Employers</h4>
          <ul>
            <li><router-link to="/employer/post-job">Post a Job</router-link></li>
            <li><router-link to="/candidates">Find Candidates</router-link></li>
            <li><router-link to="/employer/dashboard">Dashboard</router-link></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>Support</h4>
          <ul>
            <li><a href="#">Help Center</a></li>
            <li><a href="#">Contact Us</a></li>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">Privacy Policy</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2025 Bridge. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script>
import { onMounted } from 'vue'
import { useStore } from 'vuex'
import NavBar from './components/NavBar.vue'
import BadgeNotification from './components/BadgeNotification.vue'
import bridgeLogo from './assets/bridgeLogo.png'

export default {
  name: 'App',
  components: {
    NavBar,
    BadgeNotification
  },
  setup() {
    const store = useStore()

    onMounted(() => {
      // Initialize auth state listener
      store.dispatch('auth/initAuthListener')
    })

    return {
      bridgeLogo
    }
  }
}
</script>

<style>
/* App-specific styles that need to override global styles */
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}

/* Footer Styles */
.app-footer {
  background: #ffffff;
  color: #333333;
  margin-top: 60px;
}

.dark-mode .app-footer {
  background: var(--bg);
  color: var(--text);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px;
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr;
  gap: 60px;
}

.footer-brand {
  max-width: 280px;
}

.footer-brand-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.footer-logo {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.footer-brand h3 {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  color: #1a1a1a;
}

.dark-mode .footer-brand h3 {
  color: var(--text);
}

.footer-brand p {
  color: #666666;
  line-height: 1.6;
  font-size: 0.95rem;
  margin: 0;
}

.dark-mode .footer-brand p {
  color: var(--text-muted);
}

.footer-section h4 {
  font-size: 1.05rem;
  font-weight: 600;
  margin: 0 0 20px 0;
  color: #1a1a1a;
}

.dark-mode .footer-section h4 {
  color: var(--text);
}

.footer-section p {
  color: #666666;
  line-height: 1.6;
  font-size: 0.95rem;
}

.dark-mode .footer-section p {
  color: var(--text-muted);
}

.footer-section ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.footer-section li {
  margin-bottom: 12px;
}

.footer-section li:last-child {
  margin-bottom: 0;
}

.footer-section a {
  color: #666666;
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.2s;
}

.dark-mode .footer-section a {
  color: var(--text-muted);
}

.footer-section a:hover {
  color: #1a1a1a;
}

.dark-mode .footer-section a:hover {
  color: var(--primary);
}

.footer-bottom {
  border-top: 1px solid #e0e0e0;
  padding: 24px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  color: #666666;
  font-size: 0.875rem;
}

.dark-mode .footer-bottom {
  border-top: 1px solid var(--border);
  color: var(--text-muted);
}

.footer-bottom p {
  margin: 0;
}

/* Responsive */
@media (max-width: 992px) {
  .footer-content {
    grid-template-columns: 1fr 1fr;
    gap: 40px;
  }

  .footer-brand {
    max-width: 100%;
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 40px;
    padding: 50px 20px;
  }

  .footer-brand {
    grid-column: 1;
  }

  .footer-bottom {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
}
</style>

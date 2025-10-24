<template>
  <div id="app">
    <NavBar />
    <main class="main-content">
      <router-view />
    </main>
    <BadgeNotification />
    <footer class="app-footer">
      <div class="footer-content">
        <div class="footer-section">
          <h3>Bridge</h3>
          <p>Connecting employers with skilled migrant workers in Singapore</p>
        </div>
        <div class="footer-section">
          <h4>For Job Seekers</h4>
          <ul>
            <li><router-link to="/jobs">Browse Jobs</router-link></li>
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
  background: var(--bg-dark);
  color: var(--text);
  margin-top: 60px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 50px 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
}

.footer-section h3 {
  font-size: 1.5rem;
  margin-bottom: 15px;
}

.footer-section h4 {
  font-size: 1.2rem;
  margin-bottom: 15px;
}

.footer-section p {
  color: var(--text-muted);
  line-height: 1.6;
}

.footer-section ul {
  list-style: none;
}

.footer-section li {
  margin-bottom: 10px;
}

.footer-section a {
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.3s;
}

.footer-section a:hover {
  color: var(--primary);
}

.footer-bottom {
  border-top: 1px solid var(--border);
  padding: 20px;
  text-align: center;
  color: var(--text-muted);
}

/* Responsive */
@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }
}
</style>

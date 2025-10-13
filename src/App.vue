<template>
  <div id="app">
    <NavBar />
    <main class="main-content">
      <router-view />
    </main>
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

export default {
  name: 'App',
  components: {
    NavBar
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
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}

/* Button Styles */
.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
}

.btn-primary:disabled {
  background: #95a5a6;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: white;
  color: #3498db;
  border: 2px solid #3498db;
}

.btn-secondary:hover {
  background: #3498db;
  color: white;
}

.btn-block {
  width: 100%;
  display: block;
}

.btn-large {
  padding: 15px 35px;
  font-size: 1.1rem;
}

/* Footer Styles */
.app-footer {
  background: #2c3e50;
  color: white;
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
  color: #bdc3c7;
  line-height: 1.6;
}

.footer-section ul {
  list-style: none;
}

.footer-section li {
  margin-bottom: 10px;
}

.footer-section a {
  color: #bdc3c7;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-section a:hover {
  color: #3498db;
}

.footer-bottom {
  border-top: 1px solid #34495e;
  padding: 20px;
  text-align: center;
  color: #95a5a6;
}

/* Responsive */
@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }
}
</style>

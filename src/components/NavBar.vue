<template>
  <nav class="navbar">
    <div class="nav-container">
      <router-link to="/" class="nav-brand">
        <img src="../assets/bridgeLogo.png" alt="Bridge" class="nav-logo" />
      </router-link>

      <button class="nav-toggle" @click="toggleMenu" :class="{ active: menuOpen }">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div class="nav-menu" :class="{ active: menuOpen }">
        <!-- Left Side Navigation -->
        <router-link to="/reviews" class="nav-link" @click="closeMenu">
          Company Reviews
        </router-link>
        
        <!-- AI Quiz - redirects to quizzes if logged in, login if not -->
        <router-link v-if="isAuthenticated" to="/quizzes" class="nav-link" @click="closeMenu">
          AI Quiz
        </router-link>
        <router-link v-else to="/login" class="nav-link" @click="closeMenu">
          AI Quiz
        </router-link>

        <!-- Spacer to push right items to the right -->
        <div class="nav-spacer"></div>

        <!-- Authenticated User Links -->
        <template v-if="isAuthenticated">
          <!-- Messages Icon -->
          <router-link to="/chat" class="nav-link chat-icon" @click="closeMenu">
            💬
          </router-link>

          <!-- User Menu -->
          <div class="user-menu">
            <button @click="toggleUserDropdown" class="user-avatar">
              {{ userInitials }}
            </button>
            <div class="user-dropdown" :class="{ active: userDropdownOpen }">
              <router-link to="/profile" class="dropdown-item" @click="closeMenus">
                👤 Profile
              </router-link>
              <router-link v-if="isJobSeeker" to="/applications" class="dropdown-item" @click="closeMenus">
                📄 Applications
              </router-link>
              <router-link v-if="isJobSeeker" to="/jobseeker/dashboard" class="dropdown-item" @click="closeMenus">
                📊 Dashboard
              </router-link>
              <router-link v-if="isEmployer" to="/employer/dashboard" class="dropdown-item" @click="closeMenus">
                📊 Dashboard
              </router-link>
              <button @click="handleLogout" class="dropdown-item">
                🚪 Logout
              </button>
            </div>
          </div>
        </template>

        <!-- Guest Links -->
        <template v-else>
          <router-link to="/login" class="nav-link" @click="closeMenu">
            Login
          </router-link>
          <router-link to="/register" class="btn btn-primary" @click="closeMenu">
            Sign Up
          </router-link>
        </template>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'NavBar',
  setup() {
    const store = useStore()
    const router = useRouter()
    
    const menuOpen = ref(false)
    const userDropdownOpen = ref(false)

    const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])
    const isJobSeeker = computed(() => store.getters['auth/isJobSeeker'])
    const isEmployer = computed(() => store.getters['auth/isEmployer'])
    const userProfile = computed(() => store.getters['auth/userProfile'])

    const userInitials = computed(() => {
      if (!userProfile.value?.name) return '?'
      return userProfile.value.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    })

    const toggleMenu = () => {
      menuOpen.value = !menuOpen.value
    }

    const closeMenu = () => {
      menuOpen.value = false
    }

    const toggleUserDropdown = () => {
      userDropdownOpen.value = !userDropdownOpen.value
    }

    const closeMenus = () => {
      menuOpen.value = false
      userDropdownOpen.value = false
    }

    const handleLogout = async () => {
      try {
        await store.dispatch('auth/logout')
        closeMenus()
        router.push('/')
      } catch (error) {
        console.error('Logout error:', error)
      }
    }

    return {
      menuOpen,
      userDropdownOpen,
      isAuthenticated,
      isJobSeeker,
      isEmployer,
      userInitials,
      toggleMenu,
      closeMenu,
      toggleUserDropdown,
      closeMenus,
      handleLogout
    }
  }
}
</script>

<style scoped>
.navbar {
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 700;
}

.nav-logo {
  height: 60px;
  width: auto;
  margin-right: 20px;
}

.nav-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
}

.nav-toggle span {
  width: 25px;
  height: 3px;
  background: #2c3e50;
  transition: all 0.3s;
}

.nav-toggle.active span:nth-child(1) {
  transform: rotate(45deg) translate(7px, 7px);
}

.nav-toggle.active span:nth-child(2) {
  opacity: 0;
}

.nav-toggle.active span:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -7px);
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 25px;
  flex: 1;
}

.nav-link {
  text-decoration: none;
  color: #2c3e50;
  font-weight: 500;
  font-size: 1rem;
  transition: color 0.3s;
}

.nav-link:hover {
  color: #3498db;
}

.nav-link.router-link-active {
  color: #3498db;
}

.chat-icon {
  font-size: 1.5rem;
  display: flex;
  align-items: center;
}

.nav-spacer {
  flex: 1;
}

.user-menu {
  position: relative;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  cursor: pointer;
  font-weight: bold;
  transition: transform 0.3s;
}

.user-avatar:hover {
  transform: scale(1.1);
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 10px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
  min-width: 150px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s;
}

.user-dropdown.active {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 12px 20px;
  text-decoration: none;
  color: #2c3e50;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.3s;
  font-size: 1rem;
}

.dropdown-item:hover {
  background: #f8f9fa;
}

@media (max-width: 768px) {
  .nav-toggle {
    display: flex;
  }

  .nav-menu {
    position: fixed;
    top: 70px;
    left: 0;
    right: 0;
    background: white;
    flex-direction: column;
    align-items: stretch;
    padding: 20px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s;
  }

  .nav-menu.active {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }

  .nav-link,
  .btn {
    padding: 12px 0;
    text-align: center;
  }

  .user-menu {
    width: 100%;
  }

  .user-avatar {
    width: 100%;
    height: 50px;
    border-radius: 8px;
  }

  .user-dropdown {
    position: static;
    margin-top: 10px;
    box-shadow: none;
    border: 1px solid #e0e0e0;
  }

  .nav-spacer {
    display: none;
  }
}
</style>

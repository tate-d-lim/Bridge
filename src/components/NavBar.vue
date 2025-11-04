<template>
  <nav class="navbar">
    <div class="nav-container">
      <router-link :to="getHomeRoute" class="nav-brand">
        <img v-if="isDarkMode" src="../assets/logo-black.png" alt="Bridge" class="nav-logo" />
        <img v-else src="../assets/bridgeLogo.png" alt="Bridge" class="nav-logo" />
      </router-link>

      <button class="nav-toggle" @click="toggleMenu" :class="{ active: menuOpen }">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div class="nav-menu" :class="{ active: menuOpen }">
        <!-- Close button for mobile menu -->
        <button class="menu-close" @click="closeMenu">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <!-- Left Side Navigation Links -->
        <div class="nav-links-section">
          <template v-if="isAuthenticated">
            <!-- Home Link -->
            <router-link :to="getHomeRoute" class="nav-link" @click="closeMenu">
              Home
            </router-link>

            <!-- Job Seeker-specific links -->
            <template v-if="isJobSeeker">
              <router-link to="/browse-jobs" class="nav-link" @click="closeMenu">
                Browse Jobs
              </router-link>
              <router-link to="/reviews" class="nav-link" @click="closeMenu">
                Company Reviews
              </router-link>
              <router-link to="/quizzes" class="nav-link" @click="closeMenu">
                AI Quiz
              </router-link>
            </template>

            <!-- Employer-specific links -->
            <template v-if="isEmployer">
              <router-link to="/employer/post-job" class="nav-link" @click="closeMenu">
                Post Job
              </router-link>
              <router-link to="/candidates" class="nav-link" @click="closeMenu">
                Browse Candidates
              </router-link>
            </template>
          </template>

          <!-- Non-authenticated user navigation -->
          <template v-else>
            <router-link to="/" class="nav-link" @click="closeMenu">
              Home
            </router-link>
            <router-link to="/browse-jobs" class="nav-link" @click="closeMenu">
              Browse Jobs
            </router-link>
          </template>
        </div>

        <!-- Spacer to push right items to the right -->
        <div class="nav-spacer"></div>

        <!-- Right Side Controls -->
        <div class="nav-controls-section">
          <template v-if="isAuthenticated">
            <!-- Dark Mode Toggle -->
            <button @click="toggleDarkMode" class="dark-mode-toggle mobile-control-item" title="Toggle Dark Mode">
              <img v-if="isDarkMode" src="../assets/sun-white.svg" alt="Light Mode" class="toggle-icon" />
              <img v-else src="../assets/moon-black.svg" alt="Dark Mode" class="toggle-icon" />
              <span class="control-label">{{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}</span>
            </button>

            <!-- Messages Icon -->
            <router-link to="/chat" class="nav-link chat-icon mobile-control-item" @click="closeMenu">
              <div class="chat-icon-wrapper">
                <img v-if="isDarkMode" src="../assets/darkModeMessages.png" alt="Messages" class="envelope-icon" />
                <img v-else src="../assets/messages-light.svg" alt="Messages" class="envelope-icon" />
                <span v-if="totalUnreadCount > 0" class="unread-badge-nav">{{ totalUnreadCount > 99 ? '99+' : totalUnreadCount }}</span>
              </div>
              <span class="control-label">Messages</span>
            </router-link>

            <!-- User Profile Section (Mobile) -->
            <div class="mobile-user-section">
              <div class="mobile-user-header">
                <div class="user-avatar-mobile">
                  <img 
                    v-if="userProfile?.photoURL" 
                    :src="userProfile.photoURL" 
                    :alt="userProfile.name"
                    class="avatar-image"
                  />
                  <span v-else>{{ userInitials }}</span>
                </div>
                <div class="user-info">
                  <span class="user-name">{{ userProfile?.name || 'User' }}</span>
                  <span class="user-type">{{ isJobSeeker ? 'Job Seeker' : 'Employer' }}</span>
                </div>
              </div>
              
              <div class="mobile-user-links">
                <router-link to="/profile" class="dropdown-item" @click="closeMenu">
                  <img v-if="isDarkMode" src="../assets/userDark.png" alt="" class="dropdown-icon" />
                  <img v-else src="../assets/user.svg" alt="" class="dropdown-icon" />
                  Profile
                </router-link>
                <router-link v-if="isJobSeeker" to="/achievements" class="dropdown-item" @click="closeMenu">
                  <img src="../assets/trophy-star.svg" alt="" class="dropdown-icon" />
                  Achievements
                </router-link>
                <router-link v-if="isJobSeeker" to="/applications" class="dropdown-item" @click="closeMenu">
                  <img src="../assets/briefcase.svg" alt="" class="dropdown-icon" /> Applications
                </router-link>
                <router-link v-if="isEmployer" to="/employer/applications" class="dropdown-item" @click="closeMenu">
                  <img src="../assets/task-checklist.svg" alt="" class="dropdown-icon" /> Applications
                </router-link>
                <button @click="handleLogout" class="dropdown-item">
                  <img v-if="isDarkMode" src="../assets/user-logout-dark.png" alt="" class="dropdown-icon" />
                  <img v-else src="../assets/user-logout.svg" alt="" class="dropdown-icon" />
                  Logout
                </button>
              </div>
            </div>

            <!-- User Menu (Desktop) -->
            <div class="user-menu">
              <button @click="toggleUserDropdown" class="user-avatar">
                <img 
                  v-if="userProfile?.photoURL" 
                  :src="userProfile.photoURL" 
                  :alt="userProfile.name"
                  class="avatar-image"
                />
                <span v-else>{{ userInitials }}</span>
              </button>
              <div class="user-dropdown" :class="{ active: userDropdownOpen }">
                <router-link to="/profile" class="dropdown-item" @click="closeMenus">
                  <img v-if="isDarkMode" src="../assets/userDark.png" alt="" class="dropdown-icon" />
                  <img v-else src="../assets/user.svg" alt="" class="dropdown-icon" />
                  Profile
                </router-link>
                <router-link v-if="isJobSeeker" to="/achievements" class="dropdown-item" @click="closeMenus">
                  <img src="../assets/trophy-star.svg" alt="" class="dropdown-icon" />
                  Achievements
                </router-link>
                <router-link v-if="isJobSeeker" to="/applications" class="dropdown-item" @click="closeMenus">
                  <img src="../assets/briefcase.svg" alt="" class="dropdown-icon" /> Applications
                </router-link>
                <router-link v-if="isEmployer" to="/employer/applications" class="dropdown-item" @click="closeMenus">
                  <img src="../assets/task-checklist.svg" alt="" class="dropdown-icon" /> Applications
                </router-link>
                <button @click="handleLogout" class="dropdown-item">
                  <img v-if="isDarkMode" src="../assets/user-logout-dark.png" alt="" class="dropdown-icon" />
                  <img v-else src="../assets/user-logout.svg" alt="" class="dropdown-icon" />
                  Logout
                </button>
              </div>
            </div>
          </template>

          <!-- Guest Right Side Controls -->
          <template v-else>
            <!-- Dark Mode Toggle for guests -->
            <button @click="toggleDarkMode" class="dark-mode-toggle mobile-control-item" title="Toggle Dark Mode">
              <img v-if="isDarkMode" src="../assets/sun-white.svg" alt="Light Mode" class="toggle-icon" />
              <img v-else src="../assets/moon-black.svg" alt="Dark Mode" class="toggle-icon" />
              <span class="control-label">{{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}</span>
            </button>
            
            <router-link to="/login" class="nav-link" @click="closeMenu">
              Login
            </router-link>
            <router-link to="/register" class="nav-link nav-link-signup" @click="closeMenu">
              Sign Up
            </router-link>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'NavBar',
  setup() {
    const store = useStore()
    const router = useRouter()
    
    const menuOpen = ref(false)
    const userDropdownOpen = ref(false)
    const navDropdownOpen = ref(false)
    const isDarkMode = ref(false)

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

    // Calculate total unread message count
    // Access unreadCounts directly from state to ensure reactivity
    const totalUnreadCount = computed(() => {
      if (!isAuthenticated.value) return 0
      
      // Get all chat rooms from store
      const chatRooms = store.getters['chatAbly/chatRooms'] || []
      
      // Get unreadCounts Map from state (accessing the Map itself ensures reactivity)
      const unreadCounts = store.state.chatAbly.unreadCounts
      if (!unreadCounts || !(unreadCounts instanceof Map)) {
        return 0
      }
      
      // Sum up unread counts for all rooms
      // Accessing Map.size and iterating ensures Vue tracks changes
      let total = 0
      for (const room of chatRooms) {
        // Access the Map value - Vue will track this access
        const count = unreadCounts.get(room.id) || 0
        total += count
      }
      
      // Also check for temporary unread counts stored with roomName (for rooms being created)
      // Iterate through all entries in the Map to ensure Vue tracks all changes
      for (const [key, value] of unreadCounts.entries()) {
        // If key is a roomName (starts with 'chat_') and not already counted, add it
        if (typeof key === 'string' && key.startsWith('chat_') && !chatRooms.some(r => r.id === key || r.roomName === key)) {
          total += value || 0
        }
      }
      
      // Force Vue to track the Map by accessing its size property
      // This ensures reactivity when Map is replaced with a new instance
      const mapSize = unreadCounts.size
      
      return total
    })

    const getHomeRoute = computed(() => {
      if (isAuthenticated.value) {
        if (isEmployer.value) {
          return '/employer/dashboard'
        } else if (isJobSeeker.value) {
          return '/'
        }
      }
      return '/'
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

    const toggleNavDropdown = () => {
      navDropdownOpen.value = !navDropdownOpen.value
    }

    const closeMenus = () => {
      menuOpen.value = false
      userDropdownOpen.value = false
      navDropdownOpen.value = false
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

    const toggleDarkMode = () => {
      isDarkMode.value = !isDarkMode.value
      if (isDarkMode.value) {
        document.documentElement.classList.add('dark-mode')
        localStorage.setItem('darkMode', 'true')
      } else {
        document.documentElement.classList.remove('dark-mode')
        localStorage.setItem('darkMode', 'false')
      }
    }

    onMounted(() => {
      // Check for saved dark mode preference
      const savedDarkMode = localStorage.getItem('darkMode')
      if (savedDarkMode === 'true') {
        isDarkMode.value = true
        document.documentElement.classList.add('dark-mode')
      }
    })

    return {
      menuOpen,
      userDropdownOpen,
      navDropdownOpen,
      isDarkMode,
      isAuthenticated,
      isJobSeeker,
      isEmployer,
      userProfile,
      userInitials,
      getHomeRoute,
      totalUnreadCount,
      toggleMenu,
      closeMenu,
      toggleUserDropdown,
      toggleNavDropdown,
      closeMenus,
      handleLogout,
      toggleDarkMode
    }
  }
}
</script>

<style scoped>
.navbar {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: background-color 0.3s, border-color 0.3s, backdrop-filter 0.3s;
}

/* Dark mode backdrop blur */
.dark-mode .navbar {
  background: rgba(0, 0, 0, 0.95);
}

.nav-container {
  width: 100%;
  padding: 0px 20px;
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
  color: var(--text);
  font-size: 1.5rem;
  font-weight: 700;
  transition: color 0.3s;
}

.nav-logo {
  height: 60px;
  width: auto;
  margin-right: 20px;
  transition: opacity 0.3s ease 0.5s;
}

.nav-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  z-index: 102;
}

.nav-toggle span {
  width: 25px;
  height: 3px;
  background: var(--text);
  transition: all 0.3s;
}

/* Ensure hamburger is visible in light mode */
.nav-toggle span {
  background: #333333;
}

.dark-mode .nav-toggle span {
  background: #ffffff;
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

.nav-links-section {
  display: contents;
}

.nav-controls-section {
  display: contents;
}

.nav-link {
  text-decoration: none;
  color: var(--text);
  font-weight: 500;
  font-size: 1rem;
  transition: color 0.3s;
}

.nav-link:hover {
  color: var(--primary);
}

.nav-link.router-link-active {
  color: var(--primary);
}

.chat-icon {
  display: flex;
  align-items: center;
  position: relative;
}

.chat-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.envelope-icon {
  width: 24px;
  height: 24px;
  fill: currentColor;
  transition: transform 0.3s;
}

.chat-icon:hover .envelope-icon {
  transform: scale(1.1);
}

.unread-badge-nav {
  position: absolute;
  top: -6px;
  right: -6px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  border-radius: 50%;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: bold;
  padding: 0 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  border: 2px solid var(--bg);
  z-index: 10;
  animation: pulse-badge-nav 2s infinite;
}

.dark-mode .unread-badge-nav {
  border-color: rgba(255, 255, 255, 0.1);
}

@keyframes pulse-badge-nav {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.dark-mode-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px 10px;
  transition: transform 0.3s;
  display: flex;
  align-items: center;
}

.dark-mode-toggle:hover {
  transform: scale(1.1);
}

.toggle-icon {
  width: 24px;
  height: 24px;
  fill: currentColor;
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
  background: transparent;
  color: var(--text);
  border: 2px solid var(--border);
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.user-avatar .avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Only show border when no image */
.user-avatar:not(:has(.avatar-image)) {
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  border: none;
}

.user-avatar:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.dark-mode .user-avatar {
  border-color: rgba(255, 255, 255, 0.2);
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 10px;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  min-width: 180px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s;
  overflow: hidden;
}

.dark-mode .user-dropdown {
  background: #1a1a1a;
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.user-dropdown.active {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 20px;
  text-decoration: none;
  color: #333333;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  font-size: 0.95rem;
  font-weight: 500;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

.dark-mode .dropdown-item {
  color: #ffffff;
}

.dark-mode .dropdown-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.dropdown-icon {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

/* Make SVG icons white in dark mode */
.dark-mode .dropdown-item img[src*="trophy-star"],
.dark-mode .dropdown-item img[src*="briefcase"],
.dark-mode .dropdown-item img[src*="task-checklist"] {
  filter: brightness(0) invert(1);
}

.nav-hamburger-menu {
  position: relative;
}

.hamburger-button {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  transition: transform 0.3s;
}

.hamburger-button:hover {
  transform: scale(1.1);
}

.hamburger-button span {
  width: 22px;
  height: 2.5px;
  background: var(--text);
  transition: all 0.3s;
  border-radius: 2px;
}

.nav-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 10px;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  min-width: 200px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s;
  overflow: hidden;
}

.dark-mode .nav-dropdown {
  background: #1a1a1a;
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.nav-dropdown.active {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

@media (max-width: 768px) {
  .nav-container {
    padding: 0 20px;
  }

  .nav-toggle {
    display: flex;
    z-index: 102;
  }

  /* Hide hamburger when menu is open */
  .nav-toggle.active {
    opacity: 0;
    pointer-events: none;
  }

  .nav-menu {
    position: fixed;
    top: 0;
    right: 0;
    width: 280px;
    height: 100vh;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-left: 1px solid var(--border);
    flex-direction: column;
    align-items: stretch;
    padding: 80px 20px 20px 20px;
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
    transform: translateX(100%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow-y: auto;
    z-index: 101;
  }

  .dark-mode .nav-menu {
    background: rgba(0, 0, 0, 0.98);
    border-left-color: rgba(255, 255, 255, 0.1);
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.4);
  }

  .nav-menu.active {
    transform: translateX(0);
    opacity: 1;
    visibility: visible;
  }

  .nav-links-section {
    display: flex;
    flex-direction: column;
    gap: 0;
    width: 100%;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border);
  }

  .nav-controls-section {
    display: flex;
    flex-direction: column;
    gap: 0;
    width: 100%;
    padding-top: 20px;
  }

  .nav-link {
    padding: 14px 16px;
    text-align: left;
    border-radius: 8px;
    margin-bottom: 4px;
    transition: background 0.2s;
  }

  .nav-link:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  .dark-mode .nav-link:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .nav-link-signup {
    margin-top: 8px;
    text-align: center;
  }

  .dark-mode-toggle {
    width: 100%;
    justify-content: flex-start;
    padding: 14px 16px;
    border-radius: 8px;
    margin-bottom: 4px;
  }

  .dark-mode-toggle:hover {
    background: rgba(0, 0, 0, 0.05);
    transform: none;
  }

  .dark-mode .dark-mode-toggle:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .chat-icon {
    padding: 14px 16px;
    border-radius: 8px;
    margin-bottom: 4px;
    justify-content: flex-start;
  }

  .chat-icon:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  .dark-mode .chat-icon:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .user-menu {
    width: 100%;
  }

  .user-avatar {
    width: 100%;
    height: 50px;
    border-radius: 8px;
    justify-content: flex-start;
    gap: 12px;
    padding-left: 16px;
    margin-bottom: 4px;
  }

  .user-avatar .avatar-image {
    width: 36px;
    height: 36px;
    border-radius: 50%;
  }

  /* Add text label next to avatar on mobile */
  .user-avatar::after {
    content: 'Account';
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--text);
  }

  .user-avatar:not(:has(.avatar-image)) {
    background: transparent;
    border: 1px solid var(--border);
  }

  .user-avatar:not(:has(.avatar-image))::before {
    content: '';
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
  }

  .user-dropdown {
    position: static;
    margin-top: 8px;
    box-shadow: none;
    border: 1px solid var(--border);
    transform: none;
  }

  .user-dropdown.active {
    transform: none;
  }

  .nav-spacer {
    display: none;
  }

  /* Backdrop overlay for mobile menu */
  .nav-menu::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 280px;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s;
    pointer-events: none;
  }

  .nav-menu.active::before {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }
}

/* Tablet size adjustments */
@media (max-width: 1024px) and (min-width: 769px) {
  .nav-menu {
    gap: 15px;
  }

  .nav-container {
    padding: 0 30px;
  }
}

.menu-close {
  display: none;
}

.control-label {
  display: none;
}

.mobile-user-section {
  display: none;
}

@media (max-width: 768px) {
  .menu-close {
    display: flex;
    position: absolute;
    top: 20px;
    right: 20px;
    background: none;
    border: none;
    color: var(--text);
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: background 0.2s;
    z-index: 103;
  }

  .menu-close:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  .dark-mode .menu-close:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .menu-close svg {
    width: 24px;
    height: 24px;
  }

  .mobile-control-item {
    display: flex !important;
    align-items: center;
    gap: 12px;
  }

  .control-label {
    display: inline;
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--text);
  }

  .dark-mode-toggle {
    width: 100%;
    justify-content: flex-start;
    padding: 14px 16px;
    border-radius: 8px;
    margin-bottom: 4px;
  }

  .chat-icon {
    padding: 14px 16px;
    border-radius: 8px;
    margin-bottom: 4px;
    justify-content: flex-start;
  }

  .chat-icon-wrapper {
    display: flex;
    align-items: center;
  }

  /* Mobile User Section */
  .mobile-user-section {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding-top: 20px;
    border-top: 1px solid var(--border);
    margin-top: 20px;
  }

  .mobile-user-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: rgba(0, 0, 0, 0.02);
    border-radius: 12px;
    margin-bottom: 12px;
  }

  .dark-mode .mobile-user-header {
    background: rgba(255, 255, 255, 0.05);
  }

  .user-avatar-mobile {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1.2rem;
    overflow: hidden;
    flex-shrink: 0;
  }

  .user-avatar-mobile .avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .user-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
    min-width: 0;
  }

  .user-name {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-type {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  .mobile-user-links {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .mobile-user-links .dropdown-item {
    padding: 14px 16px;
    border-radius: 8px;
    transition: background 0.2s;
  }

  .mobile-user-links .dropdown-item:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  .dark-mode .mobile-user-links .dropdown-item:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  /* Hide desktop user menu on mobile */
  .user-menu {
    display: none;
  }

  /* Remove old mobile avatar styles */
  .user-avatar::after {
    display: none;
  }
}

/* Desktop - hide mobile elements */
@media (min-width: 769px) {
  .mobile-user-section {
    display: none !important;
  }

  .control-label {
    display: none !important;
  }

  .menu-close {
    display: none !important;
  }
}
</style>

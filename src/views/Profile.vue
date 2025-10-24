<template>
  <div class="profile-page">
    <div class="profile-container">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <p>Loading profile...</p>
      </div>
      
      <!-- Profile Content -->
      <div v-else-if="userProfile">
      <div class="profile-header">
        <div class="avatar">
          <span>{{ getInitials }}</span>
        </div>
        <div class="header-info">
          <h1>{{ userProfile?.name || 'User Profile' }}</h1>
          <p v-if="userProfile?.role === 'jobseeker'">
            {{ userProfile?.experience }} years of experience
          </p>
          <p v-else>{{ userProfile?.company }}</p>
        </div>
        <button v-if="!isViewingOtherProfile" @click="editing = !editing" class="btn btn-primary">
          {{ editing ? 'Cancel' : 'Edit Profile' }}
        </button>
      </div>

      <!-- Job Seeker Profile -->
      <div v-if="userProfile?.role === 'jobseeker'" class="profile-content">
        <div class="profile-section">
          <h2>Personal Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <label>Email</label>
              <p>{{ userProfile?.email }}</p>
            </div>
            <div class="info-item">
              <label>Phone</label>
              <p>{{ userProfile?.phone }}</p>
            </div>
          </div>
        </div>

        <div class="profile-section">
          <h2>Skills</h2>
          <div class="skills-container">
            <span v-for="skill in userProfile?.skills" :key="skill" class="skill-tag">
              {{ skill }}
            </span>
          </div>
        </div>

        <div class="profile-section">
          <h2>Badges & Certifications</h2>
          <div class="badges-container">
            <div class="badge-item" v-for="badge in badges" :key="badge.id">
              <span class="badge-icon">🏆</span>
              <div>
                <h3>{{ badge.skill }}</h3>
                <p>{{ badge.level }} Level</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Applications (for job seekers) -->
        <div class="profile-section">
          <h2>Recent Applications</h2>
          <div class="empty-state">
            <p>You haven't applied to any jobs yet.</p>
            <router-link to="/" class="btn btn-primary">Browse Jobs</router-link>
          </div>
        </div>
      </div>

      <!-- Employer Profile -->
      <div v-else class="profile-content">
        <div class="profile-section">
          <h2>Company Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <label>Company Name</label>
              <p>{{ userProfile?.company }}</p>
            </div>
            <div class="info-item">
              <label>Industry</label>
              <p>{{ userProfile?.industry }}</p>
            </div>
            <div class="info-item">
              <label>Email</label>
              <p>{{ userProfile?.email }}</p>
            </div>
            <div class="info-item">
              <label>Phone</label>
              <p>{{ userProfile?.phone }}</p>
            </div>
          </div>
        </div>

        <!-- Recent Applications (for employers) -->
        <div v-if="userProfile?.role === 'employer'" class="profile-section">
          <h2>Recent Applications</h2>
          <div class="empty-state">
            <p>No applications yet.</p>
          </div>
        </div>
      </div>
      
      <!-- Error State -->
      <div v-else class="error-state">
        <p>Profile not found.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { db } from '../firebase/config'
import { doc, getDoc } from 'firebase/firestore'

export default {
  name: 'Profile',
  setup() {
    const store = useStore()
    const route = useRoute()
    const editing = ref(false)
    const badges = ref([])
    const viewedProfile = ref(null)
    const loading = ref(false)

    const currentUser = computed(() => store.getters['auth/currentUser'])
    const currentUserProfile = computed(() => store.getters['auth/userProfile'])
    
    // Determine if we're viewing someone else's profile
    const isViewingOtherProfile = computed(() => {
      return route.params.id && route.params.id !== currentUser.value?.uid
    })
    
    // Use viewed profile if viewing someone else, otherwise use current user's profile
    const userProfile = computed(() => {
      return isViewingOtherProfile.value ? viewedProfile.value : currentUserProfile.value
    })

    const getInitials = computed(() => {
      if (!userProfile.value?.name) return '?'
      return userProfile.value.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    })

    const fetchViewedProfile = async (userId) => {
      loading.value = true
      try {
        const userDoc = await getDoc(doc(db, 'users', userId))
        if (userDoc.exists()) {
          viewedProfile.value = { id: userDoc.id, ...userDoc.data() }
        } else {
          console.error('User profile not found')
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
      } finally {
        loading.value = false
      }
    }

    onMounted(async () => {
      // If viewing someone else's profile, fetch their data
      if (isViewingOtherProfile.value) {
        await fetchViewedProfile(route.params.id)
      }
      
      // Fetch badges for job seekers (current user or viewed profile)
      if (userProfile.value?.role === 'jobseeker') {
        const userId = isViewingOtherProfile.value ? route.params.id : currentUser.value?.uid
        if (userId) {
          try {
            badges.value = await store.dispatch('quizzes/fetchUserBadges', userId)
          } catch (error) {
            console.error('Error fetching badges:', error)
          }
        }
      }
    })

    return {
      editing,
      userProfile,
      badges,
      getInitials,
      isViewingOtherProfile,
      loading
    }
  }
}
</script>

<style scoped>
/* Profile page specific styles - most styles are now in external stylesheet */
</style>


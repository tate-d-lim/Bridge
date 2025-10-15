<template>
  <div class="profile-page">
    <div class="profile-container">
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
        <button @click="editing = !editing" class="btn btn-primary">
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
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'Profile',
  setup() {
    const store = useStore()
    const editing = ref(false)
    const badges = ref([])

    const userProfile = computed(() => store.getters['auth/userProfile'])
    const currentUser = computed(() => store.getters['auth/currentUser'])

    const getInitials = computed(() => {
      if (!userProfile.value?.name) return '?'
      return userProfile.value.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    })

    onMounted(async () => {
      if (userProfile.value?.role === 'jobseeker' && currentUser.value) {
        try {
          badges.value = await store.dispatch('quizzes/fetchUserBadges', currentUser.value.uid)
        } catch (error) {
          console.error('Error fetching badges:', error)
        }
      }
    })

    return {
      editing,
      userProfile,
      badges,
      getInitials
    }
  }
}
</script>

<style scoped>
/* Profile page specific styles - most styles are now in external stylesheet */
</style>


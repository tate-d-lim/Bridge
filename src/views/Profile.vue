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
.profile-page {
  min-height: calc(100vh - 70px);
  background: #f8f9fa;
  padding: 40px 20px;
}

.profile-container {
  max-width: 900px;
  margin: 0 auto;
}

.profile-header {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 25px;
  margin-bottom: 30px;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2.5rem;
  font-weight: bold;
}

.header-info {
  flex: 1;
}

.header-info h1 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 5px;
}

.header-info p {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.profile-section {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 25px;
}

.profile-section h2 {
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.info-item label {
  display: block;
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 5px;
  font-weight: 600;
}

.info-item p {
  color: #2c3e50;
  font-size: 1.1rem;
}

.skills-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.skill-tag {
  background: #e8f4f8;
  color: #3498db;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.95rem;
}

.badges-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.badge-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
}

.badge-icon {
  font-size: 2.5rem;
}

.badge-item h3 {
  font-size: 1.1rem;
  color: #2c3e50;
  margin-bottom: 3px;
}

.badge-item p {
  color: #7f8c8d;
  font-size: 0.9rem;
}
</style>


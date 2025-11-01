<template>
  <div class="profile-page">
    <div class="profile-container">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <p>Loading profile...</p>
      </div>
      
      <!-- Profile Content -->
      <div v-else-if="userProfile" class="profile-wrapper">
        <!-- Profile Header -->
        <div class="profile-header-card">
          <div class="header-main">
            <div class="avatar-section">
              <div class="avatar-wrapper">
                <div class="avatar">
                  <img 
                    v-if="photoPreviewUrl || userProfile?.photoURL" 
                    :src="photoPreviewUrl || userProfile?.photoURL" 
                    :alt="userProfile?.name"
                    class="avatar-image"
                  />
                  <span v-else class="avatar-initials">{{ getInitials }}</span>
                </div>
                <input 
                  ref="fileInput"
                  type="file" 
                  accept="image/jpeg,image/jpg,image/png"
                  @change="handleFileUpload"
                  style="display: none"
                />
              </div>
              <div v-if="!isViewingOtherProfile && editing" class="avatar-actions">
                <p v-if="uploadError" class="inline-error">{{ uploadError }}</p>
                <div class="photo-buttons">
                  <button 
                    @click="triggerFileInput"
                    class="btn-add-photo"
                    :disabled="uploadingPhoto"
                  >
                    <img src="../assets/add-profile-picture.svg" alt="" class="btn-icon" />
                    {{ userProfile?.photoURL || photoPreviewUrl ? 'Change Photo' : 'Add Photo' }}
                  </button>
                  <button 
                    v-if="userProfile?.photoURL || photoPreviewUrl"
                    @click="removePhoto"
                    class="btn-remove-photo"
                    :disabled="uploadingPhoto"
                  >
                    <img src="../assets/trash.svg" alt="" class="btn-icon" />
                    Remove
                  </button>
                </div>
              </div>
            </div>

            <div class="header-info">
              <div class="name-section">
                <h1>{{ userProfile?.name || 'User Profile' }}</h1>
                <div class="role-badge" :class="userProfile?.role">
                  {{ userProfile?.role === 'jobseeker' ? 'Job Seeker' : 'Employer' }}
                </div>
              </div>
              <p class="subtitle">
                <span v-if="userProfile?.role === 'jobseeker'">
                  {{ userProfile?.experience || 0 }} years of experience
                </span>
                <span v-else>{{ userProfile?.company || 'No company' }}</span>
              </p>
            </div>

            <div v-if="!isViewingOtherProfile" class="header-actions">
              <button v-if="!editing" @click="startEditing" class="btn-edit">
                Edit Profile
              </button>
              <div v-else class="edit-buttons">
                <button @click="saveProfile" :disabled="savingProfile" class="btn-save">
                  {{ savingProfile ? 'Saving...' : 'Save' }}
                </button>
                <button @click="cancelEditing" class="btn-cancel">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <p v-if="editing && saveError" class="error-banner">{{ saveError }}</p>

        <!-- Stats Card (Job Seekers Only) -->
        <div v-if="userProfile?.role === 'jobseeker'" class="stats-card">
          <div class="stats-grid">
            <div class="stat-box">
              <img src="../assets/trophy.svg" alt="Trophy" class="stat-icon-img" />
              <div class="stat-content">
                <div class="stat-value">{{ earnedBadges.length }}</div>
                <div class="stat-label">Total Badges</div>
              </div>
            </div>
            <div class="stat-box">
              <img src="../assets/checkmark.svg" alt="Checkmark" class="stat-icon-img" />
              <div class="stat-content">
                <div class="stat-value">{{ userStats?.totalWins || 0 }}</div>
                <div class="stat-label">Quiz Wins</div>
              </div>
            </div>
            <div class="stat-box">
              <img src="../assets/chart.svg" alt="Chart" class="stat-icon-img" />
              <div class="stat-content">
                <div class="stat-value">{{ userStats?.winPercentage || 0 }}%</div>
                <div class="stat-label">Win Rate</div>
              </div>
            </div>
            <div class="stat-box">
              <img src="../assets/flame.svg" alt="Flame" class="stat-icon-img" />
              <div class="stat-content">
                <div class="stat-value">{{ userStats?.currentDayStreak || 0 }}</div>
                <div class="stat-label">Day Streak</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabs Navigation -->
        <div class="tabs-container">
          <div class="tabs-nav">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              :class="['tab-button', { active: activeTab === tab.id }]"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- Tab Content -->
          <div class="tabs-content">
            <!-- Overview Tab -->
            <div v-if="activeTab === 'overview'" class="tab-panel">
              <!-- Personal Information Section -->
              <div class="section-card">
                <h2 class="section-title">Personal Information</h2>
                <div class="info-grid">
                  <div class="info-item">
                    <label>Name</label>
                    <input 
                      v-if="editing" 
                      v-model="editableFields.name"
                      type="text" 
                      class="edit-input"
                      placeholder="Enter your name"
                    />
                    <p v-else>{{ userProfile?.name }}</p>
                  </div>
                  <div class="info-item">
                    <label>Email</label>
                    <p class="readonly-field">{{ userProfile?.email }}</p>
                  </div>
                  <div class="info-item">
                    <label>{{ userProfile?.role === 'jobseeker' ? 'Phone' : 'Contact Phone' }}</label>
                    <input 
                      v-if="editing" 
                      v-model="editableFields.phone"
                      type="tel" 
                      class="edit-input"
                      placeholder="Enter phone number"
                    />
                    <p v-else>{{ userProfile?.phone || 'Not provided' }}</p>
                  </div>
                  <div v-if="userProfile?.role === 'jobseeker'" class="info-item">
                    <label>Experience (years)</label>
                    <input 
                      v-if="editing" 
                      v-model="editableFields.experience"
                      type="number" 
                      min="0"
                      class="edit-input"
                      placeholder="Years of experience"
                    />
                    <p v-else>{{ userProfile?.experience || 0 }}</p>
                  </div>
                  <div v-if="userProfile?.role === 'employer'" class="info-item">
                    <label>Company Name</label>
                    <input 
                      v-if="editing" 
                      v-model="editableFields.company"
                      type="text" 
                      class="edit-input"
                      placeholder="Enter company name"
                    />
                    <p v-else>{{ userProfile?.company }}</p>
                  </div>
                  <div v-if="userProfile?.role === 'employer'" class="info-item">
                    <label>Industry</label>
                    <input 
                      v-if="editing" 
                      v-model="editableFields.industry"
                      type="text" 
                      class="edit-input"
                      placeholder="Enter industry"
                    />
                    <p v-else>{{ userProfile?.industry || 'Not provided' }}</p>
                  </div>
                </div>
              </div>

              <!-- Skills Section (Job Seekers) -->
              <div v-if="userProfile?.role === 'jobseeker'" class="section-card">
                <h2 class="section-title">Skills</h2>
                <div v-if="editing" class="skills-edit">
                  <textarea 
                    v-model="editableFields.skills"
                    class="edit-textarea"
                    placeholder="Enter skills separated by commas"
                    rows="3"
                  ></textarea>
                  <p class="help-text">Separate skills with commas</p>
                </div>
                <div v-else class="skills-container">
                  <span v-for="skill in userProfile?.skills" :key="skill" class="skill-tag">
                    {{ skill }}
                  </span>
                  <p v-if="!userProfile?.skills || userProfile?.skills.length === 0" class="empty-text">
                    No skills added yet
                  </p>
                </div>
              </div>

              <!-- Overview Grid: Applications & Reviews Previews (Job Seekers) -->
              <div v-if="userProfile?.role === 'jobseeker'" class="overview-grid">
                <!-- Applications Preview -->
                <div v-if="!isViewingOtherProfile" class="section-card">
                  <div class="section-header">
                    <h2 class="section-title">Recent Applications</h2>
                    <router-link v-if="recentApplications.length > 0" to="/applications" class="view-all-link">
                      View All →
                    </router-link>
                  </div>
                  <div v-if="recentApplications.length === 0" class="empty-state">
                    <p>You haven't applied to any jobs yet.</p>
                    <router-link to="/" class="btn btn-primary">Browse Jobs</router-link>
                  </div>
                  <div v-else class="applications-preview">
                    <div 
                      v-for="app in recentApplications.slice(0, 3)" 
                      :key="app.id"
                      class="application-preview-item"
                    >
                      <div class="preview-main">
                        <h3>{{ app.jobTitle }}</h3>
                        <p class="preview-company">{{ app.company }}</p>
                        <span :class="['status-badge-small', app.status]">{{ app.status }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Reviews Preview (for jobseekers viewing own profile) -->
                <div v-if="!isViewingOtherProfile && currentUser?.uid" class="section-card">
                  <div class="section-header">
                    <h2 class="section-title">Reviews</h2>
                  </div>
                  <CandidateReviewList :candidate-id="currentUser.uid" />
                </div>
              </div>

              <!-- Employer Overview -->
              <div v-if="userProfile?.role === 'employer'" class="section-card">
                <h2 class="section-title">Company Information</h2>
                <p class="info-note">View your dashboard for more details.</p>
                <router-link to="/employer/dashboard" class="btn btn-primary">Go to Dashboard</router-link>
              </div>
            </div>

            <!-- Achievements Tab (Job Seekers Only) -->
            <div v-if="activeTab === 'achievements' && userProfile?.role === 'jobseeker'" class="tab-panel">
              <div class="section-card">
                <div class="section-header">
                  <h2 class="section-title">
                    <img src="../assets/trophy-star.svg" alt="" class="section-icon" />
                    Badges & Achievements
                  </h2>
                  <router-link to="/achievements" class="view-all-link">View All →</router-link>
                </div>
                
                <div v-if="badgesLoading" class="loading-state">
                  <p>Loading badges...</p>
                </div>
                
                <div v-else-if="earnedBadges.length === 0" class="empty-badges">
                  <p>No badges earned yet</p>
                  <template v-if="!isViewingOtherProfile">
                    <p class="empty-subtitle">Complete quizzes to earn your first badge!</p>
                    <router-link to="/quizzes" class="btn btn-primary">Start Learning</router-link>
                  </template>
                </div>
                
                <div v-else class="badges-grid">
                  <div 
                    v-for="badge in earnedBadges" 
                    :key="badge.id"
                    class="badge-card"
                  >
                    <div class="badge-icon" :class="`tier-${badge.badgeTier}`">
                      {{ badge.badgeIcon }}
                    </div>
                    <div class="badge-details">
                      <h3>{{ badge.badgeName }}</h3>
                      <p>{{ badge.badgeDescription }}</p>
                      <span class="earned-date">{{ formatDate(badge.earnedAt) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Applications Tab (Job Seekers Only) -->
            <div v-if="activeTab === 'applications' && !isViewingOtherProfile && userProfile?.role === 'jobseeker'" class="tab-panel">
              <div class="section-card">
                <div class="section-header">
                  <h2 class="section-title">My Applications</h2>
                  <router-link to="/applications" class="view-all-link">View All →</router-link>
                </div>
                
                <div v-if="recentApplications.length === 0" class="empty-state">
                  <p>You haven't applied to any jobs yet.</p>
                  <router-link to="/" class="btn btn-primary">Browse Jobs</router-link>
                </div>
                
                <div v-else class="applications-full-list">
                  <div 
                    v-for="application in recentApplications" 
                    :key="application.id"
                    class="application-item"
                  >
                    <div class="application-main">
                      <div class="application-info">
                        <h3>{{ application.jobTitle }}</h3>
                        <p class="company-name">{{ application.company }}</p>
                        <p class="application-date">Applied {{ formatDate(application.createdAt) }}</p>
                      </div>
                      <span :class="['status-badge', application.status]">{{ application.status }}</span>
                    </div>
                    <router-link :to="`/jobs/${application.jobId}`" class="view-job-link">
                      View Job →
                    </router-link>
                  </div>
                </div>
              </div>
            </div>

            <!-- Reviews Tab -->
            <div v-if="activeTab === 'reviews' && ((isViewingOtherProfile && currentUserProfile?.role === 'employer' && viewedProfile?.role === 'jobseeker') || (!isViewingOtherProfile && currentUserProfile?.role === 'jobseeker')) && (isViewingOtherProfile ? viewedProfile?.id : currentUser?.uid)" class="tab-panel">
              <div class="section-card">
                <div class="section-header">
                  <h2 class="section-title">Reviews</h2>
                  <span v-if="currentUserProfile?.role === 'employer'" class="employer-only-badge">Employer Only</span>
                </div>
                <CandidateReviewList :candidate-id="isViewingOtherProfile ? viewedProfile.id : (currentUser?.uid || '')" />
                <!-- Form only visible to employers viewing someone else's profile -->
                <div v-if="isViewingOtherProfile && currentUserProfile?.role === 'employer'" style="margin-top: 24px;">
                  <CandidateReviewForm :candidate-id="viewedProfile.id" />
                </div>
              </div>
            </div>
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
import { ref, computed, onMounted, reactive } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { db } from '../firebase/config'
import { doc, getDoc } from 'firebase/firestore'
import CandidateReviewForm from '../components/reviews/CandidateReviewForm.vue'
import CandidateReviewList from '../components/reviews/CandidateReviewList.vue'

export default {
  name: 'Profile',
  components: { 
    CandidateReviewForm, 
    CandidateReviewList
  },
  setup() {
    const store = useStore()
    const route = useRoute()
    const editing = ref(false)
    const viewedProfile = ref(null)
    const loading = ref(false)
    const badgesLoading = ref(false)
    const uploadingPhoto = ref(false)
    const savingProfile = ref(false)
    const fileInput = ref(null)
    const recentApplications = ref([])
    const uploadError = ref('')
    const saveError = ref('')
    const selectedPhoto = ref(null)
    const photoPreviewUrl = ref(null)
    const activeTab = ref('overview')

    const currentUser = computed(() => store.getters['auth/currentUser'])
    const currentUserProfile = computed(() => store.getters['auth/userProfile'])
    
    const isViewingOtherProfile = computed(() => {
      return route.params.id && route.params.id !== currentUser.value?.uid
    })
    
    const userProfile = computed(() => {
      return isViewingOtherProfile.value ? viewedProfile.value : currentUserProfile.value
    })

    const editableFields = reactive({
      name: '',
      phone: '',
      skills: '',
      experience: '',
      company: '',
      industry: ''
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

    const tabs = computed(() => {
      const baseTabs = [{ id: 'overview', label: 'Overview' }]
      
      if (userProfile.value?.role === 'jobseeker') {
        baseTabs.push(
          { id: 'achievements', label: 'Achievements' },
          { id: 'applications', label: 'Applications' }
        )
      }
      
      // Show reviews tab if viewing candidate as employer OR viewing own profile as jobseeker
      if ((isViewingOtherProfile.value && currentUserProfile.value?.role === 'employer' && viewedProfile.value?.role === 'jobseeker') ||
          (!isViewingOtherProfile.value && currentUserProfile.value?.role === 'jobseeker')) {
        baseTabs.push({ id: 'reviews', label: 'Reviews' })
      }
      
      return baseTabs
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

    const formatDate = (dateString) => {
      if (!dateString) return 'Unknown'
      
      let date
      if (dateString.seconds) {
        date = new Date(dateString.seconds * 1000)
      } else if (dateString.toDate) {
        date = dateString.toDate()
      } else {
        date = new Date(dateString)
      }
      
      if (isNaN(date.getTime())) {
        return 'Unknown'
      }
      
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    }

    const triggerFileInput = () => {
      if (fileInput.value) {
        fileInput.value.click()
      }
    }

    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (!file) return

      uploadError.value = ''

      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        uploadError.value = 'Please upload a JPG or PNG image'
        return
      }

      if (file.size > 700 * 1024) {
        uploadError.value = 'Image size must be less than 700KB'
        return
      }

      selectedPhoto.value = file
      
      if (photoPreviewUrl.value) {
        URL.revokeObjectURL(photoPreviewUrl.value)
      }
      photoPreviewUrl.value = URL.createObjectURL(file)
    }

    const startEditing = () => {
      editing.value = true
      editableFields.name = userProfile.value?.name || ''
      editableFields.phone = userProfile.value?.phone || ''
      editableFields.experience = userProfile.value?.experience || ''
      editableFields.company = userProfile.value?.company || ''
      editableFields.industry = userProfile.value?.industry || ''
      
      if (userProfile.value?.skills && Array.isArray(userProfile.value.skills)) {
        editableFields.skills = userProfile.value.skills.join(', ')
      } else {
        editableFields.skills = ''
      }
    }

    const cancelEditing = () => {
      editing.value = false
      saveError.value = ''
      uploadError.value = ''
      
      selectedPhoto.value = null
      if (photoPreviewUrl.value) {
        URL.revokeObjectURL(photoPreviewUrl.value)
        photoPreviewUrl.value = null
      }
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    }

    const removePhoto = async () => {
      if (!confirm('Are you sure you want to remove your profile picture?')) {
        return
      }

      uploadingPhoto.value = true
      uploadError.value = ''
      
      try {
        await store.dispatch('auth/removeProfilePicture')
        
        selectedPhoto.value = null
        if (photoPreviewUrl.value) {
          URL.revokeObjectURL(photoPreviewUrl.value)
          photoPreviewUrl.value = null
        }
        if (fileInput.value) {
          fileInput.value.value = ''
        }
        
        uploadError.value = ''
      } catch (error) {
        console.error('Error removing profile picture:', error)
        uploadError.value = 'Failed to remove profile picture. Please try again.'
      } finally {
        uploadingPhoto.value = false
      }
    }

    const saveProfile = async () => {
      saveError.value = ''
      
      if (!editableFields.name.trim()) {
        saveError.value = 'Name is required'
        return
      }

      savingProfile.value = true
      uploadingPhoto.value = false
      
      try {
        if (selectedPhoto.value) {
          uploadingPhoto.value = true
          try {
            await store.dispatch('auth/uploadProfilePicture', selectedPhoto.value)
            selectedPhoto.value = null
            if (photoPreviewUrl.value) {
              URL.revokeObjectURL(photoPreviewUrl.value)
              photoPreviewUrl.value = null
            }
            if (fileInput.value) {
              fileInput.value.value = ''
            }
          } catch (error) {
            console.error('Error uploading profile picture:', error)
            saveError.value = 'Failed to upload profile picture. Please try again.'
            uploadingPhoto.value = false
            savingProfile.value = false
            return
          } finally {
            uploadingPhoto.value = false
          }
        }

        const updatedData = {
          name: editableFields.name.trim(),
          phone: editableFields.phone.trim()
        }

        if (userProfile.value?.role === 'jobseeker') {
          updatedData.experience = parseInt(editableFields.experience) || 0
          updatedData.skills = editableFields.skills
            .split(',')
            .map(s => s.trim())
            .filter(s => s.length > 0)
        } else if (userProfile.value?.role === 'employer') {
          updatedData.company = editableFields.company.trim()
          updatedData.industry = editableFields.industry.trim()
        }

        await store.dispatch('auth/updateProfile', updatedData)
        
        editing.value = false
        saveError.value = ''
      } catch (error) {
        console.error('Error saving profile:', error)
        saveError.value = error.message || 'Failed to save profile. Please try again.'
      } finally {
        savingProfile.value = false
        uploadingPhoto.value = false
      }
    }

    const fetchRecentApplications = async () => {
      if (currentUser.value && !isViewingOtherProfile.value) {
        try {
          const applications = await store.dispatch(
            'applications/fetchUserApplications',
            currentUser.value.uid
          )
          recentApplications.value = applications.slice(0, 5)
        } catch (error) {
          console.error('Error fetching applications:', error)
        }
      }
    }

    const fetchBadgesAndStats = async () => {
      const userId = isViewingOtherProfile.value ? route.params.id : currentUser.value?.uid
      
      if (!userId || userProfile.value?.role !== 'jobseeker') return
      
      badgesLoading.value = true
      try {
        await store.dispatch('badges/fetchEarnedBadges', userId)
        await store.dispatch('badges/initializeUserStats', userId)
      } catch (error) {
        console.error('Error fetching badges and stats:', error)
      } finally {
        badgesLoading.value = false
      }
    }

    onMounted(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      
      if (isViewingOtherProfile.value) {
        await fetchViewedProfile(route.params.id)
      }
      
      let attempts = 0
      while (attempts < 10 && (!userProfile.value || !userProfile.value.role)) {
        await new Promise(resolve => setTimeout(resolve, 200))
        attempts++
      }
      
      await fetchBadgesAndStats()

      if (currentUser.value) {
        try {
          badgesLoading.value = true
          await store.dispatch('badges/fetchEarnedBadges', currentUser.value.uid)
          await store.dispatch('badges/initializeUserStats', currentUser.value.uid)
        } catch (error) {
          console.error('Direct fetch error:', error)
        } finally {
          badgesLoading.value = false
        }
      }

      if (!isViewingOtherProfile.value && userProfile.value?.role === 'jobseeker') {
        await fetchRecentApplications()
      }
    })

    const earnedBadges = computed(() => store.getters['badges/earnedBadges'] || [])
    const userStats = computed(() => store.getters['badges/userStats'])

    return {
      editing,
      userProfile,
      currentUserProfile,
      currentUser,
      viewedProfile,
      earnedBadges,
      userStats,
      getInitials,
      isViewingOtherProfile,
      loading,
      badgesLoading,
      formatDate,
      fileInput,
      uploadingPhoto,
      uploadError,
      triggerFileInput,
      handleFileUpload,
      startEditing,
      cancelEditing,
      saveProfile,
      editableFields,
      savingProfile,
      saveError,
      recentApplications,
      selectedPhoto,
      photoPreviewUrl,
      removePhoto,
      activeTab,
      tabs
    }
  }
}
</script>

<style scoped>
.profile-page {
  min-height: calc(100vh - 70px);
  background: var(--bg-dark);
  padding: 24px 20px;
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
}

.profile-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-muted);
  font-size: 1.1rem;
}

.error-banner {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #dc2626;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.9rem;
}

/* Profile Header */
.profile-header-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-sm);
}

.header-main {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: flex-start;
  gap: 24px;
  width: 100%;
}

@media (max-width: 768px) {
  .header-main {
    grid-template-columns: 1fr;
  }
}

.avatar-section {
  grid-column: 1;
}

.avatar-wrapper {
  position: relative;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 4px solid var(--bg-light);
  box-shadow: var(--shadow-md);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
}


.avatar-actions {
  margin-top: 12px;
  text-align: center;
}

.photo-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-add-photo,
.btn-remove-photo {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.btn-add-photo {
  background: var(--primary);
  color: white;
}

.btn-add-photo:hover:not(:disabled) {
  background: oklch(0.35 0.1 245);
  transform: translateY(-1px);
}

.btn-add-photo:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-remove-photo {
  background: transparent;
  color: var(--danger);
  border: 2px solid var(--danger);
}

.btn-remove-photo:hover:not(:disabled) {
  background: var(--danger);
  color: white;
}

.btn-remove-photo:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.header-info {
  grid-column: 2;
  min-width: 200px;
}

.name-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.name-section h1 {
  font-size: 2rem;
  color: var(--text);
  margin: 0;
  font-weight: 700;
}

.role-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.role-badge.jobseeker {
  background: rgba(52, 152, 219, 0.1);
  color: var(--primary);
}

.role-badge.employer {
  background: rgba(155, 89, 182, 0.1);
  color: var(--secondary);
}

.subtitle {
  color: var(--text-muted);
  font-size: 1rem;
  margin: 0;
}

.header-actions {
  grid-column: 3;
  display: flex !important;
  gap: 12px;
  align-items: flex-start;
  justify-content: flex-end;
  min-width: 140px;
}

.edit-buttons {
  display: flex;
  gap: 10px;
}

.btn-edit,
.btn-save,
.btn-cancel {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  white-space: nowrap;
}

.btn-edit,
.btn-save {
  background: var(--primary, #3498db);
  color: white;
  min-width: 120px;
}

.btn-edit:hover,
.btn-save:hover:not(:disabled) {
  background: var(--primary, #2980b9);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  background: transparent;
  color: var(--text, #333);
  border: 2px solid var(--border, #ddd);
  min-width: 100px;
}

.btn-cancel:hover {
  background: var(--bg-light, #f5f5f5);
  border-color: var(--text-muted, #999);
}

.inline-error {
  color: var(--danger);
  font-size: 0.85rem;
  margin-top: 8px;
  text-align: center;
}

/* Stats Card */
.stats-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px;
  box-shadow: var(--shadow-sm);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
}

.stat-box {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--bg-light);
  border-radius: 12px;
  transition: transform 0.2s;
}

.stat-box:hover {
  transform: translateY(-2px);
}

.stat-icon-img {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.stat-icon-text {
  font-size: 2rem;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary);
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 500;
}

/* Tabs */
.tabs-container {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.tabs-nav {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--border);
  background: var(--bg-light);
  overflow-x: auto;
}

.tab-button {
  flex: 1;
  padding: 16px 24px;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
  min-width: 120px;
}

.tab-button:hover {
  color: var(--text);
  background: var(--bg);
}

.tab-button.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
  background: var(--bg);
}

.tabs-content {
  padding: 24px;
}

.tab-panel {
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Section Cards */
.section-card {
  background: var(--bg-light);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
}

.section-title {
  font-size: 1.5rem;
  color: var(--text);
  margin-bottom: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 12px;
  flex-wrap: wrap;
}

.section-header .section-title {
  margin-bottom: 0;
}

.section-icon {
  width: 24px;
  height: 24px;
}

.view-all-link {
  color: var(--primary);
  font-weight: 600;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s;
}

.view-all-link:hover {
  color: var(--text);
}

.employer-only-badge {
  background: var(--primary);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.info-item label {
  display: block;
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-bottom: 8px;
  font-weight: 600;
}

.info-item p {
  color: var(--text);
  font-size: 1rem;
}

.readonly-field {
  color: var(--text-muted);
  font-style: italic;
}

.edit-input,
.edit-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid var(--border);
  border-radius: 8px;
  font-size: 1rem;
  color: var(--text);
  background: var(--bg);
  transition: border-color 0.3s;
}

.edit-input:focus,
.edit-textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.edit-textarea {
  font-family: inherit;
  resize: vertical;
}

.help-text {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin-top: 8px;
}

/* Skills */
.skills-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.skill-tag {
  background: var(--bg);
  color: var(--primary);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.95rem;
  border: 1px solid var(--border);
}

.empty-text {
  color: var(--text-muted);
  font-style: italic;
}

/* Overview Grid */
.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

/* Applications Preview */
.applications-preview {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.application-preview-item {
  padding: 16px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  transition: all 0.3s;
}

.application-preview-item:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
}

.preview-main h3 {
  font-size: 1rem;
  color: var(--text);
  margin-bottom: 4px;
}

.preview-company {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin-bottom: 8px;
}

.status-badge-small {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-badge-small.pending {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.status-badge-small.accepted {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.status-badge-small.rejected {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

/* Applications Full List */
.applications-full-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.application-item {
  background: var(--bg);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid var(--border);
  transition: all 0.3s;
}

.application-item:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.application-main {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 12px;
  gap: 16px;
}

.application-info h3 {
  font-size: 1.2rem;
  color: var(--text);
  margin-bottom: 5px;
}

.company-name {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin-bottom: 3px;
}

.application-date {
  color: var(--text-muted);
  font-size: 0.85rem;
}

.status-badge {
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: capitalize;
  flex-shrink: 0;
}

.status-badge.pending {
  background: var(--warning);
  color: var(--text);
}

.status-badge.accepted {
  background: var(--success);
  color: white;
}

.status-badge.rejected {
  background: var(--danger);
  color: white;
}

.view-job-link {
  color: var(--primary);
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.3s;
}

.view-job-link:hover {
  color: var(--text);
}

/* Badges */
.badges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.badge-card {
  background: var(--bg);
  border: 2px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  gap: 15px;
  transition: all 0.3s;
}

.badge-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary);
}

.badge-icon {
  font-size: 3rem;
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
}

.badge-icon.tier-bronze {
  background: linear-gradient(135deg, #cd7f32 0%, #b8860b 100%);
}

.badge-icon.tier-silver {
  background: linear-gradient(135deg, #c0c0c0 0%, #a8a8a8 100%);
}

.badge-icon.tier-gold {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
}

.badge-icon.tier-platinum {
  background: linear-gradient(135deg, #e5e4e2 0%, #b0c4de 100%);
}

.badge-details {
  flex: 1;
}

.badge-details h3 {
  font-size: 1.1rem;
  color: var(--text);
  margin-bottom: 5px;
  font-weight: 600;
}

.badge-details p {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.earned-date {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-style: italic;
}

.empty-badges {
  text-align: center;
  padding: 60px 20px;
}

.empty-badges p {
  color: var(--text);
  font-size: 1.2rem;
  margin-bottom: 10px;
}

.empty-subtitle {
  color: var(--text-muted);
  font-size: 1rem;
  margin-bottom: 20px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-state p {
  color: var(--text-muted);
  margin-bottom: 20px;
}

.info-note {
  color: var(--text-muted);
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .profile-page {
    padding: 16px;
  }

  .tabs-nav {
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .tab-button {
    min-width: 100px;
    padding: 12px 16px;
    font-size: 0.85rem;
  }

  .tabs-content {
    padding: 16px;
  }

  .overview-grid {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .badges-grid {
    grid-template-columns: 1fr;
  }

  .section-card {
    padding: 20px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>

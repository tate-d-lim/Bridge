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
        <div class="avatar-container">
          <div class="avatar">
            <img 
              v-if="photoPreviewUrl" 
              :src="photoPreviewUrl" 
              :alt="userProfile.name"
              class="avatar-image"
            />
            <img 
              v-else-if="userProfile?.photoURL" 
              :src="userProfile.photoURL" 
              :alt="userProfile.name"
              class="avatar-image"
            />
            <span v-else>{{ getInitials }}</span>
          </div>
          <input 
            ref="fileInput"
            type="file" 
            accept="image/jpeg,image/jpg,image/png"
            @change="handleFileUpload"
            style="display: none"
          />
          <div class="avatar-actions">
            <p v-if="uploadError" class="inline-error">{{ uploadError }}</p>
            <p v-if="selectedPhoto" class="photo-selected">New photo selected</p>
            <div v-if="!isViewingOtherProfile && editing" class="photo-buttons">
              <button 
                @click="triggerFileInput"
                class="btn-add-photo"
                :disabled="uploadingPhoto"
              >
                <span v-if="uploadingPhoto" class="loading-emoji">⏳</span>
                <img v-else src="../assets/add-profile-picture.svg" alt="" class="btn-icon" />
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
          <h1>{{ userProfile?.name || 'User Profile' }}</h1>
          <p v-if="userProfile?.role === 'jobseeker'">
            {{ userProfile?.experience }} years of experience
          </p>
          <p v-else>{{ userProfile?.company }}</p>
        </div>
        <div v-if="!isViewingOtherProfile" class="header-actions">
          <button v-if="!editing" @click="startEditing" class="btn btn-primary">
            Edit Profile
          </button>
          <div v-else class="edit-actions">
            <button @click="saveProfile" :disabled="savingProfile" class="btn btn-primary">
              {{ savingProfile ? 'Saving...' : 'Save' }}
            </button>
            <button @click="cancelEditing" class="btn btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      </div>
      <p v-if="saveError" class="inline-error">{{ saveError }}</p>

      <!-- Job Seeker Profile -->
      <div v-if="userProfile?.role === 'jobseeker'" class="profile-content">
        <div class="profile-section">
          <h2>Personal Information</h2>
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
              <label>Phone</label>
              <input 
                v-if="editing" 
                v-model="editableFields.phone"
                type="tel" 
                class="edit-input"
                placeholder="Enter your phone"
              />
              <p v-else>{{ userProfile?.phone || 'Not provided' }}</p>
            </div>
            <div class="info-item">
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
          </div>
        </div>

        <div class="profile-section">
          <h2>Skills</h2>
          <div v-if="editing" class="skills-edit">
            <textarea 
              v-model="editableFields.skills"
              class="edit-textarea"
              placeholder="Enter skills separated by commas (e.g., JavaScript, Python, Communication)"
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

        <div class="profile-section">
          <div class="section-header">
            <h2>
              <img src="../assets/trophy-star.svg" alt="" class="section-icon" />
              Badges & Achievements
            </h2>
            <router-link to="/achievements" class="view-all-link">
              View All →
            </router-link>
          </div>
          
          <div v-if="badgesLoading" class="loading-state">
            <p>Loading badges...</p>
          </div>
          
          <div v-else-if="earnedBadges.length === 0" class="empty-badges">
            <p>No badges earned yet</p>
            <p class="empty-subtitle">Complete quizzes to earn your first badge!</p>
            <router-link to="/quizzes" class="btn btn-primary">Start Learning</router-link>
          </div>
          
          <div v-else class="badges-grid">
            <div 
              v-for="badge in earnedBadges.slice(0, 6)" 
              :key="badge.id"
              class="badge-card"
            >
              <div class="badge-icon" :class="`tier-${badge.badgeTier}`">
                {{ badge.badgeIcon }}
              </div>
              <div class="badge-details">
                <h3>{{ badge.badgeName }}</h3>
                <p>{{ badge.badgeDescription }}</p>
                <span class="earned-date">
                  {{ formatDate(badge.earnedAt) }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- Stats Summary -->
          <div class="stats-summary">
            <div class="stat-item">
              <span class="stat-label">Total Badges</span>
              <span class="stat-value">{{ earnedBadges.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Quiz Wins</span>
              <span class="stat-value">{{ userStats?.totalWins || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Win Rate</span>
              <span class="stat-value">{{ userStats?.winPercentage || 0 }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Current Streak</span>
              <span class="stat-value">{{ userStats?.currentDayStreak || 0 }} days</span>
            </div>
          </div>
        </div>

        <!-- Recent Applications (for job seekers) -->
        <div class="profile-section">
          <div class="section-header">
            <h2>Recent Applications</h2>
            <router-link 
              v-if="recentApplications.length > 0" 
              to="/applications" 
              class="view-all-link"
            >
              View All →
            </router-link>
          </div>
          
          <div v-if="recentApplications.length === 0" class="empty-state">
            <p>You haven't applied to any jobs yet.</p>
            <router-link to="/" class="btn btn-primary">Browse Jobs</router-link>
          </div>
          
          <div v-else class="recent-applications-list">
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
                <span :class="['status-badge', application.status]">
                  {{ application.status }}
                </span>
              </div>
              <router-link 
                :to="`/jobs/${application.jobId}`" 
                class="view-job-link"
              >
                View Job →
              </router-link>
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
              <label>Contact Name</label>
              <input 
                v-if="editing" 
                v-model="editableFields.name"
                type="text" 
                class="edit-input"
                placeholder="Enter contact name"
              />
              <p v-else>{{ userProfile?.name }}</p>
            </div>
            <div class="info-item">
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
            <div class="info-item">
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
            <div class="info-item">
              <label>Email</label>
              <p class="readonly-field">{{ userProfile?.email }}</p>
            </div>
            <div class="info-item">
              <label>Phone</label>
              <input 
                v-if="editing" 
                v-model="editableFields.phone"
                type="tel" 
                class="edit-input"
                placeholder="Enter phone number"
              />
              <p v-else>{{ userProfile?.phone || 'Not provided' }}</p>
            </div>
          </div>
        </div>

        <!-- Recent Applications (for employers) -->
        <div v-if="userProfile?.role === 'employer'" class="profile-section">
          <h2>Recent Applications</h2>
          <div class="empty-state">
            <p>No recent applications to display.</p>
            <router-link to="/employer/dashboard" class="btn btn-primary">View Dashboard</router-link>
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

export default {
  name: 'Profile',
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

    // Editable fields that mirror userProfile
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
      
      // Handle Firestore Timestamp objects
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

    // Profile picture upload
    const triggerFileInput = () => {
      if (fileInput.value) {
        fileInput.value.click()
      }
    }

    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (!file) return

      uploadError.value = ''

      // Validate file type
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        uploadError.value = 'Please upload a JPG or PNG image'
        return
      }

      // Validate file size (700KB max)
      if (file.size > 700 * 1024) {
        uploadError.value = 'Image size must be less than 700KB'
        return
      }

      // Store the file for upload on save
      selectedPhoto.value = file
      
      // Create preview URL
      if (photoPreviewUrl.value) {
        URL.revokeObjectURL(photoPreviewUrl.value)
      }
      photoPreviewUrl.value = URL.createObjectURL(file)
    }

    // Profile editing
    const startEditing = () => {
      editing.value = true
      // Copy current values to editable fields
      editableFields.name = userProfile.value?.name || ''
      editableFields.phone = userProfile.value?.phone || ''
      editableFields.experience = userProfile.value?.experience || ''
      editableFields.company = userProfile.value?.company || ''
      editableFields.industry = userProfile.value?.industry || ''
      
      // Convert skills array to comma-separated string
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
      
      // Clear selected photo and preview
      selectedPhoto.value = null
      if (photoPreviewUrl.value) {
        URL.revokeObjectURL(photoPreviewUrl.value)
        photoPreviewUrl.value = null
      }
      
      // Clear file input
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
        
        // Clear any selected photo or preview
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
      
      // Validate required fields
      if (!editableFields.name.trim()) {
        saveError.value = 'Name is required'
        return
      }

      savingProfile.value = true
      uploadingPhoto.value = false
      
      try {
        console.log('Starting profile save...')
        
        // Upload profile picture first if one was selected
        if (selectedPhoto.value) {
          console.log('Uploading profile picture...')
          uploadingPhoto.value = true
          try {
            await store.dispatch('auth/uploadProfilePicture', selectedPhoto.value)
            console.log('Profile picture uploaded successfully')
            // Clear the selected photo and preview after successful upload
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

        // Update other profile fields
        console.log('Updating profile fields...')
        const updatedData = {
          name: editableFields.name.trim(),
          phone: editableFields.phone.trim()
        }

        // Add role-specific fields
        if (userProfile.value?.role === 'jobseeker') {
          updatedData.experience = parseInt(editableFields.experience) || 0
          // Parse skills from comma-separated string
          updatedData.skills = editableFields.skills
            .split(',')
            .map(s => s.trim())
            .filter(s => s.length > 0)
        } else if (userProfile.value?.role === 'employer') {
          updatedData.company = editableFields.company.trim()
          updatedData.industry = editableFields.industry.trim()
        }

        console.log('Dispatching updateProfile action...', updatedData)
        await store.dispatch('auth/updateProfile', updatedData)
        console.log('Profile updated successfully')
        
        editing.value = false
        saveError.value = ''
      } catch (error) {
        console.error('Error saving profile:', error)
        saveError.value = error.message || 'Failed to save profile. Please try again.'
      } finally {
        console.log('Resetting saving state')
        savingProfile.value = false
        uploadingPhoto.value = false
      }
    }

    // Fetch recent applications
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

    // Fetch badges and stats
    const fetchBadgesAndStats = async () => {
      const userId = isViewingOtherProfile.value ? route.params.id : currentUser.value?.uid
      
      if (!userId) {
        console.log('⚠️ Profile: No user ID available')
        return
      }
      
      if (!userProfile.value) {
        console.log('⚠️ Profile: User profile not available yet')
        return
      }
      
      if (userProfile.value.role !== 'jobseeker') {
        console.log('ℹ️ Profile: Not a jobseeker profile')
        return
      }
      
      badgesLoading.value = true
      try {
        console.log('🔍 Profile: Fetching badges for user:', userId)
        // Fetch earned badges from badges store
        const badges = await store.dispatch('badges/fetchEarnedBadges', userId)
        console.log('✅ Profile: Earned badges count:', badges?.length || 0, badges)
        
        // Fetch user stats from badges store
        const stats = await store.dispatch('badges/initializeUserStats', userId)
        console.log('✅ Profile: User stats:', stats)
        console.log('✅ Profile: Badges and stats fetched successfully')
      } catch (error) {
        console.error('❌ Profile: Error fetching badges and stats:', error)
        console.error('Error details:', error.message, error.stack)
      } finally {
        badgesLoading.value = false
      }
    }

    onMounted(async () => {
      console.log('🏠 Profile: Component mounted')
      
      // Wait a bit for profile to be available
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // If viewing someone else's profile, fetch their data
      if (isViewingOtherProfile.value) {
        console.log('👤 Profile: Viewing other profile, fetching...')
        await fetchViewedProfile(route.params.id)
      }
      
      // Fetch badges and stats for job seekers - try multiple times if needed
      let attempts = 0
      console.log('⏳ Profile: Waiting for userProfile to be available...')
      while (attempts < 10 && (!userProfile.value || !userProfile.value.role)) {
        await new Promise(resolve => setTimeout(resolve, 200))
        attempts++
        console.log(`   Attempt ${attempts}/10, userProfile:`, userProfile.value)
      }
      
      if (userProfile.value) {
        console.log('✅ Profile: User profile available:', userProfile.value)
      } else {
        console.warn('⚠️ Profile: User profile not available after waiting')
      }
      
      // Always try to fetch badges, even if profile check fails
      await fetchBadgesAndStats()

      // If the above didn't work, try a direct fetch
      if (currentUser.value) {
        const directUserId = currentUser.value.uid
        console.log('🔄 Profile: Attempting direct badge fetch for:', directUserId)
        try {
          badgesLoading.value = true
          await store.dispatch('badges/fetchEarnedBadges', directUserId)
          await store.dispatch('badges/initializeUserStats', directUserId)
        } catch (error) {
          console.error('Direct fetch error:', error)
        } finally {
          badgesLoading.value = false
        }
      }

      // Fetch recent applications for current user
      if (!isViewingOtherProfile.value && userProfile.value?.role === 'jobseeker') {
        await fetchRecentApplications()
      }
    })

    // Get data from badges store
    const earnedBadges = computed(() => {
      const badges = store.getters['badges/earnedBadges']
      console.log('🎖️ Computed earnedBadges:', badges)
      return badges || []
    })
    const userStats = computed(() => store.getters['badges/userStats'])

      return {
      editing,
      userProfile,
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
      removePhoto
    }
  }
}
</script>

<style scoped>
/* Avatar and Profile Picture */
.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.avatar {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2.5rem;
  font-weight: bold;
  overflow: hidden;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.photo-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.btn-add-photo {
  background: transparent;
  color: var(--primary);
  border: 1px solid var(--primary);
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-add-photo:hover:not(:disabled) {
  background: var(--bg-light);
  transform: translateY(-1px);
}

.btn-add-photo:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-remove-photo {
  background: transparent;
  color: var(--danger);
  border: 1px solid var(--danger);
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-remove-photo:hover:not(:disabled) {
  background: var(--danger);
  color: white;
}

.btn-remove-photo:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.loading-emoji {
  font-size: 1rem;
}

/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
}

.edit-actions {
  display: flex;
  gap: 10px;
}

/* Error Messages */
.error-message {
  color: var(--danger);
  font-size: 0.85rem;
  margin-top: 5px;
}

.inline-error {
  color: var(--danger);
  font-size: 0.85rem;
  margin-top: 5px;
}

.error-banner {
  background: var(--danger);
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
}

.photo-selected {
  color: var(--success);
  font-size: 0.85rem;
  margin-top: 5px;
  font-weight: 600;
}

/* Inline Editing */
.edit-input {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid var(--border);
  border-radius: 8px;
  font-size: 1rem;
  color: var(--text);
  background: var(--bg-light);
  transition: all 0.3s;
}

.edit-input:hover {
  border-color: var(--primary);
}

.edit-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.edit-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid var(--border);
  border-radius: 8px;
  font-size: 1rem;
  color: var(--text);
  background: var(--bg-light);
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s;
}

.edit-textarea:hover {
  border-color: var(--primary);
}

.edit-textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.help-text {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin-top: 8px;
}

.readonly-field {
  color: var(--text-muted);
  font-style: italic;
}

.empty-text {
  color: var(--text-muted);
  font-style: italic;
}

.skills-edit {
  margin-top: 10px;
}

/* Recent Applications */
.recent-applications-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.application-item {
  background: var(--bg-light);
  padding: 20px;
  border-radius: 10px;
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

/* Section Headers */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-icon {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

.view-all-link {
  color: var(--primary);
  font-weight: 600;
  text-decoration: none;
  transition: color 0.3s;
}

.view-all-link:hover {
  color: var(--text);
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: var(--text-muted);
}

.empty-badges {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 20px;
  opacity: 0.5;
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

.badges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
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
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
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

.stats-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  padding: 25px;
  background: var(--bg);
  border-radius: 12px;
  border: 2px solid var(--border);
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.stat-value {
  display: block;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--primary);
}

.btn {
  padding: 10px 25px;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  display: inline-block;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: oklch(0.3 0.1 245);
  transform: translateY(-2px);
}

.btn-secondary {
  background: var(--bg-light);
  color: var(--text);
  border: 2px solid var(--border);
}

.btn-secondary:hover {
  background: var(--bg);
  border-color: var(--primary);
}

@media (max-width: 768px) {
  .badges-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-summary {
    grid-template-columns: repeat(2, 1fr);
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
  }

  .header-actions {
    width: 100%;
  }

  .edit-actions {
    width: 100%;
    flex-direction: column;
  }

  .edit-actions .btn {
    width: 100%;
  }

  .application-main {
    flex-direction: column;
    gap: 12px;
  }

  .status-badge {
    align-self: flex-start;
  }

  .photo-buttons {
    flex-direction: column;
    width: 100%;
  }

  .btn-add-photo,
  .btn-remove-photo {
    width: 100%;
    justify-content: center;
  }
}
</style>



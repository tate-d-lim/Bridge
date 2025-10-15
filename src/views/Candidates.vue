<template>
  <div class="candidates-page">
    <div class="candidates-container">
      <div class="page-header">
        <h1>Browse Candidates</h1>
        <p>Find qualified workers for your job openings</p>
      </div>

      <!-- Search and Filters -->
      <div class="filters-section">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search candidates by name or skills..."
          class="search-input"
        />
        
        <div class="filter-row">
          <select v-model="selectedSkill" class="filter-select">
            <option value="">All Skills</option>
            <option value="construction">Construction</option>
            <option value="plumbing">Plumbing</option>
            <option value="electrical">Electrical</option>
            <option value="carpentry">Carpentry</option>
          </select>

          <select v-model="selectedExperience" class="filter-select">
            <option value="">All Experience</option>
            <option value="0-2">0-2 years</option>
            <option value="3-5">3-5 years</option>
            <option value="6-10">6-10 years</option>
            <option value="10+">10+ years</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <p>Loading candidates...</p>
      </div>

      <!-- Candidates Grid -->
      <div v-else-if="candidates.length === 0" class="empty-state">
        <p>No candidates found. Try adjusting your filters.</p>
      </div>

      <div v-else class="candidates-grid">
        <div v-for="candidate in candidates" :key="candidate.id" class="card card-interactive candidate-card">
          <div class="candidate-avatar">{{ getInitials(candidate.name) }}</div>
          
          <div class="candidate-info">
            <h3>{{ candidate.name }}</h3>
            <p class="experience">{{ candidate.experience }} years of experience</p>
            
            <div class="skills">
              <span v-for="skill in candidate.skills" :key="skill" class="skill-tag">
                {{ skill }}
              </span>
            </div>

            <div v-if="candidate.badges && candidate.badges.length > 0" class="badges">
              <span class="badge-icon" v-for="i in Math.min(candidate.badges.length, 3)" :key="i">
                🏆
              </span>
              <span v-if="candidate.badges.length > 3" class="badge-count">
                +{{ candidate.badges.length - 3 }}
              </span>
            </div>
          </div>

          <div class="candidate-actions">
            <router-link :to="`/profile/${candidate.id}`" class="btn btn-secondary">
              View Profile
            </router-link>
            <button @click="contactCandidate(candidate)" class="btn btn-primary">
              Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { db } from '../firebase/config'
import { collection, getDocs, query, where } from 'firebase/firestore'

export default {
  name: 'Candidates',
  setup() {
    const router = useRouter()

    const searchQuery = ref('')
    const selectedSkill = ref('')
    const selectedExperience = ref('')
    const candidates = ref([])
    const loading = ref(false)

    const fetchCandidates = async () => {
      loading.value = true
      try {
        // Fetch all job seekers from the users collection
        const q = query(
          collection(db, 'users'),
          where('role', '==', 'jobseeker')
        )
        
        const querySnapshot = await getDocs(q)
        const jobSeekers = []
        querySnapshot.forEach((doc) => {
          jobSeekers.push({ 
            id: doc.id, 
            ...doc.data(),
            // Ensure skills is an array
            skills: doc.data().skills || []
          })
        })
        
        candidates.value = jobSeekers
      } catch (error) {
        console.error('Error fetching candidates:', error)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      fetchCandidates()
    })

    const getInitials = (name) => {
      if (!name) return '?'
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }

    const contactCandidate = (candidate) => {
      // In production, create a chat and navigate to it
      router.push('/chat')
    }

    return {
      searchQuery,
      selectedSkill,
      selectedExperience,
      candidates,
      loading,
      getInitials,
      contactCandidate
    }
  }
}
</script>
<style scoped>
.candidates-page {
  min-height: calc(100vh - 70px);
  background: var(--bg-dark);
  padding: 40px 20px;
}

.candidates-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 2.5rem;
  color: var(--text);
  margin-bottom: 10px;
}

.page-header p {
  font-size: 1.1rem;
  color: var(--text-muted);
}

.filters-section {
  background: var(--bg);
  padding: 25px;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  margin-bottom: 30px;
  border: 1px solid var(--border);
}

.search-input {
  background: var(--bg-light);
  width: 100%;
  padding: 12px 15px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 1rem;
  margin-bottom: 15px;
  background: var(--bg-light);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
}

.filter-row {
  background: var(--bg-light);
  display: flex;
  gap: 15px;
}

.filter-select {
  flex: 1;
  padding: 12px 15px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--bg-light);
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary);
}

.loading-state {
  background: var(--bg-light);
  padding: 60px 20px;
  border-radius: 12px;
  text-align: center;
  color: var(--text-muted);
  border: 1px solid var(--border);
}

.empty-state {
  background: var(--bg-light);
  padding: 60px 20px;
  border-radius: 12px;
  text-align: center;
  color: var(--text-muted);
  font-size: 1.1rem;
  border: 1px solid var(--border);
}

.candidates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
}

.candidate-card {
  /* Card styling handled by global .card class */
}

.candidate-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 20px;
}

.candidate-info h3 {
  font-size: 1.5rem;
  color: var(--text);
  margin-bottom: 5px;
}

.experience {
  color: var(--text-muted);
  margin-bottom: 15px;
}

.skills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
}

.skill-tag {
  background: var(--bg-light);
  color: var(--primary);
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.85rem;
}

.badges {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 20px;
}

.badge-icon {
  font-size: 1.3rem;
}

.badge-count {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.candidate-actions {
  display: flex;
  gap: 10px;
}

.candidate-actions .btn {
  flex: 1;
}

@media (max-width: 768px) {
  .candidates-grid {
    grid-template-columns: 1fr;
  }

  .filter-row {
    flex-direction: column;
  }
}
</style>



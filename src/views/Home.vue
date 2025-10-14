<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1>Welcome to Bridge</h1>
        <p class="hero-subtitle">Connecting Singapore Employers with Skilled Migrant Workers</p>
        <p class="hero-description">
          Skip the expensive middlemen. Find jobs or hire talent directly through our platform.
        </p>
        <div class="hero-buttons">
          <router-link to="/login" class="btn btn-primary">Login</router-link>
          <router-link to="/register" class="btn btn-secondary">Register</router-link>
        </div>
      </div>
      <div class="hero-image">
        <img src="../assets/bridgeLogo.png" alt="Bridge Logo" />
      </div>
    </section>

    <!-- Browse Jobs Section -->
    <section id="jobs-section" class="browse-jobs">
      <div class="jobs-header">
        <h2>Browse Available Jobs</h2>
        <p>Find your next opportunity from top employers in Singapore</p>
      </div>

      <!-- Job Filters -->
      <div class="filters-container">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search jobs by title, company..."
          class="search-input"
        />
        <select v-model="selectedCategory" class="filter-select">
          <option value="">All Categories</option>
          <option value="construction">Construction</option>
          <option value="hospitality">Hospitality</option>
          <option value="manufacturing">Manufacturing</option>
          <option value="healthcare">Healthcare</option>
          <option value="logistics">Logistics</option>
        </select>
        <button @click="applyFilters" class="btn btn-primary">Search</button>
      </div>

      <!-- Job Listings -->
      <div class="jobs-container">
        <div v-if="loading" class="loading">
          <p>Loading jobs...</p>
        </div>
        <div v-else-if="filteredJobs.length === 0" class="no-results">
          <p>No jobs found. Try adjusting your search.</p>
        </div>
        <div v-else class="jobs-grid">
          <JobCard
            v-for="job in filteredJobs.slice(0, 6)"
            :key="job.id"
            :job="job"
          />
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="stats">
      <div class="stat-item">
        <h3>10,000+</h3>
        <p>Active Job Seekers</p>
      </div>
      <div class="stat-item">
        <h3>5,000+</h3>
        <p>Registered Employers</p>
      </div>
      <div class="stat-item">
        <h3>15,000+</h3>
        <p>Jobs Posted</p>
      </div>
      <div class="stat-item">
        <h3>8,000+</h3>
        <p>Successful Hires</p>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <h2>Ready to Get Started?</h2>
      <p>Join thousands of employers and job seekers on Bridge today</p>
      <router-link to="/register" class="btn btn-primary btn-large">Create Free Account</router-link>
    </section>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import JobCard from '../components/JobCard.vue'

export default {
  name: 'Home',
  components: {
    JobCard
  },
  setup() {
    const store = useStore()
    
    const searchQuery = ref('')
    const selectedCategory = ref('')
    const loading = ref(false)

    const jobs = computed(() => store.getters['jobs/allJobs'])

    const filteredJobs = computed(() => {
      let result = jobs.value

      if (searchQuery.value) {
        result = result.filter(job =>
          job.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          job.company.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
      }

      if (selectedCategory.value) {
        result = result.filter(job => 
          job.category === selectedCategory.value
        )
      }

      return result
    })

    const applyFilters = async () => {
      loading.value = true
      try {
        await store.dispatch('jobs/fetchJobs', {
          category: selectedCategory.value
        })
      } catch (error) {
        console.error('Error fetching jobs:', error)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      applyFilters()
    })

    return {
      searchQuery,
      selectedCategory,
      loading,
      filteredJobs,
      applyFilters
    }
  }
}
</script>

<style scoped>
html {
  scroll-behavior: smooth;
}

.home {
  width: 100%;
}

.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 80px 20px;
  max-width: 1200px;
  margin: 0 auto;
  gap: 60px;
}

.hero-content {
  flex: 1;
}

.hero h1 {
  font-size: 3.5rem;
  color: #2c3e50;
  margin-bottom: 20px;
  font-weight: 700;
}

.hero-subtitle {
  font-size: 1.5rem;
  color: #3498db;
  margin-bottom: 15px;
  font-weight: 600;
}

.hero-description {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin-bottom: 30px;
  line-height: 1.6;
}

.hero-buttons {
  display: flex;
  gap: 15px;
}

.hero-image {
  flex: 1;
  text-align: center;
}

.hero-image img {
  max-width: 100%;
  height: auto;
  border-radius: 10px;
}

.browse-jobs {
  padding: 80px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.jobs-header {
  text-align: center;
  margin-bottom: 40px;
}

.jobs-header h2 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 15px;
}

.jobs-header p {
  font-size: 1.1rem;
  color: #7f8c8d;
}

.filters-container {
  display: flex;
  gap: 15px;
  margin-bottom: 40px;
  flex-wrap: wrap;
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.search-input,
.filter-select {
  flex: 1;
  min-width: 200px;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.search-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #3498db;
}

.jobs-container {
  min-height: 300px;
}

.loading,
.no-results {
  text-align: center;
  padding: 60px 20px;
  color: #7f8c8d;
  font-size: 1.1rem;
}

.jobs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
}

.stats {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  padding: 80px 20px;
  max-width: 1200px;
  margin: 0 auto;
  gap: 30px;
}

.stat-item {
  text-align: center;
}

.stat-item h3 {
  font-size: 3rem;
  color: #3498db;
  margin-bottom: 10px;
  font-weight: 700;
}

.stat-item p {
  font-size: 1.1rem;
  color: #7f8c8d;
}

.cta {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  padding: 80px 20px;
  text-align: center;
}

.cta h2 {
  font-size: 2.5rem;
  margin-bottom: 20px;
}

.cta p {
  font-size: 1.2rem;
  margin-bottom: 30px;
  opacity: 0.9;
}

@media (max-width: 768px) {
  .hero {
    flex-direction: column;
    text-align: center;
    padding: 40px 20px;
  }

  .hero h1 {
    font-size: 2.5rem;
  }

  .hero-buttons {
    justify-content: center;
  }

  .stats {
    flex-direction: column;
  }

  .filters-container {
    flex-direction: column;
  }

  .search-input,
  .filter-select {
    width: 100%;
  }

  .jobs-grid {
    grid-template-columns: 1fr;
  }
}
</style>


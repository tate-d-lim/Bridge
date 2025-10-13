<template>
  <div class="job-listings">
    <div class="page-header">
      <h1>Find Your Next Opportunity</h1>
      <p>Browse thousands of jobs from top employers in Singapore</p>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filters-container">
        <div class="filter-group">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search jobs by title, company..."
            class="search-input"
          />
        </div>

        <div class="filter-group">
          <select v-model="selectedCategory" class="filter-select">
            <option value="">All Categories</option>
            <option value="construction">Construction</option>
            <option value="hospitality">Hospitality</option>
            <option value="manufacturing">Manufacturing</option>
            <option value="healthcare">Healthcare</option>
            <option value="logistics">Logistics</option>
          </select>
        </div>

        <div class="filter-group">
          <select v-model="selectedLocation" class="filter-select">
            <option value="">All Locations</option>
            <option value="central">Central</option>
            <option value="east">East</option>
            <option value="west">West</option>
            <option value="north">North</option>
            <option value="south">South</option>
          </select>
        </div>

        <button @click="applyFilters" class="btn btn-primary">
          Apply Filters
        </button>
      </div>
    </div>

    <!-- Job Listings -->
    <div class="jobs-container">
      <div v-if="loading" class="loading">
        <p>Loading jobs...</p>
      </div>

      <div v-else-if="filteredJobs.length === 0" class="no-results">
        <p>No jobs found. Try adjusting your filters.</p>
      </div>

      <div v-else class="jobs-grid">
        <JobCard
          v-for="job in filteredJobs"
          :key="job.id"
          :job="job"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import JobCard from '../components/JobCard.vue'

export default {
  name: 'JobListings',
  components: {
    JobCard
  },
  setup() {
    const store = useStore()
    
    const searchQuery = ref('')
    const selectedCategory = ref('')
    const selectedLocation = ref('')
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

      return result
    })

    const applyFilters = async () => {
      loading.value = true
      try {
        await store.dispatch('jobs/fetchJobs', {
          category: selectedCategory.value,
          location: selectedLocation.value
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
      selectedLocation,
      loading,
      filteredJobs,
      applyFilters
    }
  }
}
</script>

<style scoped>
.job-listings {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 10px;
}

.page-header p {
  font-size: 1.1rem;
  color: #7f8c8d;
}

.filters-section {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
}

.filters-container {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  align-items: center;
}

.filter-group {
  flex: 1;
  min-width: 200px;
}

.search-input,
.filter-select {
  width: 100%;
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
  min-height: 400px;
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

@media (max-width: 768px) {
  .filters-container {
    flex-direction: column;
  }

  .filter-group {
    width: 100%;
  }

  .jobs-grid {
    grid-template-columns: 1fr;
  }
}
</style>


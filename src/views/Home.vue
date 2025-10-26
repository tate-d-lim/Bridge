<template>
  <div class="home">
    <!-- Hero Section - Only show when not logged in -->
    <section v-if="!isAuthenticated" class="hero">
      <div class="hero-content">
        <h1>Welcome to Bridge</h1>
        <p class="hero-subtitle">Connecting Singapore Employers with Skilled Migrant Workers</p>
        <p class="hero-description">
          Skip the expensive middlemen. Find jobs or hire talent directly through our platform.
        </p>
        <div class="hero-buttons">
          <router-link to="/login" class="btn btn-primary">Login</router-link>
          <router-link to="/register" class="btn btn-secondary">Sign Up</router-link>
        </div>
      </div>
      <div class="hero-image">
        <img src="../assets/migrantWorkerHappy.png" alt="Happy Migrant Workers" />
      </div>
    </section>

    <!-- How It Works Section -->
    <HowItWorks />

    <!-- Category Chips Section -->
    <CategoryChips @category-selected="onCategorySelected" />

    <!-- Call to Action for Browse Jobs -->
    <section class="cta-browse-jobs">
      <div class="container">
        <h2>Ready to Find Your Next Job?</h2>
        <p>Browse through hundreds of job opportunities from top employers in Singapore</p>
        <router-link to="/browse-jobs" class="btn btn-primary btn-large">Browse All Jobs</router-link>
      </div>
    </section>

    <!-- Stats Section - Only show when not logged in -->
    <StatsSection v-if="!isAuthenticated" />

    <!-- CTA Section - Only show when not logged in -->
    <section v-if="!isAuthenticated" class="cta">
      <h2>Ready to Get Started?</h2>
      <p>Join thousands of employers and job seekers on Bridge today</p>
      <router-link to="/register" class="btn btn-primary btn-large">Create Free Account</router-link>
    </section>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import CategoryChips from '../components/CategoryChips.vue'
import HowItWorks from '../components/HowItWorks.vue'
import StatsSection from '../components/StatsSection.vue'

export default {
  name: 'Home',
  components: {
    CategoryChips,
    HowItWorks,
    StatsSection
  },
  setup() {
    const store = useStore()
    const loading = computed(() => store.getters['jobs/loading'])
    
    const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])

    const onCategorySelected = (category) => {
      // Redirect to browse jobs page with selected category
      window.location.href = `/browse-jobs?category=${category.id}`
    }

    const fetchJobs = async () => {
      try {
        await store.dispatch('jobs/fetchJobs')
      } catch (error) {
        console.error('Error fetching jobs:', error)
      }
    }

    onMounted(() => {
      fetchJobs()
    })

    return {
      isAuthenticated,
      loading,
      onCategorySelected
    }
  }
}
</script>

<style scoped>
/* Home page specific styles - most styles are now in external stylesheet */
.home {
  width: 100%;
}

.hero {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 60px;
  gap: 80px;
  background: var(--);
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.hero-content {
  flex: 1;
  max-width: 600px;
}

.hero h1 {
  font-size: 3.5rem;
  color: var(--text);
  margin-bottom: 20px;
  font-weight: 700;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.5rem;
  color: var(--primary);
  margin-bottom: 15px;
  font-weight: 600;
}

.hero-description {
  font-size: 1.1rem;
  color: var(--text-muted);
  margin-bottom: 30px;
  line-height: 1.6;
}

.hero-buttons {
  display: flex;
  gap: 15px;
}

.hero-image {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 600px;
}

.hero-image img {
  width: 100%;
  max-width: 500px;
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
  color: var(--text);
  margin-bottom: 15px;
}

.jobs-header p {
  font-size: 1.1rem;
  color: var(--text-muted);
}

.filters-container {
  display: flex;
  gap: 15px;
  margin-bottom: 40px;
  flex-wrap: wrap;
  background: var(--bg);
  padding: 25px;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
}

.search-input,
.filter-select {
  flex: 1;
  min-width: 200px;
  padding: 12px 15px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--bg);
  color: var(--text);
}

.search-input:focus,
.filter-select:focus {
  outline: none;
  border-color: var(--primary);
}

.jobs-container {
  min-height: 300px;
}

.loading,
.no-results {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-muted);
  font-size: 1.1rem;
}

.jobs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
}


.cta-browse-jobs {
  background: var(--bg-light);
  padding: 80px 20px;
  text-align: center;
}

.cta-browse-jobs h2 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 16px;
  line-height: 1.2;
}

.cta-browse-jobs p {
  font-size: 1.1rem;
  color: var(--text-muted);
  margin-bottom: 30px;
  line-height: 1.6;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.cta {
  background: linear-gradient(135deg, var(--primary), oklch(0.3 0.1 245));
  color: var(--bg-light);
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


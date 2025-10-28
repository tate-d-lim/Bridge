<template>
  <div class="home">
    <!-- Hero Section - Only show when not logged in -->
    <section v-if="!isAuthenticated" class="hero">
      <div class="hero-content">
        <h1>Welcome to Bridge</h1>
        <p class="hero-subtitle">Eliminating the gap between <br>
          Singaporean Employers and YOU</p>
        <p class="hero-description">
          Build your career in Singapore today.
        </p>
        <div class="hero-buttons">
          <router-link to="/login" class="btn btn-primary">Login</router-link>
          <router-link to="/register" class="btn btn-secondary">Sign Up</router-link>
        </div>
      </div>
      <div class="hero-bg">
        <div class="carousel-container">
          <div class="carousel-wrapper">
            <div
              class="carousel-slide"
              :class="{ active: currentSlide === index }"
              v-for="(image, index) in heroImages"
              :key="index"
            >
              <img :src="image.src" :alt="image.alt" />
            </div>
          </div>

          <!-- Carousel Navigation Dots -->
          <div class="carousel-dots">
            <button
              v-for="(image, index) in heroImages"
              :key="index"
              @click="currentSlide = index"
              class="dot"
              :class="{ active: currentSlide === index }"
            ></button>
          </div>

          <!-- Carousel Arrows -->
          <button @click="previousSlide" class="carousel-arrow carousel-arrow-prev">‹</button>
          <button @click="nextSlide" class="carousel-arrow carousel-arrow-next">›</button>
        </div>
        <div class="hero-overlay"></div>
      </div>
    </section>

    <!-- How It Works Section -->
    <HowItWorks />

    <!-- Category Chips Section -->
    <CategoryChips @category-selected="onCategorySelected" class = ""/>
    <!-- Stats Section - Only show when not logged in -->
    <StatsSection v-if="!isAuthenticated" class = "tate"/>
    <!-- Call to Action for Browse Jobs -->
    <section class="cta-browse-jobs tate">
      <div class="container">
        <h2>Ready to Find Your Next Job?</h2>
        <p>Browse through hundreds of job opportunities from top employers in Singapore</p>
        <router-link to="/browse-jobs" class="btn btn-primary btn-large">Browse All Jobs</router-link>
      </div>
    </section>


  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import CategoryChips from '../components/CategoryChips.vue'
import HowItWorks from '../components/HowItWorks.vue'
import StatsSection from '../components/StatsSection.vue'
import migrantWorkerHappy from '../assets/migrantWorkerHappy.png'
import migrantWorker1 from '../assets/migrantWorker1.png'
import migrantWorker2 from '../assets/migrantWorker2.png'

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
    
    const currentSlide = ref(0)
    let autoSlideInterval = null

    const heroImages = [
      { src: migrantWorkerHappy, alt: 'Happy Migrant Workers' },
      { src: migrantWorker1, alt: 'Migrant Workers' },
      { src: migrantWorker2, alt: 'Professional Workers' }
    ]

    const nextSlide = () => {
      currentSlide.value = (currentSlide.value + 1) % heroImages.length
    }

    const previousSlide = () => {
      currentSlide.value = (currentSlide.value - 1 + heroImages.length) % heroImages.length
    }

    const startAutoSlide = () => {
      autoSlideInterval = setInterval(() => {
        nextSlide()
      }, 5000) // Change slide every 5 seconds
    }

    const stopAutoSlide = () => {
      if (autoSlideInterval) {
        clearInterval(autoSlideInterval)
      }
    }

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
      startAutoSlide()
    })

    onUnmounted(() => {
      stopAutoSlide()
    })

    return {
      isAuthenticated,
      loading,
      onCategorySelected,
      heroImages,
      currentSlide,
      nextSlide,
      previousSlide
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
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 180px 60px 160px; /* lower the content visually */
  gap: 80px;
  width: 100%;
  margin: 0;
  overflow: hidden;
}

.hero-content {
  flex: 1;
  max-width: 600px;
  position: relative;
  z-index: 1; /* above bg */
  text-align: center; /* center text horizontally */
  margin: 0 auto; /* center the block */
}

.hero h1 {
  font-size: 3.5rem;
  color: #fff;
  margin-bottom: 20px;
  font-weight: 700;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.5rem;
  color: #fff;
  margin-bottom: 15px;
  font-weight: 600;
}

.hero-description {
  font-size: 1.1rem;
  color: #fff;
  margin-bottom: 30px;
  line-height: 1.6;
}

.hero-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

/* Background carousel sits behind content */
.hero-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1;
}

/* Carousel Styles */
.carousel-container {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.carousel-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.carousel-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
}

.carousel-slide.active {
  opacity: 1;
}

.carousel-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.9;
}

/* Carousel Navigation Dots */
.carousel-dots {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  gap: 8px;
  z-index: 2;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: all 0.3s;
}

.dot.active {
  background: var(--primary);
  width: 24px;
  border-radius: 5px;
}

/* Carousel Arrows */
.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 24px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  z-index: 2;
}

.carousel-arrow:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
}

.carousel-arrow-prev {
  left: 10px;
}

.carousel-arrow-next {
  right: 10px;
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

.tate {
  background: rgb(205, 214, 255);
  /* background-color: oklch(0.6 0.3 245); */
  color: black;

}

.cta-browse-jobs {
  /* background: rgb(232, 240, 255); */
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

/* Make hero buttons white without affecting global buttons */
.hero .hero-buttons .btn {
  background: #ffffff;
  color: var(--text);
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.hero .hero-buttons .btn:hover {
  background: rgba(255, 255, 255, 0.9);
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
    padding: 80px 20px;
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


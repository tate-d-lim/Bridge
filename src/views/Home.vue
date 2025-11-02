<template>
  <div class="home">
    <!-- Hero Section - Only show when not logged in -->
    <section v-if="!isAuthenticated" class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            <GradientText
              :colors="['var(--primary)', '#ffffff', 'oklch(0.7 0.1 245)', '#ffffff', 'var(--primary)']"
              :animationSpeed="3"
            >
              BRIDGE
            </GradientText>
          </h1>
          <p class="hero-subtitle">
            <TextType 
              :text="['Matching Job-Seekers with Singaporean Employers', 'Connecting Talent with Opportunities', 'Building Careers in Singapore']"
              :typingSpeed="75"
              :pauseDuration="2000"
              :showCursor="true"
              cursorCharacter="|"
            />
          </p>
          <p class="hero-description">
            Your pathway to success in Singapore. Connect with top employers and build your career today.
          </p>
          <div class="hero-actions">
            <router-link to="/login" class="btn btn-primary btn-hero">
              Sign In
            </router-link>
            <router-link to="/register" class="btn btn-secondary btn-hero">
              Register
            </router-link>
          </div>
        </div>
      </div>
      
      <!-- Carousel Background -->
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
              :aria-label="`Go to slide ${index + 1}`"
            ></button>
          </div>

          <!-- Carousel Arrows -->
          <button 
            @click="previousSlide" 
            class="carousel-arrow carousel-arrow-prev"
            aria-label="Previous slide"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            @click="nextSlide" 
            class="carousel-arrow carousel-arrow-next"
            aria-label="Next slide"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div class="hero-overlay"></div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="how-it-works-section">
      <HowItWorks />
    </section>

    <!-- Stats Section - Only show when not logged in -->
    <section v-if="!isAuthenticated" class="stats-section">
      <StatsSection />
    </section>
    
    <!-- Category Chips Section -->
    <section class="categories-section">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">Explore Opportunities</h2>
          <p class="section-description">
            Browse jobs by category and find the perfect match for your skills
          </p>
        </div>
        <CategoryChips @category-selected="onCategorySelected" />
      </div>
    </section>

    <!-- Call to Action Section -->
    <section class="cta-section">
      <div class="section-container">
        <div class="cta-content">
          <div class="cta-icon">
            <img src="../assets/briefcase.svg" alt="Briefcase" class="cta-icon-img" />
          </div>
          <h2 class="cta-title">Ready to Find Your Next Job?</h2>
          <p class="cta-description">
            Browse through hundreds of job opportunities from top employers in Singapore
          </p>
          <router-link to="/browse-jobs" class="btn btn-primary btn-cta">
            Browse All Jobs
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </router-link>
        </div>
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
import GradientText from '../components/GradientText.vue'
import TextType from '../components/TextType.vue'
import { getCarouselImagesFromConfig } from '../config/carousel.js'

export default {
  name: 'Home',
  components: {
    CategoryChips,
    HowItWorks,
    StatsSection,
    TextType,
    GradientText
  },
  setup() {
    const store = useStore()
    const loading = computed(() => store.getters['jobs/loading'])
    const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])
    
    const currentSlide = ref(0)
    let autoSlideInterval = null

    // Automatically load ALL images from src/assets/carousel/ folder
    // Just add images to that folder and they'll appear automatically!
    const heroImages = getCarouselImagesFromConfig()

    const nextSlide = () => {
      currentSlide.value = (currentSlide.value + 1) % heroImages.length
    }

    const previousSlide = () => {
      currentSlide.value = (currentSlide.value - 1 + heroImages.length) % heroImages.length
    }

    const startAutoSlide = () => {
      autoSlideInterval = setInterval(() => {
        nextSlide()
      }, 5000)
    }

    const stopAutoSlide = () => {
      if (autoSlideInterval) {
        clearInterval(autoSlideInterval)
      }
    }

    const onCategorySelected = (category) => {
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
.home {
  width: 100%;
  overflow-x: hidden;
}

/* Hero Section */
.hero-section {
  position: relative;
  min-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 120px 20px 80px;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.hero-text {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: clamp(3rem, 8vw, 5rem);
  color: #fff;
  margin-bottom: 24px;
  font-weight: 700;
  line-height: 1.1;
  animation: fadeInUp 0.8s ease-out;
}

.hero-subtitle {
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  color: #fff;
  margin-bottom: 16px;
  font-weight: 600;
  min-height: 60px;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.hero-description {
  font-size: clamp(1rem, 2vw, 1.125rem);
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 40px;
  line-height: 1.6;
  animation: fadeInUp 0.8s ease-out 0.4s both;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  animation: fadeInUp 0.8s ease-out 0.6s both;
}

.btn-hero {
  padding: 14px 32px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
  min-width: 140px;
}

.btn-primary.btn-hero {
  background: #fff;
  color: var(--text);
  border: 2px solid #fff;
}

.btn-primary.btn-hero:hover {
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.btn-secondary.btn-hero {
  background: transparent;
  color: #fff;
  border: 2px solid rgba(255, 255, 255, 0.6);
}

.btn-secondary.btn-hero:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.9);
}

/* Hero Background */
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
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.4) 100%);
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
  transition: opacity 0.8s ease-in-out;
}

.carousel-slide.active {
  opacity: 1;
}

.carousel-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Carousel Navigation Dots */
.carousel-dots {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  gap: 10px;
  z-index: 3;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  border-radius: 20px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.dot:hover {
  background: rgba(255, 255, 255, 0.6);
}

.dot.active {
  background: #fff;
  width: 24px;
  border-radius: 5px;
}

/* Carousel Arrows */
.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 3;
  padding: 0;
}

.carousel-arrow:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-50%) scale(1.1);
}

.carousel-arrow-prev {
  left: 24px;
}

.carousel-arrow-next {
  right: 24px;
}

/* Section Styles */
.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-header {
  text-align: center;
  margin-bottom: 48px;
}

.section-title {
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: 700;
  color: var(--text);
  margin-bottom: 16px;
  line-height: 1.2;
}

.section-description {
  font-size: clamp(1rem, 2vw, 1.125rem);
  color: var(--text-muted);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

/* How It Works Section */
.how-it-works-section {
  padding: 80px 0;
  background: var(--bg);
}

/* Stats Section */
.stats-section {
  padding: 80px 0;
  background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.05) 0%, var(--bg) 100%);
}

/* Categories Section */
.categories-section {
  padding: 80px 0;
  background: var(--bg-light);
}

/* CTA Section */
.cta-section {
  padding: 100px 0;
  background: linear-gradient(135deg, var(--primary) 0%, oklch(0.4 0.15 245) 100%);
  position: relative;
  overflow: hidden;
}

.cta-section::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.cta-content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 700px;
  margin: 0 auto;
}

.cta-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cta-icon-img {
  width: 40px;
  height: 40px;
  filter: brightness(0) invert(1);
}

.cta-title {
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: 700;
  color: #fff;
  margin-bottom: 16px;
  line-height: 1.2;
}

.cta-description {
  font-size: clamp(1rem, 2vw, 1.125rem);
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 32px;
  line-height: 1.6;
}

.btn-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 16px 40px;
  font-size: 1.125rem;
  font-weight: 600;
  background: #fff;
  color: var(--primary);
  border: 2px solid #fff;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.btn-cta:hover {
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
}

.btn-icon {
  transition: transform 0.3s ease;
}

.btn-cta:hover .btn-icon {
  transform: translateX(4px);
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-section {
    min-height: 70vh;
    padding: 100px 20px 60px;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .btn-hero {
    width: 100%;
    max-width: 280px;
  }

  .carousel-arrow {
    width: 40px;
    height: 40px;
  }

  .carousel-arrow-prev {
    left: 12px;
  }

  .carousel-arrow-next {
    right: 12px;
  }

  .carousel-dots {
    bottom: 20px;
    padding: 6px 12px;
  }

  .how-it-works-section,
  .stats-section,
  .categories-section {
    padding: 60px 0;
  }

  .cta-section {
    padding: 60px 0;
  }

  .section-header {
    margin-bottom: 32px;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 80px 16px 40px;
  }

  .carousel-dots {
    gap: 8px;
  }

  .dot {
    width: 8px;
    height: 8px;
  }

  .dot.active {
    width: 20px;
  }
}
</style>

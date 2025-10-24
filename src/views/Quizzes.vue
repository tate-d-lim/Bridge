<template>
  <div class="quizzes-page">
    <div class="quizzes-container">
      <div class="page-header">
        <h1>Skill Development Quizzes</h1>
        <p>Take AI-generated quizzes to upskill and earn badges</p>
      </div>

      <!-- Quiz Levels -->
      <div class="quiz-levels">
        <!-- Beginner Level -->
        <div class="level-section">
          <h2 class="level-title beginner">🟢 Beginner Level</h2>
          <div class="category-carousel">
            <div class="carousel-container">
              <div class="carousel-track" :style="{ transform: `translateX(-${beginnerCarouselIndex * 100}%)` }">
                <div v-for="topic in topics" :key="`beginner-${topic.id}`" class="carousel-slide">
                  <div class="card card-interactive quiz-card" @click="startQuiz(topic.name, 'beginner')">
                    <div class="quiz-icon">{{ topic.icon }}</div>
                    <h3>{{ topic.name }}</h3>
                    <p>{{ topic.description }}</p>
                  </div>
                </div>
              </div>
              <button 
                class="carousel-btn prev" 
                @click="prevBeginner"
                :disabled="beginnerCarouselIndex === 0"
              >
                ‹
              </button>
              <button 
                class="carousel-btn next" 
                @click="nextBeginner"
                :disabled="beginnerCarouselIndex >= maxIndex"
              >
                ›
              </button>
            </div>
          </div>
        </div>

        <!-- Intermediate Level -->
        <div class="level-section">
          <h2 class="level-title intermediate">🟡 Intermediate Level</h2>
          <div class="category-carousel">
            <div class="carousel-container">
              <div class="carousel-track" :style="{ transform: `translateX(-${intermediateCarouselIndex * 100}%)` }">
                <div v-for="topic in topics" :key="`intermediate-${topic.id}`" class="carousel-slide">
                  <div class="card card-interactive quiz-card" @click="startQuiz(topic.name, 'intermediate')">
                    <div class="quiz-icon">{{ topic.icon }}</div>
                    <h3>{{ topic.name }}</h3>
                    <p>{{ topic.description }}</p>
                  </div>
                </div>
              </div>
              <button 
                class="carousel-btn prev" 
                @click="prevIntermediate"
                :disabled="intermediateCarouselIndex === 0"
              >
                ‹
              </button>
              <button 
                class="carousel-btn next" 
                @click="nextIntermediate"
                :disabled="intermediateCarouselIndex >= maxIndex"
              >
                ›
              </button>
            </div>
          </div>
        </div>

        <!-- Advanced Level -->
        <div class="level-section">
          <h2 class="level-title advanced">🔴 Advanced Level</h2>
          <div class="category-carousel">
            <div class="carousel-container">
              <div class="carousel-track" :style="{ transform: `translateX(-${advancedCarouselIndex * 100}%)` }">
                <div v-for="topic in topics" :key="`advanced-${topic.id}`" class="carousel-slide">
                  <div class="card card-interactive quiz-card" @click="startQuiz(topic.name, 'advanced')">
                    <div class="quiz-icon">{{ topic.icon }}</div>
                    <h3>{{ topic.name }}</h3>
                    <p>{{ topic.description }}</p>
                  </div>
                </div>
              </div>
              <button 
                class="carousel-btn prev" 
                @click="prevAdvanced"
                :disabled="advancedCarouselIndex === 0"
              >
                ‹
              </button>
              <button 
                class="carousel-btn next" 
                @click="nextAdvanced"
                :disabled="advancedCarouselIndex >= maxIndex"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { quizApi } from '../services/api'

export default {
  name: 'Quizzes',
  setup() {
    const router = useRouter()
    const store = useStore()

    // Carousel indices
    const beginnerCarouselIndex = ref(0)
    const intermediateCarouselIndex = ref(0)
    const advancedCarouselIndex = ref(0)

    // Topics for each level
    const topics = ref([
      {
        id: 'construction-basics',
        name: 'Construction Basics',
        description: 'Learn fundamental construction concepts',
        icon: '🏗️'
      },
      {
        id: 'workplace-safety',
        name: 'Workplace Safety',
        description: 'Essential safety protocols and procedures',
        icon: '🛡️'
      },
      {
        id: 'spelling-quiz',
        name: 'Spelling Quiz',
        description: 'Improve your English spelling skills',
        icon: '📝'
      }
    ])

    // Computed properties
    const maxIndex = computed(() => Math.ceil(topics.value.length / 2) - 1)

    // Carousel navigation functions
    const nextBeginner = () => {
      if (beginnerCarouselIndex.value < maxIndex.value) {
        beginnerCarouselIndex.value++
      }
    }

    const prevBeginner = () => {
      if (beginnerCarouselIndex.value > 0) {
        beginnerCarouselIndex.value--
      }
    }

    const nextIntermediate = () => {
      if (intermediateCarouselIndex.value < maxIndex.value) {
        intermediateCarouselIndex.value++
      }
    }

    const prevIntermediate = () => {
      if (intermediateCarouselIndex.value > 0) {
        intermediateCarouselIndex.value--
      }
    }

    const nextAdvanced = () => {
      if (advancedCarouselIndex.value < maxIndex.value) {
        advancedCarouselIndex.value++
      }
    }

    const prevAdvanced = () => {
      if (advancedCarouselIndex.value > 0) {
        advancedCarouselIndex.value--
      }
    }

    // Start quiz function
    const startQuiz = async (category, difficulty) => {
      // Handle spelling quiz routing
      if (category === 'Spelling Quiz') {
        router.push('/spelling-quiz')
        return
      }
      
      // Create a URL-safe identifier for the quiz
      const quizId = `${category.toLowerCase().replace(/\s+/g, '-')}-${difficulty}`
      
      // Navigate to quiz take page with the quiz identifier
      router.push(`/quiz-take/${quizId}`)
    }

    onMounted(() => {
      console.log('Quizzes page mounted')
    })

    return {
      topics,
      beginnerCarouselIndex,
      intermediateCarouselIndex,
      advancedCarouselIndex,
      maxIndex,
      nextBeginner,
      prevBeginner,
      nextIntermediate,
      prevIntermediate,
      nextAdvanced,
      prevAdvanced,
      startQuiz
    }
  }
}
</script>

<style scoped>
.quizzes-page {
  min-height: calc(100vh - 70px);
  background: var(--bg-light);
  padding: 20px;
}

.quizzes-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 2.5rem;
  color: var(--text);
  margin-bottom: 10px;
}

.page-header p {
  font-size: 1.2rem;
  color: var(--text-muted);
}

.quiz-levels {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.level-section {
  background: var(--bg-light);
  border-radius: 16px;
  padding: 30px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
}

.level-title {
  font-size: 1.8rem;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.level-title.beginner {
  color: #10b981;
}

.level-title.intermediate {
  color: #f59e0b;
}

.level-title.advanced {
  color: #ef4444;
}

.category-carousel {
  position: relative;
  overflow: hidden;
}

.carousel-container {
  position: relative;
  width: 100%;
}

.carousel-track {
  display: flex;
  transition: transform 0.3s ease-in-out;
}

.carousel-slide {
  flex: 0 0 50%;
  padding: 0 10px;
  min-width: 0;
}

.quiz-card {
  background: var(--bg-light);
  border: 2px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.quiz-card:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.quiz-icon {
  font-size: 2.5rem;
  margin-bottom: 15px;
}

.quiz-card h3 {
  font-size: 1.3rem;
  color: var(--text);
  margin-bottom: 10px;
}

.quiz-card p {
  color: var(--text-muted);
  font-size: 0.9rem;
  line-height: 1.4;
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
}

.carousel-btn:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-50%) scale(1.1);
}

.carousel-btn:disabled {
  background: var(--border);
  cursor: not-allowed;
  opacity: 0.5;
}

.carousel-btn.prev {
  left: 10px;
}

.carousel-btn.next {
  right: 10px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .quizzes-page {
    padding: 10px;
  }
  
  .level-section {
    padding: 20px;
  }
  
  .carousel-slide {
    flex: 0 0 100%;
  }
  
  .quiz-card {
    height: 180px;
  }
  
  .quiz-icon {
    font-size: 2rem;
  }
  
  .quiz-card h3 {
    font-size: 1.1rem;
  }
  
  .quiz-card p {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .page-header h1 {
    font-size: 2rem;
  }
  
  .page-header p {
    font-size: 1rem;
  }
  
  .level-title {
    font-size: 1.5rem;
  }
  
  .quiz-card {
    height: 160px;
    padding: 15px;
  }
}
</style>
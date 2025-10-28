<template>
  <div class="quizzes-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <div class="hero-icon">
          <img src="/icons/brain.svg" alt="Brain" />
        </div>
        <h1>Skill Development Quizzes</h1>
        <p>
          Take AI-generated quizzes to test your skills and knowledge. Choose your difficulty level and start learning today.
        </p>
      </div>
    </section>

    <!-- Quiz Content -->
    <section class="quiz-content">
      <div v-for="(difficulty, diffIndex) in difficulties" :key="difficulty.level" class="quiz-section">
        <!-- Difficulty Header -->
        <div class="difficulty-header">
          <div class="color-bar" :class="difficulty.colorClass"></div>
          <span class="badge" :class="difficulty.badgeClass">
            {{ difficulty.level }} Level
          </span>
          <div class="header-line" :class="difficulty.colorClass + '-line'"></div>
        </div>

        <!-- Quiz Cards Grid -->
        <div class="quiz-grid">
          <div 
            v-for="(quiz, quizIndex) in difficulty.quizzes" 
            :key="quiz.id"
            class="quiz-card"
            :class="difficulty.colorClass + '-card'"
            @click="startQuiz(quiz.title, difficulty.level)"
          >
            <div class="quiz-gradient" :class="difficulty.colorClass"></div>
            <div class="quiz-card-content">
              <div class="quiz-card-header">
                <div class="quiz-icon" :class="difficulty.iconBgClass">
                  <img :src="quiz.icon" :alt="quiz.title" />
                </div>
                <span class="duration-badge">
                  <img src="/icons/clock.svg" alt="Clock" class="badge-icon" />
                  {{ quiz.duration }}
                </span>
              </div>
              <h3>{{ quiz.title }}</h3>
              <p>{{ quiz.description }}</p>
              <div class="quiz-info">
                <div class="info-item">
                  <img src="/icons/file-text.svg" alt="Questions" class="info-icon" />
                  <span>{{ quiz.questions }} questions</span>
                </div>
              </div>
              <button class="start-btn">
                <img src="/icons/play.svg" alt="Play" class="btn-icon" />
                Start Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Bottom CTA -->
    <section class="bottom-cta">
      <div class="cta-card">
        <img src="/icons/sparkles.svg" alt="Award" class="cta-icon" />
        <h3>Ready to Test Your Skills?</h3>
        <p>
          Complete quizzes to earn certificates and showcase your knowledge to potential employers.
        </p>
        <div class="cta-buttons">
          <router-link to="/achievements" class="btn btn-primary">View My Achievements</router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'Quizzes',
  setup() {
    const router = useRouter()

    const difficulties = ref([
      {
        level: "Beginner",
        colorClass: "green",
        badgeClass: "green-badge",
        iconBgClass: "green-icon-bg",
        quizzes: [
          {
            id: "spelling-basics",
            title: "Spelling Quiz",
            description: "Improve your English spelling skills",
            icon: "/icons/file-text.svg",
            duration: "10 min",
            questions: 5
          },
          {
            id: "basic-safety",
            title: "Basic Safety",
            description: "Introduction to workplace safety",
            icon: "/icons/check-circle.svg",
            duration: "10 min",
            questions: 5
          },

          {
            id: "construction-basics",
            title: "Construction Basics",
            description: "Learn fundamental construction concepts",
            icon: "/icons/hammer.svg",
            duration: "10 min",
            questions: 5
          },
        ]
      },
      {
        level: "Intermediate",
        colorClass: "amber",
        badgeClass: "amber-badge",
        iconBgClass: "amber-icon-bg",
        quizzes: [
          {
            id: "spelling-basics",
            title: "Spelling Quiz",
            description: "Improve your English spelling skills",
            icon: "/icons/file-text.svg",
            duration: "10 min",
            questions: 5
          },
          {
            id: "workplace-safety-inter",
            title: "Workplace Safety",
            description: "Essential safety protocols and procedures",
            icon: "/icons/check-circle.svg",
            duration: "10 min",
            questions: 5
          },

          {
            id: "communication",
            title: "Communication Skills",
            description: "Effective workplace communication",
            icon: "/icons/users.svg",
            duration: "10 min",
            questions: 5
          }



        ]
      },
      {
        level: "Advanced",
        colorClass: "red",
        badgeClass: "red-badge",
        iconBgClass: "red-icon-bg",
        quizzes: [
          {
            id: "spelling-basics",
            title: "Spelling Quiz",
            description: "Improve your English spelling skills",
            icon: "/icons/file-text.svg",
            duration: "10 min",
            questions: 5
          },

          {
            id: "safety-management",
            title: "Safety Management",
            description: "Advanced safety protocols and leadership",
            icon: "/icons/check-circle.svg",
            duration: "10 min",
            questions: 5
          },

          {
            id: "construction-advanced",
            title: "Advanced Construction",
            description: "Master complex construction techniques",
            icon: "/icons/hammer.svg",
            duration: "10 min",
            questions: 5
          },
        ]
      }
    ])

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

    return {
      difficulties,
      startQuiz
    }
  }
}
</script>

<style scoped>
.quizzes-page {
  min-height: calc(100vh - 70px);
  background: linear-gradient(to bottom, var(--bg), var(--bg-light));
}

/* Hero Section */
.hero-section {
  background: linear-gradient(to bottom right, rgba(var(--primary-rgb), 0.1), var(--bg), var(--bg));
  border-bottom: 1px solid var(--border);
  padding: 48px 0;
}

.hero-content {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.hero-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(var(--primary-rgb), 0.1);
  margin: 0 auto 24px;
}

.hero-icon img {
  width: 32px;
  height: 32px;
}

.hero-content h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 16px;
  line-height: 1.2;
}

.hero-content p {
  font-size: 1rem;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.6;
}

/* Quiz Content */
.quiz-content {
  padding: 48px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.quiz-section {
  margin-bottom: 48px;
}

/* Difficulty Header */
.difficulty-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.color-bar {
  height: 3px;
  width: 48px;
  border-radius: 2px;
}

.color-bar.green {
  background: linear-gradient(to right, #10b981, #10b981);
}

.color-bar.amber {
  background: linear-gradient(to right, #f59e0b, #f59e0b);
}

.color-bar.red {
  background: linear-gradient(to right, #ef4444, #ef4444);
}

.badge {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 0.813rem;
  font-weight: 600;
  border: 1px solid;
}

.green-badge {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
  border-color: rgba(16, 185, 129, 0.2);
}

.amber-badge {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
  border-color: rgba(245, 158, 11, 0.2);
}

.red-badge {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border-color: rgba(239, 68, 68, 0.2);
}

.header-line {
  height: 3px;
  flex: 1;
  background: var(--border);
}

.header-line.green-line {
  background: #10b981;
}

.header-line.amber-line {
  background: #f59e0b;
}

.header-line.red-line {
  background: #ef4444;
}

/* Quiz Grid */
.quiz-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

/* Quiz Card */
.quiz-card {
  background: var(--bg);
  border: 2px solid transparent;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  height: 100%;
}

.quiz-card.green-card {
  border-color: #10b981;
}

.quiz-card.amber-card {
  border-color: #f59e0b;
}

.quiz-card.red-card {
  border-color: #ef4444;
}

.quiz-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.quiz-gradient {
  height: 3px;
  width: 100%;
}

.quiz-gradient.green {
  background: linear-gradient(to right, #10b981, #10b981);
}

.quiz-gradient.amber {
  background: linear-gradient(to right, #f59e0b, #f59e0b);
}

.quiz-gradient.red {
  background: linear-gradient(to right, #ef4444, #ef4444);
}

.quiz-card-content {
  padding: 20px;
}

.quiz-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.quiz-icon {
  padding: 12px;
  border-radius: 12px;
  border: 1px solid;
  transition: transform 0.3s;
}

.quiz-card:hover .quiz-icon {
  transform: scale(1.1);
}

.green-icon-bg {
  background: linear-gradient(to bottom right, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05));
  border-color: rgba(16, 185, 129, 0.1);
}

.amber-icon-bg {
  background: linear-gradient(to bottom right, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05));
  border-color: rgba(245, 158, 11, 0.1);
}

.red-icon-bg {
  background: linear-gradient(to bottom right, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05));
  border-color: rgba(239, 68, 68, 0.1);
}

.quiz-icon img {
  width: 24px;
  height: 24px;
  display: block;
}

.duration-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: var(--bg-light);
  border-radius: 4px;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.badge-icon {
  width: 12px;
  height: 12px;
}

.quiz-card-content h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 8px 0;
  transition: color 0.2s;
}

.quiz-card:hover h3 {
  color: var(--primary);
}

.quiz-card-content p {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0 0 16px 0;
  line-height: 1.4;
}

.quiz-info {
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.813rem;
  color: var(--text-muted);
}

.info-icon {
  width: 14px;
  height: 14px;
}

.start-btn {
  width: 100%;
  padding: 12px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.start-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-icon {
  width: 16px;
  height: 16px;
  filter: brightness(0) invert(1);
}

/* Bottom CTA */
.bottom-cta {
  padding: 48px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.cta-card {
  background: linear-gradient(to bottom right, rgba(var(--primary-rgb), 0.05), rgba(var(--primary-rgb), 0.1));
  border: 1px solid rgba(var(--primary-rgb), 0.2);
  border-radius: 12px;
  padding: 48px 32px;
  text-align: center;
}

.cta-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  opacity: 0.8;
}

.cta-card h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 8px 0;
}

.cta-card p {
  font-size: 1rem;
  color: var(--text-muted);
  max-width: 600px;
  margin: 0 auto 24px;
  line-height: 1.6;
}

.cta-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.cta-buttons .btn {
  text-decoration: none;
  display: inline-block;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: var(--bg);
  color: var(--text);
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  background: var(--bg-light);
}

.btn-primary {
  background: var(--primary);
  color: white;
  border: none;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 1.75rem;
  }

  .quiz-grid {
    grid-template-columns: 1fr;
  }

  .cta-buttons {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>

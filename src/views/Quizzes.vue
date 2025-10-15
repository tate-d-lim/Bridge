<template>
  <div class="quizzes-page">
    <div class="quizzes-container">
      <div class="page-header">
        <h1>Skill Development Quizzes</h1>
        <p>Take AI-generated quizzes to upskill and earn badges</p>
      </div>

      <!-- Available Quizzes -->
      <div class="quizzes-section">
        <h2>Available Quizzes</h2>
        <div class="quizzes-grid">
          <div class="card card-interactive quiz-card">
            <div class="quiz-icon">🔨</div>
            <h3>Construction Basics</h3>
            <p>Test your knowledge on construction fundamentals</p>
            <div class="quiz-meta">
              <span>⏱️ 15 mins</span>
              <span>📊 Beginner</span>
            </div>
            <router-link to="/quizzes/1" class="btn btn-primary btn-block">
              Start Quiz
            </router-link>
          </div>

          <div class="card card-interactive quiz-card">
            <div class="quiz-icon">⚡</div>
            <h3>Electrical Safety</h3>
            <p>Learn about electrical safety procedures</p>
            <div class="quiz-meta">
              <span>⏱️ 20 mins</span>
              <span>📊 Intermediate</span>
            </div>
            <router-link to="/quizzes/2" class="btn btn-primary btn-block">
              Start Quiz
            </router-link>
          </div>

          <div class="card card-interactive quiz-card">
            <div class="quiz-icon">🔧</div>
            <h3>Plumbing Skills</h3>
            <p>Master plumbing techniques and best practices</p>
            <div class="quiz-meta">
              <span>⏱️ 25 mins</span>
              <span>📊 Advanced</span>
            </div>
            <router-link to="/quizzes/3" class="btn btn-primary btn-block">
              Start Quiz
            </router-link>
          </div>
        </div>
      </div>

      <!-- My Badges -->
      <div class="badges-section">
        <h2>My Badges</h2>
        <div v-if="badges.length === 0" class="empty-state">
          <p>You haven't earned any badges yet. Complete quizzes to earn badges!</p>
        </div>
        <div v-else class="badges-grid">
          <div v-for="badge in badges" :key="badge.id" class="card badge-card">
            <div class="badge-icon">🏆</div>
            <h3>{{ badge.skill }}</h3>
            <p>{{ badge.level }} Level</p>
            <span class="badge-date">Earned {{ formatDate(badge.earnedAt) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'Quizzes',
  setup() {
    const store = useStore()
    const badges = ref([])

    const currentUser = computed(() => store.getters['auth/currentUser'])

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString()
    }

    onMounted(async () => {
      if (currentUser.value) {
        try {
          badges.value = await store.dispatch('quizzes/fetchUserBadges', currentUser.value.uid)
        } catch (error) {
          console.error('Error fetching badges:', error)
        }
      }
    })

    return {
      badges,
      formatDate
    }
  }
}
</script>

<style scoped>
.quizzes-page {
  min-height: calc(100vh - 70px);
  background: var(--bg-light);
  padding: 40px 20px;
}

.quizzes-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 50px;
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

.quizzes-section,
.badges-section {
  margin-bottom: 50px;
}

.quizzes-section h2,
.badges-section h2 {
  font-size: 2rem;
  color: var(--text);
  margin-bottom: 25px;
}

.quizzes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
}

.quiz-card {
  text-align: center;
}

.quiz-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.quiz-card h3 {
  font-size: 1.5rem;
  color: var(--text);
  margin-bottom: 10px;
}

.quiz-card p {
  color: var(--text-muted);
  margin-bottom: 20px;
}

.quiz-meta {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.badges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.badge-card {
  text-align: center;
}

.badge-icon {
  font-size: 3.5rem;
  margin-bottom: 15px;
}

.badge-card h3 {
  font-size: 1.3rem;
  color: var(--text);
  margin-bottom: 8px;
}

.badge-card p {
  color: var(--primary);
  font-weight: 600;
  margin-bottom: 10px;
}

.badge-date {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.empty-state {
  background: var(--bg-light);
  padding: 60px 20px;
  border-radius: 12px;
  text-align: center;
  color: var(--text-muted);
  border: 1px solid var(--border);
}
</style>


<template>
  <div class="quizzes-page">
    <div class="quizzes-container">
      <div class="page-header">
        <h1>Skill Development Quizzes</h1>
        <p>Take AI-generated quizzes to test your skills and knowledge</p>
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

          <div class="card card-interactive quiz-card">
            <div class="quiz-icon">📝</div>
            <h3>Spelling Challenge</h3>
            <p>Drag and drop letters to spell construction terms</p>
            <div class="quiz-meta">
              <span>⏱️ 10 mins</span>
              <span>📊 Beginner</span>
            </div>
            <router-link to="/spelling-quiz" class="btn btn-primary btn-block">
              Start Quiz
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Quizzes'
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

.quizzes-section {
  margin-bottom: 50px;
}

.quizzes-section h2 {
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
</style>


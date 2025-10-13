<template>
  <div class="quiz-take-page">
    <div class="quiz-container">
      <div class="quiz-header">
        <h1>Construction Basics Quiz</h1>
        <div class="quiz-progress">
          <span>Question {{ currentQuestion + 1 }} of 10</span>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
          </div>
        </div>
      </div>

      <div v-if="!quizCompleted" class="quiz-content">
        <div class="question-card">
          <h2>{{ questions[currentQuestion].question }}</h2>
          
          <div class="options">
            <div
              v-for="(option, index) in questions[currentQuestion].options"
              :key="index"
              :class="['option', { selected: selectedAnswer === index }]"
              @click="selectAnswer(index)"
            >
              <div class="option-letter">{{ String.fromCharCode(65 + index) }}</div>
              <div class="option-text">{{ option }}</div>
            </div>
          </div>

          <div class="quiz-actions">
            <button
              v-if="currentQuestion > 0"
              @click="previousQuestion"
              class="btn btn-secondary"
            >
              Previous
            </button>
            <button
              v-if="currentQuestion < questions.length - 1"
              @click="nextQuestion"
              :disabled="selectedAnswer === null"
              class="btn btn-primary"
            >
              Next
            </button>
            <button
              v-else
              @click="submitQuiz"
              :disabled="selectedAnswer === null"
              class="btn btn-primary"
            >
              Submit Quiz
            </button>
          </div>
        </div>
      </div>

      <div v-else class="quiz-results">
        <div class="results-card">
          <div class="score-circle">
            <h2>{{ score }}%</h2>
            <p>Your Score</p>
          </div>

          <h3>{{ score >= 80 ? '🎉 Congratulations!' : 'Keep Learning!' }}</h3>
          <p v-if="score >= 80">
            You've passed the quiz and earned a badge!
          </p>
          <p v-else>
            You need 80% or higher to earn a badge. Keep practicing!
          </p>

          <div class="results-actions">
            <router-link to="/quizzes" class="btn btn-secondary">
              Back to Quizzes
            </router-link>
            <button @click="retakeQuiz" class="btn btn-primary">
              Retake Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'QuizTake',
  setup() {
    const store = useStore()

    const currentQuestion = ref(0)
    const selectedAnswer = ref(null)
    const answers = ref([])
    const quizCompleted = ref(false)
    const score = ref(0)

    // Sample questions (in production, these would come from Gemini AI)
    const questions = ref([
      {
        question: 'What is the primary purpose of a hard hat on a construction site?',
        options: [
          'To look professional',
          'To protect from falling objects',
          'To identify workers',
          'To block sunlight'
        ],
        correctAnswer: 1
      },
      {
        question: 'Which tool is commonly used for measuring in construction?',
        options: [
          'Hammer',
          'Tape measure',
          'Screwdriver',
          'Wrench'
        ],
        correctAnswer: 1
      },
      // Add more questions...
    ])

    const progress = computed(() => {
      return ((currentQuestion.value + 1) / questions.value.length) * 100
    })

    const selectAnswer = (index) => {
      selectedAnswer.value = index
    }

    const nextQuestion = () => {
      if (selectedAnswer.value !== null) {
        answers.value[currentQuestion.value] = selectedAnswer.value
        currentQuestion.value++
        selectedAnswer.value = answers.value[currentQuestion.value] ?? null
      }
    }

    const previousQuestion = () => {
      currentQuestion.value--
      selectedAnswer.value = answers.value[currentQuestion.value] ?? null
    }

    const submitQuiz = async () => {
      answers.value[currentQuestion.value] = selectedAnswer.value
      
      // Calculate score
      let correct = 0
      answers.value.forEach((answer, index) => {
        if (answer === questions.value[index].correctAnswer) {
          correct++
        }
      })
      
      score.value = Math.round((correct / questions.value.length) * 100)
      quizCompleted.value = true

      // Submit to backend
      try {
        const user = store.getters['auth/currentUser']
        await store.dispatch('quizzes/submitQuizResult', {
          userId: user.uid,
          quizId: 'quiz-1',
          score: score.value,
          answers: answers.value
        })
      } catch (error) {
        console.error('Error submitting quiz:', error)
      }
    }

    const retakeQuiz = () => {
      currentQuestion.value = 0
      selectedAnswer.value = null
      answers.value = []
      quizCompleted.value = false
      score.value = 0
    }

    return {
      currentQuestion,
      selectedAnswer,
      questions,
      progress,
      quizCompleted,
      score,
      selectAnswer,
      nextQuestion,
      previousQuestion,
      submitQuiz,
      retakeQuiz
    }
  }
}
</script>

<style scoped>
.quiz-take-page {
  min-height: calc(100vh - 70px);
  background: #f8f9fa;
  padding: 40px 20px;
}

.quiz-container {
  max-width: 800px;
  margin: 0 auto;
}

.quiz-header {
  background: white;
  padding: 30px;
  border-radius: 12px 12px 0 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.quiz-header h1 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 20px;
}

.quiz-progress span {
  color: #7f8c8d;
  margin-bottom: 10px;
  display: block;
}

.progress-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #3498db;
  transition: width 0.3s;
}

.quiz-content {
  background: white;
  padding: 30px;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.question-card h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 30px;
}

.options {
  margin-bottom: 30px;
}

.option {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  margin-bottom: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.option:hover {
  border-color: #3498db;
  background: #f8f9fa;
}

.option.selected {
  border-color: #3498db;
  background: #e8f4f8;
}

.option-letter {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #2c3e50;
}

.option.selected .option-letter {
  background: #3498db;
  color: white;
}

.option-text {
  flex: 1;
  color: #2c3e50;
}

.quiz-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
}

.quiz-results {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.results-card {
  text-align: center;
}

.score-circle {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto 30px;
}

.score-circle h2 {
  font-size: 3.5rem;
  margin-bottom: 5px;
}

.score-circle p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.results-card h3 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 15px;
}

.results-card > p {
  color: #7f8c8d;
  font-size: 1.1rem;
  margin-bottom: 30px;
}

.results-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}
</style>


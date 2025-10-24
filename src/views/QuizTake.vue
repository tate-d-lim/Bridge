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
      const isPerfect = correct === questions.value.length
      quizCompleted.value = true

      // Submit to backend and update badges
      try {
        const user = store.getters['auth/currentUser']
        
        if (!user) {
          console.error('No user logged in')
          return
        }
        
        console.log('Submitting quiz result:', {
          userId: user.uid,
          score: score.value,
          isPerfect,
          isWin: score.value >= 80
        })
        
        await store.dispatch('quizzes/submitQuizResult', {
          userId: user.uid,
          quizId: 'quiz-1',
          score: score.value,
          answers: answers.value,
          isPerfect
        })
        
        console.log('Quiz submitted successfully! Check for badge notifications.')
        
        // Small delay to ensure badge notification shows
        setTimeout(() => {
          const newBadges = store.getters['badges/newlyEarnedBadges']
          if (newBadges && newBadges.length > 0) {
            console.log('🎉 New badges earned:', newBadges)
          } else {
            console.log('No new badges this time. Keep playing!')
          }
        }, 1000)
        
      } catch (error) {
        console.error('Error submitting quiz:', error)
        console.error('Error details:', error.message, error.stack)
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
  background: var(--bg-light);
  padding: 40px 20px;
}

.quiz-container {
  max-width: 800px;
  margin: 0 auto;
}

.quiz-header {
  background: var(--bg-light);
  padding: 30px;
  border-radius: 12px 12px 0 0;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
}

.quiz-header h1 {
  font-size: 2rem;
  color: var(--text);
  margin-bottom: 20px;
}

.quiz-progress span {
  color: var(--text-muted);
  margin-bottom: 10px;
  display: block;
}

.progress-bar {
  height: 8px;
  background: var(--border);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary);
  transition: width 0.3s;
}

.quiz-content {
  background: var(--bg-light);
  padding: 30px;
  border-radius: 0 0 12px 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
  border-top: none;
}

.question-card h2 {
  font-size: 1.5rem;
  color: var(--text);
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
  border: 2px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.option:hover {
  border-color: var(--primary);
  background: var(--bg-light);
}

.option.selected {
  border-color: var(--primary);
  background: var(--bg-light);
}

.option-letter {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: var(--text);
}

.option.selected .option-letter {
  background: var(--primary);
  color: white;
}

.option-text {
  flex: 1;
  color: var(--text);
}

.quiz-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
}

.quiz-results {
  background: var(--bg-light);
  padding: 40px;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
}

.results-card {
  text-align: center;
}

.score-circle {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
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
  color: var(--text);
  margin-bottom: 15px;
}

.results-card > p {
  color: var(--text-muted);
  font-size: 1.1rem;
  margin-bottom: 30px;
}

.results-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}
</style>


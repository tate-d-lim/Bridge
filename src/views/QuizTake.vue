<template>
  <div class="quiz-take-page">
    <div class="quiz-container">
      <div v-if="loading" class="loading-state">
        <div class="loading-content">
          <div class="loading-image">
            <img :src="currentLoadingImage" alt="Loading animation" />
          </div>
          <h2>Generating Your Quiz...</h2>
          <p>Please wait while we create your personalized quiz with AI</p>
          <div class="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      <div v-else-if="questions.length === 0" class="error-state">
        <h2>No Quiz Data</h2>
        <p>Unable to load quiz data. Please try again.</p>
        <div style="margin: 20px 0;">
          <p><strong>Debug Info:</strong></p>
          <p>Current Quiz: {{ currentQuiz }}</p>
          <p>Questions Length: {{ questions.length }}</p>
          <p>Loading: {{ loading }}</p>
        </div>
        <div style="margin: 20px 0;">
          <button @click="testStore" class="btn btn-secondary" style="margin-right: 10px;">Test Store</button>
          <button @click="reloadQuiz" class="btn btn-primary">Reload Quiz</button>
        </div>
        <router-link to="/quizzes" class="btn btn-primary">Back to Quizzes</router-link>
      </div>

      <div v-else>
        <div class="quiz-header">
          <h1>{{ currentQuiz?.skill || 'Quiz' }} - {{ currentQuiz?.difficulty || 'Quiz' }}</h1>
          <div class="quiz-progress">
            <span>Question {{ currentQuestion + 1 }} of {{ questions.length }}</span>
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
              :class="['option', { 
                selected: selectedAnswer === index,
                correct: showFeedback && index === questions[currentQuestion].correctAnswer,
                incorrect: showFeedback && selectedAnswer === index && index !== questions[currentQuestion].correctAnswer
              }]"
              :data-option-index="index"
              @click="selectAnswer(index)"
            >
              <div class="option-letter">{{ String.fromCharCode(65 + index) }}</div>
              <div class="option-text">{{ option }}</div>
              <div v-if="showFeedback && index === questions[currentQuestion].correctAnswer" class="feedback-icon correct">✓</div>
              <div v-if="showFeedback && selectedAnswer === index && index !== questions[currentQuestion].correctAnswer" class="feedback-icon incorrect">✗</div>
            </div>
          </div>

          <!-- Feedback Message -->
          <div v-if="showFeedback" class="feedback-message" :class="{ correct: isAnswerCorrect, incorrect: !isAnswerCorrect }">
            <div class="feedback-content">
              <div class="feedback-icon-large">
                {{ isAnswerCorrect ? '🎉' : '❌' }}
              </div>
              <div class="feedback-text">
                <h3>{{ isAnswerCorrect ? 'Correct!' : 'Incorrect' }}</h3>
                <p v-if="!isAnswerCorrect">
                  The correct answer is: <strong>{{ questions[currentQuestion].options[questions[currentQuestion].correctAnswer] }}</strong>
                </p>
                <p v-else>Well done! You got it right.</p>
              </div>
            </div>
          </div>

          <div class="quiz-actions">
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

          <!-- Add Summary Section -->
          <div class="quiz-summary">
            <h3>Quiz Summary</h3>
            <div v-for="(question, index) in questions" :key="index" class="summary-item">
              <div class="summary-question">
                <span class="question-number">Q{{index + 1}}.</span>
                <p>{{ question.question }}</p>
              </div>
              <div class="summary-answers">
                <div class="user-answer" :class="{ correct: answers[index] === question.correctAnswer }">
                  <strong>Your Answer:</strong> 
                  <span>{{ question.options[answers[index]] }}</span>
                  <span class="answer-icon">{{ answers[index] === question.correctAnswer ? '✓' : '✗' }}</span>
                </div>
                <div v-if="answers[index] !== question.correctAnswer" class="correct-answer">
                  <strong>Correct Answer:</strong> 
                  <span>{{ question.options[question.correctAnswer] }}</span>
                </div>
              </div>
            </div>
          </div>

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
  
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { db } from '../firebase/config'
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { quizApi } from '../services/api'
import loading1 from '../assets/loading-1.png'
import loading2 from '../assets/loading-2.png'

export default {
  name: 'QuizTake',
  setup() {
    const store = useStore()
    const route = useRoute()

    const currentQuestion = ref(0)
    const selectedAnswer = ref(null)
    const answers = ref([])
    const quizCompleted = ref(false)
    const score = ref(0)
    const loading = ref(true)
    const showFeedback = ref(false)
    const isAnswerCorrect = ref(false)
    const currentLoadingImage = ref(loading1)
    const loadingInterval = ref(null)

    // New: track timeout so we can clear it when navigating
    const feedbackTimeout = ref(null)

    // Get quiz data from store
    const currentQuiz = computed(() => store.getters['quizzes/currentQuiz'])
    const questions = computed(() => currentQuiz.value?.questions || [])

    const progress = computed(() => {
      return ((currentQuestion.value + 1) / questions.value.length) * 100
    })

    const clearFeedback = () => {
      // clear reactive flags
      showFeedback.value = false
      isAnswerCorrect.value = false

      // clear any pending timeout
      if (feedbackTimeout.value) {
        clearTimeout(feedbackTimeout.value)
        feedbackTimeout.value = null
      }

      // remove visual classes from any option elements
      document.querySelectorAll('.option').forEach(el => {
        el.classList.remove('correct-answer', 'incorrect-answer', 'show-correct')
      })
    }

    const selectAnswer = (index) => {
      // Prevent multiple selections
      if (selectedAnswer.value !== null) return;

      // clear any previous feedback state/timeout before applying new
      clearFeedback();

      selectedAnswer.value = index;
      showFeedback.value = true;
      isAnswerCorrect.value = index === questions.value[currentQuestion.value].correctAnswer;

      // No need to manually add classes - they will be handled by Vue's class bindings
    }

    const nextQuestion = () => {
      if (selectedAnswer.value !== null) {
        answers.value[currentQuestion.value] = selectedAnswer.value
        clearFeedback()
        currentQuestion.value++
        selectedAnswer.value = answers.value[currentQuestion.value] ?? null
      }
    }

    const submitQuiz = async () => {
      console.log('Submit quiz triggered')
      // Save the last answer before submitting
      if (selectedAnswer.value !== null) {
        answers.value[currentQuestion.value] = selectedAnswer.value
      }
      
      clearFeedback()
      
      // Calculate score
      let correct = 0
      answers.value.forEach((answer, index) => {
        if (answer === questions.value[index].correctAnswer) {
          correct++
        }
      })
      
      // Set the score and mark quiz as completed
      score.value = Math.round((correct / questions.value.length) * 100)
      quizCompleted.value = true // This triggers the results view

      console.log('Answers:', answers.value)
      console.log('Score:', score.value)
      console.log('Quiz completed:', quizCompleted.value)
  
      try {
        const user = store.getters['auth/currentUser']
        
        if (!user) {
          console.error('No user logged in')
          return
        }
        
        // Submit quiz results to backend
        await store.dispatch('quizzes/submitQuizResult', {
          userId: user.uid,
          quizId: currentQuiz.value?.id || 'quiz-1',
          score: score.value,
          answers: answers.value,
          isPerfect: score.value === 100
        })
        
        console.log('Quiz submitted successfully')
      } catch (error) {
        console.error('Error submitting quiz:', error)
      }
    }

    const retakeQuiz = () => {
      clearFeedback()
      currentQuestion.value = 0
      selectedAnswer.value = null
      answers.value = []
      quizCompleted.value = false
      score.value = 0
    }

    // Debug functions
    const testStore = () => {
      console.log('Testing store...')
      const testQuiz = {
        id: 'test-quiz-id',
        skill: 'Test Skill',
        difficulty: 'easy',
        questions: [
          {
            question: 'What is 2 + 2?',
            options: ['3', '4', '5', '6'],
            correctAnswer: 1
          },
          {
            question: 'What is the capital of France?',
            options: ['London', 'Paris', 'Berlin', 'Madrid'],
            correctAnswer: 1
          }
        ]
      }
      store.dispatch('quizzes/setCurrentQuiz', testQuiz)
      console.log('Test quiz stored:', store.getters['quizzes/currentQuiz'])
    }

    const reloadQuiz = async () => {
      console.log('Reloading quiz...')
      loading.value = true
      clearFeedback()
      
      const routeParam = route.params.id
      if (routeParam) {
        const [skill, difficulty] = routeParam.split('-')
        if (skill && difficulty) {
          await pollForQuiz(skill, difficulty)
        }
      }
    }

    // Function to poll Firestore for quiz data
    const pollForQuiz = async (skill, difficulty, maxAttempts = 30) => {
      let attempts = 0
      
      while (attempts < maxAttempts) {
      try {
        console.log(`Polling attempt ${attempts + 1} for quiz: ${skill} - ${difficulty}`)
        
        // First, let's check what quizzes exist in the collection
        const allQuizzesRef = collection(db, 'quizzes')
        const allQuizzesSnapshot = await getDocs(allQuizzesRef)
        console.log('All quizzes in collection:')
        allQuizzesSnapshot.forEach((doc) => {
          const data = doc.data()
          console.log(`Quiz ID: ${doc.id}, Skill: "${data.skill}", Difficulty: "${data.difficulty}", Questions: ${data.questions?.length || 0}`)
        })
        
        // Query Firestore for the latest quiz with matching skill and difficulty
        const quizzesRef = collection(db, 'quizzes')
        const q = query(
          quizzesRef,
          where('skill', '==', skill),
          where('difficulty', '==', difficulty),
          orderBy('createdAt', 'desc'),
          limit(1)
        )
          
          const querySnapshot = await getDocs(q)
          
          console.log('Query snapshot size:', querySnapshot.size)
          console.log('Query snapshot empty:', querySnapshot.empty)
          
          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0]
            const quizData = { id: doc.id, ...doc.data() }
            
            console.log('Raw quiz data from Firestore:', quizData)
            console.log('Quiz data questions:', quizData.questions)
            console.log('Questions length:', quizData.questions?.length)
            
            // Check if quiz has questions
            if (quizData.questions && quizData.questions.length > 0) {
              console.log('Quiz found with questions:', quizData.questions.length)
              console.log('First question:', quizData.questions[0])
              
              // Store in Vuex store
              await store.dispatch('quizzes/setCurrentQuiz', quizData)
              
              console.log('Quiz stored in store, setting loading to false')
              console.log('Store current quiz after dispatch:', store.getters['quizzes/currentQuiz'])
              loading.value = false
              return true
            } else {
              console.log('Quiz found but no questions or empty questions array')
            }
          } else {
            console.log('No quiz found in Firestore for:', { skill, difficulty })
            
            // Try to get any recent quiz as fallback
            const fallbackQuery = query(
              collection(db, 'quizzes'),
              orderBy('createdAt', 'desc'),
              limit(1)
            )
            const fallbackSnapshot = await getDocs(fallbackQuery)
            
            if (!fallbackSnapshot.empty) {
              const fallbackDoc = fallbackSnapshot.docs[0]
              const fallbackData = { id: fallbackDoc.id, ...fallbackDoc.data() }
              console.log('Found fallback quiz:', fallbackData)
              
              if (fallbackData.questions && fallbackData.questions.length > 0) {
                console.log('Using fallback quiz with questions:', fallbackData.questions.length)
                await store.dispatch('quizzes/setCurrentQuiz', fallbackData)
                loading.value = false
                return true
              }
            }
          }
          
          // Wait 2 seconds before next attempt
          await new Promise(resolve => setTimeout(resolve, 2000))
          attempts++
          
        } catch (error) {
          console.error('Error polling for quiz:', error)
          attempts++
        }
      }
      
      console.error('Quiz not found after maximum attempts')
      loading.value = false
      return false
    }

    // Function to get existing quiz data from Firestore
    const getExistingQuiz = async (skill, difficulty) => {
      try {
        // Query Firestore for existing quiz
        const quizzesRef = collection(db, 'quizzes')
        const q = query(
          quizzesRef,
          where('skill', '==', skill),
          where('difficulty', '==', difficulty),
          orderBy('createdAt', 'desc'),
          limit(1)
        )
        
        const querySnapshot = await getDocs(q)
        
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0]
          const quizData = { id: doc.id, ...doc.data() }
          
          // Check if quiz has questions
          if (quizData.questions && quizData.questions.length > 0) {
            return quizData
          }
        }
        
        return null
      } catch (error) {
        console.error('Error getting existing quiz:', error)
        return null
      }
    }

    // Function to generate new quiz via backend API
    const generateNewQuiz = async (skill, difficulty) => {
      try {
        console.log('Generating new quiz:', { skill, difficulty, numberOfQuestions: 5 })
        
        // Call the backend API to generate quiz
        const response = await quizApi.generateQuiz({
          skill: skill,
          difficulty: difficulty,
          numberOfQuestions: 5
        })
        
        console.log('Quiz generation completed:', response.data)
        
        if (response.data.success && response.data.quiz) {
          // Store the generated quiz in the store
          await store.dispatch('quizzes/setCurrentQuiz', response.data.quiz)
          loading.value = false
        } else {
          console.error('Quiz generation failed:', response.data)
          loading.value = false
        }
        
      } catch (error) {
        console.error('Error generating new quiz:', error)
        loading.value = false
      }
    }

    // Function to generate new quiz in background (non-blocking)
    const generateQuizInBackground = async (skill, difficulty) => {
      try {
        console.log('Starting background quiz generation:', { skill, difficulty, numberOfQuestions: 5 })
        
        // Call the backend API to generate quiz (don't await)
        quizApi.generateQuiz({
          skill: skill,
          difficulty: difficulty,
          numberOfQuestions: 5
        }).then(response => {
          console.log('Background quiz generation completed:', response.data)
        }).catch(error => {
          console.error('Background quiz generation failed:', error)
        })
        
      } catch (error) {
        console.error('Error starting background quiz generation:', error)
      }
    }

    onMounted(async () => {
      // Parse the route parameter to get skill and difficulty
      const routeParam = route.params.id
      if (!routeParam) {
        loading.value = false
        return
      }
      
      // Parse skill and difficulty from route (format: "skill-difficulty")
      const [skill, difficulty] = routeParam.split('-')
      if (!skill || !difficulty) {
        loading.value = false
        return
      }
      
      try {
        console.log(`Loading quiz for: ${skill} - ${difficulty}`)
        
        // First, try to get existing quiz data from Firestore
        const existingQuiz = await getExistingQuiz(skill, difficulty)
        
        if (existingQuiz) {
          console.log('Found existing quiz:', existingQuiz)
          // Store quiz data and display
          await store.dispatch('quizzes/setCurrentQuiz', existingQuiz)
          loading.value = false
        } else {
          console.log('No existing quiz found, generating new quiz...')
          // Generate new quiz via backend API
          await generateNewQuiz(skill, difficulty)
        }
        
      } catch (error) {
        console.error('Error loading quiz:', error)
        loading.value = false
      }
    })

    // Start image alternation when loading starts
    watch(loading, (newValue) => {
      console.log('Loading state changed:', newValue) // Debug log
      if (newValue) {
        loadingInterval.value = setInterval(() => {
          currentLoadingImage.value = currentLoadingImage.value === loading1 
            ? loading2 
            : loading1
          console.log('Switched to:', currentLoadingImage.value) // Debug log
        }, 200) // Switch every second
      } else {
        // Clear interval when loading stops
        if (loadingInterval.value) {
          clearInterval(loadingInterval.value)
          loadingInterval.value = null
        }
      }
    }, { immediate: true }) // Add immediate: true to trigger on initial load

    // Clean up interval on component unmount
    onUnmounted(() => {
      if (loadingInterval.value) {
        clearInterval(loadingInterval.value)
      }
    })

    return {
      currentQuestion,
      selectedAnswer,
      questions,
      progress,
      quizCompleted,
      score,
      loading,
      currentQuiz,
      showFeedback,
      isAnswerCorrect,
      currentLoadingImage,
      selectAnswer,
      nextQuestion,
      submitQuiz,
      retakeQuiz,
      testStore,
      reloadQuiz
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

.option.correct {
  border-color: #10b981 !important;
  background: #ecfdf5 !important;
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
}

.option.incorrect {
  border-color: #ef4444 !important;
  background: #fef2f2 !important;
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
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

/* Loading State Styles */
.loading-state {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-content {
  background: #ffffff;
  padding: 40px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  max-width: 400px;
  width: 90%;
  /* removed the border */
  
  /* Add subtle gradient background */
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  
  /* Add smooth transition for hover effect */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.loading-content:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
}

/* Update spinner to be more prominent */
.loading-spinner {
  width: 70px;
  height: 70px;
  border: 5px solid #f3f4f6;
  border-top: 5px solid var(--primary);
  border-radius: 50%;
  animation: spin 1.2s cubic-bezier(0.45, 0, 0.55, 1) infinite;
  margin: 0 auto 25px;
}

/* Enhance loading dots */
.loading-dots {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 25px;
}

.loading-dots span {
  width: 10px;
  height: 10px;
  background: var(--primary);
  border-radius: 50%;
  opacity: 0.7;
  animation: bounce 1.4s cubic-bezier(0.45, 0, 0.55, 1) infinite both;
}

/* Enhanced Visual Effects */
.option.correct-answer {
  border-color: #10b981;
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
  transform: scale(1.02);
  animation: correctPulse 0.8s ease-in-out;
}

.option.incorrect-answer {
  border-color: #ef4444;
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
  animation: incorrectShake 0.8s ease-in-out;
}

.option.show-correct {
  border-color: #10b981;
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  box-shadow: 0 0 25px rgba(16, 185, 129, 0.4);
  animation: correctGlow 1s ease-in-out;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

@keyframes correctPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1.02); }
}

@keyframes incorrectShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

@keyframes correctGlow {
  0% { box-shadow: 0 0 5px rgba(16, 185, 129, 0.3); }
  50% { box-shadow: 0 0 25px rgba(16, 185, 129, 0.6); }
  100% { box-shadow: 0 0 15px rgba(16, 185, 129, 0.4); }
}

/* Feedback Message Styles */
.feedback-message {
  margin: 20px 0;
  padding: 20px;
  border-radius: 12px;
  animation: slideIn 0.3s ease-out;
}

.feedback-message.correct {
  background: #ecfdf5;
  border: 2px solid #10b981;
}

.feedback-message.incorrect {
  background: #fef2f2;
  border: 2px solid #ef4444;
}

.feedback-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.feedback-icon-large {
  font-size: 2rem;
}

.feedback-text h3 {
  margin: 0 0 8px 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.feedback-text p {
  margin: 0;
  color: #6b7280;
}

.feedback-message.correct .feedback-text h3 {
  color: #10b981;
}

.feedback-message.incorrect .feedback-text h3 {
  color: #ef4444;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.loading-image {
  width: 120px;
  height: 120px;
  margin: 0 auto 25px;
}

.loading-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: opacity 0.3s ease;
}

/* ...existing styles... */

.quiz-summary {
  margin: 30px 0;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
}

.quiz-summary h3 {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--border);
}

.summary-item {
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border);
}

.summary-question {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.question-number {
  font-weight: bold;
  color: var(--primary);
  min-width: 40px;
}

.summary-answers {
  margin-left: 40px;
  padding: 10px;
  background: var(--bg-light);
  border-radius: 8px;
}

.user-answer, .correct-answer {
  padding: 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-answer {
  margin-bottom: 5px;
}

.user-answer.correct {
  background: #ecfdf5;
  color: #10b981;
}

.user-answer:not(.correct) {
  background: #fef2f2;
  color: #ef4444;
}

.correct-answer {
  background: #ecfdf5;
  color: #10b981;
}

.answer-icon {
  margin-left: auto;
  font-weight: bold;
}

/* Update option styles for better feedback */
.option.selected.correct {
  border-color: #10b981;
  background: #ecfdf5;
}

.option.selected.incorrect {
  border-color: #ef4444;
  background: #fef2f2;
}

.feedback-icon {
  margin-left: auto;
  font-weight: bold;
  font-size: 1.2rem;
}

.feedback-icon.correct {
  color: #10b981;
}

.feedback-icon.incorrect {
  color: #ef4444;
}
</style>


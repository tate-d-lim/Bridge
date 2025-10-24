import { db } from '../../firebase/config'
import axios from 'axios'
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where,
  updateDoc 
} from 'firebase/firestore'

export default {
  namespaced: true,
  
  state: {
    quizzes: [],
    currentQuiz: null,
    userBadges: [],
    loading: false,
    error: null
  },
  
  mutations: {
    SET_QUIZZES(state, quizzes) {
      state.quizzes = quizzes
    },
    SET_CURRENT_QUIZ(state, quiz) {
      state.currentQuiz = quiz
    },
    SET_USER_BADGES(state, badges) {
      state.userBadges = badges
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  
  actions: {
    async fetchQuizzes({ commit }) {
      commit('SET_LOADING', true)
      try {
        const querySnapshot = await getDocs(collection(db, 'quizzes'))
        const quizzes = []
        querySnapshot.forEach((doc) => {
          quizzes.push({ id: doc.id, ...doc.data() })
        })
        
        commit('SET_QUIZZES', quizzes)
        commit('SET_LOADING', false)
        return quizzes
      } catch (error) {
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    },

    setCurrentQuiz({ commit }, quiz) {
      commit('SET_CURRENT_QUIZ', quiz)
    },
    
    async generateQuiz({ commit }, { skill, difficulty }) {
      commit('SET_LOADING', true)
      try {
        // Call your backend API to generate quiz using Gemini AI
        const response = await axios.post('/api/quizzes/generate', {
          skill,
          difficulty
        })
        
        const quizData = response.data
        
        // Save quiz to Firestore
        const docRef = await addDoc(collection(db, 'quizzes'), {
          ...quizData,
          skill,
          difficulty,
          createdAt: new Date().toISOString()
        })
        
        commit('SET_LOADING', false)
        return docRef.id
      } catch (error) {
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    },
    
    async submitQuizResult({ commit }, { userId, quizId, score, answers }) {
      commit('SET_LOADING', true)
      try {
        const resultData = {
          userId,
          quizId,
          score,
          answers,
          completedAt: new Date().toISOString()
        }
        
        await addDoc(collection(db, 'quizResults'), resultData)
        
        // Award badge if score is high enough
        if (score >= 80) {
          const quizDoc = await getDoc(doc(db, 'quizzes', quizId))
          const quiz = quizDoc.data()
          
          await addDoc(collection(db, 'badges'), {
            userId,
            skill: quiz.skill,
            level: quiz.difficulty,
            earnedAt: new Date().toISOString()
          })
        }
        
        commit('SET_LOADING', false)
      } catch (error) {
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    },
    
    async fetchUserBadges({ commit }, userId) {
      try {
        const q = query(collection(db, 'badges'), where('userId', '==', userId))
        const querySnapshot = await getDocs(q)
        const badges = []
        querySnapshot.forEach((doc) => {
          badges.push({ id: doc.id, ...doc.data() })
        })
        
        commit('SET_USER_BADGES', badges)
        return badges
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    }
  },
  
  getters: {
    allQuizzes: state => state.quizzes,
    currentQuiz: state => state.currentQuiz,
    userBadges: state => state.userBadges,
    loading: state => state.loading
  }
}


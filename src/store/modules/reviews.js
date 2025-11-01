import { db } from '../../firebase/config'
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy,
  Timestamp
} from 'firebase/firestore'

export default {
  namespaced: true,
  
  state: {
    reviews: [],
    loading: false,
    error: null
  },
  
  mutations: {
    SET_REVIEWS(state, reviews) {
      state.reviews = reviews
    },
    ADD_REVIEW(state, review) {
      state.reviews.unshift(review)
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  
  actions: {
    async submitReview({ commit }, reviewData) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      try {
        const docRef = await addDoc(collection(db, 'reviews'), {
          ...reviewData,
          date: Timestamp.now(),
          likes: 0,
          createdAt: Timestamp.now()
        })
        
        // Create review object with id for local state
        const now = new Date()
        const newReview = {
          id: docRef.id,
          ...reviewData,
          date: now.toISOString(),
          likes: 0,
          isLiked: false
        }
        
        commit('ADD_REVIEW', newReview)
        commit('SET_LOADING', false)
        return docRef.id
      } catch (error) {
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    },
    
    async fetchReviews({ commit }) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      try {
        const q = query(
          collection(db, 'reviews'),
          orderBy('date', 'desc')
        )
        const querySnapshot = await getDocs(q)
        
        const reviews = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          // Handle date: if it's a Firestore Timestamp, convert to ISO string; otherwise use as is
          let dateValue
          if (data.date?.toDate) {
            dateValue = data.date.toDate().toISOString()
          } else if (data.date) {
            dateValue = data.date
          } else {
            dateValue = new Date().toISOString()
          }
          
          reviews.push({
            id: doc.id,
            company: data.company,
            industry: data.industry,
            rating: data.rating,
            review: data.review,
            reviewerName: data.reviewerName,
            reviewerType: data.reviewerType,
            date: dateValue,
            likes: data.likes || 0,
            isLiked: false,
            userId: data.userId
          })
        })
        
        commit('SET_REVIEWS', reviews)
        commit('SET_LOADING', false)
        return reviews
      } catch (error) {
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    }
  },
  
  getters: {
    allReviews: state => state.reviews,
    loading: state => state.loading,
    error: state => state.error
  }
}


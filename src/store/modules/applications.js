import { db } from '../../firebase/config'
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc,
  doc,
  orderBy 
} from 'firebase/firestore'

export default {
  namespaced: true,
  
  state: {
    applications: [],
    loading: false,
    error: null
  },
  
  mutations: {
    SET_APPLICATIONS(state, applications) {
      state.applications = applications
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  
  actions: {
    async submitApplication({ commit }, applicationData) {
      commit('SET_LOADING', true)
      try {
        const docRef = await addDoc(collection(db, 'applications'), {
          ...applicationData,
          status: 'pending',
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
    
    async fetchUserApplications({ commit }, userId) {
      commit('SET_LOADING', true)
      try {
        const q = query(
          collection(db, 'applications'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        )
        
        const querySnapshot = await getDocs(q)
        const applications = []
        querySnapshot.forEach((doc) => {
          applications.push({ id: doc.id, ...doc.data() })
        })
        
        commit('SET_APPLICATIONS', applications)
        commit('SET_LOADING', false)
        return applications
      } catch (error) {
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    },
    
    async fetchJobApplications({ commit }, jobId) {
      commit('SET_LOADING', true)
      try {
        const q = query(
          collection(db, 'applications'),
          where('jobId', '==', jobId),
          orderBy('createdAt', 'desc')
        )
        
        const querySnapshot = await getDocs(q)
        const applications = []
        querySnapshot.forEach((doc) => {
          applications.push({ id: doc.id, ...doc.data() })
        })
        
        commit('SET_APPLICATIONS', applications)
        commit('SET_LOADING', false)
        return applications
      } catch (error) {
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    },
    
    async updateApplicationStatus({ commit }, { applicationId, status }) {
      commit('SET_LOADING', true)
      try {
        await updateDoc(doc(db, 'applications', applicationId), {
          status,
          updatedAt: new Date().toISOString()
        })
        
        commit('SET_LOADING', false)
      } catch (error) {
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    }
  },
  
  getters: {
    allApplications: state => state.applications,
    loading: state => state.loading
  }
}


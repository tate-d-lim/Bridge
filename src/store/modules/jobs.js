import { db } from '../../firebase/config'
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where, 
  orderBy,
  updateDoc,
  deleteDoc 
} from 'firebase/firestore'

export default {
  namespaced: true,
  
  state: {
    jobs: [],
    currentJob: null,
    loading: false,
    error: null
  },
  
  mutations: {
    SET_JOBS(state, jobs) {
      state.jobs = jobs
    },
    SET_CURRENT_JOB(state, job) {
      state.currentJob = job
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  
  actions: {
    async fetchJobs({ commit }, filters = {}) {
      commit('SET_LOADING', true)
      try {
        let q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'))
        
        // Apply filters if provided
        if (filters.category) {
          q = query(q, where('category', '==', filters.category))
        }
        if (filters.location) {
          q = query(q, where('location', '==', filters.location))
        }
        
        const querySnapshot = await getDocs(q)
        const jobs = []
        querySnapshot.forEach((doc) => {
          jobs.push({ id: doc.id, ...doc.data() })
        })
        
        commit('SET_JOBS', jobs)
        commit('SET_LOADING', false)
        return jobs
      } catch (error) {
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    },

    async fetchJobsByEmployer({ commit }, employerId) {
      commit('SET_LOADING', true)
      try {
        const q = query(
          collection(db, 'jobs'), 
          where('employerId', '==', employerId)
        )
        
        const querySnapshot = await getDocs(q)
        const jobs = []
        querySnapshot.forEach((doc) => {
          jobs.push({ id: doc.id, ...doc.data() })
        })
        
        // Sort by createdAt in JavaScript since we can't use orderBy in the query
        jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        
        commit('SET_JOBS', jobs)
        commit('SET_LOADING', false)
        return jobs
      } catch (error) {
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    },
    
    async fetchJobById({ commit }, jobId) {
      commit('SET_LOADING', true)
      try {
        const jobDoc = await getDoc(doc(db, 'jobs', jobId))
        if (jobDoc.exists()) {
          const job = { id: jobDoc.id, ...jobDoc.data() }
          commit('SET_CURRENT_JOB', job)
          commit('SET_LOADING', false)
          return job
        }
      } catch (error) {
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    },
    
    async createJob({ commit }, jobData) {
      commit('SET_LOADING', true)
      try {
        const docRef = await addDoc(collection(db, 'jobs'), {
          ...jobData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'active'
        })
        commit('SET_LOADING', false)
        return docRef.id
      } catch (error) {
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    },
    
    async updateJob({ commit }, { jobId, jobData }) {
      commit('SET_LOADING', true)
      try {
        await updateDoc(doc(db, 'jobs', jobId), {
          ...jobData,
          updatedAt: new Date().toISOString()
        })
        commit('SET_LOADING', false)
      } catch (error) {
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    },
    
    async deleteJob({ commit }, jobId) {
      commit('SET_LOADING', true)
      try {
        await deleteDoc(doc(db, 'jobs', jobId))
        commit('SET_LOADING', false)
      } catch (error) {
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    }
  },
  
  getters: {
    allJobs: state => state.jobs,
    currentJob: state => state.currentJob,
    loading: state => state.loading,
    error: state => state.error
  }
}


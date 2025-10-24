import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - add auth token to requests
api.interceptors.request.use(
  (config) => {
    // You can add auth token here if needed
    // const token = localStorage.getItem('token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 401:
          // Unauthorized - redirect to login
          console.error('Unauthorized access')
          break
        case 403:
          // Forbidden
          console.error('Access forbidden')
          break
        case 404:
          // Not found
          console.error('Resource not found')
          break
        case 500:
          // Server error
          console.error('Server error')
          break
        default:
          console.error('An error occurred:', error.response.data)
      }
    } else if (error.request) {
      // Request made but no response
      console.error('No response from server')
    } else {
      // Something else happened
      console.error('Error:', error.message)
    }
    return Promise.reject(error)
  }
)

// API endpoints
export const quizApi = {
  // Generate quiz using Gemini AI (calls backend endpoint)
  generateQuiz: (data) => api.post('/api/quizzes/generate', data),
  getQuizzes: () => api.get('/api/quizzes'),
  getQuizById: (id) => api.get(`/api/quizzes/${id}`),
  submitQuizResult: (data) => api.post('/api/quizzes/results', data)
}

export const jobApi = {
  getJobs: (params) => api.get('/api/jobs', { params }),
  getJobById: (id) => api.get(`/api/jobs/${id}`),
  createJob: (data) => api.post('/api/jobs', data),
  updateJob: (id, data) => api.put(`/api/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/api/jobs/${id}`)
}

export const userApi = {
  getProfile: (id) => api.get(`/api/users/${id}`),
  updateProfile: (id, data) => api.put(`/api/users/${id}`, data),
  searchUsers: (params) => api.get('/api/users/search', { params })
}

export default api


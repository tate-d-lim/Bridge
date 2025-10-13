import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../firebase/config'

// Views
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import JobListings from '../views/JobListings.vue'
import JobDetails from '../views/JobDetails.vue'
import JobSeekerDashboard from '../views/JobSeekerDashboard.vue'
import EmployerDashboard from '../views/EmployerDashboard.vue'
import Profile from '../views/Profile.vue'
import PostJob from '../views/PostJob.vue'
import Chat from '../views/Chat.vue'
import Quizzes from '../views/Quizzes.vue'
import QuizTake from '../views/QuizTake.vue'
import Applications from '../views/Applications.vue'
import Candidates from '../views/Candidates.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresAuth: false }
  },
  {
    path: '/jobs',
    name: 'JobListings',
    component: JobListings,
    meta: { requiresAuth: false }
  },
  {
    path: '/jobs/:id',
    name: 'JobDetails',
    component: JobDetails,
    meta: { requiresAuth: false }
  },
  {
    path: '/jobseeker/dashboard',
    name: 'JobSeekerDashboard',
    component: JobSeekerDashboard,
    meta: { requiresAuth: true, role: 'jobseeker' }
  },
  {
    path: '/employer/dashboard',
    name: 'EmployerDashboard',
    component: EmployerDashboard,
    meta: { requiresAuth: true, role: 'employer' }
  },
  {
    path: '/profile/:id?',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/employer/post-job',
    name: 'PostJob',
    component: PostJob,
    meta: { requiresAuth: true, role: 'employer' }
  },
  {
    path: '/chat/:chatId?',
    name: 'Chat',
    component: Chat,
    meta: { requiresAuth: true }
  },
  {
    path: '/quizzes',
    name: 'Quizzes',
    component: Quizzes,
    meta: { requiresAuth: true, role: 'jobseeker' }
  },
  {
    path: '/quizzes/:id',
    name: 'QuizTake',
    component: QuizTake,
    meta: { requiresAuth: true, role: 'jobseeker' }
  },
  {
    path: '/applications',
    name: 'Applications',
    component: Applications,
    meta: { requiresAuth: true, role: 'jobseeker' }
  },
  {
    path: '/candidates',
    name: 'Candidates',
    component: Candidates,
    meta: { requiresAuth: true, role: 'employer' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const currentUser = auth.currentUser

  if (requiresAuth && !currentUser) {
    next('/login')
  } else {
    next()
  }
})

export default router


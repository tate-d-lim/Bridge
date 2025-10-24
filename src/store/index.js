import { createStore } from 'vuex'
import auth from './modules/auth'
import jobs from './modules/jobs'
import chat from './modules/chat'
import quizzes from './modules/quizzes'
import applications from './modules/applications'
import badges from './modules/badges'

export default createStore({
  modules: {
    auth,
    jobs,
    chat,
    quizzes,
    applications,
    badges
  }
})


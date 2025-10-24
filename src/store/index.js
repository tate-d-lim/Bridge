import { createStore } from 'vuex'
import auth from './modules/auth'
import jobs from './modules/jobs'
import chat from './modules/chat'
import chatAbly from './modules/chatAbly'
import quizzes from './modules/quizzes'
import applications from './modules/applications'

export default createStore({
  modules: {
    auth,
    jobs,
    chat,
    chatAbly,
    quizzes,
    applications
  }
})


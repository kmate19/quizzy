import { createRouter, createWebHistory } from 'vue-router'
import LoginRegisterView from '@/views/auth/LoginRegister.vue'
import HomeView from '@/views/HomeView.vue'
import ProfileView from '@/views/user/ProfileView.vue'
import GameCreation from '@/views/user/GameCreation.vue'
import DetailedView from '@/views/DetailedView.vue'
import { clientv1 } from '@/lib/apiClient'
import ForgotPassword from '@/views/auth/ForgotPassword.vue'
import { queryClient } from '@/lib/queryClient'
import QuizPractice from '@/views/game/QuizPractice.vue'
import { useQuizzyStore } from '@/stores/quizzyStore'
import { userData } from '@/utils/functions/profileFunctions'
import GameWrapper from '@/components/GameWrapper.vue'

const AUTH_QUERY_KEY = ['auth']
const USER_PROFILE_QUERY_KEY = ['userProfile']

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'loginRegister',
      component: LoginRegisterView,
    },
    {
      path: '/forgotPw',
      name: 'forgotPw',
      component: ForgotPassword,
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/profil/:uuid?',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true },
    },
    {
      path: '/game_creation/:uuid?',
      name: 'game_creation',
      component: GameCreation,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/quiz/:uuid',
      name: 'detailed_view',
      component: DetailedView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/quiz/practice/:uuid',
      name: 'quiz_practice',
      component: QuizPractice,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/quiz/multiplayer/:lobbyId',
      name: 'quiz_multiplayer',
      component: GameWrapper,
      meta: {
        requiresAuth: true,
      },
    },
  ],
})

async function checkAuthStatus() {
  try {
    const cachedAuth = queryClient.getQueryData(AUTH_QUERY_KEY)

    if (cachedAuth) {
      return { isAuthenticated: true }
    }
    const auth = await clientv1.auth.authed.$get({ query: {} })
    const isAuthenticated = auth.status === 200

    if (isAuthenticated) {
      queryClient.setQueryData(AUTH_QUERY_KEY, { isAuthenticated: true })

      const cachedUserProfile = queryClient.getQueryData(USER_PROFILE_QUERY_KEY)

      if (!cachedUserProfile) {
        const data = await userData('')
        if (data) {
          queryClient.setQueryData(USER_PROFILE_QUERY_KEY, data)
          const quizzyStore = useQuizzyStore()
          quizzyStore.userName = data.username
          quizzyStore.pfp = data.profile_picture
          quizzyStore.id = data.id || ''
          quizzyStore.isAdmin = data.roles?.some((role) => role.role.name === 'admin') || false
        }
      }
    } else {
      queryClient.removeQueries({ queryKey: ['auth'] })
    }

    return { isAuthenticated }
  } catch (error) {
    console.error('Error checking authentication status:', error)
    return { isAuthenticated: false, error }
  }
}

router.beforeEach(async (to, from, next) => {
  const quizzyStore = useQuizzyStore()

  quizzyStore.fromLogin = from.path === '/login'
  const requiresAuth = to.meta.requiresAuth
  const isLoginPath = to.path === '/login'

  if (requiresAuth || isLoginPath) {
    const { isAuthenticated } = await checkAuthStatus()

    if (isAuthenticated) {
      if (isLoginPath) {
        return next('/')
      }
      return next()
    } else {
      if (requiresAuth) {
        return next('/login')
      }
      return next()
    }
  }
  
  console.log("Navigating to:", to.path)
  
  next()
})

export default router

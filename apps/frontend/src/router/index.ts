import { createRouter, createWebHistory } from 'vue-router'
import LoginRegisterView from '@/views/LoginRegister.vue'
import HomeView from '@/views/HomeView.vue'
import ProfileView from '@/views/ProfileView.vue'
import GameCreation from '@/views/GameCreation.vue'
import { ref, watch } from 'vue'
import DetailedView from '@/views/DetailedView.vue'
import { clientv1 } from '@/lib/apiClient'
import ForgotPassword from '@/views/ForgotPassword.vue'
import { queryClient } from '@/lib/queryClient'
import QuizPractice from '@/views/QuizPractice.vue'

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
  ],
})

const title = ref('Quizzy')

router.beforeEach(async (toRoute, fromRoute, next) => {
  let newTitle = 'Quizzy'

  const requiresAuth = toRoute.meta.requiresAuth
  const isLoginPath = toRoute.path === '/login'
  const cachedUser = queryClient.getQueryData(['authUser'])

  if (cachedUser) {
    if (isLoginPath) {
      return next('/')
    }
  } else {
    try {
      const auth = await clientv1.auth.authed.$get({ query: {} })
      const isAuthenticated = auth.status === 200

      if (isAuthenticated) {
        queryClient.setQueryData(['authUser'], auth)

        if (isLoginPath) {
          return next('/')
        }
      } else {
        if (isLoginPath) {
        } else if (requiresAuth) {
          return next('/login')
        }
      }
    } catch (error) {
      console.error('Error during auth check:', error)
      if (requiresAuth && !isLoginPath) {
        return next('/login')
      }
    }
  }

  switch (toRoute.name?.toString()) {
    case 'loginRegister':
      newTitle = 'Autentikáció'
      break
    case 'home':
      newTitle = 'Kezdőlap'
      break
    case 'profile':
      newTitle = 'Profil'
      break
    case 'game_creation':
      newTitle = 'Játék készítés'
      break
    case 'detailed_view':
      newTitle = 'Megtekintés'
      break
    case 'quiz_practice':
      newTitle = 'Gyakorlás'
      break
  }

  document.title = newTitle
  next()
})

watch(
  title,
  (newTitleValue) => {
    document.title = `Quizzy - ${newTitleValue}`
  },
  { immediate: true },
)

export default router

import { createRouter, createWebHistory } from 'vue-router'
import LoginRegisterView from '@/views/LoginRegister.vue'
import HomeView from '@/views/HomeView.vue'
import ProfileView from '@/views/ProfileView.vue'
import GameCreation from '@/views/GameCreation.vue'
import { ref, watch } from 'vue'
import DetailedView from '@/views/DetailedView.vue'
import { clientv1 } from '@/lib/apiClient'
//import { clientv1 } from '@/lib/apiClient'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'loginRegister',
      component: LoginRegisterView,
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
  ],
})

const title = ref('Quizzy')

router.beforeEach(async (toRoute, fromRoute, next) => {
  let newTitle = 'Quizzy'

  const requiresAuth = toRoute.meta.requiresAuth
  const isLoginPath = toRoute.path === '/login'

  try {
    const auth = await clientv1.auth.authed.$get({ query: {} })
    console.log('Auth status:', auth.status)
    const isAuthenticated = auth.status === 200

    if (isLoginPath) {
      if (isAuthenticated) {
        return next('/')//authed
      } else {
        return next()//geos to login
      }
    }

    if (requiresAuth) {
      if (!isAuthenticated) {
        return next('/login')//not authed and goes to route which requires auth
      }
    }
  } catch (error) {
    console.error('Error during authentication check:', error)
    if (requiresAuth && !isLoginPath) {
      console.log('Error during authentication check and route requires auth, redirecting to login')
      return next('/login')
    }
  }

  switch (toRoute.name?.toString()) {
    case 'loginRegister':
      newTitle = 'Autentikáció'
      break
    case 'home':
      newTitle = 'Kezdőlap'
      break
    case 'profil':
      newTitle = 'Profil'
      break
    case 'game_creation':
      newTitle = 'Játék készítés'
      break
  }

  title.value = newTitle
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

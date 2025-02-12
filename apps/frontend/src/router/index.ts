import { createRouter, createWebHistory } from 'vue-router'
import LoginRegisterView from '@/views/LoginRegister.vue'
import HomeView from '@/views/HomeView.vue'
import ProfileView from '@/views/ProfileView.vue'
import GameCreation from '@/views/GameCreation.vue'
import { ref, watch } from 'vue'
import DetailedView from '@/views/DetailedView.vue'
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
    }
  ],
})

const title = ref('Quizzy')

router.beforeEach((toRoute, fromRoute, next) => {
  let newTitle = 'Quizzy'

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

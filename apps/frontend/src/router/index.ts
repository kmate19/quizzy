import { createRouter, createWebHistory } from 'vue-router'
import LoginRegisterView from '@/views/LoginRegister.vue'
import HomeView from '@/views/HomeView.vue'
import ProfileView from '@/views/ProfileView.vue'
import GameCreation from '@/views/GameCreation.vue'
import { clientv1 } from '@/lib/apiClient'

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
      path: '/profil',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true },
    },
    {
      path: '/game_creation',
      name: 'game_creation',
      component: GameCreation,
      meta:{
        requiresAuth: true
      },
    }
  ],
})

/*router.beforeEach(async (to, from, next) => {
  console.log(clientv1.auth.authed.$get())
  if (res) {
    next('/login')
  } else {
    next()
  }
})*/

export default router

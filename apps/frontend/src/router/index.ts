import { createRouter, createWebHistory } from 'vue-router'
import LoginRegisterView from '@/views/LoginRegister.vue'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'loginRegister',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: LoginRegisterView,
    },
    //redirect to login with alert on error
    {
      path: '/home',
      name: 'home',
      component: HomeView,
    }
  ],
})

export default router

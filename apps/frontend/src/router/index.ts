import { createRouter, createWebHistory } from 'vue-router'

// lazy load mert sir a vite
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'loginRegister',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('@/views/LoginRegister.vue'),
    },
    //redirect to login with alert on error
    {
      path: '/home',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    }
  ],
})

export default router

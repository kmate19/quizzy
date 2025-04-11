<script setup lang="ts">
import NavBar from './components/NavBar.vue';
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import { VueQueryDevtools } from '@tanstack/vue-query-devtools';

const route = useRoute();
const hide = ['/login', '/forgotPw'];
const isNavbar = computed(() => {
  return !hide.includes(route.fullPath as string);
})


</script>

<template>
  <NavBar v-if="isNavbar" />
  <div class="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen w-full -z-10">
    <div class="fixed inset-0 opacity-20 -z-10">
      <div class="fixed inset-0 bg-[radial-gradient(white_1px,transparent_1px)] bg-[length:20px_20px] -z-10"></div>
    </div>
  </div>
  <RouterView :key="route.fullPath" />
  <VueQueryDevtools />
</template>

<script setup lang="ts">
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
import MistBackground from './components/MistBackground.vue'
import NavBar from './components/NavBar.vue';
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();
const hide = ['/login', '/forgotPw'];
const isNavbar = computed(() =>{
  console.log("Route fullPath:", route.fullPath, "Show NavBar:", isNavbar.value);
  return !hide.includes(route.fullPath as string);
}) 


</script>

<template>
  <VueQueryDevtools />
  <NavBar v-if="isNavbar"/>
  <MistBackground />
  <RouterView :key="route.fullPath" />
</template>

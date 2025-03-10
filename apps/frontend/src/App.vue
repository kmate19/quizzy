<script setup lang="ts">
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
import MistBackground from './components/MistBackground.vue'
import NavBar from './components/NavBar.vue';
</script>

<template>
  <VueQueryDevtools />
  <NavBar/>
  <MistBackground/>
  <RouterView/>
</template>

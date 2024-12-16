<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'
  import MistBackground from '@/components/MistBackground.vue';
  
  const isVisible = ref(false)
  const cards = ref([])
  const navContainer = ref(null)
  const isOutsideContainer = ref(false)
  
  const checkVisibility = () => {
    if (cards.value.length === 0) return
    const windowHeight = window.innerHeight
    cards.value.forEach((card) => {
      const cardTop = card.getBoundingClientRect().top
      if (cardTop < windowHeight - 100) {
        isVisible.value = true
      }
    })
  }
  
  const checkNavPosition = () => {
    if (navContainer.value) {
      const containerRect = navContainer.value.getBoundingClientRect()
      isOutsideContainer.value = containerRect.top <= 0
    }
  }
  
  onMounted(() => {
    window.addEventListener('scroll', checkVisibility)
    window.addEventListener('scroll', checkNavPosition)
    checkVisibility() 
    checkNavPosition()
  })
  
  onUnmounted(() => {
    window.removeEventListener('scroll', checkVisibility)
    window.removeEventListener('scroll', checkNavPosition)
  })
  </script>

<template>
    <MistBackground />
      <div class="max-w-6xl mx-auto min-h-screen backdrop-blur-md bg-white/30 rounded-lg shadow-lg overflow-hidden">
          <nav :class="['transition-all duration-300 ease-in-out', { 'fixed top-0 left-0 right-0': isOutsideContainer }]">
            <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div class="flex items-center justify-between h-16">
                <div class="flex items-center">
                  <a href="#" class="text-2xl font-bold text-gray-900">Quizzy</a>
                </div>
                <div class="hidden md:block">
                  <div class="ml-10 flex items-baseline space-x-4">
                    <a href="#" class="text-gray-900 hover:bg-white/50 px-3 py-2 rounded-md text-sm font-medium">Közös játék</a>
                    <a href="#" class="text-gray-900 hover:bg-white/50 px-3 py-2 rounded-md text-sm font-medium">Profil</a>
                    <a href="#" class="text-gray-900 hover:bg-white/50 px-3 py-2 rounded-md text-sm font-medium">Pulcsik</a>
                  </div>
                </div>
              </div>
            </div>
          </nav>
  
        <main class="p-4 sm:p-6 lg:p-8">
          <h1 class="text-4xl font-bold text-center text-gray-900 mb-8">Welcome to Los Hermanos Buenos</h1>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="i in 18" 
              :key="i" 
              class="bg-white/50 p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 opacity-0"
              :class="{ 'fade-in': isVisible }"
              ref="cards"
            >
              <div class="w-full h-40 bg-gray-200 rounded-md mb-4"></div>
              <h2 class="text-xl font-semibold text-gray-900 mb-2">Játék {{ i }}</h2>
              <p class="text-gray-700">Lorem ipsum gojo goku piccolo the drink dont shoot this man isnt BLACK {{ i }}</p>
            </div>
          </div>
        </main>
      </div>
  </template>
  
  <style scoped>
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .fade-in {
    animation: fadeIn 0.5s ease-out forwards;
  }
  </style>
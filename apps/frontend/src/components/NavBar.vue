<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref } from 'vue'
import router from '@/router'

const route = useRoute()
const isMobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

router.afterEach(() => {
  isMobileMenuOpen.value = false
})

const handlePath = () => {
  const path =
    route.fullPath.split('/')[1].charAt(0).toUpperCase() + route.fullPath.split('/')[1].slice(1)
  if (path == '') {
    return 'Kezdőlap'
  } else {
    return path
  }
}
</script>

<template>
  <nav
    :class="[
      'transition-all duration-300 ease-in-out',
      
    ]"
  >
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center">
          <a href="#" class="text-2xl font-bold text-white">Quizzy/{{ handlePath() }}</a>
        </div>
        <div class="hidden md:block">
          <div class="ml-10 flex items-baseline space-x-4">
            <a

              @click="router.push('/')"
              class="text-white hover:bg-white/50 px-3 py-2 rounded-md text-sm font-medium hover:cursor-pointer"
              >Kezdőlap</a
            >
            <a
              href="#"
              class="text-white hover:bg-white/50 px-3 py-2 rounded-md text-sm font-medium hover:cursor-pointer"
              >Közös játék</a
            >
            <a
              href="#"
              class="text-white hover:bg-white/50 px-3 py-2 rounded-md text-sm font-medium hover:cursor-pointer"
              >Játék készítés</a
            >
            <a

              @click="router.push('/profil')"
              class="text-white hover:bg-white/50 px-3 py-2 rounded-md text-sm font-medium hover:cursor-pointer"
              >Profil</a
            >
          </div>
        </div>
        <div class="md:hidden">
          <button @click="toggleMobileMenu" class="text-white hover:bg-white/50 p-2 rounded-md">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                v-if="!isMobileMenuOpen"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
              <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform -translate-y-full opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform -translate-y-full opacity-0"
    >
      <div v-if="isMobileMenuOpen" class="md:hidden">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          
          <a
            @click="router.push('/')"
            class="text-white hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium"
            >Kezdőlap</a
          >
          <a
            class="text-white hover:bg-gray-700  block px-3 py-2 rounded-md text-base font-medium"
            >Közös játék</a
          >
          <a
            class="text-white hover:bg-gray-700   block px-3 py-2 rounded-md text-base font-medium"
            >Játék készítés</a
          >
          <a
            @click="router.push('/profil')"
            class="text-white hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium"
            >Profil</a
          >
          
         
          
        </div>
      </div>
    </transition>
  </nav>
</template>

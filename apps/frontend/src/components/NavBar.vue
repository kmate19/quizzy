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
  switch (path) {
    case '':
      return 'Kezdőlap'
    case 'Game_creation':
      return 'Játék készítés'
    default:
      return path
  }
}
</script>

<template>
  <nav :class="['transition-all duration-300 ease-in-out']">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div
          class="flex items-center glass-button px-4 py-1 text-3xl text-white font-semibold rounded-lg transition-all duration-300 ease-in-out w-fit"
        >
          Quizzy/{{ handlePath() }}
        </div>
        <div class="hidden md:block">
          <div class="ml-10 flex items-baseline space-x-4">
            <a
              @click="router.push('/')"
              class="glass-button px-4 py-1 text-lg text-white font-semibold rounded-lg transition-all duration-300 ease-in-out cursor-pointer w-fit"
              >Kezdőlap</a
            >
            <a
              href="#"
              class="glass-button px-4 py-1 text-lg text-white font-semibold rounded-lg transition-all duration-300 ease-in-out cursor-pointer w-fit"
              >Közös játék</a
            >
            <a
              @click="router.push('/game_creation')"
              class="glass-button px-4 py-1 text-lg text-white font-semibold rounded-lg transition-all duration-300 ease-in-out cursor-pointer w-fit"
              >Játék készítés</a
            >
            <a
              @click="router.push('/profil')"
              class="glass-button px-4 py-1 text-lg text-white font-semibold rounded-lg transition-all duration-300 ease-in-out cursor-pointer w-fit"
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
      enter-active-class="transition duration-300 ease-out-in"
      enter-from-class="transform -translate-y-full opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-300 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform -translate-y-full opacity-0"
    >
      <div v-if="isMobileMenuOpen" class="md:hidden">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <a
            @click="router.push('/')"
            class="text-white hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium"
          >
            Kezdőlap
          </a>
          <a class="text-white hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium">
            Közös játék
          </a>
          <a
            @click="router.push('/game_creation')"
            class="text-white hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium"
          >
            Játék készítés
          </a>
          <a
            @click="router.push('/profil')"
            class="text-white hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium"
          >
            Profil
          </a>
        </div>
      </div>
    </transition>
  </nav>
</template>

<style scoped>
.glass-button {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
}

.glass-button:hover {
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.2);
  transform: translateY(-2px);
}

.glass-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.glass-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
  pointer-events: none;
}
</style>

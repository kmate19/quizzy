<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref } from 'vue'
import router from '@/router'
import XButton from './XButton.vue'

const isCodeModal = ref(false)
const lobbyCode = ref('')
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
          class="flex items-center border-transparent border-2 hover:scale-105 hover:border-white px-4 py-1 text-3xl text-white font-semibold rounded-lg transition-all duration-300 ease-in-out w-fit relative bg-white/10 backdrop-blur-sm shadow-md active:shadow-sm before:content-[''] before:rounded-inherit before:shadow-inner before:shadow-white/10 before:pointer-events-none before:absolute before:inset-0">
          Quizzy/{{ handlePath() }}
        </div>
        <div class="hidden md:block">
          <div class="ml-10 flex items-baseline space-x-4">
            <a @click="router.push('/')"
              class="px-4 py-1 text-lg text-white font-semibold rounded-lg transition-all duration-300 ease-in-out border-2 border-transparent hover:scale-x-105 hover:border-white cursor-pointer w-fit relative bg-white/10 backdrop-blur-sm shadow-md active:shadow-sm before:content-[''] before:rounded-inherit before:shadow-inner before:shadow-white/10 before:pointer-events-none before:absolute before:inset-0">Kezdőlap</a>
            <a @click="isCodeModal = !isCodeModal"
              class="px-4 py-1 text-lg border-2 border-transparent hover:scale-x-105 hover:border-white text-white font-semibold rounded-lg transition-all duration-300 ease-in-out cursor-pointer w-fit relative bg-white/10 backdrop-blur-sm shadow-md active:shadow-sm before:content-[''] before:rounded-inherit before:shadow-inner before:shadow-white/10 before:pointer-events-none before:absolute before:inset-0">Közös
              játék</a>
            <a @click="router.push('/game_creation')"
              class="px-4 py-1 text-lg text-white border-2 border-transparent hover:scale-x-105 hover:border-white font-semibold rounded-lg transition-all duration-300 ease-in-out cursor-pointer w-fit relative bg-white/10 backdrop-blur-sm shadow-md active:shadow-sm before:content-[''] before:rounded-inherit before:shadow-inner before:shadow-white/10 before:pointer-events-none before:absolute before:inset-0">Játék
              készítés</a>
            <div @click="router.push('/profil')"
              class="px-4 py-1 text-lg text-white font-semibold rounded-lg transition-all duration-300 ease-in-out cursor-pointer w-fit hover:scale-x-105 border-2 border-transparent hover:border-white relative bg-white/10 backdrop-blur-sm shadow-md active:shadow-sm before:content-[''] before:rounded-inherit before:shadow-inner before:shadow-white/10 before:pointer-events-none before:absolute before:inset-0">
              Profil
            </div>
          </div>
        </div>
        <div class="md:hidden">
          <button @click="toggleMobileMenu" class="text-white hover:bg-white/50 p-2 rounded-md">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path v-if="!isMobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    <transition enter-active-class="transition duration-300 ease-out-in"
      enter-from-class="transform -translate-y-full opacity-0" enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-300 ease-in" leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform -translate-y-full opacity-0">
      <div v-if="isMobileMenuOpen" class="md:hidden">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <a @click="router.push('/')"
            class="text-white hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium">
            Kezdőlap
          </a>
          <a class="text-white hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium">
            Közös játék
          </a>
          <a @click="router.push('/game_creation')"
            class="text-white hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium">
            Játék készítés
          </a>
          <a @click="router.push('/profil')"
            class="text-white hover:bg-gray-700 border block px-3 py-2 rounded-md text-base font-medium">
            Profil
          </a>
        </div>
      </div>
    </transition>
  </nav>
  <div v-if="isCodeModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div class="bg-white/10 backdrop-blur-md p-8 rounded-2xl w-full max-w-md">
      <div class="flex justify-between items-center mb-6">
        <div class="flex-1">
          <h3 class="text-2xl font-bold text-white">Adja meg a kapott kódot</h3>
        </div>
        <XButton @click="isCodeModal = !isCodeModal" />
      </div>
      <form @submit.prevent class="flex flex-col gap-4">
        <v-text-field label="Lobby kód" v-model="lobbyCode" variant="outlined" density="comfortable"
          class="w-full text-white"></v-text-field>
        <button type="submit" class="glass-button py-2 px-4 text-md text-white font-semibold rounded-lg transition-all duration-300 ease-in-out 
            cursor-pointer w-full !bg-green-900">
          Csatlakozás
        </button>
      </form>
    </div>
  </div>
</template>
<style scoped>
.glass-button {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  border: 2px solid transparent;
}

.glass-button:hover {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid white;
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

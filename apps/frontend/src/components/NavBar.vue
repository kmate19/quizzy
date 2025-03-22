<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref, watch, onMounted, nextTick } from 'vue'
import router from '@/router'
import XButton from './XButton.vue'
import { wsclient } from '@/lib/apiClient'
import { useQuizzyStore } from '@/stores/quizzyStore'

const quizzyStore = useQuizzyStore()

const isCodeModal = ref(false)
const lobbyCode = ref('')
const route = useRoute()
const isLoading = ref(false)
const isMobileMenuOpen = ref(false)
const errorMessage = ref('') // Add error message state

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

router.afterEach(() => {
  isMobileMenuOpen.value = false
})

const componentName = ref('');

const handlePath = (routeName: string) => {
  switch (routeName) {
    case 'home':
      return 'Kezdőlap';
    case 'game_creation':
      return 'Játék készítés';
    case 'quiz_practice':
      return 'Gyakorlás';
    case 'detailed_view':
      return 'Megtekintés';
    case 'profile':
      return 'Profil';
    default:
      if (typeof routeName === 'string') {
        const words = routeName.split('_');
        const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
        return capitalizedWords.join(' ');
      } else {
        return 'Ismeretlen oldal';
      }
  }
};

const updateComponentName = () => {
  if (route && route.name) {
    componentName.value = handlePath(route.name.toString());
  } else {
    componentName.value = 'Kezdőlap';
  }
};

watch(() => route.name, () => {
  updateComponentName();
});

onMounted(() => {
  nextTick(() => {
    updateComponentName();
  });

})

const joinLobby = async (code: string) => {
  errorMessage.value = ''; // Clear previous errors
  
  if (!code || code.trim() === '') {
    errorMessage.value = 'Kérjük, adjon meg érvényes lobby kódot';
    return;
  }
  
  try {
    isLoading.value = true;
    
    const first = await wsclient.reserve.session[':code?'].$post({
      param: { code: code.trim() },
      query: { ts: Date.now().toString() },
    });
    
    if (first.status === 200) {
      const first_data = await first.json() as { code?: string };
      
      if (!first_data.code) {
        isLoading.value = false;
        errorMessage.value = 'Érvénytelen lobby válasz a szervertől';
        return;
      }
      
      quizzyStore.setLobbyData({
        lobbyId: first_data.code,
        hash: '',
        quizId: '',
        timestamp: Date.now(),
        isHost: false
      });
      
      isCodeModal.value = false;
      isLoading.value = false;
      router.push(`/quiz/multiplayer/${first_data.code}`);
    } else {
      errorMessage.value = 'A megadott kóddal nem létezik lobby';
      isLoading.value = false;
    }
  } catch (error) {
    console.error('Error joining lobby:', error);
    isLoading.value = false;
    errorMessage.value = 'Nem sikerült csatlakozni a lobbyhoz. Hálózati hiba vagy szerver probléma.';
  }
}
</script>

<template>
  <nav class="transition-all duration-300 ease-in-out relative bg-transparent z-50">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="items-center border-transparent border-2 hover:scale-105 hover:border-white px-4 py-1 text-3xl
           text-white font-semibold rounded-lg transition-all duration-300 ease-in-out w-fit relative
            bg-white/10 backdrop-blur-sm shadow-md active:shadow-sm whitespace-nowrap before:content-[''] 
            before:rounded-inherit before:shadow-inner before:shadow-white/10 before:pointer-events-none
             before:absolute before:inset-0">
          Quizzy / {{ componentName }}
        </div>
        <div class="hidden md:block desktop-navbar">
          <div class="ml-10 flex items-baseline space-x-4">
            <a @click="router.push('/')" class="px-4 py-1 text-lg text-white font-semibold rounded-lg transition-all duration-300 ease-in-out 
              border-2 border-transparent hover:scale-x-105 hover:border-white cursor-pointer w-fit relative bg-white/10 
              backdrop-blur-sm shadow-md active:shadow-sm before:content-[''] before:rounded-inherit 
              before:shadow-inner before:shadow-white/10 before:pointer-events-none before:absolute before:inset-0
              flex justify-center items-center">
              Kezdőlap
            </a>
            <a @click="isCodeModal = !isCodeModal" class="px-4 py-1 text-lg border-2 border-transparent hover:scale-x-105 hover:border-white
               text-white font-semibold rounded-lg transition-all duration-300 ease-in-out cursor-pointer w-fit relative
               bg-white/10 backdrop-blur-sm shadow-md active:shadow-sm before:content-[''] before:rounded-inherit
               before:shadow-inner before:shadow-white/10 before:pointer-events-none before:absolute before:inset-0
               flex justify-center items-center">
              Közös játék
            </a>
            <a @click="router.push('/game_creation')" class="px-4 py-1 text-lg text-white border-2 border-transparent hover:scale-x-105
               hover:border-white font-semibold rounded-lg transition-all duration-300 ease-in-out cursor-pointer w-fit
               relative bg-white/10 backdrop-blur-sm shadow-md active:shadow-sm before:content-['']
               before:rounded-inherit before:shadow-inner before:shadow-white/10 before:pointer-events-none
               before:absolute before:inset-0 flex justify-center items-center">
              Játék készítés
            </a>
            <div @click="router.push('/profil')" class="px-4 py-1 text-lg text-white font-semibold rounded-lg transition-all duration-300
               ease-in-out cursor-pointer w-fit hover:scale-x-105 border-2 border-transparent hover:border-white 
               relative bg-white/10 backdrop-blur-sm shadow-md active:shadow-sm before:content-[''] before:rounded-inherit
               before:shadow-inner before:shadow-white/10 before:pointer-events-none before:absolute before:inset-0
               flex justify-center items-center">
              Profil
            </div>
          </div>
        </div>
        <div class="block md:hidden mobile-navbar">
          <button @click="toggleMobileMenu"
            class="text-white hover:bg-white/50 p-2 rounded-md transition-all duration-300">
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
      <div v-if="isMobileMenuOpen"
        class="md:hidden block bg-white/10 backdrop-blur-sm absolute top-16 left-0 right-0 z-50 m-5 rounded-md mobile-navbar">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <a @click="router.push('/')" class="text-white hover:bg-gray-700 px-3 py-2 rounded-md text-base font-medium flex justify-center items-center cursor-pointer transition-all duration-300
            outlined-text">
            Kezdőlap
          </a>
          <a @click="isCodeModal = !isCodeModal" class="text-white hover:bg-gray-700 px-3 py-2 rounded-md text-base font-medium flex justify-center items-center cursor-pointer transition-all duration-300
            outlined-text">
            Közös játék
          </a>
          <a @click="router.push('/game_creation')"
            class="text-white hover:bg-gray-700 px-3 py-2 rounded-md text-base font-medium flex justify-center items-center cursor-pointer transition-all duration-300 outlined-text">
            Játék készítés
          </a>
          <a @click="router.push('/profil')"
            class="text-white hover:bg-gray-700 px-3 py-2 rounded-md text-base font-medium flex justify-center items-center cursor-pointer transition-all duration-300 outlined-text">
            Profil
          </a>
        </div>
      </div>
    </transition>
  </nav>
  <transition name="fade">
    <div v-if="isCodeModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md">
      <div
        class="relative w-full max-w-md p-6 rounded-lg bg-white/10 border border-white/20 backdrop-blur-xl shadow-lg">
        <XButton @click="isCodeModal = !isCodeModal" class="absolute top-2 right-2" />
        <h3 class="text-xl font-semibold mb-4 text-white">Adja meg a kapott kódot</h3>
        <div class="flex flex-col gap-4">
          <v-text-field label="Lobby kód" v-model="lobbyCode" variant="outlined" density="comfortable" 
            class="w-full text-white"></v-text-field>
          <!-- Show error message if present -->
          <div v-if="errorMessage" class="text-red-500 text-sm mb-2">{{ errorMessage }}</div>
          <button @click="joinLobby(lobbyCode)" class="glass-button py-2 px-4 text-md text-white font-semibold rounded-full transition-all duration-300 ease-in-out
            cursor-pointer w-full !bg-green-900">
            {{isLoading ? 'Csatlakozás...' : 'Csatlakozás'}}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}


.outlined-text {
  text-shadow:
    -1px -1px 0 black,
    1px -1px 0 black,
    -1px 1px 0 black,
    1px 1px 0 black;
}

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

@media (min-width: 851px) {
  .desktop-navbar {
    display: block;
  }

  .mobile-navbar {
    display: none;
  }
}

@media (max-width: 958px) {
  .desktop-navbar {
    display: none;
  }

  .mobile-navbar {
    display: block;
  }
}
</style>

<script setup lang="ts">
import { ref } from 'vue'
import { PencilIcon, XIcon } from 'lucide-vue-next'
import NavBar from '@/components/NavBar.vue'
import MistBackground from '@/components/MistBackground.vue'
import { clientv1 } from '@/lib/apiClient'
import router from '@/router'
import { toast, type ToastOptions } from 'vue3-toastify'

const asd = () => {
  alert('asd')
}

const user = {
  playedgames: 200,
  games_won: 56,
  username: 'Bence',
  email: 'f.bence8100@gmail.com',
  pfp: '/placeholder.svg?height=128&width=128',
  role: 'admin',
  friends: [
    {
      name: 'goku',
      activity_status: 'online',
      pfp: '/placeholder.svg?height=48&width=48',
    },
    {
      name: 'goku',
      activity_status: 'online',
      pfp: '/placeholder.svg?height=48&width=48',
    },
    {
      name: 'goku',
      activity_status: 'online',
      pfp: '/placeholder.svg?height=48&width=48',
    },
    {
      name: 'goku',
      activity_status: 'online',
      pfp: '/placeholder.svg?height=48&width=48',
    },
    {
      name: 'goku',
      activity_status: 'online',
      pfp: '/placeholder.svg?height=48&width=48',
    },
  ],
  number_of_friends: 3,
  quizzes: [
    {
      category: 'WWII',
      name: 'what happened in world war 2?',
      games: '308',
      quize_img: '/placeholder.svg?height=80&width=80',
    },
    {
      category: 'WWII',
      name: 'what happened in world war 2?',
      games: '308',
      quize_img: '/placeholder.svg?height=80&width=80',
    },
    {
      category: 'WWII',
      name: 'what happened in world war 2?',
      games: '308',
      quize_img: '/placeholder.svg?height=80&width=80',
    },
    {
      category: 'WWII',
      name: 'what happened in world war 2?',
      games: '308',
      quize_img: '/placeholder.svg?height=80&width=80',
    },
    {
      category: 'WWII',
      name: 'what happened in world war 2?',
      games: '308',
      quize_img: '/placeholder.svg?height=80&width=80',
    },
  ],
  number_of_quizzes: 4,
}
const fileInput = ref<HTMLInputElement | null>(null)
const profileImage = ref<string | null>(user.pfp)
const showSaveButton = ref<boolean>(false)
const tempImage = ref<File | null>(null)

const handleFileChange = (event: Event) => {
  const inputElement = event.target as HTMLInputElement
  const file = inputElement.files?.[0]

  if (file) {
    tempImage.value = file
    profileImage.value = URL.createObjectURL(file)
    showSaveButton.value = true
  }
}

const openFileDialog = () => {
  fileInput.value?.click()
}

const OnLogOut = () => {
  clientv1.auth.logout.$get()
  router.push('/login')
}

const saveProfileImage = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  showSaveButton.value = false
}
const showPasswordModal = ref(false)
const passwordForm = ref({
  current: '',
  new: '',
  confirm: '',
})

const openPasswordModal = () => {
  showPasswordModal.value = true
}

const closePasswordModal = () => {
  showPasswordModal.value = false
  passwordForm.value = {
    current: '',
    new: '',
    confirm: '',
  }
}

const handlePasswordChange = async () => {
  if (passwordForm.value.new !== passwordForm.value.confirm) {
    toast("A jelszavak nem egyeznek", {
      autoClose: 5000,
      position: toast.POSITION.TOP_CENTER,
      type: 'error',
      transition: 'zoom',
      pauseOnHover: false,
    } as ToastOptions)
    
    return
  }

  await new Promise((resolve) => setTimeout(resolve, 1000))
  closePasswordModal()
}

</script>

<template>
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <MistBackground />
    </div>
    <div class="relative max-w-7xl mx-auto">
      <NavBar />
      <div class="backdrop-blur-md bg-white/10 rounded-2xl p-8 mb-8 flex flex-wrap gap-8 ">
        <div class="flex flex-wrap items-center gap-8">
          <div class="relative">
            <img
              :src="profileImage || ''"
              class="w-32 h-32 rounded-full object-cover border-4 border-white/30"
            />
            <div
              class="absolute -top-2 -right-2 p-2 rounded-full bg-white/10 backdrop-blur-sm cursor-pointer hover:bg-white/20 transition-colors"
              @click="openFileDialog"
            >
              <PencilIcon class=" w-5 h-5 text-white" />
            </div>
            <input
              type="file"
              ref="fileInput"
              class="hidden"
              accept="image/*"
              @change="handleFileChange"
            />
            <button
              v-if="showSaveButton"
              @click="saveProfileImage"
              class="absolute -bottom-2 -right-2 px-3 py-1 bg-green-500 text-white text-sm rounded-full hover:bg-green-600 transition-colors"
            >
              Mentés
            </button>
          </div>
          <div class="text-white flex flex-col flex-wrap">
            <h1 class="text-3xl font-bold mb-2">{{ user.username }}</h1>
            <p class="text-white/80">{{ user.email }}</p>
            <p
              v-if="user.role === 'admin'"
              class="mt-2 px-3 py-1 bg-purple-500/30 rounded-full inline-block text-sm"
            >
              {{ user.role }}
            </p>
          </div>
        </div>
        <div class="flex-1 flex flex-wrap justify-end items-center gap-4">
          <div class="text-center">
            <div class="text-4xl font-bold text-white mb-2">{{ user.playedgames }}</div>
            <div class="text-white/70 text-sm">Játszmák</div>
          </div>
          <div class="text-center">
            <div class="text-4xl font-bold text-white mb-2">{{ user.games_won }}</div>
            <div class="text-white/70 text-sm">1. helyezés</div>
          </div>
          <div class="text-center">
            <div class="text-4xl font-bold text-white mb-2">
              {{ Math.round((user.games_won / user.playedgames) * 100) }}%
            </div>
            <div class="text-white/70 text-sm">Nyerési arány</div>
          </div>
          <div class="flex gap-4">
            <button
              @click="openPasswordModal"
              class="glass-button px-4 py-1 text-lg text-white font-semibold rounded-lg transition-all duration-300 ease-in-out cursor-pointer w-fit !bg-green-900"
            >
              Jelszó módosítás
            </button>
            <button
              class="glass-button px-4 py-1 text-lg text-white font-semibold rounded-lg transition-all duration-300 ease-in-out cursor-pointer w-fit !bg-red-900"
              @click="OnLogOut"
            >
              Kijelentkezés
            </button>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="backdrop-blur-md bg-white/10 rounded-2xl p-6 ">
          <h2 class="text-2xl font-bold text-white mb-6 flex items-center justify-between">
            Barátok
            <span class="text-sm font-normal text-white/70">
              {{ user.friends.length }} összesen
            </span>
          </h2>
          <div class="space-y-4 overflow-y-scroll custom-scrollbar p-6" style="max-height: 400px">
            <div
              v-for="friend in user.friends"
              :key="friend.name"
              class="flex gap-4 p-2 rounded-xl hover:bg-white/20 h-32 text-white ease-in-out
      bg-white/10 border-white/30 border-4 shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              <img
                :src="friend.pfp"
                alt="Friend profile"
                class="w-20 h-20 rounded-full object-cover"
              />
              <div class="flex-1">
                <h3 class="text-white font-medium text-xl mb-2">{{ friend.name }}</h3>
                <p class="text-sm">
                  <span
                    class="inline-block w-2 h-2 rounded-full mr-2"
                    :class="friend.activity_status === 'online' ? 'bg-green-400' : 'bg-gray-400'"
                  >
                  </span>
                  {{ friend.activity_status }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="backdrop-blur-md bg-white/10 rounded-2xl p-6">
          <h2 class="text-2xl font-bold text-white mb-6 flex items-center justify-between">
            Saját quizzyk
            <span class="text-sm font-normal text-white/70">
              {{ user.quizzes.length }} összesen
            </span>
          </h2>
          <div class="space-y-4 overflow-y-auto custom-scrollbar p-6" style="max-height: 400px">
            <div
              @click="asd()"
              v-for="quiz in user.quizzes"
              :key="quiz.name"
              class="quizzy flex gap-4 p-2 rounded-xl hover:bg-white/20 h-32 text-white ease-in-out
              bg-white/10 border-white/30 border-4 shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              <img
                :src="quiz.quize_img"
                alt="Quiz thumbnail"
                class="w-20 h-20 rounded-lg object-cover"
              />
              <div class="flex-1">
                <h3 class="text-white font-medium text-base">{{ quiz.name }}</h3>
                <p class="text-sm text-white/70 mb-2">Kategória: {{ quiz.category }}</p>
                <p class="text-sm">
                  <span class="text-purple-300">{{ quiz.games }}</span> alkalommal játszott
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    >
    <div
      v-if="showPasswordModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center 
      justify-center z-50"
    >
      <div class="bg-white/10 backdrop-blur-md p-8 rounded-2xl w-full max-w-md">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-bold text-white">Jelszó változtatás</h3>
          <XIcon
            @click="closePasswordModal"
            class="w-6 h-6 text-white cursor-pointer hover:text-white/70"
          />
        </div>
        <form @submit.prevent="handlePasswordChange" class="space-y-4">
          <div>
            <label class="block text-white mb-2">Jelenlegi jelszó</label>
            <input
              type="text"
              v-model="passwordForm.current"
              class="w-full px-4 py-2 rounded-lg bg-white/5 border
               border-white/10 text-white focus:outline-none focus:border-white/30"
            />
          </div>
          <div>
            <label class="block text-white mb-2">Új jelszó</label>
            <input
              type="text"
              v-model="passwordForm.new"
              class="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-white/30"
            />
          </div>
          <div>
            <label class="block text-white mb-2">Új jelszó megerősítése</label>
            <input
              type="text"
              v-model="passwordForm.confirm"
              class="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-white/30"
            />
          </div>
          <button
            type="submit"
            class="glass-button px-4 py-1 text-lg text-white font-semibold rounded-lg transition-all duration-300 ease-in-out cursor-pointer w-full !bg-green-900"
          >
            Jelszó módosítása
          </button>
        </form>
      </div>
    </div>
</template>

<style>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1);
  scroll-behavior: smooth;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.5);
}

.quizzy {
  cursor: pointer;
}

button {
  cursor: pointer;
}

.glass-button {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
}

.glass-button:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
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

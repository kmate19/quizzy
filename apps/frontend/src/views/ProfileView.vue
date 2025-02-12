<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { PencilIcon, CircleHelp } from 'lucide-vue-next'
import XButton from '@/components/XButton.vue'
import NavBar from '@/components/NavBar.vue'
import MistBackground from '@/components/MistBackground.vue'
import { clientv1 } from '@/lib/apiClient'
import router from '@/router'
import { toast, type ToastOptions } from 'vue3-toastify'


interface Language {
  name: string;
  iso_code: string;
  icon: string;
  support: 'none' | 'official' | 'partial';
}

interface Tag {
  name: string;
}

interface Quiz {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  description: string;
  title: string;
  status: 'published' | 'draft' | 'requires_review' | 'private';
  rating: number;
  plays: number;
  banner: number[];
  languages: Language[]
  tags: Tag[];
}

const isLoading = ref(true)
const userQuizzies = ref<Quiz[]>([])



const getQuizzies = async () => {
  try {
    isLoading.value = true
    const res = await clientv1.quizzes.own.$get()
    const data = await res.json();
    [...data.data].forEach((el) => {
      const temp: Quiz = {
        id: el.id,
        created_at: el.created_at,
        updated_at: el.updated_at,
        user_id: el.user_id,
        description: el.description,
        title: el.title,
        status: el.status,
        rating: el.rating,
        plays: el.plays,
        banner: el.banner.data,
        languages: el.languages.map((lang) => ({
          name: lang.language.name,
          iso_code: lang.language.iso_code,
          icon: lang.language.icon,
          support: lang.language.support
        })),
        tags: el.tags.map((tag) => ({
          name: tag.tag.name,
        })),
      }
      userQuizzies.value.push(temp)
    })
  } catch (error) {
    console.error('error:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  getQuizzies()
})

const passwordRequirements = [
  '• Minimum 8 karakter',
  '• Legalább egy nagybetű',
  '• Legalább egy kisbetű',
  '• Legalább egy szám',
  '• Jelszavak egyezése',
]

const showPasswordRequirements = () => {
  toast(passwordRequirements.join('\n'), {
    autoClose: 5000,
    position: toast.POSITION.TOP_CENTER,
    type: 'info',
    transition: 'zoom',
    pauseOnHover: false,
  })
}

const realUser = ref({
  email: '',
  username: '',
  created_at: '',
  activity_status: '',
  profile_picture: '',
})

const userData = async() => {
  const user = await clientv1.userprofile.$get()
  const userPfp = await clientv1.userprofile.profilepic.$get()
  console.log(userPfp)
  if(userPfp.ok){
    const res = await userPfp.json()
    console.log(res)
    const uint8Array = new Uint8Array(res.data.data)
    const blob = new Blob([uint8Array], { type: 'image/png' })
    profileImage.value = URL.createObjectURL(blob)
  }
  else{
    const res = await userPfp.json()
    toast(res.error.message, {
      autoClose: 5000,
      position: toast.POSITION.TOP_CENTER,
      type: 'error',
      transition: 'zoom',
      pauseOnHover: false,
    })
  }

  if(user.status===200){
    const res = await user.json()
    console.log("asd",res.data)
    realUser.value = {
  email: res.data.email,
  username: res.data.username,
  created_at: res.data.createdAt,
  activity_status: res.data.activityStatus,
  profile_picture: "", // ide meg kell a data
};
  }
  else{
    const res = await user.json()
    toast(res.error.message, {
      autoClose: 5000,
      position: toast.POSITION.TOP_CENTER,
      type: 'error',
      transition: 'zoom',
      pauseOnHover: false,
    })
  }

}

userData()

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
    const size = file.size / (1024 * 1024)

    if (size > 2) {
      toast('A fájl mérete túl nagy!\n(Max: 2 MB)', {
        autoClose: 5000,
        position: toast.POSITION.TOP_CENTER,
        type: 'error',
        transition: 'zoom',
        pauseOnHover: false,
      })
      return
    }

    tempImage.value = file
    console.log(tempImage.value)
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
  const pfpUpload = await fetch('/api/v1/userprofile/profilepic',{
    method: 'post',
    body: tempImage.value
  })
  if(pfpUpload.status===200){
    const res = await pfpUpload.json()
    console.log(res)
    toast('Profilkép sikeresen módosítva!', {
      autoClose: 5000,
      position: toast.POSITION.TOP_CENTER,
      type: 'success',
      transition: 'zoom',
      pauseOnHover: false,
    })
    console.log(showSaveButton.value)
    showSaveButton.value = false
    console.log(showSaveButton.value)
  }
  else{
    const res = await pfpUpload.json()
    toast(res.error.message, {
      autoClose: 5000,
      position: toast.POSITION.TOP_CENTER,
      type: 'error',
      transition: 'zoom',
      pauseOnHover: false,
    })
  }
  
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
    toast('A jelszavak nem egyeznek', {
      autoClose: 5000,
      position: toast.POSITION.TOP_CENTER,
      type: 'error',
      transition: 'zoom',
      pauseOnHover: false,
    } as ToastOptions)
    return
  }

  
  closePasswordModal()
}

const arrayBufferToBase64 = (buffer: number[], mimeType = 'image/png'): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `data:${mimeType};base64,${window.btoa(binary)}`;
};

const handleQuizView = (uuid: string) => {
  router.push(`/game_creation/${uuid}`)
}

const handleQuizDeatailedView = (uuid: string) => {
  router.push(`/quiz/${uuid}`)
}

</script>

<template>
  <div class="fixed inset-0 pointer-events-none overflow-hidden">
    <MistBackground />
  </div>
  <div class="relative max-w-7xl mx-auto">
    <NavBar />
    <div class="backdrop-blur-md bg-white/10 rounded-2xl p-8 mb-8 flex flex-wrap gap-8">
      <div class="flex flex-wrap items-center gap-8">
        <div class="relative">
          <img :src="profileImage || ''" class="w-32 h-32 rounded-full object-cover border-4 border-white/30" />
          <div
            class="absolute -top-2 -right-2 p-2 rounded-full bg-white/10 backdrop-blur-sm cursor-pointer hover:bg-white/20 transition-colors"
            @click="openFileDialog">
            <PencilIcon class="w-5 h-5 text-white" />
          </div>
          <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handleFileChange" />
          <button v-if="showSaveButton" @click="saveProfileImage"
            class="absolute -bottom-2 -right-2 px-3 py-1 bg-green-500 text-white text-sm rounded-full hover:bg-green-600 transition-colors">
            Mentés
          </button>
        </div>
        <div class="text-white flex flex-col flex-wrap">
          <h1 class="text-3xl font-bold mb-2">{{ realUser.username }}</h1>
          <p class="text-white/80">{{ realUser.email}}</p>
          <p v-if="user.role === 'admin'" class="mt-2 px-3 py-1 bg-purple-500/30 rounded-full inline-block text-sm">
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
          <button @click="openPasswordModal"
            class="glass-button px-4 py-1 text-lg text-white font-semibold rounded-lg transition-all duration-300 ease-in-out cursor-pointer w-fit !bg-green-900">
            Jelszó módosítás
          </button>
          <button
            class="glass-button px-4 py-1 text-lg text-white font-semibold rounded-lg transition-all duration-300 ease-in-out cursor-pointer w-fit !bg-red-900"
            @click="OnLogOut">
            Kijelentkezés
          </button>
        </div>
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="backdrop-blur-md bg-white/10 rounded-2xl p-6">
        <h2 class="text-2xl font-bold text-white mb-6 flex items-center justify-between">
          Barátok
          <span class="text-sm font-normal text-white/70">
            {{ user.friends.length }} összesen
          </span>
        </h2>
        <div class="space-y-4 overflow-y-scroll custom-scrollbar p-6" style="max-height: 400px">
          <div v-for="friend in user.friends" :key="friend.name"
            class="quizzy flex gap-4 p-2 rounded-xl h-32 text-white hover:border-white border-2 border-transparent shadow-lg transition-all duration-500 bg-multi-color-gradient">
            <img :src="friend.pfp" alt="Friend profile" class="w-20 h-20 rounded-full object-cover" />
            <div class="flex-1">
              <h3 class="text-white font-medium text-xl mb-2">{{ friend.name }}</h3>
              <p class="text-sm">
                <span class="inline-block w-2 h-2 rounded-full mr-2"
                  :class="friend.activity_status === 'online' ? 'bg-green-400' : 'bg-gray-400'">
                </span>
                {{ friend.activity_status }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="backdrop-blur-md bg-white/10 rounded-2xl p-6">
        <h2 class="text-2xl font-bold text-white mb-6 flex items-center justify-between">
          Quizzes
          <span class="text-sm font-normal text-white/70">
            {{ userQuizzies.length }} total
          </span>
        </h2>
        <div class="space-y-4 overflow-y-scroll custom-scrollbar p-6" style="max-height: 400px">
          <div v-for="quiz in userQuizzies" :key="quiz.id"
            class="flex gap-4 p-2 rounded-xl h-32 text-white hover:border-white border-2 border-transparent shadow-lg transition-all duration-500  bg-multi-color-gradient cursor-pointer"
            @click="quiz.status === 'draft' ? handleQuizView(quiz.id) : handleQuizDeatailedView(quiz.id)">
            <div class="relative w-20 h-20 rounded-lg overflow-hidden">
              <img v-if="quiz.banner && quiz.banner.length" :src="arrayBufferToBase64(quiz.banner)" alt="Quiz banner"
                class="w-full h-full object-cover" />
              <div v-else class="w-full h-full bg-gray-600 flex items-center justify-center">
                <span class="text-2xl">🎯</span>
              </div>
            </div>

            <div class="flex-1">
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-white font-medium text-xl">{{ quiz.title }}</h3>
                <span class="px-2 py-1 rounded-full text-xs" :class="{
                  'bg-green-500': quiz.status === 'published',
                  'bg-yellow-500': quiz.status === 'requires_review',
                  'bg-gray-500': quiz.status === 'draft',
                  'bg-blue-500': quiz.status === 'private'
                }">
                  {{ quiz.status }}
                </span>
              </div>

              <p class="text-sm text-white/70 mb-2 line-clamp-2">{{ quiz.description }}</p>

              <div class="flex items-center gap-4 text-sm">
                <div class="flex items-center">
                  <span class="mr-1">⭐</span>
                  {{ quiz.rating }}
                </div>
                <div class="flex items-center">
                  <span class="mr-1">👥</span>
                  {{ quiz.plays }}
                </div>
                <div class="flex gap-1">
                  <span v-for="lang in quiz.languages" :key="lang.name"
                    class="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center"
                    :title="lang.name">
                    {{ lang.iso_code }}
                  </span>
                </div>
                <div class="flex flex-wrap gap-1">
                  <span v-for="tag in quiz.tags" :key="tag.name" class="px-2 py-0.5 rounded-full bg-white/10 text-xs">
                    {{ tag.name }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  >
  <div v-if="showPasswordModal"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div class="bg-white/10 backdrop-blur-md p-8 rounded-2xl w-full max-w-md">
      <div class="flex justify-between items-center mb-6">
        <div class="flex justify-evenly flex-row">
          <h3 class="text-2xl font-bold text-white">Jelszó változtatás</h3>
          <CircleHelp class="h-7 w-7 text-blue-400 ml-2 cursor-pointer" @click="showPasswordRequirements" />
        </div>
        <XButton @click="closePasswordModal" />
      </div>
      <form @submit.prevent="handlePasswordChange" class="space-y-4 text-white">
        <div>
          <v-text-field type="text" variant="outlined" density="comfortable" label="Jelenlegi jelszó"
            v-model="passwordForm.current" />
        </div>
        <div>
          <v-text-field type="text" variant="outlined" density="comfortable" label="Új jelszó"
            v-model="passwordForm.new" />
        </div>
        <div>
          <v-text-field type="text" variant="outlined" density="comfortable" label="Új jelszó megerősítése"
            v-model="passwordForm.confirm" />
        </div>
        <button type="submit"
          class="glass-button px-4 py-1 text-lg text-white font-semibold rounded-lg transition-all duration-300 ease-in-out cursor-pointer w-full !bg-green-900">
          Jelszó módosítása
        </button>
      </form>
    </div>
  </div>
</template>

<style>
.bg-multi-color-gradient {
  background: linear-gradient(90deg,
      rgba(255, 0, 0, 0.5),
      rgba(0, 255, 0, 0.5),
      rgba(0, 0, 255, 0.5),
      rgba(238, 238, 85, 0.5),
      rgba(255, 0, 0, 0.5));
  background-size: 400% 100%;
  animation: gradient 20s linear infinite;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }

  100% {
    background-position: 400% 50%;
  }
}

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

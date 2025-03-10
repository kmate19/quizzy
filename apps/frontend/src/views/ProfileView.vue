<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { PencilIcon, CircleHelp, Loader2Icon, Settings, Trash2 } from 'lucide-vue-next'
import XButton from '@/components/XButton.vue'
import NavBar from '@/components/NavBar.vue'
import MistBackground from '@/components/MistBackground.vue'
import { clientv1 } from '@/lib/apiClient'
import router from '@/router'
import { toast, type ToastOptions } from 'vue3-toastify'
import { arrayBufferToBase64 } from '@/utils/helpers'
import { queryClient } from '@/lib/queryClient'
import { useQuery } from '@tanstack/vue-query'
import { useRoute } from 'vue-router'
import {
  userData,
  getUserQuizzies,
  handleDelete,
  handlePasswordChange,
  getApiKey,
  deleteApiKey,
  listApiKeys,
} from '@/utils/functions/profileFunctions'

const localPfp = ref('') 
const keyId = ref(0)
const isLoadingDelete = ref(false)
const isLoadingKey = ref(false)
const isDeleteApiKey = ref(false)
const isApiModal = ref(false)
const description = ref('')
const expiration = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const selectedUuid = ref<string>('')
const isDeleteModal = ref(false)
const showSaveButton = ref<boolean>(false)
const tempImage = ref<File | null>(null)
const showPasswordModal = ref(false)
const apiKey = ref('')
const route = useRoute()
const userId = route.params.uuid.toString()

const isOtherUser = computed(() => {
  return userId !== ''
})

const minDateTime = computed(() => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
})

const userPw = ref({
  current_password: '',
  new_password: '',
  confirm_password: '',
})

const { data: realUser, isLoading: isLoadingPage } = useQuery({
  queryKey: ['userProfile', userId],
  queryFn: () => userData(userId),
  staleTime: 60 * 15 * 1000,
  refetchInterval: 60 * 15 * 1000,
  refetchOnMount: true,
})

const { data: userQuizzies, isLoading: isLoadingQuizzies } = useQuery({
  queryKey: ['userQuizzies', userId],
  queryFn: () => getUserQuizzies(userId),
  staleTime: 60 * 15 * 1000,
  refetchInterval: 60 * 15 * 1000,
  refetchOnMount: true,
})

watch(
  realUser,
  (newUser) => {
    if (newUser?.profile_picture) {
      localPfp.value = newUser.profile_picture
    }
  },
  { immediate: true },
)

const isAdmin = computed(() => {
  return localStorage.getItem('isAdmin') === "admin"
})

const { data: apiKeys, isLoading: isLoadingApiKeys } = useQuery({
  queryKey: ['apiKeys'],
  queryFn: listApiKeys,
  staleTime: 60 * 15 * 1000,
  refetchInterval: 60 * 15 * 1000,
  refetchOnMount: true,
  enabled: isAdmin.value,
})

const genApiKey = async () => {
  isLoadingKey.value = true;
  try {
    if (expiration.value.trim() === "") {
      toast("Érvényesség megadása kötelező!", {
        autoClose: 3500,
        position: toast.POSITION.TOP_CENTER,
        type: 'error',
        transition: 'zoom',
        pauseOnHover: false,
      })
      isLoadingKey.value = false;
      return;
    }
    const generatedApiKey = await getApiKey(expiration.value, description.value) as string;
    apiKey.value = generatedApiKey;
  } catch (error) {
    console.log("Error generating API key:", error);
  } finally {
    isLoadingKey.value = false;
    description.value = '';
    expiration.value = '';
  }
};

const onDeleteApiKey = async (id: number) => {
  await deleteApiKey(id)
  isDeleteApiKey.value = false
}

const copyText = (copyValue: string) => {
  navigator.clipboard.writeText(copyValue)
  toast('API kulcs másolva a vágólapra!', {
    autoClose: 3500,
    position: toast.POSITION.TOP_CENTER,
    type: 'success',
    transition: 'zoom',
    pauseOnHover: false,
  } as ToastOptions)
}

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

const openPasswordModal = () => {
  showPasswordModal.value = true
}

const closePasswordModal = async () => {
  showPasswordModal.value = false
  userPw.value = {
    current_password: '',
    new_password: '',
    confirm_password: '',
  }
}

const handleFileChange = (event: Event) => {
  const inputElement = event.target as HTMLInputElement
  const file = inputElement.files?.[0]

  if (file) {
    const size = file.size / (1024 * 1024)

    if (size > 1) {
      toast('A fájl mérete túl nagy!\n(Max: 1 MB)', {
        autoClose: 5000,
        position: toast.POSITION.TOP_CENTER,
        type: 'error',
        transition: 'zoom',
        pauseOnHover: false,
      })
      return
    }

    tempImage.value = file
    localPfp.value = URL.createObjectURL(file)
    queryClient.refetchQueries({ queryKey: ['userProfile'] })
    showSaveButton.value = true
  }
}

const openFileDialog = () => {
  fileInput.value?.click()
}

const saveProfileImage = async () => {
  const pfpUpload = await fetch('/api/v1/userprofile/profilepic', {
    method: 'post',
    body: tempImage.value,
  })
  if (pfpUpload.status === 200) {
    toast('Profilkép sikeresen módosítva!', {
      autoClose: 5000,
      position: toast.POSITION.TOP_CENTER,
      type: 'success',
      transition: 'zoom',
      pauseOnHover: false,
    })
    showSaveButton.value = false
    queryClient.refetchQueries({ queryKey: ['userProfile'] })
  } else {
    const res = await pfpUpload.json()
    toast(res.error.message, {
      autoClose: 5000,
      position: toast.POSITION.TOP_CENTER,
      type: 'error',
      transition: 'zoom',
      pauseOnHover: false,
    })
    localPfp.value = tempImage.value ? URL.createObjectURL(tempImage.value) : ''
  }
}

const handleQuizView = (uuid: string) => {
  router.push(`/game_creation/${uuid}`)
}

const handleQuizDetailedView = (uuid: string) => {
  router.push(`/quiz/${uuid}`)
}

const onDelete = (uuid: string) => {
  isLoadingDelete.value = true
  handleDelete(uuid)
  isLoadingDelete.value = false
  isDeleteModal.value = false
}

const OnLogOut = async () => {
  await clientv1.auth.logout.$get()
  queryClient.clear()
  localStorage.clear()
  router.push('/login')
}

watch(
  () => route.params.uuid,
  (newUserId, oldUserId) => {
    if (newUserId !== oldUserId) {
      queryClient.refetchQueries({ queryKey: ['userQuizzies', userId]})
    }
  }
);

</script>
<template>
  <MistBackground/>
  <Transition appear enter-active-class="transition ease-in-out duration-1000"
    enter-from-class="opacity-0 translate-y-4" enter-to-class="opacity-100 translate-y-0">
    <div>
      <div class="relative max-w-7xl mx-auto p-2">
        <NavBar/>
        <div :class="isOtherUser?'flex flex-col lg:flex-row items-center justify-center gap-4 lg:mt-42':''">
          <div class="backdrop-blur-md bg-white/10 rounded-2xl p-8 mb-8 flex m-auto gap-8 w-fit">
            <div v-if="isLoadingPage" class="w-full flex justify-center items-center">
              <div class="flex justify-center items-center h-38">
                <Loader2Icon class="w-12 h-12 text-white animate-spin" />
              </div>
            </div>
            <div v-else
              class="flex flex-col md:justify-center w-full items-center gap-6 md:gap-8 p-4"
              :class="isOtherUser ? 'md:flex-col' : 'md:flex-row md:flex-wrap'">
              <div class="relative mx-auto md:mx-0">
                <img :src="localPfp"
                  class="md:w-40 md:h-40 h-48 w-48 rounded-full object-cover border-4 border-white/30" />
                <div v-if="!isOtherUser">
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
              </div>
              <div class="flex flex-col items-center md:items-start text-center md:text-left text-white">
                <h1 class="text-2xl md:text-3xl font-bold mb-1 md:mb-2">{{ realUser?.username }}</h1>
                <p v-if="!isOtherUser" class="text-white/80 text-sm md:text-base">{{ realUser?.email }}</p>

                <div class="flex flex-col gap-2 mt-2"
                  v-if="realUser?.roles?.some(role => role.role.name === 'admin') && !isOtherUser">
                  <p class="px-3 py-1 bg-purple-500/30 rounded-full text-sm flex justify-center items-center">
                    <span>
                      Admin
                    </span>
                  </p>
                  <button @click="isApiModal = true"
                    class="glass-button px-4 py-1 text-white font-semibold rounded-lg transition-all duration-300 ease-in-out w-fit !bg-blue-900 hover:border-white border-2 border-transparent">
                    API Kulcs igénylés
                  </button>
                </div>
              </div>
              <div class="flex-1 flex flex-col md:flex-row justify-center md:justify-end items-center gap-6">
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                  <div>
                    <div class="text-3xl md:text-4xl font-bold text-white">
                      {{ realUser?.stats.plays }}
                    </div>
                    <div class="text-white/70 text-xs md:text-sm">Összes játék</div>
                  </div>
                  <div>
                    <div class="text-3xl md:text-4xl font-bold text-white">
                      {{ realUser?.stats.first_places }}
                    </div>
                    <div class="text-white/70 text-xs md:text-sm">1. helyezés</div>
                  </div>
                  <div>
                    <div class="text-3xl md:text-4xl font-bold text-white">
                      {{
                        isNaN(
                          Math.round(
                            (realUser?.stats?.first_places! / realUser?.stats?.plays!) * 100,
                          ),
                        )
                          ? 0
                          : Math.round(
                            (realUser?.stats?.first_places! / realUser?.stats?.plays!) * 100,
                          )
                      }}%
                    </div>
                    <div class="text-white/70 text-xs md:text-sm">Nyerési arány</div>
                  </div>
                </div>
                <div class="flex flex-col sm:flex-row gap-3" v-if="!isOtherUser">
                  <button @click="openPasswordModal"
                    class="glass-button px-4 py-1 text-white font-semibold rounded-lg transition-all duration-300 ease-in-out w-full sm:w-fit !bg-green-900 hover:border-white border-2 border-transparent">
                    Jelszó módosítás
                  </button>
                  <button
                    class="glass-button px-4 py-1 text-white font-semibold rounded-lg transition-all duration-300 ease-in-out w-full sm:w-fit !bg-red-900 hover:border-white border-2 border-transparent"
                    @click="OnLogOut">
                    Kijelentkezés
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="gap-8 justify-center flex flex-col md:flex-row">
            <div class="backdrop-blur-md bg-white/10 rounded-2xl p-6 w-full md:w-[40%]"
              v-if="!isOtherUser && realUser?.friends?.length">
              <div v-if="isLoadingPage" class="h-[456px] flex justify-center items-center self-center">
                <div class="flex justify-center items-center h-64">
                  <Loader2Icon class="w-12 h-12 text-white animate-spin" />
                </div>
              </div>
              <div v-else>
                <h2 class="text-2xl font-bold text-white mb-6 flex items-center justify-between">
                  Barátok
                  <span class="text-sm font-normal text-white/70">
                    {{ realUser?.friends?.length }} összesen
                  </span>
                </h2>
                <div class="space-y-4 overflow-y-scroll custom-scrollbar p-6 max-h-[400px]">
                  <div v-for="friend in realUser?.friends" :key="friend.addressee.id"
                    class="relative flex gap-4 p-2 rounded-xl h-32 text-white hover:border-white border-2 border-transparent shadow-lg transition-all duration-500 cursor-pointer bg-white/10">
                    <img :src="friend.addressee.profile_picture?.data
                      ? arrayBufferToBase64(friend.addressee.profile_picture.data)
                      : 'https://i.pravatar.cc/300?img=2'
                      " alt="Friend profile" class="w-20 h-20 rounded-full object-cover" />
                    <div class="flex-1">
                      <h3 class="text-white font-medium text-xl mb-2">
                        {{ friend.addressee.username }}
                      </h3>
                      <p class="text-sm">
                        <span class="inline-block w-2 h-2 rounded-full mr-2" :class="friend.addressee.activity_status === 'active'
                          ? 'bg-green-400'
                          : 'bg-gray-400'
                          ">
                        </span>
                        {{ friend.addressee.activity_status }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="backdrop-blur-md bg-white/10 rounded-2xl p-6 w-full"
              :class="realUser?.friends?.length ? 'md:w-[50%]' : 'md:w-[75%]'">
              <div v-if="isLoadingQuizzies" class="h-[456px] flex justify-center items-center self-center">
                <div class="flex justify-center items-center h-64">
                  <Loader2Icon class="w-12 h-12 text-white animate-spin" />
                </div>
              </div>
              <div v-else>
                <h2 class="text-2xl font-bold text-white mb-6 flex items-center justify-between">
                  Quizzes
                  <span class="text-sm font-normal text-white/70">
                    {{ userQuizzies?.length }} összesen
                  </span>
                </h2>
                <div class="space-y-4 overflow-y-scroll custom-scrollbar p-6 max-h-[400px]">
                  <div v-for="quiz in userQuizzies" :key="quiz.id" 
                    class="relative flex flex-col md:flex-row gap-4 p-4 rounded-xl text-white 
                    hover:border-white border-2 border-transparent shadow-lg transition-all 
                    duration-500 cursor-pointer bg-white/10" 
                    @click="quiz.status === 'draft' ? handleQuizView(quiz.id) : handleQuizDetailedView(quiz.id)">

                    <div class="relative w-full md:w-20 h-20 rounded-lg overflow-hidden shrink-0">
                      <img v-if="quiz.banner" :src="quiz.banner" alt="Quiz banner"
                        class="w-full h-full object-cover" />
                      <div v-else class="w-full h-full bg-gray-600 flex items-center justify-center"></div>
                    </div>

                    <div class="flex-1 relative">
                      <div class="flex items-center justify-between mb-2">
                        <h3 class="text-white font-medium text-xl">{{ quiz.title }}</h3>

                        <div class="flex gap-2 absolute top-0 right-0">
                          <span v-if="quiz.status !== 'draft' && !isOtherUser" @click.stop="handleQuizView(quiz.id)"
                            class="flex rounded-full text-xs bg-blue-700 w-10 h-10 
                            justify-center items-center border-2 border-transparent 
                            hover:border-white transition-all duration-300">
                            <Settings class="w-5 h-5" />
                          </span>
                          <span v-if="!isOtherUser" @click.stop="
                            (isDeleteModal = !isDeleteModal),
                            (selectedUuid = quiz.id)
                            " class="flex rounded-full text-xs bg-red-700 w-10 h-10 
                            justify-center items-center border-2 border-transparent 
                            hover:border-white transition-all duration-300">
                            <Trash2 class="w-5 h-5" />
                          </span>
                        </div>
                      </div>

                      <span class="px-2 py-1 rounded-full text-xs" :class="{
                        'bg-green-500': quiz.status === 'published',
                        'bg-yellow-500': quiz.status === 'requires_review',
                        'bg-gray-500': quiz.status === 'draft',
                        'bg-blue-500': quiz.status === 'private',
                      }">
                        {{ quiz.status }}
                      </span>

                      <p class="text-sm text-white/70 my-2 line-clamp-2">
                        {{ quiz.description }}
                      </p>

                      <div class="flex items-center flex-wrap gap-4 text-sm mt-2">
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
                            class="w-6 h-6 rounded-lg p-1 bg-white/10 flex items-center justify-center"
                            :title="lang.name">
                            {{ lang.iso_code }}
                          </span>
                        </div>

                        <div class="flex flex-wrap gap-1">
                          <span v-for="tag in quiz.tags" :key="tag.name"
                            class="px-2 py-0.5 rounded-full bg-white/10 text-xs">
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
        </div>
      </div>
      <div v-if="showPasswordModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-white/10 backdrop-blur-md p-8 rounded-2xl w-full max-w-md">
          <div class="flex justify-between items-center mb-6">
            <div class="flex justify-evenly flex-row">
              <h3 class="text-2xl font-bold text-white">Jelszó változtatás</h3>
              <CircleHelp class="h-7 w-7 text-blue-400 ml-2 cursor-pointer" @click="showPasswordRequirements" />
            </div>
            <XButton @click="closePasswordModal"/>
          </div>
          <form @submit.prevent="
            handlePasswordChange(
              userPw.new_password,
              userPw.confirm_password,
              userPw.current_password,
            )
            " class="space-y-4 text-white">
            <div>
              <input type="password" placeholder="Jelenlegi jelszó" v-model="userPw.current_password"
                class="w-full p-3 rounded-md bg-white/10 border border-white/20 focus:border-white/50 outline-none" />
            </div>
            <div>
              <input type="password" placeholder="Új jelszó" v-model="userPw.new_password"
                class="w-full p-3 rounded-md bg-white/10 border border-white/20 focus:border-white/50 outline-none" />
            </div>
            <div>
              <input type="password" placeholder="Új jelszó megerősítése" v-model="userPw.confirm_password"
                class="w-full p-3 rounded-md bg-white/10 border border-white/20 focus:border-white/50 outline-none" />
            </div>
            <button type="submit"
              class="glass-button px-4 py-3 text-lg text-white font-semibold rounded-lg transition-all duration-300 ease-in-out cursor-pointer w-full !bg-green-900">
              Jelszó módosítása
            </button>
          </form>
        </div>
      </div>
      <div v-if="isDeleteModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-white/10 backdrop-blur-md p-8 rounded-2xl w-full max-w-md">
          <div class="flex justify-between items-center mb-6">
            <div class="flex justify-evenly flex-row">
              <h3 class="text-2xl font-bold text-white">Biztosan szeretnéd törölni a quizt?</h3>
            </div>
            <button @click="isDeleteModal = !isDeleteModal" class="text-white hover:text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form @submit.prevent="onDelete(selectedUuid)" class="flex text-white gap-2">
            <button type="submit"
              class="glass-button px-4 py-1 text-lg text-white font-semibold rounded-lg transition-all duration-300 ease-in-out cursor-pointer w-full !bg-green-900">
              <span v-if="isLoadingDelete" class="inline-block animate-spin mr-2">
                <svg class="w-5 h-5" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
                    fill="none" />
                  <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </span>
              <span v-else> Igen </span>
            </button>
            <button type="button" @click="isDeleteModal = !isDeleteModal"
              class="glass-button px-4 py-1 text-lg text-white font-semibold rounded-lg transition-all duration-300 ease-in-out cursor-pointer w-full !bg-red-900">
              Nem
            </button>
          </form>
        </div>
      </div>
      <div v-if="isDeleteApiKey"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-white/10 backdrop-blur-md p-8 rounded-2xl w-full max-w-md">
          <div class="flex justify-between items-center mb-6">
            <div class="flex justify-evenly flex-row">
              <h3 class="text-2xl font-bold text-white">
                Biztosan szeretnéd törölni az API kulcsot?
              </h3>
            </div>
            <XButton @click="isDeleteApiKey = !isDeleteApiKey"/>
          </div>
          <form @submit.prevent="onDeleteApiKey(keyId)" class="flex text-white gap-2">
            <button type="submit"
              class="glass-button px-4 py-1 text-lg text-white font-semibold rounded-lg transition-all duration-300 ease-in-out cursor-pointer w-full !bg-green-900">
              <span v-if="isLoadingDelete" class="inline-block animate-spin mr-2">
                <svg class="w-5 h-5" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
                    fill="none" />
                  <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </span>
              <span v-else> Igen </span>
            </button>
            <button type="button" @click="isDeleteApiKey = !isDeleteApiKey"
              class="glass-button px-4 py-1 text-lg text-white font-semibold rounded-lg transition-all duration-300 ease-in-out cursor-pointer w-full !bg-red-900">
              Nem
            </button>
          </form>
        </div>
      </div>
      <div v-if="isApiModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div v-if="isLoadingApiKeys" class="min-h-screen flex justify-center items-center">
          <div class="flex justify-center items-center h-64">
            <Loader2Icon class="w-12 h-12 text-white animate-spin" />
          </div>
        </div>
        <div v-else class="bg-white/10 backdrop-blur-md p-8 rounded-2xl w-full max-w-md">
          <div class="flex justify-between items-center mb-6">
            <div class="flex justify-evenly flex-row">
              <h3 class="text-2xl font-bold text-white">API kulcs igénylés</h3>
            </div>
            <button @click="isApiModal = false" class="text-white hover:text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form @submit.prevent="genApiKey" class="flex flex-col text-white gap-4">
            <input type="text" v-model="description" placeholder="Leírás" class="bg-white/10 p-2 rounded-md" />
            <input type="datetime-local" v-model="expiration" :min="minDateTime" class="bg-white/10 p-2 rounded-md" />
            <div v-if="apiKey" class="flex flex-row gap-2 justify-center items-center w-full">
              <div class="px-4 py-1 rounded-md bg-white/10 backdrop-blur-md border-2 border-transparent
                 hover:border-white text-white break-all shadow-lg transition-all duration-300
                  hover:bg-white/20 flex gap-2 items-center cursor-pointer" @click="copyText(apiKey)">
                Generált kulcs másolása
              </div>
            </div>
            <button type="submit" :disabled="apiKeys?.length === 10"
              class="px-4 py-2 text-lg text-white font-semibold rounded-lg transition-all duration-300 ease-in-out cursor-pointer w-full bg-green-900 hover:bg-green-700"
              :class="{ 'opacity-50 cursor-not-allowed hover:bg-green-900 hover:opacity-50 hover:cursor-not-allowed': apiKeys?.length === 10 }">
              <span v-if="isLoadingKey" class="inline-block animate-spin mr-2">
                <svg class="w-5 h-5" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
                    fill="none" />
                  <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </span>
              <span v-else>Generálás</span>
            </button>
          </form>

          <div class="mt-8">
            <h4 class="text-xl font-semibold text-white mb-4">
              API Kulcsaid: {{ apiKeys?.length }}
            </h4>
            <div class="space-y-2 h-[calc(100vh-80vh)] overflow-y-scroll custom-scrollbar p-2">
              <div v-for="key in apiKeys" :key="key.key"
                class="flex justify-between items-center bg-white/10 p-3 rounded-md">
                <div>
                  <p class="text-white font-medium">Leírás: {{ key.description }}</p>
                  <div class="flex items-center">
                    <p class="text-white text-sm">
                      Kulcs:
                      <span class="text-white">
                        {{ key.key }}
                      </span>
                    </p>
                  </div>
                  <p class="text-white/70 text-sm">Lejár: {{ key.expires_at }}</p>
                </div>
                <span
                  class="flex rounded-full text-xs bg-red-700 w-10 h-10 justify-center items-center border-2 border-transparent hover:border-white transition-all duration-300 text-white cursor-pointer"
                  @click="((isDeleteApiKey = true), (keyId = key.id_by_user), (isApiModal = false))">
                  <Trash2 class="w-5 h-5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
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

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
</style>

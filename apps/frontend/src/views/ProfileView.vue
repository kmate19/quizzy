<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { PencilIcon, CircleHelp, Loader2Icon, Settings, Trash2 } from 'lucide-vue-next'
import XButton from '@/components/XButton.vue'
import NavBar from '@/components/NavBar.vue'
import MistBackground from '@/components/MistBackground.vue'
import { clientv1 } from '@/lib/apiClient'
import router from '@/router'
import { toast, type ToastOptions } from 'vue3-toastify'
import * as zod from 'zod'

const newPasswordSchema = zod.object({
  password: zod
    .string()
    .min(1, { message: 'A mező kitöltése kötelező' })
    .min(8, { message: 'Minimum 8 karaktert kell tartalmaznia az új jelszónak' })
    .regex(/[a-z]/, { message: 'Tartalmaznia kell kisbetűt az új jelszónak' })
    .regex(/[A-Z]/, { message: 'Tartalmaznia kell nagybetűt az új jelszónak' })
    .regex(/[^a-zA-Z0-9]/, { message: 'Tartalmaznia kell speciális karaktert az új jelszónak' })
    .regex(/\d/, { message: 'Tartalmaznia kell számot az új jelszónak' }),
})

type NewPasswordSchemaType = zod.infer<typeof newPasswordSchema>

const regErrors = ref<zod.ZodFormattedError<NewPasswordSchemaType> | null>(null)

interface Language {
  name: string
  iso_code: string
  icon: string
  support: 'none' | 'official' | 'partial'
}

interface Tag {
  name: string
}

interface Quiz {
  id: string
  created_at: string
  updated_at: string
  user_id: string
  description: string
  title: string
  status: 'published' | 'draft' | 'requires_review' | 'private'
  rating: number
  plays: number
  banner: number[]
  languages: Language[]
  tags: Tag[]
}

interface sentFriendship {
  created_at: string
  status: 'pending' | 'blocked' | 'accepted'
  addressee: {
    id: string
    username: string
    activity_status: 'active' | 'inactive' | 'away'
    profile_picture: {
      type: 'Buffer'
      data: number[]
    } | null
  }
}

interface recievedFriendships {
  created_at: string
  status: 'pending' | 'blocked' | 'accepted'
  requester: {
    id: string
    username: string
    activity_status: 'active' | 'inactive' | 'away'
    profile_picture: {
      type: 'Buffer'
      data: number[]
    } | null
  }
}

const isLoading = ref(true)
const userQuizzies = ref<Quiz[]>([])

const getQuizzies = async () => {
  try {
    isLoading.value = true
    const res = await clientv1.quizzes.own.$get()
    const data = await res.json()
      ;[...data.data].forEach((el) => {
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
            support: lang.language.support,
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
  sentFriendships: [] as sentFriendship[],
  recievedFriendships: [] as recievedFriendships[],
  friends: [] as sentFriendship[],
  role: '',
  stat: {
    plays: 0,
    first_places: 0,
    second_places: 0,
    third_places: 0,
    wins: 0,
    losses: 0,
  },
})

const userData = async () => {
  const user = await clientv1.userprofile.$get()
  console.log('ASDASD', user.status)
  if (user.status === 200) {
    const res = await user.json()
    console.log('stats', res.data.stats)
    console.log('asd', res.data)
    realUser.value = {
      email: res.data.email,
      username: res.data.username,
      created_at: new Date(res.data.created_at).toLocaleDateString(),
      activity_status: res.data.activity_status,
      profile_picture: res.data.profile_picture
        ? arrayBufferToBase64(res.data.profile_picture.data)
        : '',
      sentFriendships: res.data.sentFriendships,
      recievedFriendships: res.data.recievedFriendships,
      role: res.data.roles[0].role.name,
      stat: res.data.stats,
      friends: res.data.recievedFriendships
        .filter((item) => item.status === 'accepted')
        .map((item) => ({
          created_at: item.created_at,
          status: item.status,
          addressee: {
            id: item.requester.id,
            username: item.requester.username,
            activity_status: item.requester.activity_status,
            profile_picture: item.requester.profile_picture,
          },
        })),
    }
  } else {
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

const fileInput = ref<HTMLInputElement | null>(null)
const selectedUuid = ref<string>('')
const isDeleteModal = ref(false)
const showSaveButton = ref<boolean>(false)
const tempImage = ref<File | null>(null)
const userPw = ref({
  current_password: '',
  new_password: '',
  confirm_password: '',
})

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
    realUser.value.profile_picture = URL.createObjectURL(file)
    showSaveButton.value = true
  }
}

const openFileDialog = () => {
  fileInput.value?.click()
}

const OnLogOut = async () => {
  await clientv1.auth.logout.$get()
  router.push('/login')
}

const saveProfileImage = async () => {
  const pfpUpload = await fetch('/api/v1/userprofile/profilepic', {
    method: 'post',
    body: tempImage.value,
  })
  if (pfpUpload.status === 200) {
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
  } else {
    const res = await pfpUpload.json()
    toast(res.error.message, {
      autoClose: 5000,
      position: toast.POSITION.TOP_CENTER,
      type: 'error',
      transition: 'zoom',
      pauseOnHover: false,
    })
    realUser.value.profile_picture = tempImage.value ? URL.createObjectURL(tempImage.value) : ''
  }
}

const showPasswordModal = ref(false)

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

const handlePasswordChange = async () => {
  const result = newPasswordSchema.safeParse({ password: userPw.value.new_password })
  if (!result.success) {
    regErrors.value = result.error.format()
    toast(
      Object.values(regErrors.value.password?._errors || [])[0] || 'Érvénytelen jelszó formátum!',
      {
        autoClose: 5000,
        position: toast.POSITION.TOP_CENTER,
        type: 'error',
        transition: 'zoom',
        pauseOnHover: false,
      } as ToastOptions,
    )
    return
  }
  if (userPw.value.confirm_password !== userPw.value.new_password) {
    toast('A jelszavak nem egyeznek', {
      autoClose: 5000,
      position: toast.POSITION.TOP_CENTER,
      type: 'error',
      transition: 'zoom',
      pauseOnHover: false,
    } as ToastOptions)
    return
  } else {
    const reset = await clientv1.auth.changepassword.$post({
      json: { oldPassword: userPw.value.current_password, password: userPw.value.new_password },
    })
    if (reset.status === 200) {
      toast('Jelszó sikeresen megváltoztatva!', {
        autoClose: 5000,
        position: toast.POSITION.TOP_CENTER,
        type: 'success',
        transition: 'zoom',
        pauseOnHover: false,
      } as ToastOptions)
      await clientv1.auth.logout.$get()
      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.push('/login')
    } else {
      const res = await reset.json()
      toast(res.message, {
        autoClose: 5000,
        position: toast.POSITION.TOP_CENTER,
        type: 'error',
        transition: 'zoom',
        pauseOnHover: false,
      } as ToastOptions)
    }
  }
}

const arrayBufferToBase64 = (buffer: number[], mimeType = 'image/avif'): string => {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return `data:${mimeType};base64,${window.btoa(binary)}`
}

const handleQuizView = (uuid: string) => {
  router.push(`/game_creation/${uuid}`)
}

const handleQuizDeatailedView = (uuid: string) => {
  router.push(`/quiz/${uuid}`)
}

const handleDelete = async (uuid: string) => {
  const del = await clientv1.quizzes.delete[':quizId'].$delete({ param: { quizId: uuid } })
  if (del.status === 200) {
    toast("Quiz sikeresen törölve", {
      autoClose: 3500,
      position: toast.POSITION.TOP_CENTER,
      type: 'success',
      transition: 'zoom',
      pauseOnHover: false,
    } as ToastOptions)
    isDeleteModal.value = false
    userQuizzies.value = []
    getQuizzies()
  }
  else
  {
    const res = await del.json()
    toast(res.message,{
        autoClose: 3500,
        position: toast.POSITION.TOP_CENTER,
        type: 'error',
        transition: 'zoom',
        pauseOnHover: false,
      })
  }
}

onMounted(() => {
  getQuizzies()
  userData()
})
</script>

<template>
  <MistBackground />
  <Transition appear enter-active-class="transition ease-in-out duration-1000"
    enter-from-class="opacity-0 translate-y-4" enter-to-class="opacity-100 translate-y-0">
    <div>
      <div v-if="isLoading === true" class="min-h-screen flex justify-center items-center">
        <div v-if="isLoading" class="flex justify-center items-center h-64">
          <Loader2Icon class="w-12 h-12 text-white animate-spin" />
        </div>
      </div>
      <div v-else class="fixed inset-0 pointer-events-none overflow-hidden">
      </div>
      <div class="relative max-w-7xl mx-auto">
        <NavBar />
        <div class="backdrop-blur-md bg-white/10 rounded-2xl p-8 mb-8 flex flex-wrap gap-8">
          <div class="flex flex-wrap items-center gap-8">
            <div class="relative">
              <img :src="realUser.profile_picture || ''"
                class="w-32 h-32 rounded-full object-cover border-4 border-white/30" />
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
              <p class="text-white/80">{{ realUser.email }}</p>
              <p v-if="realUser.role === 'admin'"
                class="mt-2 px-3 py-1 bg-purple-500/30 rounded-full inline-block text-sm">
                {{ realUser.role }}
              </p>
              <p v-else class="mt-2 px-3 py-1 bg-red-500/30 rounded-full inline-block text-sm">
                {{ realUser.role }}
              </p>
            </div>
          </div>
          <div class="flex-1 flex flex-wrap justify-end items-center gap-4">
            <div class="text-center">
              <div class="text-4xl font-bold text-white mb-2">{{ realUser.stat.plays }}</div>
              <div class="text-white/70 text-sm">Összes játék</div>
            </div>
            <div class="text-center">
              <div class="text-4xl font-bold text-white mb-2">{{ realUser.stat.first_places }}</div>
              <div class="text-white/70 text-sm">1. helyezés</div>
            </div>
            <div class="text-center">
              <div class="text-4xl font-bold text-white mb-2">
                {{
                  isNaN(Math.round((realUser.stat.first_places / realUser.stat.plays) * 100))
                    ? 0
                    : Math.round((realUser.stat.first_places / realUser.stat.plays) * 100)
                }}%
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
                {{ realUser.friends.length }} összesen
              </span>
            </h2>
            <div class="space-y-4 overflow-y-scroll custom-scrollbar p-6" style="max-height: 400px">
              <div v-for="friend in realUser.friends" :key="friend.addressee.id" class="relative flex gap-4 p-2 rounded-xl h-32 text-white hover:border-white 
              border-2 border-transparent shadow-lg transition-all duration-500 cursor-pointer bg-white/10">
                <img :src="friend.addressee.profile_picture?.data
                  ? arrayBufferToBase64(friend.addressee.profile_picture.data)
                  : ''
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
          <div class="backdrop-blur-md bg-white/10 rounded-2xl p-6">
            <h2 class="text-2xl font-bold text-white mb-6 flex items-center justify-between">
              Quizzes
              <span class="text-sm font-normal text-white/70">
                {{ userQuizzies.length }} összesen
              </span>
            </h2>
            <div class="space-y-4 overflow-y-scroll custom-scrollbar p-6" style="max-height: 400px">
              <div v-for="quiz in userQuizzies" :key="quiz.id" class="relative flex gap-4 p-2 rounded-xl h-32 text-white hover:border-white 
                border-2 border-transparent shadow-lg transition-all duration-500 cursor-pointer bg-white/10" @click="
                  quiz.status === 'draft'
                    ? handleQuizView(quiz.id)
                    : handleQuizDeatailedView(quiz.id)
                  ">
                <div class="relative w-20 h-20 rounded-lg overflow-hidden">
                  <img v-if="quiz.banner && quiz.banner.length" :src="arrayBufferToBase64(quiz.banner)"
                    alt="Quiz banner" class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full bg-gray-600 flex items-center justify-center">
                  </div>
                </div>

                <div class="flex-1">
                  <div class="flex items-center justify-between mb-2">
                    <h3 class="text-white font-medium text-xl">{{ quiz.title }}</h3>
                    <span v-if="quiz.status !== 'draft'" class="absolute top-2 right-2 flex rounded-full text-xs bg-blue-700 w-10 h-10 justify-center items-center border-2 border-transparent
                    hover:border-white transition-all duration-300 ">
                      <Settings @click.stop="handleQuizView(quiz.id)" />
                    </span>
                    <span class="absolute bottom-2 right-2 flex rounded-full text-xs
                     bg-red-700 w-10 h-10 justify-center items-center border-2 border-transparent
                    hover:border-white transition-all duration-300">
                      <Trash2 @click.stop="(isDeleteModal = !isDeleteModal, selectedUuid = quiz.id)" />
                    </span>
                  </div>
                  <span class="px-2 py-1 rounded-full text-xs" :class="{
                    'bg-green-500': quiz.status === 'published',
                    'bg-yellow-500': quiz.status === 'requires_review',
                    'bg-gray-500': quiz.status === 'draft',
                    'bg-blue-500': quiz.status === 'private',
                  }">
                    {{ quiz.status }}
                  </span>

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
                        class="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center" :title="lang.name">
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
                v-model="userPw.current_password" />
            </div>
            <div>
              <v-text-field type="text" variant="outlined" density="comfortable" label="Új jelszó"
                v-model="userPw.new_password" />
            </div>
            <div>
              <v-text-field type="text" variant="outlined" density="comfortable" label="Új jelszó megerősítése"
                v-model="userPw.confirm_password" />
            </div>
            <button type="submit"
              class="glass-button px-4 py-1 text-lg text-white font-semibold rounded-lg transition-all duration-300 ease-in-out cursor-pointer w-full !bg-green-900">
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
            <XButton @click="isDeleteModal = !isDeleteModal" />
          </div>
          <form @submit.prevent="handleDelete(selectedUuid)" class="space-y-4 text-white">
            <button type="submit"
              class="glass-button px-4 py-1 text-lg text-white font-semibold rounded-lg transition-all duration-300 ease-in-out cursor-pointer w-full !bg-green-900">
              Igen
            </button>
            <button type="button" @click="isDeleteModal = !isDeleteModal" 
              class="glass-button px-4 py-1 text-lg text-white font-semibold rounded-lg transition-all duration-300 ease-in-out cursor-pointer w-full !bg-red-900">
              Nem
            </button>
          </form>
        </div>
      </div>
    </div>
  </Transition>
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

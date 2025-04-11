<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import * as zod from 'zod'
import router from '@/router'
import { clientv1 } from '@/lib/apiClient'
import { baseRegisterSchema } from '@/schemas/RegistrationSchema'
import { CircleHelp, EyeIcon, EyeOffIcon } from 'lucide-vue-next'
import { toast, type ToastOptions } from 'vue3-toastify'
import type { ApiResponse } from 'repo'
import { userData } from '@/utils/functions/profileFunctions'
import { useQuizzyStore } from '@/stores/quizzyStore'

const queryClient = useQueryClient()
const quizzyStore = useQuizzyStore()
const isLoading = ref(false)

const isLoginForm = ref(true)


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
    pauseOnHover: true,
  })
}

const flipLogin = () => {
  isLoginForm.value = !isLoginForm.value
}

const regForm = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const clearRegistration = () => {
  regForm.value = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  }
}

type loginFormType = {
  username_or_email: string
  password: string
}

const loginForm = ref<loginFormType>({
  username_or_email: '',
  password: '',
})

type RegisterSchemaType = zod.infer<typeof baseRegisterSchema>

const createRegisterSchema = (password: string) =>
  baseRegisterSchema.refine((data) => data.confirmPassword === password, {
    message: 'A jelszavak nem egyeznek',
    path: ['confirmPassword'],
  })

const regErrors = ref<zod.ZodFormattedError<RegisterSchemaType> | null>(null)

const onRegistration = async () => {
  isLoading.value = true
  const schema = createRegisterSchema(regForm.value.password)
  const valid = schema.safeParse(regForm.value)

  if (!valid.success) {
    regErrors.value = valid.error.format()
  } else {
    regErrors.value = null
    const regRes = await clientv1.auth.register.$post({ json: regForm.value })
    if (regRes.status === 200) {
      toast('Sikeres regisztráció, ellenőrizze email fiókját!', {
        autoClose: 5000,
        position: toast.POSITION.TOP_CENTER,
        type: 'success',
        transition: 'zoom',
        pauseOnHover: false,
      } as ToastOptions)
      flipLogin()
      clearRegistration()
    }
    else if ((regRes.status as number) === 429) {
      toast('Elérted a maximális regisztrációs kísérletek számát!\nMax 5 próbálkozás 15 percenként', {
        autoClose: 5000,
        position: toast.POSITION.TOP_CENTER,
        type: 'error',
        transition: 'zoom',
        pauseOnHover: true,
      } as ToastOptions)
    }
    else {
      const res = (await regRes.json()) satisfies ApiResponse
      toast(res.message, {
        autoClose: 5000,
        position: toast.POSITION.TOP_CENTER,
        type: 'error',
        transition: 'zoom',
        pauseOnHover: false,
      } as ToastOptions)
    }
  }
  isLoading.value = false
}

const onLogin = async () => {
  isLoading.value = true; 
  (Object.keys(loginForm.value) as Array<keyof loginFormType>).forEach((key) => {
      loginForm.value[key] = loginForm.value[key].trim()
  })
  
  const loginRes = await clientv1.auth.login.$post({ json: loginForm.value })
  
  if (loginRes.status === 200) {
    queryClient.setQueryData(['auth'], { isAuthenticated: true })
    const res = await userData("")
    if (res !== null) {
      await queryClient.setQueryData(['userProfile'], res)
      quizzyStore.isAdmin = res?.roles?.some(role => role.role.name === 'admin') || false
      quizzyStore.userName = res?.username || ''
      quizzyStore.fromLogin = true
      quizzyStore.pfp = res?.profile_picture || ''
      quizzyStore.id = res?.id || ''
      router.push('/')
    }
  }
  else if ((loginRes.status as number) === 429) {
    toast('Elérted a maximális bejelentkezési kísérletek számát!\nMax 15 próbálkozás percenként', {
      autoClose: 5000,
      position: toast.POSITION.TOP_CENTER,
      type: 'error',
      transition: 'zoom',
      pauseOnHover: true,
    } as ToastOptions)
  }
  else {
    const res = (await loginRes.json()) satisfies ApiResponse
    toast(res.message, {
      autoClose: 5000,
      position: toast.POSITION.TOP_CENTER,
      type: 'error',
      transition: 'zoom',
      pauseOnHover: false,
    } as ToastOptions)
  }
  isLoading.value = false
}

const showPassword = ref(false)

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const cardHeight = ref(500)

const updateCardHeight = () => {
  const content = document.querySelector('.form-content') as HTMLElement
  if (content) {
    const height = content.offsetHeight || 0
    if (height > 0) {
      cardHeight.value = height + 100
    }
  }
}

onMounted(() => {
  updateCardHeight()
  window.addEventListener('resize', () => {
    updateCardHeight()
  })
})
</script>

<template>
  <div class="wrapper">
    <div class="vcard !p-10 !rounded-2xl !bg-white/10 bg-opacity-50
       backdrop-blur-md transition-all duration-1000 
       !hover:bg-red-950 flex flex-col
       justify-evenly relative text-white " :style="{ height: `${cardHeight}px` }">
      <transition name="fade" enter-active-class="transition ease-out duration-300"
        leave-active-class="transition ease-in duration-300" mode="out-in" @enter="updateCardHeight"
        @leave="updateCardHeight">
        <div v-if="isLoginForm" class="form-content custom-scrollbar" key="login">
          <div class="flex justify-evenly flex-row mb-2">
            <span class="font-weight-black text-3xl"> Bejelentkezés </span>
          </div>
          <form @submit.prevent="onLogin">
            <label for="username" class="text-white self-center">Felhasználónév vagy e-mail:</label>
            <v-text-field name="username" v-model="loginForm.username_or_email" variant="outlined"
              density="comfortable"></v-text-field>
            <label for="username" class="text-white self-center">Jelszó:</label>
            <v-text-field name="username" v-model="loginForm.password" variant="outlined" density="comfortable"
              :type="showPassword ? 'text' : 'password'" @click:append-inner="togglePassword">
              <button @click="togglePassword" tabindex="-1"
                class="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-400 focus:outline-none"
                type="button" :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'">
                <EyeIcon v-if="!showPassword" class="h-5 w-5" />
                <EyeOffIcon v-else class="h-5 w-5" />
              </button>
            </v-text-field>
            <div class="w-full text-right mb-5">
              <router-link to="/forgotPw"
                class="text-sm text-blue-300 hover:text-blue-500 transition-colors duration-200">
                Elfelejtett jelszó?
              </router-link>
            </div>
            <div class="w-full max-w-md space-y-6">
              <button type="submit" :disabled="isLoading"
                class="glass-button w-full px-6 py-3 text-white font-semibold rounded-lg transition-all duration-300 ease-in-out">
                <div class="flex items-center justify-center w-full">
                  <span v-if="isLoading" class="inline-block animate-spin mr-2">
                    <svg class="w-5 h-5" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
                        fill="none" />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0
                      5.373 0 12h4zm2 5.291A7.962 7.962 0
                      014 12H0c0 3.042 1.135 5.824 3
                      7.938l3-2.647z" />
                    </svg>
                  </span>
                  {{ isLoading ? '' : 'Bejelentkezés' }}
                </div>
              </button>
              <button type="button" :disabled="isLoading"
                class="glass-button w-full px-6 py-3 text-white font-semibold rounded-lg transition-all duration-300 ease-in-out"
                @click="flipLogin">
                Regisztráció
              </button>
            </div>
          </form>
        </div>
        <div v-else class="form-content custom-scrollbar" key="register">
          <div class="flex justify-evenly flex-row mb-2">
            <div class="flex items-center">
              <span class="font-weight-black text-3xl">Regisztráció</span>
              <CircleHelp class="h-7 w-7 text-blue-400 ml-2 cursor-pointer" @click="showPasswordRequirements" />
            </div>
          </div>
          <form @submit.prevent="onRegistration">
            <label for="email" class="text-white self-center">E-mail:</label>
            <v-text-field name="email" v-model="regForm.email" variant="outlined" density="comfortable"
              :error-messages="regErrors?.email?._errors[0]" placeholder="pelda@pelda.com"></v-text-field>
            <label for="username" class="text-white self-center">Felhasználónév:</label>
            <v-text-field name="username" v-model="regForm.username" variant="outlined" density="comfortable"
              :error-messages="regErrors?.username?._errors[0]" placeholder="QuizzyUser43"></v-text-field>
            <label for="pw" class="text-white self-center">Jelszó:</label>
            <v-text-field v-model="regForm.password" name="pw" variant="outlined" density="comfortable"
              :type="showPassword ? 'text' : 'password'" @click:append-inner="togglePassword" class="relative"
              :error-messages="regErrors?.password?._errors[0]">
              <button @click="togglePassword" tabindex="-1"
                class="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-400 focus:outline-none"
                type="button" :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'">
                <EyeIcon v-if="!showPassword" class="h-5 w-5" />
                <EyeOffIcon v-else class="h-5 w-5" />
              </button>
            </v-text-field>
            <label for="pw_again" class="text-white self-center">Jelszó megerősítése:</label>
            <v-text-field v-model="regForm.confirmPassword" :type="showPassword ? 'text' : 'password'"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'" name="pw_again" variant="outlined"
              density="comfortable" :error-messages="regErrors?.confirmPassword?._errors[0]" class="!mb-2">
            </v-text-field>
            <div class="w-full max-w-md space-y-6">
              <button type="submit" :disabled="isLoading"
                class="glass-button w-full px-6 py-3 text-white font-semibold rounded-lg transition-all duration-300 ease-in-out">
                <div class="flex items-center justify-center">
                  <span v-if="isLoading" class="inline-block animate-spin mr-2">
                    <svg class="w-5 h-5" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
                        fill="none" />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0
                      5.373 0 12h4zm2 5.291A7.962 7.962 0
                      014 12H0c0 3.042 1.135 5.824 3
                      7.938l3-2.647z" />
                    </svg>
                  </span>
                  {{ isLoading ? '' : 'Regisztráció' }}
                </div>
              </button>
              <button type="button"
                class="glass-button w-full px-6 py-3 text-white font-semibold rounded-lg transition-all duration-300 ease-in-out"
                @click="flipLogin">
                Bejelentkezés
              </button>
            </div>
          </form>
        </div>
      </transition>
    </div>
    <v-card
      class="headers !flex !flex-col !justify-center !items-center !text-center !bg-opacity-50 !backdrop-blur-md !rounded-2xl !bg-white/10">
      <h1 class="title text-9xl text-purple-500">Quizzy</h1>
      <h3 class="quote text-5xl text-white">Fun way to learn haha</h3>
    </v-card>
  </div>
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

.wrapper {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  padding: 5px;
}

.headers {
  height: 50%;
  width: 50%;
  align-self: center;
  justify-content: space-evenly;
  gap: 20px;
}

.vcard {
  align-self: center;
  transition: height 0.3s ease-in-out;
}

.form-content {
  width: 100%;
}

.title {
  font-size: 10vh;
  line-height: 1;
}

.quote {
  font-size: 6vh;
  line-height: 1;
}

v-text-field {
  width: 80vh;
}

@media only screen and (max-height: 835px) {
  .form-content {
    overflow-y: auto;
  }
}

@media only screen and (max-width: 1440px) {
  .wrapper {
    padding: 20px;
    flex-direction: column-reverse;
    justify-content: flex-end;
    gap: 10px;
  }

  .vcard {
    display: flex;
    flex-direction: column;
    -ms-flex-align: center;
    justify-content: space-evenly;
  }

  .headers {
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    width: fit-content;
    padding: 10px;
    height: 25%;
  }

  .headers h1 {
    font-size: 8vh;
  }

  .headers h3 {
    font-size: 3vh;
  }
}

.text-wrap {
  white-space: normal;
  word-wrap: break-word;
  max-width: 100%;
}

:deep(.v-field__append-inner) {
  align-self: center;
  padding-top: 0 !important;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease-in-out,
    transform 0.3s ease-in-out;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translateY(0);
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

/*192.168.1.1*/
</style>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import router from '@/router'
import { clientv1 } from '@/lib/apiClient'
import { CircleHelp, EyeIcon, EyeOffIcon, XCircle } from 'lucide-vue-next'
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
  '• Legalább egy speciális karakter',
  '• Jelszavak egyezése',
]

const passwordValidation = ref({
  minLength: false,
  hasUppercase: false,
  hasLowercase: false,
  hasNumber: false,
  hasSpecial: false,
  passwordsMatch: false
})

const regForm = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})


watch(() => regForm.value.password, (newPassword) => {
  passwordValidation.value.minLength = newPassword.length >= 8
  passwordValidation.value.hasUppercase = /[A-Z]/.test(newPassword)
  passwordValidation.value.hasLowercase = /[a-z]/.test(newPassword)
  passwordValidation.value.hasNumber = /\d/.test(newPassword)
  passwordValidation.value.hasSpecial = /[^a-zA-Z0-9]/.test(newPassword)
  passwordValidation.value.passwordsMatch = newPassword === regForm.value.confirmPassword
})

watch(() => regForm.value.confirmPassword, (newConfirmPassword) => {
  passwordValidation.value.passwordsMatch = regForm.value.password === newConfirmPassword
})

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

const onRegistration = async () => {
  if (Object.values(regForm.value).some((value) => value.trim() === '')) {
    toast('Kérjük, töltse ki az összes mezőt!', {
      autoClose: 5000,
      position: toast.POSITION.TOP_CENTER,
      type: 'error',
      transition: 'zoom',
      pauseOnHover: false,
    } as ToastOptions)
    return
  }
  isLoading.value = true
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
      const errorMessage = res.error.message
      let info = ''
      switch (errorMessage) {
        case 'email already exists':
          info = 'Ez az email cím már létezik!'
          break
        case 'username already exists':
          info = 'Ez a felhasználónév már létezik!'
          break 
        default:
          info = ''
      }

      toast(res.message + '\n' + info, {
        autoClose: 5000,
        position: toast.POSITION.TOP_CENTER,
        type: 'error',
        transition: 'zoom',
        pauseOnHover: false,
      } as ToastOptions)
    }
  
  isLoading.value = false
}

const onLogin = async () => {
  if (Object.values(loginForm.value).some((value) => value.trim() === '')) {
    toast('Kérjük, töltse ki az összes mezőt!', {
      autoClose: 5000,
      position: toast.POSITION.TOP_CENTER,
      type: 'error',
      transition: 'zoom',
      pauseOnHover: false,
    } as ToastOptions)
    return
  }
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
       justify-between  text-white " :style="{ height: `${cardHeight}px` }">
      <transition name="fade" enter-active-class="transition ease-out duration-300"
        leave-active-class="transition ease-in duration-300" mode="out-in" @enter="updateCardHeight"
        @leave="updateCardHeight">
        <div v-if="isLoginForm" class="form-content custom-scrollbar" key="login">
          <div class="flex justify-evenly flex-row mb-4">
            <span class="font-weight-black text-3xl"> Bejelentkezés </span>
          </div>
          <form @submit.prevent="onLogin">
            <label for="username_or_email" class="text-white self-center block mb-1">Felhasználónév vagy e-mail:</label>
            <div class="relative mb-4">
              <input id="username_or_email" name="username_or_email" v-model="loginForm.username_or_email"
                class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                type="text" />
            </div>
            <label for="password" class="text-white self-center block mb-1">Jelszó:</label>
            <div class="relative mb-4">
              <input id="password" name="password" v-model="loginForm.password"
                class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-md text-white pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                :type="showPassword ? 'text' : 'password'" />
              <button @click="togglePassword" tabindex="-1" type="button"
                class="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-400 focus:outline-none">
                <EyeIcon v-if="!showPassword" class="h-5 w-5" />
                <EyeOffIcon v-else class="h-5 w-5" />
              </button>
            </div>
            <div class="w-full text-right mb-5">
              <router-link to="/forgotPw"
                class="text-sm text-blue-300 hover:text-blue-500 transition-colors duration-200">
                Elfelejtett jelszó?
              </router-link>
            </div>
            <div class="w-full max-w-md space-y-4">
              <button type="submit" :disabled="isLoading"
                class="glass-button !w-full px-6 py-3 text-white font-semibold rounded-lg transition-all duration-300 ease-in-out">
                <div class="flex items-center justify-center w-full">
                  Bejelentkezés
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
          <div class="flex justify-evenly flex-row">
            <div class="flex items-center">
              <span class="font-weight-black text-3xl">Regisztráció</span>
              <CircleHelp class="h-7 w-7 text-blue-400 ml-2 cursor-pointer" @click="showPasswordRequirements" />
            </div>
          </div>
          <form @submit.prevent="onRegistration">
            <label for="email" class="text-white self-center block mb-1">E-mail:</label>
            <div class="relative mb-2">
              <input id="email" name="email" v-model="regForm.email" placeholder="pelda@pelda.com"
                class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                type="email" />
            </div>
            <label for="username" class="text-white self-center block">Felhasználónév:</label>
            <div class="relative mb-2">
              <input id="username" name="username" v-model="regForm.username" placeholder="QuizzyUser43"
                class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2
                 focus:ring-purple-500/50 focus:border-purple-500/50"
                 type="text" />
            </div>
            <label for="pw" class="text-white self-center block">Jelszó:</label>
            <div class="relative mb-2">
              <input id="pw" name="pw" v-model="regForm.password"
                class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-md text-white pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                :type="showPassword ? 'text' : 'password'" />
              <button @click="togglePassword" tabindex="-1" type="button"
                class="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-400 focus:outline-none">
                <EyeIcon v-if="!showPassword" class="h-5 w-5" />
                <EyeOffIcon v-else class="h-5 w-5" />
              </button>
             
            </div>
            <transition name="fade" enter-active-class="transition ease-out duration-300"
              leave-active-class="transition ease-in duration-300" mode="out-in" @enter="updateCardHeight"
              @leave="updateCardHeight">
              <div class="password-requirements text-sm"
                v-if="regForm.password.length > 0
                  && Object.entries(passwordValidation).filter(([key]) => key !== 'passwordsMatch').some(([, value]) => !value)">
                <div v-if="!passwordValidation.minLength" class="requirement-item invalid">
                  <XCircle class="h-4 w-4 text-red-400" />
                  <span>Minimum 8 karakter</span>
                </div>
                <div v-else-if="!passwordValidation.hasUppercase" class="requirement-item invalid">
                  <XCircle class="h-4 w-4 text-red-400" />
                  <span>Legalább egy nagybetű</span>
                </div>
                <div v-else-if="!passwordValidation.hasLowercase" class="requirement-item invalid">
                  <XCircle class="h-4 w-4 text-red-400" />
                  <span>Legalább egy kisbetű</span>
                </div>
                <div v-else-if="!passwordValidation.hasNumber" class="requirement-item invalid">
                  <XCircle class="h-4 w-4 text-red-400" />
                  <span>Legalább egy szám</span>
                </div>
                <div v-else-if="!passwordValidation.hasSpecial" class="requirement-item invalid">
                  <XCircle class="h-4 w-4 text-red-400" />
                  <span>Legalább egy speciális karakter</span>
                </div>
              </div>
            </transition>
            <label for="pw_again" class="text-white self-center block">Jelszó megerősítése:</label>
            <div class="relative mb-2">
              <input id="pw_again" name="pw_again" v-model="regForm.confirmPassword"
                class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-md text-white pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                :type="showPassword ? 'text' : 'password'" />
              
            </div>
            <transition name="fade" enter-active-class="transition ease-out duration-300"
              leave-active-class="transition ease-in duration-300" mode="out-in" @enter="updateCardHeight"
              @leave="updateCardHeight">
              <div class="password-match text-sm"
                v-if="regForm.confirmPassword.length > 0 && !passwordValidation.passwordsMatch">
                <div class="requirement-item invalid" v-if="!passwordValidation.passwordsMatch">
                  <XCircle class="h-4 w-4 text-red-400" />
                  <span>Jelszavak nem egyeznek</span>
                </div>
              </div>
            </transition>
            <div class="w-full max-w-md space-y-4 mt-4">
              <button type="submit" :disabled="isLoading"
                class="glass-button w-full px-6 py-3 text-white font-semibold rounded-lg transition-all duration-300 ease-in-out">
                <div class="flex items-center justify-center">
                  Regisztráció
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

.password-requirements,
.password-match {
  border-radius: 8px;
  padding: 4px;
  background: rgba(0, 0, 0, 0.2);
}

.requirement-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.requirement-item.valid {
  color: #a7f3d0;
}

.requirement-item.invalid {
  color: #fca5a5;
}
</style>

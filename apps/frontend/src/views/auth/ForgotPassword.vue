<script setup lang="ts">
import { ref, computed } from 'vue'
import { clientv1 } from '@/lib/apiClient'
import router from '@/router'
import { toast, type ToastOptions } from 'vue3-toastify'


const email_or_username = ref('')
const isLoading = ref(false)

const isValidEmail = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email_or_username.value)
})


const handleSubmit = async () => {
  isLoading.value = true
  const newPw = await clientv1.auth.forgotpassword.$post({ json: { username_or_email: email_or_username.value } })
  if (newPw.status === 200) {
    isLoading.value = false
    toast('A további tennivalókat és a jelszavadat elküldtük a megadott e-mail címre! Ha nem találod, ellenőrizd a "Spam"-et!',
      {
        autoClose: 3500,
        position: toast.POSITION.TOP_CENTER,
        type: 'success',
        transition: 'zoom',
        pauseOnHover: false,
      } as ToastOptions)
    await new Promise(resolve => setTimeout(resolve, 4000))
    router.push('/login')

  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <Transition appear enter-active-class="transition ease-in-out duration-300"
      enter-from-class="opacity-0 translate-y-4" enter-to-class="opacity-100 translate-y-0">
      <div class="w-full max-w-md p-8 rounded-xl
               backdrop-blur-md bg-white/10 border border-white/20
               shadow-xl flex flex-col gap-2">
        <div>
          <h1 class="text-4xl font-bold text-white text-center">
            <span class="text-purple-500">Quizzy</span>
          </h1>
        </div>
        <h2 class="text-2xl font-semibold text-white self-center">
          Elfelejtett jelszó
        </h2>
        <form @submit.prevent="handleSubmit">
          <div>
            <label for="email_or_username" class="text-white self-center">Add meg az e-mail címed:</label>
            <v-text-field id="email_or_username" v-model="email_or_username" type="email" required :disabled="isLoading"
              variant="outlined" density="comfortable" class="text-white mt-2"></v-text-field>
          </div>
          <button type="submit" :disabled="isLoading || !isValidEmail" class="w-full py-3 px-4 rounded-lg bg-green-500 hover:bg-green-600
                   text-white font-medium transition-colors duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed
                   focus:outline-none focus:ring-2 focus:ring-offset-2
                   focus:ring-green-500">
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
              {{ isLoading ? 'Várakozás...' : 'Új jelszó igénylése' }}
            </div>
          </button>
          <button type="button" @click="router.back()" class="w-full py-3 px-4 rounded-lg bg-blue-500 hover:bg-blue-600
                   text-white font-medium transition-colors duration-200
                   focus:outline-none focus:ring-2 focus:ring-offset-2
                   focus:ring-blue-500 mt-2 cursor-pointer">
              Vissza a bejelentkezéshez
          </button>
        </form>
      </div>
    </Transition>
  </div>
</template>

<style>
/* Autofill fix for Chrome/Edge/Safari */
input:-webkit-autofill,
textarea:-webkit-autofill,
select:-webkit-autofill,
input:-webkit-autofill:focus,
textarea:-webkit-autofill:focus,
select:-webkit-autofill:focus {
  --webkit-box-shadow: 0 0 0 1000px rgba(255, 255, 255, 0.1) inset !important;
  box-shadow: 0 0 0 1000px rgba(255, 255, 255, 0.1) inset !important;
  --webkit-text-fill-color: #ffffff !important;
  border-radius: 0.5rem !important;
}
</style>

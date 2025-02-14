<script setup lang="ts">
import { ref, computed } from 'vue'
import MistBackground from '@/components/MistBackground.vue'
import { clientv1 } from '@/lib/apiClient'
import router from '@/router'
import { toast, type ToastOptions } from 'vue3-toastify'


const email_or_username = ref('')
const isLoading = ref(false)
const emailError = ref('')



const isValidEmail = computed(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email_or_username.value)
})


const handleSubmit = async () => {

    if (!isValidEmail.value) {
        emailError.value = 'Helytelen email_or_username formátum'
        return
    }
    isLoading.value = true
    const newPw = await clientv1.auth.forgotpassword.$post({ json: { username_or_email: email_or_username.value } })
    if (newPw.status === 200) {
        isLoading.value = false
        toast('A további tennivalókat és a jelszavadat elküldtük a megadott e-mail címre! Ha nem találod, ellenőrizd a "spam"-et!',
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
    else {
        const res = await newPw.json()
        toast(res.message,
            {
                autoClose: 5000,
                position: toast.POSITION.TOP_CENTER,
                type: 'error',
                transition: 'zoom',
                pauseOnHover: false,
            } as ToastOptions)
    }
}
</script>

<template>
    <MistBackground />
    <div class="min-h-screen flex items-center justify-center px-4">
        <div class="w-full max-w-md p-8 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 shadow-xl">
            <h2 class="text-2xl font-semibold text-white mb-4">Új jelszó igénylése</h2>
            <form @submit.prevent="handleSubmit">
                <div class="space-y-2">
                    <v-text-field id="email_or_username" v-model="email_or_username" type="email_or_username" required
                        :disabled="isLoading" class="text-white " variant="outlined" density="comfortable"
                        label="Add meg az e-mail címed"></v-text-field>
                    <span v-if="emailError" class="text-sm text-red-400">{{ emailError }}</span>
                </div>

                <button type="submit" :disabled="isLoading || !isValidEmail" class="w-full py-3 px-4 rounded-lg bg-green-500 hover:bg-green-600
                   text-white font-medium transition-colors duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed
                   focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    <div class="flex items-center justify-center">
                        <span v-if="isLoading" class="inline-block animate-spin mr-2">
                            <svg class="w-5 h-5" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
                                    fill="none" />
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        </span>
                        {{ isLoading ? 'Várakozás...' : 'Új jelszó igénylése' }}
                    </div>
                </button>

            </form>
        </div>
    </div>
</template>

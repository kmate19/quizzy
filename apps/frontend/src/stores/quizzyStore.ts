import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useQuizzyStore = defineStore('quizzy', () => {
  const isAdmin = ref<boolean>(false)
  const isHost = ref<boolean>(false)
  const isFirstLogin = ref<boolean>(true)
  const userName = ref<string>('')
  const fromLogin = ref<boolean>(false)

  function reset() {
    isAdmin.value = false
    isHost.value = false
    isFirstLogin.value = true
    userName.value = ''
    fromLogin.value = false
  }

  return {
    isAdmin,
    isHost,
    isFirstLogin,
    userName,
    fromLogin,
    $reset: reset
  }
})
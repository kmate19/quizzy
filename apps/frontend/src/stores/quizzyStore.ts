import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { QuizData, detailedQuiz } from '@/utils/type'


export const useQuizzyStore = defineStore('quizzy', () => {
  const isAdmin = ref<boolean>(false)
  const isHost = ref<boolean>(false)
  const isFirstLogin = ref<boolean>(true)
  const userName = ref<string>('')
  const fromLogin = ref<boolean>(false)
  const lobbyId = ref<string>('')
  const quizId = ref<string>('')
  const timestamp = ref<number>(0)
  const pfp = ref<string>('')
  const currentQuiz = ref<QuizData | null>(null)
  const id = ref<string>('')


  function setCurrentQuiz(quiz: detailedQuiz) {
    currentQuiz.value = {
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        status: quiz.status || 'published',
        banner: quiz.banner,
      },
      cards: quiz.cards,
      tagNames: quiz.tags.map(tag => tag),
      languageISOCodes: quiz.languages.map(lang => lang.iso_code) as string[],
    }
  }

  function reset() {
    isAdmin.value = false
    isHost.value = false
    isFirstLogin.value = true
    userName.value = ''
    fromLogin.value = false
    lobbyId.value = ''
    quizId.value = ''
    timestamp.value = 0
    pfp.value = ''
  }

  function setLobbyData(data: {
    lobbyId: string
    quizId: string
    timestamp: number
    isHost: boolean
  }) {
    lobbyId.value = data.lobbyId
    quizId.value = data.quizId
    timestamp.value = data.timestamp
    isHost.value = data.isHost
  }

  return {
    isAdmin,
    isHost,
    isFirstLogin,
    userName,
    fromLogin,
    lobbyId,
    quizId,
    timestamp,
    setLobbyData,
    $reset: reset,
    pfp,
    currentQuiz,
    setCurrentQuiz,
    id
  }
})
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
  const hash = ref<string>('')
  const quizId = ref<string>('')
  const timestamp = ref<number>(0)
  const heartbeatInterval = ref<number>(0)
  const pfp = ref<string>('')
  const currentQuiz = ref<QuizData | null>(null)

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
      languageISOCodes: quiz.languages.map(lang => lang.name) as string[],
    }
  }

  function reset() {
    isAdmin.value = false
    isHost.value = false
    isFirstLogin.value = true
    userName.value = ''
    fromLogin.value = false
    lobbyId.value = ''
    hash.value = ''
    quizId.value = ''
    timestamp.value = 0
    heartbeatInterval.value = 0
    pfp.value = ''
  }

  function setLobbyData(data: {
    lobbyId: string
    hash: string
    quizId: string
    timestamp: number
    heartbeatInterval: number
    isHost: boolean
  }) {
    lobbyId.value = data.lobbyId
    hash.value = data.hash
    quizId.value = data.quizId
    timestamp.value = data.timestamp
    heartbeatInterval.value = data.heartbeatInterval
    isHost.value = data.isHost
  }

  function getLobbyData() {
    return {
      lobbyId: lobbyId.value,
      hash: hash.value,
      quizId: quizId.value,
      timestamp: timestamp.value,
      heartbeatInterval: heartbeatInterval.value,
      isHost: isHost.value
    }
  }

  return {
    isAdmin,
    isHost,
    isFirstLogin,
    userName,
    fromLogin,
    lobbyId,
    hash,
    quizId,
    timestamp,
    heartbeatInterval,
    setLobbyData,
    $reset: reset,
    getLobbyData,
    pfp,
    currentQuiz,
    setCurrentQuiz
  }
})
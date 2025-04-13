import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { QuizData, detailedQuiz } from '@/utils/type'

export const useQuizzyStore = defineStore(
  'quizzy',
  () => {
    const isAdmin = ref<boolean>(false)
    const isHost = ref<boolean>(false)
    const isFirstLogin = ref<boolean>(true)
    const userName = ref<string>('')
    const fromLogin = ref<boolean>(false)
    const lobbyId = ref<string>('')
    const quizId = ref<string>('')
    const pfp = ref<string>('')
    const currentQuiz = ref<QuizData | null>(null)
    const id = ref<string>('')
    const canReconnect = ref<boolean>(false)
    const isGame = ref<boolean>(false)
    const isDuringGame = ref<boolean>(false)

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
        tagNames: quiz.tags.map((tag) => tag),
        languageISOCodes: quiz.languages.map((lang) => lang.iso_code) as string[],
      }
    }
    function lobbyDataReset(){
      lobbyId.value = ''
      quizId.value = ''
      isHost.value = false
    }

    function reset() {
      isAdmin.value = false
      isHost.value = false
      isFirstLogin.value = true
      userName.value = ''
      fromLogin.value = false
      lobbyId.value = ''
      quizId.value = ''
      pfp.value = ''
      currentQuiz.value = null
      id.value = ''
      canReconnect.value = false
      isGame.value = false
    }

    function setLobbyData(data: {
      lobbyId: string
      quizId: string
      isHost: boolean
      canReconnect: boolean
    }) {
      canReconnect.value = data.canReconnect
      lobbyId.value = data.lobbyId
      quizId.value = data.quizId
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
      setLobbyData,
      $reset: reset,
      pfp,
      currentQuiz,
      setCurrentQuiz,
      id,
      lobbyDataReset,
      canReconnect,
      isGame,
      isDuringGame
    }
  },
  {
    persist: true,
  },
)

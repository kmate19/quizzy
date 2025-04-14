<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import { wsclient } from '@/lib/apiClient'
import { generateSessionHash } from '@/utils/helpers'
import { Loader2Icon, Users, Copy, Trophy, MessageCircle, Send } from 'lucide-vue-next'
import { useQuizzyStore } from '@/stores/quizzyStore'
import type { QuizData, gameStats, Participants } from '@/utils/type'
import XButton from '@/components/XButton.vue'
import { toast } from 'vue3-toastify'
import { useNavbarStore } from '@/stores/navbarStore'

const route = useRoute()
const router = useRouter()
const navbarStore = useNavbarStore()
const quizzyStore = useQuizzyStore()
const lobbyId = ref(quizzyStore.lobbyId)
const isHost = ref(quizzyStore.isHost)
const isLoading = ref(true)
const error = ref<string | null>(null)
const participants = ref<Participants>({ host: '', members: [] })
const websocket = ref<WebSocket | null>(null)
const copiedToClipboard = ref(false)
const reconnectAttempts = ref(0)
const gameQuiz = ref<QuizData>()
const gameStarted = ref(false)
const currentCard = ref()
const time = ref(0)
const answerSelected = ref(false)
const gameEnded = ref(false)
const stats = ref<gameStats>()
const timerRef = ref<number | null>(null)
const preparingNextRound = ref(false)
const currentQuestionIndex = ref(0)
const hostId = ref('')
const isReconnect = ref(false)
const hasSomeReason = ref(false)
const isLeaderboardModalOpen = ref(false)
const windowWidth = ref(window.innerWidth)

const isChatOpen = ref(false)
const chatMessage = ref('')
const chatMessages = ref<{ name: string, pfp: string, message: string, isSelf: boolean }[]>([])

const copyLobbyCode = () => {
  navigator.clipboard.writeText(lobbyId.value)
  copiedToClipboard.value = true
  setTimeout(() => {
    copiedToClipboard.value = false
  }, 2000)
}

const setupWebSocket = async () => {
  try {

    const wsHash = await generateSessionHash(lobbyId.value, import.meta.env.VITE_HASH || 'asd')
    const ws = await wsclient.ws.server[':lobbyid'][':hash'].$ws({
      param: { lobbyid: lobbyId.value, hash: wsHash },
    })

    websocket.value = ws
    setupWebSocketListeners(websocket.value)

    quizzyStore.setLobbyData({
      lobbyId: lobbyId.value,
      isHost: isHost.value,
      quizId: quizzyStore.quizId,
      canReconnect: true,
    })
  } catch (err) {
    console.error('WebSocket setup error:', err)
    error.value = err instanceof Error ? err.message : 'Failed to connect to the game lobby'
    isLoading.value = false
  }
}

const manualReconnect = async () => {
  error.value = null
  isLoading.value = true
  reconnectAttempts.value = 0
  await setupWebSocket()
  isLoading.value = false
}

const addParticipant = (username: string, pfp: string, id: string) => {
  const newUser = {
    username: username,
    pfp: 'data:image/png;base64,' + pfp,
    userId: id,
  }
  participants.value!.members = [...participants.value!.members, newUser]
}

const setupWebSocketListeners = (ws: WebSocket) => {
  ws.addEventListener('open', () => {
    isLoading.value = false
    reconnectAttempts.value = 0
    if (ws.readyState === WebSocket.OPEN) {
      const userData = {
        username: quizzyStore.userName,
        pfp: quizzyStore.pfp.replace('data:image/png;base64,', ''),
        userId: quizzyStore.id,
      }

      if (isReconnect.value) {
        ws.send(
          JSON.stringify({
            type: 'members',
            successful: true,
            server: false,
          }),
        )
        ws.send(
          JSON.stringify({
            type: 'quizmeta',
            successful: true,
            server: false,
          }),
        )
      } else {
        ws.send(
          JSON.stringify({
            type: 'members',
            successful: true,
            server: false,
          }),
        )
        ws.send(
          JSON.stringify({
            type: 'whoami',
            successful: true,
            server: false,
            data: userData,
          }),
        )
        ws.send(
          JSON.stringify({
            type: 'connect',
            successful: true,
            server: false,
          }),
        )
        ws.send(
          JSON.stringify({
            type: 'quizmeta',
            successful: true,
            server: false,
          }),
        )
      }

      addParticipant(userData.username, userData.pfp, userData.userId)
    } else {
      console.error('not open. state:', ws.readyState)
    }
  })

  ws.addEventListener('message', (event) => {
    try {
      const data = JSON.parse(event.data)

      if (data.type === 'connect') {
        if (data.data.username && data.data.pfp && data.data.userId) {
          addParticipant(data.data.username, data.data.pfp, data.data.userId)
        }
      }

      if (data.type === 'members') {
        for (const member of data.data.members) {
          addParticipant(member.username, member.pfp, member.userId)
        }
        hostId.value = data.data.host
      }

      if (data.type === 'ping') {
        console.log('Ping received')
        ws.send(
          JSON.stringify({
            type: 'pong',
            successful: true,
            server: false,
          }),
        )
      }

      if (data.type === 'quizmeta') {
        gameQuiz.value = data.data
        quizzyStore.currentQuiz = data.data
      }

      if (data.type === 'gamestate') {
        gameStarted.value = true
        currentCard.value = data.data.currentQuestion
        console.log(data.data)
        currentQuestionIndex.value = data.data.currentRoundIndex - 1
        time.value = Math.round(data.data.roundTimeLeftMs)
        if (timerRef.value !== null) {
          clearTimeout(timerRef.value)
          timerRef.value = null
        }
        decrase()
      }

      if (data.type === 'gamestarted') {
        console.log('Game started')
        gameStarted.value = true
        preparingNextRound.value = true
        navbarStore.isDuringGame = true
        currentQuestionIndex.value = 0
        nextTick(() => {
          setTimeout(() => {
            preparingNextRound.value = false
          }, 1500)
        })
      }

      if (data.type === 'roundstarted') {
        console.log('Round started')
        if (gameStarted.value === false) {
          gameStarted.value = true
        }
        preparingNextRound.value = false
        currentCard.value = data.data
        time.value = data.data.roundTimeMs

        if (timerRef.value !== null) {
          clearTimeout(timerRef.value)
          timerRef.value = null
        }

        decrase()
      }

      if (data.type === 'roundended') {
        if (gameStarted.value === false) {
          gameStarted.value = true
        }
        answerSelected.value = false
        console.log('Round ended')
        stats.value = data.data
        currentQuestionIndex.value++
        if (timerRef.value !== null) {
          clearTimeout(timerRef.value)
          timerRef.value = null
        }
        stats.value?.scores.forEach((player) => {
          player.pfp = 'data:image/png;base64,' + player.pfp
        })
        stats.value?.scores.sort((a, b) => b.stats.score - a.stats.score)
        preparingNextRound.value = true
        setTimeout(() => {
          preparingNextRound.value = false
        }, 1500)
      }

      if (data.type === 'gamended') {
        console.log('Game ended')
        gameStarted.value = false
        preparingNextRound.value = false
        currentCard.value = null
        answerSelected.value = false
        gameEnded.value = true
        navbarStore.isDuringGame = false
        stats.value?.scores.sort((a, b) => b.stats.score - a.stats.score)
      }

      if (data.type === 'hostchange') {
        if (data.data.userId === quizzyStore.id) {
          quizzyStore.isHost = true
          isHost.value = true
          toast('Te lettél a játékvezető!', {
            autoClose: 3500,
            position: toast.POSITION.TOP_CENTER,
            type: 'success',
            transition: 'zoom',
            pauseOnHover: false,
          })
        } else {
          if (hostId.value !== data.data.userId) {
            const newHost = participants.value.members.find(
              (member) => member.userId === data.data.userId,
            )
            toast(`Az új játévezető ${newHost?.username} lett!`, {
              autoClose: 3500,
              position: toast.POSITION.TOP_CENTER,
              type: 'success',
              transition: 'zoom',
              pauseOnHover: false,
            })
          }
        }
        hostId.value = data.data.userId
        participants.value.host = data.data.userId
      }

      if (data.type === 'disconnect') {
        participants.value.members = participants.value.members.filter(
          (member) => member.username !== data.data,
        )
        if (stats.value) {
          stats.value.scores = stats.value.scores?.filter(
            (member) => member.username !== data.data,
          )
        }
      }

      if (data.type === 'error') {
        if (data.error.message === 'You have been kicked') {
          error.value = 'Ki lettél rúgva a játékból a játékvezető által!'
          hasSomeReason.value = true
          quizzyStore.lobbyDataReset()
        }
        if (data.error.message === 'User already in lobby') {
          error.value = 'Már ezzel a fiókkal bent vagy egy játékban!'
          hasSomeReason.value = true
          quizzyStore.lobbyDataReset()
        }
        if (data.error.message === 'Lobby does not exist') {
          error.value = 'A lobby már nem létezik!'
          hasSomeReason.value = true
          quizzyStore.lobbyDataReset()
        }
      }

      if (data.type === 'recvchatmessage') {
        chatMessages.value.push({
          name: data.data.name,
          pfp: 'data:image/png;base64,' + data.data.pfp,
          message: data.data.message,
          isSelf: false
        })

        nextTick(() => {
          const chatContainer = document.querySelector('.chat-messages')
          if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight
          }
        })
      }
    } catch (err) {
      console.error('Error parsing WebSocket message:', err)
    }
  })

  ws.addEventListener('error', (event) => {
    console.error('WebSocket error:', event)
    error.value = 'Hiba lépett fel a kapcsolat létrehozásakor!'
  })

  ws.addEventListener('close', (event) => {

    if (event.code === 1003) {
      error.value = event.reason || 'Server closed the connection'
      quizzyStore.lobbyDataReset()
    } else if (event.code !== 1000 && route.name === 'quiz_multiplayer') {
    }
  })
}

const leaveLobby = () => {
  if (websocket.value && websocket.value.readyState === WebSocket.OPEN) {
    try {
      websocket.value.send(
      JSON.stringify({
        type: 'leave',
        successful: true,
        server: false,
      }),
    )
      setTimeout(() => {
        if (websocket.value) {
          websocket.value.close(1000, 'User left lobby')
        }
      }, 200)
    } catch (err) {
      console.error('Error leaving lobby:', err)
    }
  }

  quizzyStore.setLobbyData({
    lobbyId: '',
    isHost: false,
    quizId: '',
    canReconnect: false,
  })
  router.push('/')
}

const getBaseButtonColor = (index: number) => {
  const colors = [
    'bg-red-500 hover:bg-red-600',
    'bg-blue-500 hover:bg-blue-600',
    'bg-yellow-500 hover:bg-yellow-600',
    'bg-green-500 hover:bg-green-600',
  ]
  return colors[index]
}

const selectAnswer = (index: number) => {
  answerSelected.value = true
  if (websocket.value && websocket.value.readyState === WebSocket.OPEN) {
    websocket.value.send(
      JSON.stringify({
        type: 'answered',
        successful: true,
        server: false,
        data: {
          answerIndex: index.toString(),
          answerTime: Date.now().toString(),
        },
      }),
    )
  }
}

const decrase = () => {
  console.log(time.value)
  if (time.value > 0 && !answerSelected.value) {
    timerRef.value = setTimeout(() => {
      time.value = Math.max(0, time.value - 1000)
      decrase()
    }, 1000) as unknown as number
  } else if (timerRef.value !== null) {
    clearTimeout(timerRef.value)
    timerRef.value = null
  }
}

const toggleLeaderboardModal = () => {
  isLeaderboardModalOpen.value = !isLeaderboardModalOpen.value
}

const toggleChat = () => {
  isChatOpen.value = !isChatOpen.value
}

const sendChatMessage = () => {
  if (chatMessage.value.trim() === '' || chatMessage.value.length > 100) return

  if (websocket.value && websocket.value.readyState === WebSocket.OPEN) {
    websocket.value.send(
      JSON.stringify({
        type: 'sendchatmessage',
        successful: true,
        server: false,
        data: chatMessage.value

      })
    )

    chatMessages.value.push({
      name: quizzyStore.userName,
      pfp: quizzyStore.pfp,
      message: chatMessage.value,
      isSelf: true
    })

    chatMessage.value = ''

    nextTick(() => {
      const chatContainer = document.querySelector('.chat-messages')
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight
      }
    })
  }
}

onMounted(() => {
  navbarStore.isGame = true
  if (quizzyStore.canReconnect) {
    isReconnect.value = true
  }
  if (!lobbyId.value) {
    error.value = 'Invalid lobby ID'
    isLoading.value = false
    return
  }
  setupWebSocket()


  window.addEventListener('resize', () => {
    windowWidth.value = window.innerWidth
    if (windowWidth.value > 958) {
      isLeaderboardModalOpen.value = false
    }
  })
})

onUnmounted(() => {
  if (timerRef.value !== null) {
    clearTimeout(timerRef.value)
    timerRef.value = null
  }

  if (websocket.value) {
    websocket.value.close(1000, 'User left lobby')
  }


  window.removeEventListener('resize', () => {
    windowWidth.value = window.innerWidth
  })
  navbarStore.isGame = false
})

const startGame = () => {
  if (websocket.value && websocket.value.readyState === WebSocket.OPEN) {
    websocket.value.send(
      JSON.stringify({
        type: 'startgame',
        successful: true,
        server: false,
      }),
    )
  }
}

const kickUser = (userName: string) => {
  if (websocket.value && websocket.value.readyState === WebSocket.OPEN) {
    websocket.value.send(
      JSON.stringify({
        type: 'kick',
        successful: true,
        server: false,
        data: {
          username: userName,
        },
      }),
    )
  }
}

const restartGame = () => {
  if (websocket.value && websocket.value.readyState === WebSocket.OPEN) {
    websocket.value.send(
      JSON.stringify({
        type: 'startgame',
        successful: true,
        server: false,
      }),
    )
  }
}

const openChat = () => {
  isChatOpen.value = !isChatOpen.value
  if (isChatOpen.value) {
    setTimeout(() => {
      const chatContainer = document.querySelector('.chat-messages')
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight
      }
    }, 100)
  }
}


window.addEventListener('beforeunload', function(event) {
  const message = "Biztosan el akarod hagyni a játékot? Ez kapcsolati problémát okozhat!";

  event.preventDefault();

  event.returnValue = message;

  return message;
});

</script>

<template>
  <div class="max-w-4xl mx-auto px-4 rounded-md mt-2">
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <Loader2Icon class="w-12 h-12 text-white animate-spin" />
      <p class="ml-4 text-white text-xl">Csatlakozás...</p>
    </div>
    <div v-else-if="error"
      class="bg-red-500 bg-opacity-50 backdrop-blur-md rounded-xl p-4 text-white flex text-center flex-col items-center">
      <p class="mb-4 text-center">{{ error }}</p>
      <div class="flex gap-4 justify-center">
        <button v-if="!hasSomeReason" @click="manualReconnect"
          class="glass-button px-4 py-2 rounded-md bg-green-600/30 cursor-pointer">
          Újracsatlakozás
        </button>
        <button @click="router.push('/')" class="glass-button px-4 py-2 rounded-md cursor-pointer">
          Vissza a kezdőlapra
        </button>
      </div>
    </div>

    <div v-else-if="gameStarted" class="text-white">
      <div class="w-full rounded-full h-4 mb-4 flex z-20 flex-col gap-2 items-center justify-center">
        <div class="flex w-full space-x-2 items-center justify-center">
          <div v-for="index in quizzyStore.currentQuiz?.cards?.length" :key="index"
            class="h-5 flex-1 rounded-full overflow-hidden backdrop-filter">
            <div class="h-full transition-all duration-300 rounded-full glass-progress" :class="{
              'bg-green-500/70 backdrop-blur-sm border border-green-300/50 shadow-green-500/30':
                index - 1 < currentQuestionIndex,
              'bg-blue-500/70 backdrop-blur-sm border border-blue-300/50 shadow-blue-500/30 animate-pulse':
                index - 1 === currentQuestionIndex,
              'bg-white/10 backdrop-blur-sm border border-white/20':
                index - 1 > currentQuestionIndex,
            }"></div>
          </div>
          <button v-if="windowWidth <= 958" @click="toggleLeaderboardModal"
            class="glass-button p-1 rounded-full flex items-center justify-center cursor-pointer">
            <Trophy class="h-5 w-5 text-yellow-400" />
          </button>
        </div>
      </div>

      <div class="flex justify-center items-center w-full">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 " :class="{
          'lg:grid-cols-1 max-w-auto': windowWidth <= 958
        }">
          <div class="md:col-span-2">
            <div v-if="answerSelected && !preparingNextRound"
              class="mt-8 p-3 bg-green-500/30 rounded-xl text-center animate-pulse w-full">
              <p class="text-lg font-bold">Válaszod beküldve! Várakozás a többi játékosra...</p>
            </div>
            <div v-if="preparingNextRound"
              class="p-6 mb-4 relative bg-white/10 backdrop-blur-sm rounded-xl min-h-[200px] flex items-center justify-center border border-white/20"
              :key="currentQuestionIndex">
              <div class="text-center">
                <Loader2Icon class="w-16 h-16 text-blue-400 animate-spin mx-auto mb-4" />
                <h2 class="text-2xl font-bold text-white">Következő kérdés...</h2>
                <div class="mt-4 h-3 bg-white/10 rounded-full w-64 mx-auto overflow-hidden border border-white/20">
                  <div class="h-full bg-blue-500 animate-loading-bar"></div>
                </div>
                <p class="text-white/70 mt-3">Készülj fel!</p>
              </div>
            </div>
            <transition name="fade-slide" mode="out-in" v-if="currentCard">
              <div class="p-6 mb-4 relative bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20"
                :key="currentQuestionIndex" v-if="!preparingNextRound && !answerSelected">
                <div
                  class="text-2xl font-bold bg-white/30 w-10 h-10 rounded-full flex items-center justify-center absolute top-1 right-1 border border-white/20"
                  :class="time < 5000 ? 'text-red-500' : 'text-white'">
                  <transition name="bounce" mode="out-in">
                    <span :key="Math.ceil(time / 1000)">{{ Math.ceil(time / 1000) }}</span>
                  </transition>
                </div>
                <transition name="fade" mode="out-in">
                  <div class="flex flex-col items-center justify-center" v-if="currentCard">
                    <img v-if="currentCard.picture" :src="currentCard.picture" :alt="currentCard.question"
                      class="w-full max-h-64 object-contain mb-6 rounded-xl" :key="'img-' + currentQuestionIndex" />
                    <h2 class="text-xl md:text-2xl font-semibold text-white text-center mb-4"
                      :key="'q-' + currentQuestionIndex">
                      {{ currentCard?.question }}
                    </h2>
                  </div>
                </transition>
              </div>
            </transition>

            <transition-group name="answer-pop" mode="in-out" tag="div"
              v-if="!preparingNextRound && !answerSelected && currentCard" :class="[
                'grid gap-4',
                currentCard?.type === 'twochoice'
                  ? 'grid-cols-1 md:grid-cols-2'
                  : 'grid-cols-2 md:grid-cols-2',
              ]">
              <button v-for="(answer, index) in currentCard.answers" :key="`${currentQuestionIndex}-${index}`" :class="[
                'p-6 rounded-xl text-white font-bold text-lg transition-all transform hover:scale-105 backdrop-blur-sm cursor-pointer',
                getBaseButtonColor(index),
                answerSelected ? 'opacity-70 cursor-not-allowed' : '',
              ]" @click="selectAnswer(index)" :disabled="answerSelected">
                {{ answer }}
              </button>
            </transition-group>
          </div>


          <div
            class="bg-white/10 backdrop-blur-sm rounded-xl p-4 h-96 overflow-y-auto small-screen-hidden border border-white/20"
            :class="{ 'd-none': windowWidth <= 958 }">
            <h3 class="text-xl font-bold mb-3 text-center">Eredmények</h3>
            <transition-group name="list" tag="div" class="space-y-2">
              <div v-for="(player, index) in stats?.scores" :key="player.userId"
                class="flex items-center p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all border border-white/20">
                <div class="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center mr-2">
                  #{{ index + 1 }}
                </div>
                <img :src="player.pfp" class="w-8 h-8 rounded-full mr-2" />
                <span class="font-medium truncate mr-2 flex-grow">{{ player.username }}</span>
                <transition name="score" mode="out-in">
                  <span class="font-bold text-yellow-300" :key="player.stats.score">{{
                    player.stats.score
                  }}</span>
                </transition>
              </div>
            </transition-group>
            <div v-if="!stats || !stats.scores || stats.scores.length === 0" class="text-center py-4 text-gray-400">
              Még nincsenek eredmények
            </div>
          </div>
        </div>
      </div>


      <transition name="modal">
        <div v-if="isLeaderboardModalOpen && windowWidth <= 958"
          class="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4"
          @click.self="toggleLeaderboardModal">
          <div
            class="bg-gray-800/80 rounded-xl w-full max-w-md p-4 max-h-[80vh] overflow-y-auto border border-white/10 shadow-lg">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-xl font-bold text-white flex items-center">
                <Trophy class="h-6 w-6 text-yellow-400 mr-2" />
                Eredmények
              </h3>
              <button @click="toggleLeaderboardModal" class="text-white hover:text-gray-300 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <transition-group name="list" tag="div" class="space-y-2">
              <div v-for="(player, index) in stats?.scores" :key="player.userId"
                class="flex items-center p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all cursor-pointer border border-white/20">
                <div class="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center mr-2">
                  #{{ index + 1 }}
                </div>
                <img :src="player.pfp" class="w-8 h-8 rounded-full mr-2" />
                <span class="font-medium truncate flex-grow">{{ player.username }}</span>
                <span class="font-bold text-yellow-300">{{ player.stats.score }}</span>
              </div>
            </transition-group>
            <div v-if="!stats || !stats.scores || stats.scores.length === 0" class="text-center py-4 text-gray-400">
              Még nincsenek eredmények
            </div>
          </div>
        </div>
      </transition>
    </div>

    <div v-else-if="gameEnded" class="text-white">
      <div class="p-8 mb-6 relative bg-white/10 backdrop-blur-sm rounded-xl text-center">
        <h2 class="text-3xl font-bold text-white">Játék vége</h2>
        <p class="text-gray-300 m-2">Hívj meg új játékosokat!</p>

        <div class="mb-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
          <div class="flex justify-between items-center">
            <h2 class="text-2xl font-semibold">Lobby kód:</h2>
            <div class="flex items-center">
              <span class="text-xl font-mono bg-gray-700 px-3 py-1 rounded-md">{{ lobbyId }}</span>
              <button @click="copyLobbyCode" class="ml-2 glass-button p-2 rounded-md cursor-pointer">
                <Copy v-if="!copiedToClipboard" class="h-5 w-5" />
                <span v-else class="text-green-400">Másolva!</span>
              </button>
            </div>
          </div>
        </div>
        <div class="flex justify-center mt-2 mb-2 gap-2">
          <button @click="restartGame" v-if="isHost"
            class="glass-button px-8 py-3 rounded-md !bg-purple-700 text-lg font-bold flex items-center animate-bounce cursor-pointer">
            Még egy kör?
          </button>
          <button @click="leaveLobby"
            class="glass-button transition-all duration-300 px-4 py-2 rounded-md text-xl cursor-pointer !bg-red-800">
            Lobby elhagyása
          </button>
        </div>
      </div>

      <div class="p-6 mb-6 relative bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
        <h2 class="text-2xl font-semibold text-white mb-4 flex items-center">
          <Users class="h-6 w-6 mr-2" />
          Eredmények
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="(playerStat, index) in stats?.scores" :key="playerStat.userId"
            class="glass-button rounded-xl p-5 transition-all hover:scale-105">
            <div class="flex flex-col items-center text-center">
              <div class="relative mb-3">
                <div
                  class="absolute -top-2 -right-2 bg-purple-600 text-white rounded-full w-7 h-7 flex items-center justify-center">
                  #{{ index + 1 }}
                </div>
                <img :src="playerStat.pfp || '/placeholder.svg?height=60&width=60'"
                  class="w-16 h-16 rounded-full object-cover border-2 border-white/50" />
              </div>
              <span class="text-xl font-bold mb-3">{{ playerStat.username }}</span>

              <div class="grid grid-cols-2 gap-2 w-full mt-2">
                <div class="bg-white/10 rounded p-2 text-center border border-white/20">
                  <span class="block text-sm text-gray-300">Helyes</span>
                  <span class="block text-2xl font-bold text-green-400">{{
                    playerStat.stats.correctAnswerCount
                  }}</span>
                </div>
                <div class="bg-white/10 rounded p-2 text-center border border-white/20">
                  <span class="block text-sm text-gray-300">Helytelen</span>
                  <span class="block text-2xl font-bold text-red-400">{{
                    playerStat.stats.wrongAnswerCount
                  }}</span>
                </div>
              </div>

              <div class="mt-4 w-full bg-white/10 rounded p-3 text-center border border-white/20">
                <span class="block text-sm text-gray-300">Összpontszám</span>
                <span class="block text-3xl font-bold text-yellow-300">{{
                  playerStat.stats.score
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-white">
      <div class="flex justify-between items-center mb-8">
        <div class="flex justify-center" v-if="isHost">
          <button
            class="glass-button transition-all duration-300 px-10 py-2 rounded-md cursor-pointer text-xl !bg-green-800"
            @click="startGame">
            Játék
          </button>
        </div>
        <button @click="leaveLobby"
          class="glass-button transition-all duration-300 px-4 py-2 rounded-md text-xl cursor-pointer !bg-red-800">
          Lobby elhagyása
        </button>
      </div>

      <div class="text-center relative z-20 p-4 bg-white/10 backdrop-blur-sm rounded-xl mb-8 border border-white/20"
        id="quiz">
        <div v-if="!gameQuiz" class="py-4 text-red-500">No Quiz Data</div>
        <div v-else>
          <img :src="gameQuiz?.quiz.banner" class="mx-auto mb-4 max-w-full rounded-md max-h-[300px] w-fit" />
          <h2 class="text-2xl font-semibold mb-2">{{ gameQuiz?.quiz.title }}</h2>
          <p class="text-gray-300">{{ gameQuiz?.quiz.description }}</p>
        </div>
      </div>

      <div class="mb-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-semibold">Lobby kód:</h2>
          <div class="flex items-center">
            <span class="text-xl font-mono bg-gray-700 px-3 py-1 rounded-md">{{ lobbyId }}</span>
            <button @click="copyLobbyCode" class="ml-2 glass-button p-2 rounded-md cursor-pointer">
              <Copy v-if="!copiedToClipboard" class="h-5 w-5" />
              <span v-else class="text-green-400">Másolva!</span>
            </button>
          </div>
        </div>
      </div>

      <div class="mb-4 flex justify-center">
        <div class="flex gap-4 flex-wrap justify-center">
          <div v-for="participant in participants?.members" :key="participant.username"
            class="p-4 glass-button rounded-xl flex !w-fit">
            <div class="flex items-center space-x-4">
              <img :src="participant.pfp || '/placeholder.svg?height=40&width=40'"
                class="w-10 h-10 rounded-full object-cover" />
              <span class="text-lg font-medium">{{ participant.username }}</span>
              <span v-if="participant.userId === hostId" class="text-yellow-500">👑</span>
            </div>
            <XButton class="ml-2" v-if="quizzyStore.id === hostId && quizzyStore.userName !== participant.username"
              @click="kickUser(participant.username)" />
          </div>
        </div>
      </div>
    </div>

    <div class="fixed bottom-8 right-8 z-50">
      <button @click="openChat"
        class="glass-button p-3 rounded-full relative flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
        <MessageCircle class="h-6 w-6" :class="isChatOpen ? 'text-blue-300' : 'text-white'" />
        <div v-if="chatMessages.length > 0 && !isChatOpen"
          class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {{ chatMessages.length }}
        </div>
      </button>
    </div>

    <transition name="slide-in">
      <div v-if="isChatOpen"
        class="fixed bottom-24 right-8 z-40 w-80 bg-gray-800/90 backdrop-blur-md rounded-xl border border-gray-700 shadow-lg flex flex-col"
        style="height: 400px; max-height: 60vh;">
        <div class="p-3 border-b border-gray-700 flex justify-between items-center">
          <h3 class="text-white font-semibold flex items-center">
            <MessageCircle class="h-4 w-4 mr-2 text-blue-300" />
            Chat
          </h3>
          <XButton class="h-4 w-4 text-white cursor-pointer absolute top-2 right-5" @click="toggleChat" />
        </div>

        <div class="flex-grow overflow-y-auto p-3 chat-messages">
          <div v-if="chatMessages.length === 0" class="flex items-center justify-center h-full text-gray-500 text-sm">
            Még nincsenek üzenetek
          </div>
          <div v-else>
            <transition-group name="message" tag="div" class="space-y-3">
              <div v-for="(msg, index) in chatMessages" :key="index" :class="[
                'flex items-start max-w-[85%]',
                msg.isSelf ? 'ml-auto flex-row-reverse' : ''
              ]">
                <img :src="msg.pfp" class="w-8 h-8 rounded-full flex-shrink-0" :class="msg.isSelf ? 'ml-2' : 'mr-2'" />
                <div :class="[
                  'rounded-xl py-2 px-3',
                  msg.isSelf ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-700 text-white rounded-bl-none'
                ]">
                  <div class="text-xs opacity-80 mb-1" :class="msg.isSelf ? 'text-right' : 'text-left'">
                    {{ msg.name }}
                  </div>
                  <div class="text-sm">{{ msg.message }}</div>
                </div>
              </div>
            </transition-group>
          </div>
        </div>

        <div class="p-2 border-t border-gray-700 flex">
          <input v-model="chatMessage" @keyup.enter="sendChatMessage" type="text" placeholder="Írj üzenetet..."
            class="bg-gray-700 text-white text-sm rounded-l-md px-3 py-2 flex-grow focus:outline-none"
            :maxlength="100" />
          <button @click="sendChatMessage" :disabled="!chatMessage.trim()"
            class="bg-blue-600 text-white cursor-pointer px-3 rounded-r-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center 
            justify-center">
            <Send class="h-4 w-4" />
          </button>
        </div>
        <div class="text-xs text-right px-2 pb-1 text-gray-400">
          {{ chatMessage.length }}/100
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.5s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.4s ease;
}

.fade-up-enter-from {
  opacity: 0;
  transform: translateY(15px);
}

.fade-up-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}

.answer-pop-enter-active,
.answer-pop-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.answer-pop-enter-from {
  opacity: 0;
  transform: scale(0.6);
}

.answer-pop-leave-to {
  opacity: 0;
  transform: scale(0.6);
}

.answer-pop-move {
  transition: transform 0.4s ease;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.list-move {
  transition: transform 0.5s ease;
}

.score-enter-active {
  animation: bounce 0.5s;
}

.score-leave-active {
  animation: fadeOut 0.3s;
}

@keyframes bounce {
  0% {
    transform: scale(0);
  }

  50% {
    transform: scale(1.2);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}

.bounce-enter-active {
  animation: bounce 0.5s;
}

.bounce-leave-active {
  animation: fadeOut 0.3s;
}

@keyframes loadingBar {
  0% {
    width: 0%;
  }

  100% {
    width: 100%;
  }
}

.animate-loading-bar {
  animation: loadingBar 1.5s linear forwards;
}


@media (max-width: 958px) {
  .small-screen-hidden {
    display: none;
  }
}


.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.slide-in-enter-active,
.slide-in-leave-active {
  transition: all 0.3s ease;
}

.slide-in-enter-from,
.slide-in-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.message-enter-active {
  animation: slide-up 0.3s;
}

@keyframes slide-up {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.chat-messages {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: transparent;
}

.chat-messages::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
}
</style>

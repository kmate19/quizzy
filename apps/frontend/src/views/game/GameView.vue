<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted, toRaw, onUnmounted, nextTick } from 'vue'
import { wsclient } from '@/lib/apiClient'
import { generateSessionHash } from '@/utils/helpers'
import { Loader2Icon, Users, Copy } from 'lucide-vue-next';
import { useQuizzyStore } from '@/stores/quizzyStore'
import type { gameStats } from '@/utils/type'
import XButton from '@/components/XButton.vue';
import type { Participants } from '@/utils/type';

const route = useRoute()
const router = useRouter()
const quizzyStore = useQuizzyStore()
const lobbyId = ref(quizzyStore.lobbyId)
const isHost = ref(quizzyStore.isHost)
const isLoading = ref(true)
const error = ref<string | null>(null)
const participants = ref<Participants>({ host: '', members: [] });
const websocket = ref<WebSocket | null>(null)
const copiedToClipboard = ref(false)
const reconnectAttempts = ref(0)
const gameStarted = ref(false)
const currentCard = ref()
const time = ref(0)
const answerSelected = ref(false)
const gameEnded = ref(false)
const stats = ref<gameStats>()
const timerRef = ref<number | null>(null)
const currentQuestionIndex = ref(0)
const hostId = quizzyStore.id
const preparingNextRound = ref(false)

const copyLobbyCode = () => {
  navigator.clipboard.writeText(lobbyId.value)
  copiedToClipboard.value = true
  copiedToClipboard.value = false
}

const setupWebSocket = async () => {
  try {
    console.log('websocket setup', lobbyId.value)

    console.log(quizzyStore.getLobbyData())

    const storedWs = quizzyStore.getLobbyData()
    let wsHash = quizzyStore.hash || (await generateSessionHash(lobbyId.value, 'asd'))

    if (storedWs) {
      if (storedWs.lobbyId === lobbyId.value) {
        console.log('Using existing WebSocket connection data')
        wsHash = storedWs.hash
      }
    }

    if (!wsHash) {
      wsHash = await generateSessionHash(lobbyId.value, 'asd')
    }

    console.log('connecting to...:', lobbyId.value)
    const ws = await wsclient.ws.server[':lobbyid'][':hash'].$ws({
      param: { lobbyid: lobbyId.value, hash: wsHash },
    })

    websocket.value = ws
    setupWebSocketListeners(websocket.value)

    quizzyStore.setLobbyData({
      lobbyId: lobbyId.value,
      hash: wsHash,
      isHost: isHost.value,
      quizId: quizzyStore.quizId,
      timestamp: Date.now(),
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
}

const addParticipant = (username: string, pfp: string, id: string) => {
  const newUser = {
    username: username,
    pfp: 'data:image/png;base64,' + pfp,
    userId: id
  }
  console.log(newUser)
  participants.value!.members = [...participants.value!.members, newUser]
}

const setupWebSocketListeners = (ws: WebSocket) => {
  ws.addEventListener('open', () => {
    console.log('lobby open', lobbyId.value)
    isLoading.value = false
    reconnectAttempts.value = 0
    if (ws.readyState === WebSocket.OPEN) {
      const userData = {
        username: quizzyStore.userName,
        pfp: quizzyStore.pfp.replace('data:image/png;base64,', ''),
        id: quizzyStore.id
      }
      console.log('USERDATA', userData)
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
      console.log('quizdata', toRaw(quizzyStore.currentQuiz))
      ws.send(
        JSON.stringify({
          type: 'quizdata',
          successful: true,
          server: false,
          data: toRaw(quizzyStore.currentQuiz),
        }),
      )
      addParticipant(userData.username, userData.pfp, userData.id)
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

      if (data.type === 'gamestarted') {
        console.log('Game started')
        gameStarted.value = true
        preparingNextRound.value = true
        nextTick(() => {
          setTimeout(() => {
            preparingNextRound.value = false
          }, 1500)
        })
      }

      if (data.type === 'roundstarted') {
        console.log('Round started')
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
        answerSelected.value = false
        console.log('Round ended')
        console.log('Round ende data:', data.data)
        stats.value = data.data
        if (timerRef.value !== null) {
          clearTimeout(timerRef.value)
          timerRef.value = null
        }
        currentQuestionIndex.value++
        stats.value = data.data
        console.log('Stats:', stats.value)
        stats.value?.scores.forEach((player) => {
          player.pfp = 'data:image/png;base64,' + player.pfp
        })
        stats.value?.scores.sort((a, b) => b.stats.score - a.stats.score)
        answerSelected.value = false
        preparingNextRound.value = true
        setTimeout(() => {
          preparingNextRound.value = false
        }, 1500)
      }
      if (data.type === 'gamended') {
        console.log('Game ended')
        console.log('Game ended data:', data.data)
        gameStarted.value = false
        preparingNextRound.value = false
        currentCard.value = null
        answerSelected.value = false
        gameEnded.value = true
        stats.value?.scores.sort((a, b) => b.stats.score - a.stats.score)
        console.log(stats.value)
      }

      if (data.type === 'disconnect') {
        console.log('User disconnected', data.data.userId)
        participants.value.members = participants.value.members.filter(member => member.userId !== data.data.userId)
      }

    } catch (err) {
      console.error('Error parsing WebSocket message:', err)
    }
  })

  ws.addEventListener('error', (event) => {
    console.error('WebSocket error:', event)
    error.value = 'Connection error occurred'
  })

  ws.addEventListener('close', (event) => {
    console.log('WebSocket closed:', event.code, event.reason)

    if (event.code === 1003) {
      error.value = event.reason || 'Server closed the connection'
      quizzyStore.$reset()
    } else if (event.code !== 1000 && route.name === 'quiz_multiplayer') {
    }
  })
}



const leaveLobby = () => {
  console.log('Leaving lobby:', lobbyId.value)

  if (websocket.value && websocket.value.readyState === WebSocket.OPEN) {
    try {
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
    hash: '',
    isHost: false,
    quizId: '',
    timestamp: 0,
  })
  router.push('/')
}

const getBaseButtonColor = (index: number) => {
  const colors = [
    'bg-red-500 hover:bg-red-600',
    'bg-blue-500 hover:bg-blue-600',
    'bg-yellow-500 hover:bg-yellow-600',
    'bg-green-500 hover:bg-green-600'
  ]
  return colors[index]
}

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

const selectAnswer = (index: number) => {
  answerSelected.value = true

  if (timerRef.value !== null) {
    clearTimeout(timerRef.value)
    timerRef.value = null
  }

  if (websocket.value && websocket.value.readyState === WebSocket.OPEN) {
    websocket.value.send(
      JSON.stringify({
        type: 'answered',
        successful: true,
        server: false,
        data: {
          answerIndex: index.toString(),
          answerTime: Date.now().toString()
        }
      })
    )
  }
}

const decrase = () => {
  if (time.value > 0 && !answerSelected.value) {
    timerRef.value = setTimeout(() => {
      time.value -= 1000
      decrase()
    }, 1000) as unknown as number
  } else if (timerRef.value !== null) {
    clearTimeout(timerRef.value)
    timerRef.value = null
  }
}

const restartGame = () => {
  gameEnded.value = false
  gameStarted.value = true
  answerSelected.value = false
  currentCard.value = null
  preparingNextRound.value = true
  setTimeout(() => {
    preparingNextRound.value = false
  }, 1500)
  currentQuestionIndex.value = 0

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
  console.log('Kick user')
  if (websocket.value && websocket.value.readyState === WebSocket.OPEN) {
    websocket.value.send(
      JSON.stringify({
        type: 'kick',
        successful: true,
        server: false,
        data: {
          username: userName
        }
      })
    )
  }
}

onMounted(() => {
  if (!lobbyId.value) {
    error.value = 'Invalid lobby ID'
    isLoading.value = false
    return
  }
  console.log('minden pacek')
  console.log('wattutt', quizzyStore.currentQuiz)

  setupWebSocket()
})

onUnmounted(() => {
  if (websocket.value && websocket.value.readyState === WebSocket.OPEN) {
    websocket.value.close(1000, 'User left lobby')
  }
})


</script>

<template>
  <div class="max-w-4xl mx-auto px-4  bg-gray-800 bg-opacity-80 rounded-md mt-8">
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <Loader2Icon class="w-12 h-12 text-white animate-spin" />
      <p class="ml-4 text-white text-xl">Csatlakozás...</p>
    </div>
    <div v-else-if="error" class="bg-red-500 bg-opacity-50 backdrop-blur-md rounded-lg p-4 text-white">
      <p class="mb-4">{{ error }}</p>
      <div class="flex gap-4 justify-center">
        <button @click="manualReconnect" class="glass-button px-4 py-2 rounded-md bg-green-600/30">
          Újracsatlakozás
        </button>
        <button @click="router.push('/')" class="glass-button px-4 py-2 rounded-md">
          Vissza a kezdőlapra
        </button>
      </div>
    </div>
    
    <div v-else-if="gameStarted" class="text-white">
      <div class="w-full rounded-full h-4 mb-4 flex z-20 flex-col gap-2">
        <div class="flex w-full space-x-2">
          <div v-for="index in quizzyStore.currentQuiz?.cards?.length" :key="index"
            class="h-5 flex-1 rounded-full overflow-hidden backdrop-filter">
            <div class="h-full transition-all duration-300 rounded-full glass-progress" :class="{
              'bg-green-500/70 backdrop-blur-sm border border-green-300/50 shadow-green-500/30': index - 1 < currentQuestionIndex,
              'bg-blue-500/70 backdrop-blur-sm border border-blue-300/50 shadow-blue-500/30 animate-pulse': index - 1 === currentQuestionIndex,
              'bg-white/10 backdrop-blur-sm border border-white/20': index - 1 > currentQuestionIndex
            }">
            </div>
          </div>
        </div>

      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div class="md:col-span-2">
          <div v-if="answerSelected && !preparingNextRound"
            class="mt-8 p-3 bg-green-500/30 rounded-lg text-center animate-pulse">
            <p class="text-lg font-bold">Válaszod beküldve! Várakozás a többi játékosra...</p>
          </div>
          <div v-if="preparingNextRound" class="p-6 mb-4 relative bg-white/10 backdrop-blur-sm 
            rounded-lg min-h-[200px] flex items-center justify-center" :key="'loading'">
            <div class="text-center">
              <Loader2Icon class="w-16 h-16 text-blue-400 animate-spin mx-auto mb-4" />
              <h2 class="text-2xl font-bold text-white">Következő kérdés...</h2>
              <div class="mt-4 h-3 bg-white/20 rounded-full w-64 mx-auto overflow-hidden">
                <div class="h-full bg-blue-500 animate-loading-bar"></div>
              </div>
              <p class="text-white/70 mt-3">Készülj fel!</p>
            </div>
          </div>
          <transition name="fade-slide" mode="in-out">
            <div class="p-6 mb-4 relative bg-white/10 backdrop-blur-sm rounded-lg" :key="currentQuestionIndex"
              v-if="!preparingNextRound && !answerSelected && currentCard">
              <div
                class="text-2xl font-bold bg-white/30 w-10 h-10 rounded-full flex items-center justify-center absolute top-2 right-2"
                :class="time < 5000 ? 'text-red-500' : 'text-white'">
                <transition name="bounce" mode="out-in">
                  <span :key="Math.ceil(time / 1000)">{{ Math.ceil(time / 1000) }}</span>
                </transition>
              </div>
              <transition name="fade" mode="out-in">
                <img :src="currentCard.picture" :alt="currentCard.question"
                  class="w-full max-h-64 object-contain mb-6 rounded-lg" :key="'img-' + currentQuestionIndex" />
              </transition>
              <transition name="fade-up" mode="out-in">
                <h2 class="text-xl font-semibold text-white text-center" :key="'q-' + currentQuestionIndex">{{
                  currentCard?.question }}</h2>
              </transition>
            </div>
          </transition>

          <transition-group name="answer-pop" mode="in-out" tag="div" v-if="!preparingNextRound && !answerSelected && currentCard"
            :class="[
              'grid gap-4',
              currentCard?.type === 'twochoice'
                ? 'grid-cols-1 md:grid-cols-2'
                : 'grid-cols-2 md:grid-cols-2',
            ]">
            <button v-for="(answer, index) in currentCard.answers" :key="`${currentQuestionIndex}-${index}`" :class="[
              'p-6 rounded-lg text-white font-bold text-lg transition-all transform hover:scale-105 backdrop-blur-sm',
              getBaseButtonColor(index),
              answerSelected ? 'opacity-70 cursor-not-allowed' : '',
            ]" @click="selectAnswer(index)" :disabled="answerSelected">
              {{ answer }}
            </button>
          </transition-group>
        </div>

        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 h-96 overflow-y-auto">
          <h3 class="text-xl font-bold mb-3 text-center">Eredmények</h3>
          <transition-group name="list" tag="div" class="space-y-2">
            <div v-for="(player, index) in stats?.scores" :key="player.userId"
              class="flex items-center p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all">
              <div class="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center mr-2">
                #{{ index + 1 }}
              </div>
              <img :src="player.pfp" class="w-8 h-8 rounded-full mr-2" />
              <span class="font-medium truncate flex-grow">{{ player.username }}</span>
              <transition name="score" mode="out-in">
                <span class="font-bold text-yellow-300" :key="player.stats.score">{{ player.stats.score }}</span>
              </transition>
            </div>
          </transition-group>
          <div v-if="!stats || !stats.scores || stats.scores.length === 0" class="text-center py-4 text-gray-400">
            Még nincsenek eredmények
          </div>
        </div>
      </div>
    </div>


    <div v-else-if="gameEnded" class="text-white">
      <div class="p-8 mb-6 relative bg-white/10 backdrop-blur-sm rounded-lg text-center">
        <h2 class="text-3xl font-bold text-white">Játék vége</h2>
        <p class="text-gray-300 mt-2">Köszönjük a játékot!</p>
      </div>

      <div class="p-6 mb-6 relative bg-white/10 backdrop-blur-sm rounded-lg">
        <h2 class="text-2xl font-semibold text-white mb-4 flex items-center">
          <Users class="h-6 w-6 mr-2" />
          Eredmények
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="(playerStat, index) in stats?.scores" :key="playerStat.userId"
            class="glass-button rounded-lg p-5 transition-all hover:scale-105">
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
                <div class="bg-white/10 rounded p-2 text-center">
                  <span class="block text-sm text-gray-300">Helyes</span>
                  <span class="block text-2xl font-bold text-green-400">{{ playerStat.stats.correctAnswerCount }}</span>
                </div>
                <div class="bg-white/10 rounded p-2 text-center">
                  <span class="block text-sm text-gray-300">Helytelen</span>
                  <span class="block text-2xl font-bold text-red-400">{{ playerStat.stats.wrongAnswerCount }}</span>
                </div>
              </div>

              <div class="mt-4 w-full bg-white/10 rounded p-3 text-center">
                <span class="block text-sm text-gray-300">Összpontszám</span>
                <span class="block text-3xl font-bold text-yellow-300">{{ playerStat.stats.score }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-center mt-8">
        <button @click="restartGame"
          class="glass-button px-8 py-3 rounded-full !bg-purple-500 text-lg font-bold flex items-center animate-bounce cursor-pointer">
          Még egy kör?
        </button>
      </div>
    </div>

    <div v-else class="text-white">
      <div class="flex justify-between items-center mb-8">
        <button @click="leaveLobby" class="glass-button px-4 py-2 rounded-md bg-red-600/30">
          Lobby elhagyása
        </button>
      </div>

      <div class="text-center relative z-50 p-4 bg-white/10 backdrop-blur-sm rounded-lg mb-8" id="quiz">
        <div v-if="!quizzyStore.currentQuiz" class="py-4 text-red-500">No Quiz Data</div>
        <div v-else>
          <img :src="quizzyStore.currentQuiz.quiz.banner" class="mx-auto mb-4 max-w-full rounded-md" />
          <h2 class="text-2xl font-semibold mb-2">{{ quizzyStore.currentQuiz.quiz.title }}</h2>
          <p class="text-gray-300">{{ quizzyStore.currentQuiz.quiz.description }}</p>
        </div>
      </div>

      <div class="mb-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg">
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-semibold">Lobby kód:</h2>
          <div class="flex items-center">
            <span class="text-xl font-mono bg-gray-700 px-3 py-1 rounded-md">{{ lobbyId }}</span>
            <button @click="copyLobbyCode" class="ml-2 glass-button p-2 rounded-md">
              <Copy v-if="!copiedToClipboard" class="h-5 w-5" />
              <span v-else class="text-green-400">Másolva!</span>
            </button>
          </div>
        </div>
      </div>

      <div class="mb-4 flex justify-center">
        <div class="flex gap-4 flex-wrap">
          <div v-for="participant in participants?.members" :key="participant.username"
            class="p-4 glass-button rounded-lg flex !w-fit">
            <div class="flex items-center space-x-4">
              <img :src="participant.pfp || '/placeholder.svg?height=40&width=40'"
                class="w-10 h-10 rounded-full object-cover" />
              <span class="text-lg font-medium">{{ participant.username }}</span>
              <span v-if="participant.userId === hostId" class="text-yellow-500">👑</span>
            </div>
            <XButton class="ml-2" v-if="quizzyStore.isHost" @click="kickUser(participant.username)" />
          </div>
        </div>
      </div>

      <div class="flex justify-center" v-if="quizzyStore.isHost">
        <button class="glass-button px-8 py-4 text-xl rounded-lg bg-green-600/30" @click="startGame">
          Játék
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.glass-button {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  border: 2px solid transparent;
  transition: all 0.3s ease;
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
</style>

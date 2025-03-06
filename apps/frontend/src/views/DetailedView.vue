<script lang="ts" setup>
import { useRoute } from 'vue-router'
import router from '@/router'
import { ref, onMounted } from 'vue'
import NavBar from '@/components/NavBar.vue'
import { Loader2Icon } from 'lucide-vue-next'
import type { detailedQuiz } from '@/utils/type'
import MistBackground from '@/components/MistBackground.vue'
import { getQuiz } from '@/utils/functions/detailedFunctions'
import { wsclient } from '@/lib/apiClient'
import { userData } from '@/utils/functions/profileFunctions'
import { useQuery } from '@tanstack/vue-query'

const route = useRoute()
const uuid = route.params.uuid
const data = ref<detailedQuiz>()
const user = ref()
const isLoading = ref(true)

const expandedQuestions = ref<boolean[]>([])

onMounted(async () => {
  const temp = await getQuiz(uuid?.toString())
  if (temp) {
    data.value = temp.data
    user.value = temp.user
    expandedQuestions.value = Array(data.value?.cards.length).fill(false)
    isLoading.value = false
  }
})

const {data: creator} = useQuery({
  queryKey: ['userProfile', ''],
  queryFn: () => userData(''),
})

const toggleQuestion = (index: number) => {
  expandedQuestions.value[index] = !expandedQuestions.value[index]
}
const handleViewUser = (uuid: string) => {
  router.push(`/profil/${uuid}`)
}
const handleTestPlay = () => {
  router.push(`/quiz/practice/${uuid}`)
}

async function generateSessionHash(lobbyCode: string, secretKey: string) {
  const timestamp = Math.floor(Date.now() / 10000)
  const data = `${lobbyCode}:${timestamp}`
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secretKey)
  const messageData = encoder.encode(data)

  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  const signature = await window.crypto.subtle.sign('HMAC', cryptoKey, messageData)

  const hashArray = Array.from(new Uint8Array(signature))
  const hashHex = hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('')

  return hashHex
}

const createLobby = async () => {
  console.log("creator username", creator.value?.username)  
  const first = await wsclient.reserve.session[':code?'].$post({
    param: { code: '' },
    query: { ts: Date.now().toString() },
  })
  console.log('first', first.status)
  if (first.status === 200) {
    const first_data = await first.json()
    console.log('Received code:', first_data.code)
    const hash = await generateSessionHash(first_data.code, 'asd')
    console.log('Generated hash:', hash)
    const ws = await wsclient.ws.server[':lobbyid'][':hash'].$ws({
      param: { lobbyid: first_data.code, hash: hash },
    })
    if (ws.readyState === 1) {
      console.log('WebSocket connection is open.')
    } else {
      console.log('WebSocket connection not open, state:', ws.readyState)
    }
    ws.addEventListener('open', () => {
      console.log('WebSocket connection is open')
    })
    ws.addEventListener('message', (event) => {
      console.log('Message from server:', event.data)
    })
    ws.addEventListener('error', (error) => {
      console.error('WebSocket error:', error)
    })
    ws.addEventListener('close', (event) => {
      console.log('WebSocket closed:', event)
    })
  } else {
    console.log('Lobby creation process failed.')
  }
}

</script>

<template>
  <MistBackground />
  <div v-if="isLoading" class="min-h-screen flex justify-center items-center">
    <div class="flex justify-center items-center h-64">
      <Loader2Icon class="w-12 h-12 text-white animate-spin" />
    </div>
  </div>
  <div v-else class="lg:overflow-hidden">
    <NavBar />
    <div class="text-white md:p-6">
      <div class="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
        <!-- Left -->
        <div class="lg:w-1/3 space-y-4 h-[calc(100vh-10vh)]">
          <div class="rounded-xl backdrop-blur-md bg-white/10 p-4 border border-white/20 shadow-lg">
            <div class="h-48 bg-white/10 rounded-lg">
              <v-img
                :src="data?.banner || '/placeholder.svg?height=200&width=300'"
                class="rounded-md"
                fit
              />
            </div>
          </div>

          <div class="rounded-xl backdrop-blur-md bg-white/10 p-4 border border-white/20 shadow-lg">
            <h2 class="text-xl font-semibold">{{ data?.title }}<br /></h2>
            <div class="max-h-20 overflow-y-scroll">
              {{ data?.description }}
            </div>
          </div>

          <div
            class="rounded-xl backdrop-blur-md bg-white/10 p-4 border border-white/20 shadow-lg text-lg"
          >
            <div>
              Készítette:
              <span
                @click="data?.user_id && handleViewUser(data.user_id)"
                class="cursor-pointer font-bold relative before:absolute before:left-0 before:bottom-0 before:w-0 before:h-[2px] before:bg-white before:transition-all before:duration-300 hover:before:w-full"
              >
                {{ data?.username }}
              </span>
            </div>
          </div>

          <div class="rounded-xl backdrop-blur-md bg-white/10 p-4 border border-white/20 shadow-lg">
            <div class="mb-2">Kategóriák:</div>
            <div class="flex flex-wrap gap-2 max-h-20 overflow-y-scroll">
              <span
                v-for="tag in data?.tags"
                :key="tag.name"
                class="bg-white/10 px-3 py-1 rounded-full text-xs backdrop-blur-sm"
              >
                {{ tag }}
              </span>
            </div>
            <div class="mb-2">Nyelvek:</div>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="lang in data?.languages"
                :key="lang.iso_code"
                class="bg-white/10 px-3 py-1 rounded-full text-xs backdrop-blur-sm"
              >
                {{ lang.iso_code }} | {{ lang.icon }}
              </span>
            </div>
            <div class="mb-2">
              Publikálás ideje:
              <span class="font-bold text-blue-500">
                {{ data?.created_at }}
              </span>
            </div>
            <div class="mb-2">{{ data?.plays }}x játszották</div>
            <div class="mb-2 flex gap-1">Értékelés: {{ data?.rating }}⭐</div>
          </div>

          <div class="flex gap-2 justify-center">
            <button
              class="flex-1 flex justify-center items-center rounded-xl backdrop-blur-md bg-blue-500/30 hover:bg-blue-500/40 p-3 border border-white/20 transition-all cursor-pointer duration-300 shadow-lg text-2xl"
              @click="handleTestPlay"
            >
              Gyakorlás
            </button>
            <button
              @click="createLobby"
              class="flex-1 flex justify-center items-center rounded-xl backdrop-blur-md bg-green-500/30 hover:bg-green-500/40 p-3 border border-white/20 transition-all cursor-pointer duration-300 shadow-lg text-2xl"
            >
              Többjátékos
            </button>
          </div>
        </div>

        <!-- Right -->
        <div class="flex-1">
          <div class="space-y-4 pl-2 pr-2 h-[calc(100vh-10vh)] overflow-y-scroll">
            <div
              v-for="(card, index) in data?.cards"
              :key="card.picture"
              class="rounded-xl backdrop-blur-md bg-white/10 p-2 sm:p-4 border border-white/20 shadow-lg"
            >
              <button
                class="w-full flex flex-col sm:flex-row sm:items-center gap-4 justify-center items-center"
                @click="toggleQuestion(index)"
              >
                <div
                  class="w-fit sm:w-1/4 aspect-video sm:aspect-square bg-white/10 rounded-md overflow-hidden"
                >
                  <img
                    :src="card.picture || '/placeholder.svg?height=200&width=300'"
                    class="w-[20vh] h-[20vh] object-cover rounded-md"
                    alt="Question image"
                  />
                </div>
                <div class="flex flex-col gap-4 flex-1 p-2 sm:p-4">
                  <span class="text-left text-sm sm:text-base">{{ card.question }}</span>
                  <div class="flex flex-wrap gap-2">
                    <div
                      v-for="(answer, i) in card.answers"
                      :key="i"
                      class="p-2 text-xs sm:text-sm rounded-md border border-white/20 bg-white/10 flex items-center"
                    >
                      {{ answer }}
                    </div>
                  </div>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6 transform transition-transform duration-700 flex-shrink-0"
                  :class="{ 'rotate-180': expandedQuestions[index] }"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <div
                class="transition-all duration-700 ease-in-out overflow-hidden"
                :class="
                  expandedQuestions[index] ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                "
              >
                <div class="pt-4 pb-2 px-2 sm:px-4">
                  <span class="text-sm font-semibold">Helyes válasz:</span>
                  <div class="py-2 text-green-600 border-t border-white/10 text-sm sm:text-base">
                    {{ card.answers[card.correct_answer_index] }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 9999px;
}

::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

@media (prefers-reduced-motion: reduce) {
  .transition-all,
  .transition-transform {
    transition: none;
  }
}
</style>

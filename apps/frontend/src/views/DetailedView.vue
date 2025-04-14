<script lang="ts" setup>
import { useRoute } from 'vue-router'
import router from '@/router'
import { ref, onMounted, toRaw } from 'vue'
import { Loader2Icon } from 'lucide-vue-next'
import type { detailedQuiz } from '@/utils/type'
import { getQuiz } from '@/utils/functions/detailedFunctions'
import { wsclient } from '@/lib/apiClient'
import { useQuizzyStore } from '@/stores/quizzyStore'

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

const toggleQuestion = (index: number) => {
  expandedQuestions.value[index] = !expandedQuestions.value[index]
}
const handleViewUser = (uuid: string) => {
  router.push(`/profil/${uuid}`)
}
const handleTestPlay = () => {
  router.push(`/quiz/practice/${uuid}`)
}

const isCreatingLobby = ref(false)
const quizzyStore = useQuizzyStore()

const createLobby = async () => {
  try {
    isCreatingLobby.value = true;
    console.log('Creating new lobby');

    const sessionResponse = await wsclient.reserve.session[':code?'].$post({
      param: { code: '' },
      query: { ts: Date.now().toString() },
    });



    if (sessionResponse.status === 200) {
      const sessionData = await sessionResponse.json() as { code: string };

      if (!sessionData.code) {
        throw new Error('Failed to create lobby - no code returned');
      }

      quizzyStore.setLobbyData({
        lobbyId: sessionData.code,
        isHost: true,
        quizId: uuid.toString(),
        canReconnect: false,
      })
      if (data.value) {
        quizzyStore.setCurrentQuiz(toRaw(data.value))

      }

      isCreatingLobby.value = false;
      router.push(`/quiz/multiplayer/${sessionData.code}`);
    } else {
      throw new Error('Server returned an error when creating lobby');
    }
  } catch (error) {
    console.error('Error creating lobby:', error);
    isCreatingLobby.value = false;

  }
};
</script>

<template>
  <div v-if="isLoading" class="flex justify-center items-center w-screen h-screen overflow-hidden fixed top-0 left-0">
    <div class="flex justify-center items-center h-64">
      <Loader2Icon class="w-12 h-12 text-white animate-spin" />
    </div>
  </div>
  <div v-else class="w-screen h-full overflow-y-auto fixed left-0 p-2">
    <div class="text-white md:p-2">
      <div class="flex flex-col lg:flex-row max-w-7xl mx-auto">
        <!-- Left -->
        <div class="lg:w-1/3 flex-1 flex flex-col p-1">
          <div class="flex gap-2 justify-center lg:order-last sticky top-0 z-10 p-1 rounded-xl">
            <button
              class="flex-1 flex justify-center items-center rounded-xl backdrop-blur-md bg-blue-500/30 hover:bg-blue-500/40 hover:border-white p-3 border border-white/20 transition-all cursor-pointer duration-300 shadow-lg text-lg md:text-2xl"
              @click="handleTestPlay">
              Gyakorlás
            </button>
            <button @click="createLobby" :disabled="isCreatingLobby"
              class="flex-1 flex justify-center items-center rounded-xl backdrop-blur-md bg-green-500/30 hover:bg-green-500/40 hover:border-white p-3 border border-white/20 transition-all cursor-pointer duration-300 shadow-lg text-lg md:text-2xl">
              {{ isCreatingLobby ? 'Létrehozás...' : 'Többjátékos' }}
            </button>
          </div>

          <div class="overflow-y-auto flex-1 md:space-y-4 p-2 space-y-2">
            <div class="rounded-xl backdrop-blur-md bg-white/10 p-4 border border-white/20 shadow-lg">
              <div class="h-52 bg-white/10 rounded-lg flex items-center">
                <v-img :src="data?.banner || '/placeholder.svg?height=200&width=300'" max-width="fit"
                  max-height="fit" />
              </div>
            </div>

            <div class="rounded-xl backdrop-blur-md bg-white/10 p-4 border border-white/20 shadow-lg">
              <h2 class="text-xl font-semibold">{{ data?.title }}<br /></h2>
              <div class="max-h-20 overflow-y-auto">
                {{ data?.description }}
              </div>
            </div>
            <div class="rounded-xl backdrop-blur-md bg-white/10 p-4 border border-white/20 shadow-lg">
              <div>
                Készítette:
                <span @click="data?.user_id && handleViewUser(data.user_id)" class="cursor-pointer font-bold relative before:absolute before:left-0
                  before:bottom-0 before:w-0 before:h-[2px] before:bg-white
                  before:transition-all before:duration-300 hover:before:w-full">
                  {{ data?.username }}
                </span>
              </div>
              <div class="mb-2">Kategóriák:</div>
              <div class="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                <span v-for="tag in data?.tags" :key="tag"
                  class="bg-white/10 px-3 py-1 rounded-full text-xs backdrop-blur-sm">
                  {{ tag }}
                </span>
              </div>
              <div class="mb-2">Nyelvek:</div>
              <div class="flex flex-wrap gap-2">
                <span v-for="lang in data?.languages" :key="lang.iso_code"
                  class="bg-white/10 px-3 py-1 rounded-full text-xs backdrop-blur-sm">
                  {{ lang.icon }} {{ lang.iso_code }}
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
          </div>
        </div>

        <!-- Right -->
        <div class="lg:w-2/3">
          <div class="pl-2 pr-2 md:max-h-[calc(100vh-18vh)] overflow-y-auto m-2 mb-10 md:space-y-4 space-y-2">
            <div v-for="(card, index) in data?.cards" :key="card.picture">
              <button class="w-full flex flex-col sm:flex-row sm:items-center gap-4 justify-between  cursor-pointer
              rounded-xl backdrop-blur-md bg-white/10 p-2 sm:p-4 border border-white/20 shadow-lg"
                @click="toggleQuestion(index)">
                <div class="flex flex-col sm:flex-row sm:items-center gap-4 w-full">
                  <div class="w-full sm:w-1/4 bg-white/10 rounded-md overflow-hidden">
                    <div class="h-30 flex items-center justify-center">
                      <img :src="card.picture || '/placeholder.svg?height=200&width=300'" 
                        class="max-h-[120px] w-full object-contain"
                        alt="Question image" />
                    </div>
                  </div>
                  <div class="flex flex-col gap-4 flex-1 p-2 sm:p-4">
                    <span class="text-left text-base sm:text-lg font-medium">{{ card.question }}</span>
                    <div class="flex flex-wrap gap-2">
                      <div v-for="(answer, i) in card.answers" :key="i"
                        class="p-2 text-sm rounded-md border border-white/20 bg-white/10 flex items-center">
                        {{ answer }}
                      </div>
                    </div>
                  </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6 transform transition-transform duration-700 absolute right-3 bottom-5"
                  :class="{ 'rotate-180': expandedQuestions[index] }" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div class="transition-all duration-700 ease-in-out overflow-hidden" :class="expandedQuestions[index] ? 'max-h-[70px] opacity-100' : 'max-h-0 opacity-0'
                ">
                <div>
                  <span class="text-base font-semibold">Helyes válasz:</span>
                  <div class=" text-green-600 border-t border-white/10 text-base">
                    {{ card.answers[card.correct_answer_index] }}
                  </div>
                </div>
              </div>
            </div>
            <div class="h-28 sm:h-10 md:hidden"></div>
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

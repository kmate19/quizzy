<script lang="ts" setup>
import { clientv1 } from '@/lib/apiClient'
import { useRoute } from 'vue-router'
import router from '@/router'
import { ref } from 'vue'
import NavBar from '@/components/NavBar.vue'
import { Play, Star, Loader2Icon } from 'lucide-vue-next'
import { type quizCardView } from '@/utils/type'
import { toast } from 'vue3-toastify'

const route = useRoute()
const uuid = route.params.uuid
const data = ref<quizCardView>()
const isLoading = ref(true)

const arrayBufferToBase64 = (buffer: number[], mimeType = 'image/png'): string => {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return `data:${mimeType};base64,${window.btoa(binary)}`
}

const getQuiz = async () => {
  console.log('asdsad', uuid)
  const getQuiz = await clientv1.quizzes[':quizId'].$get({param:{quizId:uuid.toString()}})
  console.log(getQuiz)
  if (getQuiz.ok) {
    const res = await getQuiz.json()
    const getUser = await clientv1.userprofile[':userId'].$get({ param: { userId: res.data.user_id } })
    let user = ''
    if (getUser.ok) {
      const userRes = await getUser.json()
      user = userRes.data.username
      console.log(user)
    }
    data.value = {
      quiz_id: res.data.id,
      status: res.data.status,
      created_at: new Date(res.data.created_at),
      updated_at: new Date(res.data.updated_at),
      title: res.data.title,
      description: res.data.description,
      rating: res.data.rating.toString(),
      plays: res.data.plays.toString(),
      banner: arrayBufferToBase64(res.data.banner.data),
      languageISOCodes: [...res.data.languages].map((lang) => ({
        iso_code: lang.language.iso_code,
        icon: lang.language.icon,
      })),
      tags: res.data.tags.map((tag) => tag.tag.name),
      user_id: res.data.user_id,
      username: user,
      cards: res.data.cards.map((card) => ({
        question: card.question,
        type: card.type,
        answers: card.answers,
        picture: arrayBufferToBase64(card.picture.data),
        correct_answer_index: card.correct_answer_index,
      })),
    }
    console.log(data.value)
    isLoading.value = false
    expandedQuestions.value = new Array(res.data.cards.length).fill(false)

    //get
  } else {
    const res = await getQuiz.json()
    toast(res.error.message, {
      autoClose: 5000,
      position: toast.POSITION.TOP_CENTER,
      type: 'error',
      transition: 'zoom',
      pauseOnHover: false,
    })
  }
}

const expandedQuestions = ref<boolean[]>([])

getQuiz()

const toggleQuestion = (index: number) => {
  expandedQuestions.value[index] = !expandedQuestions.value[index]
}
const handleViewUser = (uuid: string) => {
  router.push(`/profil/${uuid}`)
}
</script>

<template>
  <div v-if="isLoading === true" class="min-h-screen flex justify-center items-center">
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <Loader2Icon class="w-12 h-12 text-white animate-spin" />
    </div>
  </div>
  <div v-else>
    <NavBar />
    <div class="min-h-screen text-white p-4 md:p-6">
      <div class="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
        <div class="lg:w-1/3 space-y-4">
          <div class="rounded-xl backdrop-blur-md bg-white/10 p-4 border border-white/20 shadow-lg">
            <div class="h-48 bg-white/10 rounded-lg">
              <v-img
                :src="data?.banner || '/placeholder.svg?height=200&width=300'"
                class="rounded-md"
                fit
              >
              </v-img>
            </div>
          </div>

          <div class="rounded-xl backdrop-blur-md bg-white/10 p-4 border border-white/20 shadow-lg">
            <h2 class="text-xl font-semibold">{{ data?.title }}<br></h2>
            <span>{{ data?.description }}</span>
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
            <div class="mb-2">Tegek:</div>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in data?.tags"
                :key="tag"
                class="bg-white/10 px-3 py-1 rounded-full text-xs backdrop-blur-sm"
              >
                {{ tag }}
              </span>
            </div>
            <div class="mb-2">Nyelvezet:</div>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="lang in data?.languageISOCodes"
                :key="lang.iso_code"
                class="bg-white/10 px-3 py-1 rounded-full text-xs backdrop-blur-sm"
              >
                {{ lang.iso_code }} {{ lang.icon }}
              </span>
            </div>
            <div class="mb-2">
              Publikálás ideje:
              <span class="font-bold text-blue-500">
                {{ data?.created_at.toISOString().split('T')[0] }}
              </span>
            </div>
            <div class="mb-2">{{ data?.plays }}x játszották</div>
            <div class="mb-2 flex gap-1">
              Értékelés: {{ data?.rating }}⭐
            </div>
            <div></div>
          </div>

          <div class="flex gap-2 justify-center">
            <button
              class="flex-1 flex justify-center items-center rounded-xl font-bold backdrop-blur-md bg-green-500/30 hover:bg-green-500/40 p-3 border border-white/20 transition-all cursor-pointer duration-300 shadow-lg"
            >
              <Play :size="40" :stroke-width="2" absoluteStrokeWidth />
            </button>
           
          </div>
        </div>

        <div class="flex-1">
          <div class="space-y-4 p-4">
            <div
              v-for="(card, index) in data?.cards"
              :key="card.picture"
              class="rounded-xl backdrop-blur-md bg-white/10 p-2 sm:p-4 border border-white/20 shadow-lg overflow-hidden"
            >
              <button
                class="w-full flex flex-col sm:flex-row items-start sm:items-center gap-4"
                @click="toggleQuestion(index)"
              >
                <div
                  class="w-full sm:w-1/4 aspect-video sm:aspect-square bg-white/10 flex-shrink-0 rounded-md overflow-hidden"
                >
                  <img
                    :src="card.picture || '/placeholder.svg?height=200&width=300'"
                    class="w-full h-full object-cover rounded-md"
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

<script setup lang="ts">
import MistBackground from '@/components/MistBackground.vue'
import NavBar from '@/components/NavBar.vue'
import XButton from '@/components/XButton.vue'
import { useRoute } from 'vue-router'
import { ref, watch, nextTick } from 'vue'
import { CloudUpload, CirclePlus } from 'lucide-vue-next'
import { toast, type ToastOptions } from 'vue3-toastify'
import type { quizUpload, Question } from '@/utils/type'
import { useCounterStore } from '@/stores/counter'
import { clientv1 } from '@/lib/apiClient'
import { arrayBufferToBase64 } from '@/utils/helpers'
import { queryClient } from '@/lib/queryClient'

const store = useCounterStore()
const route = useRoute()

const isLoading = ref(false)
const isEdit = ref(false)
const tags = store.returnAllTags()
const isoCodes = store.returnIsoCards()



const oneQuestion = ref<Question>({
  question: '',
  type: <'twochoice' | 'normal'>'normal',
  answers: ['', '', '', ''],
  picture: '/placeholder.svg?height=200&width=300',
  correct_answer_index: 1,
})

const quiz = ref<quizUpload>({
  title: '',
  description: '',
  status: <'draft' | 'published' | 'requires_review' | 'private'>'published',
  banner: '',
  languageISOCodes: [],
  tags: [],
  cards: <Question[]>[],
})

watch(
  () => oneQuestion.value.type,
  (newType) => {
    if (newType === 'twochoice') {
      oneQuestion.value.answers = ['', '']
    } else {
      oneQuestion.value.answers = ['', '', '', '']
    }
    oneQuestion.value.correct_answer_index = 0
  },
  { immediate: true },
)

const gameImageInput = ref<HTMLInputElement | null>(null)
const questionImageInput = ref<HTMLInputElement | null>(null)

const getQuiz = async () => {
  const uuid = route.params.uuid
  console.log(uuid)
  if (uuid === '') {
    return
  }
  const get = await clientv1.quizzes.own[':quizId'].$get({ param: { quizId: uuid.toString() } })
  console.log('status: ' + get.status)

  if (get.status === 200) {
    isEdit.value = true
    const res = (await get.json()).data
    console.log(res)
    console.log(arrayBufferToBase64(res.banner.data))
    console.log('cards[0].picture.data', res.cards[0].picture.data)
    quiz.value = {
      title: res.title,
      description: res.description,
      status: res.status,
      banner: arrayBufferToBase64(res.banner.data),
      languageISOCodes: res.languages.map((l) => l.language.iso_code),
      tags: res.tags.map((t) => t.tag.name),
      cards: await Promise.all(
        res.cards.map(async (c) => {
          return {
            question: c.question,
            type: c.type,
            answers: c.answers,
            picture: arrayBufferToBase64(c.picture.data),
            correct_answer_index: c.correct_answer_index,
          }
        }),
      ),
    }
    console.log(quiz.value)
  } else {
    console.log('request failed: ', get.status)
  }
}

getQuiz()

const handleGameImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]

    const size = file.size / (1024 * 1024)

    if (size > 1) {
      gameImageInput.value = null
      toast('A fájl mérete túl nagy!\n(Max: 1 MB)', {
        autoClose: 5000,
        position: toast.POSITION.TOP_CENTER,
        type: 'error',
        transition: 'zoom',
        pauseOnHover: false,
      } as ToastOptions)
      return
    }

    const reader = new FileReader()

    reader.onload = (e) => {
      quiz.value.banner = e.target?.result as string
    }

    reader.readAsDataURL(file)
  }
}

const clearGameImage = () => {
  quiz.value.banner = ''
  if (gameImageInput.value) {
    gameImageInput.value = null
  }
}

const handleQuestionImageUpload = (event: Event) => {
  console.log(questionImageInput.value)
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]

    const size = file.size / (1024 * 1024)

    if (size > 2) {
      questionImageInput.value = null
      toast('A fájl mérete túl nagy!\n(Max: 2 MB)', {
        autoClose: 5000,
        position: toast.POSITION.TOP_CENTER,
        type: 'error',
        transition: 'zoom',
        pauseOnHover: false,
      } as ToastOptions)
      return
    }

    const reader = new FileReader()

    reader.onload = (e) => {
      console.log(e.target?.result as string)
      oneQuestion.value.picture = e.target?.result as string
      console.log(e.target?.result)
    }

    reader.readAsDataURL(file)
  }
}

const clearQuestionImage = () => {
  oneQuestion.value.picture = ''
  if (questionImageInput.value) {
    questionImageInput.value = null
  }
}

const addQuestion = () => {
  if (quiz.value.cards.length < 10) {
    quiz.value.cards.push({
      question: oneQuestion.value.question,
      type: oneQuestion.value.type,
      answers: oneQuestion.value.answers,
      picture: oneQuestion.value.picture,
      correct_answer_index: oneQuestion.value.correct_answer_index - 1,
    })

    oneQuestion.value.picture = ''
    if (questionImageInput.value) {
      questionImageInput.value!.value = ''
    }
    oneQuestion.value.answers = oneQuestion.value.type == 'normal' ? ['', '', '', ''] : ['', '']
    oneQuestion.value.correct_answer_index = 0
    oneQuestion.value.question = ''
    oneQuestion.value.type = 'normal'
  } else {
    toast('Maximum 10 kérdést tartalmazhat egy quiz!', {
      autoClose: 5000,
      position: toast.POSITION.TOP_CENTER,
      type: 'info',
      transition: 'zoom',
      pauseOnHover: false,
    } as ToastOptions)
  }
}

const handleQuestionRemove = (index: number) => {
  quiz.value.cards.splice(index, 1)
}

const handleQuestionModify = (index: number) => {
  const res = quiz.value.cards[index]
  oneQuestion.value = {
    question: res.question,
    type: res.type as 'twochoice' | 'normal',
    answers: res.answers,
    picture: res.picture,
    correct_answer_index: res.correct_answer_index,
  }
  handleQuestionRemove(index)
}

const handleQuizyUpload = async () => {
  await nextTick()
  console.log(quiz.value)
  isLoading.value = true
  if (isEdit.value) {
    const edit = await clientv1.quizzes.edit[':quizId'].$patch({
      param: { quizId: route.params.uuid.toString() },
      json: {
        quiz: {
          title: quiz.value.title,
          description: quiz.value.description,
          status: quiz.value.status,
          banner: quiz.value.banner,
        },
        cards: quiz.value.cards,
        tags: quiz.value.tags,
        languageISOCodes: quiz.value.languageISOCodes,
      },
    })
    if (edit.status === 200) {
      queryClient.removeQueries({ queryKey: ['userQuizzies'] })
      toast('Quiz sikeresen módosítva!', {
        autoClose: 5000,
        position: toast.POSITION.TOP_CENTER,
        type: 'success',
        transition: 'zoom',
        pauseOnHover: false,
      } as ToastOptions)
      resetInputValues()
    } else {
      const res = await edit.json()
      toast(res.message, {
        autoClose: 5000,
        position: toast.POSITION.TOP_CENTER,
        type: 'error',
        transition: 'zoom',
        pauseOnHover: false,
      } as ToastOptions)
    }
  } else {
    const query = await clientv1.quizzes.publish.$post({
      json: {
        quiz: {
          title: quiz.value.title,
          description: quiz.value.description,
          status: quiz.value.status,
          banner: quiz.value.banner,
        },
        cards: quiz.value.cards,
        tags: quiz.value.tags,
        languageISOCodes: quiz.value.languageISOCodes,
      },
    })
    if (query.status === 201) {
      queryClient.removeQueries({ queryKey: ['userQuizzies'] })
      toast('Sikeres quiz feltöltés!', {
        autoClose: 5000,
        position: toast.POSITION.TOP_CENTER,
        type: 'success',
        transition: 'zoom',
        pauseOnHover: false,
      } as ToastOptions)
      resetInputValues()
    } else {
      const res = await query.json()
      toast(res.message, {
        autoClose: 5000,
        position: toast.POSITION.TOP_CENTER,
        type: 'error',
        transition: 'zoom',
        pauseOnHover: false,
      } as ToastOptions)
    }
  }
  isLoading.value = false
}

const resetObject = <T extends object>(obj: T): T => {
  const newObj = {} as T
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key as keyof T]
      if (typeof value === 'string') {
        newObj[key as keyof T] = '' as T[keyof T]
      } else if (typeof value === 'number') {
        newObj[key as keyof T] = 1 as T[keyof T]
      } else if (typeof value === 'boolean') {
        newObj[key as keyof T] = false as T[keyof T]
      } else if (Array.isArray(value)) {
        newObj[key as keyof T] = [] as T[keyof T]
      } else if (typeof value === 'object' && value !== null) {
        newObj[key as keyof T] = resetObject(value) as T[keyof T]
      }
    }
  }

  return newObj
}

const resetInputValues = () => {
  quiz.value = resetObject(quiz.value)
  oneQuestion.value = resetObject(oneQuestion.value)
}

const isSelectedTag = (tag: string): boolean => {
  return quiz.value.tags.includes(tag)
}

const isSelectedIso = (code: string): boolean => {
  return quiz.value.languageISOCodes.includes(code)
}

watch(
  () => oneQuestion.value.type,
  (newValue: string) => {
    if (newValue === 'normal') {
      oneQuestion.value.answers = ['', '', '', '']
    } else {
      oneQuestion.value.answers = ['Igaz', 'Hamis']
    }
  },
)
</script>

<template>
  <MistBackground />
  <NavBar />
  <Transition appear enter-active-class="transition ease-in-out duration-1000"
    enter-from-class="opacity-0 translate-y-4" enter-to-class="opacity-100 translate-y-0">
    <v-container fluid class="max-h-[80%] flex justify-center items-center">
      <v-row class="mx-auto max-w-7xl p-2 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
        <v-col cols="12" md="4" class="glass-panel">
          <div class="p-6 rounded-lg backdrop-blur-lg text-white first">
            <div class="mb-2">
              <input type="file" ref="gameImageInput" accept=".png,.jpg,.jpeg,.svg" class="hidden"
                @change="handleGameImageUpload" />
              <div
                class="relative rounded-lg border-2 border-dashed border-white/20 overflow-hidden transition-all hover:opacity-75">
                <v-img :src="quiz.banner || '/placeholder.svg?height=200&width=300'" height="200" fit>
                  <template v-slot:placeholder>
                    <div class="flex flex-col items-center justify-center h-full">
                      <CirclePlus @click="$refs.gameImageInput.click()"
                        class="w-30 h-30 rounded-full hover:bg-white hover:text-black transition-all duration-500 cursor-pointer"
                        stroke-width="0.75" />
                    </div>
                  </template>
                </v-img>
                <div v-if="quiz.banner && !quiz.banner.includes('/placeholder')" class="absolute top-2 right-2 rounded-full cursor-pointer transition-all 
                duration-500  w-fit h-fit" @click.stop="clearGameImage">
                  <XButton />
                </div>
              </div>
            </div>

            <v-text-field v-model="quiz.title" label="Cím" variant="outlined" bg-color="rgba(255, 255, 255, 0.1)" />
            <v-select v-model="quiz.status" :items="['draft', 'published', 'requires_review', 'private']"
              label="Quiz láthatósága" variant="outlined" bg-color="rgba(255, 255, 255, 0.1)" item-color="white" />
            <v-textarea v-model="quiz.description" label="Leírás" variant="outlined"
              bg-color="rgba(255, 255, 255, 0.1)" />
            <div
              class="overflow-y-scroll custom-scrollbar flex flex-wrap max-h-24 mb-4 rounded-md border-1 border-white/30 bg-white/10 p-1">
              <label v-for="t in tags" :key="t" class="space-x-2 p-1 rounded max-w-fit">
                <input type="checkbox" :value="t" v-model="quiz.tags" class="hidden" />
                <div
                  class="flex-1 px-3 py-1 rounded-full text-white hover:border-white border-2 border-transparent transition-all duration-100 cursor-pointer"
                  :class="isSelectedTag(t) ? 'bg-green-500 text-white' : 'bg-gray-700 backdrop-blur-md '
                    ">
                  {{ t }}
                </div>
              </label>
            </div>
            <div
              class="overflow-y-scroll custom-scrollbar flex flex-wrap max-h-24 mb-4 rounded-md border-1 border-white/30 p-1 bg-white/10">
              <label v-for="i in isoCodes" :key="i" class="space-x-2 p-1 rounded max-w-fit">
                <input type="checkbox" :value="i" v-model="quiz.languageISOCodes" class="hidden" />
                <div
                  class="flex-1 px-3 py-1 rounded-full text-white hover:border-white border-2 border-transparent transition-all duration-100 cursor-pointer"
                  :class="isSelectedIso(i) ? 'bg-green-500 text-white' : 'bg-gray-700  backdrop-blur-md'
                    ">
                  {{ i }}
                </div>
              </label>
            </div>
            <v-btn block color="success" class="mt-2" @click="handleQuizyUpload">
              <span v-if="isLoading" class="inline-block animate-spin mr-2">
                <svg class="w-5 h-5" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
                    fill="none" />
                  <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </span>
              <span v-else class="flex gap-2">
                Quiz feltöltése
                <CloudUpload />
              </span>
            </v-btn>
          </div>
        </v-col>
        <!--Question-->
        <v-col cols="12" md="4" class="glass-panel transition-all duration-500 text-white">
          <div class="p-6 rounded-lg backdrop-blur-lg">
            <div class="mb-2">
              <input type="file" ref="questionImageInput" accept=".png,.jpg,.jpeg,.svg" class="hidden"
                @change="handleQuestionImageUpload" />
              <div
                class="relative rounded-lg border-2 border-dashed border-white/20 overflow-hidden transition-all hover:opacity-75">
                <v-img :src="oneQuestion.picture || '/placeholder.svg?height=200&width=300'" height="200" fit>
                  <template v-slot:placeholder>
                    <div class="flex flex-col items-center justify-center h-full">
                      <CirclePlus @click="$refs.questionImageInput.click()"
                        class="w-30 h-30 rounded-full hover:bg-white hover:text-black transition-all duration-500 cursor-pointer"
                        stroke-width="0.75" />
                    </div>
                  </template>
                </v-img>
                <div v-if="oneQuestion.picture && !oneQuestion.picture.includes('/placeholder')"
                  class="absolute top-2 right-2 p-1 rounded-full cursor-pointer" @click.stop="clearQuestionImage">
                  <XButton />
                </div>
              </div>
            </div>

            <v-textarea v-model="oneQuestion.question" label="Kérdés" variant="outlined" class="glass-input"
              bg-color="rgba(255, 255, 255, 0.1)" />
            <v-select v-model="oneQuestion.type" :items="['twochoice', 'normal']" label="Kérdés fajtája"
              variant="outlined" class="glass-input" bg-color="rgba(255, 255, 255, 0.1)" item-color="white" />

            <div>
              <div v-if="oneQuestion.type == 'normal'" class="grid grid-cols-2 gap-2 mb-2">
                <v-text-field v-for="(answer, index) in oneQuestion.answers" :key="index"
                  v-model="oneQuestion.answers[index]" :label="`Válasz ${index + 1}`" variant="outlined"
                  bg-color="rgba(255, 255, 255, 0.1)" />
              </div>
              <div v-else class="grid grid-cols-2 gap-2 mb-2">
                <v-text-field v-for="(answer, index) in oneQuestion.answers" :key="index"
                  v-model="oneQuestion.answers[index]" :placeholder="index == 1 ? 'Hamis' : 'Igaz'" variant="outlined"
                  bg-color="rgba(255, 255, 255, 0.1)" />
              </div>
              <v-text-field v-model="oneQuestion.correct_answer_index" label="Helyes válasz száma" variant="outlined"
                class="glass-input w-full col-span-2" bg-color="rgba(255, 255, 255, 0.1)" type="number" :rules="oneQuestion.type == 'normal'
                  ? [(v) => (v >= 1 && v <= 4) || '1 és 4 között kell lennie!']
                  : [(v) => (v >= 1 && v <= 2) || '1 és 2 között kell lennie!']
                  " min="1" :max="oneQuestion.type == 'normal' ? 4 : 2" />
            </div>

            <v-btn block color="primary" @click="addQuestion"> Kérdés hozzáadása </v-btn>
          </div>
        </v-col>

        <!-- Preview -->
        <v-col cols="12" md="4"
          class="glass-panel text-white max-h-[calc(100vh-50px)] overflow-y-scroll custom-scrollbar">
          <div class="p-6 rounded-lg backdrop-blur-lg bg-white/10">
            <h3 class="text-xl font-semibold mb-2 text-white">Kész kérdések</h3>
            <div class="space-y-4">
              <div v-for="(c, index) in quiz.cards" :key="index"
                class="p-4 rounded-lg bg-white/5 backdrop-blur-sm border-4 border-transparent hover:border-white transition-all duration-500 cursor-pointer"
                @click="handleQuestionModify(index)">
                <XButton @click.stop="handleQuestionRemove(index)"> </XButton>
                <v-img :key="c.picture" :src="c.picture" height="200" fit />
                <p class="text-white/90 mb-2">{{ c.question }}</p>
                <div class="text-blue-300 bg-white/30 w-fit rounded-lg p-1 text-sm">
                  Típus: {{ c.type }}
                </div>
                <div class="flex flex-row flex-wrap gap-2 mt-2">
                  <div v-for="(answer, index) in c.answers" :key="index" class="bg-white/30 rounded-lg text-center p-1">
                    {{ answer }}
                  </div>
                </div>
                <h2 class="text-green-500">Helyes válasz: {{ c.answers[c.correct_answer_index] }}</h2>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </Transition>
</template>

<style scoped>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(155, 155, 155, 0.5);
  border-radius: 20px;
  border: transparent;
}
</style>

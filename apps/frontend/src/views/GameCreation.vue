<script setup lang="ts">
import MistBackground from '@/components/MistBackground.vue'
import NavBar from '@/components/NavBar.vue'
import XButton from '@/components/XButton.vue'
import { ref, watch } from 'vue'
import { CloudUpload, CirclePlus, X } from 'lucide-vue-next'
import { computed } from 'vue'
import { toast, type ToastOptions } from 'vue3-toastify'

interface Question {
  text: string
  type: '2 válaszos' | 'Normál'
  image: string
  answers: string[]
  correctAnswerIndex: number
}

interface Quiz {
  image: string
  title: string
  category: string
  questions: Question[]
}

const gameImageInput = ref<HTMLInputElement | null>(null)
const gameImagePreview = ref<string>('')
const gameTitle = ref<string>('')
const gameCategory = ref<string>('')

const questionImageInput = ref<HTMLInputElement | null>(null)
const questionImagePreview = ref<string>('')
const question = ref<string>('')
const questionType = ref<'2 válaszos' | 'Normál'>('Normál')
const answers = ref<string[]>(questionType.value === '2 válaszos' ? ['', ''] : ['', '', '', ''])
const questionAnswerIndex = ref<number>(0)

const createdQuestions = ref<Question[]>([])

const handleGameImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]

    const size = file.size / (1024 * 1024)

    if (size > 2) {
      gameImageInput.value = null
      toast('A fájl mérete túl nagy!\n(Max: 2 MB)', {
        autoClose: 5000,
        position: toast.POSITION.TOP_CENTER,
        type: 'error',
        transition: 'zoom',
        pauseOnHover: false,
      })
      return
    }

    const reader = new FileReader()

    reader.onload = (e) => {
      gameImagePreview.value = e.target?.result as string
    }

    reader.readAsDataURL(file)
  }
}

const handleQuestionImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]

    const size = file.size / (1024 * 1024)

    if (size > 2) {
      gameImageInput.value = null
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
      questionImagePreview.value = e.target?.result as string
    }

    reader.readAsDataURL(file)
  }
}

const clearGameImage = () => {
  gameImagePreview.value = ''
  if (gameImageInput.value) {
    gameImageInput.value.value = ''
  }
}

const clearQuestionImage = () => {
  questionImagePreview.value = ''
  if (questionImageInput.value) {
    questionImageInput.value.value = ''
  }
}

const addQuestion = () => {
  const temp: Question = {
    text: question.value,
    type: questionType.value,
    image: questionImagePreview.value || '/placeholder.svg?height=100&width=200',
    answers: [...answers.value],
    correctAnswerIndex: questionAnswerIndex.value,
  }

  createdQuestions.value.push(temp)

  question.value = ''

  questionImagePreview.value = ''
  if (questionImageInput.value) {
    questionImageInput.value.value = ''
  }
  answers.value = questionType.value == 'Normál' ? ['', '', '', ''] : ['', '']
}

const handleQuestionRemove = (index: number) => {
  console.log(index + ' index')
  createdQuestions.value.splice(index, 1)
}

const handleQuestionModify = (index: number) => {
  const res: Question = createdQuestions.value[index]
  questionImagePreview.value = res.image
  questionAnswerIndex.value = res.correctAnswerIndex
  answers.value = res.answers
  questionType.value = res.type
  question.value = res.text
  handleQuestionRemove(index)
}

const fullQuiz = computed(
  (): Quiz => ({
    image: gameImagePreview.value,
    title: gameTitle.value,
    category: gameCategory.value,
    questions: createdQuestions.value,
  }),
)

const handleQuizyUpload = async () => {
  console.log(fullQuiz.value)
  resetInputValues()
}

const resetInputValues = () => {
  const firstDiv = document.querySelector('.first')
  const firstInputs = firstDiv!.querySelectorAll('input')
  firstInputs!.forEach((el) => {
    el.value = ''
  })
  gameImagePreview.value = ''
  createdQuestions.value = []
}

watch(questionType, (newValue: string) => {
  if (newValue === 'Normál') {
    answers.value = ['', '', '', '']
  } else {
    answers.value = ['Igaz', 'Hamis']
  }
})
</script>

<template>
  <MistBackground />
  <NavBar />
  <v-container fluid class="max-h-[80%] flex justify-center items-center">
    <v-row
      class="mx-auto max-w-7xl p-2 rounded-xl bg-white/5 backdrop-blur-md border border-white/10"
    >
      <!--"Cover"-->
      <v-col
        cols="12"
        md="4"
        class="glass-panel transition-transform duration-200 ease-in-out hover:transform hover:-translate-y-0.5"
      >
        <div class="p-6 rounded-lg backdrop-blur-lg bg-white/10 text-white first">
          <div class="mb-2">
            <input
              type="file"
              ref="gameImageInput"
              accept=".png,.jpg,.jpeg,.svg"
              class="hidden"
              @change="handleGameImageUpload"
            />
            <div
              class="relative rounded-lg border-2 border-dashed border-white/20 overflow-hidden cursor-pointer transition-all hover:opacity-75"
              @click="$refs.gameImageInput.click()"
            >
              <v-img
                :src="gameImagePreview || '/placeholder.svg?height=200&width=300'"
                height="200"
                cover
              >
                <template v-slot:placeholder>
                  <div class="flex flex-col items-center justify-center h-full">
                    <CirclePlus
                      class="w-30 h-30 rounded-full hover:bg-white hover:text-black transition-all duration-500"
                      stroke-width="0.75"
                    />
                  </div>
                </template>
              </v-img>
              <div
                v-if="gameImagePreview"
                class="absolute top-2 right-2 p-1 rounded-full bg-black/50 cursor-pointer"
                @click.stop="clearGameImage"
              >
                <X class="hover:text-red-600 hover:bg-white rounded-full" />
              </div>
            </div>
          </div>

          <v-text-field
            v-model="gameTitle"
            label="Cím"
            variant="outlined"
            class="mb-2"
            bg-color="rgba(255, 255, 255, 0.1)"
          />

          <v-text-field
            v-model="gameCategory"
            label="Kategória"
            variant="outlined"
            class="glass-input"
            bg-color="rgba(255, 255, 255, 0.1)"
          />
        </div>
        <v-btn block color="success" class="mt-2" @click="handleQuizyUpload">
          Quiz feltöltése <CloudUpload />
        </v-btn>
      </v-col>
      <!--Question-->
      <v-col
        cols="12"
        md="4"
        class="glass-panel transition-transform duration-200 ease-in-out hover:transform hover:-translate-y-0.5 text-white"
      >
        <div class="p-6 rounded-lg backdrop-blur-lg bg-white/10">
          <div class="mb-2">
            <input
              type="file"
              ref="questionImageInput"
              accept=".png,.jpg,.jpeg,.svg"
              class="hidden"
              @change="handleQuestionImageUpload"
            />
            <div
              class="relative rounded-lg border-2 border-dashed border-white/20 overflow-hidden cursor-pointer transition-all hover:opacity-75"
              @click="$refs.questionImageInput.click()"
            >
              <v-img
                :src="questionImagePreview || '/placeholder.svg?height=200&width=300'"
                height="200"
                cover
              >
                <template v-slot:placeholder>
                  <div class="flex flex-col items-center justify-center h-full">
                    <CirclePlus
                      class="w-30 h-30 rounded-full hover:bg-white hover:text-black transition-all duration-500"
                      stroke-width="0.75"
                    />
                  </div>
                </template>
              </v-img>
              <div
                v-if="questionImagePreview"
                class="absolute top-2 right-2 p-1 rounded-full bg-black/50 cursor-pointer"
                @click.stop="clearQuestionImage"
              >
                <X class="hover:text-red-600 hover:bg-white rounded-full" />
              </div>
            </div>
          </div>

          <v-textarea
            v-model="question"
            label="Kérdés"
            variant="outlined"
            class="mb-2 glass-input"
            bg-color="rgba(255, 255, 255, 0.1)"
          />
          <v-select
            v-model="questionType"
            :items="['2 válaszos', 'Normál']"
            label="Kérdés fajtája"
            variant="outlined"
            class="mb-2 glass-input"
            bg-color="rgba(255, 255, 255, 0.1)"
            item-color="white"
          />

          <div>
            <div v-if="questionType == 'Normál'" class="grid grid-cols-2 gap-2 mb-2">
              <v-text-field
                v-for="(answer, index) in answers"
                :key="index"
                v-model="answers[index]"
                :label="`Válasz ${index + 1}`"
                variant="outlined"
                class="glass-input"
                bg-color="rgba(255, 255, 255, 0.1)"
              />
            </div>
            <div v-else class="grid grid-cols-2 gap-2 mb-2">
              <v-text-field
                v-for="(answer, index) in answers"
                :key="index"
                v-model="answers[index]"
                :placeholder="index == 1 ? 'Igaz' : 'Hamis'"
                variant="outlined"
                bg-color="rgba(255, 255, 255, 0.1)"
              />
            </div>
            <v-text-field
              v-model="questionAnswerIndex"
              label="Helyes válasz száma"
              variant="outlined"
              class="glass-input w-full col-span-2"
              bg-color="rgba(255, 255, 255, 0.1)"
              type="number"
              :rules="
                questionType == 'Normál'
                  ? [(v) => (v >= 1 && v <= 4) || '1 és 4 között kell lennie!']
                  : [(v) => (v >= 1 && v <= 2) || '1 és 2 között kell lennie!']
              "
              min="1"
              max="4"
            />
          </div>

          <v-btn block color="primary" @click="addQuestion"> Kérdés hozzáadása </v-btn>
        </div>
      </v-col>

      <!-- Preview -->
      <v-col
        cols="12"
        md="4"
        class="glass-panel transition-transform duration-200 ease-in-out hover:transform hover:-translate-y-0.5 text-white max-h-[calc(100vh-100px)] overflow-y-scroll custom-scrollbar"
      >
        <div class="p-6 rounded-lg backdrop-blur-lg bg-white/10">
          <h3 class="text-xl font-semibold mb-2 text-white">Kész kérdések</h3>
          <div class="space-y-4">
            <div
              v-for="(q, index) in createdQuestions"
              :key="index"
              class="p-4 rounded-lg bg-white/5 backdrop-blur-sm border-4 border-transparent hover:border-white transition-all duration-500"
              @click="handleQuestionModify(index)"
            >
              <XButton
                 @click.stop="handleQuestionRemove(index)" 
              >
              </XButton>
              <v-img :src="q.image" height="100" class="rounded mb-2" cover />
              <p class="text-white/90 mb-2">{{ q.text }}</p>
              <div class="text-blue-300 bg-white/30 w-fit rounded-lg p-1 text-sm">
                Típus: {{ q.type }}
              </div>
              <div class="flex flex-row flex-wrap gap-2 mt-2">
                <div
                  v-for="(answer, index) in q.answers"
                  :key="index"
                  class="bg-white/30 rounded-lg text-center p-1"
                >
                  {{ answer }}
                </div>
              </div>
              <h2 class="text-green-500">
                Helyes válasz: {{ q.answers[q.correctAnswerIndex - 1] }}
              </h2>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
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

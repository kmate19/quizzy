<script setup lang="ts">
import MistBackground from '@/components/MistBackground.vue'
import NavBar from '@/components/NavBar.vue'
import XButton from '@/components/XButton.vue'
import { useRoute } from 'vue-router'
import { ref, watch } from 'vue'
import { CloudUpload, CirclePlus, X } from 'lucide-vue-next'
import { toast, type ToastOptions } from 'vue3-toastify'
import type { quizUpload } from '@/utils/type'
import { useCounterStore } from '@/stores/counter'

const store = useCounterStore()
const route = useRoute()

const tags = store.returnAllTags()
const isoCodes = store.returnIsoCards()

const oneQuestion = ref({
  question: '',
  type: <'2 válaszos' | 'Normál'>('Normál'),
  answers: ['', '', '', ''],
  picture: '/placeholder.svg?height=200&width=300',
  correct_answer_index: 1,
})

const data = ref<quizUpload>({
  title: '',
  description: '',
  status: '',
  banner: '/placeholder.svg?height=200&width=300',
  languages: [],
  tags: [],
  cards: [],
})


watch(
  () => oneQuestion.value.type,
  (newType) => {
    if (newType === '2 válaszos') {
      oneQuestion.value.answers = ['', '']
    } else {
      oneQuestion.value.answers = ['', '', '', '']
    }
    oneQuestion.value.correct_answer_index = 0
  },
  { immediate: true }
)


const gameImageInput = ref<HTMLInputElement | null>(null)
const questionImageInput = ref<HTMLInputElement | null>(null)


const hasUuid = () => {
  const uuid = route?.params?.uuid?.[0]
  if (uuid) {
    const mockCard = store.returnMockCardByUuid(uuid)
    console.log(mockCard)
    if (mockCard) {
      data.value = mockCard
    }
  }
}

hasUuid()

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
      data.value.banner = e.target?.result as string
    }

    reader.readAsDataURL(file)
  }
}

const clearGameImage = () => {
  data.value.banner = ''
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
  data.value.cards.push(
    {
      question: oneQuestion.value.question,
      type: oneQuestion.value.type,
      answers: oneQuestion.value.answers,
      picture: oneQuestion.value.picture,
      correct_answer_index: oneQuestion.value.correct_answer_index-1,
    }
  )

  oneQuestion.value.picture = ''
  if (questionImageInput.value) {
    questionImageInput.value!.value = ''
  }
  oneQuestion.value.answers = oneQuestion.value.type == 'Normál' ? ['', '', '', ''] : ['', '']
  oneQuestion.value.correct_answer_index = 0
}

const handleQuestionRemove = (index: number) => {
  console.log(index + ' index')
  data.value.cards.splice(index, 1)
}

const handleQuestionModify = (index: number) => {
  const res = data.value.cards[index]
  oneQuestion.value = {
    question: res.question,
    type: res.type as '2 válaszos' | 'Normál',
    answers: res.answers,
    picture: res.picture,
    correct_answer_index: res.correct_answer_index,
  };
  handleQuestionRemove(index)
}

const handleQuizyUpload = async () => {
  console.log(data.value)
  resetInputValues()
}

const resetInputValues = () => {
  oneQuestion.value = {
    question: '',
    type: <'2 válaszos' | 'Normál'>('Normál'),
    answers: ['', '', '', ''],
    picture: '/placeholder.svg?height=200&width=300',
    correct_answer_index: 1,
  }
  for (const key in data.value) {
     if (Object.prototype.hasOwnProperty.call(data.value, key)) {
      const typedKey = key as keyof quizUpload;

      if (typeof data.value[typedKey] === 'string') 
      {
        (data.value[typedKey] as string) = '';
      } 
      else if (Array.isArray(data.value[typedKey])) 
      {
        (data.value[typedKey] as []) = [];
      }
    }
  }
}

watch(
  () => oneQuestion.value.type,
  (newValue: string) => {
    if (newValue === 'Normál') {
      oneQuestion.value.answers = ['', '', '', ''];
    } else {
      oneQuestion.value.answers = ['Igaz', 'Hamis'];
    }
  }
);
</script>

<template>
  <MistBackground />
  <NavBar />
  <v-container fluid class="max-h-[80%] flex justify-center items-center">
    <v-row class="mx-auto max-w-7xl p-2 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
      <!--"Cover"-->
      <v-col cols="12" md="4" class="glass-panel">
        <div class="p-6 rounded-lg backdrop-blur-lg text-white first">
          <div class="mb-2">
            <input type="file" ref="gameImageInput" accept=".png,.jpg,.jpeg,.svg" class="hidden"
              @change="handleGameImageUpload" />
            <div
              class="relative rounded-lg border-2 border-dashed border-white/20 overflow-hidden transition-all hover:opacity-75">
              <v-img :src="data.banner || '/placeholder.svg?height=200&width=300'" height="200" fit>
                <template v-slot:placeholder>
                  <div class="flex flex-col items-center justify-center h-full">
                    <CirclePlus @click="$refs.gameImageInput.click()"
                      class="w-30 h-30 rounded-full hover:bg-white hover:text-black transition-all duration-500 cursor-pointer"
                      stroke-width="0.75" />
                  </div>
                </template>
              </v-img>
              <div v-if="data.banner && !data.banner.includes('/placeholder')"
                class="absolute top-2 right-2 rounded-full cursor-pointer transition-all duration-500 hover:bg-white hover:text-red-600 w-fit h-fit"
                @click.stop="clearGameImage">
                <X class="rounded-full" />
              </div>
            </div>
          </div>

          <v-text-field v-model="data.title" label="Cím" variant="outlined" class="mb-2"
            bg-color="rgba(255, 255, 255, 0.1)" />
            <!--innnentol-->
          <v-select v-model="data.tags" :items="tags" label="Kategóriák" variant="outlined" class="glass-input"
            bg-color="rgba(255, 255, 255, 0.1)" multiple chips clearable></v-select>
          <v-select v-model="data.languages" :items="isoCodes" label="Nyelvek" variant="outlined" class="glass-input"
            bg-color="rgba(255, 255, 255, 0.1)" multiple chips clearable></v-select>
            <!--idaig-->
          <v-textarea v-model="data.description" label="Leírás" variant="outlined" class="mb-2 glass-input"
            bg-color="rgba(255, 255, 255, 0.1)" />
        </div>
        <v-btn block color="success" class="mt-2" @click="handleQuizyUpload">
          Quiz feltöltése
          <CloudUpload />
        </v-btn>
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
                class="absolute top-2 right-2 p-1 rounded-full bg-black/50 cursor-pointer"
                @click.stop="clearQuestionImage">
                <X class="hover:text-red-600 hover:bg-white rounded-full" />
              </div>
            </div>
          </div>

          <v-textarea v-model="oneQuestion.question" label="Kérdés" variant="outlined" class="mb-2 glass-input"
            bg-color="rgba(255, 255, 255, 0.1)" />
          <v-select v-model="oneQuestion.type" :items="['2 válaszos', 'Normál']" label="Kérdés fajtája"
            variant="outlined" class="mb-2 glass-input" bg-color="rgba(255, 255, 255, 0.1)" item-color="white" />

          <div>
            <div v-if="oneQuestion.type == 'Normál'" class="grid grid-cols-2 gap-2 mb-2">
              <v-text-field v-for="(answer, index) in oneQuestion.answers" :key="index"
                v-model="oneQuestion.answers[index]" :label="`Válasz ${index + 1}`" variant="outlined"
                class="glass-input" bg-color="rgba(255, 255, 255, 0.1)" />
            </div>
            <div v-else class="grid grid-cols-2 gap-2 mb-2">
              <v-text-field v-for="(answer, index) in oneQuestion.answers" :key="index"
                v-model="oneQuestion.answers[index]" :placeholder="index == 1 ? 'Igaz' : 'Hamis'" variant="outlined"
                bg-color="rgba(255, 255, 255, 0.1)" />
            </div>
            <v-text-field v-model="oneQuestion.correct_answer_index" label="Helyes válasz száma" variant="outlined"
              class="glass-input w-full col-span-2" bg-color="rgba(255, 255, 255, 0.1)" type="number" :rules="oneQuestion.type == 'Normál'
                ? [(v) => (v >= 1 && v <= 4) || '1 és 4 között kell lennie!']
                : [(v) => (v >= 1 && v <= 2) || '1 és 2 között kell lennie!']
                " min="1" :max="oneQuestion.type == 'Normál' ? 4 : 2" />
          </div>

          <v-btn block color="primary" @click="addQuestion"> Kérdés hozzáadása </v-btn>
        </div>
      </v-col>

      <!-- Preview -->
      <v-col cols="12" md="4"
        class="glass-panel text-white max-h-[calc(100vh-100px)] overflow-y-scroll custom-scrollbar">
        <div class="p-6 rounded-lg backdrop-blur-lg bg-white/10">
          <h3 class="text-xl font-semibold mb-2 text-white">Kész kérdések</h3>
          <div class="space-y-4">
            <div v-for="(c, index) in data.cards" :key="index"
              class="p-4 rounded-lg bg-white/5 backdrop-blur-sm border-4 border-transparent hover:border-white transition-all duration-500 cursor-pointer"
              @click="handleQuestionModify(index)">
              <XButton @click.stop="handleQuestionRemove(index)"> </XButton>
              <v-img :src="c.picture" height="100" class="rounded mb-2" fit />
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

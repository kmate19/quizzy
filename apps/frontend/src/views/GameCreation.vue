<script setup lang="ts">
import MistBackground from '@/components/MistBackground.vue'
import NavBar from '@/components/NavBar.vue'
import XButton from '@/components/XButton.vue'
import { ref, watch, onMounted, computed } from 'vue'
import { CloudUpload, CirclePlus } from 'lucide-vue-next'
import { toast, type ToastOptions } from 'vue3-toastify'
import type { quizUpload, Question, Tag, Language } from '@/utils/type'
import { useRoute } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import {
  getQuiz,
  handleQuizyUpload,
  getTags,
  getLanguages,
} from '@/utils/functions/editorFunctions'

const qTypes = ['twochoice', 'normal']
const items = ['draft', 'published', 'requires_review', 'private']

const isTagDropdownOpen = ref(false)
const tagSearchQuery = ref('')
const selectedTags = ref<Tag[]>([])

const { data: allTags } = useQuery({
  queryKey: ['tags'],
  queryFn: getTags,
  staleTime: Infinity,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
})

const filteredTags = computed(() => {
  if (!allTags?.value) {
    return []
  }

  if (!tagSearchQuery.value) {
    return allTags.value
  }
  return allTags.value.filter((tag) =>
    tag.name.toLowerCase().includes(tagSearchQuery.value.toLowerCase()),
  )
})

const toggleTagDropdown = async () => {
  isTagDropdownOpen.value = !isTagDropdownOpen.value
}

const isSelected = (tag: Tag) => {
  return selectedTags.value.some((selectedTag) => selectedTag.name === tag.name)
}

const toggleTagSelection = (tag: Tag) => {
  if (isSelected(tag)) {
    selectedTags.value = selectedTags.value.filter((selectedTag) => selectedTag.name !== tag.name)
  } else {
    selectedTags.value.push(tag)
  }
}

const isLanguageDropdownOpen = ref(false)
const languageSearchQuery = ref('')
const selectedLanguages = ref<Language[]>([])

const { data: allLanguages } = useQuery({
  queryKey: ['languages'],
  queryFn: getLanguages,
  staleTime: Infinity,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
})

const filteredLanguages = computed(() => {
  if (!allLanguages?.value) {
    return []
  }

  if (!languageSearchQuery.value) {
    return allLanguages.value
  }
  return allLanguages.value.filter((lang) =>
    lang.name.toLowerCase().includes(languageSearchQuery.value.toLowerCase()),
  )
})

const toggleLanguageDropdown = () => {
  isLanguageDropdownOpen.value = !isLanguageDropdownOpen.value
    ; (document.querySelector('#languageSearchInput') as HTMLInputElement)?.focus()
}

const isSelectedLanguage = (lang: Language) => {
  return selectedLanguages.value.some((selectedLanguage) => selectedLanguage.name === lang.name)
}

const toggleLanguageSelection = (lang: Language) => {
  if (isSelectedLanguage(lang)) {
    selectedLanguages.value = selectedLanguages.value.filter(
      (selectedLanguage) => selectedLanguage.name !== lang.name,
    )
  } else {
    selectedLanguages.value.push(lang)
  }
}

const route = useRoute()

const isLoading = ref(false)
const isEdit = ref(false)
const isQType = ref(false)
const isOpen = ref(false)
const gameImageInput = ref<HTMLInputElement | null>(null)
const questionImageInput = ref<HTMLInputElement | null>(null)

const oneQuestion = ref<Question>({
  question: '',
  type: <'twochoice' | 'normal'>'normal',
  answers: ['', '', '', ''],
  picture: '/placeholder.svg?height=200&width=300',
  correct_answer_index: 0,
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
    oneQuestion.value.correct_answer_index = 1
  },
  { immediate: true },
)

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

onMounted(async () => {
  isLoading.value = true
  const uuid = route.params.uuid.toString()
  const result = await getQuiz(uuid)
  if (result && !Array.isArray(result) && typeof result === 'object') {
    quiz.value = result.data
    selectedLanguages.value = result.languages
    selectedTags.value = result.data.tags.map((t) => ({ name: t }))
    isEdit.value = result.success
  }
  isLoading.value = false
})

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

function selectItem(item: string) {
  quiz.value.status = item as 'draft' | 'published' | 'requires_review' | 'private'
  isOpen.value = false
  console.log(quiz.value.status)
}

function selectType(item: string) {
  oneQuestion.value.type = item as 'twochoice' | 'normal'
  isQType.value = false
  console.log(oneQuestion.value.type)
}

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

    if (size > 1) {
      questionImageInput.value = null
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
  selectedLanguages.value = []
  selectedTags.value = []
  quiz.value.status = 'published'
}

const uploadOrUpdate = async () => {
  isLoading.value = true
  const uuid = route.params.uuid.toString()
  quiz.value.languageISOCodes = selectedLanguages.value.map((l: Language) => l.iso_code)
  quiz.value.tags = selectedTags.value.map((t: Tag) => t.name)
  const res = await handleQuizyUpload(quiz.value, isEdit.value, uuid)
  if (res === true) {
    resetInputValues()
  }
  isLoading.value = false
}

const tagString = computed(() => {
  return selectedTags.value.map((tag) => tag.name).join(' ')
})

const marqueeDuration = computed(() => {
  const textLength = tagString.value.length;
  const baseDuration = 2; // Base duration in seconds for shorter text
  const lengthFactor = 0.05; // Adjust this factor to control speed scaling

  // Linear scaling: duration increases with length
  let calculatedDuration = baseDuration + (textLength * lengthFactor);

  // Ensure a minimum and maximum duration (optional)
  const minDuration = 1.5; // Minimum duration in seconds
  const maxDuration = 10;  // Maximum duration in seconds
  calculatedDuration = Math.max(minDuration, Math.min(calculatedDuration, maxDuration));

  return `${calculatedDuration}s`; // Return duration as a string with "s"
});
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
                      <CirclePlus @click="gameImageInput?.click()"
                        class="w-30 h-30 rounded-full hover:bg-white hover:text-black transition-all duration-500 cursor-pointer"
                        stroke-width="0.75" />
                    </div>
                  </template>
                </v-img>
                <div v-if="quiz.banner && !quiz.banner.includes('/placeholder')"
                  class="absolute top-2 right-2 rounded-full cursor-pointer transition-all duration-500 w-fit h-fit"
                  @click.stop="clearGameImage">
                  <XButton />
                </div>
              </div>
            </div>
            <div class="flex flex-col mb-2">
              <label for="quizStatus" class="mb-1 text-white font-medium text-xl">
                Láthatóság
              </label>
              <div class="relative inline-block text-left">
                <button @click="toggleDropdown"
                  class="bg-white/10 backdrop-blur-md text-white rounded px-3 py-2 inline-flex items-center justify-between w-full border-1 border-white/30">
                  <span>{{ quiz.status }}</span>
                  <svg class="ml-2 h-5 w-5 transform transition-transform duration-300"
                    :class="{ 'rotate-180': isOpen }" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <transition enter-active-class="transition ease-out duration-300" enter-from-class="opacity-0"
                  enter-to-class="opacity-100" leave-active-class="transition ease-in duration-300"
                  leave-from-class="opacity-100" leave-to-class="opacity-0">
                  <div v-if="isOpen"
                    class="z-50 absolute mt-2 w-full origin-top-right rounded-md shadow-lg bg-gray-500 backdrop-blur-3xl transition-all duration-300">
                    <div class="py-1">
                      <div v-for="item in items" :key="item" @click="selectItem(item)"
                        class="cursor-pointer text-white px-4 py-2 hover:scale-105 transition-all duration-300 bg-">
                        {{ item }}
                      </div>
                    </div>
                  </div>
                </transition>
              </div>
            </div>
            <div class="flex flex-col mb-2">
              <div class="relative inline-block text-left w-full">
                <button @click="toggleTagDropdown"
                  class="relative w-full bg-white/10 backdrop-blur-md text-white rounded px-3 py-2 inline-flex items-center justify-between border border-white/30 overflow-hidden whitespace-nowrap">
                  <div class="flex-1 overflow-hidden marquee-container">
                    <div class="marquee-content" :class="{ 'animate-marquee': selectedTags.length > 2 }"
                      :style="{ '--marquee-duration': marqueeDuration }">
                      <!-- Bind dynamic duration -->
                      <div v-if="selectedTags.length > 2" class="marquee-text">{{ tagString }}</div>
                      <div class="marquee-text">{{ tagString }}</div>
                    </div>
                  </div>
                  <svg class="ml-2 h-5 w-5 transform transition-transform duration-300 flex-shrink-0"
                    :class="{ 'rotate-180': isTagDropdownOpen }" xmlns="http://www.w3.org/2000/svg" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <transition enter-active-class="transition ease-out duration-300" enter-from-class="opacity-0"
                  enter-to-class="opacity-100" leave-active-class="transition ease-in duration-300"
                  leave-from-class="opacity-100" leave-to-class="opacity-0">
                  <div v-if="isTagDropdownOpen"
                    class="z-50 absolute mt-2 w-full origin-top-right rounded-md shadow-lg bg-gray-500 backdrop-blur-3xl transition-all duration-300 max-h-72 h-fit overflow-y-scroll custom-scrollbar">
                    <div class="py-1">
                      <input v-model="tagSearchQuery" type="text" placeholder="Keresés..." id="tagSearchInput"
                        class="w-full px-4 py-2 rounded text-black bg-white/80 backdrop-blur-md focus:outline-none ml-1" />

                      <template v-if="allTags && allTags.length > 0">
                        <div v-for="tag in filteredTags" :key="tag.name" class="px-3 py-1">
                          <input type="checkbox" :id="tag.name" :value="tag" :checked="isSelected(tag)"
                            @change="toggleTagSelection(tag)" class="opacity-0 absolute" />
                          <label :for="tag.name"
                            class="cursor-pointer w-full transition-all duration-300 border-2 border-transparent rounded-lg flex justify-center items-center hover:scale-105"
                            :class="isSelected(tag)
                                ? 'text-green-400 hover:border-green-400'
                                : 'text-white hover:border-white'
                              ">
                            {{ tag.name }}
                          </label>
                        </div>
                      </template>
                      <div v-if="filteredTags.length === 0"
                        class="px-4 py-2 text-white flex justify-center items-center">
                        Nincs találat.
                      </div>
                    </div>
                  </div>
                </transition>
              </div>
            </div>
            <div class="flex flex-col mb-2">
              <div class="relative inline-block text-left w-full">
                <button @click="toggleLanguageDropdown"
                  class="bg-white/10 backdrop-blur-md text-white rounded px-3 py-2 inline-flex items-center justify-between w-full border-1 border-white/30">
                  <span>
                    {{
                      selectedLanguages.length > 0
                        ? selectedLanguages.map((lang) => lang.name).join(', ')
                        : 'Válassz nyelveket'
                    }}
                  </span>
                  <svg class="ml-2 h-5 w-5 transform transition-transform duration-300"
                    :class="{ 'rotate-180': isLanguageDropdownOpen }" xmlns="http://www.w3.org/2000/svg" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <transition enter-active-class="transition ease-out duration-300" enter-from-class="opacity-0"
                  enter-to-class="opacity-100" leave-active-class="transition ease-in duration-300"
                  leave-from-class="opacity-100" leave-to-class="opacity-0">
                  <div v-if="isLanguageDropdownOpen"
                    class="z-50 absolute mt-2 w-full origin-top-right rounded-md shadow-lg bg-gray-500 backdrop-blur-3xl transition-all duration-300 max-h-72 h-fit overflow-y-scroll custom-scrollbar">
                    <div class="py-1">
                      <input v-model="languageSearchQuery" type="text" placeholder="Keresés..." id="languageSearchInput"
                        class="w-full px-4 py-2 rounded text-black bg-white/80 backdrop-blur-md focus:outline-none ml-1" />

                      <template v-if="allLanguages && allLanguages.length > 0">
                        <div v-for="lang in filteredLanguages" :key="lang.name" class="px-3 py-1">
                          <input type="checkbox" :id="lang.name" :value="lang" :checked="isSelectedLanguage(lang)"
                            @change="toggleLanguageSelection(lang)" class="opacity-0 absolute" />
                          <label :for="lang.name"
                            class="cursor-pointer w-full transition-all duration-300 border-2 border-transparent rounded-lg flex justify-center items-center hover:scale-105"
                            :class="isSelectedLanguage(lang)
                                ? 'text-green-400 hover:border-green-400'
                                : 'text-white hover:border-white'
                              ">
                            {{ lang.name }} | {{ lang.support }} | {{ lang.icon }}
                          </label>
                        </div>
                      </template>
                      <div v-if="filteredLanguages.length === 0"
                        class="px-4 py-2 text-white flex justify-center items-center">
                        Nincs találat.
                      </div>
                    </div>
                  </div>
                </transition>
              </div>
            </div>
            <v-text-field v-model="quiz.title" label="Cím" variant="outlined" bg-color="rgba(255, 255, 255, 0.1)" />
            <v-textarea v-model="quiz.description" label="Leírás" variant="outlined"
              bg-color="rgba(255, 255, 255, 0.1)" />
            <v-btn block color="success" class="mt-2" @click="uploadOrUpdate">
              <span v-if="isLoading" class="inline-block animate-spin mr-2">
                <svg class="w-5 h-5" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
                    fill="none" />
                  <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </span>
              <span v-else class="flex gap-2">
                Quiz {{ isEdit ? 'módosítása' : 'feltöltése' }}
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
                      <CirclePlus @click="questionImageInput?.click()"
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

            <div class="flex flex-col mb-2">
              <label for="questionStatus" class="mb-1 text-white font-medium text-xl">
                Kérdés fajtája
              </label>
              <div class="relative inline-block text-left">
                <button @click="isQType = !isQType"
                  class="bg-white/10 backdrop-blur-md text-white rounded px-3 py-2 inline-flex items-center justify-between w-full border-1 border-white/30">
                  <span>{{ oneQuestion.type }}</span>
                  <svg class="ml-2 h-5 w-5 transform transition-transform duration-200"
                    :class="{ 'rotate-180': isQType }" xmlns="http://www.w3.org/2000/svg" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <transition enter-active-class="transition ease-out duration-300" enter-from-class="opacity-0"
                  enter-to-class="opacity-100" leave-active-class="transition ease-in duration-300"
                  leave-from-class="opacity-100" leave-to-class="opacity-0">
                  <div v-if="isQType"
                    class="z-50 absolute mt-2 w-full origin-top-right rounded-md shadow-lg bg-gray-500 backdrop-blur-3xl transition-all duration-300">
                    <div class="py-1">
                      <div v-for="type in qTypes" :key="type" @click="selectType(type)"
                        class="cursor-pointer text-white px-4 py-2 hover:scale-105 transition-all duration-300 bg-">
                        {{ type }}
                      </div>
                    </div>
                  </div>
                </transition>
              </div>
            </div>

            <v-textarea v-model="oneQuestion.question" label="Kérdés" variant="outlined" class="glass-input"
              bg-color="rgba(255, 255, 255, 0.1)" />

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
                class="glass-input w-full col-span-2" bg-color="!rgba(0, 0, 0, 0)" type="number" :rules="oneQuestion.type == 'normal'
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
                <h2 class="text-green-500">
                  Helyes válasz: {{ c.answers[c.correct_answer_index] }}
                </h2>
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

@keyframes marquee {
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-50%);
  }
}

.animate-marquee {
  animation: marquee var(--marquee-duration) linear infinite; 
  width: fit-content;
  min-width: 100%;
}

.marquee-container {
  overflow: hidden;
}

.marquee-content {
  display: flex;
  width: fit-content;
  min-width: 100%;
}

.marquee-text {
  white-space: nowrap;
  padding-right: 1em;
}
</style>

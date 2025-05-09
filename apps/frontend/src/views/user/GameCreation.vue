<script setup lang="ts">
import PreviewQuestion from '@/components/PreviewQuestion.vue'
import XButton from '@/components/XButton.vue'
import { ref, watch, onMounted, computed } from 'vue'
import { CloudUpload, CirclePlus } from 'lucide-vue-next'
import { toast, type ToastOptions } from 'vue3-toastify'
import type { quizUpload, cardType, Tag, Language, nonemptyCardArray } from '@/utils/type'
import { useRoute } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { getQuiz, handleQuizyUpload } from '@/utils/functions/editorFunctions'
import { getTags, getLanguages } from '@/utils/functions/metaFunctions'
import router from '@/router'
import draggable from 'vuedraggable'

const qTypes = ['twochoice', 'normal']
const eitems = ['draft', 'published', 'private']
const mItems = ['vázlat', 'publikus', 'privát']

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
const isEdit = computed(() => route.params.uuid !== undefined && route.params.uuid !== '')
const isQType = ref(false)
const isOpen = ref(false)
const gameImageInput = ref<HTMLInputElement | null>(null)
const questionImageInput = ref<HTMLInputElement | null>(null)

const oneQuestion = ref<cardType>({
  question: '',
  type: <'twochoice' | 'normal'>'normal',
  answers: ['', '', '', ''],
  picture: '',
  correct_answer_index: 0,
})

const quiz = ref<quizUpload>({
  title: '',
  description: '',
  status: <'draft' | 'published' | 'requires_review' | 'private'>'draft',
  banner: '',
  languageISOCodes: [] as unknown as [string, ...string[]],
  tags: [] as unknown as [string, ...string[]],
  cards: [] as unknown as nonemptyCardArray,
})

const hasAnswers = ref(false)

watch(
  () => oneQuestion.value.type,
  (newType) => {
    if(!hasAnswers.value){
      if (newType === 'twochoice') {
        oneQuestion.value.answers = ['Igaz', 'Hamis']
      } else if(newType === 'normal') {
        oneQuestion.value.answers = ['', '', '', '']
      }
      oneQuestion.value.correct_answer_index = 1
    }
  },
  {
    flush: 'sync',
  },
)



onMounted(async () => {
  const editSuccess = localStorage.getItem('quizEditSuccess')
  if (editSuccess === 'true') {
    toast('Quiz sikeresen módosítva!', {
      autoClose: 5000,
      position: toast.POSITION.TOP_CENTER,
      type: 'success',
      transition: 'zoom',
      pauseOnHover: false,
    })
  }
  localStorage.removeItem('quizEditSuccess')
  isLoading.value = true
  const uuid = route.params.uuid.toString()
  if (isEdit.value) {
    const result = await getQuiz(uuid)
    if (result && !Array.isArray(result) && typeof result === 'object') {
      const data = result.data
      quiz.value = {
        title: data.title,
        description: data.description,
        status: data.status,
        banner: data.banner,
        languageISOCodes:
          data.languageISOCodes && data.languageISOCodes.length > 0
            ? (data.languageISOCodes as [string, ...string[]])
            : [] as unknown as [string, ...string[]],
        tags: data.tags && data.tags.length > 0 ? (data.tags as [string, ...string[]]) : [] as unknown as [string, ...string[]],
        cards: data.cards as nonemptyCardArray,
      }

      selectedLanguages.value = result.languages
      selectedTags.value = data.tags.map((t) => ({ name: t }))
    }
  }
  isLoading.value = false
})

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

function selectItem(index: number) {
  const status = eitems[index]
  quiz.value.status = status as 'draft' | 'published' | 'requires_review' | 'private'
  isOpen.value = false
}

function selectType(item: string) {
  oneQuestion.value.type = item as 'twochoice' | 'normal'
  isQType.value = false
}

const handleGameImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]

    const size = file.size / (1024 * 1024)

    const isValidFileType = file.type === 'image/jpeg' || file.type === 'image/png'
    if (!isValidFileType) {
      toast('Csak JPG és PNG fájlok engedélyezettek!', {
        autoClose: 5000,
        position: toast.POSITION.TOP_CENTER,
        type: 'error',
        transition: 'zoom',
        pauseOnHover: false,
      })
      return
    }

    if (size > 1) {
      if (gameImageInput.value) {
        gameImageInput.value.value = ''
      }

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
    const input = gameImageInput.value
    input.type = ''
    input.type = 'file'
  }
}

const handleQuestionImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]

    const size = file.size / (1024 * 1024)

    const isValidFileType = file.type === 'image/jpeg' || file.type === 'image/png'
    if (!isValidFileType) {
      toast('Csak JPG és PNG fájlok engedélyezettek!', {
        autoClose: 5000,
        position: toast.POSITION.TOP_CENTER,
        type: 'error',
        transition: 'zoom',
        pauseOnHover: false,
      })
      return
    }

    if (size > 1) {
      if (questionImageInput.value) {
        questionImageInput.value.value = ''
      }

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
      oneQuestion.value.picture = e.target?.result as string
    }

    reader.readAsDataURL(file)
  }
}

const clearQuestionImage = () => {
  oneQuestion.value.picture = ''
  if (questionImageInput.value) {
    const input = questionImageInput.value
    input.type = ''
    input.type = 'file'
  }
}

const resetQuestion = () => {
  const currentType = oneQuestion.value.type

  oneQuestion.value = resetObject(oneQuestion.value)

  oneQuestion.value.type = currentType

  if (currentType === 'twochoice') {
    oneQuestion.value.answers = ['Igaz', 'Hamis']
  } else {
    oneQuestion.value.answers = ['', '', '', '']
  }
}

const addQuestion = async () => {
  const { msg, valid } = validateCard()
  if (valid) {
    quiz.value.cards.push({
      question: oneQuestion.value.question,
      type: oneQuestion.value.type,
      answers: oneQuestion.value.answers,
      picture: oneQuestion.value.picture,
      correct_answer_index: oneQuestion.value.correct_answer_index - 1,
    })

    hasAnswers.value = false
    resetQuestion()
  } else {
    toast(msg, {
      autoClose: 5000,
      position: toast.POSITION.TOP_CENTER,
      type: 'error',
      transition: 'zoom',
      pauseOnHover: false,
    } as ToastOptions)
  }
}

const handleQuestionRemove = (index: number) => {
  quiz.value.cards.splice(index, 1)
}

const handleQuestionModify = (index: number) => {
  hasAnswers.value = true
  const res = quiz.value.cards[index]
  console.log(res)
  oneQuestion.value = {
    question: res.question,
    type: res.type as 'twochoice' | 'normal',
    answers: res.answers,
    picture: res.picture,
    correct_answer_index: res.correct_answer_index + 1,
  }
  handleQuestionRemove(index)
}

const resetObject = <T extends object>(obj: T): T => {
  const newObj = {} as T

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key as keyof T]

      if (key === 'type' && (value === 'normal' || value === 'twochoice')) {
        newObj[key as keyof T] = 'normal' as T[keyof T]
      } else if (typeof value === 'string') {
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
  console.log(newObj)
  return newObj
}

const validateCard = () => {
  if (oneQuestion.value.picture.trim() === '') {
    return { valid: false, msg: 'Kérlek adj egy képet a kérdéshez!' }
  }

  if (!oneQuestion.value.question.trim()) {
    return { valid: false, msg: 'Kérlek adj kérdést a kártyához!' }
  }

  if (quiz.value.cards.length >= 10) {
    return { valid: false, msg: 'A quiz nem tartalmazhat több mint 10 kártyát!' }
  }

  if (oneQuestion.value.type === 'twochoice') {
    const hasValidAnswers = oneQuestion.value.answers.length === 2
    if (
      !hasValidAnswers ||
      oneQuestion.value.correct_answer_index < 0 ||
      oneQuestion.value.correct_answer_index > 2
    ) {
      return { valid: false, msg: 'Kérlek, válassz érvényes válaszokat és a helyes választ!' }
    }
  } else if (oneQuestion.value.type === 'normal') {
    const hasAllAnswers = oneQuestion.value.answers.every((answer) => answer.trim() !== '')
    if (
      !hasAllAnswers ||
      oneQuestion.value.correct_answer_index < 1 ||
      oneQuestion.value.correct_answer_index > 4
    ) {
      return {
        valid: false,
        msg: 'Kérlek, töltsd ki az összes választ és válassz egy helyes választ!',
      }
    }
  }

  return { valid: true, msg: '' }
}

const validateCards = () => {
  let error = ''
  quiz.value.cards.every((card) => {
    if (!card.question || !card.picture) {
      error = 'Minden kártyának rendelkeznie kell kérdéssel és borítóképel is!'
      return { valid: false, msg: error }
    }

    if (card.type === 'normal') {
      const hasAllAnswers = card.answers.every((answer) => answer !== '')
      const hasCorrectAnswer = card.correct_answer_index !== undefined

      if (!hasAllAnswers || !hasCorrectAnswer) {
        error =
          'Minden normál típusú kártyának rendelkeznie kell kitöltött válaszokkal és kijelölt helyes válasszal!'
        return { valid: false, msg: error }
      }
    }

    return { valid: false, msg: '' }
  })

  return { valid: error === '', msg: error }
}

const validateQuizFields = () => {
  let error = ''

  if (!quiz.value.title || !quiz.value.description || !quiz.value.banner) {
    error = 'Kérlek, töltsd ki a címet, leírást és a boríróképet is!'
    return { valid: false, msg: error }
  }

  if (!(selectedTags.value.length > 0)) {
    error = 'Kérlek, válassz legalább egy kategóriát!'
    return { valid: false, msg: error }
  }

  if (!(selectedLanguages.value.length > 0)) {
    error = 'Kérlek, válassz legalább egy nyelvet!'
    return { valid: false, msg: error }
  }

  if (quiz.value.cards.length === 0) {
    error = 'Minden quiznek legalább egy kérdést kell tartalmaznia!'
    return { valid: false, msg: error }
  }

  if (validateCards().valid === false) {
    error = validateCards().msg
    return { valid: false, msg: error }
  }

  return { valid: true, msg: '' }
}

const uploadOrUpdate = async () => {
  const validationResult = validateQuizFields()
  if (!validationResult.valid) {
    toast(validationResult.msg, {
      autoClose: 5000,
      position: toast.POSITION.TOP_CENTER,
      type: 'error',
      transition: 'zoom',
      pauseOnHover: false,
    } as ToastOptions)
    return
  }

  isLoading.value = true
  const uuid = route.params.uuid?.toString()
  const mappedCodes = selectedLanguages.value.map((l) => l.iso_code)
  quiz.value.languageISOCodes = mappedCodes as [string, ...string[]]
  const mappedTags = selectedTags.value.map((t) => t.name)
  quiz.value.tags = mappedTags as [string, ...string[]]
  const res = await handleQuizyUpload(quiz.value, isEdit.value, uuid)

  console.log(res)

  if (res == true) {
    oneQuestion.value.type = 'normal'
    quiz.value = resetObject(quiz.value)
    quiz.value.status = "draft"
    selectedLanguages.value = []
    selectedTags.value = []
    resetQuestion()
    console.log('Quiz successfully uploaded!')
    console.log(quiz.value)
    console.log(oneQuestion.value)

    if (isEdit.value) {
      localStorage.setItem('quizEditSuccess', 'true')
    }
    router.push('/game_creation')
  }

  isLoading.value = false
}


const tagString = computed(() => {
  return selectedTags.value.map((tag) => tag.name).join(' ')
})

const marqueeDuration = computed(() => {
  const textLength = tagString.value.length
  const baseDuration = 2
  const lengthFactor = 0.05

  let calculatedDuration = baseDuration + textLength * lengthFactor

  const minDuration = 1.5
  const maxDuration = 10
  calculatedDuration = Math.max(minDuration, Math.min(calculatedDuration, maxDuration))

  return `${calculatedDuration}s`
})

</script>

<template>
  <Transition appear enter-active-class="transition ease-in-out duration-1000"
    enter-from-class="opacity-0 translate-y-4" enter-to-class="opacity-100 translate-y-0">
    <v-container fluid class="max-h-[80%] flex justify-center items-center">
      <v-row
        class="mx-auto w-full max-w-7xl p-2 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 flex justify-center items-center">
        <v-col cols="12" md="4" class="glass-panel !sm:max-w-[94vw] lg:!w-[20vw]">
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
                  class="bg-white/10 backdrop-blur-md text-white rounded px-3 py-2 inline-flex items-center justify-between w-full border-1 border-white/30
                  cursor-pointer">
                  <span>{{ mItems[eitems.indexOf(quiz.status)] }}</span>
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
                    <div class="py-1" v-click-outside="() => (isOpen = false)">
                      <div v-for="(item, index) in mItems" :key="item" @click="selectItem(index)"
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
                <button @click="toggleTagDropdown" class="relative w-full bg-white/10 backdrop-blur-md text-white rounded px-3
                  py-2 inline-flex items-center justify-between border
                   border-white/30 overflow-hidden whitespace-nowrap cursor-pointer">
                  <div v-if="selectedTags.length > 0" class="flex-1 overflow-hidden max-w-full">
                    <div class="overflow-x-hidden">
                      <div class="flex w-fit" :class="{ 'animate-marquee': selectedTags.length > 2 }"
                        :style="{ '--marquee-duration': marqueeDuration }">
                        <div v-if="selectedTags.length > 2" class="marquee-text">
                          {{ tagString }}
                        </div>
                        <div class="marquee-text">{{ tagString }}</div>
                      </div>
                    </div>
                  </div>
                  <div v-else>Válassz kategóriákat</div>
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
                    class="z-50 absolute mt-2 w-full origin-top-right rounded-md shadow-lg bg-gray-500 backdrop-blur-3xl transition-all duration-300 max-h-72 h-fit overflow-y-auto ">
                    <div class="py-1" v-click-outside="() => (isTagDropdownOpen = false)">
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
                  class="bg-white/10 backdrop-blur-md text-white rounded px-3 py-2 inline-flex items-center justify-between w-full border-1 border-white/30
                  cursor-pointer">
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
                    class="z-50 absolute mt-2 w-full origin-top-right rounded-md shadow-lg bg-gray-500 backdrop-blur-3xl transition-all duration-300 max-h-72 h-fit overflow-y-auto ">
                    <div class="py-1" v-click-outside="() => (isLanguageDropdownOpen = false)">
                      <input v-model="languageSearchQuery" type="text" placeholder="Keresés..." id="languageSearchInput"
                        class="w-full px-4 py-2 rounded text-black bg-white/80 backdrop-blur-md focus:outline-none ml-1" />

                      <template v-if="allLanguages && allLanguages.length > 0">
                        <div v-for="lang in filteredLanguages" :key="lang.name" class="px-3 py-1">
                          <input type="checkbox" :id="lang.name" :value="lang" :checked="isSelectedLanguage(lang)"
                            @change="toggleLanguageSelection(lang)" class="opacity-0 absolute" />
                          <label :for="lang.name"
                            class="cursor-pointer w-full transition-all duration-300 border-2 border-transparent rounded-lg flex justify-center items-center hover:scale-105 emoji-text"
                            :class="isSelectedLanguage(lang)
                              ? 'text-green-400 hover:border-green-400'
                              : 'text-white hover:border-white'
                              ">
                            {{ lang.name }} | {{ lang.support }} | {{ lang.icon }} |
                            <span class="flag-wrapper"> </span>
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
            <v-text-field v-model="quiz.title" label="Cím" variant="outlined" bg-color="rgba(255, 255, 255, 0.1)"
              counter="24" :rules="[(v) => v.length <= 24]" @input="quiz.title = quiz.title.substring(0, 24)" />
            <v-textarea v-model="quiz.description" label="Leírás" variant="outlined" bg-color="rgba(255, 255, 255, 0.1)"
              color="white" counter="255" :rules="[(v) => v.length <= 255]"
              @input="quiz.description = quiz.description.substring(0, 255)" />
            <v-btn block color="success" class="mt-2 cursor-pointer" @click="uploadOrUpdate" :disabled="isLoading">
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
        <v-col cols="12" md="4"
          class="glass-panel transition-all duration-500 text-white !max-w-[94vw] lg:!max-w-[35vw]">
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
                  class="bg-white/10 backdrop-blur-md text-white rounded px-3 py-2 inline-flex items-center justify-between w-full border-1 border-white/30
                  cursor-pointer">
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
                    <div class="py-1" v-click-outside="() => (isQType = false)">
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
              bg-color="rgba(255, 255, 255, 0.1)" counter="255" :rules="[(v) => v.length <= 255]" 
              @input="oneQuestion.question = oneQuestion.question.substring(0,255)"/>
            <div>
              <div v-if="oneQuestion.type === 'normal'" :key="oneQuestion.type + 'normal'">
                <div class="grid grid-cols-2 gap-2 mb-2">
                  <v-text-field v-for="(answer, index) in oneQuestion.answers" :key="`normal-${index}`"
                    v-model="oneQuestion.answers[index]" :label="`Válasz ${index + 1}`" variant="outlined"
                    bg-color="rgba(255, 255, 255, 0.1)" counter="255" :rules="[(v) => v.length <= 255]"
                    @input="oneQuestion.answers[index] = oneQuestion.answers[index].substring(0, 255)"/>
                </div>
              </div>
              <div v-else-if="oneQuestion.type === 'twochoice'" :key="oneQuestion.type + 'twochoice'">
                <div class="grid grid-cols-2 gap-2 mb-2">
                  <v-text-field v-for="(answer, index) in oneQuestion.answers" :key="`twochoice-${index}`"
                    v-model="oneQuestion.answers[index]" :placeholder="index === 0 ? 'Igaz' : 'Hamis'"
                    variant="outlined" bg-color="rgba(255, 255, 255, 0.1)" counter="255" :rules="[(v) => v.length <= 255]"
                    @input="oneQuestion.answers[index] = oneQuestion.answers[index].substring(0, 255)"/>
                </div>
              </div>
              <v-text-field v-model="oneQuestion.correct_answer_index" label="Helyes válasz száma" variant="outlined"
                class="glass-input w-full col-span-2" bg-color="!rgba(0, 0, 0, 0)" type="number" @change="
                  oneQuestion.correct_answer_index = Math.min(
                    Math.max(oneQuestion.correct_answer_index, 1),
                    oneQuestion.type == 'normal' ? 4 : 2,
                  )
                  " :rules="oneQuestion.type == 'normal'
                    ? [(v) => (v >= 1 && v <= 4) || '1 és 4 között kell lennie!']
                    : [(v) => (v >= 1 && v <= 2) || '1 és 2 között kell lennie!']
                    " min="1" :max="oneQuestion.type == 'normal' ? 4 : 2" />
            </div>
            <v-btn block color="primary" @click="addQuestion" :disabled="isLoading" class="cursor-pointer"> Kérdés hozzáadása </v-btn>
          </div>
        </v-col>
        <v-col cols="12" md="4" class="glass-panel text-white !max-w-[94vw] lg:!max-w-[35vw]">
          <transition name="height-fade">
            <div v-if="quiz.cards.length"
              class="p-6 rounded-lg backdrop-blur-lg bg-white/10 overflow-hidden h-[calc(100vh-15vh)] flex flex-col">
              <div class="flex flex-row items-center">
                <h3 class="text-xl font-semibold mb-2 text-white">Kész kérdések: </h3>
                <h3 class="text-xl font-semibold mb-2 text-white">{{ quiz.cards.length }}</h3>
              </div>
              <div class="space-y-4 overflow-y-auto flex-1 p-2">
                <draggable v-model="quiz.cards" 
                  group="cards" 
                  item-key="cards" 
                  class="gap-2 flex flex-col"
                  :delay="150"
                  :delayOnTouchOnly="true"
                  :touchStartThreshold="10"
                  :animation="200">
                  <template #item="{ element: card, index }">
                    <PreviewQuestion :question="card" :index="index" :handleQuestionRemove="handleQuestionRemove"
                      :handleQuestionEdit="handleQuestionModify" />
                  </template>
                </draggable>
              </div>
            </div>
          </transition>
        </v-col>
      </v-row>
    </v-container>
  </Transition>
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

/* Sortable drag and drop styles */
.sortable-ghost {
  opacity: 0.5;
  background: rgba(75, 85, 99, 0.4);
  border: 2px dashed rgba(255, 255, 255, 0.5) !important;
}

.sortable-chosen {
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
  border: 2px solid rgba(59, 130, 246, 0.5) !important;
  z-index: 10;
  transform: scale(1.02);
}

.sortable-drag {
  opacity: 0.9;
  transform: rotate(2deg) scale(1.05);
  z-index: 999;
}

.sortable-fallback {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  border-radius: 0.5rem;
}

/* Animation when a question is being moved to indicate where it will be placed */
@keyframes pulse-border {

  0%,
  100% {
    border-color: rgba(255, 255, 255, 0.3);
  }

  50% {
    border-color: rgba(59, 130, 246, 0.7);
  }
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

.marquee-text {
  white-space: nowrap;
  padding-right: 1em;
}


.emoji-text {
  font-family: 'Segoe UI', 'Noto Color Emoji', sans-serif;
}

.height-fade-enter-active,
.height-fade-leave-active {
  transition:
    max-height 0.5s ease-in-out,
    opacity 0.5s ease-in-out;
}

.height-fade-enter-from,
.height-fade-leave-to {
  max-height: 0;
  opacity: 0;
}

.height-fade-enter-to,
.height-fade-leave-from {
  max-height: calc(100vh - 15vh);
  opacity: 1;
}
</style>

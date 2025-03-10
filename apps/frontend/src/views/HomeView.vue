<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { Loader2Icon, Search } from 'lucide-vue-next'
import CategoriesButton from '@/components/CategoriesBtn.vue'
import QuizCard from '@/components/QuizCard.vue'
import type { quizCardView } from '@/utils/type'
import { getQuizzes } from '@/utils/functions/homeFuncitions'
import { useRoute } from 'vue-router'
import { toast, type ToastContainerOptions } from 'vue3-toastify'


const route = useRoute()
const quizzes = ref<quizCardView[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const isExpanded = ref(false)
const searchContainer = ref<HTMLElement | null>(null)
const searchText = ref('')
const strict = ref(false)
const tags = ref<string[]>([])
const languages = ref<string[]>([])
const currentPage = ref(1)
const limit = ref(10) // minimum 10
const totalPages = ref(0)
const showFullPages = ref(false)

interface FilterPayload {
  tags: string[]
  strictSearch: boolean
  languages: string[]
}

const params: {
  limit?: string
  page?: string
  strict?: string
  tags?: [string, ...string[]]
  languages?: [string, ...string[]]
  searchText?: string
} = {}

const selectParams = () => {
  for (const key in params) {
    delete params[key as keyof typeof params];
  }
  if (limit.value) {
    params.limit = limit.value.toString()
  }
  if (currentPage.value) {
    params.page = currentPage.value.toString()
  }
  if (strict.value === true) {
    params.strict = 'true'
  }
  if (tags.value && tags.value.length > 0) {
    params.tags = tags.value as [string, ...string[]]
  }
  if (languages.value && languages.value.length > 0) {
    params.languages = languages.value as [string, ...string[]]
  }
  if (searchText.value) {
    params.searchText = searchText.value
  }
}

const handleSave = async (payload: FilterPayload) => {
  loading.value = true
  tags.value = payload.tags
  languages.value = payload.languages
  strict.value = payload.strictSearch
  selectParams()
  const res = await getQuizzes(
    params.limit,
    params.page,
    params.strict,
    params.tags,
    params.languages,
    params.searchText
  );
  quizzes.value = res.quizzes
  totalPages.value = Math.ceil(res.totalPages/10)
  loading.value = false
}

const toggleExpand = async () => {
  isExpanded.value = !isExpanded.value
  if (isExpanded.value) {
    await nextTick()
    const inputEl = searchContainer.value?.querySelector('input')
    inputEl?.focus()
  }
}

const debounce = <T extends unknown[]>(func: (...args: T) => void, wait: number) => {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: T) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

const doSearch = async () => {
  loading.value = true
  selectParams()
  const res = await getQuizzes(
    params.limit,
    params.page,
    params.strict,
    params.tags,
    params.languages,
    params.searchText
  );
  quizzes.value = res.quizzes
  totalPages.value = Math.ceil(res.totalPages/10)
  loading.value = false
}

const search = debounce(doSearch, 250)

function onInput() {
  search()
}

const handleBlur = () => {
  isExpanded.value = false
}

const nextPage = async () => {
  if (currentPage.value < totalPages.value) {
    loading.value = true
    currentPage.value++
    selectParams()
  const res = await getQuizzes(
    params.limit,
    params.page,
    params.strict,
    params.tags,
    params.languages,
    params.searchText
  );
    quizzes.value = res.quizzes
    totalPages.value = Math.ceil(res.totalPages/10)
    loading.value = false
  }
}

const prevPage = async () => {
  if (currentPage.value > 1) {
    loading.value = true
    currentPage.value--
    selectParams()
  const res = await getQuizzes(
    params.limit,
    params.page,
    params.strict,
    params.tags,
    params.languages,
    params.searchText
  );
    quizzes.value = res.quizzes
    totalPages.value = Math.ceil(res.totalPages/10)
    loading.value = true
  }
}

const goToPage = async (page: number) => {
  if (page !== currentPage.value) {
    loading.value = true
    currentPage.value = page
    selectParams()
  const res = await getQuizzes(
    params.limit,
    params.page,
    params.strict,
    params.tags,
    params.languages,
    params.searchText
  );
    quizzes.value = res.quizzes
    totalPages.value = Math.ceil(res.totalPages/10)
    loading.value = false
  }
}

const displayedPages = computed<(number | 'ellipsis')[]>(() => {
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 3) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const result: (number | 'ellipsis')[] = [current, 'ellipsis', total]

  return result
})

const totalPagesArray = computed(() => {
  return Array.from({ length: totalPages.value }, (_, i) => i + 1)
})

onMounted(async () => {
  loading.value = true
  selectParams()
  const res = await getQuizzes(
    params.limit,
    params.page,
    params.strict,
    params.tags,
    params.languages,
    params.searchText
  );
  quizzes.value = res.quizzes
  totalPages.value = Math.ceil(res.totalPages / 10)
  const username = route.query.username
  if (username) {
    toast(`Sikeres bejelentkezés!\nÜdvözöljük ${username}!`,{
      autoClose: 3500,
      position: toast.POSITION.TOP_CENTER,
      type: 'success',
      transition: 'zoom',
      pauseOnHover: false,
    }as ToastContainerOptions)
  }
  loading.value = false
})
</script>

<template>
  <div class="home-page">
    <div
      class="max-w-[1200px] mx-auto px-4 py-8 h-[calc(100vh-20vh)] overflow-y-scroll custom-scrollbar bg-gray-800 bg-opacity-80 rounded-md cursor-pointer z-10">
      <div class="flex flex-col md:flex-row justify-between items-center mb-8">
        <div class="flex items-center space-x-4" id="asd">
          <div ref="searchContainer" :class="[
            'relative flex items-center transition-all duration-700 ease-in-out rounded-full border border-gray-300 bg-white/10 text-white cursor-pointer glass-button',
            isExpanded ? 'w-[calc(100vh-80%)] justify-start' : 'w-14',
          ]">
            <div class="flex items-center px-4 py-2 z-10" @click="toggleExpand">
              <Search class="h-6 w-6" />
            </div>
            <input type="text" v-model="searchText" @input="onInput" @blur="handleBlur" placeholder="Keresés..." :class="[
              'bg-transparent outline-none pr-4 transition-all duration-700',
              isExpanded ? 'w-full opacity-100' : 'w-0 opacity-0 pointer-events-none',
            ]" />
          </div>
          <CategoriesButton @save="handleSave" />
        </div>
      </div>
      <div v-if="loading" class="flex justify-center items-center h-64">
        <Loader2Icon class="w-12 h-12 text-white animate-spin" />
      </div>
      <div v-else-if="error" class="bg-red-500 bg-opacity-50 backdrop-blur-md rounded-lg p-4 text-white">
        {{ error }}
      </div>
      <div v-else class="columns-1 sm:columns-2 md:columns-3 lg:columns-4 space-y-6" style="direction: ltr">
        <div v-for="quiz in quizzes" :key="quiz.id" class="break-inside-avoid mb-6">
          <QuizCard :quiz="quiz" />
        </div>
      </div>
    </div>
    <div v-if="!error" class="mt-8">
      <div class="flex flex-col-reverse gap-2 md:flex-row justify-center items-center space-x-2 text-white">
        <button @click="prevPage" :disabled="currentPage === 1"
          class="glass-button px-4 py-2 disabled:opacity-50 rounded-2xl transition-all duration-300 !bg-blue-700 w-56 h-12">
          Vissza
        </button>
        <div class="flex space-x-1">
          <template v-for="item in displayedPages" :key="item">
            <button v-if="item !== 'ellipsis'" @click="(goToPage(item as number), (showFullPages = false))" :class="[
              'glass-button px-4 py-2 rounded-2xl transition-all duration-300',
              item === currentPage
                ? 'bg-white/20 text-white'
                : 'bg-transparent text-black hover:bg-white',
            ]">
              {{ item }}
            </button>
            <div v-else class="relative inline-block">
              <button class="glass-button px-4 py-2 rounded-2xl transition-all duration-300 cursor-pointer"
                @click="showFullPages = !showFullPages">
                &hellip;
              </button>
              <Transition appear enter-active-class="transition ease-in-out duration-500"
                enter-from-class="opacity-0 translate-y-4" enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition ease-in-out duration-500" leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 translate-y-4">
                <div v-if="showFullPages" @mouseleave="showFullPages = false"
                  class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 max-h-[calc(100vh-80vh)] overflow-y-scroll custom-scrollbar w-48 p-4 bg-white/10 shadow-lg rounded-lg z-10 after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-8 after:border-transparent after:border-t-white backdrop-blur-2xl">
                  <div class="grid grid-cols-5 gap-2">
                    <button v-for="page in totalPagesArray" :key="page"
                      @click="(goToPage(page), (showFullPages = false))"
                      class="px-2 py-1 rounded transition-all duration-300 hover:bg-black/20 text-white border-2 border-transparent hover:border-white flex justify-center items-center">
                      {{ page }}
                    </button>
                  </div>
                </div>
              </Transition>
            </div>0
          </template>
        </div>
        <button @click="nextPage" :disabled="currentPage === totalPages"
          class="glass-button px-4 py-2 disabled:opacity-50 rounded-2xl transition-all duration-300 !bg-blue-700 w-56 h-12">
          Következő
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

.custom-scrollbar {
  scrollbar-width: thin;
  /*tuzroka miatt kell*/
  scrollbar-color: rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1);
  scroll-behavior: smooth;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.5);
}
</style>

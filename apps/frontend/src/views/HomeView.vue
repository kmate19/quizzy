<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { Loader2Icon, Search } from 'lucide-vue-next'
import NavBar from '@/components/NavBar.vue'
import MistBackground from '@/components/MistBackground.vue'
import CategoriesButton from '@/components/CategoriesBtn.vue'
import QuizCard from '@/components/QuizCard.vue'
import { type quizSmallView } from '@/utils/type'
import { clientv1 } from '@/lib/apiClient'

const quizzes = ref<quizSmallView[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const isExpanded = ref(false)
const isDescIncluded = ref(false)
const isNameIncluded = ref(false)
const categories = ref<string[]>([])
const searchText = ref('')
const searchContainer = ref<HTMLElement | null>(null)

// Pagination related state
const currentPage = ref(1)
const limit = ref(50)
const totalPages = ref(1)

interface FilterPayload {
  categories: string[]
  includeName: boolean
  includeDesc: boolean
}

const arrayBufferToBase64 = (buffer: number[], mimeType = 'image/png'): string => {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return `data:${mimeType};base64,${window.btoa(binary)}`
}

const fetchQuizzes = async () => {
    loading.value = true
    quizzes.value = []
    const response = await clientv1.quizzes.$get({
      query: { limit: limit.value.toString(), page: currentPage.value.toString() }
    })
    if (!response.ok) {
      throw new Error('Failed to fetch quizzes')
    }
    const data = await response.json()
    data.data.forEach((quiz) => {
      quizzes.value.push({
        id: quiz.id,
        created_at: new Date(quiz.created_at),
        updated_at: new Date(quiz.updated_at),
        user_id: quiz.user_id,
        description: quiz.description,
        title: quiz.title,
        rating: quiz.rating,
        plays: quiz.plays,
        banner: arrayBufferToBase64(quiz.banner.data),
        languageISOCodes: quiz.languages.map((lang) => ({
          iso_code: lang.language.iso_code,
          icon: lang.language.icon
        })),
        tags: quiz.tags.map((tagy) => tag.tag.name)
      } as quizSmallView)
    })
    if (data.total && data.limit) {
      totalPages.value = Math.ceil(data.total / data.limit)
    } else {
      totalPages.value = 1
    }
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

const handleSave = (payload: FilterPayload) => {
  console.log('Save Payload:', payload)
  categories.value = payload.categories
  isNameIncluded.value = payload.includeName
  isDescIncluded.value = payload.includeDesc
}

function debounce<Args extends unknown[]>(
  func: (...args: Args) => void,
  wait: number
): (...args: Args) => void {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: Args): void => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

function doSearch(query: string) {
  searchText.value = query
  console.log('Search Query:', query)
}

const search = debounce(doSearch, 250)

function onInput(event: Event) {
  const input = event.target as HTMLInputElement
  search(input.value)
}

const handleBlur = () => {
  isExpanded.value = false
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchQuizzes()
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchQuizzes()
  }
}

const goToPage = (page: number) => {
  if (page !== currentPage.value) {
    currentPage.value = page
    fetchQuizzes()
  }
}

// Create an array of page numbers based on totalPages
const pageNumbers = computed(() => {
  return Array.from({ length: totalPages.value }, (_, i) => i + 1)
})

onMounted(() => {
  fetchQuizzes()
})
</script>

<template>
  <div class="home-page">
    <MistBackground />
    <NavBar />
    <div class="container mx-auto px-4 py-8">
      <div class="flex flex-col md:flex-row justify-between items-center mb-8">
        <div class="flex items-center space-x-4" id="asd">
          <div
            ref="searchContainer"
            :class="[
              'relative flex items-center transition-all duration-700 ease-in-out rounded-full border border-gray-300 bg-white/10 text-white cursor-pointer glass-button',
              isExpanded ? 'w-[calc(100vh-80%)] justify-start' : 'w-14'
            ]"
          >
            <div class="flex items-center px-4 py-2 z-10" @click="toggleExpand">
              <Search class="h-6 w-6" />
            </div>
            <input
              type="text"
              v-model="searchText"
              @input="onInput"
              @blur="handleBlur"
              placeholder="Keresés..."
              :class="[
                'bg-transparent outline-none pr-4 transition-all duration-700',
                isExpanded ? 'w-full opacity-100' : 'w-0 opacity-0 pointer-events-none'
              ]"
            />
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
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <QuizCard v-for="quiz in quizzes" :key="quiz.id" :quiz="quiz" />
      </div>
      <div v-if="!loading && !error" class="mt-8">
        <div class="text-center mb-4 text-white">
          Page {{ currentPage }} of {{ totalPages }}
        </div>
        <div class="flex flex-wrap justify-center items-center space-x-2 text-white">
          <button
            @click="prevPage"
            :disabled="currentPage === 1"
            class="glass-button px-4 py-2 disabled:opacity-50 rounded-2xl transition-all duration-300 !bg-red-700"
          >
            Előző
          </button>
          <div class="flex space-x-1">
            <button
              v-for="page in pageNumbers"
              :key="page"
              @click="goToPage(page)"
              :class="[
                'glass-button px-4 py-2 rounded-2xl transition-all duration-300',
                page === currentPage ? 'bg-white/20 text-white' : 'bg-transparent text-white hover:bg-white/20'
              ]"
            >
              {{ page }}
            </button>
          </div>
          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="glass-button px-4 py-2 disabled:opacity-50 rounded-2xl transition-all duration-300 !bg-blue-700"
          >
            Következő
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.container {
  max-width: 1200px;
}

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
</style>

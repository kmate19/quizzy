<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { Loader2Icon, Search } from 'lucide-vue-next'
import NavBar from '@/components/NavBar.vue'
import MistBackground from '@/components/MistBackground.vue'
import CategoriesButton from '@/components/CategoriesBtn.vue'
import QuizCard from '@/components/QuizCard.vue'
import { type Quiz } from '@/utils/type'
import { clientv1 } from '@/lib/apiClient'
import { arrayBufferToBase64 } from '@/utils/helpers'

const quizzes = ref<Quiz[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const isExpanded = ref(false)
const isDescIncluded = ref(false)
const isNameIncluded = ref(false)
const categories = ref<string[]>([])
const searchText = ref('')
const searchContainer = ref<HTMLElement | null>(null)

const currentPage = ref(1)
const limit = ref(10) // minimum 10
const totalPages = ref(20)
const showFullPages = ref(false)

interface FilterPayload {
  categories: string[]
  includeName: boolean
  includeDesc: boolean
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
      created_at: new Date(quiz.created_at).toDateString(),
      updated_at: new Date(quiz.updated_at).toDateString(),
      user_id: quiz.user_id,
      description: quiz.description,
      title: quiz.title,
      rating: quiz.rating,
      plays: quiz.plays,
      banner: arrayBufferToBase64(quiz.banner.data),
      languages: quiz.languages.map((lang) => ({
        name: lang.language.name,
        iso_code: lang.language.iso_code,
        icon: lang.language.icon,
        support: lang.language.support,
      })),
      tags: quiz.tags.map((tag) => ({
        name: tag.tag.name,
      })),
    })
  })
    totalPages.value = 100
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


const displayedPages = computed<(number | 'ellipsis')[]>(() => {
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pageSet = new Set<number>()
  pageSet.add(1)
  pageSet.add(total)

  if (current !== 1 && current !== total) {
    pageSet.add(current)
  }

  const pagesArr = Array.from(pageSet).sort((a, b) => a - b)

  const result: (number | 'ellipsis')[] = []
  for (let i = 0; i < pagesArr.length; i++) {
    result.push(pagesArr[i])
  }
  result.splice(result.length - 1, 0, 'ellipsis')
  return result
})


const totalPagesArray = computed(() => {
  return Array.from({ length: totalPages.value }, (_, i) => i + 1)
})

onMounted(() => {
  fetchQuizzes()
})
</script>

<template>
  <div class="home-page">
    <MistBackground/>
    <NavBar />
    <div class="container mx-auto px-4 py-8 h-[calc(100vh-20vh)] overflow-y-scroll custom-scrollbar">
      <div class="flex flex-col md:flex-row justify-between items-center mb-8">
        <div class="flex items-center space-x-4" id="asd">
          <div ref="searchContainer" :class="[
            'relative flex items-center transition-all duration-700 ease-in-out rounded-full border border-gray-300 bg-white/10 text-white cursor-pointer glass-button',
            isExpanded ? 'w-[calc(100vh-80%)] justify-start' : 'w-14'
          ]">
            <div class="flex items-center px-4 py-2 z-10" @click="toggleExpand">
              <Search class="h-6 w-6" />
            </div>
            <input type="text" v-model="searchText" @input="onInput" @blur="handleBlur" placeholder="Keresés..." :class="[
              'bg-transparent outline-none pr-4 transition-all duration-700',
              isExpanded ? 'w-full opacity-100' : 'w-0 opacity-0 pointer-events-none'
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
      <div v-else class="columns-1 sm:columns-2 md:columns-3 lg:columns-4 space-y-6" style="direction: ltr;">
        <div v-for="quiz in quizzes" :key="quiz.id" class="break-inside-avoid mb-6">
          <QuizCard :quiz="quiz" />
        </div>
      </div>
      
    </div>
    <div v-if="!loading && !error" class="mt-8">
        <div class="flex flex-wrap justify-center items-center space-x-2 text-white">
          <button @click="prevPage" :disabled="currentPage === 1"
            class="glass-button px-4 py-2 disabled:opacity-50 rounded-2xl transition-all duration-300 !bg-blue-700 w-56 h-12">
            Előző
          </button>
          <div class="flex space-x-1">
            <template v-for="item in displayedPages" :key="item">
              <button v-if="item !== 'ellipsis'" @click="(goToPage(item as number),showFullPages = false)" :class="[
                'glass-button px-4 py-2 rounded-2xl transition-all duration-300',
                item === currentPage ? 'bg-white/20 text-white' : 'bg-transparent text-black hover:bg-white'
              ]">
                {{ item }}
              </button>
              <div v-else class="relative inline-block">
                <button class="glass-button px-4 py-2 rounded-2xl transition-all duration-300 cursor-pointer"
                  @click="showFullPages = !showFullPages">
                  &hellip;
                </button>
                <Transition appear 
                  enter-active-class="transition ease-in-out duration-500"
                  enter-from-class="opacity-0 translate-y-4" 
                  enter-to-class="opacity-100 translate-y-0"
                  leave-active-class="transition ease-in-out duration-500"
                  leave-from-class="opacity-100 translate-y-0"
                  leave-to-class="opacity-0 translate-y-4">
                  <div v-if="showFullPages" @mouseleave="showFullPages = false" class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3
                max-h-[calc(100vh-80vh)] overflow-y-scroll custom-scrollbar
                         w-48 p-4 bg-white/10 shadow-lg rounded-lg z-10
                         after:content-[''] after:absolute after:top-full after:left-1/2
                         after:-translate-x-1/2 after:border-8 after:border-transparent
                         after:border-t-white backdrop-blur-2xl">
                    <div class="grid grid-cols-5 gap-2">
                      <button v-for="page in totalPagesArray" :key="page" @click="goToPage(page); showFullPages = false"
                        class="px-2 py-1 rounded transition-all duration-300 hover:bg-black/20 text-white border-2 border-transparent hover:border-white flex justify-center items-center">
                        {{ page }}
                      </button>
                    </div>
                  </div>
                </Transition>
              </div>
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

.custom-scrollbar {
  scrollbar-width: thin;
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

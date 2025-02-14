<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
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

interface FilterPayload {
  categories: string[]
  includeName: boolean
  includeDesc: boolean
}

const arrayBufferToBase64 = (buffer: number[], mimeType = 'image/png'): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `data:${mimeType};base64,${window.btoa(binary)}`;
};

const fetchQuizzes = async () => {
  try {
    const response = await clientv1.quizzes.$get({ query: { limit: "50", page: "1" } })
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
        languageISOCodes: quiz.languages.map((lang) => { return { iso_code: lang.language.iso_code, icon: lang.language.icon } }),
        tags: quiz.tags.map((tag) => { return tag.tag.name }),
      } as quizSmallView)
    })
    console.log('Quizzes:', quizzes.value)
    loading.value = false
  } catch {
    error.value = 'Hiba történt a lekérdezés során, kérlek próbáld újra később.'
  }
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
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Args): void => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

function doSearch(query: string) {
  searchText.value = query;
  console.log('Search Query:', query);
}

const search = debounce(doSearch, 250)

function onInput(event: Event) {
  const input = event.target as HTMLInputElement;
  search(input.value);
}

const handleBlur = () => {
  isExpanded.value = false
}

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
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <QuizCard v-for="quiz in quizzes" :key="quiz.id" :quiz="quiz" />
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
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
}
</style>
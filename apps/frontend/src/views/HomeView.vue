<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { Loader2Icon, Search, ChevronDown } from 'lucide-vue-next'
import CategoriesButton from '@/components/CategoriesBtn.vue'
import QuizCard from '@/components/QuizCard.vue'
import type { quizCardView } from '@/utils/type'
import { getQuizzes } from '@/utils/functions/homeFuncitions'
import { toast } from 'vue3-toastify'
import { useRoute } from 'vue-router'
import { useQuizzyStore } from '@/stores/quizzyStore'

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


const showDropdown = ref(false)
const selectedLimit = ref(10)

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value

}

const selectOption = (value: number) => {
  selectedLimit.value = value
  limit.value = value
  showDropdown.value = false
  handleLimitChange()
}

const handleLimitChange = async () => {
  console.log(selectedLimit.value)
  console.log(limit.value)
  loading.value = true
  currentPage.value = 1
  selectParams()
  const res = await getQuizzes(
    params.limit.toString(),
    params.page,
    params.strict,
    params.tags,
    params.languages,
    params.searchText
  );
  quizzes.value = res.quizzes
  totalPages.value = Math.ceil(res.totalPages / params.limit)
  loading.value = false
}

interface FilterPayload {
  tags: string[]
  strictSearch: boolean
  languages: string[]
}

const params: {
  limit: number
  page?: string
  strict?: string
  tags?: [string, ...string[]]
  languages?: [string, ...string[]]
  searchText?: string
} = {
  limit: 10,
}

const selectParams = () => {
  for (const key in params) {
    delete params[key as keyof typeof params];
  }
  if (limit.value) {
    params.limit = limit.value
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
    params.limit.toString(),
    params.page,
    params.strict,
    params.tags,
    params.languages,
    params.searchText
  );
  quizzes.value = res.quizzes
  totalPages.value = Math.ceil(res.totalPages / params.limit)
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
    params.limit.toString(),
    params.page,
    params.strict,
    params.tags,
    params.languages,
    params.searchText
  );
  quizzes.value = res.quizzes
  totalPages.value = Math.ceil(res.totalPages / params.limit)
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
      params.limit.toString(),
      params.page,
      params.strict,
      params.tags,
      params.languages,
      params.searchText
    );
    quizzes.value = res.quizzes
    totalPages.value = Math.ceil(res.totalPages / params.limit)
    loading.value = false
  }
}

const prevPage = async () => {
  if (currentPage.value > 1) {
    loading.value = true
    currentPage.value--
    selectParams()
    const res = await getQuizzes(
      params.limit.toString(),
      params.page,
      params.strict,
      params.tags,
      params.languages,
      params.searchText
    );
    quizzes.value = res.quizzes
    totalPages.value = Math.ceil(res.totalPages / params.limit)
    loading.value = false
  }
}

const goToPage = async (page: number) => {
  if (page !== currentPage.value) {
    loading.value = true
    currentPage.value = page
    selectParams()
    const res = await getQuizzes(
      params.limit.toString(),
      params.page,
      params.strict,
      params.tags,
      params.languages,
      params.searchText
    );
    quizzes.value = res.quizzes
    totalPages.value = Math.ceil(res.totalPages / params.limit)
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

const fromLogin = route.redirectedFrom?.path === '/login'

onMounted(async () => {
  loading.value = true
  await nextTick()
  const quizzyStore = useQuizzyStore()

  console.log("fasz",fromLogin)

  if (quizzyStore.isFirstLogin && quizzyStore.fromLogin) {
    toast(`Sikeres bejelentkezés!\nÜdvözöljük ${quizzyStore.userName}!`, {
      autoClose: 3500,
      position: toast.POSITION.TOP_CENTER,
      type: 'success',
      transition: 'zoom',
      pauseOnHover: false,
    })
    quizzyStore.isFirstLogin = false
  }

  selectParams()
  const res = await getQuizzes(
    params.limit.toString(),
    params.page,
    params.strict,
    params.tags,
    params.languages,
    params.searchText
  );
  quizzes.value = res.quizzes
  totalPages.value = Math.ceil(res.totalPages / params.limit)
  loading.value = false
})

const tiltCard = (event: MouseEvent, element: HTMLElement) => {
  const card = element;
  const cardRect = card.getBoundingClientRect();
  const cardCenterX = cardRect.left + cardRect.width / 2;
  const cardCenterY = cardRect.top + cardRect.height / 2;
  
  const mouseX = event.clientX;
  const mouseY = event.clientY;
  
  const rotateY = (mouseX - cardCenterX) / 30;
  const rotateX = (cardCenterY - mouseY) / 30;
  
  card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
}

const resetTilt = (element: HTMLElement) => {
  element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
}
</script>

<template>
  <div class="home-page">
    <div
      class="max-w-[1200px] mx-auto px-4 py-8 h-[calc(100vh-20vh)] overflow-y-scroll  bg-white/90 rounded-md z-10 pointer-events-none">
      <div class="flex flex-col md:flex-row justify-between mb-2 pointer-events-auto">
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

        <div class="mt-4 md:mt-0 relative" v-click-outside="()=>{showDropdown = false}">
          <div @click="toggleDropdown" class="glass-button px-4 py-2 rounded-full transition-all duration-300 cursor-pointer 
          !bg-white/10 flex items-center justify-center ">
            <span class="text-white mr-2">Quiz / oldal: {{ selectedLimit }}</span>
            <ChevronDown class="h-4 w-4 text-white transition-all duration-300"
              :class="{ 'transform rotate-180': showDropdown }" />
          </div>

          <transition enter-active-class="transition ease-out duration-300" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition ease-in duration-300"
            leave-from-class="opacity-100" leave-to-class="opacity-0">

            <div v-if="showDropdown"
              class="absolute left-1/2 transform -translate-x-1/2 mt-2 w-48 rounded-lg shadow-lg z-50 overflow-hidden backdrop-blur-2xl bg-gray-500">
              <div class="py-2 px-2">
                <div v-for="option in [10, 20, 30, 50]" :key="option" @click="selectOption(option)"
                  class="py-2 px-4 my-1 text-center text-white rounded-lg transition-all duration-300
                  ease-in-out cursor-pointer bg-white/10 backdrop-blur-md hover:bg-opacity-20 hover:-translate-y-0.5 hover:shadow-md"
                   :class="{ 'selected-option': selectedLimit === option }">
                  {{ option }}
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <div v-if="loading" class="flex justify-center items-center h-64 pointer-events-auto">
        <Loader2Icon class="w-12 h-12 text-gray-700 animate-spin" />
      </div>
      <div v-else-if="error" class="bg-red-500 bg-opacity-50 backdrop-blur-md rounded-lg p-4 text-white pointer-events-auto">
        {{ error }}
      </div>
      <div v-else-if="quizzes.length === 0" class="bg-gray-500 bg-opacity-50 backdrop-blur-md rounded-lg p-4 text-white pointer-events-auto">
        Nincs találat
      </div>
      <div v-else class="columns-1 sm:columns-2 md:columns-3 lg:columns-4 space-y-6 p-2" style="direction: ltr">
        <div v-for="quiz in quizzes" :key="quiz.id" 
            class="break-inside-avoid mb-6 card-container pointer-events-auto"
            @mousemove="(e) => e.currentTarget && tiltCard(e, e.currentTarget as HTMLElement)" 
            @mouseleave="(e) => e.currentTarget && resetTilt(e.currentTarget as HTMLElement)">
          <QuizCard :quiz="quiz" />
        </div>
      </div>
    </div>
    <div v-if="!error" class="mt-2 pointer-events-auto flex items-center justify-center">
      <div class="flex sm:gap-2 justify-center items-center space-x-2 text-white">
        <button @click="prevPage" :disabled="currentPage === 1"
          class="glass-button sm:px-4 px-2 py-2 disabled:opacity-50 rounded-2xl transition-all duration-300  w-fit h-12 cursor-pointer">
          Vissza
        </button>
        <div class="flex space-x-1">
          <template v-for="item in displayedPages" :key="item">
            <button v-if="item !== 'ellipsis'" @click="(goToPage(item as number), (showFullPages = false))" :class="[
              'glass-button sm:px-4 px-2 py-2 rounded-2xl transition-all duration-300 cursor-pointer',
              item === currentPage
                ? 'bg-white/20 text-white'
                : 'bg-transparent text-black hover:bg-white',
            ]">
              {{ item }}
            </button>
            <div v-else class="relative inline-block">
              <button class="glass-button sm:px-4 px-2 py-2 rounded-2xl transition-all duration-300 cursor-pointer"
                @click="showFullPages = !showFullPages">
                &hellip;
              </button>
              <Transition appear enter-active-class="transition ease-in-out duration-500"
                enter-from-class="opacity-0 translate-y-4" enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition ease-in-out duration-500" leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 translate-y-4">
                <div v-if="showFullPages" @mouseleave="showFullPages = false" class="absolute bottom-full left-1/2 transform
                 -translate-x-1/2 mb-3 max-h-[calc(100vh-80vh)] overflow-y-scroll  w-48 p-4
                   bg-white/10 shadow-lg rounded-lg z-10
                   after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 
                   after:border-8 after:border-transparent after:border-t-white backdrop-blur-2xl">
                  <div class="grid grid-cols-5 gap-2">
                    <button v-for="page in totalPagesArray" :key="page"
                      @click="(goToPage(page), (showFullPages = false))"
                      class="sm:px-4 py-1 px-2 rounded transition-all duration-300 hover:bg-black/20 text-white border-2
                       border-transparent hover:border-white flex justify-center items-center">
                      {{ page }}
                    </button>
                  </div>
                </div>
              </Transition>
            </div>
          </template>
        </div>
        <button @click="nextPage" :disabled="currentPage === totalPages"
          class="glass-button sm:px-4 py-2 px-2 disabled:opacity-50 rounded-2xl transition-all duration-300 w-fit h-12 cursor-pointer">
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

.card-container {
  transition: transform 0.15s ease-out;
  transform-style: preserve-3d;
  will-change: transform;
  border-radius: inherit;
  transform: perspective(1000px) rotateX(0) rotateY(0);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}



.selected-option {
  background: rgba(59, 130, 246, 0.5);
  border: 1px solid white;
}
</style>

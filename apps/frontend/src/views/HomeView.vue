<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MistBackground from '@/components/MistBackground.vue'
import NavBar from '@/components/NavBar.vue'
import CategoriesBtn from '@/components/CategoriesBtn.vue'
import { Search } from 'lucide-vue-next'
import type { Card } from '@/utils/search'
import { fuzzySearch } from '@/utils/search'
const isVisible = ref(false)
const cards = ref<HTMLDivElement[]>()
const isExpanded = ref(false)
const searchText = ref('')
const isNameIncluded = ref(true)
const isDescIncluded = ref(false)

const mockMockCards = ref<Card[]>([
  {
    name: 'Project Phoenix',
    desc: 'Develop a new mobile application for task management and collaboration.',
    category: 'Action',
    created_by: 'Alice Johnson',
  },
  {
    name: 'Website Redesign',
    desc: 'Revamp the company website for a modern and user-friendly experience.',
    category: 'Adventure',
    created_by: 'Bob Williams',
  },
  {
    name: 'Marketing Campaign - Summer Sale',
    desc: 'Plan and execute a summer sale marketing campaign across social media and email.',
    category: 'Casual',
    created_by: 'Charlie Davis',
  },
  {
    name: 'Database Optimization',
    desc: 'Optimize the database performance to improve application speed and efficiency.',
    category: 'Simulation',
    created_by: 'Diana Rodriguez',
  },
  {
    name: 'User Onboarding Flow Improvement',
    desc: 'Analyze and improve the user onboarding flow to increase user engagement.',
    category: 'Educational',
    created_by: 'Ethan Martinez',
  },
  {
    name: 'Security Audit',
    desc: 'Conduct a comprehensive security audit of the system to identify and fix vulnerabilities.',
    category: 'Trivia',
    created_by: 'Fiona Green',
  },
  {
    name: 'Content Creation - Blog Posts',
    desc: 'Create a series of blog posts on industry trends and best practices.',
    category: 'Horror',
    created_by: 'George Wilson',
  },
])

type SavePayload = {
  categories: string[]
  includeName: boolean
  includeDesc: boolean
}

const mockCards = ref<Card[]>([])
mockCards.value = [...mockMockCards.value]

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
  if (isExpanded.value) {
    setTimeout(() => {
      document.querySelector<HTMLInputElement>('.search-input')?.focus()
    }, 100)
  }
}

const checkVisibility = () => {
  if (cards.value?.length === 0) return
  const windowHeight = window.innerHeight
  cards.value?.forEach((card) => {
    const cardTop = card.getBoundingClientRect().top
    if (cardTop < windowHeight - 100) {
      isVisible.value = true
    }
  })
}



const handleSave = (payload: SavePayload) => {
  console.log(payload.categories)
  const categories = payload.categories
  isNameIncluded.value = payload.includeName
  isDescIncluded.value = payload.includeDesc
  filterCards(categories)
}

const filterCards = (categories: string[]) => {

  if (categories.length === 0) {
    mockCards.value = [...mockMockCards.value]
  } else {
    mockCards.value = [...mockMockCards.value]
    mockCards.value = mockCards.value.filter((card) => categories.includes(card.category))
  }
}

const search = (searchText: string) => {
  if (!searchText) {
    mockCards.value = [...mockMockCards.value]
  } else {
    const searchResults = fuzzySearch(searchText, mockMockCards.value, {
  keys: [
    isNameIncluded.value ? 'name' : undefined,
    isDescIncluded.value ? 'desc' : undefined
  ].filter((key): key is keyof Card => key !== undefined),
  threshold: 0.5,
});
    mockCards.value = searchResults
  }
}
onMounted(() => {
  checkVisibility()
})
</script>

<template>
  <MistBackground />
  <div
    class="max-w-6xl mx-auto m-2 backdrop-blur-md bg-white/10 rounded-lg shadow-lg overflow-hidden max-h-screen"
  >
    <NavBar />
    <main>
      <div class="relative mx-5 mb-5 mt-5 flex items-center gap-1">
        <div
          :class="[
        'flex items-center transition-all duration-300 ease-in-out rounded-full border border-gray-300 bg-white',
        isExpanded ? 'w-[75%] justify-center cursor-pointer hover:bg-gray-500' : 'w-14 cursor-pointer hover:bg-gray-500',
          ]"
        >
          <div class="flex items-center px-4 py-2" @click="toggleExpand">
        <Search class="h-6 w-6 text-gray" />
          </div>
          <input
        type="text"
        v-model="searchText"
        @keydown.enter="search(searchText)"
        placeholder="Keresés..."
        class="search-input w-full bg-transparent outline-none pr-4"
        :class="{ 'opacity-0': !isExpanded, 'opacity-100': isExpanded }"
        :disabled="!isExpanded"
          />
        </div>
        <CategoriesBtn @save="handleSave"/>
      </div>
      <div
        class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-scroll custom-scrollbar p-4 sm:p-6 max-h-[calc(100vh-200px)] min-h-[calc(100vh-200px)]"
      >
        <template v-if="mockCards.length > 0">
          <div
            v-for="card in mockCards"
            :key="card.name"
            class="bg-white/50 p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 opacity-0 flex flex-col 
            items-center max-h-fit"
            :class="{ 'fade-in': isVisible }"
            ref="cards"
          >
            <div class="w-full h-40 bg-gray-200 rounded-md mb-4 flex items-center justify-center">
              gatya
            </div>
            <div class="flex items-center justify-center text-center">
              <h2 class="text-xl font-semibold text-white mb-2">{{ card.name }}</h2>
            </div>
            <div class="flex items-center justify-center text-center">
              <h3 class="text-xl font-semibold text-white mb-2">{{ card.category }}</h3>
            </div>
            <p class="text-gray-700 flex flex-wrap justify-center items-center text-center">
              {{ card.desc }}
            </p>
          </div>
        </template>
        <div v-else class="col-span-full flex items-center justify-center h-full">
          <p class="text-2xl font-semibold text-white">Nincs ilyen találat</p>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

.search-input {
  transition: opacity 0.3s ease-in-out;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

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

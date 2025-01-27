<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MistBackground from '@/components/MistBackground.vue'
import NavBar from '@/components/NavBar.vue'
import CategoriesBtn from '@/components/CategoriesBtn.vue'
import { Search } from 'lucide-vue-next'
import type {Card, FuzzySearchResult} from '@/utils/search'
import {fuzzySearch} from '@/utils/search'
const isVisible = ref(false)
const cards = ref<HTMLDivElement[]>()
const isExpanded = ref(false)
const searchText = ref('')
const searchCards = ref<FuzzySearchResult<Card>[]>([])

const search = (searchText: string) => {
  if (searchText === '') {
    searchCards.value = mockCards.map((card) => ({item: card, score: 1}))
    return
  }
  else{
    searchCards.value = fuzzySearch(searchText, mockCards, {keys: ['name']})
  }
}

const mockCards: Card[] = [
  {
    name: "Project Phoenix",
    desc: "Develop a new mobile application for task management and collaboration.",
    category: "Project Management",
    created_by: "Alice Johnson",
  },
  {
    name: "Website Redesign",
    desc: "Revamp the company website for a modern and user-friendly experience.",
    category: "Web Development",
    created_by: "Bob Williams",
  },
  {
    name: "Marketing Campaign - Summer Sale",
    desc: "Plan and execute a summer sale marketing campaign across social media and email.",
    category: "Marketing",
    created_by: "Charlie Davis",
  },
  {
    name: "Database Optimization",
    desc: "Optimize the database performance to improve application speed and efficiency.",
    category: "Database",
    created_by: "Diana Rodriguez",
  },
  {
    name: "User Onboarding Flow Improvement",
    desc: "Analyze and improve the user onboarding flow to increase user engagement.",
    category: "UX Design",
    created_by: "Ethan Martinez",
  },
  {
    name: "Security Audit",
    desc: "Conduct a comprehensive security audit of the system to identify and fix vulnerabilities.",
    category: "Security",
    created_by: "Fiona Green",
  },
  {
    name: "Content Creation - Blog Posts",
    desc: "Create a series of blog posts on industry trends and best practices.",
    category: "Content Marketing",
    created_by: "George Wilson",
  },
];


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

const getGames = (categories: string[]) => {
  console.log('categories ' + categories)
}

onMounted(() => {
  checkVisibility()
})
</script>

<template>
  <MistBackground />
  <div class="">
    <div
      class="max-w-6xl mx-auto backdrop-blur-md bg-white/10 rounded-lg shadow-lg overflow-hidden max-h-screen"
    >
      <NavBar />
      <main class="p-4 sm:p-6 lg:p-8">
        <div class="relative m-5 flex items-center justify-between">
          <div
            :class="[
              'flex items-center transition-all duration-300 ease-in-out rounded-full border border-gray-300 bg-white',
              isExpanded ? 'w-full' : 'w-14 cursor-pointer hover:bg-gray-50',
            ]"
          >
            <div class="flex items-center px-4 py-2" @click="toggleExpand">
              <Search class="h-5 w-5 text-gray" />
            </div>
            <input
              type="text"
              v-model="searchText"
              @keydown.enter="search(searchText)"
              placeholder="Keresés..."
              class="search-input w-full bg-transparent outline-none pr-4"
              :class="{ 'opacity-0': !isExpanded, 'opacity-100': isExpanded }"
              :disabled="!isExpanded"
              @blur="isExpanded = false"
            />
          </div>
          <CategoriesBtn @save="getGames" />
        </div>
        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-scroll custom-scrollbar p-6 max-h-[780px]"
          v-if="searchCards?.length===0"
        >
          <div
            v-for="card in mockCards"
            :key="card.name"
            class="bg-white/50 p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 opacity-0"
            :class="{ 'fade-in': isVisible }"
            ref="cards"
          >
            <div class="w-full h-40 bg-gray-200 rounded-md mb-4 flex items-center justify-center">
              kep
            </div>
            <div class="flex items-center justify-center">
              <h2 class="text-xl font-semibold text-white mb-2">{{ card.name }}</h2>
            </div>
            <p class="text-gray-700 flex flex-wrap justify-center items-center">
              {{ card.desc }}
            </p>
          </div>
        </div>
        <div
          v-else
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-scroll custom-scrollbar p-6 max-h-[780px]"
        >
          <div
            v-for="sCard in searchCards"
            :key="sCard.item.name"
            class="bg-white/50 p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 opacity-0"
            :class="{ 'fade-in': isVisible }"
            ref="cards"
          >
            <div class="w-full h-40 bg-gray-200 rounded-md mb-4 flex items-center justify-center">
              kep
            </div>
            <div class="flex items-center justify-center">
              <h2 class="text-xl font-semibold text-white mb-2">{{ sCard.item.name }}</h2>
            </div>
            <p class="text-gray-700 flex flex-wrap justify-center items-center">
              {{ sCard.item.desc }}
            </p>
          </div>
        </div>
      </main>
    </div>
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
</style>

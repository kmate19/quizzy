<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MistBackground from '@/components/MistBackground.vue'
import NavBar from '@/components/NavBar.vue'
import CategoriesBtn from '@/components/CategoriesBtn.vue'
import { Search } from 'lucide-vue-next'
import type { Card } from '../utils/search'
import { fuzzySearch } from '@/utils/search'
import { useCounterStore } from '@/stores/counter'
const store = useCounterStore()
const mockMockCards = store.returnMockMockCards()
const isVisible = ref(false)
const cards = ref<HTMLDivElement[]>()
const isExpanded = ref(false)
const searchText = ref('')
const isNameIncluded = ref(true)
const isDescIncluded = ref(false)
const cardColors = ref<string[]>([]);
const bgColors = ['bg-red-800', 'bg-blue-800', 'bg-yellow-600', 'bg-green-800']


const getRandomColor = () => {
  const color = bgColors[Math.floor(Math.random() * bgColors.length)]
  return color
}


const getCardColor = (index: number) => {
  if (!cardColors.value[index]) {
    cardColors.value[index] = getRandomColor();
  }
  return cardColors.value[index];
};


const filteredCards = ref<Card[]>([...mockMockCards.value])

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
  console.log("Save Payload:", payload);
  const categories = payload.categories;
  isNameIncluded.value = payload.includeName;
  isDescIncluded.value = payload.includeDesc;
  filterCards(categories);
  search(searchText.value); 
}

const filterCards = (categories: string[]) => {
  if (categories.length === 0) {
    filteredCards.value = [...mockMockCards.value]; 
  } else {
    filteredCards.value = mockMockCards.value.filter((card) => categories.includes(card.category)); 
  }
  updateDisplayedCards(); 
}

const search = (searchText: string) => {;
  if (!searchText) {
    mockCards.value = [...filteredCards.value]; 
  } else {
    const searchResults = fuzzySearch(searchText, filteredCards.value, { 
      keys: [
        isNameIncluded.value ? 'name' : undefined,
        isDescIncluded.value ? 'desc' : undefined,
      ].filter((key): key is keyof Card => key !== undefined),
      threshold: 0.5,
    });
    mockCards.value = searchResults; 
  }
}

const updateDisplayedCards = () => {
  search(searchText.value);
}


onMounted(() => {
  checkVisibility();
  cardColors.value = mockCards.value.map(() => getRandomColor());
});
</script>

<template>
  <MistBackground />
  <div class="max-w-6xl mx-auto m-2 backdrop-blur-md bg-white/10 rounded-lg shadow-lg overflow-hidden">
    <NavBar />
    <main>
      <div class="relative mx-5 mb-5 mt-5 flex items-center gap-1">
        <div :class="[
          'flex items-center transition-all duration-300 ease-in-out rounded-full border border-gray-300 bg-white',
          isExpanded
            ? 'w-[75%] justify-center cursor-pointer'
            : 'w-14 cursor-pointer hover:scale-110',
        ]">
          <div class="flex items-center px-4 py-2 " @click="toggleExpand">
            <Search class="h-6 w-6 text-gray" />
          </div>
          <input type="text" v-model="searchText" @input="search(searchText)" placeholder="Keresés..."
            class="search-input w-full bg-transparent outline-none pr-4"
            :class="{ 'opacity-0': !isExpanded, 'opacity-100 ': isExpanded }" :disabled="!isExpanded" />
        </div>
        <CategoriesBtn @save="handleSave" />
      </div>
      <div
        class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-y-scroll custom-scrollbar p-4 sm:p-6 h-[calc(100vh-200px)]">
        <template v-if="mockCards.length > 0">
          <div v-for="(card, index) in mockCards" :key="card.name"
            class="p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 opacity-0 flex flex-col border-4 border-white/30 items-center max-h-fit"
            :class="[getCardColor(index), { 'fade-in': isVisible }]" ref="cards">
            <div class="w-full h-40 bg-gray-200 rounded-md mb-4 flex items-center justify-center">
              gatya
            </div>
            <div class="flex items-center justify-center text-center">
              <h2 class="text-xl font-semibold text-white mb-2" >{{ card.name }}</h2>
            </div>
            <div class="flex items-center justify-center text-center">
              <h3 class="text-xl font-semibold text-white mb-2">{{ card.category }}</h3>
            </div>
            <p class="text-white flex flex-wrap justify-center items-center text-center">
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
.highlighted {
  background-color: #FFFF00; 
  font-weight: bold; 
}
</style>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import MistBackground from '@/components/MistBackground.vue'
import NavBar from '@/components/NavBar.vue'
import CategoriesBtn from '@/components/CategoriesBtn.vue'
import { Search } from 'lucide-vue-next'
const isVisible = ref(false)
const cards = ref<HTMLDivElement[]>()
const navContainer = ref<HTMLDivElement | null>(null)
const isOutsideContainer = ref(false)
const searchText = ref('')

const isExpanded = ref(false)

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

const checkNavPosition = () => {
  if (navContainer.value) {
    const containerRect = navContainer.value.getBoundingClientRect()
    isOutsideContainer.value = containerRect.top <= 0
  }
}

const handleSearch = (searchText: string) => {
  console.log(searchText + ' search')
}

onMounted(() => {
  window.addEventListener('scroll', checkVisibility)
  window.addEventListener('scroll', checkNavPosition)
  checkVisibility()
  checkNavPosition()
})

onUnmounted(() => {
  window.removeEventListener('scroll', checkVisibility)
  window.removeEventListener('scroll', checkNavPosition)
})
</script>

<template>
  <MistBackground />

  <div
    class="max-w-6xl mx-auto min-h-screen backdrop-blur-md bg-white/10 rounded-lg shadow-lg overflow-hidden"
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
            @keydown.enter = "handleSearch(searchText)"
            placeholder="Keresés..."
            class="search-input w-full bg-transparent outline-none pr-4"
            :class="{ 'opacity-0': !isExpanded, 'opacity-100': isExpanded }"
            :disabled="!isExpanded"
            @blur="isExpanded = false"
          />
        </div>
        <CategoriesBtn />
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 
      overflow-y-scroll custom-scrollbar">
        <div
          v-for="i in 5"
          :key="i"
          class="bg-white/50 p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 opacity-0"
          :class="{ 'fade-in': isVisible }"
          ref="cards"
        >
          <div class="w-full h-40 bg-gray-200 rounded-md mb-4 flex items-center justify-center">
            kep
          </div>
          <h2 class="text-xl font-semibold text-white mb-2">Játék {{ i }}</h2>
          <p class="text-gray-700">
            Ez egy leiras lesz a jatekrol most csak teszteles celjabol van itt {{ i }}
          </p>
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
</style>

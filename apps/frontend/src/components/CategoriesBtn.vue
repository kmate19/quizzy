<script setup lang="ts">
import { ref, computed } from 'vue'
import { XIcon, Settings2, Search, Save } from 'lucide-vue-next'

const isModalOpen = ref(false)
const searchQuery = ref('')
const selectedCategoriesData = ref<string[]>([])
const includeDesc = ref(false)
const includeName = ref(true)

const categories = [
  'Action',
  'Adventure',
  'Casual',
  'Simulation',
  'Educational',
  'Trivia',
  'Horror',
]

const selectedCategories = computed(() => selectedCategoriesData.value)

const filteredCategories = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return categories.filter((category) => category.toLowerCase().includes(query))
})

const isSelected = (category: string): boolean => {
  return selectedCategoriesData.value.includes(category)
}

const toggleCategory = (category: string) => {
  const index = selectedCategoriesData.value.indexOf(category)
  if (index > -1) {
    selectedCategoriesData.value.splice(index, 1)
  } else {
    selectedCategoriesData.value.push(category)
  }
}

const saveCategories = () => {
  isModalOpen.value = false
  emit('save', {
    categories: selectedCategoriesData.value,
    includeName: includeName.value,
    includeDesc: includeDesc.value
  })
}

const clearSelectedCategories = () => {
  selectedCategoriesData.value = []
}

const emit = defineEmits(['save'])
</script>

<template>
  <div class="relative w-10 h-10">
    <button
      @click="isModalOpen = true"
      class="w-16 h-10 rounded-full border-2 bg-white/30 
      border-gray-300 flex items-center justify-center p-3 hover:border-gray-400 relative text-white
      transition-all duration-300 ease-in-out cursor-pointer glass-button"
      aria-label="Open category selector"
    >
      <Settings2 class="w-5 h-5 text-grey" absoluteStrokeWidth />
    </button>

    <div
      v-if="isModalOpen"
      class="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center z-50 flex-col"
    >
      <div class="bg-white/0 backdrop-blur-3xl rounded-lg w-full max-w-md p-6 relative">
        <button
          @click="isModalOpen = false"
          class="absolute top-4 right-4 text-gray-500 hover:scale-110 transition-all duration-300 border-4 w-10 h-10 flex justify-center items-center
           border-red-800 rounded-full bg-red-800"
        >
          <XIcon class="w-5 h-5 text-white" />
        </button>

        <h2 class="text-xl font-semibold mb-4 text-white">Kategóriák</h2>

        <div v-if="selectedCategories.length > 0" class="mb-4">
          <div class="flex flex-wrap gap-2 overflow-y-scroll custom-scrollbar max-h-40">
            <div
              v-for="category in selectedCategories"
              :key="category"
              class="bg-gray-700 text-white px-3 py-1 rounded-full flex items-center gap-2"
            >
              <span>{{ category }}</span>
              <button @click="toggleCategory(category)" class="hover:text-gray-200">
                <XIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div class="mb-4 relative flex">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Kategóriák keresése..."
            class="w-full px-4 py-2 pl-10 bg-gray-600 text-white font-bold rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <Search class="w-5 h-5 text-white absolute left-3 top-1/2 transform -translate-y-1/2" />
          <button
            @click="clearSelectedCategories"
            class="ml-2 p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-full w-11 flex justify-center items-center"
          >
            <XIcon class="w-5 h-5 " />
          </button>
        </div>

        <div class="overflow-y-scroll custom-scrollbar flex flex-wrap max-h-60 mb-4">
          <label
            v-for="category in filteredCategories"
            :key="category"
            class="space-x-3 p-2 rounded hover:bg-gray-500 cursor-pointer max-w-fit"
          >
            <input
              type="checkbox"
              :value="category"
              v-model="selectedCategoriesData"
              class="hidden"
            />
            <div
              class="flex-1 px-3 py-1 rounded-full"
              :class="
                isSelected(category)
                  ? 'bg-green-600 text-white'
                  : 'bg-red-600 backdrop-blur-md text-white'
              "
            >
              {{ category }}
            </div>
          </label>
        </div>
        <div class="mb-4 flex flex-col space-y-2">
          <h2 class="text-xl font-semibold mb-4 text-white">Keresési paraméterek</h2>
          <button
            @click="includeName = !includeName"
            :class="[
              'w-full py-2 px-4 rounded-full font-bold transition-colors',
              includeName
                ? 'bg-green-600 text-white'
                : 'bg-red-600 text-white hover:bg-gray-500',
            ]"
          >
            Név
          </button>
          <button
            @click="includeDesc = !includeDesc"
            :class="[
              'w-full py-2 px-4 rounded-full font-bold transition-colors duration-300',
              includeDesc
                ? 'bg-green-600 text-white'
                : 'bg-red-600 text-white hover:bg-gray-500',
            ]"
          >
            Leírás
          </button>
        </div>
        <button
          @click="saveCategories"
          class="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-full flex items-center justify-center gap-2 transition-colors"
        >
          <Save class="w-5 h-5" />
          Kategóriák mentése
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dots-pattern {
  width: 100%;
  height: 100%;
  position: relative;
}

.dot {
  width: 8px;
  height: 8px;
  background-color: #374151;
  border-radius: 50%;
  position: absolute;
}

.dot:nth-child(1) {
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

.dot:nth-child(2) {
  bottom: 25%;
  left: 25%;
}

.dot:nth-child(3) {
  bottom: 25%;
  right: 25%;
}

.dot::before {
  content: '';
  position: absolute;
  width: 12px;
  height: 2px;
  background-color: #374151;
  top: 50%;
  left: 50%;
}

.dot:nth-child(1)::before {
  transform: translateX(-50%) rotate(90deg);
}

.dot:nth-child(2)::before {
  transform: translateX(-50%) rotate(45deg);
}

.dot:nth-child(3)::before {
  transform: translateX(-50%) rotate(-45deg);
}

.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1);
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

.glass-button {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
}
</style>

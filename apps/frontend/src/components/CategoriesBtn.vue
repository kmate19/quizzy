<script setup lang="ts">
import { ref, computed } from 'vue'
import { XIcon, Settings2 } from 'lucide-vue-next'

const isModalOpen = ref(false)
const selectedCategoriesData = ref<string[]>([])

//make a list of categories atlest 16 categories, use real like data like 'industry'
const categories = [
  'Technology',
  'Science',
  'Business',
  'Health',
  'Sports',
  'Art',
  'Music',
  'Food',
  'Travel',
  'Fashion',
  'Education',
  'Automotive',
  'Entertainment',
  'Lifestyle',
  'Politics',
  'Industry',
]
const selectedCategories = computed(() => selectedCategoriesData.value)

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
</script>

<template>
  <div class="relative w-10 h-10">
    <button
      @click="isModalOpen = true"
      class="w-16 h-10 rounded-full border-2 bg-white border-gray-300 flex items-center justify-center p-3 hover:border-gray-400 transition-colors relative"
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
          class="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <XIcon class="w-5 h-5" />
        </button>

        <h2 class="text-xl font-semibold mb-4 text-white">Válassz kategóriákat</h2>

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

        <div class="overflow-y-scroll custom-scrollbar flex flex-wrap max-h-40">
          <label
            v-for="category in categories"
            :key="category"
            class="space-x-3 p-2 rounded hover:bg-gray-50 cursor-pointer max-w-fit"
          >
            <input
              type="checkbox"
              :value="category"
              v-model="selectedCategoriesData"
              class="hidden"
            />
            <div
              class="flex-1 px-3 py-1 rounded-full"
              :class="isSelected(category) ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'"
            >
              {{ category }}
            </div>
          </label>
        </div>
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
</style>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { XIcon, Settings2, Search, Save } from 'lucide-vue-next'
import { getTags } from '@/utils/functions/metaFunctions'
import type { Tag } from '@/utils/type'

const tags = ref<Tag[]>()
const isModalOpen = ref(false)
const searchQuery = ref('')
const selectedTagsData = ref<string[]>([])

const selectedCategories = computed(() => selectedTagsData.value)

const filteredCategories = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return tags.value?.filter((tag) =>
    tag.name.toLowerCase().includes(query)
  )
})

const isSelected = (category: string): boolean => {
  return selectedTagsData.value.includes(category)
}

const toggleCategory = (category: string) => {
  const index = selectedTagsData.value.indexOf(category)
  if (index > -1) {
    selectedTagsData.value.splice(index, 1)
  } else {
    selectedTagsData.value.push(category)
  }
}

const saveCategories = () => {
  isModalOpen.value = false
  emit('save', {
    tags: selectedTagsData.value,
  })
}

const clearSelectedCategories = () => {
  selectedTagsData.value = []
}

const emit = defineEmits(['save'])

onMounted(async () => {
  tags.value = await getTags()
  console.log(tags.value)
})
</script>

<template>
  <div class="relative">
    <!-- Trigger button with glassmorphism effect -->
    <button @click="isModalOpen = true"
      class="w-16 h-10 rounded-full border-2 glass-button flex items-center justify-center p-3 transition-all duration-300 ease-in-out "
      aria-label="Open category selector">
      <Settings2 class="w-5 h-5 text-gray-300" />
    </button>
    <transition name="fade">
      <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md">
        <div
          class="relative w-full max-w-md p-6 rounded-lg bg-white/10 border border-white/20 backdrop-blur-xl shadow-lg">
          <button @click="isModalOpen = false"
            class="absolute top-4 right-4 text-gray-300 hover:text-white transition-transform duration-300 transform hover:scale-110">
            <XIcon class="w-5 h-5" />
          </button>

          <h2 class="text-xl font-semibold mb-4 text-white">Kategóriák</h2>
          <div v-if="selectedCategories.length > 0" class="mb-4">
            <div class="selected-categories flex flex-wrap gap-2 max-h-20 overflow-y-auto custom-scrollbar">
              <transition-group name="category" tag="div" class="flex flex-wrap gap-2">
                <div v-for="category in selectedCategories" :key="category"
                  class="bg-white/20 border border-white/30 backdrop-blur-md text-white px-3 py-1 rounded-full flex items-center gap-2">
                  <span>{{ category }}</span>
                  <button @click="toggleCategory(category)" class="hover:text-gray-200 cursor-pointer">
                    <XIcon class="w-4 h-4" />
                  </button>
                </div>
              </transition-group>
            </div>
          </div>
          <div class="mb-4 relative flex">
            <input v-model="searchQuery" type="text" placeholder="Kategóriák keresése..."
              class="w-full px-4 py-2 pl-10 bg-white/20 text-white font-bold rounded-full focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer" />
            <Search class="w-5 h-5 text-white absolute left-3 top-1/2 transform -translate-y-1/2" />
            <button @click="clearSelectedCategories"
              class="ml-2 p-2 bg-white/20 text-white rounded-full w-11 flex items-center justify-center transition-colors border-2 border-transparent hover:border-white
              cursor-pointer">
              <XIcon class="w-5 h-5" />
            </button>
          </div>
          <div class="overflow-y-auto flex flex-wrap gap-2 max-h-60 mb-4">
            <label v-for="t in filteredCategories" :key="t.name"
              class="flex items-center p-2 rounded cursor-pointer">
              <input type="checkbox" :value="t.name" v-model="selectedTagsData" class="hidden" />
              <div
                class="flex-1 px-3 py-1 rounded-full   border-2 border-transparent hover:border-white transtion-all duration-300 cursor-pointer"
                :class="isSelected(t.name)
                  ? 'bg-green-600 text-white'
                  : 'bg-red-600/80 backdrop-blur-sm text-white'">
                {{ t.name }}
              </div>
            </label>
          </div>
          <button @click="saveCategories"
            class="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-4 rounded-full flex items-center justify-center gap-2 transition-colors cursor-pointer">
            <Save class="w-5 h-5" />
            Kategóriák mentése
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* Fade transition for modal overlay */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Transition for selected category items */
.category-enter-active,
.category-leave-active {
  transition: all 0.3s ease;
}

.category-enter-from,
.category-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Smooth height transition for the selected categories container */
.selected-categories {
  transition: height 0.3s ease;
}

/* Glass button styling */
.glass-button {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Custom scrollbar for scrollable areas */
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

/* Reduce motion for users who prefer it */
@media (prefers-reduced-motion: reduce) {

  .transition-all,
  .transition-transform {
    transition: none;
  }
}
</style>

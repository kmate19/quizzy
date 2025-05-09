<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { XIcon, Settings2, Search, Save, Check } from 'lucide-vue-next'
import { getLanguages, getTags } from '@/utils/functions/metaFunctions'
import { useQuery } from '@tanstack/vue-query'


//set tags with useQuery
const { data: tags } = useQuery({
  queryKey: ['tags'],
  queryFn: getTags,
  staleTime: Infinity,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
})

const { data: languages } = useQuery({
  queryKey: ['languages'],
  queryFn: getLanguages,
  staleTime: Infinity,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
})

const isModalOpen = ref(false)
const searchQuery = ref('')
const selectedTagsData = ref<string[]>([])
const selectedLanguagesData = ref<string[]>([])
const strictSearch = ref(false)

const selectedCategories = computed(() => selectedTagsData.value)

const filteredCategories = computed(() => {
  const query = searchQuery.value.toLowerCase()
  if (!query) return tags.value
  return tags.value?.filter((tag) =>
    tag.name.toLowerCase().includes(query)
  )
})

const filteredLanguages = computed(() => {
  const query = searchQuery.value.toLowerCase()
  if (!query) return languages.value
  return languages.value?.filter((lang) =>
    lang?.name?.toLowerCase().includes(query)
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

const saveParams = () => {
  isModalOpen.value = false
  emit('save', {
    tags: selectedTagsData.value.length > 0 ? selectedTagsData.value : [],
    languages: selectedLanguagesData.value.length > 0 ? selectedLanguagesData.value : [],
    strictSearch: strictSearch.value
  })
}

const clearSelectedCategories = () => {
  selectedTagsData.value = []
}

const emit = defineEmits(['save'])

onMounted(async () => {
  console.log(tags.value, languages.value)
})
</script>

<template>
  <div class="relative">
    <button
      @click="isModalOpen = true"
      class="w-16 h-10 rounded-full border-2 glass-button flex items-center justify-center p-3 transition-all duration-300 ease-in-out cursor-pointer"
    >
      <Settings2 class="w-5 h-5 text-gray-300" />
    </button>
    <transition name="fade">
      <div
        v-if="isModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
      >
        <div class="relative w-full max-w-md p-6 rounded-lg bg-white/10 border border-white/20 backdrop-blur-xl shadow-lg">
          <button
            @click="isModalOpen = false"
            class="absolute top-2 right-2 ml-2 p-2 bg-white/20 text-white rounded-full w-11 flex items-center justify-center 
            transition-colors border-2 border-transparent
             hover:border-white cursor-pointer"
          >
            <XIcon class="w-5 h-5" />
          </button>

          <h2 class="text-xl font-semibold mb-4 text-white">Kategóriák</h2>
          <transition name="fade" mode="out-in">
            <div v-if="selectedCategories.length > 0" class="mb-4">
              <div class="selected-categories flex flex-wrap gap-2 h-20 overflow-y-auto custom-scrollbar">
                <transition-group name="category" tag="div" class="flex flex-wrap gap-2">
                  <div
                    v-for="category in selectedCategories"
                    :key="category"
                    class="bg-white/20 border border-white/30 backdrop-blur-md text-white px-3 py-1 rounded-full flex items-center gap-2 h-fit"
                  >
                    <span>{{ category }}</span>
                    <button
                      @click="toggleCategory(category)"
                      class="hover:text-gray-200 cursor-pointer"
                    >
                      <XIcon class="w-4 h-4" />
                    </button>
                  </div>
                </transition-group>
              </div>
            </div>
            <div v-else class="mb-4">
              <div class="selected-categories flex flex-wrap gap-2 h-20 overflow-y-auto custom-scrollbar items-center justify-center text-white font-bold">
                Nincs kiválasztott kategória
              </div>
            </div>
          </transition>
          <div class="mb-4 relative flex">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Kategóriák keresése..."
              class="w-full px-4 py-2 pl-10 bg-white/20 text-white font-bold rounded-full focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <Search class="w-5 h-5 text-white absolute left-3 top-1/2 transform -translate-y-1/2" />
            <button
              @click="clearSelectedCategories"
              class="ml-2 p-2 bg-white/20 text-white rounded-full w-11 flex items-center justify-center transition-colors border-2 border-transparent hover:border-white cursor-pointer"
            >
              <XIcon class="w-5 h-5" />
            </button>
          </div>
          <div class="mb-4 flex items-center">
            <input type="checkbox" v-model="strictSearch" id="strictSearch" class="hidden" />
            <label for="strictSearch" class="flex items-center cursor-pointer text-white">
              <div
                class="w-5 h-5 mr-2 border-2 border-white/20 rounded-sm flex items-center justify-center bg-white/20 hover:bg-white/30 transition-colors"
              >
                <Check v-if="strictSearch" class="w-4 h-4 text-green-400" />
              </div>
              <span>Pontos keresés</span>
            </label>
          </div>
          <div class="overflow-y-auto flex flex-wrap max-h-60 mb-4">
            <label
              v-for="t in filteredCategories"
              :key="t.name"
              class="flex items-center p-1 rounded cursor-pointer"
            >
              <input type="checkbox" :value="t.name" v-model="selectedTagsData" class="hidden" />
              <div
                id="tag"
                class="flex-1 px-3 py-1 rounded-full border-2 border-transparent hover:border-white transition-all duration-300 cursor-pointer"
                :class="isSelected(t.name)
                  ? 'bg-green-600 text-white'
                  : 'bg-white/10 backdrop-blur-sm text-white'"
              >
                {{ t.name }}
              </div>
            </label>
          </div>
          <div class="mb-4">
            <h3 class="text-lg font-semibold text-white">Nyelvek</h3>
            <div class="overflow-y-auto flex flex-wrap gap-2 max-h-60 mb-4">
              <label
                v-for="lang in filteredLanguages"
                :key="lang.iso_code"
                class="flex items-center p-1 rounded cursor-pointer"
              >
                <input type="checkbox" :value="lang.iso_code" v-model="selectedLanguagesData" class="hidden" />
                <div
                id="lang"
                  class="flex-1 px-3 py-1 rounded-full border-2 border-transparent hover:border-white transition-all duration-300 cursor-pointer"
                  :class="selectedLanguagesData.includes(lang.iso_code ?? '')
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 backdrop-blur-sm text-white'"
                >
                  {{ lang.iso_code }}
                </div>
              </label>
            </div>
          </div>
          <button
            @click="saveParams"
            class="w-full !bg-green-900 text-white font-bold py-2 px-4 rounded-full flex items-center justify-center gap-2 cursor-pointer glass-button
            transition-all duration-300 ease-in-out"
          >
            <Save class="w-5 h-5" />
            Kategóriák mentése
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.category-enter-active,
.category-leave-active {
  transition: all 0.3s ease;
}
.category-enter-from,
.category-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
.selected-categories {
  transition: height 0.3s ease;
}
.glass-button {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
</style>

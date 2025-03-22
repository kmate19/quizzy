<script setup lang="ts">
import { StarIcon, PlayIcon } from 'lucide-vue-next'
import { type quizCardView } from '@/utils/type'
import { useRouter } from 'vue-router';

const router = useRouter()

defineProps<{ quiz: quizCardView }>()

</script>

<template>
  <Transition appear enter-active-class="transition ease-in-out duration-1000"
    enter-from-class="opacity-0 translate-y-4" enter-to-class="opacity-100 translate-y-0">
    <div class="quiz-card bg-opacity-10 backdrop-blur-md rounded-lg overflow-hidden shadow-lg  duration-300 hover:transform hover:scale-105
    border-2 border-white transition-all h-fit cursor-pointer" @click="router.push(`/quiz/${quiz.id}`)">
      <v-img :src="quiz.banner || '/placeholder.svg?height=200&width=300'" fit="contain"></v-img>
      <div class="p-4">
        <h2 class="text-xl font-semibold text-white mb-2">{{ quiz.title }}</h2>
        <p class="text-gray-300 text-sm mb-4 max-h-20 overflow-y-auto custom-scrollbar">{{ quiz.description }}</p>
        <div class="flex justify-between items-center mb-2">
          <div class="flex items-center">
            <StarIcon class="w-5 h-5 text-yellow-400 mr-1" />
            <span class="text-white">{{ quiz.rating.toFixed(1) }}</span>
          </div>
          <div class="flex items-center">
            <PlayIcon class="w-5 h-5 text-green-400 mr-1" />
            <span class="text-white">{{ quiz.plays }}</span>
          </div>
        </div>
        <div class="flex flex-wrap gap-2 mb-2">
          <span v-for="lang in quiz.languages" :key="lang.iso_code"
            class="inline-flex items-center bg-blue-500 bg-opacity-50 rounded-full px-2 py-1 text-xs text-white">
            {{ lang.icon }} {{ lang.name }}
          </span>
        </div>
        <div class="flex flex-wrap gap-2 max-h-20 h-fit overflow-y-auto custom-scrollbar">
          <span v-for="tag in quiz.tags" :key="tag.name"
            class="bg-gray-600 bg-opacity-50 rounded-full px-2 py-1 text-xs text-white">
            {{ tag.name }}
          </span>
        </div>
      </div>
    </div>
  </Transition>
</template>
<style scoped>
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

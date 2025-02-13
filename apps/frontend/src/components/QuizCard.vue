<script setup lang="ts">
import { StarIcon, PlayIcon } from 'lucide-vue-next'
import { type quizSmallView } from '@/utils/type'
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router';

const router = useRouter()

const props = defineProps<{ quiz: quizSmallView }>()

const aspectRatio = ref(1)

const computeAspectRatio = (src: string) => {
  const img = new Image()
  img.src = src
  img.onload = () => {
    aspectRatio.value = img.naturalWidth / img.naturalHeight
  }
}

onMounted(() => {
  computeAspectRatio(props.quiz.banner || '/placeholder.svg?height=200&width=300')
})

watch(
  () => props.quiz.banner,
  (newSrc) => {
    computeAspectRatio(newSrc || '/placeholder.svg?height=200&width=300')
  }
)
</script>

<template>
    <div class="quiz-card bg-opacity-10 backdrop-blur-md rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:transform hover:scale-105"
    @click="router.push(`/quiz/${ quiz.id }`)"
    >
    <v-img
    :src="quiz.banner || '/placeholder.svg?height=200&width=300'"
    :aspect-ratio="aspectRatio"
    fit="contain"
  ></v-img>
      <div class="p-4">
        <h2 class="text-xl font-semibold text-white mb-2">{{ quiz.title }}</h2>
        <p class="text-gray-300 text-sm mb-4">{{ quiz.description }}</p>
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
          <span v-for="lang in quiz.languageISOCodes" :key="lang.iso_code" class="inline-flex items-center bg-blue-500 bg-opacity-50 rounded-full px-2 py-1 text-xs text-white">
            <img :src="lang.icon" :alt="lang.iso_code" class="w-4 h-4 mr-1" />
            {{ lang.iso_code }}
          </span>
        </div>
        <div class="flex flex-wrap gap-2">
          <span v-for="tag in quiz.tags" :key="tag" class="bg-gray-600 bg-opacity-50 rounded-full px-2 py-1 text-xs text-white">
            {{ tag }}
          </span>
        </div>
      </div>
    </div>
  </template>
  

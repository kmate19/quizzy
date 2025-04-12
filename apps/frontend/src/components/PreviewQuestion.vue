<script setup lang="ts">
import XButton from './XButton.vue';
import type {Question} from '@/utils/type';

defineProps<{
    question: Question,
    index: number,
    handleQuestionRemove: (index: number) => void,
    handleQuestionEdit: (index: number) => void,
}>();

</script>
<template>
    <div class="p-4 rounded-lg bg-white/5 backdrop-blur-sm border-4 border-transparent hover:border-white
     focus:border-white transition-all duration-500 cursor-pointer"
     @click="handleQuestionEdit ? handleQuestionEdit(index) : null">
        <XButton  class="absolute top-2 right-2 z-50" @click.stop="handleQuestionRemove ? handleQuestionRemove(index) : null"/>
        <v-img :key="question.picture" :src="question.picture" height="200" fit />
        <p class="text-white/90 mb-2">{{ question.question }}</p>
        <div class="text-blue-300 bg-white/30 w-fit rounded-lg p-1 text-sm">
            Típus: {{ question.type }}
        </div>
        <div class="flex flex-row flex-wrap gap-2 mt-2">
            <div v-for="(answer, index) in question.answers" :key="index" class="bg-white/30 rounded-lg text-center p-1">
                {{ answer }}
            </div>
        </div>
        <h2 v-if="question.answers && question.correct_answer_index !== undefined" class="text-green-500">
            Helyes válasz: {{ question.answers[question.correct_answer_index] }}
        </h2>
    </div>
</template>
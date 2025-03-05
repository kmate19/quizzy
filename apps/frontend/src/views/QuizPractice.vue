<script setup lang="ts">
import NavBar from '../components/NavBar.vue';
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { getGameQuiz } from '@/utils/functions/practiceFunctions';
import type { Game } from '@/utils/type'
import { useRoute } from 'vue-router';

const quiz = ref<Game>();
const gamePhase = ref<'pre-game' | 'question' | 'results' | 'completed'>('pre-game')
watch(gamePhase, (newValue: string) => {
    console.log('Game phase:', newValue)
    if (gamePhase.value === 'completed') {
        console.log(userAnswers)
    }
})
const currentQuestionIndex = ref(0)
const score = ref(0)
const timer = ref(0)
const preGameTimer = ref(5)
const answerSelected = ref(false)
const lastAnswerCorrect = ref(false)
let timerInterval: number | undefined

const userAnswers = ref<number[]>([])

const currentQuestion = computed(() => quiz.value?.cards[currentQuestionIndex.value])
const isLastQuestion = computed(() => currentQuestionIndex.value === (quiz.value?.cards?.length ?? 0) - 1)

const startPreGameTimer = () => {
    const interval = setInterval(() => {
        preGameTimer.value--
        if (preGameTimer.value === 0) {
            clearInterval(interval)
            startQuestion()
        }
    }, 1000)
}

const startQuestionTimer = () => {
    timer.value = 10
    timerInterval = setInterval(() => {
        timer.value--
        if (timer.value === 0) {
            clearInterval(timerInterval)
            answerSelected.value = true
            lastAnswerCorrect.value = false
            userAnswers.value[currentQuestionIndex.value] = -1
            showResultAndProceed()
        }
    }, 1000) as unknown as number
}

const stopTimer = () => {
    if (timerInterval) {
        clearInterval(timerInterval)
    }
}

const startQuestion = () => {
    gamePhase.value = 'question'
    answerSelected.value = false
    startQuestionTimer()
}

const selectAnswer = (index: number) => {
    console.log(index)
    answerSelected.value = true
    stopTimer()
    const correct = index === currentQuestion.value?.correct_answer_index

    userAnswers.value[currentQuestionIndex.value] = index

    if (correct) {
        score.value++
    }
    lastAnswerCorrect.value = correct

    showResultAndProceed()
}

const showResultAndProceed = () => {
    gamePhase.value = 'results'

    setTimeout(() => {
        if (isLastQuestion.value) {
            gamePhase.value = 'completed'
        } else {
            currentQuestionIndex.value++
            startQuestion()
        }
    }, 500)//meddig van a result elott ido
}

const restartGame = () => {
    currentQuestionIndex.value = 0
    score.value = 0
    preGameTimer.value = 5
    userAnswers.value = []
    gamePhase.value = 'pre-game'
    startPreGameTimer()
}

const getBaseButtonColor = (index: number) => {
    const colors = [
        'bg-red-500 hover:bg-red-600',
        'bg-blue-500 hover:bg-blue-600',
        'bg-yellow-500 hover:bg-yellow-600',
        'bg-purple-500 hover:bg-purple-600'
    ]
    return colors[index]
}

onMounted(async () => {
    const route = useRoute()
    const quizId = route.params.uuid.toString()
    const res = await getGameQuiz(quizId)

    if (res)
        quiz.value = res
    gamePhase.value = 'pre-game'
    startPreGameTimer()
})

onUnmounted(() => {
    stopTimer()
})
</script>

<template>
    <div class="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div class="absolute inset-0 opacity-20">
            <div class="absolute inset-0 bg-[radial-gradient(white_1px,transparent_1px)] bg-[length:20px_20px]"></div>
        </div>
        <div class="relative z-10">
            <NavBar />
        </div>
        <div class="absolute inset-0 flex justify-center items-center w-full pl-2 pr-2">
            <div class=" flex items-center justify-center flex-col gap-2">
                <transition name="fade-slide" mode="out-in" appear>
                    <div v-if="gamePhase === 'pre-game'" class="text-center space-y-4" key="pre-game">
                        <h2 class="text-white text-3xl font-bold mb-4">A gyakorlás hamarosan kezdődik!</h2>
                        <div class="text-white text-6xl font-bold" :key="preGameTimer">
                            {{ preGameTimer }}
                        </div>
                    </div>

                    <div v-else-if="gamePhase === 'question'" class="space-y-4 w-full max-w-4xl" key="question">
                        <div class="flex justify-between items-center m-4 px-4">
                            <div class="text-2xl font-bold text-white">Idő: {{ timer }}mp</div>
                        </div>

                        <div class="bg-white/10 backdrop-blur-lg rounded-lg shadow-lg p-6 mb-4">
                            <img v-if="currentQuestion?.picture" :src="currentQuestion.picture"
                                :alt="currentQuestion.question" class="w-full max-h-64 object-contain mb-6 rounded" />
                            <h2 class="text-xl font-semibold text-white">{{ currentQuestion?.question }}</h2>
                        </div>

                        <transition-group name="fade-scale" tag="div" :class="[
                            'grid gap-4',
                            currentQuestion?.type === 'twochoice' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2 md:grid-cols-2'
                        ]">
                            <button v-for="(answer, index) in currentQuestion?.answers" :key="index" :class="[
                                'p-6 rounded-lg text-white font-bold text-lg transition-all transform hover:scale-105 backdrop-blur-sm',
                                getBaseButtonColor(index),
                            ]" :disabled="answerSelected" @click="selectAnswer(index)">
                                {{ answer }}
                            </button>
                        </transition-group>
                    </div>

                    <div v-else-if="gamePhase === 'completed'"
                        class="text-center space-y-6 text-white sm:w-[50vw] max-w-4xl md:max-w-5xl lg:max-w-6xl"
                        key="completed">
                        <div class="bg-white/20 backdrop-blur-lg rounded-lg shadow-lg p-6 mb-4">
                            <h2 class="text-5xl font-bold mb-4">Játék vége!</h2>
                            <p class="text-3xl mb-6">Eredmény: {{ score }}/{{ quiz?.cards.length }}</p>
                            <!-- Legend -->
                            <div class="flex justify-center mb-4">
                                <div class="flex items-center mr-4">
                                    <div class="w-4 h-4 bg-green-600 rounded-full mr-2"></div>
                                    <span class="text-white">Helyes válasz</span>
                                </div>
                                <div class="flex items-center mr-4">
                                    <div class="w-4 h-4 bg-red-600 rounded-full mr-2"></div>
                                    <span class="text-white">Rossz válasz</span>
                                </div>
                            </div>
                            <transition-group name="list" tag="div" class="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                                <div v-for="(card, qIndex) in quiz?.cards" :key="qIndex" class="p-4 rounded-lg backdrop-blur-md bg-white/10">
                                    <p class="font-medium text-left mb-2 text-white">{{ qIndex + 1 }}. {{ card.question }}</p>
                                    <ul class="text-left list-disc pl-5 space-y-1">
                                        <li v-for="(answer, aIndex) in card.answers" :key="aIndex" class="w-fit" :class="[
                                            aIndex === card.correct_answer_index
                                                ? 'text-white font-bold bg-green-600/80 backdrop-blur-sm p-1 rounded'
                                                : aIndex === userAnswers[qIndex] && aIndex !== card.correct_answer_index
                                                    ? 'text-white font-bold bg-red-600/80 backdrop-blur-sm p-1 rounded'
                                                    : 'text-gray-200 font-bold'
                                        ]">
                                            {{ answer }}
                                            <span v-if="aIndex === card.correct_answer_index" class="ml-1">✓</span>
                                            <span v-if="aIndex === userAnswers[qIndex] && aIndex !== card.correct_answer_index" class="ml-1">✗</span>
                                        </li>
                                    </ul>
                                    <span v-if="userAnswers[qIndex] === -1" class="ml-1 text-red-600 font-bold">Nem válaszoltál</span>
                                </div>
                            </transition-group>
                        </div>

                        <button @click="restartGame"
                            class="bg-green-600/80 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-bold hover:bg-green-700/80 transition-all">
                            Újrakezdés
                        </button>
                    </div>
                </transition>
            </div>
        </div>
    </div>
</template>

<style scoped>
.bg-gradient-to-br {
    animation: gradientShift 15s ease infinite;
}

@keyframes gradientShift {
    0% {
        background-position: 0% 50%;
    }

    50% {
        background-position: 100% 50%;
    }

    100% {
        background-position: 0% 50%;
    }
}

.custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1);
    scroll-behavior: smooth;
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

.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: all 0.3s ease-out;
}

.fade-slide-appear-from {
    opacity: 0;
    transform: translateY(30px);
}

.fade-slide-appear-to {
    opacity: 1;
    transform: translateY(0);
}

.fade-slide-appear-active {
    transition: all 0.3s ease-out;
}

.fade-slide-enter-from {
    opacity: 0;
    transform: translateY(30px);
}

.fade-slide-enter-to {
    opacity: 1;
    transform: translateY(0);
}

.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-30px);
}


.fade-scale-enter-active {
    transition: all 0.3s ease-out;
}

.fade-scale-leave-active {
    transition: all 0.3s ease-out;
    transition-delay: 0;
}

.fade-scale-enter-from {
    opacity: 0;
    transform: scale(0.9);
}

.fade-scale-leave-to {
    opacity: 0;
    transform: scale(0.9);
}

.list-enter-active,
.list-leave-active {
    transition: all 0.4s ease-out;
}

.list-enter-from {
    opacity: 0;
    transform: translateX(-30px);
}

.list-enter-to {
    opacity: 1;
    transform: translateX(0);
}

.list-leave-to {
    opacity: 0;
    transform: translateX(30px);
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease-out;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
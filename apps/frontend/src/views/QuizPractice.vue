<script setup lang="ts">
import NavBar from '@/components/NavBar.vue';
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getQuiz } from '@/utils/functions/editorFunctions';
import { useRoute } from 'vue-router';

interface QuizAnswer {
  text: string;  // Assuming each answer has at least text
}

interface QuizCard {
  question: string;
  type: string;  // Might be more specific like "multiple-choice" | "true-false" etc.
  answers: QuizAnswer[];
  picture: string;  // URL or base64 string
  correct_answer_index: number;
}

interface Quiz {
  title: string;
  banner: string;  // URL or base64 string
  description: string;
  cards: QuizCard[];
}

const quiz = ref<Quiz>();

const gamePhase = ref<'pre-game' | 'question' | 'results' | 'completed'>('pre-game')
const currentQuestionIndex = ref(0)
const score = ref(0)
const timer = ref(20)
const preGameTimer = ref(5)
const answerSelected = ref(false)
const lastAnswerCorrect = ref(false)
let timerInterval: number | undefined

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
    timer.value = 20
    timerInterval = setInterval(() => {
        timer.value--
        if (timer.value === 0) {
            clearInterval(timerInterval)
            answerSelected.value = true
            lastAnswerCorrect.value = false
            setTimeout(() => {
                gamePhase.value = 'results'
            }, 1000)
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
    answerSelected.value = true
    stopTimer()
    const correct = index === currentQuestion.value?.correct_answer_index
    if (correct) {
        score.value += 100
    }
    lastAnswerCorrect.value = correct
    setTimeout(() => {
        gamePhase.value = 'results'
    }, 1000)
}

const nextQuestion = () => {
    if (isLastQuestion.value) {
        gamePhase.value = 'completed'
    } else {
        currentQuestionIndex.value++
        startQuestion()
    }
}

const restartGame = () => {
    currentQuestionIndex.value = 0
    score.value = 0
    preGameTimer.value = 5
    gamePhase.value = 'pre-game'
    startPreGameTimer()
}

const getAnswerButtonClass = (index: number) => {
    if (!answerSelected.value) {
        return getBaseButtonColor(index)
    }

    if (index === currentQuestion.value?.correct_answer_index) {
        return 'bg-green-500'
    }

    return 'bg-red-500'
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
    const res = await getQuiz(quizId)

    console.log(quizId)
    console.log(res)
    if (res?.data) {
        quiz.value = {
            title: res.data.title || 'Untitled Quiz',
            banner: res.data.banner || '',
            description: res.data.description || '',
            cards: res.data.cards?.map((card) => ({
                question: card.question,
                type: card.type,
                answers: card.answers.map(answer => typeof answer === 'string' ? { text: answer } : answer),
                picture: card.picture || '',
                correct_answer_index: card.correct_answer_index,
            })) || [],
        }
    }
    startPreGameTimer()
})

onUnmounted(() => {
    stopTimer()
})
</script>

<template>
    <div class="min-h-screen relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
            <div class="absolute inset-0 opacity-20">
                <div class="absolute inset-0 bg-[radial-gradient(white_1px,transparent_1px)] bg-[length:20px_20px]"></div>
            </div>
        </div>
        <NavBar />

        <div v-if="quiz" class="relative z-10 p-4 min-h-screen">
            <nav class="bg-white/10 backdrop-blur-lg rounded-lg shadow-lg p-4 mb-6">
                <h1 class="text-3xl font-bold text-white text-center">{{ quiz.title }}</h1>
                <p class="text-gray-200 text-center">{{ quiz.description }}</p>
            </nav>

            <div v-if="gamePhase === 'pre-game'" class="text-center text-white">
                <div class="text-8xl font-bold mb-4 animate-pulse">{{ preGameTimer }}</div>
                <p class="text-2xl">Készülj fel!</p>
            </div>

            <div v-else-if="gamePhase === 'question'" class="space-y-4">
                <div class="flex justify-between items-center mb-4 px-4">
                    <div class="text-2xl font-bold text-white">Idő: {{ timer }}mp</div>
                    <div class="text-2xl font-bold text-white">Pontszám: {{ score }}</div>
                </div>

                <div class="bg-white/10 backdrop-blur-lg rounded-lg shadow-lg p-6 mb-4">
                    <img v-if="currentQuestion?.picture" :src="currentQuestion.picture" :alt="currentQuestion.question"
                        class="w-full max-h-64 object-contain mb-6 rounded" />
                    <h2 class="text-xl font-semibold text-white">{{ currentQuestion?.question }}</h2>
                </div>

                <div :class="[
                    'grid gap-4',
                    currentQuestion?.type === 'twochoice' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2 md:grid-cols-2'
                ]">
                    <button v-for="(answer, index) in currentQuestion?.answers" :key="index" :class="[
                        'p-6 rounded-lg text-white font-bold text-lg transition-all transform hover:scale-105 backdrop-blur-sm',
                        getAnswerButtonClass(index),
                    ]" :disabled="answerSelected" @click="selectAnswer(index)">
                        {{ answer.text }}
                    </button>
                </div>
            </div>

            <div v-else-if="gamePhase === 'results'" class="text-center space-y-6 text-white">
                <h2 class="text-3xl font-bold">
                    {{ lastAnswerCorrect ? 'Helyes! 🎉' : 'Helytelen! 😢' }}
                </h2>
                <p class="text-2xl">
                    {{ lastAnswerCorrect ? '+100 pont!' : 'Nem kaptál pontot' }}
                </p>
                <button @click="nextQuestion"
                    class="bg-purple-600/80 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-bold hover:bg-purple-700/80 transition-all">
                    {{ isLastQuestion ? 'Végeredmény megtekintése' : 'Következő kérdés' }}
                </button>
            </div>

            <div v-else-if="gamePhase === 'completed'" class="text-center space-y-6 text-white">
                <h2 class="text-5xl font-bold mb-4">Játék vége!</h2>
                <p class="text-3xl">Eredmény: {{ score }}</p>
                <button @click="restartGame"
                    class="bg-green-600/80 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-bold hover:bg-green-700/80 transition-all">
                    Újrakezdés
                </button>
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
</style>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { getGameQuiz } from '@/utils/functions/practiceFunctions';
import type { Game } from '@/utils/type'
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';

const router = useRouter()
const quiz = ref<Game>();
const gamePhase = ref<'pre-game' | 'question' | 'results' | 'completed'>('pre-game')
const currentQuestionIndex = ref(0)
const score = ref(0)
const timer = ref(0)
const preGameTimer = ref(3)
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
    }, 500)
}


const getBaseButtonColor = (index: number) => {
    const colors = [
        'bg-red-500 hover:bg-red-600',
        'bg-blue-500 hover:bg-blue-600',
        'bg-yellow-500 hover:bg-yellow-600',
        'bg-green-500 hover:bg-green-600'
    ]
    return colors[index]
}



onUnmounted(() => {
    stopTimer()
})

const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
};

const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    const d = [
        "M", start.x, start.y,
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
        "L", x, y,
        "Z"
    ].join(" ");
    return d;
};

const shuffleArray = <T>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const shuffledAnswers = ref<Array<{ answer: string; originalIndex: number }[]>>([]);

const shuffleAnswers = () => {
    if (!quiz.value?.cards) return;

    shuffledAnswers.value = quiz.value.cards.map(card => {
        const answersWithIndices = card.answers.map((answer, index) => ({
            answer,
            originalIndex: index
        }));

        return shuffleArray([...answersWithIndices]);
    });
};

const restartGame = () => {
    currentQuestionIndex.value = 0
    score.value = 0
    preGameTimer.value = 3
    userAnswers.value = []
    gamePhase.value = 'pre-game'
    shuffleAnswers()
    startPreGameTimer()
}

onMounted(async () => {
    const route = useRoute()
    const quizId = route.params.uuid.toString()
    const res = await getGameQuiz(quizId)

    if (res)
        quiz.value = res
    gamePhase.value = 'pre-game'
    shuffleAnswers()
    startPreGameTimer()
})


</script>

<template>

    <div class="absolute inset-0 flex justify-center items-center w-full pl-2 pr-2">
        <div class=" flex items-center justify-center flex-col gap-2">
            <transition name="fade-slide" mode="out-in" appear>
                <div v-if="gamePhase === 'question' || gamePhase === 'results'"
                    class="w-3/4 rounded-full h-4 mb-4 flex fixed top-20 z-50 ">
                    <div class="w-full rounded-full h-4 mb-4 flex z-20">
                        <div class="flex w-full space-x-2 ">
                            <div v-for="index in quiz?.cards.length" :key="index"
                                class="h-5 flex-1 rounded-full overflow-hidden backdrop-filter ">
                                <div class="h-full transition-all duration-300 rounded-full glass-progress " :class="{
                                    'bg-green-500/70 backdrop-blur-sm border border-green-300/50 shadow-green-500/30': index - 1 < currentQuestionIndex,
                                    'bg-blue-500/70 backdrop-blur-sm border border-blue-300/50 shadow-blue-500/30 animate-pulse': index - 1 === currentQuestionIndex,
                                    'bg-white/10 backdrop-blur-sm border border-white/20': index - 1 > currentQuestionIndex
                                }">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>
            <transition name="fade-slide" mode="out-in" appear>
                <div v-if="gamePhase === 'pre-game'" class="text-center space-y-4" key="pre-game">
                    <h2 class="text-white text-3xl font-bold mb-4">A gyakorlás hamarosan kezdődik!</h2>
                    <div class="text-white text-6xl font-bold" :key="preGameTimer">
                        {{ preGameTimer }}
                    </div>
                </div>
                <div v-else-if="gamePhase === 'question'" class="space-y-4 w-full max-w-4xl" key="question">

                    <div class="bg-white/10 backdrop-blur-lg p-2 rounded-lg shadow-lg  mx-auto">
                        <div class="flex justify-center items-center m-4 px-4 top-4 right-0 absolute z-50">
                            <svg class="w-12 h-12" viewBox="0 0 48 48">
                                <circle cx="24" cy="24" r="20"
                                    :fill="timer === 10 ? 'rgba(65, 105, 225, 0.9)' : 'white'" stroke="black"
                                    stroke-width="2" />

                                <path :d="'M24,24 L24,4 A20,20 0 ' + (timer <= 5 ? 0 : 1) + ',1 ' +
                                    (24 + 20 * Math.sin(2 * Math.PI * timer / 10)) + ',' +
                                    (24 - 20 * Math.cos(2 * Math.PI * timer / 10)) + ' Z'"
                                    fill="rgba(65, 105, 225, 0.9)" />
                                <text x="24" y="26" text-anchor="middle" dominant-baseline="middle" font-size="24"
                                    font-weight="bold" class="z-50">{{ timer }}</text>
                            </svg>
                        </div>

                        <div class="p-6 mb-4 flex items-center justify-center flex-col gap-4 w-full">
                            <img v-if="currentQuestion?.picture" :src="currentQuestion.picture"
                                :alt="currentQuestion.question" class="w-full max-h-96 object-contain mb-6 rounded" />
                            <h2 class="text-xl font-semibold text-white">{{ currentQuestion?.question }}</h2>
                        </div>

                        <transition-group name="fade-scale" tag="div" :class="[
                            'grid gap-4',
                            currentQuestion?.type === 'twochoice' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2 md:grid-cols-2'
                        ]">
                            <button v-for="(answerObj, index) in shuffledAnswers[currentQuestionIndex]" :key="index"
                                :class="[
                                    'p-6 rounded-lg text-white font-bold text-lg transition-all transform hover:scale-105 backdrop-blur-sm',
                                    getBaseButtonColor(answerObj.originalIndex),
                                ]" :disabled="answerSelected" @click="selectAnswer(answerObj.originalIndex)">
                                {{ answerObj.answer }}
                            </button>
                        </transition-group>
                    </div>
                </div>
                <div v-else-if="gamePhase === 'completed'" class="text-center space-y-6 text-white w-full mx-auto p-4 min-h-[calc(100vh-10vh)] min-w-[calc(100vw-10vw)]
                        lg:min-w-[calc(100vw-30vw)] lg:min-h-[calc(100vh-20vh)] flex items-center justify-center">
                    <div class="bg-white/10 rounded-3xl shadow-lg p-6 md:p-8 mb-4 flex flex-col items-center gap-2 w-full max-w-[95%] md:max-w-[90%] lg:max-w-[85%]
                        lg:max-h-[calc(100vh-20vh)]">
                        <div class="relative inline-flex items-center justify-center">
                            <svg class="w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="red" class="backdrop-blur-sm" />
                                <path :d="describeArc(50, 50, 45, 0, (score / (quiz?.cards.length || 1)) * 360)"
                                    fill="green" />
                                <text x="50" y="50" text-anchor="middle" dominant-baseline="middle" fill="white"
                                    class="text-xl md:text-2xl lg:text-3xl font-bold">{{ score }}/{{
                                        quiz?.cards.length }}</text>
                            </svg>
                        </div>
                        <div class="flex justify-center mb-4 flex-wrap">
                            <div class="flex items-center mr-2 md:mr-4 mb-1">
                                <div class="w-3 h-3 md:w-4 md:h-4 bg-green-600 rounded-full mr-1 md:mr-2"></div>
                                <span class="text-sm md:text-base text-white font-bold">Helyes válasz</span>
                            </div>
                            <div class="flex items-center mr-2 md:mr-4 mb-1">
                                <div class="w-3 h-3 md:w-4 md:h-4 bg-red-600 rounded-full mr-1 md:mr-2"></div>
                                <span class="text-sm md:text-base text-white font-bold">Rossz válasz</span>
                            </div>
                        </div>
                        <transition-group name="list" tag="div"
                            class="space-y-2 md:space-y-4 max-h-[40vh] md:max-h-[50vh] lg:max-h-[60vh] overflow-y-auto custom-scrollbar w-full">
                            <div v-for="(card, qIndex) in quiz?.cards" :key="qIndex"
                                class="p-2 md:p-4 rounded-lg backdrop-blur-md bg-white/20">
                                <p class="font-medium text-center mb-1 md:mb-2 text-white text-sm md:text-base">{{
                                    qIndex + 1 }}. {{ card.question
                                    }}</p>
                                <ul class="text-left list-disc pl-5 space-y-0.5 md:space-y-1 flex sm:flex-row sm:justify-evenly sm:flex-wrap 
                                    flex-col items-center gap-2">
                                    <li v-for="(answerObj, aIndex) in shuffledAnswers[qIndex]" :key="aIndex"
                                        class="w-fit" :class="[
                                            answerObj.originalIndex === card.correct_answer_index
                                                ? 'text-white font-bold bg-green-600/80 backdrop-blur-sm p-0.5 md:p-1 rounded'
                                                : answerObj.originalIndex === userAnswers[qIndex] && answerObj.originalIndex !== card.correct_answer_index
                                                    ? 'text-white font-bold bg-red-600/80 backdrop-blur-sm p-0.5 md:p-1 rounded'
                                                    : 'text-gray-200 font-bold'
                                        ]">
                                        {{ answerObj.answer }}
                                        <span v-if="answerObj.originalIndex === card.correct_answer_index"
                                            class="ml-0.5 md:ml-1">✓</span>
                                        <span
                                            v-if="answerObj.originalIndex === userAnswers[qIndex] && answerObj.originalIndex !== card.correct_answer_index"
                                            class="ml-0.5 md:ml-1">✗</span>
                                    </li>
                                </ul>
                                <span v-if="userAnswers[qIndex] === -1"
                                    class="ml-1 text-red-600 font-bold text-sm md:text-base">Nem
                                    válaszoltál</span>
                            </div>
                        </transition-group>
                        <div class="w-full mt-4 flex flex-col md:flex-row gap-3">
                            <button @click="restartGame"
                                class="bg-green-600 text-white px-6 py-3 rounded-full font-bold hover:bg-green-700 transition-all flex-1">
                                Újrakezdés
                            </button>
                            <button @click="router.back()"
                                class="bg-transparent border border-white text-white px-6 py-3 rounded-full font-bold hover:bg-white/10 transition-all flex-1">
                                Vissza
                            </button>
                        </div>
                    </div>
                </div>
            </transition>
        </div>
    </div>
</template>

<style scoped>

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
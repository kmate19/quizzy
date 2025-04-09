<script lang="ts" setup>
import { shallowRef, defineAsyncComponent } from 'vue';
import { useQuizzyStore } from '@/stores/quizzyStore';

const quizzyStore = useQuizzyStore();

const GameView = defineAsyncComponent(() => import('@/views/game/GameView.vue'));
const ParticipantGame = defineAsyncComponent(() => import('@/views/game/ParticipantGame.vue'));

const selectedComponent = shallowRef<typeof GameView | typeof ParticipantGame>(GameView);

selectedComponent.value = quizzyStore.isHost ? GameView : ParticipantGame;
</script>

<template>
  <component :is="selectedComponent" />
</template>

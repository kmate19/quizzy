<script lang="ts" setup>
import { ref, shallowRef, onMounted, watchEffect, defineAsyncComponent } from 'vue';
import { useQuizzyStore } from '@/stores/quizzyStore';

const quizzyStore = useQuizzyStore();
const userRole = ref<boolean>(false);

const GameView = defineAsyncComponent(() => import('@/views/GameView.vue'));
const ParticipantGame = defineAsyncComponent(() => import('@/views/ParticipantGame.vue'));

const selectedComponent = shallowRef<typeof GameView | typeof ParticipantGame>(GameView);

onMounted(() => {
  userRole.value = quizzyStore.isHost;
  console.log('User Role:', userRole.value);
});

watchEffect(() => {
  selectedComponent.value = userRole.value === true ? GameView : ParticipantGame;
  console.log('Selected Component:', selectedComponent.value);
});
</script>

<template>
  <component :is="selectedComponent" />
</template>

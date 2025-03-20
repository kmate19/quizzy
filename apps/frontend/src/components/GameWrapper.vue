<script lang="ts" setup>
import { ref, shallowRef, onMounted, watchEffect } from 'vue';
import GameView from '@/views/GameView.vue';
import ParticipantGame from '@/views/ParticipantGame.vue';
import { useQuizzyStore } from '@/stores/quizzyStore';

const quizzyStore = useQuizzyStore();
const userRole = ref<boolean>(false);

// Use shallowRef to store the component without making it reactive
const selectedComponent = shallowRef<typeof GameView | typeof ParticipantGame>(GameView);

onMounted(() => {
  userRole.value = quizzyStore.isHost; // Ensure this is reactive
  console.log('User Role:', userRole.value);
});

// Watch for changes in userRole and update selectedComponent
watchEffect(() => {
  selectedComponent.value = userRole.value === true ? GameView : ParticipantGame;
  console.log('Selected Component:', selectedComponent.value);
});
</script>

<template>
  <component :is="selectedComponent" />
</template>

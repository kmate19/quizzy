<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { ref, onMounted } from 'vue';

const route = useRoute();
const uuid = route.params.uuid;

const isJoining = ref(true);

onMounted(() => {
  if (uuid) {
    isJoining.value = false;
  }
});

</script>
<template>
    <div>
      <h1>Multiplayer</h1>
      <p v-if="uuid">Lobby Code: {{ uuid }}</p>
      <p v-else>Joining the lobby...</p>
    </div>
  </template>
<style scoped>
    

</style>
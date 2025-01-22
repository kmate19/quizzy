<script setup lang="ts">
import { ref } from 'vue';
import { Search } from 'lucide-vue-next';

const isExpanded = ref(false);

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
  if (isExpanded.value) {
    setTimeout(() => {
      document.querySelector<HTMLInputElement>('.search-input')?.focus() ;
    }, 100);
  }
};
</script>

<template>
  <div class="relative m-5">
    <div
      :class="[
        'flex items-center transition-all duration-300 ease-in-out rounded-full border border-gray-300 bg-white',
        isExpanded ? 'w-full' : 'w-14 cursor-pointer hover:bg-gray-50'
      ]"
    >
      <div class="flex items-center px-4 py-2" @click="toggleExpand">
        <Search class="h-5 w-5 text-gray-500" />
      </div>
      <input
        type="text"
        placeholder="Keresés..."
        class="search-input w-full bg-transparent outline-none pr-4"
        :class="{ 'opacity-0': !isExpanded, 'opacity-100': isExpanded }"
        :disabled="!isExpanded"
        @blur="isExpanded = false"
      />
    </div>
  </div>
</template>

<style scoped>
.search-input {
  transition: opacity 0.2s ease-in-out;
}
</style>
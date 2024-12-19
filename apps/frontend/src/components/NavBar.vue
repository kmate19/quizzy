<script setup lang="ts">
      import { useRoute } from 'vue-router'
      const route = useRoute()

</script>

<template>
        <nav :class="'transition-all duration-300 ease-in-out'">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
            <div class="flex items-center">
                <a href="#" class="text-2xl font-bold text-white">Quizzy/{{ route.fullPath.split('/')[1].charAt(0).toUpperCase()
                + route.fullPath.split('/')[1].slice(1) }}</a>
            </div>
            <div class="hidden md:block">
            <div class="ml-10 flex items-baseline space-x-4">
                <a href="#" class="text-white hover:bg-white/50 px-3 py-2 rounded-md text-sm font-medium">Közös játék</a>
                <a href="#" class="text-white hover:bg-white/50 px-3 py-2 rounded-md text-sm font-medium">Profil</a>
                <a href="#" class="text-white hover:bg-white/50 px-3 py-2 rounded-md text-sm font-medium">Pulcsik</a>
            </div>
            </div>
        </div>
        </div>
        </nav>        
</template>
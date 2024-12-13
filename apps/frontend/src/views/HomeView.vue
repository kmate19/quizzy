<script lang="ts" setup>
    import MistBackground from '@/components/MistBackground.vue';
    console.log("home view");
</script>

<template>
    <MistBackground/>
    <div class="home-view">
        <h1>Welcome to HomeView</h1>
        <p>This is the home page of the application.</p>
    </div>
</template>

<style scoped>
.home-view {
    text-align: center;
    margin-top: 50px;
}
</style>
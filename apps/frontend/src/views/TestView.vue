<script setup lang="ts">
import { ref } from 'vue';

const isFlipped = ref(false);

const flipCard = () => {
  isFlipped.value = !isFlipped.value;
};
</script>

<template>
  <v-card
    class="!w-full !max-h-full !p-10 !rounded-3xl !shadow-2xl text-black"
    prepend-icon="$login"
    theme="dark"
  >
    <template v-slot:title>
      <span class="font-weight-black">{{isFlipped ? 'Regisztráció' : 'Bejelentkezés'}}</span>
    </template>
    <v-card-text class="bg-surface-light pt-4 !rounded-3xl p-24 h-fit">
      <transition name="flip">
        <div class="p-10" v-if="!isFlipped">
          <v-text-field label="Felhasználónév" required></v-text-field>
          <v-text-field label="Jelszó" type="password" required></v-text-field>
          <div class="flex flex-wrap items-center">
            <v-btn class="w-full !mt-10">Bejelentkezés</v-btn>
            <br>
            <v-btn class="w-full !mt-10" @click="flipCard">Nincs fiókod? Regisztrálj!</v-btn>
          </div>
        </div>
        <div class="p-10" v-else>
          <v-text-field label="Email" required></v-text-field>
          <v-text-field label="Felhasználónév" required></v-text-field>
          <v-text-field label="Jelszó" type="password" required></v-text-field>
          <v-text-field label="Jelszó megerősítés" type="password" required></v-text-field>
          <div class="flex flex-wrap items-center">
            <v-btn class="w-full !mt-10">Regisztráció</v-btn>
            <br>
            <v-btn class="w-full !mt-10" @click="flipCard">Van már fiókod? Lépj be!</v-btn>
          </div>
        </div>
      </transition>
    </v-card-text>
  </v-card>
</template>

<style>
body{
  background-color: #f5f5f5;
}

.flip-enter-active, .flip-leave-active {
  transition: transform 0.5s;
}
.flip-enter, .flip-leave-to {
  transform: rotateY(180deg);
}

</style>

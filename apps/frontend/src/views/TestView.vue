<script setup lang="ts">
import { ref } from 'vue';

const isFlipped = ref(false);
const password = ref('');
const confirmPassword = ref('');

const flipCard = () => {
  isFlipped.value = !isFlipped.value;
};

const emailRules = [
  (v: string) => !!v || 'Email kötelező',
  (v: string) => /.+@.+\..+/.test(v) || 'Email formátum nem megfelelő'
];

const usernameRules = [
  (v: string) => !!v || 'Felhasználónév kötelező',
];

const passwordRules = [
  (v: string) => !!v || 'Jelszó kötelező',
  (v: string) => v.length >= 8 || 'Jelszó minimum 8 karakter hosszú',
  (v: string) => /[A-Z]/.test(v) || 'Jelszó tartalmazzon legalább egy nagybetűt',
  (v: string) => /[a-z]/.test(v) || 'Jelszó tartalmazzon legalább egy kisbetűt',
  (v: string) => /[0-9]/.test(v) || 'Jelszó tartalmazzon legalább egy számot',
  (v: string) => /[!@#\$%\^\&*\)\(+=._-]/.test(v) || 'Jeleszó tartalmazzon legalább egy speciális karaktert'
];

const confirmPasswordRules = [
(v: string) => !!v || 'Jelszó kötelező',
  (v: string) => v.length >= 8 || 'Jelszó minimum 8 karakter hosszú',
  (v: string) => /[A-Z]/.test(v) || 'Jelszó tartalmazzon legalább egy nagybetűt',
  (v: string) => /[a-z]/.test(v) || 'Jelszó tartalmazzon legalább egy kisbetűt',
  (v: string) => /[0-9]/.test(v) || 'Jelszó tartalmazzon legalább egy számot',
  (v: string) => /[!@#\$%\^\&*\)\(+=._-]/.test(v) || 'Jeleszó tartalmazzon legalább egy speciális karaktert'
];
</script>

<template >
  <div class="flex flex-row">
    <v-card
      class="!w-full !max-h-full !p-10 !rounded-3xl !shadow-2xl text-black"
      prepend-icon="$login"
      theme="dark"
      :min-width="470"
    >
      <template v-slot:title>
        <div class="w-full flex justify-evenly">
        <span class="font-weight-black">{{isFlipped ? 'Regisztráció' : 'Bejelentkezés'}}</span>
        </div>
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
            <v-text-field label="Email" :rules="emailRules" required></v-text-field>
            <v-text-field label="Felhasználónév" :rules="usernameRules" required></v-text-field>
            <v-text-field label="Jelszó" v-model="password" type="password" :rules="passwordRules" required></v-text-field>
            <v-text-field label="Jelszó megerősítés" v-model="confirmPassword" type="password" :rules="confirmPasswordRules" required></v-text-field>
            <div class="flex flex-wrap items-center">
              <v-btn class="w-full !mt-10">Regisztráció</v-btn>
              <br>
              <v-btn class="w-full !mt-10" @click="flipCard">Van már fiókod? Lépj be!</v-btn>
              <v-alert v-if="password !== confirmPassword" type="error" class="w-full !mt-10">
                A jelszavak nem egyeznek.
              </v-alert>
            </div>
          </div>
        </transition>
      </v-card-text>
    </v-card>
  </div>
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

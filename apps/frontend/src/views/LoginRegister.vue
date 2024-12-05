<script setup lang="ts">
import { ref } from 'vue';
import MistBackground from '@/components/MistBackground.vue';

const isLoginForm = ref(true);
const isRegisterForm = ref(false);
const password = ref('');
const confirmPassword = ref('');

const flipLogin = () => {
  isLoginForm.value = !isLoginForm.value;
  setTimeout(() => {
    isRegisterForm.value = !isRegisterForm.value;
  }, 500);
};
const flipRegister = () => {
  isRegisterForm.value = !isRegisterForm.value;
  setTimeout(() => {
    isLoginForm.value = !isLoginForm.value;
  }, 500);
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
  (v: string) => /[!@#\$%\^\&*\)\(+=._-]/.test(v) || 'Jeleszó tartalmazzon legalább egy speciális karaktert',
  (v: string) => /[0-9]/.test(v) || 'Jelszó tartalmazzon legalább egy számot'
];

const confirmPasswordRules = [
(v: string) => !!v || 'Jelszó kötelező',
(v: string) => /[A-Z]/.test(v) || 'Jelszó tartalmazzon legalább egy nagybetűt',
(v: string) => /[a-z]/.test(v) || 'Jelszó tartalmazzon legalább egy kisbetűt',
(v: string) => /[0-9]/.test(v) || 'Jelszó tartalmazzon legalább egy számot',
(v: string) => /[!@#\$%\^\&*\)\(+=._-]/.test(v) || 'Jeleszó tartalmazzon legalább egy speciális karaktert',
(v: string) => v.length >= 8 || 'Jelszó minimum 8 karakter hosszú'
];
</script>

<template>
  <MistBackground>
    <div class="!flex !items-center !justify-center">
      <v-card
        class="!max-w-full !max-h-full !p-10 !rounded-2xl text-black
         bg-black bg-opacity-50 backdrop-blur-md
         !min-w-100 !min-h-fit"
        prepend-icon="$login"
        theme="dark"
      >
        <template v-slot:title>
          <div class="min-w-full flex justify-evenly">
          <span class="font-weight-black text-3xl">{{isLoginForm ? 'Bejelentkezés' : 'Regisztráció'}}</span>
          </div>
        </template>
        <v-card-text class="bg-surface-light !bg-opacity-25 pt-4 rounded-xl p-24 h-fit">
          <transition name="flip">
            <div class="p-10" v-if="isLoginForm">
              <v-text-field label="Felhasználónév" required></v-text-field>
              <v-text-field label="Jelszó" type="password" required></v-text-field>
              <div class="flex flex-wrap items-center">
                <v-btn class="w-full !mt-5">Bejelentkezés</v-btn>
                <br>
                <v-btn class="w-full !mt-5" @click="flipLogin">Nincs fiókod? Regisztrálj!</v-btn>
              </div>
            </div>
          </transition>
          <transition name="flip">
              <div class="p-10" v-if="isRegisterForm">
                <v-text-field label="Email" :rules="emailRules" required></v-text-field>
                <v-text-field label="Felhasználónév" :rules="usernameRules" required></v-text-field>
                <v-text-field label="Jelszó" v-model="password" type="password" :rules="passwordRules" required></v-text-field>
                <v-text-field label="Jelszó megerősítés" v-model="confirmPassword" type="password" :rules="confirmPasswordRules" required></v-text-field>
                <div class="flex flex-wrap items-center">
                  <v-btn class="w-full !mt-5">Regisztráció</v-btn>
                  <br>
                  <v-btn class="w-full !mt-5" @click="flipRegister">Van már fiókod? Lépj be!</v-btn>
                </div>
              </div>
          </transition>
          <v-alert v-if="password !== confirmPassword && isRegisterForm" type="error" class="w-full">
                A jelszavak nem egyeznek.
                </v-alert>
        </v-card-text>
      </v-card>
    </div>
  </MistBackground>
</template>

<style scoped>

.flip-enter-active {
  transform: scale(0);
  transition: transform 0.5s;
}
.flip-enter-to {
  transform: scale(1);
}

 .flip-leave-active {
  transition: transform 0.5s;
}

.flip-leave-to {
  transform: scale(0);
}

</style>

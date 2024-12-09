<script setup lang="ts">
import { ref, watch } from 'vue';
import * as zod from 'zod';
import { useField, useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import MistBackground from '@/components/MistBackground.vue';
import * as Alerts from '@/components/Alerts.vue';

const isLoginForm = ref(true);
const isRegisterForm = ref(false);

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

const regForm = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const loginForm = ref({
  username: '',
  password: '',
})

const isBig = ref(window.innerWidth >= 1440? true : false);

watch(
  () => window.innerWidth,
  (newWidth) => {
    isBig.value = newWidth >= 1440;
  }
);

window.addEventListener('resize', () => {
  isBig.value = window.innerWidth >= 1440;
});

const validationSchema = zod.object({
    email: zod.string()
      .min(1, { message: 'A mező kitöltése kötelező' })
      .email({ message: 'Helytelen formátum' }),
    username: zod.string()
      .min(1, { message: 'A mező kitöltése kötelező'}),
    password: zod.string()
      .min(1, { message: 'A mező kitöltése kötelező' })
      .min(8, { message: 'Minimum 8 karaktert kell tartalmaznia' })
      .regex(/[a-z]/, { message: 'Tartalmaznia kell kisbetűt' })
      .regex(/[A-Z]/, { message: 'Tartalmaznia kell nagybetűt' })
      .regex(/[^a-zA-Z0-9]/, { message: 'Tartalmaznia kell speciális karaktert' }),
    confirmPassword: zod.string()
      .min(1, { message: 'A mező kitöltése kötelező' })
      .min(8, { message: 'Minimum 8 karaktert kell tartalmaznia' })
      .regex(/[a-z]/, { message: 'Tartalmaznia kell kisbetűt' })
      .regex(/[A-Z]/, { message: 'Tartalmaznia kell nagybetűt' })
      .regex(/[^a-zA-Z0-9]/, { message: 'Tartalmaznia kell speciális karaktert' })
      .refine((data) => data === regForm.value.password, { message: 'A jelszavak nem egyeznek' }),
  });

const loginvalidSchema = zod.object({
  username: zod.string()
    .min(1, { message: 'A mező kitöltése kötelező'}),
  password: zod.string().min(1, { message: 'A mező kitöltése kötelező'})
});

type loginSchemaType = zod.infer<typeof loginvalidSchema>;
type regSchemaType = zod.infer<typeof validationSchema>;

const regErrors = ref<zod.ZodFormattedError<regSchemaType> | null >(null)
const loginErrors = ref<zod.ZodFormattedError<loginSchemaType> | null >(null)

const onRegistration = () => {
  const valid = validationSchema.safeParse(regForm.value);

  if(!valid.success) {
    regErrors.value = valid.error.format();
    console.log('Invalid form', regErrors.value);
  }
  else{
    regErrors.value = null;
    console.log('Valid form', regForm.value.email, regForm.value.username, regForm.value.password, regForm.value.confirmPassword);
  }
};

const onLogin = () => {
  const valid = loginvalidSchema.safeParse(loginForm.value);

  if(!valid.success) {
    loginErrors.value = valid.error.format();
    console.log('Invalid form', loginErrors.value);
  }
  else{
    loginErrors.value = null;
    console.log('Valid form', loginForm.value.username, loginForm.value.password);
  }
};

</script>

<template>
  <MistBackground>
  </MistBackground>
      <div class="wrapper">
        <v-card
          class="vcard !p-10 !rounded-2xl text-black
          bg-black bg-opacity-50 backdrop-blur-md
          !min-h-fit duration-500"
          theme="dark"
          :min-width="400"
        >
          <template v-slot:title>
        <div class="min-w-full flex justify-evenly">
        <span class="font-weight-black text-3xl">{{isLoginForm ? 'Bejelentkezés' : 'Regisztráció'}}</span>
        </div>
          </template>
          <v-card-text class="bg-surface-light !bg-opacity-25 pt-4 rounded-xl p-24 h-fit">
        <form @submit.prevent="onLogin">
          <transition name="flip" mode="out-in">
            <div class="p-10" v-if="isLoginForm" key="login">
          <v-text-field label="Felhasználónév" v-model="loginForm.username" class="!pb-0"></v-text-field>
            
          <v-text-field label="Jelszó" type="password" v-model="loginForm.password" class="!pb-0"></v-text-field>
          <div class="flex flex-wrap items-center">
            <v-btn type="submit" class="w-full !mt-5">Bejelentkezés</v-btn>
            <br>
            <v-btn class="w-full !mt-5" @click="flipLogin">Nincs fiókod? Regisztrálj!</v-btn>
          </div>
            </div>
          </transition>
        </form>

        <form @submit.prevent="onRegistration">
          <transition name="flip" mode="out-in">
          <div class="p-10" v-if="isRegisterForm" key="register">
            <v-text-field label="Email" name="email" v-model="regForm.email" required></v-text-field>
            <span v-if="regErrors?.email" class="text-red-500">
              <span v-for="error in regErrors?.email?._errors">
            {{error}}<br>
              </span>
            </span>
            <v-text-field label="Felhasználónév" name="username" v-model="regForm.username" required></v-text-field>
            <span v-if="regErrors?.username" class="text-red-500">
              <span v-for="error in regErrors?.username?._errors">
            {{error}}<br>
              </span>
            </span>
            <v-text-field label="Jelszó" v-model="regForm.password" type="password"  required></v-text-field>
            <span v-if="regErrors?.password" class="text-red-500">
              <span v-for="error in regErrors?.password?._errors">
            {{error}}<br>
              </span>
            </span>
            <v-text-field label="Jelszó megerősítés" v-model="regForm.confirmPassword" type="password" required></v-text-field>
            <span v-if="regErrors?.confirmPassword" class="text-red-500">
              <span v-for="error in regErrors?.confirmPassword?._errors">
            {{error}}<br>
              </span>
            </span>
            <div class="flex flex-wrap items-center">
              <v-btn class="w-full !mt-5" @click="onRegistration">Regisztráció</v-btn>
              <br>
              <v-btn class="w-full !mt-5" @click="flipRegister">Van már fiókod? Lépj be!</v-btn>
            </div>
          </div>
            </transition>
        </form>
          </v-card-text>
        </v-card>
        <div class="headers flex flex-col justify-center items-center text-center
          bg-opacity-50
          backdrop-blur-md
          rounded-2xl
          ">
            <h1 class="title text-9xl text-white">Quizzy</h1>
            <h3 v-show="isBig" class="quote text-5xl text-white">Fun way to learn haha</h3>
        </div>
      </div>
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

.wrapper{
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  padding: 5px;
}

.headers{
  height: 50%;
  width: 50%;
  align-self: center;
  justify-content: space-evenly;
  gap: 20px;
}

.vcard{
  height: 50%;
  align-self: center;
}

.title{
  font-size: 10vh;
  line-height: 1;
} 
.quote{
  font-size: 6vh;
  line-height: 1;
}

@media only screen and (max-width: 1440px) {
  .wrapper {
    flex-direction: column-reverse !important;
    justify-content: center;
    align-items: center;
    justify-content: space-evenly;
  }
  .headers{
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    width: auto;
    height: 25%;
  }
  .headers h1{
    font-size: 10vh;
  }
}
</style>

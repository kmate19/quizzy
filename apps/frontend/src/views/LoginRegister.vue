<script setup lang="ts">
import { ref } from 'vue';
import * as zod from 'zod';
import router from '@/router';

import MistBackground from '@/components/MistBackground.vue';
import { EyeIcon, EyeOffIcon } from 'lucide-vue-next';



const isLoginForm = ref(true);

const flipLogin = () => {
  isLoginForm.value = !isLoginForm.value;
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

const registerSchema = zod.object({
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
type regSchemaType = zod.infer<typeof registerSchema>;

const regErrors = ref<zod.ZodFormattedError<regSchemaType> | null >(null)
const loginErrors = ref<zod.ZodFormattedError<loginSchemaType> | null >(null)

const onRegistration = () => {
  const valid = registerSchema.safeParse(regForm.value);

  if(!valid.success) {
    regErrors.value = valid.error.format();
    console.log('Invalid form', regErrors.value);
  }
  else{
    regErrors.value = null;
    console.log('Valid form', regForm.value.email, regForm.value.username, regForm.value.password, regForm.value.confirmPassword);
    //toast show
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
    //localStorage.setItem('userData', JSON.stringify(api response));
    router.push('/home');
  }
};

const showPassword = ref(false)

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

</script>

<template>
  <MistBackground/>
      <div class="wrapper">
        <v-card
          class="vcard !p-10 !rounded-2xl text-black  !bg-white/30
           bg-opacity-50 backdrop-blur-sm
          !min-h-fit !min-w-fit !max-w-fit !max-h-fit"
          :min-width="400"
          theme="dark"
        >
          <template v-slot:title>
            <div class="min-w-full flex justify-evenly">
              <span class="font-weight-black text-3xl">{{isLoginForm ? 'Bejelentkezés' : 'Regisztráció'}}</span>
            </div>
          </template>
        <div v-if="isLoginForm">
          <form @submit.prevent="onLogin">
              <v-text-field 
              label="Felhasználónév" 
              v-model="loginForm.username"
              variant="outlined"
              density="comfortable">
            </v-text-field>
                <span v-if="loginErrors" class="text-red-500">
                    Helytelen felhasználónév vagy jelszó
                </span>
                  <v-text-field 
                  name="pw" 
                  label="Jelszó" 
                  v-model="loginForm.password"
                  variant="outlined"
                  density="comfortable" 
                  :type="showPassword ? 'text' : 'password'"
                  :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"@click:append-inner="togglePassword"
                  />
                  <button
                    @click="togglePassword"
                    class="absolute right-2 top-1/2 transform 
                    -translate-y-1/2 text-gray-500
                    hover:text-gray-700 focus:outline-none"
                    type="button"
                  >
                    <EyeIcon v-if="!showPassword" class="h-5 w-5" />
                    <EyeOffIcon v-else class="h-5 w-5" />
                  </button>
                  <span v-if="loginErrors" class="text-red-500 !mt-0">
                    Helytelen felhasználónév vagy jelszó
                  </span>
              <div class="flex flex-wrap items-center">
                <v-btn type="submit" class="w-full !mt-5" variant="outlined">Bejelentkezés</v-btn>
                <br>
                <v-btn class="w-full !mt-5" @click="flipLogin" variant="outlined">Nincs fiókod? Regisztrálj!</v-btn>
              </div>
          </form>
        </div>
        <div v-else>
          <form @submit.prevent="onRegistration">
            <div class="">
              <v-text-field
              label="Email" 
              name="email" 
              v-model="regForm.email" 
              required
              variant="outlined"
              density="comfortable"></v-text-field>
              <span v-if="regErrors?.email" class="text-red-500">
                {{regErrors.email._errors[0]}}
              </span>
              <v-text-field 
              label="Felhasználónév" 
              name="username" 
              v-model="regForm.username"
              required
              variant="outlined"
              density="comfortable"></v-text-field>
              <span v-if="regErrors?.username" class="text-red-500">
                {{regErrors.username._errors[0]}}
              </span>
              <v-text-field 
                label="Jelszó" 
                v-model="regForm.password"
                name="pw"
                required
                variant="outlined"
                density="comfortable"
                :type="showPassword ? 'text' : 'password'"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="togglePassword"
              >
              
                <template v-slot:details>
                  <div class="text-caption text-wrap mb-5">
                    Min. 8 karakter, tartalmazzon kis- és nagybetűt, valamint speciális karaktert
                  </div>
                </template>
              </v-text-field>
              <button
                @click="togglePassword"
                class="absolute right-2 top-1/2 transform 
                -translate-y-1/2 text-gray-500
                hover:text-gray-700 focus:outline-none"
                type="button"
              >
                <EyeIcon v-if="!showPassword" class="h-5 w-5" />
                <EyeOffIcon v-else class="h-5 w-5" />
              </button>
              <span v-if="regErrors?.password" class="text-red-500">
                {{regErrors.password._errors[0]}}
              </span>
              <v-text-field 
              label="Jelszó megerősítés" 
              v-model="regForm.confirmPassword" 
              :type="showPassword ? 'text' : 'password'"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"@click:append-inner="togglePassword"
              name="pw"
              required
              variant="outlined"
              density="comfortable"></v-text-field>
              <span v-if="regErrors?.confirmPassword" class="text-red-500">
                  {{regErrors.confirmPassword._errors[0]}}
              </span>
              <div class="flex flex-wrap items-center">
                  <v-btn 
                  class="w-full !mt-5"
                  @click="onRegistration" variant="outlined">Regisztráció</v-btn>
                <br>
                <v-btn class="w-full !mt-5" @click="flipLogin" variant="outlined">Van már fiókod? Lépj be!</v-btn>
              </div>
            </div>
          </form>
        </div>
        </v-card>
        <v-card class="headers !flex !flex-col !justify-center !items-center !text-center
          !bg-opacity-50
          !backdrop-blur-md
          !rounded-2xl
           !bg-white/30
          ">
            <h1 class="title text-9xl text-white">Quizzy</h1>
            <h3 class="quote text-5xl text-white">Fun way to learn haha</h3>
        </v-card>
      </div>
</template>

<style scoped>

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
v-text-field {
  width: 80vh;
}

@media only screen and (max-width: 1440px) {
  .wrapper {
    padding: 50px;
    flex-direction: column-reverse;
    justify-content: flex-end;
    gap: 50px;
  }
  .headers{
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    width: fit-content;
    padding: 10px;
    height: 25%;
  }
  .headers h1{
    font-size: 8vh;
  }
  .headers h3{
    font-size: 3vh;
  }
}

.text-wrap {
  white-space: normal;
  word-wrap: break-word;
  max-width: 100%;
}

:deep(.v-field__append-inner) {
  align-self: center;
  padding-top: 0 !important;
}
</style>

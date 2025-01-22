<script setup lang="ts">
import { ref } from 'vue'
import * as zod from 'zod'
import router from '@/router'
import { clientv1 } from '@/lib/apiClient'
import MistBackground from '@/components/MistBackground.vue'
import { baseRegisterSchema } from '@/schemas/RegistrationSchema'
import { CircleHelp, EyeIcon, EyeOffIcon } from 'lucide-vue-next'
import { toast, type ToastOptions } from 'vue3-toastify'
import wrapper from '@/utils/wrappers'

const isLoginForm = ref(true)

const passwordRequirements = [
  '• Minimum 8 karakter',
  '• Legalább egy nagybetű',
  '• Legalább egy kisbetű',
  '• Legalább egy szám',
  '• Jelszavak egyezése',
]

const flipLogin = () => {
  isLoginForm.value = !isLoginForm.value
}

const regForm = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const loginForm = ref({
  username_or_email: '',
  password: '',
})

type RegisterSchemaType = zod.infer<typeof baseRegisterSchema>

const createRegisterSchema = (password: string) =>
  baseRegisterSchema.refine((data) => data.confirmPassword === password, {
    message: 'A jelszavak nem egyeznek',
    path: ['confirmPassword'],
  })

const regErrors = ref<zod.ZodFormattedError<RegisterSchemaType> | null>(null)

const onRegistration = async () => {
  const schema = createRegisterSchema(regForm.value.password)
  const valid = schema.safeParse(regForm.value)

  if (!valid.success) {
    regErrors.value = valid.error.format()
  } else {
    regErrors.value = null
    await clientv1.auth.register.$post({ json: regForm.value })
    toast('Kérjük aktiválja fiókját a kapott e-mailen keresztül!', {
      autoClose: 5000,
      position: toast.POSITION.TOP_CENTER,
      type: 'success',
      transition: 'zoom',
      pauseOnHover: false,
    } as ToastOptions)
  }
}

const onLogin = async () => {
  const res = await clientv1.auth.login.$post({ json: loginForm.value })

  if (!res.ok) {
    wrapper(res)
  } else {
    router.push('/')
  }
}

const showPassword = ref(false)

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

</script>

<template>
  <MistBackground />
  <div class="wrapper">
    <v-card
      ref="card"
      class="vcard !p-10 !rounded-2xl text-black !bg-white/30 bg-opacity-50 backdrop-blur-sm !min-h-fit !min-w-fit !max-w-fit !max-h-fit"
      theme="dark"
    >
      <transition
        name="fade"
        enter-active-class="transition ease-out duration-300"
        leave-active-class="transition ease-in duration-300"
        mode="out-in"
      >
        <div v-if="isLoginForm">
          <div class="flex justify-evenly flex-row mb-2">
            <span class="font-weight-black text-3xl"> Bejelentkezés </span>
          </div>
          <form @submit.prevent="onLogin">
            <v-text-field
              label="Felhasználónév"
              v-model="loginForm.username_or_email"
              variant="outlined"
              density="comfortable"
            >
            </v-text-field>
            <v-text-field
              name="pw"
              label="Jelszó"
              v-model="loginForm.password"
              variant="outlined"
              density="comfortable"
              :type="showPassword ? 'text' : 'password'"
              @click:append-inner="togglePassword"
              class="relative"
            >
              <button
                @click="togglePassword"
                class="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-700 focus:outline-none"
                type="button"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              >
                <EyeIcon v-if="!showPassword" class="h-5 w-5" />
                <EyeOffIcon v-else class="h-5 w-5" />
              </button>
            </v-text-field>
            <div class="flex flex-wrap items-center">
              <v-btn type="submit" class="w-full !mt-5" variant="outlined">Bejelentkezés</v-btn>
              <br />
              <v-btn class="w-full !mt-5" @click="flipLogin" variant="outlined"
                >Nincs fiókod? Regisztrálj!</v-btn
              >
            </div>
          </form>
        </div>
        <div v-else>
          <div class="flex justify-evenly flex-row mb-2">
            <div class="flex items-center">
              <span class="font-weight-black text-3xl">Regisztráció</span>
              <CircleHelp
                class="h-7 w-7 text-blue-400 ml-2 cursor-pointer"
                @click="
                  toast(passwordRequirements.join('\n'), {
                    autoClose: 5000,
                    position: toast.POSITION.TOP_CENTER,
                    type: 'info',
                    transition: 'zoom',
                    pauseOnHover: false,
                  } as ToastOptions)
                "
              />
            </div>
          </div>
          <form @submit.prevent="onRegistration">
            <v-text-field
              label="Email"
              name="email"
              v-model="regForm.email"
              required
              variant="outlined"
              density="comfortable"
              :error-messages="regErrors?.email?._errors[0]"
              class="!mb-5"
            ></v-text-field>

            <v-text-field
              label="Felhasználónév"
              name="username"
              v-model="regForm.username"
              required
              variant="outlined"
              density="comfortable"
              :error-messages="regErrors?.username?._errors[0]"
              class="!mb-5"
            ></v-text-field>

            <v-text-field
              label="Jelszó"
              v-model="regForm.password"
              name="pw"
              required
              variant="outlined"
              density="comfortable"
              :type="showPassword ? 'text' : 'password'"
              @click:append-inner="togglePassword"
              class="relative !mb-5"
              :error-messages="regErrors?.password?._errors[0]"
            >
              <button
                @click="togglePassword"
                class="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-700 focus:outline-none"
                type="button"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              >
                <EyeIcon v-if="!showPassword" class="h-5 w-5" />
                <EyeOffIcon v-else class="h-5 w-5" />
              </button>
            </v-text-field>

            <v-text-field
              label="Jelszó megerősítés"
              v-model="regForm.confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="togglePassword"
              name="pw"
              required
              variant="outlined"
              density="comfortable"
              :error-messages="regErrors?.confirmPassword?._errors[0]"
              class="!mb-5"
            >
            </v-text-field>

            <div class="flex flex-wrap items-center">
              <v-btn class="w-full !mt-5" @click="onRegistration" variant="outlined"
                >Regisztráció</v-btn
              >
              <br />
              <v-btn class="w-full !mt-5" @click="flipLogin" variant="outlined"
                >Van már fiókod? Lépj be!</v-btn
              >
            </div>
          </form>
        </div>
      </transition>
    </v-card>
    <v-card
      class="headers !flex !flex-col !justify-center !items-center !text-center !bg-opacity-50 !backdrop-blur-md !rounded-2xl !bg-white/30"
    >
      <h1 class="title text-9xl text-white">Quizzy</h1>
      <h3 class="quote text-5xl text-white">Fun way to learn haha</h3>
    </v-card>
  </div>
</template>

<style scoped>
.wrapper {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  padding: 5px;
}

.headers {
  height: 50%;
  width: 50%;
  align-self: center;
  justify-content: space-evenly;
  gap: 20px;
}

.vcard {
  height: 50%;
  align-self: center;
}

.title {
  font-size: 10vh;
  line-height: 1;
}

.quote {
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

  .headers {
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    width: fit-content;
    padding: 10px;
    height: 25%;
  }

  .headers h1 {
    font-size: 8vh;
  }

  .headers h3 {
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

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease-out;
}
</style>

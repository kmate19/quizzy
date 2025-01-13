import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'

import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import Vue3Toastify, {type ToastContainerOptions} from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)


const vuetify = createVuetify({
  components,
  directives,
})
app.use(createPinia())
app.use(router)
app.use(vuetify)
app.use(Vue3Toastify, {
    autoClose: 5000,
  } as ToastContainerOptions
)

app.mount('#app')

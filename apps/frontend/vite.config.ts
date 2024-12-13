import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
//import tailwindcss from '@tailwindcss/vite'
// ^ vite plugin currently breaks some styling with devtools and possibly other things so we'll use postcss for now
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    //tailwindcss(),
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  optimizeDeps: {
    exclude: ["oh-vue-icons/icons"]
  }
})

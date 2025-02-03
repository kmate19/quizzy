import { fileURLToPath, URL } from 'node:url'
import { visualizer } from 'rollup-plugin-visualizer'

import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    vue(),
    vueDevTools(),
    visualizer({ open: true })
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/ws": {
        target: "http://localhost:3001",
        changeOrigin: true,
        ws: true,
      }
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "zod": ["zod"],
          "vue": ["vue"],
          "vuetify": ["vuetify"],
          "vuetify-components": ["vuetify/components"],
          "vue-router": ["vue-router"],
          "pinia": ["pinia"],
          "lucide": ["lucide-vue-next"],
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  optimizeDeps: {
    exclude: ["oh-vue-icons/icons"]
  }
})

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNavbarStore = defineStore(
  'navbar',
  () => {
    const isGame = ref<boolean>(false)
    const isDuringGame = ref<boolean>(false)

    function reset() {
      isGame.value = false
      isDuringGame.value = false
    }

    return {
      $reset: reset,
      isGame,
      isDuringGame
    }
  }
)

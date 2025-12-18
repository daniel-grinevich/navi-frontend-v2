import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useGeolocation } from '@vueuse/core'

export const useLocationStore = defineStore('location', () => {
  const { coords, locatedAt, error, resume, pause } = useGeolocation()

  return {
    coords,
    locatedAt,
    error,
    resume,
    pause,
  }
})

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { apiClient } from '@/lib/apiClient'

export const useSessionStore = defineStore('session', () => {
  const user = ref({})
  const session = useStorage(
    'my-access-token',
    { accessToken: '', refreshToken: '' },
    sessionStorage,
  )

  const isAuthenticated = computed(() => {
    return Object.keys(user.value).length > 0 && !!session.value.accessToken
  })

  const initAuth = async () => {
    if (!session.value.accessToken || !session.value.refreshToken) {
      return
    }

    try {
      const fullToken = 'Bearer ' + session.value.accessToken
      const data = await apiClient('/api/users/me', {
        method: 'GET',
        headers: { Authorization: fullToken }
      })

      user.value = data
    } catch (err) {
      session.value = { accessToken: '', refreshToken: '' }
      user.value = {}
    }
  }

  const getUser = async () => {
    if (!session.value.accessToken || !session.value.refreshToken) {
      return
    }
    try {
      const fullToken = 'Bearer ' + session.value.accessToken
      const data = await apiClient('/api/users/me', {
        method: 'GET',
        headers: { Authorization: fullToken }
      })

      user.value = data
    } catch (err) {
      session.value = { accessToken: '', refreshToken: '' }
      user.value = {}
    }
  }

  const logout = () => {
    return true
  }
  return {
    user,
    session,
    initAuth,
    getUser,
    isAuthenticated,
    logout,
  }
})

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { apiClient } from '@/lib/apiClient'

interface User {
  email?: string
  guestEmail?: string
  [key: string]: any
}

export const useSessionStore = defineStore('session', () => {
  const user = ref<User>({})
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
        headers: { Authorization: fullToken },
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
        headers: { Authorization: fullToken },
      })

      user.value = data
    } catch (err) {
      session.value = { accessToken: '', refreshToken: '' }
      user.value = {}
    }
  }

  const logout = () => {
    session.value = { accessToken: '', refreshToken: '' }
    user.value = {}
  }

  const setGuestEmail = (guestEmail: string) => {
    user.value = { guestEmail }
  }

  const createGuest = async () => {
    debugger
    if (!user.value.guestEmail) return

    try {
      const response = await apiClient('api/create-guest/', {
        method: 'POST',
        body: JSON.stringify({
          guestUser: user.value.guestEmail,
        }),
      })

      const data = await response.json()

      const { accessToken, refreshToken } = data
      session.value = { accessToken: accessToken, refreshToken: refreshToken }
    } catch (error) {
      console.error(`Error when creating guest user ${error}`)
    }
  }

  return {
    user,
    session,
    initAuth,
    getUser,
    createGuest,
    isAuthenticated,
    logout,
    setGuestEmail,
  }
})

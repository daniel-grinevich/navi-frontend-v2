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
  const isAuthenticated = ref<boolean>(false)

  const initAuth = async (max_retries: number = 3) => {
    const result = await getUser(0, max_retries)

    if (result && user.value) isAuthenticated.value = true
  }

  const getUser = async (retries: number = 0, maxRetries: number = 3) => {
    debugger
    try {
      const data = await apiClient('api/users/me', {
        method: 'GET',
      })

      data.is_guest ? (user.value.guestEmail = data.email) : (user.value = data)
    } catch (err: any) {
      if (err.status === 401) {
        const refreshed = await refreshAccessToken()

        if (refreshed) {
          return getUser(retries + 1, maxRetries)
        }

        throw Error('Not Authorized')
      }
    }
    return true
  }

  const logout = async () => {
    try {
      await apiClient('api/logout', { method: 'POST' })
      return true
    } catch {
      return false
    }
  }

  const isAdmin = computed(async () => {
    if (!user) await getUser()

    if (user.value?.is_admin) return true

    return false
  })

  const setGuestEmail = (guestEmail: string) => {
    user.value = { guestEmail }
  }

  const createGuest = async () => {
    if (!user.value.guestEmail) return

    try {
      const response = await apiClient('api/create-guest/', {
        method: 'POST',
        body: JSON.stringify({
          guestUser: user.value.guestEmail,
        }),
      })

      const { accessToken, refreshToken, user: userData } = response

      session.value = { accessToken: accessToken, refreshToken: refreshToken }
    } catch (error) {
      console.error(`Error when creating guest user ${error}`)
    }
  }

  const refreshAccessToken = async () => {
    try {
      await apiClient('api/token/refresh/', { method: 'POST' })
      return true
    } catch {
      logout()
      return false
    }
  }

  return {
    user,
    initAuth,
    getUser,
    createGuest,
    isAuthenticated,
    isAdmin,
    logout,
    setGuestEmail,
    refreshAccessToken,
  }
})

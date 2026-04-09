import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { apiClient } from '@/lib/apiClient'
import { useRouter } from 'vue-router'

interface User {
  email?: string
  guestEmail?: string
  [key: string]: any
}

export const useSessionStore = defineStore('session', () => {
  const router = useRouter()
  const user = ref<User>({})
  const isAuthenticated = ref<boolean>(false)
  const isGuest = ref<boolean>(false)
  const isInitialized = ref<boolean>(false)

  let initPromise: Promise<void> | null = null

  const initAuth = () => {
    if (initPromise) return initPromise

    initPromise = (async () => {
      const result = await getUser()
      if (result && !isGuest.value && Object.keys(user.value).length > 0) {
        isAuthenticated.value = true
      }
      isInitialized.value = true
    })()

    return initPromise
  }

  const getUser = async (refresh: boolean = true) => {
    try {
      const data = await apiClient('api/users/me/', {
        method: 'GET',
      })

      if (data.is_guest) {
        user.value.guestEmail = data.email
        isGuest.value = true
      } else {
        user.value = data
        isGuest.value = false
      }
    } catch (err: any) {
      if (err.status === 401 && refresh) {
        const refreshed = await refreshAccessToken()
        if (!refreshed) return false

        return await getUser(false)
      }

      return false
    }

    return true
  }

  const logout = async () => {
    try {
      await apiClient('api/logout/', { method: 'POST' })
      return true
    } catch {
      return false
    } finally {
      user.value = {}
      isAuthenticated.value = false
      isGuest.value = false
      router.push('/')
    }
  }

  const isAdmin = computed(async () => {
    if (!user) await getUser()

    if (user.value?.is_admin) return true

    return false
  })

  const setGuestEmail = (guestEmail: string) => {
    user.value = { guestEmail }
    isGuest.value = true
  }

  const createGuest = async (guestEmail: string | null = null) => {
    const email = guestEmail || user.value.guestEmail
    if (!email) return

    try {
      const response = await apiClient('api/create-guest/', {
        method: 'POST',
        body: JSON.stringify({
          guestUser: email,
        }),
      })

      return response
    } catch (error) {
      return
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
    isGuest,
    isAdmin,
    logout,
    setGuestEmail,
    refreshAccessToken,
  }
})

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { apiClient } from '@/lib/apiClient'
import { useRouter } from 'vue-router'
import type { UserResponse } from '@/types/user'
import ApiError from '@/lib/apiError'

interface User {
  email?: string
  guestEmail?: string
  [key: string]: object | string | undefined | boolean | Date
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

  const getUser = async () => {
    try {
      const data = await apiClient<UserResponse>('api/users/me/', {
        method: 'GET',
      })

      if (data.is_guest) {
        user.value.guestEmail = data.email
        isGuest.value = true
      } else {
        const userData = {
          id: data.id,
          email: data.email,
          name: data.name,
          isGuest: data.is_guest,
          dateJoined: data.date_joined,
          stripeCustomerId: data.stripe_customer_id,
        }

        user.value = userData
        isGuest.value = false
      }
    } catch (err: unknown) {
      console.error(err)
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
      // TODO clean up tokens in cookies

      user.value = {}
      isAuthenticated.value = false
      isGuest.value = false
      router.push('/')
    }
  }

  const isAdmin = computed(() => {
    return user.value?.is_admin ? true : false
  })

  const setGuestEmail = (guestEmail: string) => {
    user.value = { guestEmail }
    isGuest.value = true
  }

  const createGuest = async (guestEmail: string | null = null) => {
    const email = guestEmail || user.value.guestEmail
    if (!email) return

    try {
      const data = await apiClient('api/create-guest/', {
        method: 'POST',
        body: JSON.stringify({
          guestUser: email,
        }),
      })

      return data
    } catch (error: unknown) {
      console.error(error)
      return
    }
  }

  const refreshAccessToken = async () => {
    try {
      await apiClient('api/token/refresh/', { method: 'POST' })
      return true
    } catch {
      await logout()
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
    isInitialized,
    isAdmin,
    logout,
    setGuestEmail,
    refreshAccessToken,
  }
})

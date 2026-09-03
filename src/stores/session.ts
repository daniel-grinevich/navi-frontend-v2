import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { apiClient } from '@/lib/apiClient'
import { useRouter } from 'vue-router'
import type { UserResponse } from '@/types/user'

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
          is_admin: data.is_admin,
          dateJoined: data.date_joined,
          stripeCustomerId: data.stripe_customer_id,
        }

        user.value = userData
        isGuest.value = false
      }
    } catch (err: unknown) {
      console.log(err)
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
      // Auth cookies are httpOnly and are cleared server-side by the logout
      // endpoint (delete_token_cookies); nothing to clear from JS here.
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
      const data = await apiClient<{ redirect?: string }>('api/create-guest/', {
        method: 'POST',
        body: JSON.stringify({
          guestUser: email,
        }),
      })

      return data
    } catch (error: unknown) {
      console.log(error)
      throw error
    }
  }

  // Single-flight the refresh: with rotating + blacklisted refresh tokens, two
  // concurrent refreshes would blacklist each other and force a logout. Share
  // one in-flight promise so parallel 401s all await the same refresh.
  let refreshPromise: Promise<boolean> | null = null

  const refreshAccessToken = async () => {
    if (refreshPromise) return refreshPromise

    refreshPromise = (async () => {
      try {
        await apiClient('api/token/refresh/', { method: 'POST' })
        return true
      } catch {
        await logout()
        return false
      } finally {
        refreshPromise = null
      }
    })()

    return refreshPromise
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

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { apiClientSession } from '@/lib/apiClientSession'

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

    await getUser()
  }

  const getUser = async () => {
    if (!session.value.accessToken || !session.value.refreshToken) {
      return
    }
    try {
      const fullToken = 'Bearer ' + session.value.accessToken
      const data = await apiClientSession('/api/users/me', {
        method: 'GET',
        headers: { Authorization: fullToken },
      })
      if (data.is_guest){
        user.value.guestEmail=data.email
      }
      else {
        user.value = data
      }
    } catch (err: any) {
      if (err.status === 401) {
        const refreshed = await refreshAccessToken()
        if (refreshed) {
          return getUser() // retry
        }
      } else {
        logout()
      }
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
    if (!user.value.guestEmail) return

    try {
      const response = await apiClientSession('api/create-guest/', {
        method: 'POST',
        body: JSON.stringify({
          guestUser: user.value.guestEmail,
        }),
      })

      const { accessToken, refreshToken, user: userData} = response
      console.log(accessToken)

      session.value = { accessToken: accessToken, refreshToken: refreshToken }
    } catch (error) {
      console.error(`Error when creating guest user ${error}`)
    }
  }

  const refreshAccessToken = async () => {
    if (!session.value.refreshToken) return false

    try {
      const data = await apiClientSession('/api/token/refresh/', {
        method: 'POST',
        body: JSON.stringify({
          refresh: session.value.refreshToken,
        }),
      })

      session.value.accessToken = data.access
      return true
    } catch {
      logout()
      return false
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
    refreshAccessToken,
  }
})

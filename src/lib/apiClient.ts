import { useSessionStore } from '@/stores/session'
import { getCsrfCookie } from '@/helpers/csrfHelper'

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8000'
const UNSAFE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE']

export async function apiClient<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const { isAuthenticated, refreshAccessToken } = useSessionStore()

  if (options?.method && UNSAFE_METHODS.includes(options.method) && endpoint !== 'api/token/') {
    options.headers = { ...options.headers, 'X-CSRFToken': getCsrfCookie() }
  }

  if (!options.credentials) options.credentials = 'include'

  const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (response.status === 401) {
    if (endpoint === 'api/logout' || endpoint === 'api/logout/')
      return new Promise(() => {
        return { success: false, body: null }
      })

    if (!isAuthenticated) throw Error('Not Authorized')

    const refreshResponse: boolean = await refreshAccessToken()

    if (!refreshResponse) throw Error('Could not use refresh token to authenticate')

    return apiClient(endpoint, options)
  }

  if (!response.ok) {
    let errorBody = null
    try {
      errorBody = await response.json()
    } catch {
      errorBody = 'Something went wrong.'
    }

    const error: any = new Error('API Error')
    error.status = response.status
    error.body = errorBody
    throw error
  }

  if (response.status === 204) {
    return new Promise(() => {
      return { success: true, body: null }
    })
  }

  return response.json()
}

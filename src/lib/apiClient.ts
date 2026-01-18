import { useSessionStore } from '@/stores/session'
const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8000'

export async function apiClient<T = any>(
  endpoint: string,
  options: RequestInit = {},
  retry: boolean = false,
): Promise<T> {
  const { isAuthenticated, refreshAccessToken, session } = useSessionStore()

  const auth = (options?.headers as Record<string, string> | undefined)?.Authorization

  debugger
  if (isAuthenticated && !auth) {
    const headers: Record<string, string> = {}
    headers['Authorization'] = `Bearer ${session.accessToken}`
    options = { ...options, headers: headers }
  }

  const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (response.status === 401) {
    if (!isAuthenticated) throw Error('Not Authorized')

    const authResponse: boolean = await refreshAccessToken()

    delete (options?.headers as Record<string, string> | undefined)?.Authorization

    if (!authResponse) throw Error('Could not use refresh tooken to authenticate')

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

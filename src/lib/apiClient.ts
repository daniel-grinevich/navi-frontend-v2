import { useSessionStore } from '@/stores/session'
const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8000'

export async function apiClient<T = any>(endpoint: string, options: RequestInit = {}, retry:boolean = true):Promise<T | null>  {
  const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
if (response.status === 401 && retry) {
    return retryApiClient(endpoint,options)
  }
  

  if (!response.ok) {
    let errorBody = null
    try {
      errorBody = await response.json()
    } catch {
      errorBody="Something went wrong."
    }

    const error: any = new Error('API Error')
    error.status = response.status
    error.body = errorBody
    throw error
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null
  }

  return response.json()
}

async function retryApiClient (endpoint: string, options: RequestInit = {}) {
  const sessionStore = useSessionStore()
  try {
    await sessionStore.refreshAccessToken()

    const retryHeaders = {
      ...options.headers,
      Authorization: `Bearer ${sessionStore.session.accessToken}`,
    }
    return apiClient(
      endpoint,
      { ...options, headers: retryHeaders },
      false, // prevent infinite loop
    )
  } catch (err) {
    sessionStore.logout()
    throw err
  }
}
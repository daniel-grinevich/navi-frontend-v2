import { useSessionStore } from '@/stores/session'
import { getCsrfCookie } from '@/helpers/csrfHelper'
import { cleanEndpoint } from '@/helpers/endpointHelper'
import { nonAuthRoutes } from '@/constants/constants'
import ApiError from '@/lib/apiError'

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8000'
const UNSAFE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE']

export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const { isAuthenticated, refreshAccessToken } = useSessionStore()

  const cleanedEndpoint = cleanEndpoint(endpoint)

  if (
    options?.method &&
    UNSAFE_METHODS.includes(options.method) &&
    cleanedEndpoint !== 'api/token/'
  ) {
    options.headers = { ...options.headers, 'X-CSRFToken': getCsrfCookie() }
  }

  if (!options.credentials) options.credentials = 'include'

  if (!nonAuthRoutes.includes(cleanedEndpoint) && !isAuthenticated) {
    throw Error('Not authorized to make this request.')
  }

  let response: Response | null = null

  try {
    response = await fetch(`${API_BASE_URL}/${cleanedEndpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (response.status === 401) {
      if (cleanedEndpoint === 'api/logout/') {
        return { success: true, body: 'User is already unauthenticated.' } as T
      }

      if (cleanedEndpoint === 'api/token/refresh/') {
        throw Error('Refresh token is invalid or expired.')
      }

      const refreshResponse: boolean = await refreshAccessToken()

      if (!refreshResponse) throw Error('Could not use refresh token to authenticate user.')

      return apiClient(cleanedEndpoint, options)
    }

    if (!response.ok) {
      let errorMessage = null

      try {
        const errorBody = await response.json()
        errorMessage = JSON.stringify(errorBody)
      } catch {
        errorMessage = 'Something went wrong. Could not parse error response.'
      }

      throw Error(errorMessage)
    }

    if (response.status === 204) {
      return { success: true, body: null } as T
    }

    return response.json() as Promise<T>
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'unknown error occured'
    const errorResponseStatus = response?.status ?? null

    throw new ApiError(errorResponseStatus, errorMessage)
  }
}

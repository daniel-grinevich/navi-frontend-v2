import { useSessionStore } from '@/stores/session'
import { getCsrfCookie } from '@/helpers/csrfHelper'
import { cleanEndpoint } from '@/helpers/endpointHelper'
import { authRoutes } from '@/constants/constants'
import { createQueryParams } from '@/helpers/queryParamsHelper'
import ApiError from '@/lib/apiError'

// `??` (not `||`) so an explicitly-empty VITE_BASE_URL stays empty, making
// requests relative (`/api/...`) and letting the dev-server proxy handle them.
const API_BASE_URL = import.meta.env.VITE_BASE_URL ?? 'http://localhost:8000'
const UNSAFE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE']

type Request = RequestInit & {
  queryParams?: Record<string, boolean | Date | string | number | null>
}

export async function apiClient<T>(endpoint: string, options: Request = {}): Promise<T> {
  const { isAuthenticated, refreshAccessToken } = useSessionStore()

  let cleanedEndpoint = cleanEndpoint(endpoint)

  if (authRoutes.includes(cleanedEndpoint) && !isAuthenticated) {
    throw Error(`Not authorized to make this request: ${cleanedEndpoint}.`)
  }

  if (options.queryParams) {
    cleanedEndpoint += createQueryParams(options?.queryParams)
  }

  if (options.method && UNSAFE_METHODS.includes(options.method) && cleanedEndpoint !== 'token/') {
    options.headers = { ...options.headers, 'X-CSRFToken': getCsrfCookie() }
  }

  if (!options.credentials) options.credentials = 'include'

  let response: Response | null = null

  try {
    response = await fetch(`${API_BASE_URL}/api/${cleanedEndpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (response.status === 401) {
      if (cleanedEndpoint === 'logout/') {
        return { success: true, body: 'User is already unauthenticated.' } as T
      }

      if (cleanedEndpoint === 'token/refresh/') {
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

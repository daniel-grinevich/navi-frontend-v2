const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8000'
//Creating to avoid circular imports with the session store - does not retry
export async function apiClientSession(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  

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
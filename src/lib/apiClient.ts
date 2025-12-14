const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8000/'

export async function apiClient(endpoint: string, options: RequestInit = {}) {
  debugger
  const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  const data = await response.json()

  return await JSON.stringify(data)
}

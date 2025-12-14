import { apiClient } from '@/lib/apiClient'
import { useAsyncState } from '@vueuse/core'

export const useMenu = () => {
  const { state, isLoading, isReady, error, execute, executeImmediate } =
    useAsyncState(async () => {
      const data = await apiClient('api/menu-items/', {
        method: 'GET',
      })
      return data || []
    }, [])

  return {
    state,
    isReady,
    isLoading,
    error,
    execute,
    executeImmediate,
  }
}

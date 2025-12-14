import { apiClient } from '@/lib/apiClient'
import { useQuery } from '@tanstack/vue-query'

export const useMenu = () => {
  const { isPending, isFetching, isError, data, error } = useQuery({
    queryKey: ['menu'],
    queryFn: () => apiClient('api/menu-items/', { method: 'GET' }),
  })

  return {
    isPending,
    isFetching,
    isError,
    data,
    error,
  }
}

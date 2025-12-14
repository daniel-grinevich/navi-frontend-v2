import { useQuery } from '@tanstack/vue-query'

export const useApi = (key: string, query: () => {}) => {
  const { isPending, isFetching, isError, data, error } = useQuery({
    queryKey: ['todos'],
    queryFn: query,
  })
}

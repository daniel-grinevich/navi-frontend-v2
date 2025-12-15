import { useQuery, type UseQueryOptions } from '@tanstack/vue-query'
import type { ComputedRef } from 'vue'

export const useApi = <TData = unknown, TError = Error>(
  queryKey: string[],
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
) => {
  const { isPending, isLoading, isFetching, isError, data, error, refetch } = useQuery({
    queryKey,
    queryFn,
    ...options,
  })

  return {
    isPending: isPending as ComputedRef<boolean>,
    isLoading: isLoading as ComputedRef<boolean>,
    isFetching: isFetching as ComputedRef<boolean>,
    isError: isError as ComputedRef<boolean>,
    data: data as ComputedRef<TData | undefined>,
    error: error as ComputedRef<TError | null>,
    refetch,
  }
}

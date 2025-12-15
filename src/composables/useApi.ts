import {
  useQuery,
  useMutation,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/vue-query'
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

export const useApiWrite = <TData = unknown, TError = Error, TVariables = void, TContext = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'>,
) => {
  const { isPending, isError, isSuccess, data, error, mutate, mutateAsync, reset } = useMutation({
    mutationFn,
    ...options,
  })

  return {
    isPending: isPending as ComputedRef<boolean>,
    isError: isError as ComputedRef<boolean>,
    isSuccess: isSuccess as ComputedRef<boolean>,
    data: data as ComputedRef<TData | undefined>,
    error: error as ComputedRef<TError | null>,
    mutate,
    mutateAsync,
    reset,
  }
}

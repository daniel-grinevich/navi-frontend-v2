import { apiClient } from '@/lib/apiClient'
import { useApi, useApiWrite } from './useApi'
import { type MaybeRefOrGetter, toValue } from 'vue'
import type { UseQueryOptions } from '@tanstack/vue-query'

export const useUserByEmail = (
  email: MaybeRefOrGetter<string>,
  enable_fetch: MaybeRefOrGetter<boolean> = true,
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn' | 'enabled'>,
) => {
  return useApi(
    ['user-email', toValue(email)],
    () =>
      apiClient(`api/users/by-email/?email=${encodeURIComponent(toValue(email))}`, {
        method: 'GET',
      }),
    {
      enabled: enable_fetch,
      ...options,
    },
  )
}

export const useUserSignup = () => {
  return useApiWrite(async (signupData) => {
    return await apiClient('api/orders/', {
      method: 'POST',
      body: JSON.stringify(signupData),
    })
  })
}

import { apiClient } from '@/lib/apiClient'
import { useApi, useApiWrite } from './useApi'
import { type MaybeRefOrGetter, toValue, computed } from 'vue'
import type { UseQueryOptions } from '@tanstack/vue-query'

export const useUserByEmail = (
  email: MaybeRefOrGetter<string>,
  enable_fetch: MaybeRefOrGetter<boolean> = true,
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn' | 'enabled'>,
) => {
  return useApi(
    computed(() => ['user-email', toValue(email)]),
    () =>
      apiClient<{ id: string; is_guest: boolean }>(`api/users/by-email/?email=${encodeURIComponent(toValue(email))}`, {
        method: 'GET',
      }),
    {
      enabled: enable_fetch,
      ...options,
    },
  )
}

export const useUserSignup = () => {
  return useApiWrite<unknown, Error, { email: string; password: string }>(async (signupData) => {
    return await apiClient('api/signup/', {
      method: 'POST',
      body: JSON.stringify(signupData),
    })
  })
}

export const useUserLogin = () => {
  return useApiWrite<
    { access: string; refresh: string },
    Error,
    { email: string; password: string }
  >(
    async (userData) =>
      await apiClient('api/token/', {
        method: 'POST',
        body: JSON.stringify(userData),
        credentials: 'include',
      }),
  )
}

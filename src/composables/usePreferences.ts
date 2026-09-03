import { apiClient } from '@/lib/apiClient'
import { useApi, useApiWrite } from './useApi'
import { useQueryClient } from '@tanstack/vue-query'
import type { UserPreferences, UserPreferencesUpdate } from '@/types/preferences'

const PREFERENCES_KEY = ['user-preferences']

export const useUserPreferences = () =>
  useApi<UserPreferences>(PREFERENCES_KEY, () =>
    apiClient<UserPreferences>('api/users/preferences/', { method: 'GET' }),
  )

export const useUpdateUserPreferences = () => {
  const queryClient = useQueryClient()

  return useApiWrite<UserPreferences, Error, UserPreferencesUpdate>(
    (patch) =>
      apiClient<UserPreferences>('api/users/preferences/', {
        method: 'PATCH',
        body: JSON.stringify(patch),
      }),
    {
      // The PATCH returns the full, updated preferences — seed the cache with it
      // so toggles reflect the server immediately without a refetch.
      onSuccess: (data: UserPreferences) => queryClient.setQueryData(PREFERENCES_KEY, data),
    },
  )
}

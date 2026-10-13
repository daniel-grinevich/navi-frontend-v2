import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { apiClient } from '@/lib/apiClient'
import ApiError from '@/lib/apiError'
import { useApi } from './useApi'
import { fetchNaviPortStatusFixture } from '@/fixtures/naviPortStatus'
import type { NaviPort, NaviPortStatus } from '@/types/NaviPort'

const USE_PORT_FIXTURE = import.meta.env.DEV && import.meta.env.VITE_NAVI_PORT_FIXTURE === 'true'

export const useNaviPorts = () => {
  return useApi(['navi-locations'], () => apiClient<NaviPort[]>(`api/navi_ports`, { method: 'GET' }))
}

// Public availability for one port, looked up by the slug printed on its sticker.
export const useNaviPortBySlug = (
  slug: MaybeRefOrGetter<string>,
  options: { pollMs?: number } = {},
) => {
  const queryKey = computed(() => ['navi-port-by-slug', toValue(slug)])

  return useApi<NaviPortStatus, ApiError>(
    queryKey,
    () => {
      const value = toValue(slug)
      if (USE_PORT_FIXTURE) return fetchNaviPortStatusFixture(value)
      return apiClient<NaviPortStatus>(`api/navi_ports/by-slug/${encodeURIComponent(value)}/`, {
        method: 'GET',
      })
    },
    {
      refetchInterval: options.pollMs ?? false,
      // A missing machine won't appear on retry; other failures get the default retries.
      retry: (failureCount: number, error: ApiError) => error.status !== 404 && failureCount < 3,
    },
  )
}

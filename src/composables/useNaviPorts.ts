import { apiClient } from '@/lib/apiClient'
import { useApi } from './useApi'
import type { NaviPort } from '@/types/NaviPort'

export const useNaviPorts = () => {
  return useApi(['navi-locations'], () => apiClient<NaviPort[]>(`api/navi_ports`, { method: 'GET' }))
}

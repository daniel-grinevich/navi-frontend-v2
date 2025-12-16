import { apiClient } from '@/lib/apiClient'
import { useApi } from './useApi'

export const useNaviLocations = () => {
  return useApi(['navi-locations'], () => apiClient(`api/navi_ports`, { method: 'GET' }))
}

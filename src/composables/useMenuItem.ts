import { apiClient } from '@/lib/apiClient'
import { useApi } from './useApi'
import {type MenuItem} from './useMenu'


export const useMenuItem = (id:string) => {
  return useApi<MenuItem>(['menu',id], () => apiClient(`api/menu-items/${id}/category-customizations/`, { method: 'GET' }))
}

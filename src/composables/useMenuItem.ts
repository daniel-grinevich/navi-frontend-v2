import { apiClient } from '@/lib/apiClient'
import { useApi } from './useApi'
import {type MenuItem} from './useMenu'
import {ref} from 'vue'


export const useMenuItem = (id:string) => {
  return useApi<MenuItem>(['menu',id], () => apiClient(`api/menu-items/${id}`, { method: 'GET' }))
}

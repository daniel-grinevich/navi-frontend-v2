import { apiClient } from '@/lib/apiClient'
import { useApi } from './useApi'

export type MenuItem = {
  id?: string | number
  slug: string
  name: string
  status: string
  category_name: string
  body: string
  description: string
  price: string
}

export const useMenu = () => {
  return useApi<MenuItem[]>(['menu'], () => apiClient('api/menu-items/', { method: 'GET' }))
}

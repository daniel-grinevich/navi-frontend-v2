import { apiClient } from '@/lib/apiClient'
import { useApi } from './useApi'
import { type CustomizationGroup } from '@/types/customization'

export type MenuItem = {
  id?: string | number
  slug: string
  name: string
  status: string
  category_name: string
  body: string
  description: string
  price: string
  category?: {
    id: string | number
    name: string
    customization_groups: CustomizationGroup[]
  }
}

export const useMenu = () => {
  return useApi<MenuItem[]>(['menu'], () =>
    apiClient('api/menu-items/?status=A', { method: 'GET' }),
  )
}

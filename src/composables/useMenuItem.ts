import { apiClient } from '@/lib/apiClient'
import { useApi } from './useApi'
import type { MenuItemCategory } from '@/types/customization'

export const useMenuItem = (id: string) => {
  return useApi<MenuItemCategory>(['menu', id], () =>
    apiClient(`api/menu-items/${id}/category-customizations/`, { method: 'GET' }),
  )
}

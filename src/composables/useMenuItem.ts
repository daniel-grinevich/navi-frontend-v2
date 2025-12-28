import { apiClient } from '@/lib/apiClient'
import { useApi } from './useApi'

export type Customizations = {
  id?: string | number,
  name: string
  group: string
  description: string
  display_order: string
  price: string
  created_at?: string
  created_by?: string
  updated_at?: string
  updated_by?: string
  slug: string
}

export type CustomizationGroup = {
  id?: string | number
  name: string
  category: Category
  description: string
  display_order: string
  is_required: string
  created_at: string
  created_by: string
  updated_at: string
  updated_by: string
  slug: string
  customizations: Customizations[]
}

export type Category = {
  id?: string | number
  name: string
  customization_groups: CustomizationGroup[]
}

export type MenuItemCategory = {
  id?: string | number
  slug: string
  name: string
  status: string
  category: Category
  body: string
  description: string
  price: string
}

export const useMenuItem = (id: string) => {
  return useApi<MenuItemCategory>(['menu', id], () =>
    apiClient(`api/menu-items/${id}/category-customizations/`, { method: 'GET' }),
  )
}

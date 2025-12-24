import { type SelectedCustomization } from './customization'

export type CartItem = {
  // Unique identifier for this specific cart entry (UUID)
  cartItemId: string

  // Menu item details
  menuItemId: string | number
  menuItemName: string
  menuItemSlug: string
  basePrice: number

  // Customizations selected by user
  customizations: SelectedCustomization[]
  specialInstructions?: string

  // Quantity
  quantity: number

  // Computed total (basePrice + customization modifiers) * quantity
  totalPrice: number
}

export type OrderSummary = {
  items: CartItem[]
  subtotal: number
  tax: number
  total: number
}
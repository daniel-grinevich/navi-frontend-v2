import { type CartItem } from './cart'
import { type UserResponse } from './user'

export type OrderStatus = 'O' | 'S' | 'D' | 'C' | 'R'

// Standard DRF PageNumberPagination envelope.
export type PaginatedResponse<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type Order = {
  id?: string
  naviPortId: string | number
  items: CartItem[]
  subtotal: number
  tax: number
  total: number
  price?: string | number
  order_status: OrderStatus
  specialInstructions?: string
  created_at: Date
  estimatedReadyTime?: Date
  user: UserResponse
}

export type ServerOrder = {
  navi_port: string | number
  items: {
    menu_item: string
    quantity: number
    unit_price: string
    customizations: {
      customization: string
      quantity: number
      unit_price: string
    }[]
  }[]
}

export type OrderSubmissionResponse = {
  client_secret: string
  order: Order
}

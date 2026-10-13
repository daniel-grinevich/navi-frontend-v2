import { type CartItem } from './cart'
import { type UserResponse } from './user'

// Mirrors the backend Order.Status choices: Ordered (waiting for a scan), Sent
// (claimed by a machine, being made), Done, Cancelled.
export type OrderStatus = 'O' | 'S' | 'D' | 'C'

// Standard DRF PageNumberPagination envelope.
export type PaginatedResponse<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type Order = {
  id?: string
  navi_port: string | null
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
  // Signed pickup token the machine scans. Re-minted on every GET and expires,
  // so it must always come from the latest fetch. null once the order leaves O.
  qr_token?: string | null
}

export type ServerOrder = {
  navi_port: string
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

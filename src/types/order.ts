import { type CartItem } from './cart'

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'delivered'
  | 'cancelled'

export type Order = {
  id?: string
  user: {}
  naviPortId: string | number
  items: CartItem[]
  subtotal: number
  tax: number
  total: number
  status: OrderStatus
  specialInstructions?: string
  createdAt?: Date
  estimatedReadyTime?: Date
}

export type OrderSubmissionResponse = {
  success: boolean
  orderId: string
  message: string
  estimatedReadyTime?: Date
  status: string
}

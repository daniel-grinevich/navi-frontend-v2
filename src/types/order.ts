import { type CartItem } from './cart'
import { type User } from './user'

export type OrderStatus =
  | 'O'
  | 'S'
  | 'D'
  | 'C'

export type Order = {
  id?: string
  naviPortId: string | number
  items: CartItem[]
  subtotal: number
  tax: number
  total: number
  status: OrderStatus
  specialInstructions?: string
  created_at: Date
  estimatedReadyTime?: Date
  user: User
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
  success: boolean
  id: string
  message: string
  estimatedReadyTime?: string
  status: string
  order: Order
}

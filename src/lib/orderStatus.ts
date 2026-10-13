import type { OrderStatus } from '@/types/order'

// Display labels for the backend Order.Status codes. O = paid and waiting for
// the customer to scan at a machine; S = a machine has claimed it and is making
// the drink; D = ready; C = cancelled (terminal, not a step in the progression).
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  O: 'ORDERED',
  S: 'MAKING',
  D: 'READY',
  C: 'CANCELLED',
}

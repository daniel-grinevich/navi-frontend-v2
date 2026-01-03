import { apiClient } from '@/lib/apiClient'
import { getHeader, useApi, useApiWrite } from './useApi'
import type { ServerOrder,Order, OrderSubmissionResponse } from '@/types/order'
import { useSessionStore } from '@/stores/session'

export const useCreateOrder = () => {
  const session = useSessionStore()

  return useApiWrite<OrderSubmissionResponse, Error, ServerOrder>(async (orderData) => {

    const headers = getHeader(session.session)

    return await apiClient('api/orders/', {
      method: 'POST',
      body: JSON.stringify(orderData),
      headers,
    })
  })
}

// Fetch a single order by ID
export const useOrder = (orderId: string) => {
  const session = useSessionStore()

  return useApi<Order>(['order', orderId], async () => {
    const headers= getHeader(session.session)
    return await apiClient(`api/orders/${orderId}/`, { method: 'GET', headers })
  })
}

// Fetch all orders for the current user
export const useOrders = () => {
  const session = useSessionStore()
  return useApi<Order[]>(['orders'], async () => {
    const headers= getHeader(session.session)
    return await apiClient('api/orders/', { method: 'GET' })})
}

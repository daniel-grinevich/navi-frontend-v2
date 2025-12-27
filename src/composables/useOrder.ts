import { apiClient } from '@/lib/apiClient'
import { useApi, useApiWrite } from './useApi'
import type { Order, OrderSubmissionResponse } from '@/types/order'
import { useSessionStore } from '@/stores/session'

export const useCreateOrder = () => {
  const session = useSessionStore()

  return useApiWrite<OrderSubmissionResponse, Error, Omit<Order, 'status'>>(async (orderData) => {
    const accessToken = session.session.accessToken

    const headers: Record<string, string> = {}

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }

    return await apiClient('api/orders/', {
      method: 'POST',
      body: JSON.stringify(orderData),
      headers,
    })
  })
}

// Fetch a single order by ID
export const useOrder = (orderId: string) => {
  return useApi<Order>(['order', orderId], () =>
    apiClient(`api/order/${orderId}/`, { method: 'GET' }),
  )
}

// Fetch all orders for the current user
export const useOrders = () => {
  return useApi<Order[]>(['orders'], () => apiClient('api/orders/', { method: 'GET' }))
}

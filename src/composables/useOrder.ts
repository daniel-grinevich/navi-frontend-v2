import { apiClient } from '@/lib/apiClient'
import { useApi, useApiWrite } from './useApi'
import type { ServerOrder, Order, OrderSubmissionResponse } from '@/types/order'

export const useCreateOrder = () => {
  return useApiWrite<OrderSubmissionResponse, Error, ServerOrder>(async (orderData) => {
    return await apiClient('api/orders/', {
      method: 'POST',
      body: JSON.stringify(orderData),
    })
  })
}

export const useOrder = (orderId: string) => {
  return useApi<Order>(['order', orderId], () =>
    apiClient(`api/orders/${orderId}/`, { method: 'GET' }),
  )
}

export const useOrders = () => {
  return useApi<Order[]>(['orders'], () => apiClient('api/orders/', { method: 'GET' }))
}

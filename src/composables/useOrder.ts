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
  return useApi<Order>(
    ['order', orderId],
    () => apiClient(`api/orders/${orderId}/`, { method: 'GET' }),
    {
      refetchInterval: (query: { state: { data: Order | undefined } }) => {
        const status = query.state.data?.order_status
        return status === 'D' || status === 'C' ? false : 60000
      },
    },
  )
}

export const useOrders = () => {
  return useApi<Order[]>(
    ['orders'],
    () => apiClient('api/orders/', { method: 'GET' }),
    { refetchInterval: 15000 },
  )
}

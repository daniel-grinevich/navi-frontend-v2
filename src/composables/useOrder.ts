import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { apiClient } from '@/lib/apiClient'
import { useApi, useApiWrite } from './useApi'
import type {
  ServerOrder,
  Order,
  OrderStatus,
  OrderSubmissionResponse,
  PaginatedResponse,
} from '@/types/order'

export type OrderListParams = { page: number; status?: OrderStatus | 'ALL' }

const orderQueryParams = (params: OrderListParams) => {
  const queryParams: Record<string, string | number> = { page: params.page }
  if (params.status && params.status !== 'ALL') queryParams.status = params.status
  return queryParams
}

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

// The current user's own orders (paginated). Even for admins this is scoped to
// the caller — everyone-else's orders live behind useAdminOrders.
export const useOrders = (params: MaybeRefOrGetter<OrderListParams>) => {
  return useApi<PaginatedResponse<Order>>(
    computed(() => ['orders', toValue(params)]),
    () => apiClient('api/orders/', { method: 'GET', queryParams: orderQueryParams(toValue(params)) }),
    { refetchInterval: 15000 },
  )
}

// Admin-only: every user's orders (paginated). Backed by /api/admin/orders/,
// which requires staff and 403s otherwise.
export const useAdminOrders = (params: MaybeRefOrGetter<OrderListParams>) => {
  return useApi<PaginatedResponse<Order>>(
    computed(() => ['admin-orders', toValue(params)]),
    () =>
      apiClient('api/admin/orders/', {
        method: 'GET',
        queryParams: orderQueryParams(toValue(params)),
      }),
    { refetchInterval: 15000 },
  )
}

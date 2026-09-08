import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
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

// Admin manual-order payload: an order plus optional customer identity. The
// backend attaches to an existing user when customer_email matches, otherwise
// records a guest walk-in. Still returns a Stripe client_secret to capture card.
export type AdminServerOrder = ServerOrder & {
  customer_email?: string
  guest_name?: string
  guest_contact?: string
}

// Admin-only: create an order on a customer's behalf. Backed by
// /api/admin/orders/, which requires staff and 403s otherwise.
export const useAdminCreateOrder = () => {
  return useApiWrite<OrderSubmissionResponse, Error, AdminServerOrder>(async (orderData) => {
    return await apiClient('api/admin/orders/', {
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

// Admin-only: a single order for any user. Backed by /api/admin/orders/{id}/,
// which requires staff and 403s otherwise. Mirrors useOrder's refetch-until-
// terminal behaviour so an admin watching an in-progress order stays live.
export const useAdminOrder = (orderId: string) => {
  return useApi<Order>(
    ['admin-order', orderId],
    () => apiClient(`api/admin/orders/${orderId}/`, { method: 'GET' }),
    {
      refetchInterval: (query: { state: { data: Order | undefined } }) => {
        const status = query.state.data?.order_status
        return status === 'D' || status === 'C' ? false : 15000
      },
    },
  )
}

// Admin-only: move an order to a new status. Refreshes both the all-orders list
// and the single-order cache so the table and detail view reflect the change.
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient()

  return useApiWrite<Order, Error, { orderId: string; order_status: OrderStatus }>(
    ({ orderId, order_status }) =>
      apiClient(`api/admin/orders/${orderId}/`, {
        method: 'PATCH',
        body: JSON.stringify({ order_status }),
      }),
    {
      onSuccess: (_data: Order, variables: { orderId: string; order_status: OrderStatus }) => {
        queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
        queryClient.invalidateQueries({ queryKey: ['admin-order', variables.orderId] })
      },
    },
  )
}

// Admin-only: dispatch an order to a NaviPort machine.
export const useDispatchOrder = () => {
  const queryClient = useQueryClient()

  return useApiWrite<Order, Error, { orderId: string; naviportId: string | number }>(
    ({ orderId, naviportId }) =>
      apiClient(`api/orders/${orderId}/dispatch/`, {
        method: 'POST',
        body: JSON.stringify({ orderId, naviportId }),
      }),
    {
      onSuccess: (_data: Order, variables: { orderId: string; naviportId: string | number }) => {
        queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
        queryClient.invalidateQueries({ queryKey: ['admin-order', variables.orderId] })
      },
    },
  )
}

import { ref, onMounted, onUnmounted } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import type { Order } from '@/types/order'

const WS_BASE_URL = (import.meta.env.VITE_BASE_URL || 'http://localhost:8000').replace(
  /^http/,
  'ws',
)

export function useOrderWebSocket(orderId: string) {
  const queryClient = useQueryClient()
  const machineError = ref<string | null>(null)

  let ws: WebSocket | null = null
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null

  const connect = () => {
    ws = new WebSocket(`${WS_BASE_URL}/ws/orders/${orderId}/`)

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data) as { status: string; error?: string }
      machineError.value = data.error ?? null
      queryClient.setQueryData<Order>(['order', orderId], (old) => {
        if (!old) return old
        return { ...old, order_status: data.status as Order['order_status'] }
      })
    }

    ws.onclose = () => {
      reconnectTimeout = setTimeout(connect, 2000)
    }
  }

  onMounted(() => connect())

  onUnmounted(() => {
    if (reconnectTimeout) clearTimeout(reconnectTimeout)
    ws?.close()
  })

  return { machineError }
}

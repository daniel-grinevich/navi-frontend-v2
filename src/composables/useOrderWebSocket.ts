import { ref, onMounted, onUnmounted } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import type { Order } from '@/types/order'

// When VITE_BASE_URL is explicitly empty (proxy mode), connect same-origin to
// the dev server (ws://localhost:5173/ws/...) and let the proxy forward to
// staging. `new WebSocket` needs an absolute URL, so fall back to the current
// origin rather than a bare relative path.
const httpBase = import.meta.env.VITE_BASE_URL ?? 'http://localhost:8000'
const WS_BASE_URL = (httpBase || window.location.origin).replace(/^http/, 'ws')

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

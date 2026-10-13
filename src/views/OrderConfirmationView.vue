<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { computed, ref } from 'vue'
import Qrcode from '@/components/shared/Qrcode.vue'
import { useOrder, useDispatchOrder } from '@/composables/useOrder'
import { useOrderWebSocket } from '@/composables/useOrderWebSocket'
import { useSessionStore } from '../stores/session'
import { getApiErrorMessage } from '@/lib/errorParser'
import { ORDER_STATUS_LABELS as stepLabels } from '@/lib/orderStatus'
import type { OrderStatus } from '@/types/order'

const router = useRouter()
const route = useRoute()

const orderId = computed(() => route.params.orderId as string)
const { isLoading, data: order, isError } = useOrder(orderId.value)
const { machineError } = useOrderWebSocket(orderId.value)

const sessionStore = useSessionStore()

// The QR payload is the signed qr_token from the latest GET. The backend
// re-mints it on every fetch and it expires, so always bind the current cached
// value (never a copy) and let useOrder's refetches keep it fresh.
const qrToken = computed(() => order.value?.qr_token ?? null)
// No centre logo: the scanner needs every module, and the default is a
// third-party image.
const qrImageSettings = { src: '', width: 0, height: 0, excavate: false }

// Admin shortcut: dispatch to the order's own pickup NaviPort.
const { mutateAsync: dispatch, isPending: isDispatching } = useDispatchOrder()
const dispatchError = ref<string | null>(null)
const onDispatchClick = async () => {
  const naviportId = order.value?.navi_port
  if (!naviportId || isDispatching.value) return
  dispatchError.value = null
  try {
    await dispatch({ orderId: orderId.value, naviportId })
  } catch (error) {
    dispatchError.value = getApiErrorMessage(error)
  }
}

// Happy-path progression. C (cancelled) is terminal and shown on its own.
const steps: OrderStatus[] = ['O', 'S', 'D']
const stepDescriptions: Record<OrderStatus, string> = {
  O: 'waiting for you to scan at the machine',
  S: 'the machine is making your order',
  D: 'your order is ready',
  C: 'this order was cancelled',
}

const isCancelled = computed(() => order.value?.order_status === 'C')

const stepIndex = computed(() => {
  if (!order.value) return 0
  return steps.indexOf(order.value.order_status)
})

const stepState = (i: number) => {
  // Done is the last step, so it reads as completed rather than in progress.
  if (i < stepIndex.value || order.value?.order_status === 'D') return 'done'
  if (i === stepIndex.value) return 'active'
  return 'pending'
}

const stepStateText = { done: 'completed', active: 'current', pending: 'upcoming' }
</script>

<template>
  <!-- Loading -->
  <div v-if="isLoading" class="w-full text-xs">
    <div class="border border-alt text-xs">
      <div class="px-3 py-1 border-b border-alt font-secondary text-alt">// order</div>
      <div class="px-3 py-6 text-center font-mono blink">loading...</div>
    </div>
  </div>

  <!-- Error -->
  <div v-else-if="isError" class="w-full text-xs">
    <div class="border-2 border-red text-xs">
      <div class="px-3 py-1 border-b border-red bg-red text-primary font-mono">⚠ ERROR</div>
      <div class="px-3 py-4 text-center">failed to load order</div>
    </div>
  </div>

  <!-- Order Confirmation -->
  <div v-else class="w-full text-xs space-y-4">
    <!-- Machine Error -->
    <div v-if="machineError" class="border border-alt text-xs">
      <div class="px-3 py-1 border-b border-alt font-secondary text-alt">// machine error</div>
      <div class="px-3 py-3 font-mono">{{ machineError }}</div>
      <!-- A machine error cancels the order (C) and auto-refunds it server-side. -->
      <div class="px-3 py-2 border-t border-alt text-alt">cancelled — you've been refunded</div>
    </div>
    <!-- ASCII Status Tracker -->
    <div class="border border-alt text-xs">
      <div class="px-3 py-1 border-b border-alt font-secondary text-alt">// order status</div>
      <div class="px-4 py-6">
        <!-- Announced to screen readers whenever the status changes -->
        <p role="status" aria-live="polite" class="sr-only">
          order status: {{ stepLabels[order?.order_status ?? 'O'] }} —
          {{ stepDescriptions[order?.order_status ?? 'O'] }}
        </p>
        <p v-if="isCancelled" class="text-center font-mono text-red">
          {{ stepLabels.C }} — {{ stepDescriptions.C }}
        </p>
        <!-- Progress Line -->
        <div v-else class="flex items-center justify-between font-mono">
          <template v-for="(step, i) in steps" :key="step">
            <div class="flex flex-col items-center gap-2">
              <span
                aria-hidden="true"
                :class="[
                  'text-lg',
                  stepState(i) === 'done' ? 'text-green' : '',
                  stepState(i) === 'active' ? 'text-green blink' : '',
                  stepState(i) === 'pending' ? 'font-secondary' : '',
                ]"
              >
                {{ stepState(i) === 'done' ? '●' : stepState(i) === 'active' ? '◉' : '○' }}
              </span>
              <span
                :class="[
                  'text-xs',
                  stepState(i) === 'active' ? 'text-green' : '',
                  stepState(i) === 'done' ? 'text-green' : '',
                  stepState(i) === 'pending' ? 'font-secondary' : '',
                ]"
              >
                {{ stepLabels[step] }}
                <span class="sr-only">({{ stepStateText[stepState(i)] }})</span>
              </span>
            </div>
            <div
              v-if="i < steps.length - 1"
              :class="[
                'flex-1 border-t mb-5',
                i < stepIndex ? 'border-green' : 'border-alt',
              ]"
            ></div>
          </template>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Order Details -->
      <div class="border border-alt text-xs">
        <div class="px-3 py-1 border-b border-alt bg-green text-white">// order details</div>
        <div class="px-3 py-2 flex justify-between">
          <span>order id</span>
          <span class="font-mono">{{ orderId }}</span>
        </div>
        <div class="px-3 py-2 flex justify-between border-t border-alt">
          <span>status</span>
          <span class="font-mono text-green">{{ stepLabels[order?.order_status ?? 'O'] }}</span>
        </div>
      </div>

      <!-- QR Code -->
      <div v-if="qrToken && order?.order_status === 'O'" class="border border-alt text-xs">
        <div class="px-3 py-1 border-b border-alt font-secondary text-alt">// qr code</div>
        <div class="px-3 py-4 flex justify-center">
          <Qrcode
            :value="qrToken"
            :size="200"
            :margin="2"
            :image-settings="qrImageSettings"
            role="img"
            aria-label="pickup qr code — scan this at the naviport machine"
          />
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-4 flex-col sm:flex-row text-xs">
      <button
        @click="router.push({ name: 'menu' })"
        class="group flex-1 px-3 py-2 bg-green text-primary border border-green cursor-pointer font-mono tracking-wide hover:bg-alt hover:text-primary hover:border-alt transition-colors"
      >
        <span>▸</span> ORDER MORE
      </button>
      <button
        @click="router.push({ name: 'home' })"
        class="group flex-1 px-3 py-2 border border-alt cursor-pointer font-mono tracking-wide hover:bg-green hover:text-primary transition-colors"
      >
        <span class="text-green group-hover:text-primary">▸</span> BACK TO HOME
      </button>
    </div>

    <!-- Admin Dispatch -->
    <div v-if="sessionStore.isAdmin && order?.navi_port" class="text-xs space-y-2">
      <button
        :disabled="isDispatching"
        @click="onDispatchClick"
        class="group w-full px-3 py-2 border border-red text-red cursor-pointer font-mono tracking-wide hover:bg-red hover:text-primary transition-colors"
      >
        ▸ DISPATCH ORDER (admin)
      </button>
      <p v-if="dispatchError" class="text-red px-2 py-2 border border-red">{{ dispatchError }}</p>
    </div>
  </div>
</template>

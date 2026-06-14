<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { computed, toValue } from 'vue'
import Qrcode from '@/components/shared/Qrcode.vue'
import { useOrder } from '@/composables/useOrder'
import { useOrderWebSocket } from '@/composables/useOrderWebSocket'
import { useSessionStore } from '../stores/session'
import { apiClient } from '@/lib/apiClient'

const router = useRouter()
const route = useRoute()

const orderId = computed(() => route.params.orderId as string)
const { isLoading, data: order, isError } = useOrder(orderId.value)
const { machineError } = useOrderWebSocket(orderId.value)

const sessionStore = useSessionStore()

const onDispatchClick = () => {
  const naviPort = { id: '65065f88-e474-4c8d-a22b-e50254fd49c5' }
  const response = apiClient(`api/orders/${toValue(orderId)}/dispatch/`, {
    method: 'POST',
    body: JSON.stringify({ orderId: toValue(orderId), naviportId: naviPort.id }),
  })

  console.log(response)
}

const steps = ['O', 'S', 'D', 'C']
const stepLabels: Record<string, string> = {
  O: 'OPEN',
  S: 'SHIPPED',
  D: 'DISPATCH',
  C: 'DONE',
}

const stepIndex = computed(() => {
  if (!order.value) return 0
  return steps.indexOf(order.value.order_status)
})

const stepState = (i: number) => {
  if (i < stepIndex.value) return 'done'
  if (i === stepIndex.value) return 'active'
  return 'pending'
}
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
      <div class="px-3 py-2 border-t border-alt text-alt">your qr code is still valid — please try again or visit another machine</div>
    </div>
    <!-- ASCII Status Tracker -->
    <div class="border border-alt text-xs">
      <div class="px-3 py-1 border-b border-alt font-secondary text-alt">// order status</div>
      <div class="px-4 py-6">
        <!-- Progress Line -->
        <div class="flex items-center justify-between font-mono">
          <template v-for="(step, i) in steps" :key="step">
            <div class="flex flex-col items-center gap-2">
              <span
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
      <div v-if="order?.id && order.order_status === 'O'" class="border border-alt text-xs">
        <div class="px-3 py-1 border-b border-alt font-secondary text-alt">// qr code</div>
        <div class="px-3 py-4 flex justify-center">
          <Qrcode :value="'{{order.id}}'" :size="200" />
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
    <div v-if="sessionStore.isAdmin" class="text-xs">
      <button
        @click="onDispatchClick"
        class="group w-full px-3 py-2 border border-red text-red cursor-pointer font-mono tracking-wide hover:bg-red hover:text-primary transition-colors"
      >
        ▸ DISPATCH ORDER (admin)
      </button>
    </div>
  </div>
</template>

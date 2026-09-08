<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminOrder, useUpdateOrderStatus, useDispatchOrder } from '@/composables/useOrder'
import { getApiErrorMessage } from '@/lib/errorParser'
import type { OrderStatus } from '@/types/order'
import LoadingSpinnerTwo from '@/components/shared/LoadingSpinnerTwo.vue'

const props = defineProps<{ orderId: string }>()

const router = useRouter()

const { isLoading, isError, data: order } = useAdminOrder(props.orderId)

const statusLabels: Record<OrderStatus, string> = {
  O: 'OPEN',
  S: 'SHIPPED',
  D: 'DISPATCH',
  C: 'DONE',
  R: 'REFUNDED',
}
const statuses = Object.keys(statusLabels) as OrderStatus[]

const actionError = ref<string | null>(null)

const { mutateAsync: updateStatus, isPending: isUpdating } = useUpdateOrderStatus()
const { mutateAsync: dispatch, isPending: isDispatching } = useDispatchOrder()

const busy = computed(() => isUpdating.value || isDispatching.value)

const changeStatus = async (status: OrderStatus) => {
  if (busy.value || order.value?.order_status === status) return
  actionError.value = null
  try {
    await updateStatus({ orderId: props.orderId, order_status: status })
  } catch (error) {
    actionError.value = getApiErrorMessage(error)
  }
}

const dispatchOrder = async () => {
  if (busy.value || !order.value) return
  actionError.value = null
  try {
    await dispatch({ orderId: props.orderId, naviportId: order.value.naviPortId })
  } catch (error) {
    actionError.value = getApiErrorMessage(error)
  }
}

const orderDate = (iso?: Date) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}
</script>

<template>
  <div class="w-full text-xs space-y-4">
    <!-- Header -->
    <div class="border border-alt flex items-center justify-between">
      <div class="px-3 py-1 bg-green text-primary">// admin · order #{{ orderId }}</div>
      <button
        type="button"
        class="px-3 py-1 cursor-pointer text-green hover:underline font-mono"
        @click="router.push({ name: 'adminOrders' })"
      >
        ◂ ALL ORDERS
      </button>
    </div>

    <div v-if="isLoading" class="flex justify-center py-8"><LoadingSpinnerTwo /></div>

    <div v-else-if="isError || !order" class="border-2 border-red">
      <div class="px-3 py-1 border-b border-red bg-red text-primary font-mono">⚠ ERROR</div>
      <div class="px-3 py-4 text-center">failed to load order</div>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Order Details -->
        <div class="border border-alt">
          <div class="px-3 py-1 border-b border-alt font-secondary text-alt">// details</div>
          <div class="px-3 py-2 flex justify-between">
            <span>customer</span>
            <span class="font-mono">{{ order.user?.email ?? 'guest' }}</span>
          </div>
          <div class="px-3 py-2 flex justify-between border-t border-alt">
            <span>status</span>
            <span class="font-mono text-green">{{ statusLabels[order.order_status] }}</span>
          </div>
          <div class="px-3 py-2 flex justify-between border-t border-alt">
            <span>naviport</span>
            <span class="font-mono">#{{ order.naviPortId }}</span>
          </div>
          <div class="px-3 py-2 flex justify-between border-t border-alt">
            <span>placed</span>
            <span class="font-mono">{{ orderDate(order.created_at) }}</span>
          </div>
          <div v-if="order.specialInstructions" class="px-3 py-2 border-t border-alt">
            <span class="text-alt">note:</span> {{ order.specialInstructions }}
          </div>
        </div>

        <!-- Totals -->
        <div class="border border-alt">
          <div class="px-3 py-1 border-b border-alt font-secondary text-alt">// summary</div>
          <div class="px-3 py-2 flex justify-between">
            <span>subtotal</span>
            <span class="font-mono">${{ order.subtotal?.toFixed?.(2) ?? order.subtotal }}</span>
          </div>
          <div class="px-3 py-2 flex justify-between border-t border-alt">
            <span>tax</span>
            <span class="font-mono">${{ order.tax?.toFixed?.(2) ?? order.tax }}</span>
          </div>
          <div class="px-3 py-2 flex justify-between border-t border-alt">
            <span>total</span>
            <span class="font-mono">${{ order.total?.toFixed?.(2) ?? order.price ?? order.total }}</span>
          </div>
        </div>
      </div>

      <!-- Items -->
      <div class="border border-alt">
        <div class="px-3 py-1 border-b border-alt bg-green text-primary">
          // items ({{ order.items?.length ?? 0 }})
        </div>
        <div
          v-for="item in order.items"
          :key="item.cartItemId"
          class="px-3 py-3 border-b border-alt last:border-b-0 flex justify-between"
        >
          <div class="flex-1 pr-4">
            <p class="text-alt">{{ item.menuItemName }}</p>
            <p class="font-secondary mt-1">qty: {{ item.quantity }}</p>
            <ul v-if="item.customizations?.length" class="mt-2 space-y-1 pl-2">
              <li v-for="(custom, idx) in item.customizations" :key="idx">
                <span class="text-green mr-1">▸</span> {{ custom.groupName }}: {{ custom.optionName }}
              </li>
            </ul>
            <p v-if="item.specialInstructions" class="italic mt-2 font-secondary">
              note: {{ item.specialInstructions }}
            </p>
          </div>
          <p class="font-mono">${{ item.totalPrice?.toFixed?.(2) ?? item.totalPrice }}</p>
        </div>
      </div>

      <!-- Status Controls -->
      <div class="border border-alt">
        <div class="px-3 py-1 border-b border-alt font-secondary text-alt">// set status</div>
        <div class="flex flex-wrap">
          <button
            v-for="status in statuses"
            :key="status"
            type="button"
            :disabled="busy || order.order_status === status"
            @click="changeStatus(status)"
            :class="[
              'px-3 py-2 border-r border-alt font-mono tracking-wide transition-colors disabled:cursor-not-allowed',
              order.order_status === status
                ? 'bg-green text-primary'
                : 'cursor-pointer hover:bg-green hover:text-primary disabled:opacity-50',
            ]"
          >
            {{ statusLabels[status] }}
          </button>
        </div>
      </div>

      <!-- Dispatch -->
      <button
        type="button"
        :disabled="busy"
        @click="dispatchOrder"
        class="w-full px-3 py-2 border border-red text-red cursor-pointer font-mono tracking-wide hover:bg-red hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="isDispatching" class="blink">DISPATCHING...</span>
        <span v-else>▸ DISPATCH ORDER</span>
      </button>

      <p v-if="actionError" class="text-red px-2 py-2 border border-red">{{ actionError }}</p>
    </template>
  </div>
</template>

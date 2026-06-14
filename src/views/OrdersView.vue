<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useOrders } from '@/composables/useOrder'
import type { OrderStatus } from '@/types/order'
import AsyncList from '@/components/shared/AsyncList.vue'

const router = useRouter()

const { isLoading, data: orders } = useOrders()

const statusFilter = ref<OrderStatus | 'ALL'>('ALL')

const statusLabels: Record<OrderStatus | 'ALL', string> = {
  ALL: 'ALL',
  O: 'OPEN',
  S: 'SHIPPED',
  D: 'DISPATCH',
  C: 'DONE',
  R: 'REFUNDED',
}

const filteredOrders = computed(() => {
  if (!orders.value) return []
  if (statusFilter.value === 'ALL') return orders.value
  return orders.value.filter((o) => o.order_status === statusFilter.value)
})

const orderDate = (iso: Date) => {
  const date = new Date(iso)
  const formatted = date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
  return formatted
}
</script>

<template>
  <div class="w-full text-xs space-y-4">
    <!-- Header -->
    <div class="border border-alt">
      <div class="px-3 py-1 bg-green text-primary">// orders</div>
    </div>

    <!-- Filter Bar -->
    <div class="border border-alt flex flex-wrap">
      <button
        v-for="(label, key) in statusLabels"
        :key="key"
        @click="statusFilter = key"
        :class="[
          'px-3 py-2 border-r border-alt cursor-pointer font-mono tracking-wide transition-colors',
          statusFilter === key
            ? 'bg-green text-primary'
            : 'hover:bg-green hover:text-primary',
        ]"
      >
        {{ label }}
      </button>
    </div>

    <AsyncList :items="filteredOrders" :loading="isLoading" flex-gap="gap-4">
      <template #item="order">
        <div class="navi-btn border border-alt border-l-[0.5rem] border-l-green text-xs transition-all duration-200 cursor-pointer">
          <div class="px-3 py-1 border-b border-alt font-secondary text-alt">// order</div>
          <div class="px-3 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div class="flex-1">
              <p class="text-alt font-mono">order #{{ order.id }}</p>
              <p class="mt-1">{{ orderDate(order.created_at) }}</p>
            </div>
            <div class="font-mono">
              status: <span class="text-green">{{ order.order_status }}</span>
            </div>
            <button
              class="navi-btn px-3 py-2 bg-green text-primary border border-green cursor-pointer font-mono tracking-wide hover:bg-alt hover:text-primary hover:border-alt transition-all duration-200"
              @click="
                router.push({
                  name: 'orderConfirmation',
                  params: { orderId: order.id },
                })
              "
              type="button"
            >
              ▸ VIEW
            </button>
          </div>
        </div>
      </template>
    </AsyncList>
  </div>
</template>

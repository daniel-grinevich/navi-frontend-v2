<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminOrders } from '@/composables/useOrder'
import type { OrderStatus } from '@/types/order'
import Pagination from '@/components/shared/Pagination.vue'
import LoadingSpinnerTwo from '@/components/shared/LoadingSpinnerTwo.vue'

const router = useRouter()

const page = ref(1)
const statusFilter = ref<OrderStatus | 'ALL'>('ALL')

const params = computed(() => ({ page: page.value, status: statusFilter.value }))
const { isLoading, data } = useAdminOrders(params)

const orders = computed(() => data.value?.results ?? [])
const count = computed(() => data.value?.count ?? 0)

const statusLabels: Record<OrderStatus | 'ALL', string> = {
  ALL: 'ALL',
  O: 'OPEN',
  S: 'SHIPPED',
  D: 'DISPATCH',
  C: 'DONE',
  R: 'REFUNDED',
}

const setStatus = (key: OrderStatus | 'ALL') => {
  statusFilter.value = key
  page.value = 1
}

const orderDate = (iso: Date) => {
  const date = new Date(iso)
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}
</script>

<template>
  <div class="w-full text-xs space-y-4">
    <!-- Header -->
    <div class="border border-alt">
      <div class="px-3 py-1 bg-green text-primary">// admin · all orders</div>
    </div>

    <!-- Filter Bar -->
    <div class="border border-alt flex flex-wrap">
      <button
        v-for="(label, key) in statusLabels"
        :key="key"
        @click="setStatus(key)"
        :class="[
          'px-3 py-2 border-r border-alt cursor-pointer font-mono tracking-wide transition-colors',
          statusFilter === key ? 'bg-green text-primary' : 'hover:bg-green hover:text-primary',
        ]"
      >
        {{ label }}
      </button>
    </div>

    <div v-if="isLoading" class="flex justify-center py-8"><LoadingSpinnerTwo /></div>

    <div v-else-if="orders.length === 0" class="border border-alt text-center py-6">
      No orders found.
    </div>

    <div v-else class="border border-alt overflow-x-auto">
      <table class="w-full font-mono text-left">
        <thead class="text-alt border-b border-alt">
          <tr>
            <th class="px-3 py-2">order</th>
            <th class="px-3 py-2">customer</th>
            <th class="px-3 py-2">status</th>
            <th class="px-3 py-2">placed</th>
            <th class="px-3 py-2">price</th>
            <th class="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id" class="border-b border-alt last:border-b-0">
            <td class="px-3 py-2">#{{ order.id }}</td>
            <td class="px-3 py-2">{{ order.user?.email ?? '—' }}</td>
            <td class="px-3 py-2 text-green">{{ order.order_status }}</td>
            <td class="px-3 py-2">{{ orderDate(order.created_at) }}</td>
            <td class="px-3 py-2">{{ order.price ?? '—' }}</td>
            <td class="px-3 py-2">
              <button
                type="button"
                class="cursor-pointer text-green hover:underline"
                @click="router.push({ name: 'orderConfirmation', params: { orderId: order.id } })"
              >
                ▸ VIEW
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="text-alt">total: {{ count }}</div>

    <Pagination :page="page" :count="count" @update:page="page = $event" />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useOrders } from '@/composables/useOrder'
import AsyncList from '@/components/shared/AsyncList.vue'

const router = useRouter()

const { isLoading, data: orders, isError } = useOrders()
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
  <div class="max-w-6xl mx-auto p-6 space-y-4">
    <AsyncList :items="orders" :loading="isLoading" flex-gap="gap-4">
      <template #item="order">
        <div class="border border-alt border-l-[0.5rem] border-l-green text-xs">
          <div class="px-3 py-1 border-b border-alt font-secondary text-alt">// order</div>
          <div class="px-3 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div class="flex-1">
              <p class="text-alt font-mono">order #{{ order.id }}</p>
              <p class="mt-1">{{ orderDate(order.created_at) }}</p>
            </div>
            <div class="font-mono">
              status: <span class="text-green">{{ order.status }}</span>
            </div>
            <button
              class="px-3 py-2 bg-green text-primary border border-green cursor-pointer font-mono tracking-wide hover:bg-alt hover:text-primary hover:border-alt transition-colors"
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

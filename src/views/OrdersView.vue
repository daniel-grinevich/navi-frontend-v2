<script setup lang="ts">
import { useRouter } from 'vue-router'
import Card from '@/components/shared/Card.vue'
import { useOrders } from '@/composables/useOrder'
import AsyncList from '@/components/shared/AsyncList.vue'
import { computed } from 'vue'

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
  <div>
    <AsyncList :items="orders" :loading="isLoading">
      <template #item="order">
        <Card>
          <template #body>
            <div class="flex flex-row justify-between">
              <div>Order: {{ order.id }}</div>
              <div>
                <div>Date: {{ orderDate(order.created_at) }}</div>
                <div>Status: {{ order.status }}</div>
              </div>

              <button
                class="p-1 border cursor-pointer w-24"
                @click="
                  router.push({
                    name: 'orderConfirmation',
                    params: { orderId: order.id },
                  })
                "
                type="button"
              >
                Select
              </button>
            </div>
          </template>
        </Card>
      </template>
    </AsyncList>
  </div>
</template>

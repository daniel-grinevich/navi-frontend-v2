<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { computed, toValue } from 'vue'
import Card from '@/components/shared/Card.vue'
import Qrcode from '@/components/shared/Qrcode.vue'
import { useOrder } from '@/composables/useOrder'
import { useSessionStore } from '../stores/session'
import { apiClient } from '@/lib/apiClient'

const router = useRouter()
const route = useRoute()

const orderId = computed(() => route.params.orderId as string)
const { isLoading, data: order, isError } = useOrder(orderId.value)

const sessionStore = useSessionStore()

const onDispatchClick = () => {
  const naviPort = { id: '65065f88-e474-4c8d-a22b-e50254fd49c5' }
  const response = apiClient(`api/orders/${toValue(orderId)}/dispatch/`, {
    method: 'POST',
    body: JSON.stringify({ orderId: toValue(orderId), naviportId: naviPort.id }),
  })

  console.log(response)
}
</script>

<template>
  <div v-if="isLoading">Loading . . .</div>
  <div v-else-if="isError">Error . . .</div>
  <div v-else class="max-w-2xl mx-auto p-6">
    <div class="text-center mb-6">
      <div
        class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse"
      >
        <svg class="w-14 h-14 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="3"
            d="M5 13l4 4L19 7"
          ></path>
        </svg>
      </div>
      <h1 class="text-3xl font-bold mb-2">Order Confirmed!</h1>
      <p>Thank you for your order</p>
    </div>

    <Card class="mb-6">
      <template #header>
        <h2 class="text-lg font-semibold">Order Details</h2>
      </template>
      <template #body>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span>Order ID:</span>
            <span
              class="font-mono font-medium text-sm bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 px-3 py-1 rounded"
              >{{ orderId }}</span
            >
          </div>
          <div class="flex justify-between items-center">
            <span>Status: {{ order?.status }}</span>
          </div>
        </div>
      </template>
    </Card>

    <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
      <div class="flex items-start">
        <svg class="w-5 h-5 text-blue-600 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clip-rule="evenodd"
          />
        </svg>
        <div v-if="order?.id && order.status == 'O'">
          <Qrcode :value="'{{order.id}}'" :size="500" />
        </div>
      </div>
    </div>

    <div class="space-y-3">
      <button
        @click="router.push({ name: 'menu' })"
        class="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
      >
        Order More Items
      </button>
      <button
        @click="router.push({ name: 'home' })"
        class="w-full px-6 py-3 border-2 border-gray-300 rounded-md hover:bg-gray-50 font-medium transition-colors"
      >
        Back to Home
      </button>
      <div v-if="sessionStore.isAdmin">
        <button
          @click="onDispatchClick"
          class="w-full px-6 py-3 border-2 bg-green text-primary border-gray-300 rounded-md hover:bg-gray-50 hover:text-alt font-medium transition-colors"
        >
          Dispatch Order (must be admin)
        </button>
      </div>
    </div>

    <p class="text-center text-sm text-gray-500 mt-6">
      We appreciate your business! Enjoy your order.
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useShoppingCart } from '@/stores/shoppingCart'
import { useSessionStore } from '@/stores/session'
import Card from '@/components/shared/Card.vue'
import { type Order } from '@/types/order'
import { useCreateOrder } from '@/composables/useOrder'

const router = useRouter()
const cart = useShoppingCart()
const session = useSessionStore()

const { isPending, mutateAsync } = useCreateOrder()

const hasNaviPort = computed(() => cart.selectedNaviPort !== null)

onMounted(() => {
  if (cart.itemCount === 0) {
    router.push({ name: 'menu' })
  }
  if (session.user.guestEmail !== null) {
    session.createGuest()
  }
})

const selectNaviPort = () => {
  router.push({ name: 'findNavi' })
}

const submitOrder = async () => {
  if (!cart.selectedNaviPort) {
    alert('Please select a NaviPort location first')
    return
  }

  if (cart.itemCount === 0) {
    alert('Your cart is empty')
    return
  }

  const orderData = {
    navi_port: cart.selectedNaviPort,
    items: cart.serverCart,
  }

  try {
    const response = await mutateAsync(orderData)

    cart.clearCart()

    router.push({
      name: 'orderConfirmation',
      params: { orderId: response.order.id },
    })
  } catch (error) {
    console.error('Order submission failed:', error)
    alert('Failed to submit order. Please try again.')
  }
}
</script>

<template>
  <div class="max-w-6xl mx-auto p-6">
    <h1 class="text-3xl font-bold mb-6">Checkout</h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Left Column: Order Details -->
      <div class="space-y-6">
        <!-- NaviPort Selection -->
        <Card>
          <template #header>
            <h2 class="text-lg font-semibold">Pickup Location</h2>
          </template>
          <template #body>
            <div v-if="hasNaviPort">
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium">NaviPort #{{ cart.selectedNaviPort }}</p>
                  <p class="text-sm mt-1">Selected pickup location</p>
                </div>
                <button
                  @click="selectNaviPort"
                  class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Change
                </button>
              </div>
            </div>
            <div v-else class="text-center py-4">
              <p class="mb-3">No location selected</p>
              <button
                @click="selectNaviPort"
                class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                Select NaviPort
              </button>
            </div>
          </template>
        </Card>

        <!-- Order Items -->
        <Card>
          <template #header>
            <h2 class="text-lg font-semibold">Order Items ({{ cart.itemCount }})</h2>
          </template>
          <template #body>
            <div class="space-y-4 max-h-96 overflow-y-auto">
              <div
                v-for="item in cart.localCart"
                :key="item.cartItemId"
                class="flex justify-between text-sm pb-4 border-b last:border-b-0"
              >
                <div class="flex-1 pr-4">
                  <p class="font-medium">{{ item.menuItemName }}</p>
                  <p class="text-xs mt-1">Qty: {{ item.quantity }}</p>
                  <ul v-if="item.customizations.length > 0" class="text-xs mt-2 space-y-1">
                    <li v-for="(custom, idx) in item.customizations" :key="idx">
                      {{ custom.groupName }}: {{ custom.optionName }}
                    </li>
                  </ul>
                  <p v-if="item.specialInstructions" class="text-xs italic mt-2">
                    Note: {{ item.specialInstructions }}
                  </p>
                </div>
                <p class="font-medium">${{ item.totalPrice.toFixed(2) }}</p>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <div>
        <Card class="sticky top-6">
          <template #header>
            <h2 class="text-lg font-semibold">Order Summary</h2>
          </template>
          <template #body>
            <div class="space-y-3 mb-6">
              <div class="flex justify-between">
                <span>Subtotal</span>
                <span class="font-medium">${{ cart.subtotal.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between">
                <span>Tax (8%)</span>
                <span class="font-medium">${{ cart.tax.toFixed(2) }}</span>
              </div>
              <div class="border-t pt-3 flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>${{ cart.totalPrice.toFixed(2) }}</span>
              </div>
            </div>

            <div class="space-y-3">
              <button
                @click="submitOrder"
                :disabled="!hasNaviPort || isPending || cart.itemCount === 0"
                class="w-full px-6 py-4 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <span v-if="isPending" class="flex items-center justify-center">
                  <svg class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Placing Order...
                </span>
                <span v-else>Place Order</span>
              </button>
              <button
                @click="router.push({ name: 'cart' })"
                class="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium transition-colors"
              >
                Back to Cart
              </button>
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

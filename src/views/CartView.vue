<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useShoppingCart } from '@/stores/shoppingCart'
import CartItemCard from '@/components/cart/CartItemCard.vue'
import Card from '@/components/shared/Card.vue'

const router = useRouter()
const cart = useShoppingCart()

const goToCheckout = () => {
  if (cart.itemCount === 0) return
  router.push({ name: 'checkout' })
}

const continueShopping = () => {
  router.push({ name: 'menu' })
}
</script>

<template>
  <div class="max-w-4xl mx-auto p-6">
    <h1 class="text-3xl font-bold mb-6">Your Cart</h1>

    <!-- Empty Cart State -->
    <div v-if="cart.itemCount === 0" class="text-center py-12">
      <svg
        class="mx-auto h-16 w-16 text-gray-400 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      <p class="text-gray-500 text-lg mb-4">Your cart is empty</p>
      <button
        @click="continueShopping"
        class="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
      >
        Browse Menu
      </button>
    </div>

    <!-- Cart Items -->
    <div v-else>
      <div class="space-y-4 mb-6">
        <CartItemCard v-for="item in cart.localCart" :key="item.cartItemId" :item="item" />
      </div>

      <!-- Order Summary -->
      <Card class="mb-6">
        <template #header>
          <h2 class="text-xl font-semibold">Order Summary</h2>
        </template>
        <template #body>
          <div class="space-y-3">
            <div class="flex justify-between text-gray-700">
              <span>Subtotal ({{ cart.itemCount }} item{{ cart.itemCount > 1 ? 's' : '' }})</span>
              <span class="font-medium">${{ cart.subtotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-gray-700">
              <span>Tax (8%)</span>
              <span class="font-medium">${{ cart.tax.toFixed(2) }}</span>
            </div>
            <div class="border-t pt-3 flex justify-between text-xl font-bold">
              <span>Total</span>
              <span>${{ cart.totalPrice.toFixed(2) }}</span>
            </div>
          </div>
        </template>
      </Card>

      <!-- Action Buttons -->
      <div class="flex gap-4 flex-col sm:flex-row">
        <button
          @click="continueShopping"
          class="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium transition-colors"
        >
          Continue Shopping
        </button>
        <button
          @click="goToCheckout"
          class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold transition-colors"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useShoppingCart } from '@/stores/shoppingCart'
import { type CartItem } from '@/types/cart'
import Card from '@/components/shared/Card.vue'

const props = defineProps<{
  item: CartItem
}>()

const cart = useShoppingCart()

const itemSubtotal = computed(() => {
  return props.item.totalPrice
})

const updateQuantity = (newQuantity: number) => {
  if (newQuantity < 1) return
  cart.updateCartItemQuantity(props.item.cartItemId, newQuantity)
}

const removeItem = () => {
  if (confirm(`Remove "${props.item.menuItemName}" from your cart?`)) {
    cart.removeCartItem(props.item.cartItemId)
  }
}

// Format customizations for display
const customizationSummary = computed(() => {
  return props.item.customizations.map((customization) => {
    return `${customization.groupName}: ${customization.optionName}`
  })
})
</script>

<template>
  <Card>
    <template #header>
      <div class="flex justify-between items-start">
        <h3 class="text-lg font-semibold text-gray-900">{{ item.menuItemName }}</h3>
        <button
          @click="removeItem"
          class="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
        >
          Remove
        </button>
      </div>
    </template>

    <template #body>
      <!-- Base Price -->
      <div class="text-sm text-gray-600 mb-3">
        <span class="font-medium">Base Price:</span> ${{ item.basePrice.toFixed(2) }}
      </div>

      <!-- Customizations -->
      <div v-if="customizationSummary.length > 0" class="mb-4">
        <p class="text-sm font-medium text-gray-700 mb-2">Customizations:</p>
        <ul class="text-sm text-gray-600 space-y-1 pl-4">
          <li v-for="(summary, idx) in customizationSummary" :key="idx" class="flex items-start">
            <span class="text-gray-400 mr-2">•</span>
            <span>{{ summary }}</span>
          </li>
        </ul>
      </div>

      <!-- Special Instructions -->
      <div
        v-if="item.specialInstructions"
        class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md"
      >
        <p class="text-sm font-medium text-gray-700 mb-1">Special Instructions:</p>
        <p class="text-sm text-gray-600 italic">{{ item.specialInstructions }}</p>
      </div>

      <!-- Quantity Controls and Price -->
      <div class="flex items-center justify-between pt-3 border-t">
        <div class="flex items-center gap-3">
          <label class="text-sm font-medium text-gray-700">Quantity:</label>
          <div class="flex items-center border border-gray-300 rounded-md">
            <button
              @click="updateQuantity(item.quantity - 1)"
              :disabled="item.quantity <= 1"
              class="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20 12H4"
                />
              </svg>
            </button>
            <input
              :value="item.quantity"
              @change="updateQuantity(parseInt(($event.target as HTMLInputElement).value))"
              type="number"
              min="1"
              max="99"
              class="w-16 px-2 py-2 text-center border-x border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              @click="updateQuantity(item.quantity + 1)"
              :disabled="item.quantity >= 99"
              class="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>
        </div>

        <div class="text-right">
          <p class="text-sm text-gray-500">Item Total</p>
          <p class="text-xl font-bold text-gray-900">${{ itemSubtotal.toFixed(2) }}</p>
        </div>
      </div>
    </template>
  </Card>
</template>

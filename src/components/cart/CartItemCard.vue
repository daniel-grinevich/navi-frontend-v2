<script setup lang="ts">
import { computed } from 'vue'
import { useShoppingCart } from '@/stores/shoppingCart'
import { type CartItem } from '@/types/cart'
import { useRouter } from 'vue-router'

const props = defineProps<{
  item: CartItem
}>()

const cart = useShoppingCart()
const router = useRouter()

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

const edit = () => {
  router.push({
    name: 'menuItemDetail',
    params: { id: props.item.menuItemSlug, cartId: props.item.cartItemId },
  })
}

const customizationSummary = computed(() => {
  return props.item.customizations.map((customization) => {
    return `${customization.groupName}: ${customization.optionName}`
  })
})
</script>

<template>
  <div class="flex text-xs">
    <!-- Green Ribbon -->
    <div class="w-[0.5rem] bg-green border border-alt shrink-0"></div>
    <!-- Card Content -->
    <div class="flex-1 border border-alt border-l-0">
      <!-- Header -->
      <div class="px-3 py-1 border-b border-alt flex justify-between items-center font-mono">
        <span class="text-alt">{{ item.menuItemName }}</span>
        <div class="flex flex-row gap-3">
          <button
            class="text-blue-600 hover:text-blue-800 cursor-pointer transition-colors"
            @click="edit"
          >
            edit[\]
          </button>
          <button
            class="text-red hover:text-red-800 transition-colors cursor-pointer"
            @click="removeItem"
          >
            remove[x]
          </button>
        </div>
      </div>
      <!-- Body -->
      <div class="px-3 py-2">
        <!-- Base Price -->
        <div class="py-1">
          <span class="text-alt">base price:</span>
          <span class="font-mono">${{ item.basePrice.toFixed(2) }}</span>
        </div>

        <!-- Customizations -->
        <div v-if="customizationSummary.length > 0" class="py-1">
          <p class="text-alt mb-1">customizations:</p>
          <ul class="space-y-1 pl-2">
            <li v-for="(summary, idx) in customizationSummary" :key="idx" class="flex items-start">
              <span class="text-green mr-2">▸</span>
              <span>{{ summary }}</span>
            </li>
          </ul>
        </div>

        <!-- Special Instructions -->
        <div v-if="item.specialInstructions" class="py-1">
          <p class="text-alt mb-1">special instructions:</p>
          <div class="px-3 py-2 border border-alt">
            <p class="italic">{{ item.specialInstructions }}</p>
          </div>
        </div>
      </div>

      <!-- Quantity + Total -->
      <div class="px-3 py-2 border-t border-alt flex items-center justify-between">
        <div class="flex items-center gap-2 font-secondary">
          <span class="text-alt">qty:</span>
          <button
            @click="updateQuantity(item.quantity - 1)"
            :disabled="item.quantity <= 1"
            class="font-mono cursor-pointer hover:text-green disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            [−]
          </button>
          <input
            :value="item.quantity"
            @change="updateQuantity(parseInt(($event.target as HTMLInputElement).value))"
            type="number"
            min="1"
            max="99"
            class="w-12 px-1 py-1 border border-alt bg-transparent text-xs font-mono text-center focus:outline-none"
          />
          <button
            @click="updateQuantity(item.quantity + 1)"
            :disabled="item.quantity >= 99"
            class="font-mono cursor-pointer hover:text-green disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            [+]
          </button>
        </div>
        <span class="font-mono">${{ itemSubtotal.toFixed(2) }}</span>
      </div>
    </div>
  </div>
</template>

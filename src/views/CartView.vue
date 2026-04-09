<script setup lang="ts">
/*** libraries ****/
import { useRouter } from 'vue-router'
/*** components ****/
import CartItemCard from '@/components/cart/CartItemCard.vue'
import CartForm from '@/components/form/CartForm.vue'
/*** stores ***/
import { useShoppingCart } from '@/stores/shoppingCart'
import { useSessionStore } from '@/stores/session'

const router = useRouter()
const cart = useShoppingCart()
const session = useSessionStore()

const submitCart = () => {
  if (session.isAuthenticated) router.push({ name: 'checkout' })
}

const continueShopping = () => {
  router.push({ name: 'menu' })
}
</script>

<template>
  <div class="max-w-4xl mx-auto p-6 space-y-4">
    <!-- Empty Cart State -->
    <div v-if="cart.itemCount === 0" class="w-full text-xs border border-alt">
      <div class="px-3 py-1 border-b border-alt font-secondary text-alt">// cart</div>
      <div class="px-3 py-6 text-center">
        <p>cart is empty.</p>
        <button
          @click="continueShopping"
          class="group mt-3 px-3 py-2 border border-alt cursor-pointer font-secondary tracking-wide hover:bg-green hover:text-primary transition-colors"
        >
          <span class="text-green group-hover:text-primary">▸</span> BROWSE MENU
        </button>
      </div>
    </div>

    <div v-else class="space-y-4">
      <CartForm v-if="!session.isAuthenticated" />

      <div class="space-y-4">
        <CartItemCard v-for="item in cart.localCart" :key="item.cartItemId" :item="item" />
      </div>

      <div class="border border-alt text-xs">
        <div class="px-3 py-1 border-b border-alt font-secondary text-alt">// order summary</div>
        <div class="px-3 py-2 flex justify-between">
          <span>subtotal ({{ cart.itemCount }} item{{ cart.itemCount > 1 ? 's' : '' }})</span>
          <span class="font-mono">${{ cart.subtotal.toFixed(2) }}</span>
        </div>
        <div class="px-3 py-2 flex justify-between">
          <span>tax (8%)</span>
          <span class="font-mono">${{ cart.tax.toFixed(2) }}</span>
        </div>
        <div class="px-3 py-2 flex justify-between border-t border-alt">
          <span>total</span>
          <span class="font-mono">${{ cart.totalPrice.toFixed(2) }}</span>
        </div>
      </div>

      <div class="flex gap-4 flex-col sm:flex-row text-xs">
        <button
          @click="continueShopping"
          class="group flex-1 px-3 py-2 border border-alt cursor-pointer font-mono tracking-wide hover:bg-green hover:text-primary transition-colors"
        >
          <span class="text-green group-hover:text-primary">▸</span> CONTINUE SHOPPING
        </button>
        <button
          @click="submitCart"
          class="group flex-1 px-3 py-2 bg-green text-primary border border-alt cursor-pointer font-mono tracking-wide hover:bg-alt hover:text-primary hover:border-alt transition-colors"
        >
          <span>▸</span> CHECKOUT
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useShoppingCart } from '@/stores/shoppingCart'
import CartItemCard from '@/components/cart/CartItemCard.vue'
import { useSessionStore } from '@/stores/session'

const router = useRouter()
const cart = useShoppingCart()
const session = useSessionStore()

const guestEmail = ref('')
const emailError = ref('')

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const handleEmailBlur = () => {
  if (!guestEmail.value) {
    emailError.value = 'Email is required'
  } else if (!validateEmail(guestEmail.value)) {
    emailError.value = 'Please enter a valid email address'
  } else {
    emailError.value = ''
    session.setGuestEmail(guestEmail.value)
  }
}

const handleEmailInput = () => {
  if (emailError.value) {
    emailError.value = ''
  }
}

const goToCheckout = () => {
  if (cart.itemCount === 0) return

  if (!session.isAuthenticated) {
    if (!guestEmail.value) {
      emailError.value = 'Email is required'
      return
    }
    if (!validateEmail(guestEmail.value)) {
      emailError.value = 'Please enter a valid email address'
      return
    }
    session.setGuestEmail(guestEmail.value)
  }

  router.push({ name: 'checkout' })
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

    <!-- Cart Items -->
    <div v-else class="space-y-4">
      <!-- Guest Email -->
      <div
        v-if="!session.isAuthenticated"
        :class="['text-xs', emailError ? 'border-2 border-red' : 'border border-green']"
      >
        <div
          :class="[
            'px-3 py-1 border-b font-mono',
            emailError ? 'border-red bg-red text-primary' : 'border-green bg-green text-primary',
          ]"
        >
          {{ emailError ? '⚠ EMAIL REQUIRED' : '▸ EMAIL REQUIRED' }}
        </div>
        <div class="px-3 py-3">
          <span class="text-alt text-xs">enter your email so we can send you your receipt</span>
          <input
            id="user-email"
            v-model="guestEmail"
            type="email"
            placeholder="your@email.com"
            @blur="handleEmailBlur"
            @input="handleEmailInput"
            :class="[
              'w-full px-3 py-2 mt-2 border bg-transparent text-xs font-mono focus:outline-none',
              emailError ? 'border-red' : 'border-alt',
            ]"
          />
          <p v-if="emailError" class="text-red text-xs mt-3 px-2 py-2 border border-red">
            {{ emailError }}
          </p>
        </div>
      </div>

      <!-- Cart Items List -->
      <div class="space-y-4">
        <CartItemCard v-for="item in cart.localCart" :key="item.cartItemId" :item="item" />
      </div>

      <!-- Order Summary -->
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

      <!-- Action Buttons -->
      <div class="flex gap-4 flex-col sm:flex-row text-xs">
        <button
          @click="continueShopping"
          class="group flex-1 px-3 py-2 border border-alt cursor-pointer font-mono tracking-wide hover:bg-green hover:text-primary transition-colors"
        >
          <span class="text-green group-hover:text-primary">▸</span> CONTINUE SHOPPING
        </button>
        <button
          @click="goToCheckout"
          class="group flex-1 px-3 py-2 bg-green text-primary border border-alt cursor-pointer font-mono tracking-wide hover:bg-alt hover:text-primary hover:border-alt transition-colors"
        >
          <span>▸</span> CHECKOUT
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/*** libraries ****/
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
/*** components ****/
import CartItemCard from '@/components/cart/CartItemCard.vue'
/*** stores ***/
import { useShoppingCart } from '@/stores/shoppingCart'
import { useSessionStore } from '@/stores/session'
/*** composables ****/
import { useZod } from '@/composables/useZod'
import { useUserByEmail } from '@/composables/useUser'
/** schemas ***/
import { CartSchema } from '@/schemas/checkout/CartSchema'
/*** types ****/

const router = useRouter()
const cart = useShoppingCart()
const session = useSessionStore()
const guestEmail = ref<string>('')
const guestEmailError = ref('')

const cartErrorMessages = computed(() => {
  let zodEmailErrors: string[] = []

  if (!zodValueorError.value.success && zodValueorError.value.error) {
    zodEmailErrors = zodValueorError.value.error.guestEmail ?? []
  }

  let allEmailErrors: string[] = []
  if (guestEmailError.value.length) {
    allEmailErrors = [...zodEmailErrors, guestEmailError.value]
  } else {
    allEmailErrors = [...zodEmailErrors]
  }

  let zodCartItemErrors: string[] = []

  if (!zodValueorError.value.success && zodValueorError.value.error) {
    zodCartItemErrors = zodValueorError.value.error.CartItem ?? []
  }

  return {
    guestEmail: allEmailErrors,
    cartItems: zodCartItemErrors,
  }
})

const handleEmailInput = () => {
  if (guestEmailError.value.length !== 0) guestEmailError.value = ''
}

const handleEmailBlur = () => {
  debugger
  if (cartErrorMessages.value.guestEmail.length) {
    guestEmailError.value = cartErrorMessages.value.guestEmail[0] || 'Email has errors.'
  }
}

const cartFields = computed(() => {
  return { guestEmail: guestEmail.value, cartItems: cart.itemCount }
})

const { zodValueorError } = useZod(cartFields, CartSchema)

const submitCart = async () => {
  debugger
  if (cartErrorMessages.value.cartItems.length) return
  if (session.isAuthenticated) router.push({ name: 'checkout' })

  if (cartErrorMessages.value.guestEmail.length) {
    guestEmailError.value = 'You must be logged in or provide an email! (◡︵◡)'
    return
  }

  const response = await session.createGuest(guestEmail.value)

  const redirect = response?.redirect || null
  if (redirect === null) {
    session.setGuestEmail(guestEmail.value)
    router.push({ name: 'checkout' })
  }

  router.push({ name: redirect, query: { reason: 'auth-required' } })
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
      <div
        v-if="!session.isAuthenticated"
        :class="['text-xs', guestEmailError ? 'border-2 border-red' : 'border border-green']"
      >
        <div
          :class="[
            'px-3 py-1 border-b font-mono',
            guestEmailError
              ? 'border-red bg-red text-primary'
              : 'border-green bg-green text-primary',
          ]"
        >
          {{ guestEmailError ? '⚠ EMAIL REQUIRED' : '▸ EMAIL REQUIRED' }}
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
              guestEmailError ? 'border-red' : 'border-alt',
            ]"
          />
          <p v-if="guestEmailError" class="text-red text-xs mt-3 px-2 py-2 border border-red">
            {{ guestEmailError }}
          </p>
        </div>
      </div>

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

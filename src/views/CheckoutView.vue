<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useShoppingCart } from '@/stores/shoppingCart'
import { useSessionStore } from '@/stores/session'
import { useCreateOrder } from '@/composables/useOrder'
import { useStripe } from '@/composables/useStripe'
import { nextTick } from 'vue'

const router = useRouter()
const cart = useShoppingCart()
const session = useSessionStore()

const paymentStep = ref<'review' | 'payment'>('review')
const stripeElements = ref<any>(null)
const paymentError = ref<string | null>(null)
const orderId = ref<string | null>(null)

const { isPending, mutateAsync } = useCreateOrder()
const { getStripe } = useStripe()

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
    const { client_secret, order } = await mutateAsync(orderData)

    orderId.value = order.id || null

    if (orderId.value === null) {
      throw new Error('Cannot continue payment without order id')
    }

    const stripe = await getStripe()
    if (!stripe) throw new Error('Stripe failed to load')

    const elements = stripe.elements({ clientSecret: client_secret })
    const paymentElement = elements.create('payment')
    paymentStep.value = 'payment'
    await nextTick()
    paymentElement.mount('#payment-element')
    stripeElements.value = elements
  } catch (error) {
    console.error('Order submission failed:', error)
    alert('Failed to submit order. Please try again.')
  }
}

const confirmPayment = async () => {
  paymentError.value = null
  const stripe = await getStripe()
  if (!stripe || !stripeElements.value) return

  const { error } = await stripe.confirmPayment({
    elements: stripeElements.value,
    redirect: 'if_required',
  })

  if (error) {
    paymentError.value = error.message ?? 'Payment failed'
  } else {
    cart.clearCart()
    router.push({ name: 'orderConfirmation', params: { orderId: orderId.value } })
  }
}
</script>

<template>
  <div class="max-w-6xl mx-auto p-6 space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Left Column: Order Details -->
      <div class="space-y-4">
        <!-- NaviPort Selection -->
        <div class="border border-alt text-xs">
          <div class="px-3 py-1 border-b border-alt font-secondary text-alt">// pickup location</div>
          <div v-if="hasNaviPort" class="px-3 py-3">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-mono">NaviPort #{{ cart.selectedNaviPort }}</p>
                <p class="text-alt mt-1">selected pickup location</p>
              </div>
              <button
                @click="selectNaviPort"
                class="font-mono text-green hover:text-green/70 cursor-pointer transition-colors"
              >
                [change]
              </button>
            </div>
          </div>
          <div v-else class="px-3 py-4 text-center">
            <p class="mb-3">no location selected</p>
            <button
              @click="selectNaviPort"
              class="group px-3 py-2 border border-green text-green cursor-pointer font-mono tracking-wide hover:bg-green hover:text-primary transition-colors"
            >
              <span>▸</span> SELECT NAVIPORT
            </button>
          </div>
        </div>

        <!-- Order Items -->
        <div class="border border-alt text-xs">
          <div class="px-3 py-1 border-b border-alt font-secondary text-alt">
            // order items ({{ cart.itemCount }})
          </div>
          <div class="max-h-96 overflow-y-auto">
            <div
              v-for="item in cart.localCart"
              :key="item.cartItemId"
              class="px-3 py-3 border-b border-alt last:border-b-0 flex justify-between"
            >
              <div class="flex-1 pr-4">
                <p class="text-alt">{{ item.menuItemName }}</p>
                <p class="font-secondary mt-1">qty: {{ item.quantity }}</p>
                <ul v-if="item.customizations.length > 0" class="mt-2 space-y-1 pl-2">
                  <li v-for="(custom, idx) in item.customizations" :key="idx">
                    <span class="text-green mr-1">▸</span> {{ custom.groupName }}: {{ custom.optionName }}
                  </li>
                </ul>
                <p v-if="item.specialInstructions" class="italic mt-2 font-secondary">
                  note: {{ item.specialInstructions }}
                </p>
              </div>
              <p class="font-mono">${{ item.totalPrice.toFixed(2) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Order Summary -->
      <div>
        <div class="border border-alt text-xs sticky top-6">
          <div class="px-3 py-1 border-b border-alt font-secondary text-alt">// order summary</div>
          <div class="px-3 py-2 flex justify-between">
            <span>subtotal</span>
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

          <!-- Review Step -->
          <div v-if="paymentStep === 'review'" class="px-3 py-3 border-t border-alt space-y-3">
            <button
              @click="submitOrder"
              :disabled="!hasNaviPort || isPending || cart.itemCount === 0"
              class="group w-full px-3 py-2 bg-green text-primary border border-green cursor-pointer font-mono tracking-wide hover:bg-alt hover:text-primary hover:border-alt disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="isPending" class="blink">PLACING ORDER...</span>
              <span v-else><span>▸</span> PLACE ORDER</span>
            </button>
            <button
              @click="router.push({ name: 'cart' })"
              class="group w-full px-3 py-2 border border-alt cursor-pointer font-mono tracking-wide hover:bg-green hover:text-primary transition-colors"
            >
              <span class="text-green group-hover:text-primary">▸</span> BACK TO CART
            </button>
          </div>

          <!-- Payment Step -->
          <div v-else class="px-3 py-3 border-t border-alt space-y-3">
            <div id="payment-element" class="mb-3"></div>
            <p v-if="paymentError" class="text-red text-xs px-2 py-2 border border-red">
              {{ paymentError }}
            </p>
            <button
              @click="confirmPayment"
              class="group w-full px-3 py-2 bg-green text-primary border border-green cursor-pointer font-mono tracking-wide hover:bg-alt hover:text-primary hover:border-alt transition-colors"
            >
              <span>▸</span> CONFIRM PAYMENT
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

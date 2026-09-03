<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import { useShoppingCart } from '@/stores/shoppingCart'
import { useSessionStore } from '@/stores/session'
import { useAchievementsStore } from '@/stores/achievements'
import { useCreateOrder } from '@/composables/useOrder'
import { useStripe } from '@/composables/useStripe'
import { getApiErrorMessage } from '@/lib/errorParser'
import { nextTick } from 'vue'

const router = useRouter()
const cart = useShoppingCart()
const session = useSessionStore()
const achievements = useAchievementsStore()

const paymentStep = ref<'review' | 'payment'>('review')
const cardNumberElement = ref<any>(null)
const clientSecret = ref<string | null>(null)
const paymentError = ref<string | null>(null)
const orderId = ref<string | null>(null)
const hasWalletPay = ref(false)

const { isPending, mutateAsync } = useCreateOrder()
const { getStripe } = useStripe()

const hasNaviPort = computed(() => cart.selectedNaviPort !== null)

onBeforeMount(() => {
  if (cart.itemCount === 0) {
    router.push({ name: 'menu' })
  }
})

const selectNaviPort = () => {
  router.push({ name: 'findNavi' })
}

const submitOrder = async () => {
  paymentError.value = null

  if (!cart.selectedNaviPort) {
    paymentError.value = 'Please select a NaviPort location first'
    return
  }

  if (cart.itemCount === 0) {
    paymentError.value = 'Your cart is empty'
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

    clientSecret.value = client_secret

    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const elementStyle = {
      base: {
        color: isDark ? '#f4f4f0' : '#1a1a1a',
        fontFamily: "'Courier New', Courier, monospace",
        fontSize: '12px',
        '::placeholder': {
          color: isDark ? '#999999' : '#666666',
        },
      },
      invalid: {
        color: '#e03c31',
      },
    }

    const elements = stripe.elements()
    const cardNumber = elements.create('cardNumber', { style: elementStyle })
    const cardExpiry = elements.create('cardExpiry', { style: elementStyle })
    const cardCvc = elements.create('cardCvc', { style: elementStyle })

    const paymentRequest = stripe.paymentRequest({
      country: 'US',
      currency: 'usd',
      total: {
        label: 'NAVI Order',
        amount: Math.round(cart.totalPrice * 100),
      },
      requestPayerName: true,
      requestPayerEmail: true,
    })

    paymentStep.value = 'payment'
    await nextTick()

    cardNumber.mount('#card-number')
    cardExpiry.mount('#card-expiry')
    cardCvc.mount('#card-cvc')
    cardNumberElement.value = cardNumber

    const canMakePayment = await paymentRequest.canMakePayment()
    if (canMakePayment) {
      hasWalletPay.value = true
      const prButton = elements.create('paymentRequestButton', {
        paymentRequest,
        style: {
          paymentRequestButton: {
            type: 'default',
            theme: 'dark',
            height: '36px',
          },
        },
      })
      await nextTick()
      prButton.mount('#wallet-pay-button')

      paymentRequest.on('paymentmethod', async (ev: any) => {
        const { error: confirmError } = await stripe.confirmCardPayment(
          clientSecret.value!,
          { payment_method: ev.paymentMethod.id },
          { handleActions: false },
        )

        if (confirmError) {
          ev.complete('fail')
          paymentError.value = confirmError.message ?? 'Payment failed'
        } else {
          ev.complete('success')
          achievements.recordOrderPlaced(cart.localCart)
          cart.clearCart()
          router.push({ name: 'orderConfirmation', params: { orderId: orderId.value } })
        }
      })
    }
  } catch (error) {
    console.error('Order submission failed:', error)
    paymentError.value = getApiErrorMessage(error)
  }
}

const confirmPayment = async () => {
  paymentError.value = null
  const stripe = await getStripe()
  if (!stripe || !cardNumberElement.value || !clientSecret.value) return

  const { error } = await stripe.confirmCardPayment(clientSecret.value, {
    payment_method: {
      card: cardNumberElement.value,
    },
  })

  if (error) {
    paymentError.value = error.message ?? 'Payment failed'
  } else {
    achievements.recordOrderPlaced(cart.localCart)
    cart.clearCart()
    router.push({ name: 'orderConfirmation', params: { orderId: orderId.value } })
  }
}
</script>

<template>
  <div class="w-full text-xs space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Left Column: Order Details -->
      <div class="space-y-4">
        <!-- NaviPort Selection -->
        <div class="border border-alt text-xs">
          <div class="px-3 py-1 border-b border-alt font-secondary text-alt">
            // pickup location
          </div>
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
              class="navi-btn group px-3 py-2 border border-alt cursor-pointer font-mono tracking-wide hover:bg-green hover:text-primary transition-all duration-200"
            >
              <span class="text-green group-hover:text-primary">▸</span> SELECT NAVIPORT
            </button>
          </div>
        </div>

        <!-- Order Items -->
        <div class="border border-alt text-xs">
          <div class="px-3 py-1 border-b border-alt bg-green text-primary">
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
                    <span class="text-green mr-1">▸</span> {{ custom.groupName }}:
                    {{ custom.optionName }}
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
            <p v-if="paymentError" class="text-red px-2 py-2 border border-red">
              {{ paymentError }}
            </p>
            <button
              @click="submitOrder"
              :disabled="!hasNaviPort || isPending || cart.itemCount === 0"
              class="navi-btn group w-full px-3 py-2 bg-green text-primary border border-green cursor-pointer font-mono tracking-wide hover:bg-alt hover:text-primary hover:border-alt disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <span v-if="isPending" class="blink">PLACING ORDER...</span>
              <span v-else><span>▸</span> PLACE ORDER</span>
            </button>
            <button
              @click="router.push({ name: 'cart' })"
              class="navi-btn group w-full px-3 py-2 border border-alt cursor-pointer font-mono tracking-wide hover:bg-green hover:text-primary transition-all duration-200"
            >
              <span class="text-green group-hover:text-primary">▸</span> BACK TO CART
            </button>
          </div>

          <!-- Payment Step -->
          <div v-else class="border-t border-alt">
            <div class="px-3 py-1 border-b border-alt bg-green text-primary">// payment</div>
            <div class="px-3 py-3 space-y-3">
              <div v-if="hasWalletPay">
                <div id="wallet-pay-button"></div>
                <div class="flex items-center gap-3 my-3">
                  <div class="flex-1 border-t border-alt"></div>
                  <span class="font-secondary">or pay with card</span>
                  <div class="flex-1 border-t border-alt"></div>
                </div>
              </div>
              <div>
                <label class="block font-secondary mb-1">card number</label>
                <div id="card-number" class="w-full px-3 py-2 border border-alt bg-transparent focus-within:border-green transition-colors"></div>
              </div>
              <div class="flex gap-3">
                <div class="flex-1">
                  <label class="block font-secondary mb-1">expiry</label>
                  <div id="card-expiry" class="w-full px-3 py-2 border border-alt bg-transparent focus-within:border-green transition-colors"></div>
                </div>
                <div class="flex-1">
                  <label class="block font-secondary mb-1">cvc</label>
                  <div id="card-cvc" class="w-full px-3 py-2 border border-alt bg-transparent focus-within:border-green transition-colors"></div>
                </div>
              </div>
              <p v-if="paymentError" class="text-red px-2 py-2 border border-red">
                {{ paymentError }}
              </p>
              <button
                @click="confirmPayment"
                class="navi-btn group w-full px-3 py-2 bg-green text-primary border border-green cursor-pointer font-mono tracking-wide hover:bg-alt hover:text-primary hover:border-alt transition-all duration-200"
              >
                <span>▸</span> CONFIRM PAYMENT
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

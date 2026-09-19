<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useMenu, type MenuItem } from '@/composables/useMenu'
import { useAdminCreateOrder, type AdminServerOrder } from '@/composables/useOrder'
import { useCardPayment } from '@/composables/useCardPayment'
import { toServerItems, calculateItemTotal, cartSubtotal } from '@/lib/orderItems'
import { getApiErrorMessage } from '@/lib/errorParser'
import type { CartItem } from '@/types/cart'
import LoadingSpinnerTwo from '@/components/shared/LoadingSpinnerTwo.vue'

const router = useRouter()

const { isLoading: menuLoading, data: menu } = useMenu()
const { mutateAsync: createOrder, isPending } = useAdminCreateOrder()
const { mountCardFields, confirmCard } = useCardPayment()

const step = ref<'build' | 'payment'>('build')

// Isolated order state — deliberately NOT the shopping-cart store, so building
// an admin order never touches the admin's own cart.
const orderItems = ref<CartItem[]>([])
const naviPortId = ref<number | null>(null)
const customerEmail = ref('')
const guestName = ref('')
const guestContact = ref('')

const formError = ref<string | null>(null)
const paymentError = ref<string | null>(null)
const clientSecret = ref<string | null>(null)
const createdOrderId = ref<string | null>(null)
const isConfirming = ref(false)

const subtotal = computed(() => cartSubtotal(orderItems.value))
// Tax is computed server-side from the NaviPort when the order is created, so
// it's only known after placeOrder returns.
const orderTax = ref<number | null>(null)
const orderTotal = ref<number | null>(null)

const addItem = (m: MenuItem) => {
  const existing = orderItems.value.find(
    (i) => i.menuItemId === m.id && i.customizations.length === 0,
  )
  if (existing) {
    setQty(existing.cartItemId, existing.quantity + 1)
    return
  }
  const basePrice = Number(m.price) || 0
  const item: CartItem = {
    cartItemId: crypto.randomUUID(),
    menuItemId: m.id,
    menuItemName: m.name,
    menuItemSlug: m.slug,
    basePrice,
    customizations: [],
    quantity: 1,
    totalPrice: basePrice,
  }
  orderItems.value = [...orderItems.value, item]
}

const setQty = (cartItemId: string, quantity: number) => {
  if (quantity < 1) return
  orderItems.value = orderItems.value.map((i) =>
    i.cartItemId === cartItemId
      ? { ...i, quantity, totalPrice: calculateItemTotal({ ...i, quantity }) }
      : i,
  )
}

const removeItem = (cartItemId: string) => {
  orderItems.value = orderItems.value.filter((i) => i.cartItemId !== cartItemId)
}

const placeOrder = async () => {
  formError.value = null
  if (orderItems.value.length === 0) {
    formError.value = 'Add at least one item to the order.'
    return
  }
  if (naviPortId.value == null) {
    formError.value = 'Enter a NaviPort id.'
    return
  }

  const payload: AdminServerOrder = {
    navi_port: naviPortId.value,
    items: toServerItems(orderItems.value),
    ...(customerEmail.value ? { customer_email: customerEmail.value } : {}),
    ...(guestName.value ? { guest_name: guestName.value } : {}),
    ...(guestContact.value ? { guest_contact: guestContact.value } : {}),
  }

  try {
    const { client_secret, order } = await createOrder(payload)
    createdOrderId.value = order.id ?? null
    if (!createdOrderId.value) throw new Error('Cannot continue payment without an order id.')
    orderTax.value = Number(order.tax)
    orderTotal.value = Number(order.total)
    clientSecret.value = client_secret
    step.value = 'payment'
    await nextTick()
    await mountCardFields()
  } catch (error) {
    formError.value = getApiErrorMessage(error)
  }
}

const confirmPayment = async () => {
  paymentError.value = null
  if (!clientSecret.value) return
  isConfirming.value = true
  const { error } = await confirmCard(clientSecret.value)
  isConfirming.value = false
  if (error) {
    paymentError.value = error.message ?? 'Payment failed'
    return
  }
  router.push({ name: 'adminOrderDetail', params: { orderId: createdOrderId.value } })
}
</script>

<template>
  <div class="w-full text-xs space-y-4">
    <!-- Header -->
    <div class="border border-alt flex items-center justify-between">
      <div class="px-3 py-1 bg-green text-primary">// admin · new order</div>
      <button
        type="button"
        class="px-3 py-1 cursor-pointer text-green hover:underline font-mono"
        @click="router.push({ name: 'adminOrders' })"
      >
        ◂ ALL ORDERS
      </button>
    </div>

    <!-- Build Step -->
    <div v-if="step === 'build'" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Menu -->
      <div class="border border-alt">
        <div class="px-3 py-1 border-b border-alt font-secondary text-alt">// menu</div>
        <div v-if="menuLoading" class="flex justify-center py-8"><LoadingSpinnerTwo /></div>
        <div v-else class="max-h-96 overflow-y-auto">
          <div
            v-for="m in menu"
            :key="m.id"
            class="px-3 py-2 border-b border-alt last:border-b-0 flex items-center justify-between"
          >
            <div class="flex-1 pr-3">
              <p class="text-alt">{{ m.name }}</p>
              <p class="font-mono">${{ Number(m.price).toFixed(2) }}</p>
            </div>
            <button
              type="button"
              class="px-3 py-1 border border-alt cursor-pointer font-mono hover:bg-green hover:text-primary transition-colors"
              @click="addItem(m)"
            >
              ▸ ADD
            </button>
          </div>
        </div>
      </div>

      <!-- Order draft -->
      <div class="space-y-4">
        <div class="border border-alt">
          <div class="px-3 py-1 border-b border-alt bg-green text-primary">
            // order ({{ orderItems.length }})
          </div>
          <div v-if="orderItems.length === 0" class="px-3 py-4 text-center text-alt">
            no items yet
          </div>
          <div
            v-for="item in orderItems"
            :key="item.cartItemId"
            class="px-3 py-2 border-b border-alt last:border-b-0 flex items-center justify-between gap-2"
          >
            <span class="flex-1 text-alt">{{ item.menuItemName }}</span>
            <div class="flex items-center gap-1 font-mono">
              <button
                type="button"
                class="px-2 border border-alt cursor-pointer hover:bg-green hover:text-primary"
                @click="setQty(item.cartItemId, item.quantity - 1)"
              >
                −
              </button>
              <span class="px-1">{{ item.quantity }}</span>
              <button
                type="button"
                class="px-2 border border-alt cursor-pointer hover:bg-green hover:text-primary"
                @click="setQty(item.cartItemId, item.quantity + 1)"
              >
                +
              </button>
            </div>
            <span class="font-mono w-16 text-right">${{ item.totalPrice.toFixed(2) }}</span>
            <button
              type="button"
              class="text-red cursor-pointer hover:underline"
              @click="removeItem(item.cartItemId)"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Customer + location -->
        <div class="border border-alt">
          <div class="px-3 py-1 border-b border-alt font-secondary text-alt">// customer</div>
          <div class="px-3 py-2 space-y-2">
            <div>
              <label class="block font-secondary mb-1">customer email (existing user)</label>
              <input
                v-model="customerEmail"
                type="email"
                placeholder="customer@example.com"
                class="w-full px-3 py-2 border border-alt bg-transparent focus:border-green outline-none transition-colors"
              />
            </div>
            <div class="flex gap-2">
              <div class="flex-1">
                <label class="block font-secondary mb-1">guest name</label>
                <input
                  v-model="guestName"
                  type="text"
                  placeholder="walk-in name"
                  class="w-full px-3 py-2 border border-alt bg-transparent focus:border-green outline-none transition-colors"
                />
              </div>
              <div class="flex-1">
                <label class="block font-secondary mb-1">guest contact</label>
                <input
                  v-model="guestContact"
                  type="text"
                  placeholder="phone / email"
                  class="w-full px-3 py-2 border border-alt bg-transparent focus:border-green outline-none transition-colors"
                />
              </div>
            </div>
            <div>
              <label class="block font-secondary mb-1">naviport id</label>
              <input
                v-model.number="naviPortId"
                type="number"
                placeholder="e.g. 12"
                class="w-full px-3 py-2 border border-alt bg-transparent focus:border-green outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div class="border border-alt">
          <div class="px-3 py-2 flex justify-between">
            <span>subtotal</span>
            <span class="font-mono">${{ subtotal.toFixed(2) }}</span>
          </div>
          <div
            class="px-3 py-2 flex justify-between border-t border-alt"
            :class="{ 'text-alt': orderTax === null }"
          >
            <span>tax</span>
            <span v-if="orderTax !== null" class="font-mono">${{ orderTax.toFixed(2) }}</span>
            <span v-else class="font-secondary">calculated on submit</span>
          </div>
          <div class="px-3 py-2 flex justify-between border-t border-alt">
            <span>total</span>
            <span class="font-mono">${{ (orderTotal ?? subtotal).toFixed(2) }}</span>
          </div>
          <div class="px-3 py-3 border-t border-alt space-y-3">
            <p v-if="formError" class="text-red px-2 py-2 border border-red">{{ formError }}</p>
            <button
              type="button"
              :disabled="isPending || orderItems.length === 0"
              @click="placeOrder"
              class="w-full px-3 py-2 bg-green text-primary border border-green cursor-pointer font-mono tracking-wide hover:bg-alt hover:text-primary hover:border-alt disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="isPending" class="blink">CREATING ORDER...</span>
              <span v-else>▸ CONTINUE TO PAYMENT</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Step -->
    <div v-else class="max-w-md">
      <div class="border border-alt">
        <div class="px-3 py-1 border-b border-alt bg-green text-primary">// payment</div>
        <div class="px-3 py-3 space-y-3">
          <div>
            <label class="block font-secondary mb-1">card number</label>
            <div
              id="card-number"
              class="w-full px-3 py-2 border border-alt bg-transparent focus-within:border-green transition-colors"
            ></div>
          </div>
          <div class="flex gap-3">
            <div class="flex-1">
              <label class="block font-secondary mb-1">expiry</label>
              <div
                id="card-expiry"
                class="w-full px-3 py-2 border border-alt bg-transparent focus-within:border-green transition-colors"
              ></div>
            </div>
            <div class="flex-1">
              <label class="block font-secondary mb-1">cvc</label>
              <div
                id="card-cvc"
                class="w-full px-3 py-2 border border-alt bg-transparent focus-within:border-green transition-colors"
              ></div>
            </div>
          </div>
          <p v-if="paymentError" class="text-red px-2 py-2 border border-red">{{ paymentError }}</p>
          <button
            type="button"
            :disabled="isConfirming"
            @click="confirmPayment"
            class="w-full px-3 py-2 bg-green text-primary border border-green cursor-pointer font-mono tracking-wide hover:bg-alt hover:text-primary hover:border-alt disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="isConfirming" class="blink">CONFIRMING...</span>
            <span v-else>▸ CONFIRM PAYMENT (${{ (orderTotal ?? subtotal).toFixed(2) }})</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

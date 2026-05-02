<script setup lang="ts">
/*** libraries ****/
import { ref } from 'vue'
import { useRouter } from 'vue-router'
/*** components ****/
import CartItemCard from '@/components/cart/CartItemCard.vue'
import CartForm from '@/components/form/CartForm.vue'
import NaviButton from '@/components/shared/NaviButton.vue'
/*** stores ***/
import { useShoppingCart } from '@/stores/shoppingCart'
import { useSessionStore } from '@/stores/session'

const router = useRouter()
const cart = useShoppingCart()
const session = useSessionStore()
const isEditingEmail = ref(false)
const cartFormRef = ref<InstanceType<typeof CartForm> | null>(null)

const submitCart = () => {
  if (!session.isAuthenticated && !session.isGuest) {
    cartFormRef.value?.submit()
    return
  }

  router.push({ name: 'checkout' })
}

const continueShopping = () => {
  router.push({ name: 'menu' })
}
</script>

<template>
  <div class="w-full text-xs">
    <!-- Empty Cart -->
    <div v-if="cart.itemCount === 0" class="border border-alt">
      <div class="px-3 py-1 border-b border-alt text-primary bg-green">// cart</div>
      <div class="px-3 py-6 text-center">
        <p class="font-mono">cart is empty.</p>
        <div class="mt-3 inline-block">
          <NaviButton @click="continueShopping">BROWSE MENU</NaviButton>
        </div>
      </div>
    </div>

    <!-- Filled Cart -->
    <div v-else>
      <!-- Guest Email -->
      <div
        v-if="!session.isAuthenticated && (!session.isGuest || isEditingEmail)"
        class="border border-alt mb-4"
      >
        <CartForm ref="cartFormRef" :prefill-email="session.user.guestEmail || ''" @cancel="isEditingEmail = false" />
      </div>
      <div v-else-if="session.isGuest && !isEditingEmail" class="border border-alt mb-4 text-xs">
        <div class="px-3 py-2 flex items-center justify-between">
          <span>
            <span class="text-green">▸</span> guest:
            <span class="font-mono">{{ session.user.guestEmail }}</span>
          </span>
          <button
            @click="isEditingEmail = true"
            class="font-mono text-green hover:text-green/70 cursor-pointer transition-colors"
          >
            [change]
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Left Column: Items -->
        <div class="lg:col-span-2 border border-alt">
          <div class="px-3 py-1 border-b border-alt text-primary bg-green">
            // cart ({{ cart.itemCount }} item{{ cart.itemCount > 1 ? 's' : '' }})
          </div>
          <div class="divide-y divide-alt">
            <CartItemCard v-for="item in cart.localCart" :key="item.cartItemId" :item="item" />
          </div>
        </div>

        <!-- Right Column: Summary -->
        <div class="lg:col-span-1">
          <div class="border border-alt lg:sticky lg:top-4">
            <div class="px-3 py-1 border-b border-alt font-secondary text-alt">
              // order summary
            </div>
            <div class="px-3 py-2 flex justify-between">
              <span>subtotal ({{ cart.itemCount }} item{{ cart.itemCount > 1 ? 's' : '' }})</span>
              <span class="font-mono">${{ cart.subtotal.toFixed(2) }}</span>
            </div>
            <div class="px-3 py-2 flex justify-between">
              <span>tax (8%)</span>
              <span class="font-mono">${{ cart.tax.toFixed(2) }}</span>
            </div>
            <div class="px-3 py-2 flex justify-between border-t border-dashed border-alt">
              <span class="font-bold">total</span>
              <span class="font-mono font-bold">${{ cart.totalPrice.toFixed(2) }}</span>
            </div>
            <div class="px-3 py-3 border-t border-alt space-y-2">
              <NaviButton variant="filled" full-width @click="submitCart">CHECKOUT</NaviButton>
              <NaviButton variant="ghost" full-width @click="continueShopping"
                >CONTINUE SHOPPING</NaviButton
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

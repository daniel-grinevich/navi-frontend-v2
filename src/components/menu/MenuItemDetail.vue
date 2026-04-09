<script setup lang="ts">
/*** libraries ****/
import { useRouter, useRoute } from 'vue-router'
import { ref, computed, watch } from 'vue'
/*** components ****/
import CustomizationGroup from '@/components/menu/CustomizationGroup.vue'
import NaviButton from '@/components/shared/NaviButton.vue'
/*** stores ***/
import { useShoppingCart } from '@/stores/shoppingCart'
/*** composables ****/
import { useMenuItem } from '@/composables/useMenuItem'
/*** types ****/
import type { SelectedCustomization } from '@/types/customization'
import type { CartItem } from '@/types/cart'

const router = useRouter()
const route = useRoute()
const shoppingCart = useShoppingCart()

const cartId = route.params.cartId as string
const cartItem = shoppingCart.localCart.find((value) => value.cartItemId == cartId)

const id = route.params.id as string
const { isLoading, data: menuItem, isError } = useMenuItem(id)

const selectedCustomizations = ref<Map<string, SelectedCustomization[]>>(new Map())
const quantity = ref<number>(cartItem ? cartItem.quantity : 1)

//set item values if editing
watch(
  menuItem,
  (item) => {
    if (!item || !cartItem) return
    // Rebuild selectedCustomizations Map
    const map = new Map<string, SelectedCustomization[]>()

    ;(cartItem.customizations as SelectedCustomization[]).forEach((c) => {
      const list = map.get(c.groupId) || []
      list.push(c)
      map.set(c.groupId, list)
    })

    selectedCustomizations.value = map
  },
  { immediate: true },
)

const customizationGroups = computed(() => {
  return [...(menuItem.value?.category?.customization_groups || [])].sort(
    (a, b) => Number(b.is_required) - Number(a.is_required),
  )
})

const customizationMap = computed(() => {
  const customizationMap = new Map()

  menuItem.value?.category?.customization_groups.forEach((group) => {
    group.customizations.forEach((customization) =>
      customizationMap.set(customization.id, {
        name: customization.name,
        price: customization.price,
      }),
    )
  })

  return customizationMap
})

const hasCustomizations = computed(() => {
  return customizationGroups.value.length > 0
})

const updateCustomization = (groupId: string, customizationId: string, action: string) => {
  if (action === null || groupId === null) return

  const customizationsList = selectedCustomizations.value.get(groupId) || []

  if (action === 'add') {
    const groupName = customizationGroups.value.find((group) => group.id === groupId)?.name

    if (!groupName) return

    const newCustomization: SelectedCustomization = {
      groupId: groupId,
      groupName: groupName,
      optionId: customizationId,
      optionName: customizationMap.value.get(customizationId).name,
      priceModifier: parseFloat(customizationMap.value.get(customizationId).price),
    }

    selectedCustomizations.value.set(groupId, [...customizationsList, newCustomization])
  } else if (action === 'remove') {
    const filteredCustomizations = customizationsList.filter((x) => x.optionId !== customizationId)
    selectedCustomizations.value.set(groupId, filteredCustomizations)
  } else {
    Error(`The action: ${action}, is not supported.`)
  }
}

const hasAllRequiredCustomizations = computed(() => {
  return customizationGroups.value
    .filter((group) => group.is_required)
    .every((group) => {
      const customizations = selectedCustomizations.value.get(group.id) || []
      return customizations.length > 0
    })
})

const totalCustomizationModifiers = computed(() => {
  /*
  TODO apparently parseFloat is not percise enough for currency multiplication / addition
  We need to use a JS library like decimal.js to handle this.
  */
  let total = 0
  selectedCustomizations.value.forEach((group) => {
    group.forEach((option) => {
      const price = option.priceModifier || 0
      total += Number(price)
    })
  })
  return total
})

const displayPrice = computed(() => {
  if (!menuItem.value) return 0
  const basePrice = parseFloat(menuItem.value.price)
  return basePrice + totalCustomizationModifiers.value * quantity.value
})

const canAddToCart = computed(() => {
  return menuItem.value?.status === 'A' && hasAllRequiredCustomizations.value && quantity.value > 0
})

const onAddToCartClick = () => {
  if (!menuItem.value || !canAddToCart.value) return

  const cartItemData: Omit<CartItem, 'cartItemId' | 'totalPrice'> = {
    menuItemId: menuItem.value.id,
    menuItemName: menuItem.value.name,
    menuItemSlug: menuItem.value.slug,
    basePrice: parseFloat(menuItem.value.price),
    customizations: Array.from(selectedCustomizations.value.values()).flat(),
    quantity: quantity.value,
  }

  if (cartId) {
    shoppingCart.updateCartItem(cartId, cartItemData)
  } else {
    shoppingCart.addCartItem(cartItemData)
  }
  router.push({ name: 'cart' })
}
</script>

<template>
  <div v-if="isLoading" class="w-full text-xs border border-alt">
    <div class="px-3 py-2 font-secondary">loading item...</div>
  </div>
  <div v-else-if="isError" class="w-full text-xs border border-alt">
    <div class="px-3 py-2 font-secondary">error loading item.</div>
  </div>
  <div v-else-if="menuItem" class="w-full text-xs">
    <!-- item info -->
    <div class="border border-alt">
      <div class="px-3 py-1 border-b border-alt text-primary bg-green">
        // {{ menuItem.name }}
      </div>
      <div class="px-3 py-3">
        <div class="flex items-center justify-between">
          <span class="tracking-wide font-mono text-sm">{{ menuItem.name }}</span>
          <span class="font-mono">${{ menuItem.price }}</span>
        </div>
        <p v-if="menuItem.description" class="mt-2 font-secondary text-alt">
          {{ menuItem.description }}
        </p>
      </div>
      <div class="px-3 py-3 border-t border-alt flex items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="font-primary">quantity:</span>
          <button
            type="button"
            :disabled="quantity <= 1"
            @click="quantity = Math.max(1, quantity - 1)"
            class="w-7 h-7 border border-alt bg-transparent text-xs font-mono cursor-pointer hover:bg-green hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            −
          </button>
          <span class="w-8 text-center font-mono text-xs">{{ quantity }}</span>
          <button
            type="button"
            :disabled="quantity >= 99"
            @click="quantity = Math.min(99, quantity + 1)"
            class="w-7 h-7 border border-alt bg-transparent text-xs font-mono cursor-pointer hover:bg-green hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>
        <div class="flex-1 text-right font-mono">
          ${{ displayPrice.toFixed(2) }}
          <span v-if="totalCustomizationModifiers !== 0" class="font-secondary text-alt">
            ({{ totalCustomizationModifiers > 0 ? '+' : '' }}${{
              totalCustomizationModifiers.toFixed(2)
            }})
          </span>
        </div>
        <NaviButton :disabled="!canAddToCart" @click="onAddToCartClick">
          ADD TO CART
        </NaviButton>
      </div>
    </div>

    <!-- customizations -->
    <div v-if="!hasCustomizations" class="text-alt font-mono">No customizations exist.</div>
    <div v-else class="border border-alt mt-4">
      <div class="px-3 py-1 border-b border-alt font-secondary text-alt">// customize</div>
      <div class="divide-y divide-alt">
        <CustomizationGroup
          v-for="group in customizationGroups"
          :key="group.id"
          :group="group"
          @update-customization="updateCustomization"
        />
      </div>
      <div
        v-if="!hasAllRequiredCustomizations"
        class="px-3 py-2 border-t border-alt font-secondary text-alt"
      >
        * complete all required customizations
      </div>
    </div>
  </div>
</template>

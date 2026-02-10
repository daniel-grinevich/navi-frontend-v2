<script setup lang="ts">
/*** libraries ****/
import { useRouter, useRoute } from 'vue-router'
import { ref, computed } from 'vue'
/*** components ****/
import CustomizationGroup from '@/components/menu/CustomizationGroup.vue'
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

const id = route.params.id as string
const { isLoading, data: menuItem, isError } = useMenuItem(id)

const selectedCustomizations = ref<Map<string, SelectedCustomization[]>>(new Map())
const quantity = ref<number>(1)

const customizationGroups = computed(() => {
  return menuItem.value?.category?.customization_groups || []
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

  const cartItem: Omit<CartItem, 'cartItemId' | 'totalPrice'> = {
    menuItemId: menuItem.value.id,
    menuItemName: menuItem.value.name,
    menuItemSlug: menuItem.value.slug,
    basePrice: parseFloat(menuItem.value.price),
    customizations: Array.from(selectedCustomizations.value.values()).flat(),
    quantity: quantity.value,
  }

  shoppingCart.addCartItem(cartItem)
  router.push({ name: 'menu' })
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
      <div class="px-3 py-1 border-b border-alt font-secondary text-primary bg-green">
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
          <span class="font-secondary">qty:</span>
          <input
            id="quantity"
            v-model.number="quantity"
            type="number"
            min="1"
            max="99"
            class="w-16 px-2 py-1 border border-alt bg-transparent text-xs font-mono"
          />
        </div>
        <div class="flex-1 text-right font-mono">
          ${{ displayPrice.toFixed(2) }}
          <span v-if="totalCustomizationModifiers !== 0" class="font-secondary text-alt">
            ({{ totalCustomizationModifiers > 0 ? '+' : '' }}${{ totalCustomizationModifiers.toFixed(2) }})
          </span>
        </div>
        <button
          @click="onAddToCartClick"
          :disabled="!canAddToCart"
          class="group px-3 py-2 border border-alt cursor-pointer font-secondary tracking-wide hover:bg-green hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <span class="text-green group-hover:text-primary">▸</span> ADD TO CART
        </button>
      </div>
    </div>

    <!-- customizations -->
    <div v-if="customizationGroups.length > 0" class="border border-alt mt-4">
      <div class="px-3 py-1 border-b border-alt font-secondary text-alt">// customize</div>
      <div class="divide-y divide-alt">
        <CustomizationGroup
          v-for="group in customizationGroups"
          :key="group.id"
          :group="group"
          @update-customization="updateCustomization"
        />
      </div>
      <div v-if="!hasAllRequiredCustomizations" class="px-3 py-2 border-t border-alt font-secondary text-alt">
        * complete all required customizations
      </div>
    </div>
  </div>
</template>

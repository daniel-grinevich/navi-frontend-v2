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
import { type SelectedCustomization } from '@/types/customization'

const router = useRouter()
const route = useRoute()
const shoppingCart = useShoppingCart()

const id = route.params.id as string
const { isLoading, data: menuItem, isError } = useMenuItem(id)

const selectedCustomizations = ref<Map<number, number[]>>(new Map())
const quantity = ref<number>(1)

const customizationGroups = computed(() => {
  return menuItem.value?.category?.customization_groups || []
})

const customizationPriceMap = computed(() => {
  const customizationMap = new Map()

  menuItem.value?.category?.customization_groups.forEach((group) => {
    group.customizations.forEach((customization) =>
      customizationMap.set(customization.id, customization.price),
    )
  })

  return customizationMap
})

const updateCustomization = (groupId: number, customizationId: number, action: string) => {
  if (action === null || groupId === null) return

  const customizationsList = selectedCustomizations.value.get(groupId) || []
  if (action === 'add') {
    selectedCustomizations.value.set(groupId, [...customizationsList, customizationId])
  } else if (action === 'remove') {
    const filteredCustomizations = customizationsList.filter((x) => x !== customizationId)
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
    group.forEach((customizationId) => {
      const price = customizationPriceMap.value.get(customizationId) || 0
      total += Number(price)
    })
  })
  return total
})

const displayPrice = computed(() => {
  debugger
  if (!menuItem.value) return 0
  const basePrice = parseFloat(menuItem.value.price)
  return basePrice + totalCustomizationModifiers.value * quantity.value
})

const canAddToCart = computed(() => {
  return (
    menuItem.value?.status === 'available' &&
    hasAllRequiredCustomizations.value &&
    quantity.value > 0
  )
})

const onAddToCartClick = () => {
  if (!menuItem.value || !canAddToCart.value) return

  shoppingCart.addCartItem({
    menuItemId: menuItem.value.id!,
    menuItemName: menuItem.value.name,
    menuItemSlug: menuItem.value.slug,
    basePrice: parseFloat(menuItem.value.price),
    customizations: Array.from(selectedCustomizations.value.values()),
    quantity: quantity.value,
  })

  router.push({ name: 'cart' })
}
</script>

<template>
  <div v-if="isLoading" class="flex items-center justify-center p-8">
    <div>Loading...</div>
  </div>
  <div v-else-if="isError" class="p-4">Error loading menu item</div>
  <div v-else-if="menuItem" class="max-w-3xl mx-auto p-6">
    <div class="border rounded-lg p-6 mb-6">
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <h2 class="text-3xl font-bold">{{ menuItem.name }}</h2>
          <p v-if="menuItem.description" class="mt-2">
            {{ menuItem.description }}
          </p>
        </div>
        <div class="ml-6 text-right">
          <p class="text-sm">Base Price</p>
          <p class="text-2xl font-bold">${{ menuItem.price }}</p>
        </div>
      </div>
    </div>

    <div v-if="customizationGroups.length === 0">No customizations</div>
    <div v-else class="mb-6">
      <h3 class="text-xl font-semibold mb-4">Customize Your Order</h3>
      <div v-for="group in customizationGroups" :key="group.id">
        <CustomizationGroup :group="group" @update-customization="updateCustomization" />
      </div>
    </div>

    <div class="border-t pt-6 sticky bottom-0 bg-primary">
      <div class="flex items-center justify-between gap-4 flex-wrap">
        <div class="flex items-center gap-4">
          <label for="quantity" class="text-sm font-medium"> Quantity: </label>
          <input
            id="quantity"
            v-model.number="quantity"
            type="number"
            min="1"
            max="99"
            class="w-20 px-3 py-2 border rounded-md"
          />
        </div>

        <div class="text-right flex-1">
          <p class="text-sm">Total Price</p>
          <p class="text-3xl font-bold">${{ displayPrice.toFixed(2) }}</p>
          <p v-if="totalCustomizationModifiers !== 0" class="text-x">
            (includes
            {{ totalCustomizationModifiers > 0 ? '+' : '' }}${{
              totalCustomizationModifiers.toFixed(2)
            }}
            in customizations)
          </p>
        </div>

        <button
          @click="onAddToCartClick"
          :disabled="!canAddToCart"
          class="px-8 py-3 font-semibold rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Add to Cart
        </button>
      </div>

      <div
        v-if="!hasAllRequiredCustomizations && menuItem.status === 'available'"
        class="mt-3 text-smflex items-center"
      >
        <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
        Please complete all required customizations
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/*** libraries ****/
/*** components ****/
/*** stores ***/
import { useSessionStore } from '@/stores/shoppingCart'
/*** composables ****/
/*** types ****/
import { useRouter, useRoute } from 'vue-router'
import { ref, computed } from 'vue'
import { useMenuItem } from '@/composables/useMenuItem'
import { type MenuItem } from '@/composables/useMenu'
import CustomizationGroup from '@/components/menu/customization/CustomizationGroup.vue'
import AsyncList from '@/components/shared/AsyncList.vue'

const router = useRouter()
const route = useRoute()
const id = route.params.id as string

const { isLoading, data: menuItem, isError } = useMenuItem(id)
console.log(menuItem)
const customizationGroups = computed(() => {
  if (!menuItem.value) return []
  return menuItem.value.category.customization_groups
})

const sessionStore = useSessionStore()
const quantity = ref(1)

const onAddToCartClick = () => {
  if (menuItem.value && menuItem.value.id) {
    sessionStore.addCartItem({
      id: String(menuItem.value.id),
      price: parseFloat(menuItem.value.price),
      quantity: quantity.value,
    })
    router.push({ name: 'menu' })
  }
}
</script>

<template>
  <div v-if="isLoading">
    <div class="flex items-center justify-center p-8">Loading...</div>
  </div>
  <div v-else-if="isError">
    <div class="text-red-600 p-4">Error loading menu item</div>
  </div>
  <div v-else-if="menuItem" class="border border-gray-200 rounded-lg p-6 max-w-2xl mx-auto">
    <div class="flex justify-between items-start mb-4">
      <div class="flex-1">
        <h3 class="text-2xl font-semibold text-gray-900">{{ menuItem.name }}</h3>
        <p v-if="menuItem.description" class="text-sm text-gray-600 mt-2">
          {{ menuItem.description }}
        </p>
        <span
          v-if="menuItem.status"
          class="inline-block mt-3 px-3 py-1 text-xs rounded-full"
          :class="
            menuItem.status === 'available'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          "
        >
          {{ menuItem.status }}
        </span>
      </div>
      <div class="ml-4 text-right">
        <p class="text-2xl font-bold text-gray-900">${{ menuItem.price }}</p>
      </div>
    </div>

    <div class="mt-6 flex items-center gap-4">
      <div class="flex items-center gap-2">
        <label for="quantity" class="text-sm font-medium text-gray-700">Quantity:</label>
        <input
          id="quantity"
          v-model.number="quantity"
          type="number"
          min="1"
          class="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <AsyncList
          :items="customizationGroups"
          :loading="false"
          :error="false"
          :flex-direction="'col'"
        >
          <template #item="item">
            <CustomizationGroup :customizationGroup="item" />
          </template>
        </AsyncList>
      </div>
      <button
        @click="onAddToCartClick"
        :disabled="menuItem.status !== 'available'"
        class="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Add to Cart
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
/*** libraries ****/
import { computed } from 'vue'
/*** components ****/
import AsyncList from '@/components/shared/AsyncList.vue'
import MenuItemCard from './MenuItemCard.vue'
/*** stores ***/
import { useShoppingCart } from '@/stores/shoppingCart'
/*** composables ****/
import { useMenu, type MenuItem } from '@/composables/useMenu'
/*** types ****/

const cart = useShoppingCart()
const { isLoading, data: menuItems, isError } = useMenu()

// Only show drinks the selected machine can make (null = no restriction).
const availableMenuItems = computed(() => {
  if (!menuItems.value) return []
  const allowed = cart.activeNaviPortInfo?.menu_item_ids
  if (!allowed) return menuItems.value
  const allowedIds = new Set(allowed)
  return menuItems.value.filter((item) => allowedIds.has(item.id))
})

const groupedMenuItems = computed(() => {
  return availableMenuItems.value.reduce(
    (acc, item) => {
      const category = item.category_name
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(item)
      return acc
    },
    {} as Record<string, MenuItem[]>,
  )
})
</script>

<template>
  <div v-if="isLoading" class="w-full text-xs border border-alt">
    <div class="px-3 py-1 border-b border-alt text-primary bg-green">// menu</div>
    <div class="px-3 py-2 font-secondary">loading menu...</div>
  </div>
  <div v-else-if="isError" class="w-full text-xs border border-alt">
    <div class="px-3 py-1 border-b border-alt text-primary bg-green">// menu</div>
    <div class="px-3 py-2 font-secondary">error loading menu.</div>
  </div>
  <div v-else class="w-full text-xs border border-alt">
    <div class="px-3 py-1 border-b border-alt text-primary bg-green">// menu</div>
    <div v-if="availableMenuItems.length === 0" class="px-3 py-2 font-secondary">
      nothing on the menu at this machine right now.
    </div>
    <div
      v-for="(items, category, index) in groupedMenuItems"
      :key="category"
      :class="{ 'border-t border-alt': index !== 0 }"
    >
      <div class="px-3 py-1 border-b border-alt bg-strip text-xl font-secondary">
        {{ category }}
      </div>
      <div class="overflow-x-auto px-3 py-6">
        <AsyncList
          :items="items"
          :loading="isLoading"
          :error="isError"
          :flex-direction="'row'"
          :flex-gap="'gap-3'"
        >
          <template #item="item">
            <MenuItemCard v-bind="item" />
          </template>
        </AsyncList>
      </div>
    </div>
  </div>
</template>

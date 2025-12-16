<script setup lang="ts">
/*** libraries ****/
import { computed } from 'vue'
/*** components ****/
import AsyncList from '@/components/shared/AsyncList.vue'
import LoadingSpinnerTwo from '@/components/shared/LoadingSpinnerTwo.vue'
import MenuItemCard from './MenuItemCard.vue'
/*** stores ***/
/*** composables ****/
import { useMenu, type MenuItem } from '@/composables/useMenu'
/*** types ****/

const { isLoading, data: menuItems, isError } = useMenu()

const groupedMenuItems = computed(() => {
  if (!menuItems.value) return {}

  return menuItems.value.reduce(
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
  <div v-if="isLoading">
    <LoadingSpinnerTwo />
  </div>
  <div v-else-if="isError">Error...</div>
  <div v-else>
    <div v-for="(items, category) in groupedMenuItems" :key="category" class="mb-8">
      <h2 class="text-2xl font-bold mb-4">{{ category }}</h2>
      <AsyncList :items="items" :loading="false" :error="false" :flex-direction="'row'">
        <template #item="item">
          <MenuItemCard v-bind="item" />
        </template>
      </AsyncList>
    </div>
  </div>
</template>

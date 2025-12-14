<script setup lang="ts" generic="T extends { id?: string | number }">
/*** libraries ****/
import { onMounted, ref } from 'vue'
/*** components ****/
/*** stores ***/
/*** composables ****/
/*** types ****/

const props = withDefaults(
  defineProps<{
    items?: T[]
    ready?: boolean
    loading?: boolean
    error?: T
    flexDirection?: string
    flexGap?: string
    noDataMsg?: string
    refetch?: () => Promise<void> | Promise<T[]> | void
  }>(),
  {
    items: () => [],
    ready: false,
    loading: false,
    error: undefined,
    flexDirection: 'col',
    flexGap: 'gap-3',
    noDataMsg: 'No data to display.',
    fetchFn: undefined,
  },
)
</script>
<template>
  <div v-if="loading" class="h-full flex items-center justify-center">
    <LoadingSpinnerTwo />
  </div>
  <div v-else-if="error" class="text-red-500 text-center py-4">{{ error }}</div>
  <div v-else-if="items.length === 0" class="text-center py-4">{{ noDataMsg }}</div>
  <div v-else class="flex" :class="[flexDirection === 'col' ? 'flex-col' : 'flex-row', flexGap]">
    <div v-for="(item, index) in items" :key="item.id ?? index">
      <slot name="item" v-bind="item"></slot>
    </div>
  </div>
</template>

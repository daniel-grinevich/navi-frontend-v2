<script setup lang="ts">
import { computed } from 'vue'

// Page-based pagination control for DRF PageNumberPagination lists. Drive it
// with the response `count` (+ page size) and the current page; it emits
// `update:page` so the parent can refetch.
const props = withDefaults(
  defineProps<{
    page: number
    count: number
    pageSize?: number
  }>(),
  { pageSize: 20 },
)

const emit = defineEmits<{ (e: 'update:page', page: number): void }>()

const totalPages = computed(() => Math.max(1, Math.ceil(props.count / props.pageSize)))
const hasPrev = computed(() => props.page > 1)
const hasNext = computed(() => props.page < totalPages.value)

const go = (page: number) => {
  if (page < 1 || page > totalPages.value || page === props.page) return
  emit('update:page', page)
}
</script>

<template>
  <div
    v-if="totalPages > 1"
    class="border border-alt flex items-center justify-between text-xs font-mono"
  >
    <button
      type="button"
      :disabled="!hasPrev"
      @click="go(page - 1)"
      class="px-3 py-2 border-r border-alt cursor-pointer tracking-wide transition-colors hover:bg-green hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-inherit"
    >
      ← PREV
    </button>

    <span class="px-3 py-2 text-alt">page {{ page }} of {{ totalPages }}</span>

    <button
      type="button"
      :disabled="!hasNext"
      @click="go(page + 1)"
      class="px-3 py-2 border-l border-alt cursor-pointer tracking-wide transition-colors hover:bg-green hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-inherit"
    >
      NEXT →
    </button>
  </div>
</template>

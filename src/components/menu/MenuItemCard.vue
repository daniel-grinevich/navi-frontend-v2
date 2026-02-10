<script setup lang="ts">
/*** libraries ****/
import { computed } from 'vue'
/*** components ****/
/*** stores ***/
/*** composables ****/
/*** types ****/
import { useRouter } from 'vue-router'

const props = withDefaults(
  defineProps<{
    id?: string | number
    slug: string
    name: string
    status: string
    category_name: string
    body: string
    description: string
    price: string
  }>(),
  {
    id: '',
    slug: '',
    name: '',
    status: '',
    category_name: '',
    body: '',
    description: '',
    price: '',
  },
)

const router = useRouter()

const onMenuItemClick = () => {
  router.push({ name: 'menuItemDetail', params: { id: props.slug } })
}

const isOffline = computed(() => props.status !== 'available')
</script>

<template>
  <div
    class="card w-56 h-36 shrink-0 border border-alt p-3 cursor-pointer transition-colors flex flex-col"
    @click="onMenuItemClick"
  >
    <div class="flex items-center justify-between gap-2">
      <span class="text-green">▸</span>
      <span class="tracking-wide font-mono text-sm flex-1">{{ name }}</span>
      <span class="p-1 bg-black text-bone">${{ price }}</span>
    </div>
    <p v-if="description" class="mt-2 font-secondary text-alt line-clamp-3">
      {{ description }}
    </p>
  </div>
</template>

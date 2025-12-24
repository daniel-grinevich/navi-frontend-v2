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
  <div class="card h-72 w-64 flex flex-col" @click="onMenuItemClick()">
    <!-- Action Button -->
    <div class="w-full border h-36 mx-auto flex items-center justify-center">Placeholder</div>
    <div id="info">
      <div class="flex flex-row">
        <h2 class="text-2xl font-primary grow">{{ props.name }}</h2>
        <div class="flex justify-end align-bottom">
          <div class="bg-dark-bg text-bone p-1 items-center align-middle">${{ props.price }}</div>
        </div>
      </div>
      <div class="font-secondary">
        <p>---------------------</p>
      </div>

      <button class="bg-opposite" @click.stop="onMenuItemClick()">Start Order</button>
    </div>
  </div>
</template>

<script setup lang="ts">
/*** libraries ****/
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
</script>

<template>
  <div class="border rounded-lg p-4 w-48 cursor-pointer" @click="onMenuItemClick()">
    <div class="flex justify-between items-start">
      <div class="flex-1">
        <h3 class="text-lg font-semibold text-gray-900">{{ props.name }}</h3>
        <p v-if="props.description" class="text-sm text-gray-600 mt-1">{{ props.description }}</p>
        <span
          v-if="props.status"
          class="inline-block mt-2 px-2 py-1 text-xs rounded-full"
          :class="
            props.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          "
        >
          {{ props.status }}
        </span>
      </div>
      <div class="ml-4 text-right">
        <p class="text-lg font-bold text-gray-900">${{ props.price }}</p>
      </div>
    </div>
  </div>
</template>

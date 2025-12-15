<script setup lang="ts">
/*** libraries ****/
/*** components ****/
/*** stores ***/
/*** composables ****/
/*** types ****/
import { useRouter,useRoute} from 'vue-router'
import { watch } from 'vue'
import { useMenuItem } from '@/composables/useMenuItem'
import { type MenuItem } from '@/composables/useMenu'

const router = useRouter()
const route=useRoute()
const id = route.params.id
const { isLoading, data: menuItem, isError } = useMenuItem(id)

const onAddToCartClick = (id) => {
  router.push({
    name: 'menuItemDetail', // Use the name defined in your router config
    params: { id: id }, // Pass the dynamic data as params
  })
}
</script>

<template>
  <div v-if="isLoading">
    <LoadingSpinnerTwo />
  </div>
  <div v-else-if="isError">Error...</div>
  <div v-else
    class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
  >
    <div class="flex justify-between items-start">
      <div class="flex-1">
        <h3 class="text-lg font-semibold text-gray-900">{{ menuItem.name }}</h3>
        <p v-if="menuItem.description" class="text-sm text-gray-600 mt-1">{{ menuItem.description }}</p>
        <span
          v-if="menuItem.status"
          class="inline-block mt-2 px-2 py-1 text-xs rounded-full"
          :class="
            menuItem.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          "
        >
          {{ menuItem.status }}
        </span>
      </div>
      <div class="ml-4 text-right">
        <p class="text-lg font-bold text-gray-900">${{ menuItem.price }}</p>
      </div>
    </div>
  </div>
</template>

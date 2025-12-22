<script setup lang="ts">
/*** libraries ****/
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
/*** components ****/
import LoadingSpinnerTwo from '@/components/shared/LoadingSpinnerTwo.vue'
import AsyncList from '@/components/shared/AsyncList.vue'
import Card from '@/components/shared/Card.vue'
import Address from '@/components/shared/Address.vue'
/*** stores ***/
import { useLocationStore } from '@/stores/location'
import { useShoppingCart } from '@/stores/shoppingCart'
/*** composables ****/
import { useNaviPorts } from '@/composables/useNaviPorts'
/*** helpers ***/
import { calculateDistance } from '@/helpers/locationHelper'
/*** types ****/
import type { NaviPort } from '@/types/NaviPort'

const router = useRouter()
const locationStore = useLocationStore()
const shoppingCartStore = useShoppingCart()
const { data: naviPortLocations, isLoading } = useNaviPorts()

const normalizedNaviPorts = computed(() => {
  if (!naviPortLocations.value || !locationStore.coords.latitude) return []

  return naviPortLocations.value.map((naviPort: NaviPort) => ({
    ...naviPort,
    address: {
      road: naviPort.address_line_1,
      city: naviPort.city,
      state: naviPort.state_or_region,
      postcode: naviPort.postal_code,
    },
    distance: calculateDistance(
      locationStore.coords.latitude,
      locationStore.coords.longitude,
      naviPort.latitude,
      naviPort.longitude,
    ).toFixed(2),
  }))
})

const handleNaviPortClick = (id: number) => {
  shoppingCartStore.selectedNaviPort = id
  router.push({ name: 'menu' })
}

onMounted(() => {
  locationStore.resume()
})
</script>
<template>
  <div class="max-w-4xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-4">Find Navi Location</h1>
    <div class="h-8">
      <p v-if="shoppingCartStore.selectedNaviPort == 0">No NaviPort selectd (T_T)</p>
      <p v-else>NaviPort Selected {{ shoppingCartStore.selectedNaviPort }}</p>
    </div>

    <div v-if="locationStore.error" class="bg-red-100 text-red-700 p-4 rounded-md mb-4">
      Error getting location: {{ locationStore.error.message }}
    </div>

    <div v-else-if="!locationStore.locatedAt" class="text-gray-600">
      <LoadingSpinnerTwo />
      <p>Can we have your location?</p>
    </div>

    <div v-else>
      <AsyncList :items="normalizedNaviPorts" :loading="isLoading">
        <template #item="naviPort">
          <Card>
            <template #body>
              <div class="flex flex-row justify-between">
                <Address :address="naviPort.address" />
                <button
                  class="p-1 border cursor-pointer w-24"
                  @click="handleNaviPortClick(naviPort.id)"
                  type="button"
                >
                  Select
                </button>
              </div>
            </template>
            <template #footer> {{ naviPort.distance }} miles away </template>
          </Card>
        </template>
      </AsyncList>
    </div>
  </div>
</template>

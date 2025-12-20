<script setup lang="ts">
/*** libraries ****/
import { ref, onMounted, computed } from 'vue'
/*** components ****/
import LoadingSpinnerTwo from '@/components/shared/LoadingSpinnerTwo.vue'
import Address, { type Address as AddressType } from '@/components/Address.vue'
/*** stores ***/
import { useLocationStore } from '@/stores/location'
/*** composables ****/
import { useNaviLocations } from '@/composables/useNaviLocations'
/*** helpers ***/
import { calculateDistance } from '@/helpers/locationHelper'
/*** types ****/
import type { NaviPort } from '@/types/NaviPort'

const locationStore = useLocationStore()
const address = ref<AddressType | null>(null)
const loadingAddress = ref(false)

const { data: naviPortLocations } = useNaviLocations()

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

onMounted(() => {
  locationStore.resume()
})
</script>
<template>
  <div class="max-w-4xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-4">Find Navi Location</h1>

    <div v-if="locationStore.error" class="bg-red-100 text-red-700 p-4 rounded-md mb-4">
      Error getting location: {{ locationStore.error.message }}
    </div>

    <div v-else-if="!locationStore.locatedAt" class="text-gray-600">
      <LoadingSpinnerTwo />
      <p>Can we have your location?</p>
    </div>

    <div
      v-else
      v-for="naviPort in normalizedNaviPorts"
      :key="naviPort.id"
      class="p-4 bg-white border border-gray-300 rounded-lg shadow-sm mb-4"
    >
      <Address :address="naviPort.address" />
      <div
        v-if="locationStore.coords.latitude && locationStore.coords.longitude"
        class="mt-2 text-sm font-semibold text-blue-600"
      >
        {{ naviPort.distance }} miles away
      </div>
    </div>
  </div>
</template>

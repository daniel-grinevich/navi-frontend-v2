<script setup lang="ts">
/*** libraries ****/
import { ref, onMounted } from 'vue'
/*** components ****/
import LoadingSpinnerTwo from '@/components/shared/LoadingSpinnerTwo.vue'
import Address, { type Address as AddressType } from '@/components/Address.vue'
/*** stores ***/
import { useLocationStore } from '@/stores/location'
import { useNaviLocations } from '@/composables/useNaviLocations'
/*** composables ****/
/*** types ****/

const locationStore = useLocationStore()
const address = ref<AddressType | null>(null)
const loadingAddress = ref(false)
const index = ref(0)
const preComputedLocations = ref<any[]>([])

const { data: naviLocations } = useNaviLocations()

/* Calculate distance between two coordinates using Haversine formula */
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 3959 // Earth's radius in miles (use 6371 for km)
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/* lol this is some ugly code */

onMounted(() => {
  locationStore.resume()

  const checkLocation = setInterval(() => {
    if (locationStore.coords.latitude && locationStore.coords.longitude) {
      getAddressFromCoords(locationStore.coords.latitude, locationStore.coords.longitude)
      clearInterval(checkLocation)
    }
  }, 1000)

  const slowlyComputeLocations = setInterval(async () => {
    if (!!naviLocations.value && index.value < naviLocations.value.length) {
      const loc = naviLocations.value[index.value]

      const lat = Number(loc.latitude)
      const lng = Number(loc.longitude)
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'NaviFrontend',
        },
      })

      const adr = await response.json()

      // Use spread to create plain object without reactive wrapper
      if (adr.address) {
        preComputedLocations.value = [
          { address: { ...adr.address }, latitude: lat, longitude: lng },
          ...preComputedLocations.value,
        ]
      }
      index.value += 1
    }
  }, 3000)

  setTimeout(() => clearInterval(checkLocation), 30000)
  setTimeout(() => clearInterval(slowlyComputeLocations), 30000)
})

/* Conver this into backend call with rate limiting 1 req per sec  */
const getAddressFromCoords = async (lat: number, lng: number) => {
  loadingAddress.value = true
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'NaviFrontend',
      },
    })

    const data = await response.json()
    address.value = data.address || null
  } catch (error) {
    address.value = null
    console.error('Error fetching address:', error)
  } finally {
    loadingAddress.value = false
  }
}
</script>
<template>
  <div class="max-w-4xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-4">Find Navi Location</h1>

    <div v-if="locationStore.error" class="bg-red-100 text-red-700 p-4 rounded-md mb-4">
      Error getting location: {{ locationStore.error.message }}
    </div>

    <div v-if="!locationStore.locatedAt" class="text-gray-600">
      <LoadingSpinnerTwo />
      <p>Can we have your location?</p>
    </div>

    <div v-else>
      <div v-if="loadingAddress">
        <LoadingSpinnerTwo />
        <p>Loading address...</p>
      </div>
      <div v-else-if="address" class="p-4 mb-4">
        <h6 class="">Your Here:</h6>
        <Address :address="address" />
        <h6 class="my-3 font-semibold">Navi Locations:</h6>

        <div
          v-for="(navi, idx) in preComputedLocations"
          :key="idx"
          class="p-4 bg-white border border-gray-300 rounded-lg shadow-sm mb-4"
        >
          <Address :address="navi.address" />
          <div
            v-if="locationStore.coords.latitude && locationStore.coords.longitude"
            class="mt-2 text-sm font-semibold text-blue-600"
          >
            {{
              calculateDistance(
                locationStore.coords.latitude,
                locationStore.coords.longitude,
                navi.latitude,
                navi.longitude,
              ).toFixed(1)
            }}
            miles away
          </div>
        </div>
      </div>
      <div v-else class="bg-yellow-50 p-4 rounded-md mb-4">
        <p class="text-sm text-gray-700">Address not found</p>
      </div>
    </div>
  </div>
</template>

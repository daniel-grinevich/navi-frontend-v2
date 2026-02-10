<script setup lang="ts">
/*** libraries ****/
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
/*** components ****/
import AsyncList from '@/components/shared/AsyncList.vue'
import Address from '@/components/shared/Address.vue'
/*** stores ***/
import { useLocationStore } from '@/stores/location'
import { useShoppingCart } from '@/stores/shoppingCart'
/*** composables ****/
import { useNaviPorts } from '@/composables/useNaviPorts'
/*** helpers ***/
import { calculateDistance } from '@/helpers/locationHelper'
/*** types ****/
import type { NaviPort, NormalizedNaviPort } from '@/types/NaviPort'

const router = useRouter()
const locationStore = useLocationStore()
const shoppingCartStore = useShoppingCart()
const { data: naviPortLocations, isLoading } = useNaviPorts()

const normalizedNaviPorts = computed<NormalizedNaviPort[]>(() => {
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
  const from = router.options.history.state.back?.toString()

  if (from != '/' && from !== undefined) {
    router.go(-1)
  }
  router.push({ name: 'cart' })
}

onMounted(() => {
  locationStore.resume()
})
</script>
<template>
  <div class="max-w-6xl mx-auto p-6">
    <div class="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4">
      <!-- Left Column: Selected NaviPort -->
      <div class="space-y-4">
        <div class="border border-alt text-xs md:sticky md:top-6">
          <div class="px-3 py-1 border-b border-alt font-secondary text-alt">// naviport status</div>
          <div class="px-3 py-2">
            <p v-if="shoppingCartStore.selectedNaviPort == 0" class="font-mono">no naviport selected</p>
            <p v-else class="font-mono">
              <span class="text-green">▪</span> naviport #{{ shoppingCartStore.selectedNaviPort }} selected
            </p>
          </div>
        </div>
      </div>

      <!-- Right Column: NaviPort Options -->
      <div class="space-y-4">
        <!-- Error State -->
        <div v-if="locationStore.error" class="border-2 border-red text-xs">
          <div class="px-3 py-1 border-b border-red bg-red text-primary font-mono">⚠ LOCATION ERROR</div>
          <div class="px-3 py-3">
            <p>{{ locationStore.error.message }}</p>
          </div>
        </div>

        <!-- Loading Location -->
        <div v-else-if="!locationStore.locatedAt" class="border border-alt text-xs">
          <div class="px-3 py-1 border-b border-alt font-secondary text-alt">// locating</div>
          <div class="px-3 py-4 text-center">
            <p class="font-mono blink">locating you...</p>
            <p class="font-secondary mt-2">can we have your location?</p>
          </div>
        </div>

        <!-- NaviPort List -->
        <template v-else>
          <AsyncList :items="normalizedNaviPorts" :loading="isLoading" flex-gap="gap-4">
            <template #item="naviPort">
              <div class="border border-alt border-l-[0.5rem] border-l-green text-xs">
                <div class="px-3 py-1 border-b border-alt font-secondary text-alt">
                  // naviport
                </div>
                <div class="px-3 py-3 flex flex-row justify-between items-center">
                  <Address :address="naviPort.address" />
                  <button
                    class="px-3 py-2 bg-green text-primary border border-green cursor-pointer font-mono tracking-wide hover:bg-alt hover:text-primary hover:border-alt transition-colors"
                    @click="handleNaviPortClick(naviPort.id)"
                    type="button"
                  >
                    ▸ SELECT
                  </button>
                </div>
                <div class="px-3 py-1 border-t border-alt font-mono">
                  {{ naviPort.distance }} miles away
                </div>
              </div>
            </template>
          </AsyncList>
        </template>
      </div>
    </div>
  </div>
</template>

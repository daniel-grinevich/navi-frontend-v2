<script setup lang="ts">
/*** libraries ****/
import { onMounted, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
/*** components ****/
import AsyncList from '@/components/shared/AsyncList.vue'
import Address from '@/components/shared/Address.vue'
import NaviButton from '@/components/shared/NaviButton.vue'
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

const editingHomebase = ref(false)
const homebaseInput = ref('')

const normalizedNaviPorts = computed<NormalizedNaviPort[]>(() => {
  const active = locationStore.activeCoords
  if (!naviPortLocations.value || !active) return []

  return naviPortLocations.value
    .map((naviPort: NaviPort) => ({
      ...naviPort,
      address: {
        road: naviPort.address_line_1,
        city: naviPort.city,
        state: naviPort.state_or_region,
        postcode: naviPort.postal_code,
      },
      distance: calculateDistance(
        active.latitude,
        active.longitude,
        naviPort.latitude,
        naviPort.longitude,
      ).toFixed(2),
    }))
    .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
})

const onlineCount = computed(() => normalizedNaviPorts.value.length)

const nearestDistance = computed(() => {
  if (normalizedNaviPorts.value.length === 0) return null
  return normalizedNaviPorts.value[0]?.distance ?? null
})

const userCoords = computed(() => {
  const active = locationStore.activeCoords
  if (!active) return null
  return `${active.latitude.toFixed(4)}, ${active.longitude.toFixed(4)}`
})

const showHomebaseForm = computed(
  () => locationStore.mode === 'homebase' && (!locationStore.homebase || editingHomebase.value),
)

const handleNaviPortClick = (id: number) => {
  shoppingCartStore.selectedNaviPort = id
  const from = router.options.history.state.back?.toString()

  if (from != '/' && from !== undefined) {
    router.go(-1)
  }
  router.push({ name: 'cart' })
}

const handleRefreshLocation = () => {
  locationStore.resume()
}

const handleSwitchMode = (mode: 'device' | 'homebase') => {
  editingHomebase.value = false
  locationStore.setMode(mode)
}

const handleEditHomebase = () => {
  homebaseInput.value = locationStore.homebase?.address ?? ''
  editingHomebase.value = true
}

const handleSubmitHomebase = async () => {
  await locationStore.setHomebase(homebaseInput.value)
  if (!locationStore.geocodeError) {
    editingHomebase.value = false
    homebaseInput.value = ''
  }
}

const handleCancelHomebaseEdit = () => {
  editingHomebase.value = false
  homebaseInput.value = ''
}

onMounted(() => {
  if (locationStore.mode === 'device') {
    locationStore.resume()
  }
})
</script>
<template>
  <div class="w-full text-xs">
    <!-- Top stats bar -->
    <div class="border border-alt mb-4">
      <div class="px-3 py-1 border-b border-alt text-primary bg-green">// naviports</div>
      <div class="px-3 py-2 flex flex-wrap gap-x-4 gap-y-1 font-mono">
        <template v-if="userCoords">
          <span><span class="text-green">▪</span> {{ onlineCount }} online</span>
          <span v-if="nearestDistance">
            <span class="text-green">◂</span> nearest: {{ nearestDistance }}mi
          </span>
          <span class="md:ml-auto text-alt">pos: {{ userCoords }}</span>
        </template>
        <template v-else>
          <span class="blink">awaiting signal...</span>
        </template>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4">
      <!-- Left Column: Info Stack -->
      <div class="space-y-4 md:sticky md:top-4 md:self-start">
        <!-- Status -->
        <div class="border border-alt">
          <div class="px-3 py-1 border-b border-alt font-secondary text-alt">// status</div>
          <div class="px-3 py-2">
            <p v-if="shoppingCartStore.selectedNaviPort == 0" class="font-mono">no naviport selected</p>
            <p v-else class="font-mono">
              <span class="text-green">◆</span> naviport #{{ shoppingCartStore.selectedNaviPort }} selected
            </p>
          </div>
        </div>

        <!-- Location source -->
        <div class="border border-alt">
          <div class="px-3 py-1 border-b border-alt font-secondary text-alt">// location source</div>
          <div class="px-3 py-2 space-y-2">
            <!-- Mode toggle -->
            <div class="flex gap-2">
              <button
                type="button"
                @click="handleSwitchMode('device')"
                class="flex-1 px-2 py-1 border font-mono tracking-wide transition-colors cursor-pointer"
                :class="
                  locationStore.mode === 'device'
                    ? 'bg-green text-primary border-green'
                    : 'border-alt hover:bg-green hover:text-primary'
                "
              >
                ▸ DEVICE
              </button>
              <button
                type="button"
                @click="handleSwitchMode('homebase')"
                class="flex-1 px-2 py-1 border font-mono tracking-wide transition-colors cursor-pointer"
                :class="
                  locationStore.mode === 'homebase'
                    ? 'bg-green text-primary border-green'
                    : 'border-alt hover:bg-green hover:text-primary'
                "
              >
                ▸ HOMEBASE
              </button>
            </div>

            <!-- Device mode status -->
            <div v-if="locationStore.mode === 'device'" class="space-y-2 font-mono">
              <p v-if="locationStore.error" class="text-red">⚠ location denied</p>
              <p v-else-if="!locationStore.locatedAt" class="blink">locating...</p>
              <p v-else>
                <span class="text-green">▪</span> located
              </p>
              <button
                type="button"
                @click="handleRefreshLocation"
                class="w-full px-2 py-1 border border-alt font-mono tracking-wide hover:bg-green hover:text-primary transition-colors cursor-pointer"
              >
                ▸ REFRESH
              </button>
            </div>

            <!-- Homebase mode -->
            <div v-else class="space-y-2">
              <!-- Existing homebase display -->
              <div v-if="locationStore.homebase && !editingHomebase" class="space-y-2 font-mono">
                <p class="text-alt break-words">
                  <span class="text-green">◆</span> {{ locationStore.homebase.address }}
                </p>
                <div class="flex gap-2">
                  <button
                    type="button"
                    @click="handleEditHomebase"
                    class="flex-1 px-2 py-1 border border-alt hover:bg-green hover:text-primary transition-colors cursor-pointer"
                  >
                    ▸ EDIT
                  </button>
                  <button
                    type="button"
                    @click="locationStore.clearHomebase()"
                    class="flex-1 px-2 py-1 border border-alt hover:bg-red hover:text-primary transition-colors cursor-pointer"
                  >
                    ▸ CLEAR
                  </button>
                </div>
              </div>

              <!-- Homebase form -->
              <form v-if="showHomebaseForm" @submit.prevent="handleSubmitHomebase" class="space-y-2">
                <label class="block font-mono text-alt">address:</label>
                <input
                  v-model="homebaseInput"
                  type="text"
                  placeholder="123 main st, city, state"
                  class="w-full px-3 py-2 border bg-transparent text-xs font-mono border-alt focus:outline-none focus:border-green"
                  :disabled="locationStore.isGeocoding"
                  required
                />
                <div class="flex gap-2">
                  <button
                    type="submit"
                    :disabled="locationStore.isGeocoding"
                    class="flex-1 px-2 py-1 border border-alt font-mono tracking-wide hover:bg-green hover:text-primary transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span v-if="locationStore.isGeocoding" class="blink">looking up...</span>
                    <span v-else>▸ LOOKUP</span>
                  </button>
                  <button
                    v-if="locationStore.homebase"
                    type="button"
                    @click="handleCancelHomebaseEdit"
                    class="px-2 py-1 border border-alt font-mono tracking-wide hover:bg-alt hover:text-primary transition-colors cursor-pointer"
                  >
                    [cancel]
                  </button>
                </div>
                <p v-if="locationStore.geocodeError" class="text-red font-mono break-words">
                  ⚠ {{ locationStore.geocodeError }}
                </p>
              </form>
            </div>
          </div>
        </div>

        <!-- Legend -->
        <div class="border border-alt">
          <div class="px-3 py-1 border-b border-alt font-secondary text-alt">// legend</div>
          <div class="px-3 py-2 grid grid-cols-2 gap-y-1 font-mono">
            <span><span class="text-green">▪</span> online</span>
            <span><span class="text-alt">▫</span> offline</span>
          </div>
        </div>
      </div>

      <!-- Right Column: NaviPort Options -->
      <div class="space-y-4">
        <!-- Device Error State -->
        <div
          v-if="locationStore.mode === 'device' && locationStore.error"
          class="border-2 border-red text-xs"
        >
          <div class="px-3 py-1 border-b border-red bg-red text-primary font-mono">⚠ LOCATION ERROR</div>
          <div class="px-3 py-3 space-y-2">
            <p>{{ locationStore.error.message }}</p>
            <p class="font-secondary text-alt">
              you can set a homebase address instead &rarr;
            </p>
          </div>
        </div>

        <!-- Loading Device Location -->
        <div
          v-else-if="locationStore.mode === 'device' && !locationStore.locatedAt"
          class="border border-alt text-xs"
        >
          <div class="px-3 py-1 border-b border-alt font-secondary text-alt">// locating</div>
          <div class="px-3 py-4 text-center">
            <p class="font-mono blink">locating you...</p>
            <p class="font-secondary mt-2">can we have your location?</p>
          </div>
        </div>

        <!-- Homebase Not Set -->
        <div
          v-else-if="locationStore.mode === 'homebase' && !locationStore.homebase"
          class="border border-alt text-xs"
        >
          <div class="px-3 py-1 border-b border-alt font-secondary text-alt">// homebase</div>
          <div class="px-3 py-4 text-center">
            <p class="font-mono">no homebase set.</p>
            <p class="font-secondary mt-2">add an address on the left to find naviports near it.</p>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="!isLoading && normalizedNaviPorts.length === 0"
          class="border border-alt"
        >
          <div class="px-3 py-1 border-b border-alt text-primary bg-green">// naviports</div>
          <div class="px-3 py-6 text-center">
            <p class="font-mono">no naviports found nearby.</p>
            <div class="mt-3 inline-block">
              <NaviButton @click="handleRefreshLocation">REFRESH LOCATION</NaviButton>
            </div>
          </div>
        </div>

        <!-- NaviPort List -->
        <template v-else>
          <AsyncList :items="normalizedNaviPorts" :loading="isLoading" flex-gap="gap-4">
            <template #item="naviPort">
              <div
                class="border border-alt text-xs"
                :class="
                  shoppingCartStore.selectedNaviPort === naviPort.id
                    ? 'border-l-[0.5rem] border-l-alt'
                    : 'border-l-[0.5rem] border-l-green'
                "
              >
                <div class="px-3 py-1 border-b border-alt font-secondary text-alt flex justify-between">
                  <span>// naviport #{{ naviPort.id }}</span>
                  <span class="font-mono"><span class="text-green">▪</span> online</span>
                </div>
                <div class="px-3 py-3 flex flex-row justify-between items-center gap-3">
                  <div class="flex-1 min-w-0">
                    <div v-if="naviPort.name" class="font-secondary mb-1 truncate">{{ naviPort.name }}</div>
                    <Address :address="naviPort.address" />
                  </div>
                  <button
                    v-if="shoppingCartStore.selectedNaviPort === naviPort.id"
                    class="px-3 py-2 bg-alt text-primary border border-alt cursor-default font-mono tracking-wide"
                    type="button"
                    disabled
                  >
                    ◆ SELECTED
                  </button>
                  <button
                    v-else
                    class="px-3 py-2 bg-green text-primary border border-green cursor-pointer font-mono tracking-wide hover:bg-alt hover:text-primary hover:border-alt transition-colors"
                    @click="handleNaviPortClick(naviPort.id)"
                    type="button"
                  >
                    ▸ SELECT
                  </button>
                </div>
                <div class="px-3 py-1 border-t border-alt font-mono">
                  <span class="text-green">◂</span> {{ naviPort.distance }} miles away
                </div>
              </div>
            </template>
          </AsyncList>
        </template>
      </div>
    </div>
  </div>
</template>

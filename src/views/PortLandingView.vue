<script setup lang="ts">
/*** libraries ****/
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
/*** components ****/
import NaviButton from '@/components/shared/NaviButton.vue'
/*** stores ***/
import { useShoppingCart } from '@/stores/shoppingCart'
/*** composables ****/
import { useNaviPortBySlug } from '@/composables/useNaviPorts'

const POLL_MS = 15_000

const props = defineProps<{ slug: string }>()

const router = useRouter()
const cart = useShoppingCart()

const { data: port, isLoading, isError, error, refetch } = useNaviPortBySlug(() => props.slug, {
  pollMs: POLL_MS,
})

const notFound = computed(() => isError.value && error.value?.status === 404)

type PortState = 'accepting' | 'paused' | 'offline'

const state = computed<PortState | null>(() => {
  if (!port.value) return null
  if (port.value.accepting_orders) return 'accepting'
  return port.value.is_online ? 'paused' : 'offline'
})

const stateLabel: Record<PortState, string> = {
  accepting: 'TAKING ORDERS',
  paused: 'PAUSED',
  offline: 'OFFLINE',
}

const stateFallbackMessage: Record<Exclude<PortState, 'accepting'>, string> = {
  paused: "This machine isn't taking orders right now. Check back soon.",
  offline: "This machine is offline right now. We're on it — check back soon.",
}

const waitText = computed(() => {
  if (!port.value) return ''
  const { queue_length, est_wait_seconds } = port.value
  if (queue_length === 0) return 'no wait'
  const minutes = Math.max(1, Math.ceil(est_wait_seconds / 60))
  return `${queue_length} ahead · ~${minutes} min`
})

// Scanning the sticker is the user saying "I'm at this machine": select it so
// menu and checkout never ask again.
watch(
  port,
  (p) => {
    if (!p) return
    cart.selectNaviPort(p.id, {
      id: p.id,
      slug: p.slug,
      name: p.name,
      menu_item_ids: p.menu_item_ids,
    })
  },
  { immediate: true },
)

const orderHere = () => {
  router.push({ name: 'menu' })
}
</script>

<template>
  <div class="w-full max-w-md mx-auto text-xs space-y-4">
    <!-- Loading -->
    <div v-if="isLoading" class="border border-alt">
      <div class="px-3 py-1 border-b border-alt text-primary bg-green">// naviport</div>
      <div class="px-3 py-6 font-secondary text-center">finding this machine...</div>
    </div>

    <!-- Not found -->
    <div v-else-if="notFound" class="border border-alt">
      <div class="px-3 py-1 border-b border-alt text-primary bg-green">// naviport</div>
      <div class="px-3 py-6 space-y-4 text-center">
        <p class="text-xl font-secondary">machine not found</p>
        <p class="font-secondary">This QR code doesn't match a NaviPort we know about.</p>
        <NaviButton full-width @click="router.push({ name: 'findNavi' })">FIND A NAVIPORT</NaviButton>
      </div>
    </div>

    <!-- Other error, no cached data -->
    <div v-else-if="isError && !port" class="border border-alt">
      <div class="px-3 py-1 border-b border-alt text-primary bg-green">// naviport</div>
      <div class="px-3 py-6 space-y-4 text-center">
        <p class="font-secondary">Couldn't reach this machine. Check your connection.</p>
        <NaviButton full-width @click="refetch()">TRY AGAIN</NaviButton>
      </div>
    </div>

    <!-- Port -->
    <div v-else-if="port && state" class="border border-alt">
      <div class="px-3 py-1 border-b border-alt text-primary bg-green">// naviport</div>
      <div class="px-3 py-4 space-y-1">
        <h1 class="text-2xl font-secondary break-words">{{ port.name }}</h1>
        <p class="font-secondary text-alt">{{ port.address.line1 }}, {{ port.address.city }}</p>
      </div>

      <div
        class="port-state px-3 py-6 border-t border-alt text-center space-y-2"
        :class="`port-state--${state}`"
        role="status"
        aria-live="polite"
      >
        <p class="text-3xl font-mono tracking-wide">
          <span aria-hidden="true">{{ state === 'accepting' ? '●' : '○' }}</span>
          {{ stateLabel[state] }}
        </p>
        <p v-if="state === 'accepting'" class="text-lg font-mono">{{ waitText }}</p>
        <p v-else class="text-sm font-secondary">
          {{ port.status_message || stateFallbackMessage[state] }}
        </p>
      </div>

      <div v-if="state === 'accepting'" class="px-3 py-4 border-t border-alt">
        <button
          type="button"
          class="order-here w-full py-4 bg-green text-primary border border-green cursor-pointer font-mono text-lg tracking-wide"
          @click="orderHere"
        >
          ▸ ORDER HERE
        </button>
      </div>
      <div v-else class="px-3 py-4 border-t border-alt text-center">
        <RouterLink :to="{ name: 'findNavi' }" class="font-mono text-green hover:underline">
          find another naviport
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.port-state--accepting {
  color: var(--color-green, #22c55e);
}

.port-state--paused {
  color: #d97706;
}

.port-state--offline {
  color: var(--color-red, #e03c31);
}

.order-here {
  min-height: 3.5rem;
}
</style>

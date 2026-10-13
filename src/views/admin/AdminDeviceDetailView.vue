<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useClipboard, useDocumentVisibility, useNow } from '@vueuse/core'
import NaviButton from '@/components/shared/NaviButton.vue'
import ToggleSwitch from '@/components/shared/ToggleSwitch.vue'
import LoadingSpinnerTwo from '@/components/shared/LoadingSpinnerTwo.vue'
import Qrcode from '@/components/shared/Qrcode.vue'
import ConfirmDialog from '@/components/admin/ConfirmDialog.vue'
import DeviceTokenNotice from '@/components/admin/DeviceTokenNotice.vue'
import {
  useDevice,
  useDeviceEvents,
  useRotateDeviceToken,
  useSendTestOrder,
  useUpdateDevice,
} from '@/composables/useDevices'
import { devicesSource } from '@/lib/adminOpsApi'
import { getApiErrorMessage } from '@/lib/errorParser'
import { timeAgo } from '@/helpers/timeAgo'
import type { DeviceEvent, DeviceEventType, DeviceTestOrder } from '@/types/devices'

const props = defineProps<{ deviceId: string }>()

const router = useRouter()
const now = useNow({ interval: 1000 })

const { data: device, isPending, isError, refetch } = useDevice(() => props.deviceId)

// --- Live event log: poll every 3s, paused when the tab is hidden or by hand ---
const visibility = useDocumentVisibility()
const manuallyPaused = ref(false)
const live = computed(() => visibility.value === 'visible' && !manuallyPaused.value)
const hideHeartbeats = ref(true)

const { data: events, isFetching: eventsFetching } = useDeviceEvents(() => props.deviceId, live)

const visibleEvents = computed(() =>
  (events.value ?? []).filter((e) => !(hideHeartbeats.value && e.type === 'heartbeat')),
)

const eventClass: Partial<Record<DeviceEventType, string>> = {
  connected: 'text-green',
  disconnected: 'text-red',
  brew_completed: 'text-green',
  brew_failed: 'text-red',
  token_rotated: 'text-red',
  test_order: 'text-blue',
  order_claimed: 'text-blue',
  brew_started: 'text-blue',
}

const eventTime = (iso: string) =>
  new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })

// --- Test order: QR + claim -> brew -> complete progress ---
const testOrder = ref<DeviceTestOrder | null>(null)
const testError = ref<string | null>(null)
const { mutate: sendTestOrder, isPending: sendingTest } = useSendTestOrder()
const { copy: copyQrToken, copied: qrTokenCopied } = useClipboard({ copiedDuring: 2000 })

const startTestOrder = () => {
  testError.value = null
  sendTestOrder(
    { id: props.deviceId },
    {
      onSuccess: (order) => {
        testOrder.value = order
        // Make sure the log is running so the loop is visible.
        manuallyPaused.value = false
      },
      onError: (error) => {
        testError.value = getApiErrorMessage(error)
      },
    },
  )
}

const eventOrderId = (e: DeviceEvent) =>
  typeof e.payload?.order_id === 'string' ? e.payload.order_id : null

type Step = { type: DeviceEventType; label: string }
const steps: Step[] = [
  { type: 'test_order', label: 'QUEUED' },
  { type: 'order_claimed', label: 'CLAIMED' },
  { type: 'brew_started', label: 'BREWING' },
  { type: 'brew_completed', label: 'COMPLETE' },
]

const testOrderEvents = computed(() => {
  const id = testOrder.value?.order_id
  if (!id) return []
  return (events.value ?? []).filter((e) => eventOrderId(e) === id)
})

const seenTypes = computed(() => new Set(testOrderEvents.value.map((e) => e.type)))

// A later step implies the earlier ones: devices may not report every step
// (e.g. brew_started isn't always emitted), so light everything up to the
// furthest step seen.
const reachedSteps = computed(() => {
  const furthest = steps.reduce((acc, s, i) => (seenTypes.value.has(s.type) ? i : acc), -1)
  return new Set(steps.slice(0, furthest + 1).map((s) => s.type))
})
const testFailed = computed(() => seenTypes.value.has('brew_failed'))
const testComplete = computed(() => seenTypes.value.has('brew_completed'))

// --- Device actions ---
const actionError = ref<string | null>(null)
const { mutate: updateDevice, isPending: updating } = useUpdateDevice()
const { mutate: rotateToken, isPending: rotating } = useRotateDeviceToken()
const confirmRotateOpen = ref(false)
const revealedToken = ref<string | null>(null)

const setEnabled = (enabled: boolean) => {
  actionError.value = null
  updateDevice(
    { id: props.deviceId, enabled },
    { onError: (error) => (actionError.value = getApiErrorMessage(error)) },
  )
}

const confirmRotate = () => {
  confirmRotateOpen.value = false
  actionError.value = null
  rotateToken(props.deviceId, {
    onSuccess: ({ device_token }) => (revealedToken.value = device_token),
    onError: (error) => (actionError.value = getApiErrorMessage(error)),
  })
}

// Qrcode.vue defaults to a remote logo in the middle; a test QR doesn't need it.
const noQrImage = { src: '', width: 0, height: 0, excavate: false }
</script>

<template>
  <div class="w-full text-xs space-y-4 font-mono">
    <!-- Header -->
    <div class="border border-alt flex items-center justify-between">
      <div class="px-3 py-1 bg-green text-primary">
        // admin · device
        <span v-if="devicesSource.kind === 'fixtures'">[fixtures]</span>
      </div>
      <button
        type="button"
        class="px-3 py-1 cursor-pointer text-green hover:underline"
        @click="router.push({ name: 'adminDevices' })"
      >
        ◂ ALL DEVICES
      </button>
    </div>

    <div v-if="isPending" class="flex justify-center py-8"><LoadingSpinnerTwo /></div>

    <div v-else-if="isError || !device" class="border-2 border-red">
      <div class="px-3 py-1 bg-red text-primary">⚠ ERROR</div>
      <div class="px-3 py-3 flex items-center justify-between">
        <span>failed to load device</span>
        <button type="button" class="text-green hover:underline cursor-pointer" @click="refetch()">
          RETRY
        </button>
      </div>
    </div>

    <template v-else>
      <!-- Status header -->
      <div class="border border-alt">
        <div class="px-3 py-3 flex flex-wrap items-center gap-3 border-b border-alt">
          <span
            class="inline-block w-3 h-3 rounded-full"
            :class="device.is_online ? 'bg-green' : 'bg-red'"
          />
          <h1 class="text-lg tracking-wide">{{ device.name }}</h1>
          <span :class="device.is_online ? 'text-green' : 'text-red'">
            {{ device.is_online ? 'ONLINE' : 'OFFLINE' }}
          </span>
          <span v-if="device.is_simulated" class="border border-alt px-1">SIM</span>
          <span v-if="!device.enabled" class="border border-red text-red px-1">DISABLED</span>
          <span class="ml-auto font-secondary" :title="device.last_seen ?? ''">
            last seen {{ timeAgo(device.last_seen, now.getTime()) }}
          </span>
        </div>
        <dl class="px-3 py-3 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2">
          <div>
            <dt class="font-secondary">mac</dt>
            <dd>{{ device.mac_address }}</dd>
          </div>
          <div>
            <dt class="font-secondary">location</dt>
            <dd>{{ device.location || '—' }}</dd>
          </div>
          <div>
            <dt class="font-secondary">firmware</dt>
            <dd>{{ device.firmware_version ?? '—' }}</dd>
          </div>
          <div>
            <dt class="font-secondary">naviport</dt>
            <dd>{{ device.navi_port?.name ?? '—' }}</dd>
          </div>
          <div class="col-span-2">
            <dt class="font-secondary">espresso machine</dt>
            <dd v-if="device.espresso_machine">
              {{ device.espresso_machine.machine_type ?? 'unknown model' }} · {{ device.espresso_machine.serial_number }}
              <span :class="device.espresso_machine.is_online ? 'text-green' : 'text-red'">
                ● {{ device.espresso_machine.is_online ? 'online' : 'offline' }}
              </span>
            </dd>
            <dd v-else>—</dd>
          </div>
        </dl>
        <div class="px-3 py-2 border-t border-alt flex flex-wrap items-center gap-4">
          <span class="flex items-center gap-2">
            enabled
            <ToggleSwitch
              :model-value="device.enabled"
              :disabled="updating"
              @update:model-value="setEnabled"
            />
          </span>
          <button
            type="button"
            class="cursor-pointer text-green hover:underline disabled:opacity-30"
            :disabled="rotating"
            @click="confirmRotateOpen = true"
          >
            ROTATE TOKEN
          </button>
        </div>
      </div>

      <div
        v-if="actionError"
        role="alert"
        class="border border-red text-red px-3 py-2 flex justify-between gap-3"
      >
        <span>⚠ {{ actionError }}</span>
        <button type="button" class="cursor-pointer" @click="actionError = null">✕</button>
      </div>

      <DeviceTokenNotice
        v-if="revealedToken"
        :token="revealedToken"
        :device-name="device.name"
        @dismiss="revealedToken = null"
      />

      <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,20rem)_1fr] gap-4 items-start">
        <!-- Test order -->
        <div class="border border-alt">
          <div class="px-3 py-1 border-b border-alt">// end-to-end test</div>
          <div class="p-3 flex flex-col gap-3">
            <p class="font-secondary">
              Queues a $0 staff order for this device's NaviPort. Scan the QR with the sim or a real
              Pi and watch it claim → brew → complete in the log.
            </p>
            <NaviButton
              variant="filled"
              :disabled="sendingTest || !device.navi_port"
              @click="startTestOrder"
            >
              {{ sendingTest ? 'SENDING...' : testOrder ? 'SEND ANOTHER' : 'SEND TEST ORDER' }}
            </NaviButton>
            <p v-if="!device.navi_port" class="text-red">assign a naviport to send test orders.</p>
            <p v-if="testError" role="alert" class="text-red">⚠ {{ testError }}</p>

            <template v-if="testOrder">
              <div class="flex justify-center bg-white p-3">
                <Qrcode :value="testOrder.qr_token" :size="200" :image-settings="noQrImage" />
              </div>
              <div class="flex items-center gap-2">
                <code class="flex-1 truncate font-secondary" :title="testOrder.qr_token">
                  {{ testOrder.qr_token }}
                </code>
                <button
                  type="button"
                  class="cursor-pointer text-green hover:underline"
                  @click="copyQrToken(testOrder.qr_token)"
                >
                  {{ qrTokenCopied ? 'COPIED' : 'COPY' }}
                </button>
              </div>
              <div class="font-secondary truncate">order {{ testOrder.order_id }}</div>

              <!-- Progress -->
              <ol class="flex border border-alt">
                <li
                  v-for="s in steps"
                  :key="s.type"
                  class="flex-1 px-1 py-1 text-center border-r border-alt last:border-r-0"
                  :class="reachedSteps.has(s.type) ? 'bg-green text-primary' : 'font-secondary'"
                >
                  {{ s.label }}
                </li>
              </ol>
              <p v-if="testFailed" class="text-red">⚠ brew failed — see log.</p>
              <p v-else-if="testComplete" class="text-green">✓ loop complete.</p>
              <p v-else class="font-secondary">waiting for device...</p>
            </template>
          </div>
        </div>

        <!-- Event log -->
        <div class="border border-alt min-w-0">
          <div class="px-3 py-1 border-b border-alt flex flex-wrap items-center gap-3">
            <span>// event log</span>
            <span
              class="flex items-center gap-1"
              :class="live ? 'text-green' : 'font-secondary'"
              :title="visibility === 'hidden' ? 'paused while tab is hidden' : ''"
            >
              <span :class="live && eventsFetching ? 'animate-pulse' : ''">●</span>
              {{ live ? 'LIVE · 3s' : 'PAUSED' }}
            </span>
            <label class="ml-auto flex items-center gap-1 cursor-pointer">
              <input v-model="hideHeartbeats" type="checkbox" />
              hide heartbeats
            </label>
            <button
              type="button"
              class="cursor-pointer text-green hover:underline"
              @click="manuallyPaused = !manuallyPaused"
            >
              {{ manuallyPaused ? 'RESUME' : 'PAUSE' }}
            </button>
          </div>
          <p v-if="!visibleEvents.length" class="px-3 py-6 text-center font-secondary">
            no events yet.
          </p>
          <ul v-else class="max-h-[32rem] overflow-y-auto divide-y divide-alt/40">
            <li
              v-for="e in visibleEvents"
              :key="e.id"
              class="px-3 py-1 flex gap-3"
              :class="testOrder && eventOrderId(e) === testOrder.order_id ? 'bg-secondary' : ''"
            >
              <span class="font-secondary shrink-0" :title="e.created_at">{{ eventTime(e.created_at) }}</span>
              <span class="shrink-0 w-28 uppercase" :class="eventClass[e.type] ?? ''">{{ e.type }}</span>
              <span class="min-w-0 break-words">{{ e.message }}</span>
            </li>
          </ul>
        </div>
      </div>
    </template>

    <ConfirmDialog
      :open="confirmRotateOpen"
      :title="`ROTATE TOKEN · ${device?.name ?? ''}`"
      confirm-label="ROTATE"
      danger
      @confirm="confirmRotate"
      @cancel="confirmRotateOpen = false"
    >
      The current token stops working <strong>immediately</strong>. The device will disconnect
      until it's reconfigured with the new token, which is shown once.
    </ConfirmDialog>
  </div>
</template>

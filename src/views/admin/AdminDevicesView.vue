<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { refDebounced, useNow } from '@vueuse/core'
import NaviButton from '@/components/shared/NaviButton.vue'
import ToggleSwitch from '@/components/shared/ToggleSwitch.vue'
import LoadingSpinnerTwo from '@/components/shared/LoadingSpinnerTwo.vue'
import ConfirmDialog from '@/components/admin/ConfirmDialog.vue'
import DeviceTokenNotice from '@/components/admin/DeviceTokenNotice.vue'
import {
  useCreateDevice,
  useDevices,
  useRotateDeviceToken,
  useUpdateDevice,
  type DeviceFilters,
} from '@/composables/useDevices'
import { useNaviPorts } from '@/composables/useNaviPorts'
import { devicesSource } from '@/lib/adminOpsApi'
import { getApiErrorMessage } from '@/lib/errorParser'
import { timeAgo } from '@/helpers/timeAgo'
import type { Device } from '@/types/devices'

const router = useRouter()
const now = useNow({ interval: 1000 })

// --- Filters ---
type OnlineFilter = 'all' | 'online' | 'offline'
const onlineFilter = ref<OnlineFilter>('all')
const search = ref('')
const debouncedSearch = refDebounced(search, 300)

const filters = computed<DeviceFilters>(() => ({
  is_online: onlineFilter.value === 'all' ? undefined : onlineFilter.value === 'online',
  search: debouncedSearch.value.trim() || undefined,
}))

const { data, isPending, isError, refetch } = useDevices(filters)
const devices = computed(() => data.value?.results ?? [])

const filterLabels: Record<OnlineFilter, string> = {
  all: 'ALL',
  online: 'ONLINE',
  offline: 'OFFLINE',
}

const openDevice = (d: Device) =>
  router.push({ name: 'adminDeviceDetail', params: { deviceId: d.id } })

// --- Shown-once token (after create or rotate) ---
const revealedToken = ref<{ token: string; deviceName: string } | null>(null)

// --- Add device ---
const showAddForm = ref(false)
const addForm = ref({ name: '', mac_address: '', location: '', navi_port_id: '', is_simulated: false })
const addError = ref<string | null>(null)
const { mutate: createDevice, isPending: creating } = useCreateDevice()
const { data: naviPorts } = useNaviPorts()

const resetAddForm = () => {
  addForm.value = { name: '', mac_address: '', location: '', navi_port_id: '', is_simulated: false }
  addError.value = null
}

const submitAdd = () => {
  addError.value = null
  const { navi_port_id, ...rest } = addForm.value
  createDevice(
    { ...rest, ...(navi_port_id ? { navi_port_id } : {}) },
    {
      onSuccess: (created) => {
        revealedToken.value = { token: created.device_token, deviceName: created.name }
        showAddForm.value = false
        resetAddForm()
      },
      onError: (error) => {
        addError.value = getApiErrorMessage(error)
      },
    },
  )
}

// --- Row actions ---
const actionError = ref<string | null>(null)
const { mutate: updateDevice } = useUpdateDevice()
const { mutate: rotateToken } = useRotateDeviceToken()
const busyId = ref<string | null>(null)

const setEnabled = (d: Device, enabled: boolean) => {
  actionError.value = null
  busyId.value = d.id
  updateDevice(
    { id: d.id, enabled },
    {
      onError: (error) => {
        actionError.value = `${d.name}: ${getApiErrorMessage(error)}`
      },
      onSettled: () => {
        busyId.value = null
      },
    },
  )
}

const rotateTarget = ref<Device | null>(null)

const confirmRotate = () => {
  const d = rotateTarget.value
  rotateTarget.value = null
  if (!d) return
  actionError.value = null
  busyId.value = d.id
  rotateToken(d.id, {
    onSuccess: ({ device_token }) => {
      revealedToken.value = { token: device_token, deviceName: d.name }
    },
    onError: (error) => {
      actionError.value = `${d.name}: ${getApiErrorMessage(error)}`
    },
    onSettled: () => {
      busyId.value = null
    },
  })
}
</script>

<template>
  <div class="w-full text-xs space-y-4 font-mono">
    <!-- Header -->
    <div class="border border-alt flex items-center justify-between">
      <div class="px-3 py-1 bg-green text-primary">
        // admin · devices
        <span v-if="devicesSource.kind === 'fixtures'">[fixtures]</span>
      </div>
      <button
        type="button"
        class="px-3 py-1 cursor-pointer text-green hover:underline"
        @click="showAddForm = !showAddForm"
      >
        {{ showAddForm ? '✕ CLOSE' : '▸ ADD DEVICE' }}
      </button>
    </div>

    <!-- Token shown once -->
    <DeviceTokenNotice
      v-if="revealedToken"
      :token="revealedToken.token"
      :device-name="revealedToken.deviceName"
      @dismiss="revealedToken = null"
    />

    <!-- Add device -->
    <form v-if="showAddForm" class="border border-alt" @submit.prevent="submitAdd">
      <div class="px-3 py-1 border-b border-alt">// new device</div>
      <div class="p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
        <label class="flex flex-col gap-1">
          <span>name</span>
          <input
            v-model="addForm.name"
            required
            placeholder="Lobby Pi"
            class="border border-alt bg-transparent px-2 py-1"
          />
        </label>
        <label class="flex flex-col gap-1">
          <span>mac address</span>
          <input
            v-model="addForm.mac_address"
            required
            placeholder="dc:a6:32:00:00:01"
            class="border border-alt bg-transparent px-2 py-1"
          />
        </label>
        <label class="flex flex-col gap-1">
          <span>location</span>
          <input
            v-model="addForm.location"
            placeholder="HQ lobby"
            class="border border-alt bg-transparent px-2 py-1"
          />
        </label>
        <label class="flex flex-col gap-1">
          <span>naviport (optional)</span>
          <select v-model="addForm.navi_port_id" class="border border-alt bg-primary px-2 py-1">
            <option value="">— none —</option>
            <option v-for="p in naviPorts ?? []" :key="p.id" :value="String(p.id)">
              {{ p.name }}
            </option>
          </select>
        </label>
        <label class="flex items-center gap-2 cursor-pointer md:col-span-2">
          <input v-model="addForm.is_simulated" type="checkbox" />
          <span>simulated device (docker sim, not real hardware)</span>
        </label>
      </div>
      <p v-if="addError" role="alert" class="px-3 pb-2 text-red">⚠ {{ addError }}</p>
      <div class="px-3 pb-3 flex gap-2">
        <NaviButton variant="filled" type="submit" :disabled="creating">
          {{ creating ? 'CREATING...' : 'CREATE DEVICE' }}
        </NaviButton>
        <NaviButton type="button" @click="showAddForm = false; resetAddForm()">CANCEL</NaviButton>
      </div>
    </form>

    <!-- Filter bar -->
    <div class="border border-alt flex flex-wrap items-stretch">
      <button
        v-for="(label, key) in filterLabels"
        :key="key"
        type="button"
        class="px-3 py-1 border-r border-alt cursor-pointer transition-colors"
        :class="onlineFilter === key ? 'bg-green text-primary' : 'hover:bg-green hover:text-primary'"
        @click="onlineFilter = key"
      >
        {{ label }}
      </button>
      <input
        v-model="search"
        type="search"
        placeholder="search name / mac / location"
        class="flex-1 min-w-40 bg-transparent px-3 py-1"
      />
    </div>

    <div
      v-if="actionError"
      role="alert"
      class="border border-red text-red px-3 py-2 flex justify-between gap-3"
    >
      <span>⚠ {{ actionError }}</span>
      <button type="button" class="cursor-pointer" @click="actionError = null">✕</button>
    </div>

    <div v-if="isPending" class="flex justify-center py-8"><LoadingSpinnerTwo /></div>

    <div v-else-if="isError" class="border-2 border-red">
      <div class="px-3 py-1 bg-red text-primary">⚠ ERROR</div>
      <div class="px-3 py-3 flex items-center justify-between">
        <span>failed to load devices</span>
        <button type="button" class="text-green hover:underline cursor-pointer" @click="refetch()">
          RETRY
        </button>
      </div>
    </div>

    <div v-else-if="!devices.length" class="border border-alt px-3 py-6 text-center font-secondary">
      no devices match.
    </div>

    <template v-else>
      <!-- Desktop table -->
      <div class="hidden md:block border border-alt overflow-x-auto">
        <table class="w-full">
          <thead class="font-secondary text-left border-b border-alt">
            <tr>
              <th class="px-3 py-2">device</th>
              <th class="px-3 py-2">last seen</th>
              <th class="px-3 py-2">firmware</th>
              <th class="px-3 py-2">naviport</th>
              <th class="px-3 py-2">machine</th>
              <th class="px-3 py-2">enabled</th>
              <th class="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in devices" :key="d.id" class="border-b border-alt/40 last:border-b-0">
              <td class="px-3 py-2">
                <button
                  type="button"
                  class="flex items-center gap-2 cursor-pointer hover:underline text-left"
                  @click="openDevice(d)"
                >
                  <span
                    class="inline-block w-2 h-2 rounded-full shrink-0"
                    :class="d.is_online ? 'bg-green' : 'bg-red'"
                    :title="d.is_online ? 'online' : 'offline'"
                  />
                  <span>{{ d.name }}</span>
                  <span v-if="d.is_simulated" class="border border-alt px-1">SIM</span>
                </button>
                <div class="font-secondary pl-4">{{ d.mac_address }} · {{ d.location || '—' }}</div>
              </td>
              <td class="px-3 py-2" :title="d.last_seen ?? ''">{{ timeAgo(d.last_seen, now.getTime()) }}</td>
              <td class="px-3 py-2">{{ d.firmware_version || '—' }}</td>
              <td class="px-3 py-2">{{ d.navi_port?.name ?? '—' }}</td>
              <td class="px-3 py-2">
                <template v-if="d.espresso_machine">
                  {{ d.espresso_machine.machine_type ?? d.espresso_machine.serial_number }}
                  <span :class="d.espresso_machine.is_online ? 'text-green' : 'text-red'">●</span>
                </template>
                <template v-else>—</template>
              </td>
              <td class="px-3 py-2">
                <ToggleSwitch
                  :model-value="d.enabled"
                  :disabled="busyId === d.id"
                  @update:model-value="setEnabled(d, $event)"
                />
              </td>
              <td class="px-3 py-2 text-right whitespace-nowrap">
                <button
                  type="button"
                  class="cursor-pointer text-green hover:underline mr-3"
                  :disabled="busyId === d.id"
                  @click="rotateTarget = d"
                >
                  ROTATE TOKEN
                </button>
                <button type="button" class="cursor-pointer text-green hover:underline" @click="openDevice(d)">
                  VIEW ▸
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile cards -->
      <div class="md:hidden flex flex-col gap-3">
        <div v-for="d in devices" :key="d.id" class="border border-alt">
          <button
            type="button"
            class="w-full px-3 py-2 border-b border-alt flex items-center gap-2 cursor-pointer text-left"
            @click="openDevice(d)"
          >
            <span
              class="inline-block w-2 h-2 rounded-full shrink-0"
              :class="d.is_online ? 'bg-green' : 'bg-red'"
            />
            <span class="flex-1">{{ d.name }}</span>
            <span v-if="d.is_simulated" class="border border-alt px-1">SIM</span>
            <span class="text-green">▸</span>
          </button>
          <dl class="px-3 py-2 grid grid-cols-2 gap-x-3 gap-y-1">
            <dt class="font-secondary">last seen</dt>
            <dd>{{ timeAgo(d.last_seen, now.getTime()) }}</dd>
            <dt class="font-secondary">firmware</dt>
            <dd>{{ d.firmware_version || '—' }}</dd>
            <dt class="font-secondary">naviport</dt>
            <dd>{{ d.navi_port?.name ?? '—' }}</dd>
            <dt class="font-secondary">machine</dt>
            <dd>{{ d.espresso_machine ? (d.espresso_machine.machine_type ?? d.espresso_machine.serial_number) : '—' }}</dd>
          </dl>
          <div class="px-3 py-2 border-t border-alt flex items-center justify-between">
            <ToggleSwitch
              :model-value="d.enabled"
              :disabled="busyId === d.id"
              @update:model-value="setEnabled(d, $event)"
            />
            <button type="button" class="cursor-pointer text-green hover:underline" @click="rotateTarget = d">
              ROTATE TOKEN
            </button>
          </div>
        </div>
      </div>
    </template>

    <ConfirmDialog
      :open="rotateTarget !== null"
      :title="`ROTATE TOKEN · ${rotateTarget?.name ?? ''}`"
      confirm-label="ROTATE"
      danger
      @confirm="confirmRotate"
      @cancel="rotateTarget = null"
    >
      The current token stops working <strong>immediately</strong>. The device will disconnect
      until it's reconfigured with the new token, which is shown once.
    </ConfirmDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import ToggleSwitch from '@/components/shared/ToggleSwitch.vue'
import ConfirmDialog from '@/components/admin/ConfirmDialog.vue'
import {
  useNotificationSettings,
  useUpdateNotificationSettings,
} from '@/composables/useNotificationSettings'
import { notificationsSource } from '@/lib/adminOpsApi'
import { getApiErrorMessage } from '@/lib/errorParser'
import type {
  NotificationCategory,
  NotificationChannel,
  NotificationSettingsPatch,
} from '@/types/notifications'

const { data: settings, isPending, isError, refetch } = useNotificationSettings()
const { mutate: update } = useUpdateNotificationSettings()

const channelMeta: { id: NotificationChannel; label: string; hint: string }[] = [
  { id: 'email', label: 'EMAIL', hint: 'all outbound email' },
  { id: 'sms', label: 'SMS', hint: 'all outbound text messages' },
]

const categoryMeta: { id: NotificationCategory; label: string; hint: string }[] = [
  { id: 'account', label: 'ACCOUNT', hint: 'login codes, password & security — always on' },
  { id: 'order_updates', label: 'ORDER UPDATES', hint: 'order ready / brewing / refunds' },
  { id: 'marketing', label: 'MARKETING', hint: 'promos and announcements' },
  { id: 'rewards', label: 'REWARDS', hint: 'achievements and loyalty' },
]

const LOCKED_CATEGORIES: NotificationCategory[] = ['account']

const actionError = ref<string | null>(null)
// Keys with a PATCH in flight, so a double-click can't race the rollback.
const pending = ref(new Set<string>())

const send = (key: string, patch: NotificationSettingsPatch) => {
  actionError.value = null
  pending.value.add(key)
  update(patch, {
    onError: (error) => {
      actionError.value = getApiErrorMessage(error)
    },
    onSettled: () => {
      pending.value.delete(key)
    },
  })
}

// Disabling a whole channel silences every message on it, so confirm first.
const confirmChannel = ref<NotificationChannel | null>(null)

const toggleChannel = (channel: NotificationChannel, value: boolean) => {
  if (!value) {
    confirmChannel.value = channel
    return
  }
  send(`channel:${channel}`, { channels: { [channel]: true } })
}

const confirmDisableChannel = () => {
  const channel = confirmChannel.value
  confirmChannel.value = null
  if (channel) send(`channel:${channel}`, { channels: { [channel]: false } })
}

const toggleCategory = (category: NotificationCategory, value: boolean) => {
  send(`category:${category}`, { categories: { [category]: value } })
}

const confirmChannelLabel = computed(
  () => channelMeta.find((c) => c.id === confirmChannel.value)?.label ?? '',
)

const updatedLine = computed(() => {
  if (!settings.value) return ''
  const when = new Date(settings.value.updated_at).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
  return `last changed ${when}${settings.value.updated_by ? ` by ${settings.value.updated_by}` : ''}`
})
</script>

<template>
  <section class="flex flex-col gap-6">
    <p class="font-secondary text-sm">
      global kill switches — applied above every user's own preferences. a disabled channel or
      category blocks sending and logs the skip as <code>disabled_globally</code>.
      <span v-if="notificationsSource.kind === 'fixtures'" class="text-red">[fixtures]</span>
    </p>

    <p v-if="isPending" class="font-secondary">loading...</p>

    <div v-else-if="isError || !settings" class="border-2 border-red">
      <div class="px-3 py-1 bg-red text-primary">⚠ ERROR</div>
      <div class="px-3 py-3 flex items-center justify-between gap-3">
        <span>failed to load notification settings</span>
        <button type="button" class="text-green hover:underline cursor-pointer" @click="refetch()">
          RETRY
        </button>
      </div>
    </div>

    <template v-else>
      <div
        v-if="actionError"
        role="alert"
        class="border border-red text-red px-3 py-2 flex justify-between gap-3"
      >
        <span>⚠ change reverted: {{ actionError }}</span>
        <button type="button" class="cursor-pointer" @click="actionError = null">✕</button>
      </div>

      <div class="border border-alt">
        <h2 class="px-3 py-2 border-b border-alt bg-strip tracking-wide">// CHANNELS</h2>
        <ul class="divide-y divide-alt">
          <li v-for="c in channelMeta" :key="c.id" class="p-3 flex items-center justify-between gap-4">
            <div class="min-w-0">
              <div>{{ c.label }}</div>
              <div class="font-secondary text-xs">{{ c.hint }}</div>
            </div>
            <ToggleSwitch
              :model-value="settings.channels[c.id]"
              :disabled="pending.has(`channel:${c.id}`)"
              @update:model-value="toggleChannel(c.id, $event)"
            />
          </li>
        </ul>
      </div>

      <div class="border border-alt">
        <h2 class="px-3 py-2 border-b border-alt bg-strip tracking-wide">// CATEGORIES</h2>
        <ul class="divide-y divide-alt">
          <li
            v-for="c in categoryMeta"
            :key="c.id"
            class="p-3 flex items-center justify-between gap-4"
          >
            <div class="min-w-0">
              <div>
                {{ c.label }}
                <span
                  v-if="LOCKED_CATEGORIES.includes(c.id)"
                  class="ml-1 text-xs border border-alt px-1"
                  title="security and login messages can't be disabled"
                  >LOCKED</span
                >
              </div>
              <div class="font-secondary text-xs">{{ c.hint }}</div>
            </div>
            <ToggleSwitch
              :model-value="settings.categories[c.id]"
              :disabled="LOCKED_CATEGORIES.includes(c.id) || pending.has(`category:${c.id}`)"
              @update:model-value="toggleCategory(c.id, $event)"
            />
          </li>
        </ul>
      </div>

      <p class="font-secondary text-xs">{{ updatedLine }}</p>
    </template>

    <ConfirmDialog
      :open="confirmChannel !== null"
      :title="`DISABLE ${confirmChannelLabel}?`"
      :confirm-label="`DISABLE ${confirmChannelLabel}`"
      danger
      @confirm="confirmDisableChannel"
      @cancel="confirmChannel = null"
    >
      This stops <strong>every</strong> {{ confirmChannelLabel.toLowerCase() }} message platform-wide —
      including order updates and login codes — until it's turned back on.
      <p v-if="confirmChannel === 'email'" class="mt-2 text-red">
        ⚠ Magic-link sign-in stops working: users who log in by email link (including staff)
        won't receive one. Make sure you can still sign in another way before disabling.
      </p>
    </ConfirmDialog>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ToggleSwitch from '@/components/shared/ToggleSwitch.vue'
import { useUserPreferences, useUpdateUserPreferences } from '@/composables/usePreferences'
import type {
  NotificationPrefKey,
  ThemePreference,
  UserPreferencesUpdate,
} from '@/types/preferences'

const { data: prefs, isPending, isError } = useUserPreferences()
const { mutate: updatePrefs, isPending: isSaving } = useUpdateUserPreferences()

type ToggleRow = { key: NotificationPrefKey; label: string }

const emailRows: ToggleRow[] = [
  { key: 'email_account', label: 'Account & security' },
  { key: 'email_order_updates', label: 'Order updates' },
  { key: 'email_marketing', label: 'Marketing & promotions' },
  { key: 'email_rewards', label: 'Rewards & loyalty' },
]

const smsRows: ToggleRow[] = [
  { key: 'sms_account', label: 'Account & security' },
  { key: 'sms_order_updates', label: 'Order updates' },
  { key: 'sms_marketing', label: 'Marketing & promotions' },
  { key: 'sms_rewards', label: 'Rewards & loyalty' },
]

const themeOptions: ThemePreference[] = ['system', 'light', 'dark']

const smsAvailable = computed(() => prefs.value?.sms_available ?? false)

const setPref = (patch: UserPreferencesUpdate) => updatePrefs(patch)

const setToggle = (key: NotificationPrefKey, value: boolean) =>
  setPref({ [key]: value } as UserPreferencesUpdate)
</script>

<template>
  <div class="max-w-2xl mx-auto px-3 py-4 font-mono">
    <h1 class="text-xl tracking-wide mb-1">
      <span class="text-green">▪</span> SETTINGS
    </h1>
    <p class="font-secondary text-sm mb-6">manage your preferences and notifications</p>

    <p v-if="isPending" class="font-secondary">loading preferences...</p>
    <p v-else-if="isError" class="text-red">could not load preferences. try again later.</p>

    <div v-else-if="prefs" class="flex flex-col gap-6">
      <!-- General -->
      <section class="border border-alt">
        <h2 class="px-3 py-2 border-b border-alt tracking-wide">// GENERAL</h2>
        <div class="p-3 flex flex-col gap-4">
          <label class="flex items-center justify-between gap-4">
            <span>theme</span>
            <select
              class="border border-alt bg-transparent px-2 py-1 font-mono cursor-pointer"
              :value="prefs.theme"
              @change="setPref({ theme: ($event.target as HTMLSelectElement).value as ThemePreference })"
            >
              <option v-for="opt in themeOptions" :key="opt" :value="opt">{{ opt }}</option>
            </select>
          </label>

          <label class="flex items-center justify-between gap-4">
            <span>language</span>
            <input
              class="border border-alt bg-transparent px-2 py-1 font-mono w-24"
              :value="prefs.language"
              @change="setPref({ language: ($event.target as HTMLInputElement).value })"
            />
          </label>
        </div>
      </section>

      <!-- Email notifications -->
      <section class="border border-alt">
        <h2 class="px-3 py-2 border-b border-alt tracking-wide">// EMAIL NOTIFICATIONS</h2>
        <div class="p-3 flex flex-col gap-3">
          <div
            v-for="row in emailRows"
            :key="row.key"
            class="flex items-center justify-between gap-4"
          >
            <span>{{ row.label }}</span>
            <ToggleSwitch
              :model-value="prefs[row.key]"
              :disabled="isSaving"
              @update:model-value="setToggle(row.key, $event)"
            />
          </div>
        </div>
      </section>

      <!-- SMS notifications -->
      <section class="border border-alt">
        <h2 class="px-3 py-2 border-b border-alt tracking-wide">// SMS NOTIFICATIONS</h2>
        <div v-if="smsAvailable" class="p-3 flex flex-col gap-3">
          <div
            v-for="row in smsRows"
            :key="row.key"
            class="flex items-center justify-between gap-4"
          >
            <span>{{ row.label }}</span>
            <ToggleSwitch
              :model-value="prefs[row.key]"
              :disabled="isSaving"
              @update:model-value="setToggle(row.key, $event)"
            />
          </div>
        </div>
        <p v-else class="p-3 font-secondary text-sm">
          SMS notifications aren't available yet — coming soon.
        </p>
      </section>
    </div>
  </div>
</template>

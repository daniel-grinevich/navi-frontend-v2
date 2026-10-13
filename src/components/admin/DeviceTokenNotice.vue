<script setup lang="ts">
import { ref } from 'vue'
import { useClipboard } from '@vueuse/core'
import NaviButton from '@/components/shared/NaviButton.vue'

// The plaintext device token is only returned once (create / rotate), so this
// panel is the user's only chance to copy it.
defineProps<{ token: string; deviceName: string }>()
const emit = defineEmits<{ (e: 'dismiss'): void }>()

const { copy, copied, isSupported } = useClipboard({ copiedDuring: 2000 })
const acknowledged = ref(false)
</script>

<template>
  <div class="border-2 border-red font-mono text-sm">
    <div class="px-3 py-1 bg-red text-primary">⚠ DEVICE TOKEN · {{ deviceName }}</div>
    <div class="p-3 flex flex-col gap-3">
      <p>
        This token is shown <strong>once</strong>. Copy it into the device config now — it can't be
        retrieved later. If it's lost, rotate the token.
      </p>
      <div class="flex items-stretch border border-alt">
        <code class="flex-1 px-2 py-2 break-all select-all" data-testid="device-token">{{ token }}</code>
        <button
          v-if="isSupported"
          type="button"
          class="px-3 border-l border-alt cursor-pointer hover:bg-green hover:text-primary transition-colors"
          @click="copy(token)"
        >
          {{ copied ? 'COPIED' : 'COPY' }}
        </button>
      </div>
      <label class="flex items-center gap-2 cursor-pointer">
        <input v-model="acknowledged" type="checkbox" />
        <span>I've saved the token somewhere safe</span>
      </label>
      <div>
        <NaviButton variant="filled" :disabled="!acknowledged" @click="emit('dismiss')">DONE</NaviButton>
      </div>
    </div>
  </div>
</template>

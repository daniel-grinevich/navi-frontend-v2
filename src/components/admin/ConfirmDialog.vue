<script setup lang="ts">
import { onKeyStroke } from '@vueuse/core'
import NaviButton from '@/components/shared/NaviButton.vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    confirmLabel?: string
    danger?: boolean
  }>(),
  { confirmLabel: 'CONFIRM', danger: false },
)

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

onKeyStroke('Escape', () => {
  if (props.open) emit('cancel')
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      @click.self="emit('cancel')"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        class="w-full max-w-md border bg-primary font-mono text-sm"
        :class="danger ? 'border-red' : 'border-alt'"
      >
        <div
          class="px-3 py-1"
          :class="danger ? 'bg-red text-primary' : 'border-b border-alt'"
        >
          {{ danger ? '⚠ ' : '// ' }}{{ title }}
        </div>
        <div class="px-3 py-4">
          <slot />
        </div>
        <div class="px-3 pb-3 flex justify-end gap-2">
          <NaviButton @click="emit('cancel')">CANCEL</NaviButton>
          <NaviButton variant="filled" @click="emit('confirm')">{{ confirmLabel }}</NaviButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>

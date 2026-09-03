<script setup lang="ts">
defineProps<{
  modelValue: boolean
  disabled?: boolean
}>()

defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    class="inline-flex items-center gap-2 font-mono text-sm border border-alt px-2 py-1 cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
    :class="
      modelValue
        ? 'bg-green text-primary border-green'
        : 'bg-transparent hover:bg-green hover:text-primary'
    "
    :aria-pressed="modelValue"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <span>{{ modelValue ? '[x]' : '[ ]' }}</span>
    <span>{{ modelValue ? 'ON' : 'OFF' }}</span>
  </button>
</template>

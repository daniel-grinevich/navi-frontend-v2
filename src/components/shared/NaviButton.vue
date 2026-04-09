<script setup lang="ts">
defineProps<{
  variant?: 'outline' | 'filled'
  disabled?: boolean
  fullWidth?: boolean
}>()
</script>

<template>
  <button
    :disabled="disabled"
    class="navi-btn group px-3 py-2 border cursor-pointer font-mono tracking-wide transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
    :class="[
      fullWidth ? 'w-full' : '',
      variant === 'filled'
        ? 'bg-green text-primary border-green hover:bg-alt hover:text-primary hover:border-alt'
        : 'border-alt hover:bg-green hover:text-primary',
    ]"
  >
    <span :class="variant === 'filled' ? '' : 'text-green group-hover:text-primary'">▸</span>
    <slot />
  </button>
</template>

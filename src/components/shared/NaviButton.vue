<script setup lang="ts">
import { vPixelFill } from '@/directives/pixelFill'

defineProps<{
  variant?: 'outline' | 'filled' | 'ghost'
  disabled?: boolean
  fullWidth?: boolean
}>()
</script>

<template>
  <button
    v-pixel-fill="variant !== 'ghost'"
    :disabled="disabled"
    class="navi-btn group px-3 py-2 border cursor-pointer font-mono tracking-wide transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
    :class="[
      fullWidth ? 'w-full' : '',
      variant === 'filled'
        ? 'bg-primary text-alt border-alt'
        : variant === 'ghost'
          ? 'bg-primary text-alt border-alt'
          : 'border-alt',
    ]"
  >
    <span :class="variant === 'filled' || variant === 'ghost' ? '' : 'text-green'">▸</span>
    <slot />
  </button>
</template>

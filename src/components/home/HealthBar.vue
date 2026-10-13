<script setup lang="ts">
import { computed } from 'vue'
import PixelHeart from './PixelHeart.vue'
import { badgeProgress } from '@/composables/useAchievements'
import type { AchievementProgress } from '@/types/achievements'

const props = defineProps<{ next: AchievementProgress | null }>()

const HEART_SLOTS = 10

const progress = computed(() => (props.next ? badgeProgress(props.next) : null))

// One heart per step for small targets; otherwise ten hearts, each a tenth.
const hearts = computed(() => {
  if (!progress.value) return []
  const { current, target, fraction } = progress.value
  if (target <= HEART_SLOTS) return Array.from({ length: target }, (_, i) => i < current)
  const lit = Math.floor(fraction * HEART_SLOTS)
  return Array.from({ length: HEART_SLOTS }, (_, i) => i < lit)
})
</script>

<template>
  <div class="px-3 py-3">
    <div v-if="next && progress" class="space-y-2">
      <div class="flex items-baseline gap-2 font-secondary">
        <span class="text-green" aria-hidden="true">▸</span>
        <span class="text-alt">NEXT: {{ next.name }}</span>
        <span class="ml-auto font-mono">{{ progress.current }}/{{ progress.target }}</span>
      </div>
      <div class="font-secondary pl-4">{{ next.description }}</div>
      <div class="flex flex-wrap items-center gap-1 pl-4 text-red" aria-hidden="true">
        <PixelHeart v-for="(filled, i) in hearts" :key="i" :filled="filled" :size="18" />
      </div>
    </div>

    <div v-else class="text-center py-2 text-green tracking-[0.2em] blink">
      ★ ALL UNLOCKED ★
    </div>
  </div>
</template>

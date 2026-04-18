<script setup lang="ts">
import { computed } from 'vue'
import { useAchievementsStore } from '@/stores/achievements'
import PixelHeart from './PixelHeart.vue'

const achievements = useAchievementsStore()

const next = computed(() => achievements.nextAchievement)
const progress = computed(() => achievements.nextProgress)

const hearts = computed(() => {
  if (!progress.value) return []
  const { current, target } = progress.value
  return Array.from({ length: target }, (_, i) => i < current)
})
</script>

<template>
  <div class="px-3 py-3">
    <div v-if="next && progress" class="space-y-2">
      <div class="flex items-baseline gap-2 font-secondary">
        <span class="text-green">▸</span>
        <span class="tracking-wide text-alt">NEXT: {{ next.label }}</span>
        <span class="ml-auto font-mono">{{ progress.current }}/{{ progress.target }}</span>
      </div>
      <div class="text-xs font-secondary pl-4">{{ next.desc }}</div>
      <div class="flex flex-wrap items-center gap-1 pl-4 text-red">
        <PixelHeart v-for="(filled, i) in hearts" :key="i" :filled="filled" :size="18" />
      </div>
    </div>

    <div v-else class="text-center py-2 text-green tracking-[0.2em] blink">
      ★ ALL UNLOCKED ★
    </div>
  </div>
</template>

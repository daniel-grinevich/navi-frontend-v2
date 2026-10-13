<script setup lang="ts">
import { computed } from 'vue'
import type { AchievementProgress } from '@/types/achievements'

// B S G ladder for tiered badges (earned letters lit green), or an
// [EARNED] / [LOCKED] tag for one-level badges.
const props = defineProps<{ badge: AchievementProgress }>()

const current = computed(() => props.badge.levels.find((l) => l.level === props.badge.level))
const srText = computed(() =>
  props.badge.level === 0
    ? 'locked'
    : `${current.value?.name ?? `level ${props.badge.level}`}, level ${props.badge.level} of ${props.badge.max_level}`,
)
</script>

<template>
  <span class="whitespace-nowrap">
    <span class="sr-only">{{ srText }}</span>
    <span v-if="badge.max_level > 1" aria-hidden="true">
      <span
        v-for="l in badge.levels"
        :key="l.level"
        class="ml-1 first:ml-0"
        :class="l.level <= badge.level ? 'text-green' : 'font-secondary'"
        >{{ l.name.charAt(0) }}</span
      >
    </span>
    <span v-else aria-hidden="true" :class="badge.level > 0 ? 'text-green' : 'font-secondary'">
      {{ badge.level > 0 ? '[EARNED]' : '[LOCKED]' }}
    </span>
  </span>
</template>

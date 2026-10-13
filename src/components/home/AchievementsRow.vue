<script setup lang="ts">
import PixelIcon from './PixelIcon.vue'
import BadgeLevel from './BadgeLevel.vue'
import TuiBar from '@/components/shared/TuiBar.vue'
import { badgeProgress, badgeSprite, isEarned } from '@/composables/useAchievements'
import type { AchievementProgress } from '@/types/achievements'

defineProps<{ badges: AchievementProgress[] }>()
</script>

<template>
  <ul class="badge-list border-t border-alt px-3 py-3 space-y-3">
    <li v-for="b in badges" :key="b.id" class="badge-row" :title="b.description">
      <PixelIcon
        class="badge-icon"
        :name="badgeSprite(b.icon)"
        :locked="!isEarned(b)"
        :size="20"
        :class="isEarned(b) ? 'text-green' : 'text-alt'"
      />
      <span
        class="badge-name tracking-wide truncate"
        :class="isEarned(b) ? 'text-alt' : 'font-secondary'"
        >{{ b.name.toUpperCase() }}</span
      >
      <TuiBar
        class="badge-bar"
        empty="·"
        :value="badgeProgress(b).current"
        :max="badgeProgress(b).target"
        :label="`${b.name} progress`"
        :value-text="`${badgeProgress(b).current} of ${badgeProgress(b).target} ${b.unit}`"
      />
      <span class="badge-count font-secondary text-right" aria-hidden="true"
        >{{ badgeProgress(b).current }}/{{ badgeProgress(b).target }}</span
      >
      <BadgeLevel class="badge-level text-right" :badge="b" />
    </li>
  </ul>
</template>

<style scoped>
/* Two lines when narrow (icon name level / bar count), one line when the
   section has room. Container query: the section is half-width from md up. */
.badge-list {
  container-type: inline-size;
}
.badge-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) 8ch;
  grid-template-areas:
    'icon name level'
    '.    bar  count';
  column-gap: 0.75rem;
  row-gap: 0.375rem;
  align-items: center;
}
.badge-icon {
  grid-area: icon;
}
.badge-name {
  grid-area: name;
}
.badge-bar {
  grid-area: bar;
}
.badge-count {
  grid-area: count;
  min-width: 5ch;
}
.badge-level {
  grid-area: level;
}

@container (min-width: 34rem) {
  .badge-row {
    grid-template-columns: auto 16ch minmax(0, 1fr) auto 8ch;
    grid-template-areas: 'icon name bar count level';
  }
}
</style>

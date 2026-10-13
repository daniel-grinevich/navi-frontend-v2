<script setup lang="ts">
import { computed } from 'vue'
import BadgeLevel from './BadgeLevel.vue'
import TuiBar from '@/components/shared/TuiBar.vue'
import TuiPanel from '@/components/shared/TuiPanel.vue'
import { badgeProgress, isEarned } from '@/composables/useAchievements'
import type { AchievementProgress, AchievementSummary } from '@/types/achievements'

const props = defineProps<{
  summary: AchievementSummary
  badges: AchievementProgress[]
  isGuest: boolean
}>()

// Points earned inside the current tier, out of the span to the next one.
const tierSpan = computed(() => {
  const { points, tier, next_tier } = props.summary
  if (!next_tier) return null
  const span = next_tier.min_points - tier.min_points
  const into = Math.min(Math.max(points - tier.min_points, 0), span)
  return {
    into,
    span,
    percent: span > 0 ? Math.round((into / span) * 100) : 100,
    toGo: Math.max(next_tier.min_points - points, 0),
  }
})
</script>

<template>
  <div class="px-3 pb-3 pt-1 space-y-2">
    <TuiPanel title="LOYALTY">
      <p v-if="isGuest" class="font-secondary">
        <router-link to="/signup" class="text-green hover:underline">▸ sign up</router-link>
        to start earning points.
      </p>
      <template v-else>
        <p class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span class="tracking-wide">
            <span class="font-secondary">TIER</span>
            <span class="text-green ml-2">{{ summary.tier.name.toUpperCase() }}</span>
          </span>
          <span>{{ summary.points }} pts</span>
          <span v-if="summary.next_tier" class="font-secondary">
            <span aria-hidden="true">▶ </span>{{ summary.next_tier.name.toUpperCase() }} @
            {{ summary.next_tier.min_points }}
          </span>
          <span v-else class="text-green">TOP TIER</span>
        </p>
        <div v-if="tierSpan" class="mt-2 flex items-center gap-3">
          <TuiBar
            class="flex-1"
            :value="tierSpan.into"
            :max="tierSpan.span"
            :label="`Progress to ${summary.next_tier?.name}`"
            :value-text="`${tierSpan.toGo} points to go`"
          />
          <span class="whitespace-nowrap" aria-hidden="true">
            {{ tierSpan.percent }}%
            <span class="font-secondary ml-1">{{ tierSpan.toGo }} to go</span>
          </span>
        </div>
      </template>
    </TuiPanel>

    <TuiPanel :title="`BADGES ${summary.badges_earned}/${summary.badges_total}`">
      <ul class="space-y-2">
        <li v-for="b in badges" :key="b.id" class="panel-row" :title="b.description">
          <span class="truncate tracking-wide" :class="isEarned(b) ? 'text-alt' : 'font-secondary'">{{
            b.name.toUpperCase()
          }}</span>
          <TuiBar
            empty="·"
            :value="badgeProgress(b).current"
            :max="badgeProgress(b).target"
            :label="`${b.name} progress`"
            :value-text="`${badgeProgress(b).current} of ${badgeProgress(b).target} ${b.unit}`"
          />
          <BadgeLevel class="text-right" :badge="b" />
        </li>
      </ul>
    </TuiPanel>
  </div>
</template>

<style scoped>
.panel-row {
  display: grid;
  grid-template-columns: minmax(0, 15ch) minmax(0, 1fr) 8ch;
  column-gap: 0.75rem;
  align-items: center;
}
</style>

<script setup lang="ts">
import HealthBar from './HealthBar.vue'
import AchievementsRow from './AchievementsRow.vue'
import { useAchievementProgress } from '@/composables/useAchievements'

const { summary, badges, nextBadge, isPending, isFixture } = useAchievementProgress()
</script>

<template>
  <div v-if="summary" class="pb-1">
    <HealthBar :next="nextBadge" />
    <AchievementsRow :badges="badges" />
    <p v-if="isFixture" class="px-3 pb-2 font-secondary">// sample data: progress API unreachable</p>
  </div>
  <div v-else-if="isPending" class="px-3 py-3 font-secondary">
    loading<span class="blink" aria-hidden="true">_</span>
  </div>
  <div v-else class="px-3 py-3 font-secondary">// achievements unavailable right now</div>
</template>

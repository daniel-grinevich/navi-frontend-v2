<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import HealthBar from './HealthBar.vue'
import AchievementsRow from './AchievementsRow.vue'
import AchievementsPanel from './AchievementsPanel.vue'
import { useAchievementProgress } from '@/composables/useAchievements'

// Two candidate layouts while the design is being chosen: ?ach=a (default)
// keeps NEXT + hearts over TUI badge rows; ?ach=b is the btop-style panel.
const route = useRoute()
const variant = computed(() => (route.query.ach === 'b' ? 'b' : 'a'))

const { summary, badges, nextBadge, isGuest, isPending, isFixture } = useAchievementProgress()
</script>

<template>
  <div v-if="summary" class="look-surface pb-1">
    <template v-if="variant === 'a'">
      <HealthBar :next="nextBadge" />
      <AchievementsRow :badges="badges" />
    </template>
    <AchievementsPanel v-else :summary="summary" :badges="badges" :is-guest="isGuest" />
    <p v-if="isFixture" class="px-3 pb-2 font-secondary">// sample data: progress API unreachable</p>
  </div>
  <div v-else-if="isPending" class="px-3 py-3 font-secondary">
    loading<span class="blink" aria-hidden="true">_</span>
  </div>
  <div v-else class="px-3 py-3 font-secondary">// achievements unavailable right now</div>
</template>

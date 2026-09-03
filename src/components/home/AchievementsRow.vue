<script setup lang="ts">
import { useAchievementsStore } from '@/stores/achievements'
import PixelIcon from './PixelIcon.vue'

const achievements = useAchievementsStore()
</script>

<template>
  <div class="border-t border-alt">
    <div class="px-3 py-3 flex flex-wrap gap-4 justify-around">
      <div
        v-for="a in achievements.list"
        :key="a.id"
        class="flex flex-col items-center gap-1 w-16"
        :title="a.desc"
      >
        <PixelIcon
          :name="a.icon"
          :locked="!achievements.unlocked.has(a.id)"
          :size="28"
          :class="achievements.unlocked.has(a.id) ? 'text-green' : 'text-alt'"
        />
        <div
          class="text-[10px] text-center leading-tight tracking-wide"
          :class="achievements.unlocked.has(a.id) ? 'text-green' : 'font-secondary'"
        >
          {{ a.label }}
        </div>
      </div>
    </div>
  </div>
</template>

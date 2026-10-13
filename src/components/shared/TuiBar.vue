<script setup lang="ts">
import { computed, ref } from 'vue'
import { useElementSize } from '@vueuse/core'
import { blockBarParts } from '@/lib/tuiBar'

// A [█████▌░░░░] bar that fills whatever width its container gives it, so it
// never forces horizontal scroll. Screen readers get the meter, not the glyphs.
const props = withDefaults(
  defineProps<{
    value: number
    max: number
    label: string
    // Read out instead of the raw numbers, e.g. "27 of 40 customizations".
    valueText?: string
    empty?: string
    // Used before the container has been measured (and in SSR-less first paint).
    minCols?: number
  }>(),
  { empty: '░', minCols: 6, valueText: undefined },
)

const track = ref<HTMLElement | null>(null)
const probe = ref<HTMLElement | null>(null)
const { width: trackWidth } = useElementSize(track)
const { width: probeWidth } = useElementSize(probe)

// The probe is 10ch wide, so one cell is a tenth of it. Each glyph is drawn
// in its own 1ch box: block elements can come from a fallback font with a
// different advance, which would otherwise make bars uneven.
const cols = computed(() => {
  const cell = probeWidth.value / 10
  if (!cell || !trackWidth.value) return props.minCols
  return Math.max(props.minCols, Math.floor(trackWidth.value / cell))
})

const fraction = computed(() => (props.max > 0 ? props.value / props.max : 0))
const bar = computed(() => {
  const { filled, empty } = blockBarParts(fraction.value, cols.value, props.empty)
  return { filled: Array.from(filled), empty: Array.from(empty) }
})
</script>

<template>
  <span
    class="flex min-w-0 items-center whitespace-pre leading-none"
    role="meter"
    :aria-label="label"
    :aria-valuemin="0"
    :aria-valuemax="max"
    :aria-valuenow="Math.min(value, max)"
    :aria-valuetext="valueText"
  >
    <span aria-hidden="true">[</span>
    <span ref="track" class="relative min-w-0 flex-1 overflow-hidden" aria-hidden="true">
      <span ref="probe" class="invisible absolute w-[10ch]"></span>
      <span v-for="(c, i) in bar.filled" :key="`f${i}`" class="cell text-green">{{ c }}</span
      ><span v-for="(c, i) in bar.empty" :key="`e${i}`" class="cell font-secondary">{{
        c
      }}</span>
    </span>
    <span aria-hidden="true">]</span>
  </span>
</template>

<style scoped>
.cell {
  display: inline-block;
  width: 1ch;
  text-align: center;
  overflow: visible;
}
</style>

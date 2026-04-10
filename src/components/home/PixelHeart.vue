<script setup lang="ts">
withDefaults(
  defineProps<{
    filled: boolean
    size?: number
  }>(),
  { size: 16 },
)

// Classic 9x8 pixel heart. 1 = lit pixel.
// prettier-ignore
const HEART: number[][] = [
  [0, 1, 1, 0, 0, 0, 1, 1, 0],
  [1, 1, 1, 1, 0, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 1, 0, 0, 0, 0],
]

const pixels = HEART.flatMap((row, y) =>
  row.map((v, x) => ({ x, y, on: v === 1 })).filter((p) => p.on),
)
</script>

<template>
  <svg
    :width="size"
    :height="Math.round((size * 8) / 9)"
    viewBox="0 0 9 8"
    shape-rendering="crispEdges"
    :style="{ opacity: filled ? 1 : 0.2 }"
    aria-hidden="true"
  >
    <rect
      v-for="(p, i) in pixels"
      :key="i"
      :x="p.x"
      :y="p.y"
      width="1"
      height="1"
      fill="currentColor"
    />
  </svg>
</template>

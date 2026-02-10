<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
const characters = ['\u283E', '\u283D', '\u2837', '\u282F', '\u281F', '\u283B']

const interval = ref(0)
const index = ref(0)
const brail = ref(characters[index.value])

onMounted(() => {
  interval.value = setInterval(() => {
    index.value++
  }, 300)
})

onUnmounted(() => {
  clearInterval(interval.value)
})

watch(index, (newIndex) => {
  brail.value = characters[newIndex % characters.length]
})
</script>
<template>
  {{ brail }}
</template>

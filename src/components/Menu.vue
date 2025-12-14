<script setup lang="ts">
import { useMenu } from '@/composables/useMenu'

const { state, isLoading } = useMenu()
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else>{{ state }}</div>
</template>

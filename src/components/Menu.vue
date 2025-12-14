<script setup lang="ts">
import { useMenu } from '@/composables/useMenu'

const { isPending, data, isError } = useMenu()
</script>

<template>
  <div v-if="isPending">Loading...</div>
  <div v-else-if="isError">Error...</div>
  <div v-else>
    {{ data }}
  </div>
</template>

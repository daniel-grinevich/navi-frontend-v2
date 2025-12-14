<script setup lang="ts">
defineProps<{
  msg: string
}>()

const testRequest = () => {
  const response = fetch(`http://localhost:8000/health/`, {
    method: 'GET',
  })

  console.log(response)
}
</script>

<template>
  <div>
    <button @click="testRequest">Backend Request</button>
  </div>
</template>

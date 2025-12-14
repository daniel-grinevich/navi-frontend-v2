<script setup lang="ts">
defineProps<{
  msg: string
}>()

const testRequest = async () => {
  const response = await fetch(`http://localhost:8000/api/menu-items`, {
    headers: {
      'content-type': 'JSON',
    },
    method: 'GET',
  })

  const data = await response.json()
  console.log(data)
}
</script>

<template>
  <div>
    <button @click="testRequest">Backend Request</button>
  </div>
</template>

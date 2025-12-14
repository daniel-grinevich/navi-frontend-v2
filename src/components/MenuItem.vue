<script setup lang="ts">
/*** libraries ****/
/*** components ****/
/*** stores ***/
/*** composables ****/
/*** types ****/

const props = withDefaults(
  defineProps<{
    title: string
    description?: string
    price: number
    img: string
  }>(),
  {
    title: '',
    description: '',
    price: 0,
    img: '',
  },
)
</script>
<template></template>

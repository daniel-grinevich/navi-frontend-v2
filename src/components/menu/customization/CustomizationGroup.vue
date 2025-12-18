<script setup lang="ts">
/*** libraries ****/
/*** components ****/
/*** stores ***/
/*** composables ****/
/*** types ****/
import AsyncList from '@/components/shared/AsyncList.vue'
const props = withDefaults(
  defineProps<{
    customizationGroup: {}
  }>(),
  {
    customizationGroup: {},
  },
)
const customizations=props.customizationGroup.customizations
console.log(customizations)

const onCustomizationClick = () => {
  pass
}
console.log(customizations)
</script>

<template>
    {{props.customizationGroup.name}}
  <AsyncList :items="customizations" :loading="false" :error="false" :flex-direction="row">
    <template #item="item">
      {{ item.name }}
    </template>
  </AsyncList>
</template>

<script setup lang="ts">
/*** libraries ****/
/*** components ****/
/*** stores ***/
/*** composables ****/
/*** types ****/
import { ref } from 'vue';
import AsyncList from '@/components/shared/AsyncList.vue'
import type { CustomizationGroup, Category } from '@/composables/useMenuItem';

const props = withDefaults(
  defineProps<{
    customizationGroup: CustomizationGroup
  }>(),
  {
    customizationGroup:() => ({
    name: '',
    category: {id:'',name:'',customization_groups:[]},
    description: '',
    display_order: '',
    is_required: '',
    created_at: '',
    created_by: '',
    updated_at: '',
    updated_by: '',
    slug: '',
    customizations: [],}
  )}
)
const customizations=props.customizationGroup.customizations
const customization = ref({customizationGroup:props.customizationGroup.slug,customizations:[]})

const handleCustomizationClick = (id:string) => {
  console.log(id)
}
console.log(customizations)
</script>

<template>
    {{props.customizationGroup.name}}
  <AsyncList :items="customizations" :loading="false" :error="false" :flex-direction="'row'">
    <template #item="item">
      <button @click="handleCustomizationClick(item.slug)"> {{item.name}}</button>
    </template>
  </AsyncList>
</template>

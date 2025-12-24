<script setup lang="ts">
import { reactive } from 'vue'
import { type CustomizationGroup } from '@/types/customization'

const props = defineProps<{
  group: CustomizationGroup
}>()

const emit = defineEmits<{
  'update-customization': [groupId: number, customizationId: number, action: string]
}>()

const selectedCustomizations = reactive(new Set<number>())

const handleCustomizationClick = (customizationId: number) => {
  if (selectedCustomizations.has(customizationId)) {
    selectedCustomizations.delete(customizationId)
    emit('update-customization', props.group.id, customizationId, 'remove')
  } else {
    selectedCustomizations.add(customizationId)
    emit('update-customization', props.group.id, customizationId, 'add')
  }
}

const isSelected = (optionId: number) => selectedCustomizations.has(optionId)
</script>

<template>
  <div class="border rounded-lg p-4 mb-4">
    <div class="flex justify-between items-start mb-3">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">
          {{ group.name }}
        </h3>
      </div>
      <div class="flex flex-row items-end">
        <span class="text-xs">
          <span v-if="group.is_required" class="text-sm">*</span>
          {{ group.is_required ? 'Required' : 'Optional' }}
        </span>
        <span v-if="group.max_selections > 1" class="text-xs">
          Choose {{ group.min_selections }}-{{ group.max_selections }}
        </span>
      </div>
    </div>

    <div class="flex flex-row flex-wrap gap-3">
      <div v-for="option in group.customizations" :key="option.id">
        <button
          class="p-3 border cursor-pointer"
          :class="isSelected(option.id) && 'text-primary bg-alt'"
          type="button"
          @click="handleCustomizationClick(option.id)"
        >
          {{ option.name }}
        </button>
      </div>
    </div>
  </div>
</template>

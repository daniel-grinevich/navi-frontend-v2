<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { CustomizationGroup, SelectedCustomization } from '@/types/customization'

const props = defineProps<{
  group: CustomizationGroup
  preSelectedCustomizations?: Map<string, SelectedCustomization[]>
}>()

const emit = defineEmits<{
  'update-customization': [groupId: string, customizationId: string, action: string]
}>()

const selectedCustomizations = reactive(new Set<string>())

watch(
  () => props.preSelectedCustomizations,
  (map) => {
    if (!props.preSelectedCustomizations || !map) {
      return null
    }
    selectedCustomizations.clear()

    const groupSelections = map.get(props.group.id) || []

    groupSelections.forEach((c) => {
      selectedCustomizations.add(c.optionId)
    })
  },
  { immediate: true, deep: true },
)

const handleCustomizationClick = (customizationId: string) => {
  if (selectedCustomizations.has(customizationId)) {
    selectedCustomizations.delete(customizationId)
    emit('update-customization', props.group.id, customizationId, 'remove')
  } else {
    selectedCustomizations.add(customizationId)
    emit('update-customization', props.group.id, customizationId, 'add')
  }
}

const isSelected = (optionId: string) => selectedCustomizations.has(optionId)
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
        <span v-if="group.min_allowed" class="text-xs">
          Choose {{ group.min_allowed }}-{{ group.max_allowed }}
        </span>
      </div>
    </div>

    <div class="flex flex-row flex-wrap gap-3">
      <div v-for="option in group.customizations" :key="option.id">
        <button
          class="p-3 border cursor-pointer"
          :class="[
            isSelected(option.id)
              ? 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white'
              : 'bg-transparent',
          ]"
          type="button"
          @click="handleCustomizationClick(option.id)"
        >
          {{ option.name }}
        </button>
      </div>
    </div>
  </div>
</template>

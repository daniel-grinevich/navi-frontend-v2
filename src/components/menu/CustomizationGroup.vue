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
    if (!props.group.allow_multiple) {
      // Single-select: clear previous selection first
      selectedCustomizations.forEach((id) => {
        emit('update-customization', props.group.id, id, 'remove')
      })
      selectedCustomizations.clear()
    } else if (props.group.max_allowed && selectedCustomizations.size >= props.group.max_allowed) {
      return
    }
    selectedCustomizations.add(customizationId)
    emit('update-customization', props.group.id, customizationId, 'add')
  }
}

const isSelected = (optionId: string) => selectedCustomizations.has(optionId)
</script>

<template>
  <div>
    <div class="px-3 py-2 flex items-center justify-between gap-2">
      <span class="font-primary tracking-wide text-sm font-bold">{{ group.name }}</span>
      <span class="font-primary font-mono">
        <span v-if="group.is_required" class="text-green">*</span>
        {{ group.is_required ? 'required' : 'optional' }}
        <span class="ml-1">
          {{ group.allow_multiple ? `(${selectedCustomizations.size}/${group.max_allowed})` : `(pick 1)` }}
        </span>
      </span>
    </div>
    <div class="px-3 pb-3 flex flex-row flex-wrap gap-2">
      <button
        v-for="option in group.customizations"
        :key="option.id"
        class="px-3 py-1 border border-alt cursor-pointer transition-colors"
        :class="[
          isSelected(option.id) ? 'bg-green text-white' : 'font-primary hover:bg-green hover:text-white',
        ]"
        type="button"
        @click="handleCustomizationClick(option.id)"
      >
        {{ option.name }}
      </button>
    </div>
  </div>
</template>

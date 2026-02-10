<script setup lang="ts">
import { reactive } from 'vue'
import { type CustomizationGroup } from '@/types/customization'

const props = defineProps<{
  group: CustomizationGroup
}>()

const emit = defineEmits<{
  'update-customization': [groupId: string, customizationId: string, action: string]
}>()

const selectedCustomizations = reactive(new Set<string>())

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
  <div>
    <div class="px-3 py-2 flex items-center justify-between gap-2">
      <span class="font-secondary tracking-wide">{{ group.name }}</span>
      <span class="font-secondary text-alt font-mono">
        <span v-if="group.is_required" class="text-green">*</span>
        {{ group.is_required ? 'required' : 'optional' }}
        <span v-if="group.min_allowed" class="ml-1"
          >({{ group.min_allowed }}-{{ group.max_allowed }})</span
        >
      </span>
    </div>
    <div class="px-3 pb-3 flex flex-row flex-wrap gap-2">
      <button
        v-for="option in group.customizations"
        :key="option.id"
        class="px-3 py-1 border border-alt cursor-pointer font-secondary transition-colors"
        :class="[
          isSelected(option.id) ? 'bg-green text-primary' : 'hover:bg-green hover:text-primary',
        ]"
        type="button"
        @click="handleCustomizationClick(option.id)"
      >
        {{ option.name }}
      </button>
    </div>
  </div>
</template>

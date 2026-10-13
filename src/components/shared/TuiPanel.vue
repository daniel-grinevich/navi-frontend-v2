<script setup lang="ts">
// A btop-style box: a bordered panel whose title sits in the top border.
defineProps<{ title: string }>()
</script>

<template>
  <section class="relative border border-alt mt-3 px-3 pt-4 pb-3">
    <h3 class="absolute -top-[0.75em] left-2 bg-primary px-1 leading-normal tracking-wide">
      <span aria-hidden="true" class="font-secondary">┤ </span>{{ title
      }}<span aria-hidden="true" class="font-secondary"> ├</span>
    </h3>
    <slot />
  </section>
</template>

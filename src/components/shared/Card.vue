<script setup lang="ts"></script>
<template>
  <div class="border p-3 rounded-lg shadow">
    <div class="font-bold text-lg mb-2 border-b pb-2">
      <slot name="header"></slot>
    </div>
    <div class="my-3">
      <slot name="body"></slot>
    </div>
    <div class="text-sm text-gray-600 mt-2 pt-2 border-t">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

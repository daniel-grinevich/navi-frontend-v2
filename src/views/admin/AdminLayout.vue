<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const tabs = [
  { label: 'ORDERS', to: { name: 'adminOrders' }, match: ['adminOrders', 'adminOrderDetail'] },
  { label: 'NEW ORDER', to: { name: 'adminCreateOrder' }, match: ['adminCreateOrder'] },
  { label: 'NOTIFICATIONS', to: { name: 'adminNotifications' }, match: ['adminNotifications'] },
]

const isActive = (match: string[]) => match.includes(route.name as string)
</script>

<template>
  <div class="w-full space-y-4">
    <nav class="border border-alt flex flex-wrap text-xs">
      <RouterLink
        v-for="tab in tabs"
        :key="tab.label"
        :to="tab.to"
        :class="[
          'no-underline px-3 py-2 border-r border-alt font-mono tracking-wide transition-colors',
          isActive(tab.match) ? 'bg-green text-primary' : 'hover:bg-green hover:text-primary',
        ]"
      >
        {{ tab.label }}
      </RouterLink>
    </nav>

    <RouterView />
  </div>
</template>

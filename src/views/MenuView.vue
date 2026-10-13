<script setup lang="ts">
import Menu from '@/components/menu/Menu.vue'
import { useShoppingCart } from '@/stores/shoppingCart'

const cart = useShoppingCart()
</script>

<template>
  <div class="w-full text-xs space-y-3">
    <div
      v-if="cart.activeNaviPortInfo"
      class="border border-alt px-3 py-2 flex items-center justify-between gap-3"
    >
      <span class="font-mono truncate">
        <span class="text-green">◆</span> ordering at {{ cart.activeNaviPortInfo.name }}
      </span>
      <RouterLink
        :to="{ name: 'findNavi' }"
        class="font-mono text-green hover:text-green/70 shrink-0"
      >
        [change]
      </RouterLink>
    </div>
    <Menu />
  </div>
</template>

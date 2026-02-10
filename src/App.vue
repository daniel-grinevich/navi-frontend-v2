<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import NavMenu from '@/components/shared/NavMenu.vue'
import { useSessionStore } from '@/stores/session'

const sessionStore = useSessionStore()

onMounted(() => {
  sessionStore.initAuth()
})
</script>

<template>
  <body>
    <div>
      <NavMenu />
    </div>
    <div class="py-3">
      <RouterView />
    </div>
  </body>
</template>

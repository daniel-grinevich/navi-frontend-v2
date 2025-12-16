<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import NavMenu from '@/components/shared/NavMenu.vue'
import { useSessionStore } from '@/stores/session'
import AsciiScrollOne from '@/components/shared/asciiScrollOne.vue'

const sessionStore = useSessionStore()

onMounted(() => {
  sessionStore.initAuth()
})
</script>

<template>
  <body>
    <NavMenu />
    <RouterView />
  </body>
</template>

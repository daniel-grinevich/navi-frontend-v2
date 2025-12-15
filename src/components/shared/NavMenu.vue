<script setup lang="ts">
/*** libraries ****/
/*** components ****/
/*** stores ***/
import { useSessionStore } from '@/stores/session'
/*** composables ****/
/*** types ****/

const session = useSessionStore()

const handleLogout = () => {
  session.logout()
}
</script>

<template>
  <nav class="w-full">
    <div class="flex flex-row gap-1">
      <div v-if="session.isAuthenticated">
        {{ session.user }}
        <button type="button" @click="handleLogout">Logout</button>
      </div>
      <router-link to="/login" class="p-3 border">Login</router-link>
      <router-link to="/signup" class="p-3 border">Sign up</router-link>
    </div>
  </nav>
</template>

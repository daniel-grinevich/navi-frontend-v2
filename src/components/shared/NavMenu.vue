<script setup lang="ts">
/*** libraries ****/
import { useRouter } from 'vue-router'
/*** components ****/
/*** stores ***/
import { useSessionStore } from '@/stores/session'
import { computed } from 'vue'
/*** composables ****/
/*** types ****/

const session = useSessionStore()
const router = useRouter()

const handleLogout = () => {
  session.logout()
  router.push('/login')
}

const userDisplayName = computed(() => {
  return session.user.name || session.user.email || 'Unknown User'
})
</script>

<template>
  <nav class="w-full font-mono p-4">
    <div class="mx-auto">
      <!-- Top border -->
      <div class="text-xs mb-2">
        ┌────────────────────────────────────────────────────────────────────────────────┐
      </div>

      <div class="flex flex-row justify-between items-center px-4">
        <!-- Left side navigation -->
        <div class="flex flex-row gap-6 items-center">
          <div class="text-xs">
            <router-link to="/" class="hover:text-green-300 hover:underline transition-colors">
              [ HOME ]
            </router-link>
          </div>
          <div class="text-xs">
            <router-link to="/about" class="hover:text-green-300 hover:underline transition-colors">
              [ ABOUT ]
            </router-link>
          </div>
        </div>

        <!-- Right side auth -->
        <div class="flex flex-row gap-4 items-center">
          <div v-if="session.isAuthenticated" class="flex flex-row gap-4 items-center">
            <span class="text-xs"> &gt;&gt; USER: {{ userDisplayName }} &lt;&lt; </span>
            <button type="button" @click="handleLogout" class="px-3 py-1 text-xs cursor-pointer">
              [ LOGOUT ]
            </button>
          </div>
          <div v-else class="flex flex-row gap-4">
            <router-link to="/login" class="px-3 py-1 text-xs"> [ LOGIN ] </router-link>
            <router-link
              to="/signup"
              class="px-3 py-1 text-xs border border-green-400 bg-green-400 text-black hover:bg-green-300 transition-all"
            >
              [ SIGN UP ]
            </router-link>
          </div>
        </div>
      </div>

      <!-- Bottom border -->
      <div class="text-xs mt-2">
        └────────────────────────────────────────────────────────────────────────────────┘
      </div>
    </div>
  </nav>
</template>

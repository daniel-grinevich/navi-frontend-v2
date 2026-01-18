<script setup lang="ts">
/*** libraries ****/
import { useRouter } from 'vue-router'
/*** components ****/
/*** stores ***/
import { useSessionStore } from '@/stores/session'
import { useShoppingCart } from '@/stores/shoppingCart'
import { computed } from 'vue'
/*** composables ****/
/*** types ****/

const session = useSessionStore()
const cart = useShoppingCart()
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
          <router-link to="/" class="text-xs hover:text-green-300 transition-colors">
            [ HOME ]
          </router-link>

          <router-link to="/about" class="text-xs hover:text-green-300 transition-colors">
            [ ABOUT ]
          </router-link>

          <router-link to="/cart" class="relative text-xs">
            <span class="hover:text-green-300 transition-colors">[ CART ]</span>
            <span
              v-if="cart.itemCount > 0"
              class="absolute -top-2 -right-2 bg-green-400 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
            >
              {{ cart.itemCount > 9 ? '9+' : cart.itemCount }}
            </span>
          </router-link>
          <router-link to="/find-navi" class="relative text-xs">
            <span class="hover:text-green-300 transition-colors">[ NAVIPORT ]</span>
          </router-link>
        </div>

        <!-- Right side auth -->
        <div class="flex flex-row gap-4 items-center">
          <div v-if="session.isAuthenticated" class="flex flex-row gap-4 items-center">
            <router-link to="/orders" class="px-3 py-1 text-xs"> [ Orders ] </router-link>
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

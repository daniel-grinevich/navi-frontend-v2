<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/session'
import { useShoppingCart } from '@/stores/shoppingCart'
import { computed } from 'vue'

const session = useSessionStore()
const cart = useShoppingCart()
const router = useRouter()

const handleLogout = () => {
  session.logout()
  router.push('/login')
}

const userDisplayName = computed(() => {
  return session.user.name || session.user.email || 'unknown'
})
</script>

<template>
  <nav class="w-full font-mono text-sm">
    <!-- Menu bar -->
    <div class="border border-alt flex flex-wrap items-stretch">
      <!-- Brand -->
      <router-link
        to="/"
        class="no-underline px-3 py-1 border-r border-alt flex items-center gap-1 hover:bg-green hover:text-primary transition-colors"
      >
        <span class="text-green">▪</span> NAVI
      </router-link>

      <!-- Nav links -->
      <router-link
        to="/menu"
        class="no-underline px-3 py-1 border-r border-alt flex items-center hover:bg-green hover:text-primary transition-colors"
      >
        MENU
      </router-link>

      <router-link
        to="/find-navi"
        class="no-underline px-3 py-1 border-r border-alt flex items-center hover:bg-green hover:text-primary transition-colors"
      >
        NAVIPORTS
      </router-link>

      <router-link
        v-if="session.isAuthenticated"
        to="/orders"
        class="no-underline px-3 py-1 border-r border-alt flex items-center hover:bg-green hover:text-primary transition-colors"
      >
        ORDERS
      </router-link>

      <router-link
        to="/cart"
        class="no-underline px-3 py-1 border-r border-alt flex items-center gap-2 hover:bg-green hover:text-primary transition-colors"
      >
        CART
        <span v-if="cart.itemCount > 0" class="text-green">[{{ cart.itemCount }}]</span>
      </router-link>

      <router-link
        to="/about"
        class="no-underline px-3 py-1 border-r border-alt flex items-center hover:bg-green hover:text-primary transition-colors"
      >
        ABOUT
      </router-link>

      <!-- Right side: spacer + auth -->
      <div class="ml-auto flex items-stretch">
        <template v-if="session.isAuthenticated">
          <span class="px-3 py-1 border-l border-alt flex items-center font-secondary">
            {{ userDisplayName }}
          </span>
          <button
            type="button"
            @click="handleLogout"
            class="px-3 py-1 border-l border-alt cursor-pointer hover:bg-green hover:text-primary transition-colors bg-transparent"
          >
            LOGOUT
          </button>
        </template>
        <template v-else>
          <router-link
            to="/login"
            class="no-underline px-3 py-1 border-l border-alt flex items-center hover:bg-green hover:text-primary transition-colors"
          >
            LOGIN
          </router-link>
          <router-link
            to="/signup"
            class="no-underline px-3 py-1 border-l border-alt flex items-center bg-green text-primary hover:opacity-80 transition-colors"
          >
            SIGN UP
          </router-link>
        </template>
      </div>
    </div>
  </nav>
</template>

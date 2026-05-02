<script setup lang="ts">
import { useSessionStore } from '@/stores/session'
import { useShoppingCart } from '@/stores/shoppingCart'
import { computed, ref } from 'vue'

const session = useSessionStore()
const cart = useShoppingCart()

const handleLogout = () => {
  session.logout()
}

const userDisplayName = computed(() => {
  return session.user.name || session.user.email || 'unknown'
})

const menuArt = ['▪', '▪', '▪', '▪']
const mobileMenuOpen = ref(false)
</script>

<template>
  <nav class="w-full font-mono text-sm relative">
    <!-- Top bar -->
    <div class="border border-alt flex items-stretch">
      <!-- Brand -->
      <router-link
        to="/"
        class="no-underline px-3 py-1 border-r border-alt flex items-center gap-1 hover:bg-green hover:text-primary transition-colors"
        @click="mobileMenuOpen = false"
      >
        <span class="text-green">▪</span> NAVI
      </router-link>

      <!-- Desktop nav links -->
      <router-link
        to="/menu"
        class="no-underline px-3 py-1 border-r border-alt hidden md:flex items-center hover:bg-green hover:text-primary transition-colors"
      >
        MENU
      </router-link>

      <router-link
        to="/find-navi"
        class="no-underline px-3 py-1 border-r border-alt hidden md:flex items-center hover:bg-green hover:text-primary transition-colors"
      >
        NAVIPORTS
      </router-link>

      <router-link
        v-if="session.isAuthenticated"
        to="/orders"
        class="no-underline px-3 py-1 border-r border-alt hidden md:flex items-center hover:bg-green hover:text-primary transition-colors"
      >
        ORDERS
      </router-link>

      <router-link
        to="/cart"
        class="group no-underline px-3 py-1 border-r border-alt hidden md:flex items-center gap-2 hover:bg-green hover:text-primary transition-colors"
      >
        CART
        <span v-if="cart.itemCount > 0" class="text-green group-hover:text-primary">[{{ cart.itemCount }}]</span>
      </router-link>

      <!-- Desktop auth (right side) -->
      <div class="ml-auto hidden md:flex items-stretch">
        <template v-if="session.isAuthenticated">
          <span class="px-3 py-1 border-l border-alt flex items-center gap-2 font-mono">
            <span class="bg-green text-primary px-1.5 py-0.5 text-xs">▪ {{ userDisplayName }}</span>
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
            class="no-underline px-3 py-1 border-l border-alt flex items-center bg-green text-primary hover:bg-alt hover:text-primary transition-colors"
          >
            SIGN UP
          </router-link>
        </template>
      </div>

      <!-- Mobile: cart + hamburger -->
      <div class="ml-auto flex md:hidden items-stretch">
        <router-link
          to="/cart"
          class="group no-underline px-3 py-1 border-l border-alt flex items-center gap-2 hover:bg-green hover:text-primary transition-colors"
          @click="mobileMenuOpen = false"
        >
          CART
          <span v-if="cart.itemCount > 0" class="text-green group-hover:text-primary">[{{ cart.itemCount }}]</span>
        </router-link>
        <button
          type="button"
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="px-3 py-1 border-l border-alt cursor-pointer hover:bg-green hover:text-primary transition-colors bg-transparent text-lg leading-none"
        >
          {{ mobileMenuOpen ? '✕' : '≡' }}
        </button>
      </div>
    </div>

    <!-- Mobile dropdown -->
    <div v-if="mobileMenuOpen" class="md:hidden border border-t-0 border-alt flex flex-col absolute left-0 right-0 z-50 bg-green text-primary">
      <router-link
        to="/menu"
        class="no-underline px-3 py-2 border-b border-primary flex items-center hover:bg-alt transition-colors"
        @click="mobileMenuOpen = false"
      >
        MENU
      </router-link>

      <router-link
        to="/find-navi"
        class="no-underline px-3 py-2 border-b border-primary flex items-center hover:bg-alt transition-colors"
        @click="mobileMenuOpen = false"
      >
        NAVIPORTS
      </router-link>

      <router-link
        v-if="session.isAuthenticated"
        to="/orders"
        class="no-underline px-3 py-2 border-b border-primary flex items-center hover:bg-alt transition-colors"
        @click="mobileMenuOpen = false"
      >
        ORDERS
      </router-link>

      <template v-if="session.isAuthenticated">
        <span class="px-3 py-2 border-b border-primary flex items-center font-secondary">
          {{ userDisplayName }}
        </span>
        <button
          type="button"
          @click="handleLogout(); mobileMenuOpen = false"
          class="px-3 py-2 border-b border-primary cursor-pointer hover:bg-alt transition-colors bg-transparent text-left text-primary"
        >
          LOGOUT
        </button>
      </template>
      <template v-else>
        <router-link
          to="/login"
          class="no-underline px-3 py-2 border-b border-primary flex items-center hover:bg-alt transition-colors"
          @click="mobileMenuOpen = false"
        >
          LOGIN
        </router-link>
        <router-link
          to="/signup"
          class="no-underline px-3 py-2 flex items-center hover:bg-alt transition-colors"
          @click="mobileMenuOpen = false"
        >
          SIGN UP
        </router-link>
      </template>
    </div>
  </nav>
</template>

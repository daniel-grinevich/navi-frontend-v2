<script setup lang="ts">
import { useSessionStore } from '@/stores/session'
import { useShoppingCart } from '@/stores/shoppingCart'
import ThemeToggle from '@/components/shared/ThemeToggle.vue'
import { computed, ref } from 'vue'
import { onClickOutside } from '@vueuse/core'

const session = useSessionStore()
const cart = useShoppingCart()

const handleLogout = () => {
  session.logout()
}

const userDisplayName = computed(() => {
  return session.user.name || session.user.email || 'unknown'
})

const mobileMenuOpen = ref(false)

// Desktop user dropdown (name → Settings / Logout).
const userMenuOpen = ref(false)
const userMenuRef = ref<HTMLElement | null>(null)
onClickOutside(userMenuRef, () => {
  userMenuOpen.value = false
})
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
        v-if="session.isAdmin"
        to="/admin/notifications"
        class="no-underline px-3 py-1 border-r border-alt hidden md:flex items-center hover:bg-green hover:text-primary transition-colors"
      >
        ADMIN
      </router-link>

      <router-link
        v-if="session.isAdmin"
        to="/admin/orders"
        class="no-underline px-3 py-1 border-r border-alt hidden md:flex items-center hover:bg-green hover:text-primary transition-colors"
      >
        ALL ORDERS
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
        <ThemeToggle class="px-3 border-l border-alt items-center" />
        <template v-if="session.isAuthenticated">
          <div ref="userMenuRef" class="relative border-l border-alt flex">
            <button
              type="button"
              @click="userMenuOpen = !userMenuOpen"
              class="px-3 py-1 flex items-center gap-2 font-mono cursor-pointer hover:bg-green hover:text-primary transition-colors bg-transparent"
              :aria-expanded="userMenuOpen"
            >
              <span class="bg-green text-primary px-1.5 py-0.5 text-xs">▪ {{ userDisplayName }}</span>
              <span class="text-xs">{{ userMenuOpen ? '▲' : '▼' }}</span>
            </button>
            <div
              v-if="userMenuOpen"
              class="absolute right-0 top-full z-50 min-w-full flex flex-col border border-alt bg-primary"
            >
              <router-link
                to="/settings"
                class="no-underline px-3 py-2 border-b border-alt hover:bg-green hover:text-primary transition-colors whitespace-nowrap"
                @click="userMenuOpen = false"
              >
                SETTINGS
              </router-link>
              <button
                type="button"
                @click="handleLogout(); userMenuOpen = false"
                class="px-3 py-2 text-left cursor-pointer hover:bg-green hover:text-primary transition-colors bg-transparent whitespace-nowrap"
              >
                LOGOUT
              </button>
            </div>
          </div>
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

      <!-- Mobile: theme + cart + hamburger -->
      <div class="ml-auto flex md:hidden items-stretch">
        <ThemeToggle class="px-3 border-l border-alt items-center" />
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

      <router-link
        v-if="session.isAdmin"
        to="/admin/notifications"
        class="no-underline px-3 py-2 border-b border-primary flex items-center hover:bg-alt transition-colors"
        @click="mobileMenuOpen = false"
      >
        ADMIN
      </router-link>

      <template v-if="session.isAuthenticated">
        <router-link
          to="/settings"
          class="no-underline px-3 py-2 border-b border-primary flex items-center hover:bg-alt transition-colors"
          @click="mobileMenuOpen = false"
        >
          {{ userDisplayName }}
        </router-link>
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

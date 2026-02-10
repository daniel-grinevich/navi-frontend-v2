<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useApiWrite } from '@/composables/useApi'
import { useSessionStore } from '@/stores/session'
import LoadingSpinnerTwo from '@/components/shared/LoadingSpinnerTwo.vue'
import { apiClient } from '@/lib/apiClient'
import { LoginSchema } from '@/schemas/user/LoginSchema'
import { useUserLogin } from '@/composables/useUser'

const sessionStore = useSessionStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const loginErrorMessage = ref('')

const { mutateAsync, isPending } = useUserLogin()

const handleLoginSubmit = async (e: Event) => {
  loading.value = true
  loginErrorMessage.value = ''
  const formData = { email: email.value, password: password.value }
  const result = LoginSchema.safeParse(formData)

  if (!result.success) {
    loginErrorMessage.value = result.error.message
    loading.value = false
  } else {
    try {
      const response=await mutateAsync(formData)
      sessionStore.session = {
      accessToken: response.access,
      refreshToken: response.refresh,
    }
    sessionStore.getUser()
    loading.value = false
    const canGoBack = window.history.state?.back !== null
    if (canGoBack) {
      router.go(-1)
    } else {
      router.push({ name: 'menu' })
    }}
    catch (error) {
    console.error('Login Failed:', error)
    alert('Failed to Login. Please try again.')
    loading.value=false
    }
}}
</script>

<template>
  <div class="w-full text-xs border border-alt">
    <div class="flex flex-col md:flex-row min-h-[75vh]">
      <!-- Left: ASCII Art -->
      <div class="md:w-1/2 border-b md:border-b-0 md:border-r border-alt flex flex-col">
        <div class="px-3 py-1 border-b border-alt font-secondary text-alt">//</div>

        <div class="flex-1 flex flex-col items-center justify-center p-6 overflow-hidden">
          <div class="text-green whitespace-pre leading-none select-none text-[8px] md:text-[10px]">
            <div>    ·  .    *      ✦   ·      .    *   ✦    ·</div>
            <div>  *     ✦    ·  .     *    ·    ✦    .     *</div>
            <div>     .     *    ✦   .    ·   *    .   ✦   ·</div>
            <div>  ✦    ·      .    *   ✦        ·   .    *</div>
            <div>                          ┌───┐</div>
            <div>                    ┌───┐ │░░░│</div>
            <div>              ┌──┐  │░█░│ │░█░│  ┌────┐</div>
            <div>         ┌──┐ │░░│  │░░░│ │░░░│  │░░█░│</div>
            <div>    ┌──┐ │█░│ │░█│  │░█░│ │░█░│  │░░░░│ ┌──┐</div>
            <div>    │░░│ │░░│ │░░│  │░░░│ │░░░│  │░█░░│ │░█│</div>
            <div>    │░█│ │░█│ │█░│  │█░░│ │░░█│  │░░░░│ │░░│</div>
            <div>    │░░│ │░░│ │░░│  │░█░│ │░█░│  │░░█░│ │█░│</div>
            <div>    │█░│ │░░│ │░░│  │░░░│ │░░░│  │░░░░│ │░░│</div>
            <div>    │░░│ │█░│ │░█│  │░░█│ │█░░│  │█░░░│ │░░│</div>
            <div>    │░█│ │░░│ │░░│  │░░░│ │░░░│  │░░░░│ │░█│</div>
            <div>    │░░│ │░░│ │░░│  │█░░│ │░░█│  │░░█░│ │░░│</div>
            <div>    │░░│ │░█│ │█░│  │░░░│ │░░░│  │░░░░│ │░░│</div>
            <div>────┘  └─┘  └─┘  └──┘   └─┘   └──┘    └─┘  └───</div>
            <div>▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓</div>
            <div>  ═══╗    ╔═══════╗       ╔══════╗    ╔═══╗</div>
            <div>     ║    ║  NAVI ║       ║COFFEE║    ║   ║</div>
            <div>═════╝    ╚═══════╝       ╚══════╝    ╚═══╝</div>
            <div>▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓</div>
            <div>  ·  .  ·  .  ·  .  ·  .  ·  .  ·  .  ·  .  ·</div>
          </div>
        </div>
      </div>

      <!-- Right: Login Form -->
      <div class="md:w-1/2 flex flex-col">
        <div class="px-3 py-1 border-b border-alt bg-green text-white">// sign in</div>

        <div class="flex-1 flex flex-col justify-center p-6">
          <form @submit.prevent="handleLoginSubmit" class="flex flex-col gap-3 max-w-sm mx-auto w-full">
            <div class="flex flex-col gap-0.5">
              <label for="email" class="block text-xs border border-alt max-w-fit p-1">email:</label>
              <input
                id="email"
                v-model="email"
                type="email"
                required
                placeholder="you@example.com"
                autocomplete="email"
                class="w-full px-4 py-2 border border-alt outline-0 focus:border-green"
              />
            </div>
            <div class="flex flex-col gap-0.5">
              <label for="password" class="block text-xs border border-alt max-w-fit p-1">password:</label>
              <input
                id="password"
                v-model="password"
                type="password"
                required
                placeholder="••••••••"
                autocomplete="current-password"
                class="w-full px-4 py-2 border border-alt outline-0 focus:border-green"
              />
            </div>

            <div v-if="loginErrorMessage" class="p-2 border border-red text-red text-xs">
              {{ loginErrorMessage }}
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full py-2 px-4 bg-green text-white border border-green cursor-pointer font-mono tracking-wide text-xs hover:bg-alt hover:text-primary hover:border-alt transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {{ loading ? 'signing in...' : '▸ SIGN IN' }}
            </button>
          </form>

          <p class="text-center text-xs mt-6">
            don't have an account?
            <RouterLink to="/signup" class="text-green hover:underline">sign up</RouterLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

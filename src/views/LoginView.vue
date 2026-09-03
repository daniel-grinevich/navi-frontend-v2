<script setup lang="ts">
/*** libraries ****/
import { ref, computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
/*** components ****/
import TinyLoadingSpinner from '@/components/shared/TinyLoadingSpinner.vue'
/*** stores ***/
import { useSessionStore } from '@/stores/session'
/*** composables ****/
import { useUserLogin } from '@/composables/useUser'
import { useZod } from '@/composables/useZod'
/*** types ****/
import { LoginSchema } from '@/schemas/user/LoginSchema'

const sessionStore = useSessionStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const loading = ref(false)
const loginErrorMessage = ref('')

const loginFields = computed(() => {
  return { email: email.value, password: password.value }
})

const { zodValueorError } = useZod(loginFields, LoginSchema)

const { mutateAsync } = useUserLogin()

const handleLoginSubmit = async () => {
  loading.value = true
  loginErrorMessage.value = ''

  if (!zodValueorError.value.success && zodValueorError.value.error) {
    loginErrorMessage.value = Object.values(zodValueorError.value.error).join(',')
    loading.value = false
    return
  }

  try {
    await mutateAsync(loginFields.value)
  } catch (error) {
    console.log('Login Failed:', error)
    loginErrorMessage.value = 'Invalid email or password.'
    loading.value = false
    return
  }

  // Only reached on a successful login — never redirect a failed attempt.
  await sessionStore.initAuth()
  loading.value = false

  const canGoBack = window.history.state?.back !== null
  if (canGoBack) {
    router.go(-1)
  } else {
    router.push({ name: 'menu' })
  }
}
</script>

<template>
  <div class="w-full text-xs border border-alt">
    <div class="flex flex-col md:flex-row min-h-[75vh]">
      <!-- Left: ASCII Art -->
      <div class="md:w-1/2 border-b md:border-b-0 md:border-r border-alt flex flex-col">
        <div class="px-3 py-1 border-b border-alt font-secondary text-alt">//</div>

        <div class="flex-1 flex flex-col items-center justify-center p-6 overflow-hidden">
          <div class="text-green whitespace-pre leading-none select-none text-[8px] md:text-[10px]">
            <div>· . * ✦ · . * ✦ ·</div>
            <div>* ✦ · . * · ✦ . *</div>
            <div>. * ✦ . · * . ✦ ·</div>
            <div>✦ · . * ✦ · . *</div>
            <div>┌───┐</div>
            <div>┌───┐ │░░░│</div>
            <div>┌──┐ │░█░│ │░█░│ ┌────┐</div>
            <div>┌──┐ │░░│ │░░░│ │░░░│ │░░█░│</div>
            <div>┌──┐ │█░│ │░█│ │░█░│ │░█░│ │░░░░│ ┌──┐</div>
            <div>│░░│ │░░│ │░░│ │░░░│ │░░░│ │░█░░│ │░█│</div>
            <div>│░█│ │░█│ │█░│ │█░░│ │░░█│ │░░░░│ │░░│</div>
            <div>│░░│ │░░│ │░░│ │░█░│ │░█░│ │░░█░│ │█░│</div>
            <div>│█░│ │░░│ │░░│ │░░░│ │░░░│ │░░░░│ │░░│</div>
            <div>│░░│ │█░│ │░█│ │░░█│ │█░░│ │█░░░│ │░░│</div>
            <div>│░█│ │░░│ │░░│ │░░░│ │░░░│ │░░░░│ │░█│</div>
            <div>│░░│ │░░│ │░░│ │█░░│ │░░█│ │░░█░│ │░░│</div>
            <div>│░░│ │░█│ │█░│ │░░░│ │░░░│ │░░░░│ │░░│</div>
            <div>────┘ └─┘ └─┘ └──┘ └─┘ └──┘ └─┘ └───</div>
            <div>▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓</div>
            <div>═══╗ ╔═══════╗ ╔══════╗ ╔═══╗</div>
            <div>║ ║ NAVI ║ ║COFFEE║ ║ ║</div>
            <div>═════╝ ╚═══════╝ ╚══════╝ ╚═══╝</div>
            <div>▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓</div>
            <div>· . · . · . · . · . · . · . ·</div>
          </div>
        </div>
      </div>

      <!-- Right: Login Form -->
      <div class="md:w-1/2 flex flex-col">
        <div class="px-3 py-1 border-b border-alt bg-green text-white">// sign in</div>

        <div
          v-if="route.query.reason === 'auth-required'"
          class="border border-red text-red text-sm px-3 py-1 font-mono flex justify-center w-3/4 my-3 mx-auto"
        >
          You were redirected because you must login first.
        </div>

        <div class="flex-1 flex flex-col justify-center p-6">
          <form
            @submit.prevent="handleLoginSubmit"
            class="flex flex-col gap-3 max-w-sm mx-auto w-full"
          >
            <div class="flex flex-col gap-0.5">
              <label for="email" class="block text-xs border border-alt max-w-fit p-1">
                email:
              </label>
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
              <label for="password" class="block text-xs border border-alt max-w-fit p-1">
                password:
              </label>
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
              <span v-if="loading"><TinyLoadingSpinner /> SIGN IN</span>
              <span v-else>▸ SIGN IN</span>
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

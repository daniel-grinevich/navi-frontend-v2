<script setup lang="ts">
/*** libraries ****/
import { ref, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
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

const email = ref('')
const password = ref('')
const loading = ref(false)
const loginErrorMessage = ref('')

const loginFields = computed(() => {
  return { email: email.value, password: password.value }
})

const { zodValueorError } = useZod(loginFields, LoginSchema)

const { mutateAsync } = useUserLogin()

const handleLoginSubmit = async (e: Event) => {
  loading.value = true
  loginErrorMessage.value = ''

  try {
    if (!zodValueorError.value.success && zodValueorError.value.error) {
      loginErrorMessage.value = Object.values(zodValueorError.value.error).join(',')
      throw Error('Schema was not validated')
    }

    await mutateAsync(loginFields.value)
  } catch (error) {
    console.error('Login Failed:', error)
  } finally {
    sessionStore.initAuth()
    loading.value = false

    const canGoBack = window.history.state?.back !== null
    if (canGoBack) {
      router.go(-1)
    } else {
      router.push({ name: 'menu' })
    }
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

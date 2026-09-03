<script setup lang="ts">
/*** libraries ****/
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useForm } from '@tanstack/vue-form'
/*** components ****/
import AuthProviders from '@/components/shared/AuthProviders.vue'
/*** stores ***/
import { useSessionStore } from '@/stores/session'
/*** composables ****/
import { useUserLogin } from '@/composables/useUser'
/*** schemas ****/
import { LoginSchema } from '@/schemas/user/LoginSchema'

const sessionStore = useSessionStore()
const router = useRouter()
const route = useRoute()

const { mutateAsync: login } = useUserLogin()

// Form-level error (bad credentials / network), shown above the button.
const loginErrorMessage = ref('')

const validateEmail = (value: string) => {
  const result = LoginSchema.shape.email.safeParse(value)
  return result.success ? undefined : result.error.issues[0]?.message
}

const form = useForm({
  defaultValues: {
    email: '',
    password: '',
  },
  onSubmit: async ({ value }) => {
    loginErrorMessage.value = ''

    // Build the payload explicitly from validated form state.
    try {
      await login({ email: value.email, password: value.password })
    } catch {
      loginErrorMessage.value =
        "We couldn't sign you in. Check your email and password — or sign up below if you don't have an account yet."
      return
    }

    await sessionStore.initAuth()

    const canGoBack = window.history.state?.back !== null
    if (canGoBack) {
      router.go(-1)
    } else {
      router.push({ name: 'menu' })
    }
  },
})
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
            @submit.prevent.stop="form.handleSubmit()"
            class="flex flex-col gap-3 max-w-sm mx-auto w-full"
          >
            <!-- email -->
            <form.Field
              name="email"
              :validators="{
                onBlur: ({ value }: { value: string }) => validateEmail(value),
                onSubmit: ({ value }: { value: string }) => validateEmail(value),
              }"
            >
              <template #default="{ field, state }">
                <div class="flex flex-col gap-0.5">
                  <label :for="field.name" class="block text-xs border border-alt max-w-fit p-1">
                    email:
                  </label>
                  <input
                    :id="field.name"
                    :value="field.state.value"
                    @input="(e: Event) => field.handleChange((e.target as HTMLInputElement).value)"
                    @change="(e: Event) => field.handleChange((e.target as HTMLInputElement).value)"
                    @blur="field.handleBlur"
                    type="email"
                    placeholder="you@example.com"
                    autocomplete="email"
                    class="w-full px-4 py-2 border border-alt outline-0 focus:border-green"
                  />
                  <div class="text-red h-5 mt-0.5 text-xs">
                    {{ state.meta.errors[0] }}
                  </div>
                </div>
              </template>
            </form.Field>

            <!-- password -->
            <form.Field
              name="password"
              :validators="{
                onSubmit: ({ value }: { value: string }) =>
                  value ? undefined : 'Password is required',
              }"
            >
              <template #default="{ field, state }">
                <div class="flex flex-col gap-0.5">
                  <label :for="field.name" class="block text-xs border border-alt max-w-fit p-1">
                    password:
                  </label>
                  <input
                    :id="field.name"
                    :value="field.state.value"
                    @input="(e: Event) => field.handleChange((e.target as HTMLInputElement).value)"
                    @change="(e: Event) => field.handleChange((e.target as HTMLInputElement).value)"
                    @blur="field.handleBlur"
                    type="password"
                    placeholder="••••••••"
                    autocomplete="current-password"
                    class="w-full px-4 py-2 border border-alt outline-0 focus:border-green"
                  />
                  <div class="text-red h-5 mt-0.5 text-xs">
                    {{ state.meta.errors[0] }}
                  </div>
                </div>
              </template>
            </form.Field>

            <div v-if="loginErrorMessage" class="p-2 border border-red text-red text-xs">
              {{ loginErrorMessage }}
            </div>

            <form.Subscribe>
              <template #default="{ canSubmit, isSubmitting }">
                <button
                  type="submit"
                  :disabled="!canSubmit"
                  class="w-full py-2 px-4 bg-green text-white border border-green cursor-pointer font-mono tracking-wide text-xs hover:bg-alt hover:text-primary hover:border-alt transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  <span v-if="isSubmitting">creating session... SIGN IN</span>
                  <span v-else>▸ SIGN IN</span>
                </button>
              </template>
            </form.Subscribe>
          </form>

          <AuthProviders class="mt-4" next="/menu" verb="Continue" />

          <p class="text-center text-xs mt-6">
            don't have an account?
            <RouterLink to="/signup" class="text-green hover:underline">sign up</RouterLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

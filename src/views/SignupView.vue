<script setup lang="ts">
/*** libraries ****/
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useForm } from '@tanstack/vue-form'
/*** composables ****/
import { useUserLogin, useUserSignup } from '@/composables/useUser'
/*** lib ****/
import { apiClient } from '@/lib/apiClient'
/*** schemas ****/
import { SignupSchema } from '@/schemas/user/SignupSchema'
/*** components ****/
import AuthProviders from '@/components/shared/AuthProviders.vue'
import { useSessionStore } from '@/stores/session'

const router = useRouter()
const sessionStore = useSessionStore()

const { mutateAsync: signup } = useUserSignup()
const { mutateAsync: login } = useUserLogin()

// Form-level submit error (network / server failures), shown above the button.
const submitError = ref('')

// Validate a single field against its slice of the Zod schema and return the
// first message (or undefined when valid) — the shape TanStack Form expects.
const validateField = (key: 'email' | 'password', value: string) => {
  const result = SignupSchema.shape[key].safeParse(value)
  return result.success ? undefined : result.error.issues[0]?.message
}

// Async email-availability check. A non-guest hit means the address is taken.
// Any error (not-found, unauthorized, network) is treated as "available" so a
// flaky check never blocks a legitimate signup.
const checkEmailAvailable = async (value: string) => {
  if (!value || validateField('email', value)) return undefined
  try {
    const res = await apiClient<{ id?: string; is_guest?: boolean }>(
      `api/users/by-email/?email=${encodeURIComponent(value)}`,
      { method: 'GET' },
    )
    if (res?.id && !res?.is_guest) return 'This email is already in use.'
  } catch {
    // treat as available
  }
  return undefined
}

const form = useForm({
  defaultValues: {
    email: '',
    password: '',
    confirmPassword: '',
  },
  onSubmit: async ({ value }) => {
    submitError.value = ''

    // Build the payload explicitly from validated form state — no computed refs.
    const credentials = { email: value.email, password: value.password }

    try {
      await signup(credentials)
    } catch {
      submitError.value = 'Failed to create account. Please try again.'
      return
    }

    try {
      await login(credentials)
      await sessionStore.getUser()
      router.push({ name: 'menu' })
    } catch {
      submitError.value = 'Account created, but sign-in failed. Try logging in.'
    }
  },
})
</script>

<template>
  <div class="w-full text-xs border border-alt">
    <div class="flex flex-col md:flex-row min-h-[75vh]">
      <!-- Left: Sign Up Form -->
      <div class="md:w-1/2 border-b md:border-b-0 md:border-r border-alt flex flex-col">
        <div class="px-3 py-1 border-b border-alt bg-green text-white">// sign up</div>

        <div class="flex-1 flex flex-col justify-center p-6">
          <form
            @submit.prevent.stop="form.handleSubmit()"
            class="flex flex-col gap-3 max-w-sm mx-auto w-full"
          >
            <!-- email -->
            <form.Field
              name="email"
              :validators="{
                onBlur: ({ value }: { value: string }) => validateField('email', value),
                onSubmit: ({ value }: { value: string }) => validateField('email', value),
                onChangeAsyncDebounceMs: 500,
                onChangeAsync: ({ value }: { value: string }) => checkEmailAvailable(value),
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
                onChange: ({ value }: { value: string }) => validateField('password', value),
                onSubmit: ({ value }: { value: string }) => validateField('password', value),
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
                    autocomplete="new-password"
                    class="w-full px-4 py-2 border border-alt outline-0 focus:border-green"
                  />
                  <div class="text-red h-5 mt-0.5 text-xs">
                    {{ state.meta.errors[0] }}
                  </div>
                </div>
              </template>
            </form.Field>

            <!-- confirm password -->
            <form.Field
              name="confirmPassword"
              :validators="{
                onChangeListenTo: ['password'],
                onChange: ({ value, fieldApi }: { value: string; fieldApi: any }) =>
                  value !== fieldApi.form.getFieldValue('password')
                    ? 'Passwords do not match'
                    : undefined,
              }"
            >
              <template #default="{ field, state }">
                <div class="flex flex-col gap-0.5">
                  <label :for="field.name" class="block text-xs border border-alt max-w-fit p-1">
                    confirm password:
                  </label>
                  <input
                    :id="field.name"
                    :value="field.state.value"
                    @input="(e: Event) => field.handleChange((e.target as HTMLInputElement).value)"
                    @change="(e: Event) => field.handleChange((e.target as HTMLInputElement).value)"
                    @blur="field.handleBlur"
                    type="password"
                    placeholder="••••••••"
                    autocomplete="new-password"
                    class="w-full px-4 py-2 border border-alt outline-0 focus:border-green"
                  />
                  <div class="text-red h-5 mt-0.5 text-xs">
                    {{ state.meta.errors[0] }}
                  </div>
                </div>
              </template>
            </form.Field>

            <div v-if="submitError" class="p-2 border border-red text-red text-xs">
              {{ submitError }}
            </div>

            <form.Subscribe>
              <template #default="{ canSubmit, isSubmitting }">
                <button
                  type="submit"
                  :disabled="!canSubmit"
                  class="w-full py-2 px-4 bg-green text-white border border-green cursor-pointer font-mono tracking-wide text-xs hover:bg-alt hover:text-primary hover:border-alt transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {{ isSubmitting ? 'creating account...' : '▸ SIGN UP' }}
                </button>
              </template>
            </form.Subscribe>
          </form>

          <AuthProviders class="mt-4" next="/menu" verb="Sign up" />

          <p class="text-center text-xs mt-6">
            already have an account?
            <RouterLink to="/login" class="text-green hover:underline">sign in</RouterLink>
          </p>
        </div>
      </div>

      <!-- Right: ASCII Art -->
      <div class="md:w-1/2 flex flex-col">
        <div class="px-3 py-1 border-b border-alt font-secondary text-alt">//</div>

        <div class="flex-1 flex flex-col items-center justify-center p-6 overflow-hidden">
          <div class="text-green whitespace-pre leading-none select-none">
            <div>        ( (</div>
            <div>         ) )</div>
            <div>      .─────.</div>
            <div>      │~~~~~│┐</div>
            <div>      │~~~~~││</div>
            <div>      │_____│┘</div>
            <div>      ╰─────╯</div>
            <div>     ▀▀▀▀▀▀▀▀▀</div>
          </div>

          <div class="mt-8 text-green whitespace-pre leading-tight select-none text-center">
            <div>┌─────────────────────┐</div>
            <div>│  WELCOME TO NAVI    │</div>
            <div>│                     │</div>
            <div>│  ▸ save favorites   │</div>
            <div>│  ▸ track orders     │</div>
            <div>│  ▸ earn rewards     │</div>
            <div>│                     │</div>
            <div>│  status: awaiting   │</div>
            <div>│  new user... █      │</div>
            <div>└─────────────────────┘</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

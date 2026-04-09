<script setup lang="ts">
/*** libraries ****/
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { refDebounced, useDebounceFn } from '@vueuse/core'
/*** components ****/
/*** stores ***/
/*** composables ****/
import { useUserByEmail,useUserLogin, useUserSignup } from '@/composables/useUser'
import { useZod } from '@/composables/useZod'
/*** types ****/
/*** schemas ****/
import { SignupSchema } from '@/schemas/user/SignupSchema'
import LoadingSpinnerTwo from '@/components/shared/LoadingSpinnerTwo.vue'
import { useSessionStore } from '@/stores/session'

const router = useRouter()
const sessionStore = useSessionStore()
const email = ref<string>('')
const emailDebounced = refDebounced(email, 500)
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const enableQueryImmediate = ref(false)
const enableQuery = refDebounced(enableQueryImmediate, 500)
const errorMessages = ref<{ email: string[]; password: string[]; submit: string[] }>({
  email: [],
  password: [],
  submit: [],
})
const touched = ref({ email: false, password: false, confirmPassword: false })

const signupFields = computed(() => {
  return { email: email.value, password: password.value }
})

const allEmailErrors = computed(() => {
  if (!touched.value.email) return []

  let zodEmailErrors: string[] = []

  if (!zodValueorError.value.success && zodValueorError.value.error) {
    zodEmailErrors = zodValueorError.value.error.email?.map((error: string) => error) ?? []
  }

  const duplicateError =
    duplicateEmails.value?.id && !duplicateEmails.value?.is_guest
      ? ['This email is already in use.']
      : []

  return [...zodEmailErrors, ...errorMessages.value.email, ...duplicateError]
})

const allPasswordErrors = computed(() => {
  if (!touched.value.password) return []

  let zodPasswordErrors: string[] = []

  if (!zodValueorError.value.success && zodValueorError.value.error) {
    zodPasswordErrors = zodValueorError.value.error.password?.map((error: string) => error) ?? []
  }

  return [...zodPasswordErrors, ...errorMessages.value.password]
})

const confirmPasswordError = computed(() => {
  if (!touched.value.confirmPassword) return ''
  if (confirmPassword.value === '') return ''
  if (confirmPassword.value !== password.value) return 'Passwords do not match'
  return ''
})

const { zodValueorError } = useZod(signupFields, SignupSchema)

const {
  isLoading,
  isPending,
  isError,
  data: duplicateEmails,
} = useUserByEmail(emailDebounced, enableQuery)

const { data: signupData, isError: signupError, mutateAsync } = useUserSignup()
const { mutateAsync: login } = useUserLogin()

const markEmailTouched = useDebounceFn(() => {
  touched.value.email = true
}, 1000)

const markPasswordTouched = useDebounceFn(() => {
  touched.value.password = true
}, 1000)

const markConfirmPasswordTouched = useDebounceFn(() => {
  touched.value.confirmPassword = true
}, 1000)

const handleEmailInput = () => {
  markEmailTouched()
  if (!zodValueorError.value.error?.email && email.value.length > 0) {
    enableQueryImmediate.value = true
  } else {
    enableQueryImmediate.value = false
  }
}

const handleSignupSubmit = async (e: Event) => {
  e.preventDefault()
  errorMessages.value.submit = []

  if (allEmailErrors.value.length || allPasswordErrors.value.length || confirmPasswordError.value)
    return

  loading.value = true

  try {
    await mutateAsync(signupFields.value)
    try {
      const response=await login(signupFields.value)
      router.push({name:'menu'})
      sessionStore.session = {
      accessToken: response.access,
      refreshToken: response.refresh,
    }
    sessionStore.getUser()
    }
    catch (error){
      errorMessages.value.submit.push('Failed to login after creating account. Please try again.')
    }
  } catch (error) {
    errorMessages.value.submit.push('Failed to create account. Please try again.')
  } finally {
    loading.value = false
  }

}
</script>

<template>
  <div class="w-full text-xs border border-alt">
    <div class="flex flex-col md:flex-row min-h-[75vh]">
      <!-- Left: Sign Up Form -->
      <div class="md:w-1/2 border-b md:border-b-0 md:border-r border-alt flex flex-col">
        <div class="px-3 py-1 border-b border-alt bg-green text-white">// sign up</div>

        <div class="flex-1 flex flex-col justify-center p-6">
          <form @submit.prevent="handleSignupSubmit" class="flex flex-col gap-3 max-w-sm mx-auto w-full">
            <div class="flex flex-col gap-0.5">
              <label for="email" class="block text-xs border border-alt max-w-fit p-1">email:</label>
              <input
                id="email"
                v-model="email"
                type="email"
                placeholder="you@example.com"
                autocomplete="email"
                class="w-full px-4 py-2 border border-alt outline-0 focus:border-green"
                @input="handleEmailInput"
              />
              <div id="email-errors" class="text-red h-5 mt-0.5 text-xs">
                {{ allEmailErrors[0] }}
              </div>
            </div>

            <div class="flex flex-col gap-0.5">
              <label for="password" class="block text-xs border border-alt max-w-fit p-1">password:</label>
              <input
                id="password"
                v-model="password"
                type="password"
                required
                placeholder="••••••••"
                autocomplete="new-password"
                class="w-full px-4 py-2 border border-alt outline-0 focus:border-green"
                @input="markPasswordTouched"
              />
              <div class="text-red h-5 mt-0.5 text-xs">
                {{ allPasswordErrors[0] }}
              </div>
            </div>

            <div class="flex flex-col gap-0.5">
              <label for="confirm-password" class="block text-xs border border-alt max-w-fit p-1">confirm password:</label>
              <input
                id="confirm-password"
                v-model="confirmPassword"
                type="password"
                required
                placeholder="••••••••"
                autocomplete="new-password"
                class="w-full px-4 py-2 border border-alt outline-0 focus:border-green"
                @input="markConfirmPasswordTouched"
              />
              <div class="text-red h-5 mt-0.5 text-xs">
                <span v-if="confirmPasswordError !== ''">{{ confirmPasswordError }}</span>
              </div>
            </div>

            <div v-if="errorMessages.submit.length" class="p-2 border border-red text-red text-xs">
              {{ errorMessages.submit[0] }}
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full py-2 px-4 bg-green text-white border border-green cursor-pointer font-mono tracking-wide text-xs hover:bg-alt hover:text-primary hover:border-alt transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {{ loading ? 'creating account...' : '▸ SIGN UP' }}
            </button>
          </form>

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

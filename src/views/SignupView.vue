<script setup lang="ts">
/*** libraries ****/
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useDebounceFn } from '@vueuse/core'
import { apiClient } from '@/lib/apiClient'
/*** components ****/
/*** stores ***/
/*** composables ****/
import { useUserByEmail, useUserSignup } from '@/composables/useUser'
import { useZod } from '@/composables/useZod'
/*** types ****/
/*** schemas ****/
import { SignupSchema } from '@/schemas/user/SignupSchema'

const router = useRouter()

const email = ref<string>('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const enableQuery = ref(false)
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
    duplicateEmails.value && duplicateEmails.value !== 0 ? ['This email is already in use.'] : []

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

const { isLoading, isPending, isError, data: duplicateEmails } = useUserByEmail(email, enableQuery)

const { data: signupData, isError: signupError, mutateAsync } = useUserSignup()

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
  if (zodValueorError.value.success && email.value.length > 0) {
    enableQuery.value = true
  } else {
    enableQuery.value = false
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
    router.push('/login')
  } catch (error) {
    errorMessages.value.submit.push('Failed to create account. Please try again.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen items-center justify-center py-3">
    <div class="w-full max-w-sm">
      <div class="rounded-lg p-8 border-dash">
        <div class="mb-8">
          <h1 class="font-title text-2xl mb-2">Create Navi Account</h1>
        </div>

        <form @submit.prevent="handleSignupSubmit" class="space-y-4">
          <div>
            <label for="email" class="block font-body text-sm mb-2">Email:</label>
            <input
              id="email"
              v-model="email"
              class="w-full px-4 py-2 border text-sm"
              type="email"
              placeholder="name@example.com"
              @input="handleEmailInput"
            />
            <div id="email-errors" class="text-red h-6 mt-1 text-xs">
              {{ allEmailErrors[0] }}
            </div>
          </div>
          <div>
            <label for="password" class="block font-body text-sm mb-2">Password:</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              placeholder="••••••••"
              class="w-full px-4 py-2 border text-sm"
              @input="markPasswordTouched"
            />
            <div id="password-errors" class="text-red h-8">
              <div class="mt-1 text-xs">
                {{ allPasswordErrors[0] }}
              </div>
            </div>
          </div>

          <div>
            <label for="confirm-password" cclass="block font-body text-sm mb-2"
              >Confirm password:</label
            >
            <input
              id="confirm-password"
              v-model="confirmPassword"
              type="password"
              required
              placeholder="••••••••"
              class="w-full px-4 py-2 border text-sm"
              @input="markConfirmPasswordTouched"
            />
            <div id="password-errors" class="text-red h-8">
              <div v-if="confirmPasswordError !== ''" class="mt-1 text-xs">
                {{ confirmPasswordError }}
              </div>
            </div>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 px-4 bg-alt text-primary rounded-lg font-body text-base focus:outline-none transition-transform disabled:opacity-50 disabled:cursor-not-allowed mt-6 cursor-pointer"
          >
            {{ loading ? 'creating account...' : 'Sign Up' }}
          </button>
        </form>

        <p class="mt-6 text-alt text-center font-body text-sm">
          already have an account?
          <RouterLink to="/login" class="hover:underline ml-1"> sign in </RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

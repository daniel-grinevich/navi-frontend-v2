<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { apiClient } from '@/lib/apiClient'
import { useDebounce } from '@/composables/useDebounce'
import { useEmails } from '@/composables/useEmails'
import type { Email } from '@/types/Email'

const email = ref<string>('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const { getEmails } = useEmails()

const BASE_URL = import.meta.env.VITE_BASE_URL

const { debounceValue: debouncedEmail, asyncResults: allEmails } = useDebounce<string, Email[]>(
  email,
  500,
  getEmails,
)
const { debounceValue: debouncedPassword } = useDebounce(password, 500)

const emailErrors = computed(() => {
  if (debouncedEmail.value?.length < 3) return true
  if (allEmails.value?.some((x) => x.email === debouncedEmail.value)) return true
  return false
})

const passwordErrors = computed(() => {
  if (debouncedPassword.value?.length < 3) return true
  return false
})

const handleSignupSubmit = async (e: Event) => {
  e.preventDefault()
  // TODO: Add password confirmation validation
  // TODO: Add password strength validation
  // TODO: Add email format validation
  // TODO: Redirect to home or dashboard after successful signup
  // TODO: Handle email verification flow
  await signUpNewUser()
}

const signUpNewUser = async () => {
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await apiClient('signup', {
      method: 'POST',
      body: JSON.stringify({ user: { email: email.value, password: password.value } }),
    })

    const data = await response.json()

    if (!response.ok) {
      errorMessage.value = data.error || 'Signup failed'
    } else {
      successMessage.value = 'Account created! Check your email to verify.'
    }
  } catch (err) {
    errorMessage.value = 'An unexpected error occurred'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-secondary flex items-center justify-center px-6 py-12">
    <div class="w-full max-w-sm">
      <div class="bg-primary/10 border-2 border-primary rounded-lg p-8">
        <div class="mb-8">
          <h1 class="font-title text-3xl text-primary mb-2">Create Account</h1>
          <p class="text-primary/70 font-body text-sm">join to start collecting ideas</p>
        </div>

        <div v-if="successMessage" class="mb-4 p-3 bg-shock-green/20 border border-shock-green rounded-lg">
          <p class="text-shock-green font-body text-sm">{{ successMessage }}</p>
        </div>
        <div v-if="errorMessage" class="mb-4 p-3 bg-pink/20 border border-pink rounded-lg">
          <p class="text-primary font-body text-sm">{{ errorMessage }}</p>
        </div>

        <form @submit.prevent="handleSignupSubmit" class="space-y-4">
          <div>
            <label for="email" class="block font-body text-sm text-primary mb-2">email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              placeholder="name@example.com"
              class="w-full px-4 py-2 bg-secondary border-2 border-primary rounded-lg text-primary placeholder-primary/40 font-body text-sm focus:outline-none focus:border-pink transition-all"
            />
          </div>
          <div v-if="emailErrors" class="text-primary font-body text-sm">Email Error</div>

          <div>
            <label for="password" class="block font-body text-sm text-primary mb-2">password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              placeholder="••••••••"
              class="w-full px-4 py-2 bg-secondary border-2 border-primary rounded-lg text-primary placeholder-primary/40 font-body text-sm focus:outline-none focus:border-pink transition-all"
            />
          </div>

          <div>
            <label for="confirm-password" class="block font-body text-sm text-primary mb-2"
              >confirm password</label
            >
            <input
              id="confirm-password"
              v-model="confirmPassword"
              type="password"
              required
              placeholder="••••••••"
              class="w-full px-4 py-2 bg-secondary border-2 border-primary rounded-lg text-primary placeholder-primary/40 font-body text-sm focus:outline-none focus:border-pink transition-all"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-primary text-secondary py-3 px-4 rounded-lg font-body text-base hover:scale-105 focus:outline-none transition-transform disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {{ loading ? 'creating account...' : 'Sign Up' }}
          </button>
        </form>

        <p class="mt-6 text-center font-body text-sm text-primary/70">
          already have an account?
          <RouterLink to="/login" class="text-primary hover:underline ml-1"> sign in </RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

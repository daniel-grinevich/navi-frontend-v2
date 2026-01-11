<script setup lang="ts">
/*** libraries ****/
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { apiClient } from '@/lib/apiClient'
import { refDebounced, useDebounceFn } from '@vueuse/core'
import z from 'zod'
/*** components ****/
/*** stores ***/
/*** composables ****/
import { useZod } from '@/composables/useZod'
/*** types ****/
/*** schemas ****/
import { SignupSchema } from '@/schemas/user/SignupSchema'

const email = ref<string>('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)

const signupFields = computed(() => {
  console.log('sign up fields updated')
  return { email: email.value, password: password.value }
})

const { zodValueorError } = useZod(signupFields, SignupSchema)

const handleEmailInput = (event: InputEvent) => {
  email.value = event.data || ''
}

// only run this once the email has passed zod validation (no need to check for dups for invalid input)
const isEmailDuplicate = useDebounceFn(async (tmp_email: string) => {
  //pseudo code for now imagine it hits the backend but for now return false..
  return false
}, 1000)

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

  try {
    const response = await apiClient('signup', {
      method: 'POST',
      body: JSON.stringify({ user: { email: email.value, password: password.value } }),
    })

    const data = await response.json()

    if (!response.ok) {
    } else {
      // successMessage.value = 'Account created! Check your email to verify.'
    }
  } catch (err) {
    // errorMessages.value.push('An unexpected error occurred')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screenflex items-center justify-center px-6 py-12">
    <div class="w-full max-w-sm">
      <div class="bg-primary/10 border-2 rounded-lg p-8">
        <div class="mb-8">
          <h1 class="font-title text-3xl mb-2">Create Account</h1>
          <p class="text-primary/70 font-body text-sm">join to start collecting ideas</p>
        </div>

        <div class="mb-4 p-3 bg-shock-green/20 border border-shock-green rounded-lg">
          <p class="text-shock-green font-body text-sm"></p>
        </div>

        <form @submit.prevent="handleSignupSubmit" class="space-y-4">
          <div>
            <label for="email" class="block font-body text-smmb-2">email</label>
            <input
              id="email"
              class="w-full px-4 py-2 border-2rounded-lg placeholder-primary/40 font-body text-sm"
              type="email"
              placeholder="name@example.com"
              @input="handleEmailInput"
            />
          </div>
          <div>
            <label for="password" class="block font-body text-smmb-2">password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              placeholder="••••••••"
              class="w-full px-4 py-2 placeholder-primary/40 font-body text-sm"
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
              class="w-full px-4 py-2 placeholder-primary/40 font-body text-sm"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 px-4 rounded-lg font-body text-base hover:scale-105 focus:outline-none transition-transform disabled:opacity-50 disabled:cursor-not-allowed mt-6"
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

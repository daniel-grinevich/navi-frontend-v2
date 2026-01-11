<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useApiWrite } from '@/composables/useApi'
import { useSessionStore } from '@/stores/session'
import LoadingSpinnerTwo from '@/components/shared/LoadingSpinnerTwo.vue'
import { apiClient } from '@/lib/apiClient'
import { LoginSchema } from '@/schemas/user/LoginSchema'

const sessionStore = useSessionStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const loginErrorMessage = ref('')
const fieldErrors = ref({})

const { mutateAsync, isPending } = useApiWrite<
  { access: string; refresh: string },
  Error,
  { email: string; password: string }
>((userData) => apiClient('api/token/', { method: 'POST', body: JSON.stringify(userData) }), {
  onSuccess: (responseData: { access: string; refresh: string }) => {
    sessionStore.session = {
      accessToken: responseData.access,
      refreshToken: responseData.refresh,
    }
    sessionStore.getUser()
    loading.value = false
    router.push('/')
  },
  onError: (err: Error) => {
    loginErrorMessage.value = err.message
    loading.value = false
  },
})

const handleLoginSubmit = async (e: Event) => {
  loading.value = true
  loginErrorMessage.value = ''
  const formData = { email: email.value, password: password.value }
  const result = LoginSchema.safeParse(formData)

  if (!result.success) {
    loginErrorMessage.value = result.error.message
    loading.value = false
  } else {
    await mutateAsync(formData)
  }
}
</script>

<template>
  <div class="flex p-6 flex-row">
    <div class="flex-1 h-full">
      <div v-if="loading || isPending">
        <LoadingSpinnerTwo />
      </div>
    </div>
    <div class="flex-1 border h-full">
      <form @submit.prevent="handleLoginSubmit" class="p-3 flex flex-col gap-3">
        <div class="flex flex-col gap-0.5">
          <label for="email" class="block text-xs border max-w-fit p-1">email:</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="you@example.com"
            autocomplete="email"
            class="w-full px-4 py-2 border outline-0 focus:border-blue-600"
          />
        </div>
        <div class="flex flex-col gap-0.5">
          <label for="password" class="block text-xs border max-w-fit p-1">password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="••••••••"
            autocomplete="current-password"
            class="w-full px-4 py-2 border outline-0 focus:border-blue-600"
          />
        </div>

        <div v-if="loginErrorMessage" class="mb-4 p-3 border rounded-xl">
          <p class="text-red-400 text-xs font-light">{{ loginErrorMessage }}</p>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2 px-4 font-light text-white bg-slate-900 transition-all border cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed mt-6 text-xs"
        >
          {{ loading ? 'signing in...' : 'sign in' }}
        </button>
      </form>

      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t"></div>
        </div>
        <div class="relative flex justify-center text-xs">
          <span class="px-3 bg-slate-900 text-white">or</span>
        </div>
      </div>

      <p class="text-center text-xs">
        don't have an account?
        <RouterLink to="/signup"> sign up</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/session'
import { cartFormOptions } from '@/schemas/form/CartOptions'

const router = useRouter()
const session = useSessionStore()

const form = useForm({
  ...cartFormOptions,
  onSubmit: async ({ value }) => {
    const response = await session.createGuest(value.guestEmail)

    const redirect = response?.redirect || null
    if (redirect === null) {
      session.setGuestEmail(value.guestEmail)
      router.push({ name: 'checkout' })
      return
    }

    router.push({ name: redirect, query: { reason: 'auth-required' } })
  },
})
</script>

<template>
  <form @submit.prevent.stop="form.handleSubmit()" class="text-xs">
    <div
      :class="[
        'px-3 py-1 border-b font-mono',
        form.state.isTouched && !form.state.isValid
          ? 'border-red bg-red text-primary'
          : 'border-alt font-secondary text-alt',
      ]"
    >
      {{ form.state.isTouched && !form.state.isValid ? '⚠ email required' : '// guest email' }}
    </div>
    <div class="px-3 py-3">
      <span class="text-alt text-xs">enter your email so we can send you your receipt</span>
      <form.Field name="guestEmail">
        <template #default="{ field, state }">
          <input
            :value="field.state.value"
            @input="(e: Event) => field.handleChange((e.target as HTMLInputElement).value)"
            @blur="field.handleBlur"
            type="email"
            placeholder="your@email.com"
            :class="[
              'w-full px-3 py-2 mt-2 border bg-transparent text-xs font-mono focus:outline-none',
              state.meta.errors.length ? 'border-red' : 'border-alt',
            ]"
          />
          <p v-if="state.meta.errors.length" class="text-red text-xs mt-3 px-2 py-2 border border-red">
            {{ state.meta.errors[0] }}
          </p>
        </template>
      </form.Field>
    </div>
    <div class="px-3 pb-3">
      <button
        type="submit"
        :disabled="!form.state.isValid && form.state.isTouched"
        class="group px-3 py-2 border border-alt cursor-pointer font-mono tracking-wide hover:bg-green hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <span class="text-green group-hover:text-primary">▸</span> CONTINUE AS GUEST
      </button>
    </div>
  </form>
</template>

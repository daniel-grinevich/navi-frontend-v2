<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/session'
import { validateEmail } from '@/schemas/form/CartOptions'

const props = defineProps<{
  prefillEmail?: string
}>()

const emit = defineEmits<{
  cancel: []
}>()

const router = useRouter()
const session = useSessionStore()

const form = useForm({
  defaultValues: {
    guestEmail: props.prefillEmail || '',
  },
  onSubmit: async ({ value }) => {
    const response = await session.createGuest(value.guestEmail)

    if (response?.redirect) {
      router.push({ name: response.redirect, query: { reason: 'auth-required' } })
      return
    }

    session.setGuestEmail(value.guestEmail)
  },
})
</script>

<template>
  <form @submit.prevent.stop="form.handleSubmit()" class="text-xs">
    <form.Field
      name="guestEmail"
      :validators="{
        onBlur: ({ value }: { value: string }) => validateEmail(value),
        onSubmit: ({ value }: { value: string }) => validateEmail(value),
      }"
    >
      <template #default="{ field, state }">
        <div
          :class="[
            'px-3 py-1 border-b font-mono',
            state.meta.errors.length
              ? 'border-red bg-red text-primary'
              : 'border-alt font-secondary text-alt',
          ]"
        >
          {{ state.meta.errors.length ? '⚠ EMAIL REQUIRED' : '// guest email' }}
        </div>
        <div class="px-3 py-3">
          <span class="text-alt text-xs">enter your email so we can send you your receipt</span>
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
        </div>
      </template>
    </form.Field>
    <div class="px-3 pb-3 flex gap-3">
      <button
        type="submit"
        class="group px-3 py-2 border border-alt cursor-pointer font-mono tracking-wide hover:bg-green hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <span class="text-green group-hover:text-primary">▸</span> {{ prefillEmail ? 'UPDATE EMAIL' : 'CONTINUE AS GUEST' }}
      </button>
      <button
        v-if="prefillEmail"
        type="button"
        @click="emit('cancel')"
        class="px-3 py-2 border border-alt cursor-pointer font-mono tracking-wide hover:bg-alt hover:text-primary transition-colors"
      >
        [cancel]
      </button>
    </div>
  </form>
</template>

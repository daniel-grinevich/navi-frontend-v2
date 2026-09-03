<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { isOAuthEnabled, startOAuth } from '@/lib/oauth'
import { useSessionStore } from '@/stores/session'
import { useMagicLinkRequest, useSmsRequest, useSmsVerify } from '@/composables/usePasswordless'

// `next`: where to land after sign-in. `verb`: "Continue" (default) or e.g.
// "Sign up", so the same block reads naturally on login vs signup.
const props = withDefaults(defineProps<{ next?: string; verb?: string }>(), {
  next: '/menu',
  verb: 'Continue',
})

const router = useRouter()
const sessionStore = useSessionStore()

// Which provider panel is expanded inline. null = show the button list.
type Panel = null | 'email' | 'phone'
const panel = ref<Panel>(null)

// --- Email magic link ---
const email = ref('')
const emailSent = ref(false)
const { mutateAsync: requestMagicLink, isPending: emailPending } = useMagicLinkRequest()
const emailValid = computed(() => /.+@.+\..+/.test(email.value))

const submitEmail = async () => {
  if (!emailValid.value) return
  await requestMagicLink({ email: email.value })
  emailSent.value = true
}

// --- Phone SMS code ---
const phone = ref('')
const code = ref('')
const codeSent = ref(false)
const smsError = ref('')
const { mutateAsync: requestSms, isPending: smsRequestPending } = useSmsRequest()
const { mutateAsync: verifySms, isPending: smsVerifyPending } = useSmsVerify()
const phoneValid = computed(() => phone.value.replace(/\D/g, '').length >= 7)

const submitPhone = async () => {
  smsError.value = ''
  if (!phoneValid.value) return
  await requestSms({ phone: phone.value })
  codeSent.value = true
}

const submitCode = async () => {
  smsError.value = ''
  if (!code.value) return
  try {
    await verifySms({ phone: phone.value, code: code.value })
  } catch {
    smsError.value = 'That code is invalid or has expired. Try again.'
    return
  }
  await sessionStore.initAuth()
  router.push(props.next)
}

const open = (next: Panel) => {
  panel.value = next
  smsError.value = ''
}

const back = () => {
  panel.value = null
  emailSent.value = false
  codeSent.value = false
  smsError.value = ''
}

const btn =
  'w-full py-2 px-4 bg-white text-ink border border-alt cursor-pointer font-mono tracking-wide ' +
  'text-xs hover:border-green transition-colors flex items-center justify-center gap-2 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed'
</script>

<template>
  <div class="flex flex-col gap-3 max-w-sm mx-auto w-full">
    <div class="flex items-center gap-2 text-alt">
      <span class="flex-1 border-t border-alt"></span>
      <span class="text-xs">or {{ verb.toLowerCase() }} with</span>
      <span class="flex-1 border-t border-alt"></span>
    </div>

    <!-- Provider list -->
    <template v-if="panel === null">
      <button v-if="isOAuthEnabled" type="button" @click="startOAuth('google', next)" :class="btn">
        <span aria-hidden="true">▸</span> {{ verb.toUpperCase() }} WITH GOOGLE
      </button>
      <button type="button" @click="open('email')" :class="btn">
        <span aria-hidden="true">▸</span> {{ verb.toUpperCase() }} WITH EMAIL
      </button>
      <button type="button" @click="open('phone')" :class="btn">
        <span aria-hidden="true">▸</span> {{ verb.toUpperCase() }} WITH PHONE
      </button>
    </template>

    <!-- Email magic link panel -->
    <template v-else-if="panel === 'email'">
      <div v-if="emailSent" class="border border-green text-green text-xs p-2 text-center">
        ✓ Check your inbox — we sent a sign-in link to {{ email }}.
      </div>
      <form v-else @submit.prevent="submitEmail" class="flex flex-col gap-2">
        <input
          v-model="email"
          type="email"
          placeholder="you@example.com"
          autocomplete="email"
          class="w-full px-4 py-2 border border-alt outline-0 focus:border-green"
        />
        <button type="submit" :disabled="!emailValid || emailPending" :class="btn">
          {{ emailPending ? 'sending...' : '▸ EMAIL ME A SIGN-IN LINK' }}
        </button>
      </form>
      <button type="button" @click="back" class="text-xs text-alt hover:text-green cursor-pointer">
        ← other options
      </button>
    </template>

    <!-- Phone SMS panel -->
    <template v-else>
      <form v-if="!codeSent" @submit.prevent="submitPhone" class="flex flex-col gap-2">
        <input
          v-model="phone"
          type="tel"
          placeholder="+1 555 123 4567"
          autocomplete="tel"
          class="w-full px-4 py-2 border border-alt outline-0 focus:border-green"
        />
        <button type="submit" :disabled="!phoneValid || smsRequestPending" :class="btn">
          {{ smsRequestPending ? 'sending...' : '▸ TEXT ME A CODE' }}
        </button>
      </form>

      <form v-else @submit.prevent="submitCode" class="flex flex-col gap-2">
        <div class="text-xs text-alt text-center">Enter the 6-digit code sent to {{ phone }}.</div>
        <input
          v-model="code"
          type="text"
          inputmode="numeric"
          maxlength="6"
          placeholder="123456"
          autocomplete="one-time-code"
          class="w-full px-4 py-2 border border-alt outline-0 focus:border-green text-center tracking-[0.5em]"
        />
        <button type="submit" :disabled="!code || smsVerifyPending" :class="btn">
          {{ smsVerifyPending ? 'verifying...' : '▸ VERIFY & SIGN IN' }}
        </button>
      </form>

      <div v-if="smsError" class="p-2 border border-red text-red text-xs">{{ smsError }}</div>
      <button type="button" @click="back" class="text-xs text-alt hover:text-green cursor-pointer">
        ← other options
      </button>
    </template>
  </div>
</template>

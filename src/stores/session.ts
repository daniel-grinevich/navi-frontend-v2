import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'

export const useSessionStore = defineStore('user', () => {
  const session = ref<Session | null>(null)
  const user = ref<User | null>(null)

  const isAuthenticated = computed(() => !!user.value && !!session.value)

  const initAuth = async () => {
    const {
      data: { session: savedSession },
    } = await supabase.auth.getSession()

    if (savedSession) {
      session.value = savedSession
      user.value = savedSession.user
    }

    supabase.auth.onAuthStateChange((_event, newSession) => {
      session.value = newSession
      user.value = newSession?.user ?? null
    })
  }

  // token access, refresh, (?user obj?)
  return {
    session,
    user,
    isAuthenticated,
    initAuth,
  }
})

import { supabase } from '@/lib/supabaseClient'
import { useAsyncState } from '@vueuse/core'

export const useLogout = () => {
  const { state, isLoading, isReady, error, execute, executeImmediate } = useAsyncState(
    async () => {
      const { error } = await supabase.auth.signOut({ scope: 'local' })
      return error || ''
    },
    '',
    { immediate: false },
  )

  return {
    state,
    isLoading,
    isReady,
    error,
    execute,
    executeImmediate,
  }
}

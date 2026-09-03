import { watch } from 'vue'
import { storeToRefs } from 'pinia'
import { apiClient } from '@/lib/apiClient'
import { useApi } from './useApi'
import { useSessionStore } from '@/stores/session'
import { useAchievementsStore } from '@/stores/achievements'
import type {
  AchievementDefinition,
  AchievementProgressRow,
} from '@/types/achievements'

/**
 * Hydrates the achievements store from the backend: the public definitions
 * endpoint plus (for authenticated users) their server-computed progress.
 * Guests get no progress call, so the store falls back to its local tracking.
 * Call once from a component that shows achievements (e.g. HomeView).
 */
export const useAchievementsSync = () => {
  const session = useSessionStore()
  const { isAuthenticated } = storeToRefs(session)
  const store = useAchievementsStore()

  const definitions = useApi<AchievementDefinition[]>(['achievements'], () =>
    apiClient<AchievementDefinition[]>('api/achievements/', { method: 'GET' }),
  )

  const progress = useApi<AchievementProgressRow[]>(
    ['achievements', 'progress'],
    () =>
      apiClient<AchievementProgressRow[]>('api/achievements/progress/', {
        method: 'GET',
      }),
    { enabled: isAuthenticated },
  )

  watch(
    definitions.data,
    (defs) => {
      if (defs) store.setServerDefinitions(defs)
    },
    { immediate: true },
  )

  watch(
    progress.data,
    (rows) => {
      if (rows) store.setServerProgress(rows)
    },
    { immediate: true },
  )

  // When the user logs out, drop server progress back to local tracking.
  watch(isAuthenticated, (authed) => {
    if (!authed) store.clearServerProgress()
  })

  return { definitions, progress }
}

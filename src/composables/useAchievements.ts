import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { apiClient } from '@/lib/apiClient'
import { useApi } from './useApi'
import { useSessionStore } from '@/stores/session'
import { ACHIEVEMENT_PROGRESS_FIXTURE, lockedProgress } from '@/fixtures/achievementProgress'
import type { AchievementProgress, AchievementProgressResponse } from '@/types/achievements'

export const ACHIEVEMENT_PROGRESS_KEY = ['achievements', 'progress'] as const

// Backend icon slugs → the PixelIcon sprites we have.
export type BadgeSprite = 'coffee' | 'star' | 'crown' | 'bean' | 'heart'
const SPRITES: Record<string, BadgeSprite> = {
  coffee: 'coffee',
  star: 'star',
  heart: 'heart',
  crown: 'crown',
  bean: 'bean',
  sparkles: 'star',
  sliders: 'bean',
  compass: 'bean',
  wallet: 'crown',
}
export const badgeSprite = (icon: string): BadgeSprite => SPRITES[icon] ?? 'star'

export const isEarned = (a: AchievementProgress) => a.level > 0
export const isMaxed = (a: AchievementProgress) => a.level >= a.max_level

// Progress towards the next level as current/target; maxed badges read as full.
export const badgeProgress = (a: AchievementProgress) => {
  const target = a.next_threshold ?? a.levels[a.levels.length - 1]?.threshold ?? a.current_value
  const current = Math.min(a.current_value, target)
  return { current, target, fraction: target > 0 ? current / target : 1 }
}

/**
 * Achievement progress for the signed-in user (GET /api/my/achievements/progress/).
 * Signed-out visitors get the locked catalog; in dev, a failed request falls
 * back to the contract fixture so the UI can still be worked on.
 */
export const useAchievementProgress = () => {
  const session = useSessionStore()
  const { isAuthenticated } = storeToRefs(session)

  const query = useApi<AchievementProgressResponse>(
    ACHIEVEMENT_PROGRESS_KEY,
    () => apiClient<AchievementProgressResponse>('api/my/achievements/progress/', { method: 'GET' }),
    { enabled: isAuthenticated },
  )

  const isFixture = computed(() => !query.data.value && query.isError.value && import.meta.env.DEV)
  const isGuest = computed(() => !isAuthenticated.value)

  const progress = computed<AchievementProgressResponse | null>(() => {
    if (isGuest.value) return lockedProgress()
    if (query.data.value) return query.data.value
    if (isFixture.value) return ACHIEVEMENT_PROGRESS_FIXTURE
    return null
  })

  const summary = computed(() => progress.value?.summary ?? null)
  const badges = computed(() => progress.value?.results ?? [])

  // The badge closest to its next level: what the NEXT ▸ line points at.
  const nextBadge = computed<AchievementProgress | null>(() => {
    let best: AchievementProgress | null = null
    let bestFraction = -1
    for (const b of badges.value) {
      if (isMaxed(b)) continue
      const { fraction } = badgeProgress(b)
      if (fraction > bestFraction) {
        best = b
        bestFraction = fraction
      }
    }
    return best
  })

  return {
    ...query,
    isGuest,
    isFixture,
    summary,
    badges,
    nextBadge,
  }
}

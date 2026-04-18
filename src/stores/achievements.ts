import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { type CartItem } from '@/types/cart'

export type AchievementMetric = 'orders' | 'uniqueDrinks' | 'customizations'
export type AchievementIcon = 'coffee' | 'star' | 'crown' | 'bean' | 'heart'

export type Achievement = {
  id: string
  label: string
  desc: string
  target: number
  metric: AchievementMetric
  icon: AchievementIcon
}

export const ACHIEVEMENTS: readonly Achievement[] = [
  {
    id: 'first_sip',
    label: 'FIRST SIP',
    desc: 'Place your first order',
    target: 1,
    metric: 'orders',
    icon: 'coffee',
  },
  {
    id: 'master_barista',
    label: 'MASTER BARISTA',
    desc: 'Customize a drink',
    target: 1,
    metric: 'customizations',
    icon: 'star',
  },
  {
    id: 'connoisseur',
    label: 'CONNOISSEUR',
    desc: 'Try 3 different drinks',
    target: 3,
    metric: 'uniqueDrinks',
    icon: 'bean',
  },
  {
    id: 'regular',
    label: 'REGULAR',
    desc: 'Place 5 orders',
    target: 5,
    metric: 'orders',
    icon: 'heart',
  },
  {
    id: 'loyal',
    label: 'LOYAL',
    desc: 'Place 10 orders',
    target: 10,
    metric: 'orders',
    icon: 'crown',
  },
] as const

export const useAchievementsStore = defineStore('achievements', () => {
  const ordersPlaced = useStorage<number>('achievements-orders-placed', 0, localStorage)
  const uniqueDrinkIds = useStorage<string[]>('achievements-unique-drinks', [], localStorage)
  const customizationsUsed = useStorage<number>(
    'achievements-customizations-used',
    0,
    localStorage,
  )

  const metricValue = (metric: AchievementMetric): number => {
    switch (metric) {
      case 'orders':
        return ordersPlaced.value
      case 'uniqueDrinks':
        return uniqueDrinkIds.value.length
      case 'customizations':
        return customizationsUsed.value
    }
  }

  const progressFor = (achievement: Achievement) => {
    const current = Math.min(metricValue(achievement.metric), achievement.target)
    return { current, target: achievement.target }
  }

  const isUnlocked = (achievement: Achievement) =>
    metricValue(achievement.metric) >= achievement.target

  const unlocked = computed(() => {
    const set = new Set<string>()
    for (const a of ACHIEVEMENTS) {
      if (isUnlocked(a)) set.add(a.id)
    }
    return set
  })

  const nextAchievement = computed<Achievement | null>(() => {
    for (const a of ACHIEVEMENTS) {
      if (!isUnlocked(a)) return a
    }
    return null
  })

  const nextProgress = computed(() => {
    const next = nextAchievement.value
    if (!next) return null
    return progressFor(next)
  })

  const recordOrderPlaced = (items: CartItem[]) => {
    ordersPlaced.value += 1

    const existing = new Set(uniqueDrinkIds.value)
    for (const item of items) {
      if (!existing.has(item.menuItemId)) {
        existing.add(item.menuItemId)
      }
    }
    uniqueDrinkIds.value = Array.from(existing)

    const customizationCount = items.reduce(
      (acc, item) => acc + item.customizations.length,
      0,
    )
    customizationsUsed.value += customizationCount
  }

  const reset = () => {
    ordersPlaced.value = 0
    uniqueDrinkIds.value = []
    customizationsUsed.value = 0
  }

  return {
    ordersPlaced,
    uniqueDrinkIds,
    customizationsUsed,
    unlocked,
    nextAchievement,
    nextProgress,
    progressFor,
    isUnlocked,
    recordOrderPlaced,
    reset,
  }
})

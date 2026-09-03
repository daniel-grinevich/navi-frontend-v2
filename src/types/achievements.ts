// Shapes returned by the backend achievements compat endpoints
// (GET /api/achievements/ and /api/achievements/progress/).

export type AchievementDefinition = {
  id: string
  label: string
  desc: string
  target: number
  // Backend metric string, e.g. 'orders' | 'unique_drinks' | 'customizations'.
  metric: string
  icon: string
}

export type AchievementProgressRow = {
  id: string
  current: number
  target: number
  unlocked: boolean
  unlocked_at: string | null
}

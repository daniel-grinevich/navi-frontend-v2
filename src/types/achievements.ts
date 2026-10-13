// Shapes returned by GET /api/my/achievements/progress/
// (contract: navi-workspace/jobs/CONTRACT_achievements.md).

export type LoyaltyTier = {
  slug: string
  name: string
  min_points: number
}

export type AchievementSummary = {
  points: number
  tier: LoyaltyTier
  // null at the top tier.
  next_tier: LoyaltyTier | null
  badges_earned: number
  badges_total: number
}

export type AchievementLevel = {
  level: number
  name: string
  threshold: number
  earned_at: string | null
}

export type AchievementProgress = {
  id: string
  slug: string
  name: string
  description: string
  category: string
  icon: string
  // 0 = not earned yet.
  level: number
  max_level: number
  current_value: number
  // 0 when level is 0.
  prev_threshold: number
  // null when level === max_level.
  next_threshold: number | null
  unit: string
  // When the current level was earned; null at level 0.
  earned_at: string | null
  levels: AchievementLevel[]
}

export type AchievementProgressResponse = {
  summary: AchievementSummary
  results: AchievementProgress[]
}

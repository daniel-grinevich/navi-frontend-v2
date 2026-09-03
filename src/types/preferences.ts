export type ThemePreference = 'system' | 'light' | 'dark'

export type UserPreferences = {
  theme: ThemePreference
  language: string
  email_account: boolean
  email_order_updates: boolean
  email_marketing: boolean
  email_rewards: boolean
  sms_account: boolean
  sms_order_updates: boolean
  sms_marketing: boolean
  sms_rewards: boolean
  // Server-computed: true only when a real SMS backend is configured.
  sms_available: boolean
  updated_at: string
}

// The toggle keys the user can flip, split by channel.
export type NotificationPrefKey =
  | 'email_account'
  | 'email_order_updates'
  | 'email_marketing'
  | 'email_rewards'
  | 'sms_account'
  | 'sms_order_updates'
  | 'sms_marketing'
  | 'sms_rewards'

export type UserPreferencesUpdate = Partial<
  Omit<UserPreferences, 'sms_available' | 'updated_at'>
>

export type NotificationKind = 'email' | 'sms'

export type NotificationLogMeta = {
  subject?: string
  template?: string | null
  message?: string
  skipped?: boolean
} | null

type NotificationLogBase = {
  id: string
  reason: string
  sent_at: string
  error: string
  meta: NotificationLogMeta
  // null = skipped (opted out), true = sent, false = failed.
  is_sent: boolean | null
  kind: NotificationKind
}

export type EmailLog = NotificationLogBase & { recipient: string }

export type TextLog = NotificationLogBase & { recipient: number }

export type EmailTemplate = {
  id: string
  subject: string
  body: string
  link: string
}

export type EmailTemplateInput = {
  subject: string
  body: string
  link: string
}

export type NotificationChannel = 'email' | 'sms'

export type NotificationCategory = 'account' | 'order_updates' | 'marketing' | 'rewards'

// Global kill switches layered above user preferences.
export type NotificationSettings = {
  channels: Record<NotificationChannel, boolean>
  categories: Record<NotificationCategory, boolean>
  updated_at: string
  updated_by: string | null
}

export type NotificationSettingsPatch = {
  channels?: Partial<Record<NotificationChannel, boolean>>
  categories?: Partial<Record<NotificationCategory, boolean>>
}

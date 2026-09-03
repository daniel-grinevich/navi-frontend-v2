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

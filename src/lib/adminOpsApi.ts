import { apiClient } from '@/lib/apiClient'

/**
 * Where an admin-ops feature talks to. The notification controls (J3) and the
 * device fleet (J4) ship from separate backends until merged, so each one can
 * be pointed somewhere different:
 *
 *   VITE_ADMIN_NOTIFICATIONS_API / VITE_ADMIN_DEVICES_API
 *     unset       -> the normal VITE_BASE_URL backend
 *     "fixtures"  -> in-memory fixtures (no backend needed)
 *     <url>       -> that backend, e.g. http://localhost:8004
 */
export type AdminOpsSource = { kind: 'live'; baseUrl?: string } | { kind: 'fixtures' }

const resolveSource = (raw: string | undefined): AdminOpsSource => {
  const value = raw?.trim()
  if (value === 'fixtures') return { kind: 'fixtures' }
  return { kind: 'live', baseUrl: value || undefined }
}

export const notificationsSource = resolveSource(import.meta.env.VITE_ADMIN_NOTIFICATIONS_API)
export const devicesSource = resolveSource(import.meta.env.VITE_ADMIN_DEVICES_API)

type ClientOptions = Parameters<typeof apiClient>[1]

export const liveClient =
  (source: AdminOpsSource) =>
  <T>(endpoint: string, options: ClientOptions = {}) =>
    apiClient<T>(endpoint, {
      ...options,
      ...(source.kind === 'live' && source.baseUrl ? { baseUrl: source.baseUrl } : {}),
    })

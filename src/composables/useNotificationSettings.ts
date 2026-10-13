import { useQueryClient } from '@tanstack/vue-query'
import { useApi, useApiWrite } from './useApi'
import { liveClient, notificationsSource } from '@/lib/adminOpsApi'
import { fixtureNotificationSettings } from '@/fixtures/adminOps'
import type { NotificationSettings, NotificationSettingsPatch } from '@/types/notifications'

const SETTINGS_KEY = ['admin-notification-settings']
const ENDPOINT = 'api/admin/notification-settings/'

const client = liveClient(notificationsSource)
const useFixtures = notificationsSource.kind === 'fixtures'

const fetchSettings = () =>
  useFixtures
    ? fixtureNotificationSettings.get()
    : client<NotificationSettings>(ENDPOINT, { method: 'GET' })

const patchSettings = (body: NotificationSettingsPatch) =>
  useFixtures
    ? fixtureNotificationSettings.patch(body)
    : client<NotificationSettings>(ENDPOINT, { method: 'PATCH', body: JSON.stringify(body) })

export const useNotificationSettings = () => useApi(SETTINGS_KEY, fetchSettings)

/**
 * PATCH a subset of the global switches. The cache is updated optimistically so
 * the toggle flips immediately, and rolled back if the server rejects it.
 */
type Rollback = { previous?: NotificationSettings }

export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient()

  return useApiWrite<NotificationSettings, Error, NotificationSettingsPatch, Rollback>(patchSettings, {
    onMutate: async (patch: NotificationSettingsPatch): Promise<Rollback> => {
      await queryClient.cancelQueries({ queryKey: SETTINGS_KEY })
      const previous = queryClient.getQueryData<NotificationSettings>(SETTINGS_KEY)
      if (previous) {
        queryClient.setQueryData<NotificationSettings>(SETTINGS_KEY, {
          ...previous,
          channels: { ...previous.channels, ...patch.channels },
          categories: { ...previous.categories, ...patch.categories },
        })
      }
      return { previous }
    },
    onError: (_error: Error, _patch: NotificationSettingsPatch, context: Rollback | undefined) => {
      if (context?.previous) queryClient.setQueryData(SETTINGS_KEY, context.previous)
    },
    onSuccess: (data: NotificationSettings) => {
      queryClient.setQueryData(SETTINGS_KEY, data)
    },
  })
}

import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import { useApi, useApiWrite } from './useApi'
import { devicesSource, liveClient } from '@/lib/adminOpsApi'
import { fixtureDevices } from '@/fixtures/adminOps'
import type {
  Device,
  DeviceCreateInput,
  DeviceCreated,
  DeviceEvent,
  DeviceList,
  DeviceTestOrder,
  DeviceUpdateInput,
} from '@/types/devices'

const DEVICES_KEY = ['admin-devices']

const client = liveClient(devicesSource)
const useFixtures = devicesSource.kind === 'fixtures'

export type DeviceFilters = { is_online?: boolean; search?: string }

const api = {
  list: (filters: DeviceFilters) => {
    if (useFixtures) return fixtureDevices.list(filters)
    const queryParams: Record<string, string | boolean> = {}
    if (filters.is_online !== undefined) queryParams.is_online = filters.is_online
    if (filters.search) queryParams.search = filters.search
    return client<DeviceList>('api/admin/devices/', {
      method: 'GET',
      queryParams: Object.keys(queryParams).length ? queryParams : undefined,
    })
  },
  get: (id: string) =>
    useFixtures ? fixtureDevices.get(id) : client<Device>(`api/admin/devices/${id}/`, { method: 'GET' }),
  create: (body: DeviceCreateInput) =>
    useFixtures
      ? fixtureDevices.create(body)
      : client<DeviceCreated>('api/admin/devices/', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: DeviceUpdateInput) =>
    useFixtures
      ? fixtureDevices.update(id, body)
      : client<Device>(`api/admin/devices/${id}/`, { method: 'PATCH', body: JSON.stringify(body) }),
  rotateToken: (id: string) =>
    useFixtures
      ? fixtureDevices.rotateToken(id)
      : client<{ device_token: string }>(`api/admin/devices/${id}/rotate-token/`, { method: 'POST' }),
  testOrder: (id: string, menuItemId?: string) =>
    useFixtures
      ? fixtureDevices.testOrder(id)
      : client<DeviceTestOrder>(`api/admin/devices/${id}/test-order/`, {
          method: 'POST',
          body: JSON.stringify(menuItemId ? { menu_item_id: menuItemId } : {}),
        }),
  events: (id: string, limit: number) =>
    useFixtures
      ? fixtureDevices.events(id, limit)
      : client<{ results: DeviceEvent[] }>(`api/admin/devices/${id}/events/`, {
          method: 'GET',
          queryParams: { limit },
        }),
}

const LIST_POLL_MS = 10_000

export const useDevices = (filters: MaybeRefOrGetter<DeviceFilters>) =>
  useApi(
    computed(() => [...DEVICES_KEY, 'list', toValue(filters)]),
    () => api.list(toValue(filters)),
    // Keeps the online dots and "last seen" honest without a manual refresh.
    { refetchInterval: LIST_POLL_MS },
  )

export const useDevice = (id: MaybeRefOrGetter<string>) =>
  useApi(
    computed(() => [...DEVICES_KEY, 'detail', toValue(id)]),
    () => api.get(toValue(id)),
    { refetchInterval: LIST_POLL_MS },
  )

const EVENTS_POLL_MS = 3_000

/**
 * Live event log. Polls every 3s while `enabled` is true (the caller pauses it
 * when the tab is hidden); vue-query also skips background-tab refetches.
 */
export const useDeviceEvents = (
  id: MaybeRefOrGetter<string>,
  enabled: MaybeRefOrGetter<boolean>,
  limit = 50,
) =>
  useApi(
    computed(() => [...DEVICES_KEY, 'events', toValue(id), limit]),
    () => api.events(toValue(id), limit).then((r) => r.results),
    {
      refetchInterval: () => (toValue(enabled) ? EVENTS_POLL_MS : false),
      refetchIntervalInBackground: false,
    },
  )

const useInvalidateDevices = () => {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: DEVICES_KEY })
}

export const useCreateDevice = () => {
  const invalidate = useInvalidateDevices()
  return useApiWrite<DeviceCreated, Error, DeviceCreateInput>(api.create, { onSuccess: invalidate })
}

export const useUpdateDevice = () => {
  const invalidate = useInvalidateDevices()
  return useApiWrite<Device, Error, { id: string } & DeviceUpdateInput>(
    ({ id, ...body }) => api.update(id, body),
    { onSuccess: invalidate },
  )
}

export const useRotateDeviceToken = () => {
  const invalidate = useInvalidateDevices()
  return useApiWrite<{ device_token: string }, Error, string>(api.rotateToken, {
    onSuccess: invalidate,
  })
}

export const useSendTestOrder = () => {
  const invalidate = useInvalidateDevices()
  return useApiWrite<DeviceTestOrder, Error, { id: string; menuItemId?: string }>(
    ({ id, menuItemId }) => api.testOrder(id, menuItemId),
    { onSuccess: invalidate },
  )
}

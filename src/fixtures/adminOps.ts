/**
 * In-memory stand-ins for the admin-ops endpoints (notification controls and
 * device fleet), shaped exactly like the API contract. Used when
 * VITE_ADMIN_NOTIFICATIONS_API / VITE_ADMIN_DEVICES_API is set to "fixtures"
 * so the screens can be built and demoed without the J3/J4 backends.
 *
 * Errors are thrown as ApiError with a JSON-stringified body, matching what
 * apiClient throws for a non-2xx response.
 */
import ApiError from '@/lib/apiError'
import type {
  NotificationCategory,
  NotificationChannel,
  NotificationSettings,
  NotificationSettingsPatch,
} from '@/types/notifications'
import type {
  Device,
  DeviceCreateInput,
  DeviceCreated,
  DeviceEvent,
  DeviceEventType,
  DeviceList,
  DeviceTestOrder,
  DeviceUpdateInput,
} from '@/types/devices'

const LATENCY_MS = 250

const delay = <T>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), LATENCY_MS))

const fail = (status: number, body: unknown): Promise<never> =>
  new Promise((_, reject) =>
    setTimeout(() => reject(new ApiError(status, JSON.stringify(body))), LATENCY_MS),
  )

const uuid = () => crypto.randomUUID()

const randomToken = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(24)), (b) => b.toString(16).padStart(2, '0')).join('')

const isoAgo = (ms: number) => new Date(Date.now() - ms).toISOString()

// --- Notification settings ---------------------------------------------------

const CHANNELS: NotificationChannel[] = ['email', 'sms']
const CATEGORIES: NotificationCategory[] = ['account', 'order_updates', 'marketing', 'rewards']

const settings: NotificationSettings = {
  channels: { email: true, sms: false },
  categories: { account: true, order_updates: true, marketing: false, rewards: true },
  updated_at: isoAgo(1000 * 60 * 60 * 3),
  updated_by: 'admin@navi.coffee',
}

export const fixtureNotificationSettings = {
  get: () => delay(settings),

  patch: (body: NotificationSettingsPatch) => {
    const unknownChannels = Object.keys(body.channels ?? {}).filter(
      (k) => !CHANNELS.includes(k as NotificationChannel),
    )
    const unknownCategories = Object.keys(body.categories ?? {}).filter(
      (k) => !CATEGORIES.includes(k as NotificationCategory),
    )
    if (unknownChannels.length) {
      return fail(400, { channels: [`unknown channel: ${unknownChannels.join(', ')}`] })
    }
    if (unknownCategories.length) {
      return fail(400, { categories: [`unknown category: ${unknownCategories.join(', ')}`] })
    }
    if (body.categories?.account === false) {
      return fail(400, { categories: ['account notifications cannot be disabled'] })
    }

    Object.assign(settings.channels, body.channels)
    Object.assign(settings.categories, body.categories)
    settings.updated_at = new Date().toISOString()
    settings.updated_by = 'you@fixtures.local'
    return delay(settings)
  },
}

// --- Device fleet -----------------------------------------------------------

type ScheduledEvent = { deviceId: string; event: DeviceEvent }

const devices: Device[] = [
  {
    id: uuid(),
    name: 'Lobby Pi',
    slug: 'lobby-pi',
    mac_address: 'dc:a6:32:00:00:01',
    location: 'HQ lobby',
    enabled: true,
    is_online: true,
    last_seen: isoAgo(4000),
    firmware_version: '0.4.1',
    is_simulated: false,
    navi_port: { id: uuid(), name: 'HQ Lobby' },
    espresso_machine: {
      id: uuid(),
      serial_number: 'SN123',
      machine_type: 'Jura X8',
      is_online: true,
    },
  },
  {
    id: uuid(),
    name: 'Sim Pi #1',
    slug: 'sim-pi-1',
    mac_address: '02:00:00:00:00:01',
    location: 'docker',
    enabled: true,
    is_online: true,
    last_seen: isoAgo(9000),
    firmware_version: '0.4.2-sim',
    is_simulated: true,
    navi_port: { id: uuid(), name: 'Sim Port' },
    espresso_machine: null,
  },
  {
    id: uuid(),
    name: 'Basement Pi',
    slug: 'basement-pi',
    mac_address: 'dc:a6:32:00:00:07',
    location: 'Warehouse B1',
    enabled: false,
    is_online: false,
    last_seen: isoAgo(1000 * 60 * 60 * 26),
    firmware_version: '0.3.9',
    is_simulated: false,
    navi_port: null,
    espresso_machine: null,
  },
]

// Events carry their own timestamp; ones in the future are "scheduled" and only
// surface once their time has passed. That lets a test order play out
// claim -> brew -> complete over a few polls without any timers.
const events: ScheduledEvent[] = []

const pushEvent = (
  deviceId: string,
  type: DeviceEventType,
  message: string,
  payload: Record<string, unknown> | null = null,
  atMs = Date.now(),
) => {
  events.push({
    deviceId,
    event: { id: uuid(), type, message, payload, created_at: new Date(atMs).toISOString() },
  })
}

for (const d of devices) {
  if (d.is_online) pushEvent(d.id, 'connected', `${d.name} connected`, null, Date.now() - 1000 * 60 * 42)
  else pushEvent(d.id, 'disconnected', `${d.name} disconnected`, null, Date.parse(d.last_seen!))
}

const HEARTBEAT_MS = 10_000

// Online + enabled devices "ping" on read so last_seen keeps moving.
const tick = (d: Device) => {
  if (!d.is_online || !d.enabled || !d.last_seen) return
  const since = Date.now() - Date.parse(d.last_seen)
  if (since < HEARTBEAT_MS) return
  d.last_seen = new Date().toISOString()
  pushEvent(d.id, 'heartbeat', 'heartbeat', { uptime_s: Math.floor(performance.now() / 1000) })
}

const findDevice = (id: string) => devices.find((d) => d.id === id)

const notFound = () => fail(404, { detail: 'Not found.' })

export const fixtureDevices = {
  list: (params: { is_online?: boolean; search?: string } = {}): Promise<DeviceList> => {
    devices.forEach(tick)
    let results = devices
    if (params.is_online !== undefined) {
      results = results.filter((d) => d.is_online === params.is_online)
    }
    if (params.search) {
      const q = params.search.toLowerCase()
      results = results.filter((d) =>
        [d.name, d.slug, d.mac_address, d.location].some((v) => v.toLowerCase().includes(q)),
      )
    }
    return delay({ count: results.length, next: null, previous: null, results })
  },

  get: (id: string) => {
    const d = findDevice(id)
    if (!d) return notFound()
    tick(d)
    return delay(d)
  },

  create: (body: DeviceCreateInput): Promise<DeviceCreated> => {
    if (!body.name?.trim()) return fail(400, { name: ['This field is required.'] })
    if (!/^([0-9a-f]{2}:){5}[0-9a-f]{2}$/i.test(body.mac_address ?? '')) {
      return fail(400, { mac_address: ['Enter a valid MAC address.'] })
    }
    if (devices.some((d) => d.mac_address.toLowerCase() === body.mac_address.toLowerCase())) {
      return fail(400, { mac_address: ['device with this mac address already exists.'] })
    }
    const device: Device = {
      id: uuid(),
      name: body.name.trim(),
      slug: body.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      mac_address: body.mac_address.toLowerCase(),
      location: body.location ?? '',
      enabled: true,
      is_online: false,
      last_seen: null,
      firmware_version: null,
      is_simulated: body.is_simulated ?? false,
      navi_port: body.navi_port_id ? { id: body.navi_port_id, name: 'Assigned port' } : null,
      espresso_machine: null,
    }
    devices.push(device)
    return delay({ ...device, device_token: randomToken() })
  },

  update: (id: string, body: DeviceUpdateInput) => {
    const d = findDevice(id)
    if (!d) return notFound()
    if (body.name !== undefined) d.name = body.name
    if (body.location !== undefined) d.location = body.location
    if (body.enabled !== undefined) {
      d.enabled = body.enabled
      if (!body.enabled && d.is_online) {
        d.is_online = false
        pushEvent(d.id, 'disconnected', `${d.name} disabled by admin`)
      }
    }
    return delay(d)
  },

  rotateToken: (id: string) => {
    const d = findDevice(id)
    if (!d) return notFound()
    pushEvent(d.id, 'token_rotated', 'device token rotated; old token revoked')
    return delay({ device_token: randomToken() })
  },

  testOrder: (id: string): Promise<DeviceTestOrder> => {
    const d = findDevice(id)
    if (!d) return notFound()
    if (!d.navi_port) {
      return fail(400, { detail: 'Device has no NaviPort assigned.' })
    }
    const order_id = uuid()
    const qr_token = randomToken()
    const now = Date.now()
    pushEvent(d.id, 'test_order', 'test order queued', { order_id }, now)
    // Only a live device plays out the rest of the loop.
    if (d.is_online && d.enabled) {
      pushEvent(d.id, 'order_claimed', 'order claimed via QR scan', { order_id }, now + 5000)
      pushEvent(d.id, 'brew_started', 'brew started', { order_id, recipe: 'espresso' }, now + 7000)
      pushEvent(d.id, 'brew_completed', 'brew completed', { order_id, duration_s: 9 }, now + 16000)
    }
    return delay({ order_id, qr_token })
  },

  events: (id: string, limit = 50) => {
    const d = findDevice(id)
    if (!d) return notFound()
    tick(d)
    const now = Date.now()
    const results = events
      .filter((e) => e.deviceId === id && Date.parse(e.event.created_at) <= now)
      .map((e) => e.event)
      .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
      .slice(0, limit)
    return delay({ results })
  },
}

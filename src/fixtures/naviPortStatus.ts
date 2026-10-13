import ApiError from '@/lib/apiError'
import type { NaviPortStatus } from '@/types/NaviPort'

// Contract fixtures for the NaviPort deep link (J11). Enabled in dev with
// VITE_NAVI_PORT_FIXTURE=true so the landing page can be built without the
// backend. Any other slug behaves like a 404.
const address = { line1: '1 Main St', city: 'Boston', state: 'MA', postal_code: '02110' }

export const naviPortStatusFixtures: Record<string, NaviPortStatus> = {
  'hq-lobby': {
    id: '65065f88-e474-4c8d-a22b-e50254fd49c5',
    slug: 'hq-lobby',
    name: 'HQ Lobby',
    address,
    is_online: true,
    accepting_orders: true,
    status_message: null,
    queue_length: 2,
    est_wait_seconds: 180,
    menu_item_ids: null,
  },
  'hq-paused': {
    id: '0b9f3c55-3f0e-4c6b-9a7e-3d1f6a2b8c11',
    slug: 'hq-paused',
    name: 'HQ Kitchen',
    address,
    is_online: true,
    accepting_orders: false,
    status_message: 'Out of milk — back at 2pm',
    queue_length: 0,
    est_wait_seconds: 0,
    menu_item_ids: [],
  },
  'hq-offline': {
    id: '7d2e9a10-5c4b-4f8e-8a6d-2b1c0e9f7a33',
    slug: 'hq-offline',
    name: 'HQ Rooftop',
    address,
    is_online: false,
    accepting_orders: false,
    status_message: null,
    queue_length: 0,
    est_wait_seconds: 0,
    menu_item_ids: null,
  },
}

export const fetchNaviPortStatusFixture = async (slug: string): Promise<NaviPortStatus> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  const port = naviPortStatusFixtures[slug]
  if (!port) {
    throw new ApiError(404, JSON.stringify({ error: { code: 404, message: 'Not found.' } }))
  }
  return port
}

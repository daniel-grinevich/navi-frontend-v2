export type NaviPort = {
  id: string
  name: string
  slug: string
  created_at?: Date
  created_by?: Date
  updated_at?: Date
  updated_by?: Date
  raspberry_pi?: number
  espresso_machine?: number
  longitude: number
  latitude: number
  address_line_1: string
  address_line_2: string
  address_line_3: string
  city: string
  state_or_region: string
  postal_code: string
}

export type NormalizedNaviPort = NaviPort & {
  address: {
    road: string
    city: string
    state: string
    postcode: string
  }
  distance: string
}

// Public availability snapshot from `GET /api/navi_ports/by-slug/{slug}/`,
// used by the QR walk-up landing page.
export type NaviPortStatus = {
  id: string
  slug: string
  name: string
  address: {
    line1: string
    city: string
    state: string
    postal_code: string
  }
  is_online: boolean
  // Admin flag AND is_online.
  accepting_orders: boolean
  // Admin-set text shown when not accepting orders.
  status_message: string | null
  queue_length: number
  est_wait_seconds: number
  // Drinks this machine can make; null means no restriction.
  menu_item_ids: string[] | null
}

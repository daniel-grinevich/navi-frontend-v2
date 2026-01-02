export type NaviPort = {
  id: number
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
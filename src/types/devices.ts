export type DeviceNaviPort = {
  id: string
  name: string
}

export type DeviceEspressoMachine = {
  id: string
  serial_number: string
  machine_type: string
  is_online: boolean
}

export type Device = {
  id: string
  name: string
  slug: string
  mac_address: string
  location: string
  // Maps to RaspberryPi.is_connected on the backend.
  enabled: boolean
  is_online: boolean
  last_seen: string | null
  firmware_version: string | null
  is_simulated: boolean
  navi_port: DeviceNaviPort | null
  espresso_machine: DeviceEspressoMachine | null
}

export type DeviceList = {
  count: number
  next: string | null
  previous: string | null
  results: Device[]
}

export type DeviceCreateInput = {
  name: string
  mac_address: string
  location: string
  navi_port_id?: string
  is_simulated?: boolean
}

// The plaintext token is only ever returned here and from rotate-token.
export type DeviceCreated = Device & { device_token: string }

export type DeviceUpdateInput = {
  name?: string
  location?: string
  enabled?: boolean
  navi_port_id?: string
}

export type DeviceEventType =
  | 'connected'
  | 'disconnected'
  | 'heartbeat'
  | 'order_claimed'
  | 'brew_started'
  | 'brew_completed'
  | 'brew_failed'
  | 'token_rotated'
  | 'test_order'

export type DeviceEvent = {
  id: string
  type: DeviceEventType
  message: string
  payload: Record<string, unknown> | null
  created_at: string
}

export type DeviceTestOrder = {
  order_id: string
  qr_token: string
}

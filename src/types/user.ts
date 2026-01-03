export type User = {
  id: string
  name: string
  email: string
  stripe_customer_id: string
  date_joined: Date
  is_guest: boolean
}

export type Session = {
  accessToken: string
  refreshToken: string
}

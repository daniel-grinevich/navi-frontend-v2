import * as z from 'zod'

export const CartSchema = z.object({
  guestEmail: z.email().min(1, { message: 'You must be logged in or provide an email! (◡︵◡)' }),
  itemCount: z.number().min(0).max(10),
})

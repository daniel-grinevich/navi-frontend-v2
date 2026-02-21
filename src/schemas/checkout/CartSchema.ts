import * as z from 'zod'

export const CartSchema = z.object({
  guestEmail: z.email(),
  itemCount: z.number().min(0).max(10),
})

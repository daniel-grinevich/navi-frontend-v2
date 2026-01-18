import * as z from 'zod'

export const SignupSchema = z.object({
  email: z.email(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .refine((val) => /[a-z]/.test(val), {
      message: 'Password must contain a lowercase letter',
    })
    .refine((val) => /[A-Z]/.test(val), {
      message: 'Password must contain an uppercase letter',
    })
    .refine((val) => /[0-9]/.test(val), {
      message: 'Password must contain a number',
    })
    .refine((val) => /[^A-Za-z0-9]/.test(val), {
      message: 'Password must contain a special character',
    }),
})

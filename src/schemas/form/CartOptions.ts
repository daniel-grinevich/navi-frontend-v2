import { formOptions } from '@tanstack/vue-form'

const validateEmail = (email: string): string | undefined => {
  if (!email) return 'You must be logged in or provide an email! (◡︵◡)'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return 'Please enter a valid email address'
  return undefined
}

export const cartFormOptions = formOptions({
  defaultValues: {
    guestEmail: '',
  },
})

export { validateEmail }

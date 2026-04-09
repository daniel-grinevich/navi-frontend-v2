import { formOptions } from '@tanstack/vue-form'

export const cartFormOptions = formOptions({
  defaultValues: {
    guestEmail: '',
  },
  validators: {
    onBlur: ({ value }) => {
      if (!value.guestEmail) {
        return {
          fields: {
            guestEmail: 'You must be logged in or provide an email! (◡︵◡)',
          },
        }
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value.guestEmail)) {
        return {
          fields: {
            guestEmail: 'Please enter a valid email address',
          },
        }
      }

      return undefined
    },
  },
})

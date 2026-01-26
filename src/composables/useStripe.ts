import { loadStripe, type Stripe } from '@stripe/stripe-js'

export const useStripe = () => {
  let stripePromise: Promise<Stripe | null> | null = null

  const getStripe = () => {
    if (!stripePromise) {
      stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
    }
    return stripePromise
  }

  return {
    getStripe,
  }
}

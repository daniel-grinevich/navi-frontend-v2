import { useStripe } from './useStripe'

// Shared Stripe card capture: mount the split card fields, then confirm a
// PaymentIntent against them. Extracted so the admin manual-order flow and
// (eventually) customer checkout can share one implementation.
export const useCardPayment = () => {
  const { getStripe } = useStripe()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cardElement: any = null

  const cardStyle = () => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    return {
      base: {
        color: isDark ? '#f4f4f0' : '#1a1a1a',
        fontFamily: "'Courier New', Courier, monospace",
        fontSize: '12px',
        '::placeholder': { color: isDark ? '#999999' : '#666666' },
      },
      invalid: { color: '#e03c31' },
    }
  }

  const mountCardFields = async (
    ids: { number: string; expiry: string; cvc: string } = {
      number: '#card-number',
      expiry: '#card-expiry',
      cvc: '#card-cvc',
    },
  ) => {
    const stripe = await getStripe()
    if (!stripe) throw new Error('Stripe failed to load')

    const elements = stripe.elements()
    const style = cardStyle()
    const cardNumber = elements.create('cardNumber', { style })
    const cardExpiry = elements.create('cardExpiry', { style })
    const cardCvc = elements.create('cardCvc', { style })

    cardNumber.mount(ids.number)
    cardExpiry.mount(ids.expiry)
    cardCvc.mount(ids.cvc)

    cardElement = cardNumber
  }

  const confirmCard = async (clientSecret: string) => {
    const stripe = await getStripe()
    if (!stripe || !cardElement) {
      return { error: { message: 'Card form is not ready.' } }
    }
    return stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement },
    })
  }

  return { mountCardFields, confirmCard }
}

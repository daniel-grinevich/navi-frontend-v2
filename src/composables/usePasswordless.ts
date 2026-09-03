import { apiClient } from '@/lib/apiClient'
import { useApiWrite } from './useApi'

// Request a magic sign-in link by email. The backend always responds 200 (it
// won't reveal whether the email has an account), so success just means "sent".
export const useMagicLinkRequest = () => {
  return useApiWrite<unknown, Error, { email: string }>(
    async ({ email }) =>
      await apiClient('api/auth/magic/request/', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
  )
}

// Request a one-time SMS code. Also always 200 to avoid leaking valid numbers.
export const useSmsRequest = () => {
  return useApiWrite<unknown, Error, { phone: string }>(
    async ({ phone }) =>
      await apiClient('api/auth/sms/request/', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      }),
  )
}

// Verify the SMS code. On success the backend sets the auth cookies (empty
// body); a bad/expired code returns 400 and this rejects.
export const useSmsVerify = () => {
  return useApiWrite<unknown, Error, { phone: string; code: string }>(
    async ({ phone, code }) =>
      await apiClient('api/auth/sms/verify/', {
        method: 'POST',
        body: JSON.stringify({ phone, code }),
        credentials: 'include',
      }),
  )
}

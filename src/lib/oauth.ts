// Social sign-in is handled by a full-page redirect to the backend, which runs
// the OAuth handshake with the provider and, on success, sets the SAME httpOnly
// session cookies as password login before redirecting the browser back to
// `next`. On return the app reloads and App.vue's initAuth() picks up the
// session automatically — so there's nothing to parse or store on this side.
//
// `??` (not `||`) mirrors apiClient: an explicitly-empty VITE_BASE_URL stays
// empty so the request is relative and the dev-server proxy can handle it.
const API_BASE_URL = import.meta.env.VITE_BASE_URL ?? 'http://localhost:8000'

// Feature flag: keep the buttons hidden until the backend OAuth endpoints are
// live. Flip VITE_OAUTH_ENABLED to "true" in the relevant .env file to show them.
export const isOAuthEnabled = import.meta.env.VITE_OAUTH_ENABLED === 'true'

export type OAuthProvider = 'google'

// Kicks off provider sign-in. `next` is where the backend should send the user
// back to once the session cookies are set (defaults to the menu).
export function startOAuth(provider: OAuthProvider, next = '/menu') {
  window.location.href =
    `${API_BASE_URL}/api/oauth/${provider}/start/?next=${encodeURIComponent(next)}`
}

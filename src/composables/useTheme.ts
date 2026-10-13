import { ref } from 'vue'

// Live light/dark switching. All theme colors are defined with CSS light-dark()
// (see base.css), so we only need to force `color-scheme` on <html> via a
// data-theme attribute and everything flips — no per-component styling.

type Theme = 'light' | 'dark'
const STORAGE_KEY = 'navi-theme'

function getInitialTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  // No saved choice yet -> follow the OS preference.
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function apply(value: Theme) {
  document.documentElement.setAttribute('data-theme', value)
}

// Module-level singleton so every component shares one source of truth.
const theme = ref<Theme>(getInitialTheme())

// Call once, before mount, to avoid a flash of the wrong theme.
export function initTheme() {
  apply(theme.value)
}

export function useTheme() {
  const setTheme = (value: Theme) => {
    theme.value = value
    localStorage.setItem(STORAGE_KEY, value)
    apply(value)
  }

  const toggleTheme = () => setTheme(theme.value === 'dark' ? 'light' : 'dark')

  return { theme, setTheme, toggleTheme }
}

// Light-mode "look" being trialled (see LOOKS in base.css). ?look=loose or
// ?look=integrated picks one; it sticks for the tab so it survives in-app
// navigation, and ?look=bone (or any other value) goes back to the default.
type Look = 'loose' | 'integrated'
const LOOK_KEY = 'navi-look'
const LOOKS: readonly Look[] = ['loose', 'integrated']

export function initLook() {
  let look: string | null = null
  try {
    const param = new URLSearchParams(window.location.search).get('look')
    if (param !== null) sessionStorage.setItem(LOOK_KEY, param)
    look = param ?? sessionStorage.getItem(LOOK_KEY)
  } catch {
    // Storage can be unavailable (private mode); the query param still works.
    look = new URLSearchParams(window.location.search).get('look')
  }
  if (look && (LOOKS as readonly string[]).includes(look)) {
    document.documentElement.setAttribute('data-look', look)
  } else {
    document.documentElement.removeAttribute('data-look')
  }
}

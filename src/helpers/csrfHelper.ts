export const getCsrfCookie = (name = 'csrftoken') => {
  if (typeof document === 'undefined') return '' // SSR / Node safety

  let cookieValue = ''
  const cookieStr = document.cookie

  if (!cookieStr) return ''

  const cookies = cookieStr.split(';')
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i]!.trim()
    // cookie looks like: "csrftoken=abc123"
    if (cookie.startsWith(name + '=')) {
      cookieValue = decodeURIComponent(cookie.slice(name.length + 1))
      break
    }
  }

  return cookieValue
}

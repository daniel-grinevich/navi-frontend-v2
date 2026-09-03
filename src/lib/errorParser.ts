const GENERIC_MESSAGE = 'Something went wrong. Please try again.'

/**
 * Extract a human-readable message from an error thrown by `apiClient`.
 *
 * `apiClient` stringifies the backend response body into the thrown error's
 * `.message`, so a Django REST framework error arrives here as a JSON string
 * like `{"detail":"..."}` or `{"items":["..."]}`. This parses it back and pulls
 * out the most relevant message, falling back gracefully when the shape is
 * unexpected or the message isn't JSON at all.
 */
export function getApiErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) return GENERIC_MESSAGE

  const raw = error.message?.trim()
  if (!raw) return GENERIC_MESSAGE

  let body: unknown
  try {
    body = JSON.parse(raw)
  } catch {
    // Not JSON — the message is already a plain string.
    return raw
  }

  return extractFromBody(body) ?? raw
}

function extractFromBody(body: unknown): string | null {
  if (typeof body === 'string') return body

  if (Array.isArray(body)) {
    return firstMessage(body)
  }

  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>

    // DRF's standard non-field error shapes.
    const detail = firstMessage(record.detail)
    if (detail) return detail

    const nonField = firstMessage(record.non_field_errors)
    if (nonField) return nonField

    // Field errors, e.g. { items: ["..."], navi_port: ["..."] }.
    for (const [field, value] of Object.entries(record)) {
      const message = firstMessage(value)
      if (message) return `${field}: ${message}`
    }
  }

  return null
}

function firstMessage(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (Array.isArray(value)) {
    for (const entry of value) {
      const message = firstMessage(entry)
      if (message) return message
    }
  }
  return null
}

/**
 * Sanitizes an API-supplied URL before it is ever rendered into an `href`.
 *
 * Permits only `http:`, `https:`, and site-relative (`/...`) URL forms; returns
 * `null` for anything else, notably `javascript:` schemes and protocol-relative
 * (`//host/...`) URLs. React escapes text content but not URL schemes, so an
 * unsanitized anchor is an XSS vector (design safety note #1).
 *
 * Pure function, no `window`/`document` access — safe to call during SSR.
 */
export function safeHttpUrl(raw: string | null | undefined): string | null {
  if (typeof raw !== 'string') return null

  const trimmed = raw.trim()
  if (!trimmed) return null

  // Site-relative path: starts with a single '/', not a protocol-relative '//host' URL.
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return trimmed

  try {
    const url = new URL(trimmed)
    return url.protocol === 'http:' || url.protocol === 'https:' ? trimmed : null
  } catch {
    return null
  }
}

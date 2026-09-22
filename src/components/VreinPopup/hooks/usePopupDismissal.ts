'use client'

import { useCallback, useEffect, useState } from 'react'

export const SHOWONCE_KEY_PREFIX = 'vrein_popup_dismissed_v'
export const SHOWONCE_KEY_VERSION = 1
export const SHOWONCE_KEY = `${SHOWONCE_KEY_PREFIX}${SHOWONCE_KEY_VERSION}`

/**
 * Permanent, global (not per-section, not per-page) modal dismissal flag,
 * persisted in `localStorage` under `vrein_popup_dismissed_v1`.
 *
 * Only meaningful when `showOnce` is true (server already enforces
 * `showOnce = type === 'modal' && isFlagTrue(config.ShowOnce)` — this hook
 * never re-derives that gate, it only persists the outcome).
 *
 * Tri-state: `dismissed` is `null` until resolved inside `useEffect` (never a
 * `useState` lazy initializer) — SSR/hydration safety (D7). Every storage
 * access is guarded by `typeof window !== 'undefined'` AND `try/catch`; on
 * throw (e.g. Safari private mode) fails open to "not dismissed" without
 * crashing the page.
 */
export function usePopupDismissal(showOnce: boolean, section: string) {
  const [dismissed, setDismissed] = useState<boolean | null>(null)

  useEffect(() => {
    if (!showOnce) {
      setDismissed(false)
      return
    }

    if (typeof window === 'undefined') {
      setDismissed(false)
      return
    }

    try {
      setDismissed(window.localStorage.getItem(SHOWONCE_KEY) !== null)
    } catch {
      setDismissed(false)
    }
  }, [showOnce])

  const dismiss = useCallback(() => {
    setDismissed(true)

    if (!showOnce) return // ShowOnce off -> never persist
    if (typeof window === 'undefined') return

    try {
      window.localStorage.setItem(
        SHOWONCE_KEY,
        JSON.stringify({
          v: SHOWONCE_KEY_VERSION,
          dismissedAt: new Date().toISOString(),
          section,
        })
      )
    } catch {
      // worst case: modal reappears next load — matches Magento's fail-open behavior
    }
  }, [showOnce, section])

  return { dismissed, dismiss }
}

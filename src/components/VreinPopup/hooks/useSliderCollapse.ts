'use client'

import { useCallback, useEffect, useState } from 'react'

export const SLIDER_COLLAPSE_KEY = 'vrein_popup_slider_collapsed'

/**
 * Slider collapse UI state, persisted only in `sessionStorage` (per-tab, not
 * across a fresh page load) — the slider MUST NOT consult the ShowOnce/
 * dismissal gate at any point, and its collapse state MUST NOT survive a full
 * page reload (spec: "Slider collapse state is non-persistent").
 *
 * Tri-state: `collapsed` is `null` until resolved inside `useEffect` (never a
 * `useState` lazy initializer) — SSR/hydration safety (D7). Every storage
 * access is guarded by `typeof window !== 'undefined'` AND `try/catch`; on
 * throw, fails open to expanded (`false`) without crashing the page.
 */
export function useSliderCollapse() {
  const [collapsed, setCollapsedState] = useState<boolean | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') {
      setCollapsedState(false)
      return
    }

    try {
      setCollapsedState(window.sessionStorage.getItem(SLIDER_COLLAPSE_KEY) === '1')
    } catch {
      setCollapsedState(false)
    }
  }, [])

  const persist = useCallback((next: boolean) => {
    if (typeof window === 'undefined') return
    try {
      window.sessionStorage.setItem(SLIDER_COLLAPSE_KEY, next ? '1' : '0')
    } catch {
      // worst case: collapse toggle just won't persist across reload/tab this session
    }
  }, [])

  const toggle = useCallback(() => {
    setCollapsedState((prev) => {
      const next = !(prev ?? false)
      persist(next)
      return next
    })
  }, [persist])

  return { collapsed, toggle }
}

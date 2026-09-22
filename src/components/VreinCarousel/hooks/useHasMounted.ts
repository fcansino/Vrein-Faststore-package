'use client'

import { useEffect, useState } from 'react'

/**
 * Mount gate. Returns `false` on the server and on the first client render,
 * `true` thereafter. Used to defer any browser-only-dependent rendering until
 * after hydration, avoiding SSR/client markup mismatches (D7).
 */
export function useHasMounted(): boolean {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  return hasMounted
}

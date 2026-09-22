'use client'

import { useEffect, useState } from 'react'

const LOCATION_CHANGE_EVENT = 'vrein:locationchange'

let historyPatched = false

/**
 * Patches `history.pushState` / `history.replaceState` once, process-wide, so that
 * client-side SPA navigation (e.g. Next.js `router.push()` / `<Link>`) dispatches a
 * `vrein:locationchange` event in addition to whatever the original method already did.
 *
 * Deliberately never restored: a second consumer holding a reference to the patched
 * method would silently lose its listener if the patch were undone on unmount.
 */
function patchHistoryOnce(): void {
  if (historyPatched || typeof window === 'undefined') return
  historyPatched = true

  const methods = ['pushState', 'replaceState'] as const

  for (const method of methods) {
    const original = window.history[method]
    window.history[method] = function (this: History, ...args: Parameters<History[typeof method]>) {
      const result = original.apply(this, args as any)
      window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT))
      return result
    } as History[typeof method]
  }
}

export interface VreinLocation {
  pathname: string
  search: string
  key: string
}

const EMPTY_LOCATION: VreinLocation = { pathname: '', search: '', key: '' }

function readLocation(): VreinLocation {
  if (typeof window === 'undefined') return EMPTY_LOCATION
  const { pathname, search } = window.location
  return { pathname, search, key: pathname + search }
}

/**
 * SPA-aware location hook. Unlike a `popstate`-only listener, this also detects
 * client-side `history.pushState`/`replaceState` navigation (Next.js `router.push`,
 * `<Link>` clicks), which never fire `popstate`.
 *
 * Initializes to an empty location on the server and on the first client render —
 * the real value is resolved only inside `useEffect` (SSR/hydration safety, D7).
 *
 * Package-local, no `next/navigation` import: the package deliberately avoids a hard
 * Next.js runtime dependency (D6). A Next-runtime consumer can bypass this hook
 * entirely via the `routeKey` escape hatch on components that need one.
 */
export function useCurrentLocation(): VreinLocation {
  const [location, setLocation] = useState<VreinLocation>(EMPTY_LOCATION)

  useEffect(() => {
    patchHistoryOnce()

    const handleChange = () => setLocation(readLocation())

    handleChange()

    window.addEventListener('popstate', handleChange)
    window.addEventListener('hashchange', handleChange)
    window.addEventListener(LOCATION_CHANGE_EVENT, handleChange)

    return () => {
      window.removeEventListener('popstate', handleChange)
      window.removeEventListener('hashchange', handleChange)
      window.removeEventListener(LOCATION_CHANGE_EVENT, handleChange)
    }
  }, [])

  return location
}

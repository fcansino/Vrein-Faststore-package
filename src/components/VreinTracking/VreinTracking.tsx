'use client'

/**
 * VreinTracking - CMS section that loads the BrainDW/Vrein tracking script
 * from the CDN (s2.braindw.com). Place it in the CMS Global Section so it
 * loads on every page.
 *
 * The script lives on the CDN so it can be updated without asking the
 * client to redeploy.
 *
 * Events are captured directly from FastStore's analytics pipeline via
 * useAnalyticsEvent and forwarded to the tracking script through
 * window.__VREIN_PROCESS_EVENT. Events fired before the script finishes
 * loading are buffered and flushed once it is ready.
 */

import { useEffect, useRef } from 'react'

const VREIN_SCRIPT_ID = '__vrein_bdw_script__'

export type VreinDataLayerEvent = Record<string, unknown>

export interface VreinAnalyticsEvent {
  name: string
  params: unknown
}

/**
 * Signature of FastStore's useAnalyticsEvent hook (@faststore/sdk).
 * The hook is injected by the client wrapper instead of imported here:
 * @faststore/sdk is ESM-only (no "main"/"exports" fields), so requiring it
 * from this package's CJS dist crashes Next's externalized server bundles
 * with "Cannot find module '@faststore/sdk'".
 */
export type UseAnalyticsEventFn = (
  handler: (event: VreinAnalyticsEvent) => void
) => void

declare global {
  interface Window {
    __VREIN_CONFIG?: { hash: string }
    __VREIN_PROCESS_EVENT?: (event: VreinDataLayerEvent) => void
  }
}

export interface VreinTrackingProps {
  /** FastStore's useAnalyticsEvent hook, injected by the client wrapper. */
  useAnalyticsEventFn?: UseAnalyticsEventFn
}

// Stable no-op hook used when no analytics hook is injected.
// NOTE: the injected hook must be provided consistently across renders
// (always or never) to respect the Rules of Hooks.
const noopUseAnalyticsEvent: UseAnalyticsEventFn = () => {}

export function VreinTracking({ useAnalyticsEventFn }: VreinTrackingProps) {
  const vreinHash = process.env.NEXT_PUBLIC_VREIN_HASH ?? ''
  const buffer = useRef<VreinDataLayerEvent[]>([])

  const useAnalyticsEvent = useAnalyticsEventFn ?? noopUseAnalyticsEvent

  useAnalyticsEvent((event) => {
    const payload: VreinDataLayerEvent = {
      event: event.name,
      ecommerce: event.params as Record<string, unknown>,
    }
    if (window.__VREIN_PROCESS_EVENT) {
      window.__VREIN_PROCESS_EVENT(payload)
    } else {
      buffer.current.push(payload)
    }
  })

  useEffect(() => {
    if (!vreinHash || document.getElementById(VREIN_SCRIPT_ID)) return

    window.__VREIN_CONFIG = { hash: vreinHash }

    const cookieEnabled = (() => {
      try {
        return String(navigator.cookieEnabled)
      } catch {
        return 'false'
      }
    })()

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 9000)

    fetch(
      `https://s2.braindw.com/Script/braindw/${vreinHash}?browsercookie=${cookieEnabled}&hs=${Date.now()}`,
      {
        credentials: 'include',
        mode: 'cors',
        method: 'GET',
        signal: controller.signal,
      }
    )
      .then((r) => r.text())
      .then((scriptText) => {
        clearTimeout(timeout)
        const s = document.createElement('script')
        s.id = VREIN_SCRIPT_ID
        s.type = 'text/javascript'
        s.text = scriptText
        document.body.appendChild(s)

        if (window.__VREIN_PROCESS_EVENT) {
          buffer.current.forEach((e) => window.__VREIN_PROCESS_EVENT!(e))
          buffer.current = []
        }
      })
      .catch((e: Error) => {
        if (e.name === 'AbortError') {
          console.log('[Vrein] Fetch aborted (timeout)')
        } else {
          console.error('[Vrein] error loading tracking script', e)
        }
      })
  }, [vreinHash])

  return null
}

export default VreinTracking

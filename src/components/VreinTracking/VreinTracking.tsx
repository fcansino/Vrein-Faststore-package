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

import { useAnalyticsEvent } from '@faststore/sdk'
import { useEffect, useRef } from 'react'

const VREIN_SCRIPT_ID = '__vrein_bdw_script__'

export type VreinDataLayerEvent = Record<string, unknown>

declare global {
  interface Window {
    __VREIN_CONFIG?: { hash: string }
    __VREIN_PROCESS_EVENT?: (event: VreinDataLayerEvent) => void
  }
}

export interface VreinTrackingProps {}

export function VreinTracking(_props: VreinTrackingProps) {
  const vreinHash = process.env.NEXT_PUBLIC_VREIN_HASH ?? ''
  const buffer = useRef<VreinDataLayerEvent[]>([])

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

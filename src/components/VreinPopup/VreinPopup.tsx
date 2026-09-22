'use client'

import React, { useEffect, useState } from 'react'
import { useCurrentLocation, useHasMounted, useVreinContext } from '../VreinCarousel/hooks'
import { resolvePopupSection } from './popupSection'
import { usePopupDismissal, useSliderCollapse, useVreinPopup } from './hooks'
import { VreinPopupModal } from './VreinPopupModal'
import { VreinPopupSlider } from './VreinPopupSlider'
import type { VreinPopupProps } from './VreinPopup.types'

/**
 * Root orchestrator. `'use client'`.
 *
 * Returns `null` on the server and on the first client render — before
 * `hasMounted` flips `true`, `VreinPopupMounted` (and every hook it calls,
 * including the reused `useVreinContext`, which still reads `window` inside
 * a `useState` lazy initializer) is never even instantiated. This keeps the
 * "no browser API access before mount" guarantee literal, not just about the
 * final rendered output: nothing in this tree touches `window`, `document`,
 * `localStorage`, or `sessionStorage` until a render pass that only happens
 * after mount.
 */
export const VreinPopup = (props: VreinPopupProps) => {
  const hasMounted = useHasMounted()

  if (!hasMounted) return null

  return <VreinPopupMounted {...props} />
}

/**
 * Render-gate order (design D7 / spec "SSR-safe mounting") — never reorder.
 * Only mounted after `VreinPopup` confirms `hasMounted`, so every gate below
 * depends only on state resolved inside `useEffect`:
 *
 *   1. !section                                 -> null (fail-closed, popup-section-mapping)
 *   2. loading || !data                         -> null (no skeleton for an overlay/fixed element)
 *   3. type === 'modal'  && dismissed !== false  -> null (unknown or already-dismissed)
 *   4. type === 'slider' && collapsed === null   -> null (wait for storage state before painting)
 *
 * `dismissed` and `collapsed` are resolved here, not inside VreinPopupModal /
 * VreinPopupSlider, because this component must gate on their values before
 * ever mounting either presentation — see the exact render contract in
 * design D7.
 */
function VreinPopupMounted({
  useQueryFn,
  vreinPopupDocument,
  cartId, // accepted for API parity with VreinCarouselProps; not wired to metrics (spec non-goal: no GA/analytics consumption for the popup)
  sectionOverride,
  routeKey,
  excludedPaths = [],
}: VreinPopupProps) {
  const location = useCurrentLocation()
  const effectiveKey = routeKey ?? location.key
  const excludedPathsKey = JSON.stringify(excludedPaths)

  const [section, setSection] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const pathname = window.location.pathname
    const isExcluded = excludedPaths.some((prefix) => prefix && pathname.startsWith(prefix))

    setSection(isExcluded ? null : resolvePopupSection(sectionOverride))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveKey, sectionOverride, excludedPathsKey])

  const context = useVreinContext(section ?? '', undefined)

  const { data, loading } = useVreinPopup(useQueryFn, vreinPopupDocument, {
    section,
    context,
  })

  const type = data?.type ?? null
  const showOnce = data?.showOnce ?? false

  const { dismissed, dismiss } = usePopupDismissal(showOnce, section ?? '')
  const { collapsed, toggle } = useSliderCollapse()

  if (!section) return null
  if (loading || !data) return null
  if (type === 'modal' && dismissed !== false) return null
  if (type === 'slider' && collapsed === null) return null

  if (type === 'modal') {
    return <VreinPopupModal data={data} section={section} onClose={dismiss} />
  }

  if (type === 'slider') {
    return (
      <VreinPopupSlider
        data={data}
        section={section}
        collapsed={collapsed ?? false}
        onToggle={toggle}
      />
    )
  }

  return null
}

export default VreinPopup

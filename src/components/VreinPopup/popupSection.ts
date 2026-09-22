import type { PageType } from '../VreinCarousel/VreinCarousel.types'
import type { PopupSection } from '../../types/vrein'
import { detectPageType } from '../VreinCarousel/hooks/useVreinContext'

const PAGE_TYPE_TO_SECTION: Record<PageType, PopupSection> = {
  home: 'HOME',
  product: 'PDP',
  category: 'PLP',
  search: 'SEARCH',
  searchnoresult: 'SEARCH',
}

const POPUP_SECTION_QUERY_PARAM = 'vrein_popup_section'

/**
 * Resolves the current FastStore page into the uppercase SECTION vocabulary the
 * BrainDW backend expects.
 *
 * Fails closed to `null` on SSR and for any page type outside the mapping table.
 * `cart` and `checkout` are not reachable as mountable React routes in this
 * storefront (cart is a minicart slide-over; checkout is served outside the
 * Next application by VTEX) and therefore ship unmapped by design, not by
 * omission — see spec `popup-section-mapping`.
 *
 * `override` (the `sectionOverride` prop) and the `?vrein_popup_section=` query
 * param both bypass the mapping table entirely and are used verbatim, uppercased.
 * This is a QA/consumer-only escape hatch, never merchant-facing (D8) — the CMS
 * schema for this section stays empty so merchants never see it.
 */
export function resolvePopupSection(override?: string): string | null {
  if (typeof window === 'undefined') return null

  const queryOverride = new URLSearchParams(window.location.search).get(POPUP_SECTION_QUERY_PARAM)
  const forced = (override && override.trim()) || (queryOverride && queryOverride.trim())

  if (forced) return forced.toUpperCase()

  return PAGE_TYPE_TO_SECTION[detectPageType()] ?? null
}

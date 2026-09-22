import type { QueryExecutor } from '../../sdk/types'
import type { PopupSection } from '../../types/vrein'

export type VreinPopupProps = {
  /** Injected FastStore useQuery executor (persisted-query path) */
  useQueryFn: QueryExecutor
  /** Injected document from @generated/graphql (VreinPopupQueryDocument) */
  vreinPopupDocument: unknown
  /** Cart id from useCart(), for metrics parity with VreinCarouselProps.cartId */
  cartId?: string
  /**
   * QA escape hatch; also settable via `?vrein_popup_section=PDP`. Mirrors
   * Magento's `section_override`. Bypasses the page-type mapping table
   * entirely and is used verbatim, uppercased. Never merchant-facing — the
   * CMS schema for this section stays empty.
   */
  sectionOverride?: PopupSection | string
  /**
   * Optional SPA route key (e.g. `usePathname() + search` in a Next app).
   * When provided, overrides the package's internal `history`-patch-based
   * navigation detection for re-resolving the section on client-side nav.
   */
  routeKey?: string
  /**
   * Path prefixes where the popup must never render, matched against
   * `window.location.pathname`. Mitigation for the PLP fail-open documented
   * in design decision D8 (content routes falling through to `category`).
   */
  excludedPaths?: string[]
}

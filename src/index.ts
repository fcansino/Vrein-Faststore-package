// Components
export { VreinCarousel } from './components/VreinCarousel/VreinCarousel'
export { VreinImageBanner } from './components/VreinImageBanner/VreinImageBanner'
export { VreinTracking } from './components/VreinTracking/VreinTracking'
export { VreinProductItem } from './components/VreinCarousel/VreinProductItem'
export { VreinPopup } from './components/VreinPopup/VreinPopup'
export { VreinPopupModal } from './components/VreinPopup/VreinPopupModal'
export { VreinPopupSlider } from './components/VreinPopup/VreinPopupSlider'
export { VreinPopupBlock } from './components/VreinPopup/VreinPopupBlock'

// Types (for consumers)
export type {
  VreinTrackingProps,
  VreinDataLayerEvent,
  VreinAnalyticsEvent,
  UseAnalyticsEventFn,
} from './components/VreinTracking/VreinTracking'
export type { VreinCarouselProps, PageType } from './components/VreinCarousel/VreinCarousel.types'
export type { VreinImageBannerProps, VreinImageBannerData, VreinBannerImage as VreinBannerImageType, VreinSmartCountdown as VreinSmartCountdownType } from './components/VreinImageBanner/VreinImageBanner.types'
export type { VreinPopupProps } from './components/VreinPopup/VreinPopup.types'
export type { VreinProduct, VreinProductConnection, VreinImageBannerConnection, VreinFullProduct, PopupSection, PopupType, PopupBlockContentType, VreinPopupBlock as VreinPopupBlockType, VreinPopupImage, VreinPopupData } from './types/vrein'

// SDK types (for type-safe adapter wiring)
export type { QueryExecutor } from './sdk/types'

// Hooks (for advanced consumers)
export { useVreinRecommendations } from './components/VreinCarousel/hooks/useVreinRecommendations'
export type { VreinRecommendationsParams } from './components/VreinCarousel/hooks/useVreinRecommendations'
export { useVreinImages } from './components/VreinImageBanner/hooks/useVreinImages'
export { useVreinMetrics } from './components/VreinCarousel/hooks/useVreinMetrics'
export { useVreinContext } from './components/VreinCarousel/hooks/useVreinContext'
export { useInViewport } from './components/VreinCarousel/hooks/useInViewport'
export { useIsMobile } from './components/VreinCarousel/hooks/useIsMobile'
export { useCurrentLocation } from './components/VreinCarousel/hooks/useCurrentLocation'
export { useHasMounted } from './components/VreinCarousel/hooks/useHasMounted'
export { useVreinPopup } from './components/VreinPopup/hooks/useVreinPopup'
export type { VreinPopupQueryParams } from './components/VreinPopup/hooks/useVreinPopup'
export { usePopupDismissal } from './components/VreinPopup/hooks/usePopupDismissal'
export { useSliderCollapse } from './components/VreinPopup/hooks/useSliderCollapse'
export { resolvePopupSection } from './components/VreinPopup/popupSection'
export { safeHttpUrl } from './components/VreinPopup/safeUrl'

// Utilities
export { vreinToProductSummary } from './components/VreinCarousel/vreinToProductSummary'

// Config utilities
export { getClientConfig, getShelfTitleTag } from './components/VreinCarousel/clientConfig'
export { VREIN_CONFIG, VREIN_ENV, getVreinConfig, enableVreinDebug, disableVreinDebug } from './components/VreinCarousel/config'

// GraphQL (for registering in the consumer project)
export { vreinResolvers } from './graphql/resolvers/vrein'
export { vreinTypeDefs } from './graphql/typeDefs'

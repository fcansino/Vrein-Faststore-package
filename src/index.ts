// Components
export { VreinCarousel } from './components/VreinCarousel/VreinCarousel'
export { VreinImageBanner } from './components/VreinImageBanner/VreinImageBanner'
export { VreinTracking } from './components/VreinTracking/VreinTracking'
export { VreinProductItem } from './components/VreinCarousel/VreinProductItem'

// Types (for consumers)
export type {
  VreinTrackingProps,
  VreinDataLayerEvent,
  VreinAnalyticsEvent,
  UseAnalyticsEventFn,
} from './components/VreinTracking/VreinTracking'
export type { VreinCarouselProps, PageType } from './components/VreinCarousel/VreinCarousel.types'
export type { VreinImageBannerProps, VreinImageBannerData, VreinBannerImage as VreinBannerImageType, VreinSmartCountdown as VreinSmartCountdownType } from './components/VreinImageBanner/VreinImageBanner.types'
export type { VreinProduct, VreinProductConnection, VreinImageBannerConnection, VreinFullProduct } from './types/vrein'

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

// Utilities
export { vreinToProductSummary } from './components/VreinCarousel/vreinToProductSummary'

// Config utilities
export { getClientConfig, getShelfTitleTag } from './components/VreinCarousel/clientConfig'
export { VREIN_CONFIG, VREIN_ENV, getVreinConfig, enableVreinDebug, disableVreinDebug } from './components/VreinCarousel/config'

// GraphQL (for registering in the consumer project)
export { vreinResolvers } from './graphql/resolvers/vrein'
export { vreinTypeDefs } from './graphql/typeDefs'

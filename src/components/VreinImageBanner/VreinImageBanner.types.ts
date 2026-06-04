import type { QueryExecutor } from '../../sdk/types'

export interface VreinImageBannerProps {
  /** Injected FastStore useQuery executor (dependency injection for persisted-query path) */
  useQueryFn: QueryExecutor
  /** Injected query document from @generated/graphql (VreinImagesQueryDocument) */
  vreinImagesDocument: unknown
  sectionId: string
  pageContext?: string
  height?: number
  showArrows?: boolean
  showDots?: boolean
  autoplay?: boolean
  showLazyLoading?: boolean
  lazyLoadingHeight?: number
  /** ID del carrito actual (desde useCart del framework). Se usa en métricas. */
  cartId?: string
}

export interface VreinBannerImage {
  title: string
  image: string
  mobileImage: string
  link: string
}

export interface VreinSmartCountdown {
  dateStart: string
  dateEnd: string
  fontSizeDesktop: number
  fontSizeMobile: number
  positionDesktop: string
  positionMobile: string
  fontColor: string
  enabled: boolean
  timeZoneOffset: number
}

export interface VreinImageBannerData {
  images: VreinBannerImage[]
  smartCountdown: VreinSmartCountdown | null
}

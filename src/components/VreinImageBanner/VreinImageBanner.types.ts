export interface VreinImageBannerProps {
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

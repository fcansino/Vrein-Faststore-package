export type VreinCarouselProps = {
  /** ID de la sección específica de Vrein (ej: BDW-HOME-Carrusel-1) */
  sectionId: string
  /** Optional ProductCard override config from the consumer project */
  productCardOverride?: {
    Component: React.ComponentType<any>
    props?: Record<string, any>
  } | null
}

export type VreinAnalyticsEvent = {
  name: 'vrein_carousel_view'
  params: {
    sectionId?: string
    totalItems: number
  }
}

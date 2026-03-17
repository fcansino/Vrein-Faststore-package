export type PageType = 'home' | 'product' | 'category' | 'search' | 'searchnoresult'

export type VreinCarouselProps = {
  /** ID de la sección específica de Vrein (ej: BDW-HOME-Carrusel-1) */
  sectionId: string
  /** Optional ProductCard override config from the consumer project */
  productCardOverride?: {
    Component: React.ComponentType<any>
    props?: Record<string, any>
  } | null
  /**
   * ID del carrito actual (desde useCart del framework).
   * Se usa en métricas y se persiste en localStorage para el script de tracking.
   * Si no se provee, el hook genera un ID de sesión como fallback.
   */
  cartId?: string
  /**
   * Resultado de la búsqueda en página /s (para secciones SR/SNR).
   * - true  → hay resultados → mostrar sección SR, ocultar SNR
   * - false → sin resultados → mostrar sección SNR, ocultar SR
   * - null  → cargando (aún no hay datos) → ocultar ambas hasta saber
   * - undefined → no aplica (no es página de búsqueda)
   * Si se provee, tiene prioridad sobre la detección DOM interna.
   */
  hasSearchResults?: boolean | null
  /**
   * Fuerza el pageType para la construcción del contexto de Vrein.
   * Útil en páginas /s donde el sectionId indica si es SR o SNR pero el
   * componente no puede determinarlo desde la URL sola.
   */
  pageTypeOverride?: PageType
}

export type VreinAnalyticsEvent = {
  name: 'vrein_carousel_view'
  params: {
    sectionId?: string
    totalItems: number
  }
}

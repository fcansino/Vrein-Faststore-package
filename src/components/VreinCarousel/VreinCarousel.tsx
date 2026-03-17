import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  ProductShelf,
  ProductShelfItems,
  ProductShelfItem,
  Carousel,
  Skeleton,
} from '@faststore/ui'

import { VreinCarouselProps } from './VreinCarousel.types'
import { useVreinRecommendations, useVreinMetrics, useVreinContext, useInViewport, useIsMobile } from './hooks'
import { getShelfTitleTag } from './clientConfig'
import { VreinProductItem } from './VreinProductItem'
import { vreinToProductSummary } from './vreinToProductSummary'

/**
 * Determina si debe renderizarse según la página y el tipo de sección.
 * Solo actúa en /s?q=... para secciones SR/SNR.
 * Usa detección DOM como fallback cuando no se provee hasSearchResults desde el framework.
 */
function checkShouldRenderByDOM(sectionId: string): boolean {
  if (typeof window === 'undefined') return true

  const pathname = window.location.pathname
  const params = new URLSearchParams(window.location.search)

  if (pathname !== '/s' || !params.has('q')) return true

  const upper = sectionId.toUpperCase()
  const isSnr = upper.includes('-SNR-') || upper.includes('SEARCHNORESULT')
  const isSr = upper.includes('-SR-') || (upper.includes('-SEARCH-') && !isSnr)

  if (!isSnr && !isSr) return true

  const hasResults = document.querySelector('[data-fs-product-listing-results-count]') !== null

  if (isSnr) return !hasResults
  if (isSr)  return hasResults

  return true
}

export const VreinCarousel = ({
  sectionId,
  productCardOverride,
  cartId,
  hasSearchResults,
  pageTypeOverride,
}: VreinCarouselProps) => {
  const itemsPerPage = 5

  // Clasificación estática del tipo de sección
  const upper = sectionId.toUpperCase()
  const isSnrSection = upper.includes('-SNR-') || upper.includes('SEARCHNORESULT')
  const isSrSection = upper.includes('-SR-') || (upper.includes('-SEARCH-') && !isSnrSection)

  const [isOnSearchPage] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.location.pathname === '/s' && new URLSearchParams(window.location.search).has('q')
  })

  const needsSearchCheck = isOnSearchPage && (isSnrSection || isSrSection)

  // shouldRender: true=mostrar, false=ocultar, null=esperando datos
  const shouldRender = useMemo(() => {
    if (!needsSearchCheck) return true

    // Si el framework pasó hasSearchResults, úsarlo con prioridad
    if (hasSearchResults !== undefined) {
      if (hasSearchResults === null) return null // cargando
      if (isSnrSection) return !hasSearchResults
      if (isSrSection)  return hasSearchResults
      return true
    }

    // Fallback: detección DOM
    return checkShouldRenderByDOM(sectionId)
  }, [needsSearchCheck, hasSearchResults, isSnrSection, isSrSection, sectionId])

  // DOM fallback: cuando no viene hasSearchResults, observar cambios en el DOM
  const [domPageMatch, setDomPageMatch] = useState(true)
  useEffect(() => {
    if (!needsSearchCheck || hasSearchResults !== undefined) return

    setDomPageMatch(checkShouldRenderByDOM(sectionId))

    const observer = new MutationObserver(() => {
      setDomPageMatch(checkShouldRenderByDOM(sectionId))
    })
    observer.observe(document.body, { childList: true, subtree: true, attributes: true })

    const timeout = setTimeout(() => observer.disconnect(), 10000)

    return () => {
      observer.disconnect()
      clearTimeout(timeout)
    }
  }, [sectionId, needsSearchCheck, hasSearchResults])

  const finalShouldRender = hasSearchResults !== undefined ? shouldRender : domPageMatch

  const context = useVreinContext(sectionId, pageTypeOverride)

  const id = `vrein-carousel-${sectionId}`
  const viewedOnce = useRef(false)
  const isMobile = useIsMobile()
  const { ref: sectionRef, isVisible } = useInViewport(0.5)

  const [isHovered, setIsHovered] = useState(false)

  const { data, loading } = useVreinRecommendations({
    sectionId,
    context,
  })

  const { trackCarouselRender, trackCarouselClick } = useVreinMetrics({ cartId })

  const items = data?.products || []
  const title = data?.title || 'Productos Recomendados'
  const TitleTag = getShelfTitleTag() as keyof JSX.IntrinsicElements

  const adaptedItems = useMemo(() => {
    if (!productCardOverride) return null
    return items.map((item) => vreinToProductSummary(item))
  }, [items, productCardOverride])

  useEffect(() => {
    if (!viewedOnce.current && isVisible && items.length && data) {
      trackCarouselRender(id, {
        sectionId,
        totalItems: items.length,
        title: data.title,
        endpoint: data.endpointName || 'unknown',
        products: items.map((item: any) => ({
          productId: item.sku || item.id || '',
          productName: item.isVariantOf?.name || item.name || '',
        })),
      })
      viewedOnce.current = true
    }
  }, [isVisible, items.length, data, sectionId, id, trackCarouselRender])

  if (finalShouldRender === null || finalShouldRender === false) return null

  const isDebug = typeof window !== 'undefined' && (
    (window as any).VREIN_DEBUG === true ||
    new URLSearchParams(window.location.search).get('vrein_debug') === 'true'
  )

  if (!loading && items.length === 0) {
    if (isDebug) {
      console.warn('[VreinCarousel] No products to display', { sectionId, carouselId: id, apiUrl: data?.apiUrl || '' })
      return (
        <section className="section-product-shelf layout__section section">
          <div style={{ padding: 'var(--fs-spacing-6)', border: '2px dashed orange', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ color: 'orange' }}>Vrein Carousel: {sectionId}</h3>
            <p style={{ color: '#666' }}>No se encontraron productos para esta seccion.</p>
            <p style={{ fontSize: '0.875rem', color: '#999' }}>
              Verifica que la seccion exista en la API de Vrein y que los SKUs retornados existan en VTEX.
            </p>
            <p style={{ overflow: 'auto' }}>API URL: <a href={data?.apiUrl} target="_blank" rel="noopener noreferrer">{data?.apiUrl}</a></p>
          </div>
        </section>
      )
    }
    return null
  }

  if (loading) {
    return (
      <section className="section-product-shelf layout__section section">
        <h2 className="text__title-section layout__content">
          <Skeleton size={{ width: '200px', height: '28px' }} />
        </h2>
        <ProductShelf data-fs-product-shelf-skeleton>
          <ProductShelfItems>
            {Array.from({ length: itemsPerPage }).map((_, idx) => (
              <ProductShelfItem key={idx}>
                <div
                  data-fs-product-card-skeleton
                  data-fs-product-card-skeleton-bordered="true"
                  data-fs-product-card-skeleton-sectioned="true"
                >
                  <div
                    data-fs-product-card-skeleton-image
                    style={{ '--fs-product-card-skeleton-image-aspect-ratio': 1 } as React.CSSProperties}
                  >
                    <Skeleton size={{ width: '100%', height: '100%' }} />
                  </div>
                  <div data-fs-product-card-skeleton-content>
                    <Skeleton data-fs-product-card-skeleton-text size={{ width: '90%', height: '1.5rem' }} />
                    <Skeleton data-fs-product-card-skeleton-text size={{ width: '70%', height: '1.5rem' }} />
                    <Skeleton data-fs-product-card-skeleton-badge size={{ width: '6rem', height: '2rem' }} border="pill" />
                  </div>
                </div>
              </ProductShelfItem>
            ))}
          </ProductShelfItems>
        </ProductShelf>
      </section>
    )
  }

  return (
    <section
      ref={sectionRef}
      className="section-product-shelf layout__section section"
      data-vrein-section={sectionId}
      onMouseEnter={() => isDebug && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={isDebug ? {
        position: 'relative',
        ...(isHovered ? { outline: '2px solid #6529a1', outlineOffset: '-2px' } : {}),
      } : undefined}
    >
      {isDebug && isHovered && (
        <div style={{
          position: 'absolute', top: 0, left: 0,
          background: '#6529a1', color: 'white',
          fontSize: '11px', fontFamily: 'monospace', fontWeight: 'bold',
          padding: '2px 8px', borderRadius: '0 0 4px 0',
          zIndex: 9999, pointerEvents: 'none',
        }}>
          {sectionId}
        </div>
      )}
      {title && (
        <TitleTag className="text__title-section" style={{ textAlign: 'center', marginBottom: 'var(--fs-spacing-6)' }}>
          {title}
        </TitleTag>
      )}
      <ProductShelf>
        <Carousel
          id={id}
          itemsPerPage={isMobile ? 2 : itemsPerPage}
          variant="scroll"
          infiniteMode={false}
        >
          {items.map((item, index) => {
            if (productCardOverride && adaptedItems) {
              const ProductCardComponent = productCardOverride.Component
              const productCardProps = productCardOverride.props || {}
              return (
                <div
                  key={item.sku}
                  onClick={() =>
                    trackCarouselClick(id, {
                      sectionId,
                      productId: item.sku,
                      productName: item.isVariantOf.name,
                      position: index,
                    })
                  }
                  style={{ cursor: 'pointer' }}
                >
                  <ProductCardComponent
                    aspectRatio={1}
                    imgProps={{
                      width: 216,
                      height: 216,
                      sizes: '(max-width: 768px) 42vw, 30vw',
                    }}
                    {...productCardProps}
                    product={adaptedItems[index]}
                    index={index + 1}
                  />
                </div>
              )
            }

            return (
              <VreinProductItem
                key={item.sku}
                item={item}
                position={index}
                onProductClick={(productId, productName, pos) =>
                  trackCarouselClick(id, { sectionId, productId, productName, position: pos })
                }
              />
            )
          })}
        </Carousel>
      </ProductShelf>
    </section>
  )
}

export default VreinCarousel

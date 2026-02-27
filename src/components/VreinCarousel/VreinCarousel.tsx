import React, { useEffect, useMemo, useRef } from 'react'
import {
  ProductShelf,
  ProductShelfItems,
  ProductShelfItem,
  Carousel,
  Skeleton,
} from '@faststore/ui'

import { VreinCarouselProps } from './VreinCarousel.types'
import { useVreinRecommendations, useVreinMetrics, useVreinContext } from './hooks'
import { getShelfTitleTag } from './clientConfig'
import { VreinProductItem } from './VreinProductItem'
import { vreinToProductSummary } from './vreinToProductSummary'

export const VreinCarousel = ({
  sectionId,
  productCardOverride,
}: VreinCarouselProps) => {
  const itemsPerPage = 5

  const context = useVreinContext(sectionId)

  const id = `vrein-carousel-${sectionId}`
  const viewedOnce = useRef(false)
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768

  const { data, loading } = useVreinRecommendations({
    sectionId,
    context,
  })

  const { trackCarouselRender, trackCarouselClick } = useVreinMetrics()

  const items = data?.products || []
  const title = data?.title || 'Productos Recomendados'
  const TitleTag = getShelfTitleTag() as keyof JSX.IntrinsicElements

  const adaptedItems = useMemo(() => {
    if (!productCardOverride) return null
    return items.map((item) => vreinToProductSummary(item))
  }, [items, productCardOverride])

  useEffect(() => {
    if (!viewedOnce.current && items.length && data) {
      trackCarouselRender(id, {
        sectionId,
        totalItems: items.length,
        title: data.title,
        endpoint: data.endpointName || 'unknown'
      })
      viewedOnce.current = true
    }
  }, [items.length, data, sectionId, id, trackCarouselRender])

  if (!loading && items.length === 0) {
    console.warn('[VreinCarousel] No products to display', { sectionId })

    const isDebug = typeof window !== 'undefined' && (
      (window as any).VREIN_DEBUG === true ||
      new URLSearchParams(window.location.search).get('vrein_debug') === 'true'
    )

    if (isDebug) {
      return (
        <section className="section-product-shelf layout__section section">
          <div style={{ padding: 'var(--fs-spacing-6)', border: '2px dashed orange', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ color: 'orange' }}>Vrein Carousel: {sectionId}</h3>
            <p style={{ color: '#666' }}>No se encontraron productos para esta seccion.</p>
            <p style={{ fontSize: '0.875rem', color: '#999' }}>
              Verifica que la seccion exista en la API de Vrein y que los SKUs retornados existan en VTEX.
            </p>
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
                    <Skeleton
                      data-fs-product-card-skeleton-text
                      size={{ width: '90%', height: '1.5rem' }}
                    />
                    <Skeleton
                      data-fs-product-card-skeleton-text
                      size={{ width: '70%', height: '1.5rem' }}
                    />
                    <Skeleton
                      data-fs-product-card-skeleton-badge
                      size={{ width: '6rem', height: '2rem' }}
                      border="pill"
                    />
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
      className="section-product-shelf layout__section section"
      data-vrein-section={sectionId}
    >
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

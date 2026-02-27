'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Carousel, Skeleton } from '@faststore/ui'

import type { VreinImageBannerProps } from './VreinImageBanner.types'
import { useVreinImages } from './hooks/useVreinImages'
import { useVreinMetrics } from '../VreinCarousel/hooks/useVreinMetrics'
import { Countdown } from './Countdown'

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= breakpoint : false
  )

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= breakpoint)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [breakpoint])

  return isMobile
}

const POSITION_STYLES: Record<string, React.CSSProperties> = {
  '1.1': { top: '0%', left: '0%', transform: 'translate(0%, 0%)' },
  '1.2': { top: '0%', left: '50%', transform: 'translate(-50%, 0%)' },
  '1.3': { top: '0%', left: '100%', transform: 'translate(-100%, 0%)' },
  '2.1': { top: '50%', left: '0%', transform: 'translate(0%, -50%)' },
  '2.2': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
  '2.3': { top: '50%', left: '100%', transform: 'translate(-100%, -50%)' },
  '3.1': { top: '100%', left: '0%', transform: 'translate(0%, -100%)' },
  '3.2': { top: '100%', left: '50%', transform: 'translate(-50%, -100%)' },
  '3.3': { top: '100%', left: '100%', transform: 'translate(-100%, -100%)' },
}

export const VreinImageBanner = ({
  sectionId,
  height = 420,
  showLazyLoading = false,
  lazyLoadingHeight = 400,
}: VreinImageBannerProps) => {
  const id = `vrein-banner-${sectionId}`
  const viewedOnce = useRef(false)
  const isMobile = useIsMobile()

  const { data, loading } = useVreinImages({ sectionId })
  const { trackCustomMetric } = useVreinMetrics()

  const images = data?.images || []
  const countdown = data?.smartCountdown

  useEffect(() => {
    if (!viewedOnce.current && images.length > 0) {
      trackCustomMetric('banner_render', {
        sectionId,
        totalImages: images.length,
        hasCountdown: !!countdown?.enabled,
      })
      viewedOnce.current = true
    }
  }, [images.length, countdown, sectionId, trackCustomMetric])

  const handleBannerClick = (imageUrl: string, link: string) => {
    trackCustomMetric('banner_click', {
      sectionId,
      imageUrl,
      link,
    })

    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      ;(window as any).dataLayer.push({
        event: 'promotionClick',
        ecommerce: {
          promoClick: {
            promotions: [
              {
                id: sectionId,
                name: images[0]?.title || sectionId,
                creative: imageUrl,
              },
            ],
          },
        },
      })
    }
  }

  if (loading) {
    if (!showLazyLoading) return null
    return (
      <section style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
        <div style={{ width: '100%', height: lazyLoadingHeight || height, background: '#f0f0f0', borderRadius: '4px' }}>
          <Skeleton size={{ width: '100%', height: '100%' }} />
        </div>
      </section>
    )
  }

  if (!images.length) {
    const isDebug = typeof window !== 'undefined' && (
      (window as any).VREIN_DEBUG === true ||
      new URLSearchParams(window.location.search).get('vrein_debug') === 'true'
    )

    if (isDebug) {
      return (
        <section style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
          <div style={{ padding: '24px', border: '2px dashed orange', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ color: 'orange' }}>Vrein Image Banner: {sectionId}</h3>
            <p style={{ color: '#666' }}>No se encontraron imagenes para esta seccion.</p>
          </div>
        </section>
      )
    }
    return null
  }

  const renderCountdown = () => {
    if (!countdown?.enabled) return null
    return (
      <div
        style={{
          position: 'absolute',
          zIndex: 1,
          pointerEvents: 'none',
          ...(POSITION_STYLES[
            isMobile
              ? countdown.positionMobile || '2.2'
              : countdown.positionDesktop || '2.2'
          ] || POSITION_STYLES['2.2']),
        }}
      >
        <Countdown
          fontSize={
            isMobile
              ? countdown.fontSizeMobile || 14
              : countdown.fontSizeDesktop || 20
          }
          fontColor={countdown.fontColor || 'white'}
          dateStart={countdown.dateStart}
          dateEnd={countdown.dateEnd}
          timeZoneOffset={countdown.timeZoneOffset || 0}
        />
      </div>
    )
  }

  const renderImage = (img: typeof images[0], index: number) => {
    const imgSrc = isMobile && img.mobileImage ? img.mobileImage : img.image
    const imgEl = (
      <img
        src={imgSrc}
        alt={img.title || `Banner ${index + 1}`}
        style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover', maxHeight: height }}
        loading={index === 0 ? 'eager' : 'lazy'}
      />
    )

    return img.link ? (
      <a
        href={img.link}
        style={{ position: 'relative', width: '100%', display: 'block', cursor: 'pointer', textDecoration: 'none' }}
        onClick={() => handleBannerClick(imgSrc, img.link)}
      >
        {imgEl}
      </a>
    ) : imgEl
  }

  if (images.length === 1) {
    return (
      <section
        style={{ position: 'relative', width: '100%', overflow: 'hidden' }}
        data-vrein-banner={sectionId}
      >
        <div style={{ position: 'relative' }}>
          {renderImage(images[0], 0)}
          {renderCountdown()}
        </div>
      </section>
    )
  }

  return (
    <section
      style={{ position: 'relative', width: '100%', overflow: 'hidden' }}
      data-vrein-banner={sectionId}
      data-fs-content
    >
      <Carousel
        id={id}
        itemsPerPage={1}
        variant="scroll"
        infiniteMode={true}
        controls='complete'
      >
        {images.map((img, index) => (
          <div key={index} style={{ position: 'relative', width: '100%', flexShrink: 0 }}>
            <div style={{ position: 'relative' }}>
              {renderImage(img, index)}
              {renderCountdown()}
            </div>
          </div>
        ))}
      </Carousel>
    </section>
  )
}

export default VreinImageBanner

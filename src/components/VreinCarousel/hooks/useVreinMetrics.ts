'use client'

import { useCallback } from 'react'

const ABTEST_URL = 'https://abtest.braindw.com'

const getVreinHash = () => {
  return process.env.NEXT_PUBLIC_VREIN_HASH || ''
}

const getBranchOffice = () => {
  return '1'
}

const isDebugMode = () => {
  return typeof window !== 'undefined' && (window as any).VREIN_DEBUG
}

export function useVreinMetrics() {
  const trackCarouselRender = useCallback((carouselId: string, data: {
    sectionId: string
    totalItems: number
    title?: string
    endpoint?: string
    products?: Array<{ productId: string; productName: string }>
  }) => {
    if (isDebugMode()) {
      console.log('[Vrein Metrics] Carousel rendered:', { carouselId, ...data })
    }
    sendMetric('carousel_render', carouselId, {
      sectionId: data.sectionId,
      totalItems: data.totalItems,
      title: data.title,
      endpoint: data.endpoint,
      products: data.products,
    })
  }, [])

  const trackCarouselClick = useCallback((carouselId: string, data: {
    sectionId: string
    productId: string
    productName: string
    position: number
  }) => {
    if (isDebugMode()) {
      console.log('[Vrein Metrics] Carousel click:', { carouselId, ...data })
    }
    sendMetric('carousel_click', carouselId, {
      sectionId: data.sectionId,
      productId: data.productId,
      productName: data.productName,
      position: data.position
    })
  }, [])

  const trackABTestVariation = useCallback((testId: string, data: {
    variation: string
    componentName: string
  }) => {
    if (isDebugMode()) {
      console.log('[Vrein Metrics] ABTest variation:', { testId, ...data })
    }
    sendMetric('abtest_variation', testId, {
      variation: data.variation,
      componentName: data.componentName
    })
  }, [])

  const trackCustomMetric = useCallback((eventName: string, data: Record<string, any>) => {
    if (isDebugMode()) {
      console.log('[Vrein Metrics] Custom metric:', { eventName, data })
    }
    sendMetric('custom', eventName, data)
  }, [])

  return {
    trackCarouselRender,
    trackCarouselClick,
    trackABTestVariation,
    trackCustomMetric
  }
}

async function sendMetric(
  eventType: string,
  eventName: string,
  data: Record<string, any>
) {
  try {
    const params = new URLSearchParams({
      HASH: getVreinHash(),
      branchOffice: getBranchOffice(),
      eventType,
      eventName,
      eventData: JSON.stringify({
        ...data,
        timestamp: Date.now()
      })
    })

    await fetch(
      `${ABTEST_URL}/api/abtest/events/capture?${params}`,
      {
        method: 'GET',
        mode: 'cors'
      }
    )

    if (isDebugMode()) {
      console.log('[Vrein Metrics] Sent:', { eventType, eventName })
    }
  } catch (error) {
    if (isDebugMode()) {
      console.error('[Vrein Metrics] Error:', error)
    }
  }
}

declare global {
  interface Window {
    VREIN_DEBUG?: boolean
  }
}

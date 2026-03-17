'use client'

import { useCallback } from 'react'

const ABTEST_URL = 'https://abtest.braindw.com'

const getVreinHash = () => {
  return process.env.NEXT_PUBLIC_VREIN_HASH || ''
}

const isDebugMode = () => {
  return typeof window !== 'undefined' && (window as any).VREIN_DEBUG
}

function getCookie(name: string): string {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : ''
}

function getEmail(): string {
  try {
    return localStorage.getItem('bdw_email') || ''
  } catch {
    return ''
  }
}

function resolveCartId(cartId?: string): string {
  if (cartId) return cartId
  try {
    const key = 'bdw_cart_session_id'
    let id = sessionStorage.getItem(key)
    if (!id) {
      id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      sessionStorage.setItem(key, id)
    }
    return id
  } catch {
    return ''
  }
}

export function useVreinMetrics({ cartId }: { cartId?: string } = {}) {

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

    const payload = {
      EventType: 'renderProduct',
      timestamp: new Date().toISOString(),
      sessionId: getCookie('bdw_session'),
      email: getEmail(),
      guidcartnumber: resolveCartId(cartId),
      url: typeof window !== 'undefined' ? window.location.href : '',
      Source: {
        Type: 'bdw',
        Caller: data.sectionId,
        Title: data.title || '',
        Endpoint: data.endpoint || '',
      },
      products: data.products || [],
      Currency: 'ARS',
    }

    sendCapture(payload)
  }, [cartId])

  const trackCarouselClick = useCallback((carouselId: string, data: {
    sectionId: string
    productId: string
    productName: string
    position: number
    title?: string
    endpoint?: string
  }) => {
    if (isDebugMode()) {
      console.log('[Vrein Metrics] Carousel click:', { carouselId, ...data })
    }

    const payload = {
      EventType: 'clic',
      timestamp: new Date().toISOString(),
      sessionId: getCookie('bdw_session'),
      email: getEmail(),
      guidcartnumber: resolveCartId(cartId),
      Source: {
        Type: 'bdw',
        Caller: data.sectionId,
        Title: data.title || '',
        Endpoint: data.endpoint || '',
      },
      products: [{ productId: data.productId, productName: data.productName }],
      Currency: 'ARS',
    }

    sendCapture(payload)
  }, [cartId])

  const trackBannerRender = useCallback((data: {
    sectionId: string
    totalImages: number
    hasCountdown?: boolean
  }) => {
    if (isDebugMode()) {
      console.log('[Vrein Metrics] Banner rendered:', data)
    }

    const payload = {
      EventType: 'renderBanner',
      timestamp: new Date().toISOString(),
      sessionId: getCookie('bdw_session'),
      email: getEmail(),
      guidcartnumber: resolveCartId(cartId),
      url: typeof window !== 'undefined' ? window.location.href : '',
      Source: {
        Type: 'bdw',
        Caller: data.sectionId,
        Title: '',
        Endpoint: '',
      },
      products: [],
      Currency: 'ARS',
    }

    sendCapture(payload)
  }, [cartId])

  const trackBannerClick = useCallback((data: {
    sectionId: string
    imageUrl?: string
    link?: string
  }) => {
    if (isDebugMode()) {
      console.log('[Vrein Metrics] Banner click:', data)
    }

    const payload = {
      EventType: 'clicBanner',
      timestamp: new Date().toISOString(),
      sessionId: getCookie('bdw_session'),
      email: getEmail(),
      guidcartnumber: resolveCartId(cartId),
      url: typeof window !== 'undefined' ? window.location.href : '',
      Source: {
        Type: 'bdw',
        Caller: data.sectionId,
        Title: data.imageUrl || '',
        Endpoint: data.link || '',
      },
      products: [],
      Currency: 'ARS',
    }

    sendCapture(payload)
  }, [cartId])

  return {
    trackCarouselRender,
    trackCarouselClick,
    trackBannerRender,
    trackBannerClick,
  }
}

async function sendCapture(payload: Record<string, any>) {
  try {
    const hash = getVreinHash()
    const url = `${ABTEST_URL}/api/events/Capture?hashclient=${encodeURIComponent(hash)}`

    await fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (isDebugMode()) {
      console.log('[Vrein Metrics] Sent:', payload.EventType, payload)
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

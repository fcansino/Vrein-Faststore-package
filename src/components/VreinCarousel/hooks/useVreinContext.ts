'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

type PageType = 'home' | 'product' | 'category' | 'search' | 'searchnoresult'

interface VreinContextData {
  pageType: PageType
  productId?: string
  categoryId?: string
  searchTerm?: string
  lastProducts: string
  lastSku: string
  lastCategory: string
  cartProducts: string
  queryTerm: string
  zipcode: string
  path: string
  sessionGuid: string
}

/**
 * Detecta el tipo de página desde la URL, no desde el sectionId.
 * Para search vs searchnoresult (ambas en /s), delega en detectSearchState().
 */
function detectPageType(): PageType {
  if (typeof window === 'undefined') return 'home'

  const pathname = window.location.pathname
  const params = new URLSearchParams(window.location.search)

  // PDP: product pages end with /p in FastStore
  if (pathname.endsWith('/p')) return 'product'

  // Search page: /s con param q
  if (pathname === '/s' && params.has('q')) {
    return detectSearchState()
  }

  // Home
  if (pathname === '/' || pathname === '') return 'home'

  // Category/PLP (cualquier otro path)
  return 'category'
}

/**
 * Distingue search con resultados de searchnoresult.
 *
 * FastStore renderiza [data-fs-product-listing-results-count] en el DOM
 * SOLO cuando ProductGallery tiene totalCount > 0 (SSR — está antes de cualquier useEffect).
 * Cuando no hay resultados, renderiza EmptyGallery y ese atributo no existe.
 *
 * Capas (de más a menos confiable):
 * 1. DOM: [data-fs-product-listing-results-count] — señal nativa FastStore (SSR)
 * 2. localStorage: bdw_search_results_count — escrito por braindw-tracking.js
 * 3. dataLayer: busca view_item_list después del último evento search
 * 4. Default: 'searchnoresult'
 */
function detectSearchState(): 'search' | 'searchnoresult' {
  // 1. Señal DOM nativa de FastStore (viene del SSR, 100% confiable en useEffect)
  if (document.querySelector('[data-fs-product-listing-results-count]') !== null) {
    return 'search'
  }

  // 2. Flag del tracking script en localStorage
  try {
    const saved = localStorage.getItem('bdw_search_results_count')
    if (saved !== null && parseInt(saved, 10) > 0) {
      return 'search'
    }
  } catch { /* ignore */ }

  // 3. Revisar dataLayer directamente
  const dataLayer = (window as any).dataLayer
  if (Array.isArray(dataLayer)) {
    for (let i = dataLayer.length - 1; i >= 0; i--) {
      const entry = dataLayer[i]
      if (entry?.event === 'view_item_list' && entry?.ecommerce?.items?.length > 0) {
        return 'search'
      }
      if (entry?.event === 'search') {
        break // llegamos al search event sin encontrar view_item_list
      }
    }
  }

  // 4. Default: sin resultados (atributo DOM ausente = EmptyGallery renderizó)
  return 'searchnoresult'
}

function extractScalar(value: any): string {
  if (value == null) return ''
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object' && !Array.isArray(value)) {
    return String(value.id || value.sku || value.item_id || '')
  }
  if (Array.isArray(value)) {
    return value.map(extractScalar).filter(Boolean).join(',')
  }
  return String(value)
}

function getUserData() {
  if (typeof window === 'undefined') {
    return { lastProducts: '', lastSku: '', lastCategory: '', cartProducts: '', zipcode: '', queryTerm: '', sessionGuid: '' }
  }

  const safeReadIds = (key: string): string => {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return ''
      const parsed = JSON.parse(raw)
      return extractScalar(parsed)
    } catch {
      return localStorage.getItem(key) || ''
    }
  }

  const readLastSku = (): string => {
    try {
      const raw = localStorage.getItem('bdw_last_sku')
      if (!raw) return ''
      const parsed = JSON.parse(raw)
      if (typeof parsed === 'object' && !Array.isArray(parsed)) {
        return String(parsed.id || parsed.sku || '')
      }
      return extractScalar(parsed)
    } catch {
      return ''
    }
  }

  const readSessionGuid = (): string => {
    const match = document.cookie.match(/(?:^|;\s*)guid=([^;]*)/)
    if (match) return match[1]
    const match2 = document.cookie.match(/(?:^|;\s*)bdw_session=([^;]*)/)
    return match2 ? match2[1] : ''
  }

  return {
    lastProducts: safeReadIds('bdw_last_products'),
    lastSku: readLastSku(),
    lastCategory: localStorage.getItem('bdw_last_category') || '',
    cartProducts: safeReadIds('bdw_cart_products_ids'),
    zipcode: localStorage.getItem('bdw_zipcode') || '',
    queryTerm: localStorage.getItem('bdw_search_term') || '',
    sessionGuid: readSessionGuid(),
  }
}

function getProductId(): string {
  if (typeof window === 'undefined') return ''

  const dataLayer = (window as any).dataLayer
  if (Array.isArray(dataLayer)) {
    for (let i = dataLayer.length - 1; i >= 0; i--) {
      const entry = dataLayer[i]
      if (entry?.event === 'view_item' && entry?.ecommerce?.items?.[0]) {
        const item = entry.ecommerce.items[0]
        const raw = item.item_id || item.item_variant || item.id
        const id = extractScalar(raw)
        if (id) return id
      }
    }
  }

  try {
    const raw = localStorage.getItem('bdw_last_sku')
    if (raw) {
      const parsed = JSON.parse(raw)
      const id = typeof parsed === 'object' ? String(parsed.id || parsed.sku || '') : String(parsed)
      if (id) return id
    }
  } catch { }

  return ''
}

function getSearchTerm(): string {
  if (typeof window === 'undefined') return ''
  const params = new URLSearchParams(window.location.search)
  return params.get('q') || params.get('query') || ''
}

function getCategoryId(): string {
  if (typeof window === 'undefined') return ''

  const dataLayer = (window as any).dataLayer
  if (Array.isArray(dataLayer)) {
    for (let i = dataLayer.length - 1; i >= 0; i--) {
      const entry = dataLayer[i]
      if (entry?.event === 'view_item_list' && entry?.ecommerce?.item_list_id) {
        const val = String(entry.ecommerce.item_list_id)
        if (/^\d+$/.test(val)) return val
      }
    }
  }

  const lastCat = localStorage.getItem('bdw_last_category') || ''
  if (/^\d+$/.test(lastCat)) return lastCat

  return ''
}

export function useVreinContext(sectionId: string): string {
  const pathname = usePathname()
  const [context, setContext] = useState<string>(() => {
    if (typeof window === 'undefined') return 'home//'
    return buildContext(sectionId)
  })

  useEffect(() => {
    setContext(buildContext(sectionId))
  }, [sectionId, pathname])

  return context
}

function buildContext(sectionId: string): string {
  if (typeof window === 'undefined') return 'home//'

  const pageType = detectPageType()
  const userData = getUserData()

  const contextData: VreinContextData = {
    pageType,
    lastProducts: userData.lastProducts,
    lastSku: userData.lastSku,
    lastCategory: userData.lastCategory,
    cartProducts: userData.cartProducts,
    queryTerm: userData.queryTerm,
    zipcode: userData.zipcode,
    path: window.location.pathname,
    sessionGuid: userData.sessionGuid,
  }

  switch (pageType) {
    case 'product':
      contextData.productId = getProductId()
      break
    case 'category':
      contextData.categoryId = getCategoryId()
      break
    case 'search':
    case 'searchnoresult':
      contextData.searchTerm = getSearchTerm()
      break
  }

  const contextJson = JSON.stringify(contextData)
  console.log('[VreinContext] Built context:', contextJson)
  return contextJson
}

'use client'

import { useState, useEffect, useRef } from 'react'
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
 * Detecta el tipo de página desde la URL.
 * Para search vs searchnoresult (ambas en /s), delega en detectSearchState().
 * Si se provee pageTypeOverride, se usa ese valor directamente.
 */
function detectPageType(): PageType {
  if (typeof window === 'undefined') return 'home'

  const pathname = window.location.pathname
  const params = new URLSearchParams(window.location.search)

  if (pathname.endsWith('/p')) return 'product'

  if (pathname === '/s' && params.has('q')) {
    return detectSearchState()
  }

  if (pathname === '/' || pathname === '') return 'home'

  return 'category'
}

/**
 * Distingue search con resultados de searchnoresult.
 * Esta función es poco confiable en el mount inicial — usar pageTypeOverride
 * cuando el caller sabe con certeza el tipo (e.g. desde sectionId SR/SNR).
 */
function detectSearchState(): 'search' | 'searchnoresult' {
  if (document.querySelector('[data-fs-product-listing-results-count]') !== null) {
    return 'search'
  }

  try {
    const saved = localStorage.getItem('bdw_search_results_count')
    if (saved !== null && parseInt(saved, 10) > 0) {
      return 'search'
    }
  } catch { /* ignore */ }

  const dataLayer = (window as any).dataLayer
  if (Array.isArray(dataLayer)) {
    for (let i = dataLayer.length - 1; i >= 0; i--) {
      const entry = dataLayer[i]
      if (entry?.event === 'view_item_list' && entry?.ecommerce?.items?.length > 0) {
        return 'search'
      }
      if (entry?.event === 'search') {
        break
      }
    }
  }

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

const DATA_READY_TIMEOUT_MS = 3000
const DATA_READY_POLL_INTERVAL_MS = 150

const dbg = (...args: any[]) => {
  if (typeof window !== 'undefined' && (window as any).VREIN_DEBUG) {
    console.log(...args)
  }
}

function isDataReadyForCurrentPage(pageType: PageType): boolean {
  if (typeof window === 'undefined') return true

  switch (pageType) {
    case 'product': {
      const dataLayer = (window as any).dataLayer
      if (!Array.isArray(dataLayer)) return false

      for (let i = dataLayer.length - 1; i >= 0; i--) {
        const entry = dataLayer[i]
        if (entry?.event === 'view_item' && entry?.ecommerce?.items?.[0]) {
          const item = entry.ecommerce.items[0]
          if (item.item_id || item.item_variant) {
            return true
          }
        }
      }
      return false
    }

    case 'category': {
      const dataLayer = (window as any).dataLayer
      if (Array.isArray(dataLayer)) {
        for (let i = dataLayer.length - 1; i >= 0; i--) {
          const entry = dataLayer[i]
          if (entry?.event === 'view_item_list') {
            return true
          }
        }
      }
      return true
    }

    case 'search':
    case 'searchnoresult':
    case 'home':
    default:
      return isGuidReady()
  }
}

/**
 * Verifica si el GUID de sesión ya está disponible.
 * En fresh browsers, el tracking script tarda ~300ms en obtenerlo de GetGuid.
 */
function isGuidReady(): boolean {
  try {
    // Opción 1: signal explícito del tracking script via localStorage (más rápido)
    if (localStorage.getItem('bdw_session_ready') === '1') {
      return true
    }
    // Opción 2: verificar directamente las cookies
    const match = document.cookie.match(/(?:^|;\s*)bdw_session=([^;]+)/)
    return match !== null && match[1].length > 0
  } catch {
    return false
  }
}
}

/**
 * @param sectionId - ID de la sección del carrusel
 * @param pageTypeOverride - Fuerza el pageType. Usar para SR/SNR donde ambas
 *   secciones están en la misma URL /s y detectPageType no puede distinguirlas.
 *   Pasar 'search' para secciones SR, 'searchnoresult' para SNR.
 */
export function useVreinContext(sectionId: string, pageTypeOverride?: PageType): string {
  const pathname = usePathname()
  const [context, setContext] = useState<string>(() => {
    if (typeof window === 'undefined') return 'home//'
    const pageType = pageTypeOverride ?? detectPageType()
    if (isDataReadyForCurrentPage(pageType)) {
      return buildContext(sectionId, pageTypeOverride)
    }
    return ''
  })

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (intervalRef.current) clearInterval(intervalRef.current)

    const pageType = pageTypeOverride ?? detectPageType()

    if (isDataReadyForCurrentPage(pageType)) {
      setContext(buildContext(sectionId, pageTypeOverride))
      return
    }

    dbg('[VreinContext] Waiting for page data to be ready...', { pageType, pathname })

    let resolved = false

    intervalRef.current = setInterval(() => {
      if (isDataReadyForCurrentPage(pageType)) {
        resolved = true
        if (intervalRef.current) clearInterval(intervalRef.current)
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        dbg('[VreinContext] Data ready, building context')
        setContext(buildContext(sectionId, pageTypeOverride))
      }
    }, DATA_READY_POLL_INTERVAL_MS)

    timeoutRef.current = setTimeout(() => {
      if (!resolved) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        dbg('[VreinContext] Timeout reached, building context with available data')
        setContext(buildContext(sectionId, pageTypeOverride))
      }
    }, DATA_READY_TIMEOUT_MS)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [sectionId, pathname, pageTypeOverride])

  return context
}

function buildContext(sectionId: string, pageTypeOverride?: PageType): string {
  if (typeof window === 'undefined') return 'home//'

  const pageType = pageTypeOverride ?? detectPageType()
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
  dbg('[VreinContext] Built context:', contextJson)
  return contextJson
}

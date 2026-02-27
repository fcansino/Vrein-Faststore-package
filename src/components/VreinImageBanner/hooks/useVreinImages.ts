'use client'

import { useState, useEffect, useMemo } from 'react'
import type { VreinImageBannerConnection } from '../../../types/vrein'
import type { VreinImageBannerData } from '../VreinImageBanner.types'
import { useQuery } from '../../../sdk/useQuery'
import { VREIN_IMAGES_QUERY } from '../../../graphql/queries'

const FETCH_OPTIONS = { method: 'POST' } as const

interface UseVreinImagesParams {
  sectionId: string
  categoryId?: string
  whitelabel?: string
}

interface ClientVars {
  email: string
  sessionGuid: string
  resolvedCategoryId: string
}

interface VreinImagesQueryResponse {
  vreinImages: VreinImageBannerConnection
}

function detectCategoryId(): string {
  if (typeof window === 'undefined') return ''

  const dataLayer = (window as any).dataLayer
  if (Array.isArray(dataLayer)) {
    for (let i = dataLayer.length - 1; i >= 0; i--) {
      const entry = dataLayer[i]
      if (entry?.event === 'view_item_list' && entry?.ecommerce?.item_list_id) {
        return String(entry.ecommerce.item_list_id)
      }
      if (entry?.event === 'view_item' && entry?.ecommerce?.items?.[0]?.item_category) {
        return String(entry.ecommerce.items[0].item_category)
      }
    }
  }

  return localStorage.getItem('bdw_last_category') || ''
}

export function useVreinImages({
  sectionId,
  categoryId,
  whitelabel,
}: UseVreinImagesParams) {
  const [clientVars, setClientVars] = useState<ClientVars | null>(null)

  useEffect(() => {
    const vreinHash = process.env.NEXT_PUBLIC_VREIN_HASH
    if (!vreinHash) {
      console.log('[VreinImages] No VREIN_HASH configured, skipping')
      setClientVars({ email: '', sessionGuid: '', resolvedCategoryId: '' })
      return
    }

    const email =
      localStorage.getItem('bdw_email') ||
      (() => {
        const user = localStorage.getItem('bdw_user')
        if (user) {
          try {
            return JSON.parse(user).email || ''
          } catch {
            return ''
          }
        }
        return ''
      })()

    const match = document.cookie.match(/(?:^|;\s*)bdw_session=([^;]*)/)
    const sessionGuid = match ? match[1] : ''

    const resolvedCategoryId = categoryId || detectCategoryId()

    console.log('[VreinImages] Resolving client vars for section:', sectionId, 'categoryId:', resolvedCategoryId)

    setClientVars({ email, sessionGuid, resolvedCategoryId })
  }, [sectionId, categoryId])

  const variables = useMemo(() => {
    if (!clientVars || !sectionId) return null
    return {
      sectionId,
      email: clientVars.email,
      categoryId: clientVars.resolvedCategoryId,
      whitelabel: whitelabel || '',
      sessionGuid: clientVars.sessionGuid,
    }
  }, [sectionId, clientVars, whitelabel])

  const { data, error } = useQuery<VreinImagesQueryResponse>(
    VREIN_IMAGES_QUERY,
    variables ?? { sectionId, email: '', categoryId: '', whitelabel: '', sessionGuid: '' },
    { doNotRun: !variables, fetchOptions: FETCH_OPTIONS }
  )

  return {
    data: data?.vreinImages
      ? ({
          images: data.vreinImages.images || [],
          smartCountdown: data.vreinImages.smartCountdown || null,
        } as VreinImageBannerData)
      : null,
    loading: !data && !error && !!variables,
    error: error ? String(error) : null,
  }
}

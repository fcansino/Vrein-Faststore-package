import { useMemo } from 'react'
import type { VreinProduct, VreinProductConnection } from '../../../types/vrein'
import { useQuery } from '../../../sdk/useQuery'
import { VREIN_PRODUCTS_QUERY } from '../../../graphql/queries'

const FETCH_OPTIONS = { method: 'POST' } as const

interface VreinRecommendationsData {
  products: VreinProduct[]
  title: string
  endpointName: string
}

interface VreinProductsQueryResponse {
  vreinProducts: VreinProductConnection
}

export interface VreinRecommendationsParams {
  sectionId: string
  context?: string
}

export function useVreinRecommendations({
  sectionId,
  context,
}: VreinRecommendationsParams): {
  data: VreinRecommendationsData | null
  loading: boolean
  error: string | null
} {
  const variables = useMemo(
    () => ({ sectionId, context }),
    [sectionId, context]
  )

  const { data, error } = useQuery<VreinProductsQueryResponse>(
    VREIN_PRODUCTS_QUERY,
    variables,
    { doNotRun: !sectionId || !context, fetchOptions: FETCH_OPTIONS }
  )

  return {
    data: data?.vreinProducts
      ? {
          products: data.vreinProducts.products ?? [],
          title: data.vreinProducts.title ?? '',
          endpointName: data.vreinProducts.endpointName ?? '',
        }
      : null,
    loading: !data && !error,
    error: error ? String(error) : null,
  }
}

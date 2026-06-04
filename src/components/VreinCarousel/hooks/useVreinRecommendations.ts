import { useMemo } from 'react'
import type { VreinProduct, VreinProductConnection } from '../../../types/vrein'
import type { QueryExecutor } from '../../../sdk/types'

interface VreinRecommendationsData {
  products: VreinProduct[]
  title: string
  endpointName: string
  apiUrl: string
}

interface VreinProductsQueryResponse {
  vreinProducts: VreinProductConnection
}

export interface VreinRecommendationsParams {
  sectionId: string
  context?: string
}

export function useVreinRecommendations(
  useQueryFn: QueryExecutor,
  queryDocument: unknown,
  { sectionId, context }: VreinRecommendationsParams
): {
  data: VreinRecommendationsData | null
  loading: boolean
  error: string | null
} {
  const variables = useMemo(
    () => ({ sectionId, context }),
    [sectionId, context]
  )

  const { data, isValidating, error } = useQueryFn<VreinProductsQueryResponse>(
    queryDocument as { __meta__: { operationName: string } },
    variables,
    { doNotRun: !sectionId || !context }
  )

  return {
    data: data?.vreinProducts
      ? {
          products: data.vreinProducts.products ?? [],
          title: data.vreinProducts.title ?? '',
          endpointName: data.vreinProducts.endpointName ?? '',
          apiUrl: data.vreinProducts.apiUrl ?? '',
        }
      : null,
    loading: isValidating || (!data && !error),
    error: error ? String(error) : null,
  }
}

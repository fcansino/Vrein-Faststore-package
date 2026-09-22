import { useMemo } from 'react'
import type { VreinPopupData } from '../../../types/vrein'
import type { QueryExecutor } from '../../../sdk/types'

interface VreinPopupQueryResponse {
  vreinPopup: VreinPopupData | null
}

export interface VreinPopupQueryParams {
  section: string | null
  context?: string
  email?: string
  whitelabel?: string
}

/**
 * Query hook for the `vreinPopup` persisted GraphQL query, shaped like
 * `useVreinRecommendations` — injected `useQueryFn` + injected document,
 * `doNotRun` while `section` is unresolved, `isValidating` mapped to `loading`.
 */
export function useVreinPopup(
  useQueryFn: QueryExecutor,
  queryDocument: unknown,
  { section, context, email, whitelabel }: VreinPopupQueryParams
): {
  data: VreinPopupData | null
  loading: boolean
  error: string | null
} {
  const variables = useMemo(
    () => ({ section, context, email, whitelabel }),
    [section, context, email, whitelabel]
  )

  const { data, isValidating, error } = useQueryFn<VreinPopupQueryResponse>(
    queryDocument as { __meta__: { operationName: string } },
    variables,
    { doNotRun: !section }
  )

  return {
    data: data?.vreinPopup ?? null,
    loading: isValidating || (!data && !error),
    error: error ? String(error) : null,
  }
}

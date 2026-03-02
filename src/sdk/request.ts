export type RequestOptions = Omit<BaseRequestOptions, 'operation' | 'variables'>

export type Operation = {
  __meta__?: Record<string, any>
  query?: string
}

export interface GraphQLResponse<D = any> {
  data: D
  errors: any[]
}

export interface BaseRequestOptions<V = any> {
  operation: Operation
  variables: V
  fetchOptions?: RequestInit
}

const DEFAULT_HEADERS_BY_VERB: Record<string, Record<string, string>> = {
  POST: {
    'Content-Type': 'application/json',
  },
}

// ---------------------------------------------------------------------------
// Configurable API endpoint
//
// FastStore's /api/graphql uses persisted queries (trusted documents) and
// rejects any operation it doesn't recognise with 400 Bad Request.
// By default this package sends requests to /api/vrein, which the consumer
// mounts using the handler exported from '@vreinai/faststore-components/graphql'.
// ---------------------------------------------------------------------------

let _vreinApiEndpoint = '/api/vrein'

/**
 * Override the default Vrein API endpoint.
 * Call this once at app startup if you mount the handler at a different path.
 *
 * @example setVreinApiEndpoint('/api/custom-vrein')
 */
export function setVreinApiEndpoint(endpoint: string) {
  _vreinApiEndpoint = endpoint
}

function getVreinApiEndpoint(): string {
  // Allow runtime override via env var (set in next.config.js publicRuntimeConfig
  // or NEXT_PUBLIC_ prefix so it's available client-side).
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_VREIN_API_ENDPOINT) {
    return process.env.NEXT_PUBLIC_VREIN_API_ENDPOINT
  }
  return _vreinApiEndpoint
}

export const request = async <Query = unknown, Variables = unknown>(
  operation: Operation,
  variables: Variables,
  options?: RequestOptions
) => {
  const { data, errors } = await baseRequest<Variables, Query>(getVreinApiEndpoint(), {
    ...options,
    variables,
    operation,
  })

  if (errors?.length) {
    throw errors[0]
  }

  return data
}

const baseRequest = async <V = any, D = any>(
  endpoint: string,
  { operation, variables, fetchOptions }: BaseRequestOptions<V>
): Promise<GraphQLResponse<D>> => {
  const { operationName } = operation['__meta__'] ?? {}

  // Always use POST for the custom Vrein endpoint.
  // The custom handler doesn't need operationHash (no persisted queries).
  const method =
    fetchOptions?.method !== undefined
      ? fetchOptions.method.toUpperCase()
      : 'POST'

  const params = new URLSearchParams({
    operationName: operationName ?? '',
    ...(method === 'GET' && { variables: JSON.stringify(variables) }),
  })

  const body =
    method === 'POST'
      ? JSON.stringify({
          operationName,
          variables,
        })
      : undefined

  const url = `${endpoint}?${params.toString()}`

  const response = await fetch(url, {
    method,
    body,
    ...fetchOptions,
    headers: {
      ...DEFAULT_HEADERS_BY_VERB[method],
      ...fetchOptions?.headers,
    },
  })

  const text = await response.text()

  if (!response.ok) {
    throw new Error(
      `Vrein API request failed: ${response.status} ${response.statusText}${text ? ` — ${text}` : ''}`
    )
  }

  if (!text) {
    return { data: null as unknown as D, errors: [] }
  }

  return JSON.parse(text) as GraphQLResponse<D>
}

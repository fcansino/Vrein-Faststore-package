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

export const request = async <Query = unknown, Variables = unknown>(
  operation: Operation,
  variables: Variables,
  options?: RequestOptions
) => {
  const { data, errors } = await baseRequest<Variables, Query>('/api/graphql', {
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
  const { operationName, operationHash } = operation['__meta__'] ?? {}

  const method =
    fetchOptions?.method !== undefined
      ? fetchOptions.method.toUpperCase()
      : operationName?.endsWith('Query')
        ? 'GET'
        : 'POST'

  const params = new URLSearchParams({
    operationName: operationName ?? '',
    operationHash: operationHash ?? '',
    ...(method === 'GET' && { variables: JSON.stringify(variables) }),
  })

  // Key difference from FastStore SDK: we include the full query string
  // in the POST body so persisted queries are not required.
  const body =
    method === 'POST'
      ? JSON.stringify({
          operationName,
          operationHash,
          variables,
          ...(operation.query ? { query: operation.query } : {}),
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

  return response.json()
}

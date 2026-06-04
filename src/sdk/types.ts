/**
 * QueryExecutor — matches the signature of FastStore's src/sdk/graphql/useQuery exactly.
 *
 * T = response data type
 * V = variables type
 *
 * The return shape mirrors SWR: data is undefined while loading (not null),
 * and isValidating is used instead of loading.
 * Component hooks map isValidating → loading and data !== undefined → data.
 */
export interface QueryExecutor {
  <T, V = Record<string, unknown>>(
    query: { __meta__: { operationName: string; storeName?: string } },
    variables: V,
    options?: { doNotRun?: boolean }
  ): { data: T | undefined; isValidating: boolean; error?: unknown }
}

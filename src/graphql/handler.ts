/**
 * Vrein API Route Handler
 *
 * FastStore uses persisted queries (trusted documents) on /api/graphql.
 * External packages can't register queries there, so any custom query
 * gets rejected with 400 Bad Request.
 *
 * This handler provides a standalone GraphQL-like endpoint that consumers
 * mount at /api/vrein (or any other path). It dispatches operations directly
 * to the Vrein resolvers, bypassing FastStore's persisted-query gate.
 *
 * Usage (Pages Router):
 *   // pages/api/vrein.ts
 *   import { createVreinApiHandler } from '@vreinai/faststore-components/graphql'
 *   export default createVreinApiHandler()
 *
 * Usage (App Router):
 *   // app/api/vrein/route.ts
 *   import { createVreinRouteHandlers } from '@vreinai/faststore-components/graphql'
 *   export const { GET, POST } = createVreinRouteHandlers()
 */

import { vreinResolvers } from './resolvers/vrein'

// ---------------------------------------------------------------------------
// Operation → resolver mapping
// ---------------------------------------------------------------------------

interface OperationMapping {
  resolver: (parent: any, args: any, context: any) => Promise<any>
  responseField: string
}

const operationMap: Record<string, OperationMapping> = {
  VreinProductsQuery: {
    resolver: vreinResolvers.Query.vreinProducts,
    responseField: 'vreinProducts',
  },
  VreinImagesQuery: {
    resolver: vreinResolvers.Query.vreinImages,
    responseField: 'vreinImages',
  },
  VreinProductDataQuery: {
    resolver: vreinResolvers.Query.vreinProductData,
    responseField: 'vreinProductData',
  },
  VreinCategoryIdQuery: {
    resolver: vreinResolvers.Query.vreinCategoryId,
    responseField: 'vreinCategoryId',
  },
}

// ---------------------------------------------------------------------------
// Core dispatcher
// ---------------------------------------------------------------------------

async function handleVreinRequest(
  operationName: string,
  variables: Record<string, any>
): Promise<{ data?: any; errors?: Array<{ message: string }> }> {
  const mapping = operationMap[operationName]

  if (!mapping) {
    return {
      errors: [
        {
          message: `[Vrein Handler] Unknown operation: "${operationName}". Available: ${Object.keys(operationMap).join(', ')}`,
        },
      ],
    }
  }

  try {
    const result = await mapping.resolver(null, variables, {})
    return {
      data: { [mapping.responseField]: result },
    }
  } catch (error: any) {
    console.error(`[Vrein Handler] Error executing ${operationName}:`, error)
    return {
      errors: [{ message: error.message || 'Internal server error' }],
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseSafe(json: string): any {
  try {
    return JSON.parse(json)
  } catch {
    return {}
  }
}

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// ---------------------------------------------------------------------------
// Pages Router handler  —  pages/api/vrein.ts
// ---------------------------------------------------------------------------

/**
 * Creates an API handler compatible with Next.js Pages Router.
 *
 * @example
 * ```ts
 * // pages/api/vrein.ts
 * import { createVreinApiHandler } from '@vreinai/faststore-components/graphql'
 * export default createVreinApiHandler()
 * ```
 */
export function createVreinApiHandler() {
  return async (req: any, res: any) => {
    // CORS
    for (const [k, v] of Object.entries(CORS_HEADERS)) {
      res.setHeader(k, v)
    }

    if (req.method === 'OPTIONS') {
      return res.status(200).end()
    }

    let operationName = ''
    let variables: Record<string, any> = {}

    if (req.method === 'GET') {
      operationName = (req.query?.operationName as string) || ''
      variables =
        typeof req.query?.variables === 'string'
          ? parseSafe(req.query.variables)
          : {}
    } else {
      // POST (or any other method)
      const body =
        typeof req.body === 'string' ? parseSafe(req.body) : req.body || {}
      operationName = body.operationName || ''
      variables = body.variables || {}
    }

    const result = await handleVreinRequest(operationName, variables)

    const status = result.errors?.length ? 400 : 200
    return res.status(status).json(result)
  }
}

// ---------------------------------------------------------------------------
// App Router handlers  —  app/api/vrein/route.ts
// ---------------------------------------------------------------------------

async function handleAppRouterRequest(request: Request): Promise<Response> {
  let operationName = ''
  let variables: Record<string, any> = {}

  const url = new URL(request.url)

  if (request.method === 'GET') {
    operationName = url.searchParams.get('operationName') || ''
    const varsStr = url.searchParams.get('variables')
    variables = varsStr ? parseSafe(varsStr) : {}
  } else {
    try {
      const body = await request.json()
      operationName = body.operationName || ''
      variables = body.variables || {}
    } catch {
      // invalid JSON
    }
  }

  const result = await handleVreinRequest(operationName, variables)
  const status = result.errors?.length ? 400 : 200

  return new Response(JSON.stringify(result), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  })
}

/**
 * Creates route handlers compatible with Next.js App Router.
 *
 * @example
 * ```ts
 * // app/api/vrein/route.ts
 * import { createVreinRouteHandlers } from '@vreinai/faststore-components/graphql'
 * export const { GET, POST } = createVreinRouteHandlers()
 * ```
 */
export function createVreinRouteHandlers() {
  return {
    GET: handleAppRouterRequest,
    POST: handleAppRouterRequest,
    OPTIONS: async () =>
      new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      }),
  }
}

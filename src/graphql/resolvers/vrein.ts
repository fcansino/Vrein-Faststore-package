// Re-export the resolver from the original source.
// The consumer project should import this and register it in their GraphQL setup.
// This file contains the full server-side resolver logic.

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const vreinResponseCache = new Map<string, CacheEntry<any[]>>()
const skuProductCache = new Map<string, CacheEntry<any>>()

const VREIN_CACHE_TTL_MS = Number(process.env.VREIN_CACHE_TTL_MS) || 60_000
const VTEX_CACHE_TTL_MS  = Number(process.env.VTEX_CACHE_TTL_MS)  || 300_000
const MAX_CACHE_SIZE     = 500
const BATCH_SIZE         = 20

function getCached<T>(cache: Map<string, CacheEntry<T>>, key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return null
  }
  return entry.data
}

function setCached<T>(cache: Map<string, CacheEntry<T>>, key: string, data: T, ttlMs: number): void {
  if (cache.size >= MAX_CACHE_SIZE) {
    const oldestKey = cache.keys().next().value
    if (oldestKey !== undefined) cache.delete(oldestKey)
  }
  cache.set(key, { data, expiresAt: Date.now() + ttlMs })
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

async function buildVreinU(context: string, vtexAccount: string): Promise<string> {
  let parsed: any
  try {
    parsed = JSON.parse(context)
  } catch {
    return context || 'home//'
  }

  const {
    pageType,
    productId,
    categoryId,
    searchTerm,
    lastProducts = '',
    lastSku = '',
    lastCategory = '',
    cartProducts = '',
    queryTerm = '',
    zipcode = '',
  } = parsed

  const zipcodeParam = zipcode ? `/${zipcode}` : ''

  switch (pageType) {
    case 'home': {
      const queryLogic = queryTerm || ''
      return `/home/1/${lastCategory}/${lastProducts}/${cartProducts}/${queryLogic}${zipcodeParam}`
    }

    case 'product': {
      if (!productId) {
        return `/home/1/${lastCategory}/${lastProducts}/${cartProducts}/${queryTerm || ''}${zipcodeParam}`
      }

      let directCat = ''
      let indirectCat = ''
      let allCatIds = ''

      let filteredLastProducts = lastProducts
      if (lastProducts) {
        const prodArray = lastProducts.split(',').filter((id: string) => id !== String(productId))
        filteredLastProducts = prodArray.join(',')
      }

      try {
        const catalogUrl = `https://${vtexAccount}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=productId:${productId}`
        const res = await fetch(catalogUrl, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        })

        if (res.ok) {
          const data = await res.json()
          if (data?.[0]?.categoriesIds?.[0]) {
            const rawPath = data[0].categoriesIds[0] as string
            const categorias = rawPath.substring(1, rawPath.length - 1).split('/')
            directCat = categorias[categorias.length - 1] || ''
            indirectCat = categorias.length < 3
              ? categorias[0] || ''
              : categorias[categorias.length - 2] || ''
            allCatIds = categorias.join(',')
          }
        }
      } catch (err) {
        console.warn('[Vrein Resolver] Failed to fetch product categories:', err)
      }

      return `product/${productId}/${directCat}/${indirectCat}/${allCatIds}/${filteredLastProducts}/${lastSku}/${cartProducts}${zipcodeParam}`
    }

    case 'category':
      return `/category/${categoryId || lastCategory}//${lastProducts}/${cartProducts}${zipcodeParam}`

    case 'search':
      return `/search/${searchTerm || ''}/${lastCategory}${zipcodeParam}`

    case 'searchnoresult':
      return `/searchnoresult/${searchTerm || ''}/${lastCategory}${zipcodeParam}`

    default:
      return `/home/1/${lastCategory}/${lastProducts}/${cartProducts}/${queryTerm || ''}${zipcodeParam}`
  }
}

function transformToFastStoreProduct(vtexProduct: any, targetSkuId?: string) {
  try {
    if (!vtexProduct || !vtexProduct.items || vtexProduct.items.length === 0) {
      return null
    }

    let targetItem = vtexProduct.items[0]
    if (targetSkuId) {
      const match = vtexProduct.items.find(
        (item: any) => String(item.itemId) === String(targetSkuId)
      )
      if (match) targetItem = match
    }

    const seller = targetItem.sellers?.[0]
    const offer = seller?.commertialOffer

    if (!offer) return null

    const imageUrl = targetItem.images?.[0]?.imageUrl || ''
    const cleanImageUrl = imageUrl.replace(/-55-55/g, '-300-300')

    const categories = vtexProduct.categories || []
    const categoryPath = categories[0] || ''
    const categoryIds = (vtexProduct.categoriesIds || []).join(',')

    return {
      id: String(vtexProduct.productId || ''),
      sku: String(targetItem.itemId || ''),
      slug: String(vtexProduct.linkText || vtexProduct.productId || ''),
      name: String(vtexProduct.productName || 'Producto sin nombre'),
      brand: {
        name: String(vtexProduct.brand || 'Sin marca'),
      },
      categories: categoryPath,
      categoryIds: categoryIds,
      image: [
        {
          url: cleanImageUrl || 'https://via.placeholder.com/300x300',
          alternateName: String(vtexProduct.productName || 'Producto'),
        },
      ],
      offers: {
        offers: [
          {
            price: Number(offer.Price) || 0,
            listPrice: Number(offer.ListPrice || offer.Price) || 0,
            availability:
              offer.AvailableQuantity > 0
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
          },
        ],
      },
      isVariantOf: {
        productGroupID: String(vtexProduct.productId || ''),
        name: String(vtexProduct.productName || 'Producto sin nombre'),
      },
    }
  } catch (error) {
    console.error('[Vrein Resolver] Error transforming product:', error)
    return null
  }
}

function transformToFullProduct(vtexProduct: any) {
  try {
    if (!vtexProduct || !vtexProduct.items || vtexProduct.items.length === 0) {
      return null
    }

    const firstItem = vtexProduct.items[0]
    const seller = firstItem.sellers?.[0]
    const offer = seller?.commertialOffer

    const imageUrl = firstItem.images?.[0]?.imageUrl || ''
    const cleanImageUrl = imageUrl.replace(/-55-55/g, '-300-300')

    const categories = vtexProduct.categories || []
    const categoryPath = categories[0] || ''
    const rawCatPath: string = (vtexProduct.categoriesIds || [])[0] || ''
    const categoryIds = rawCatPath
      ? rawCatPath.substring(1, rawCatPath.length - 1).replace(/\//g, ',')
      : ''

    const categoryNames = categories.map((cat: string) =>
      cat.replace(/^\//, '').replace(/\/$/, '')
    ).join(' > ')

    return {
      id: String(vtexProduct.productId || ''),
      sku: String(firstItem.itemId || ''),
      slug: String(vtexProduct.linkText || ''),
      name: String(vtexProduct.productName || ''),
      description: String(vtexProduct.description || ''),
      brand: String(vtexProduct.brand || ''),
      categories: categoryPath,
      categoryIds: categoryIds,
      categoryNames: categoryNames,
      price: Number(offer?.Price) || 0,
      listPrice: Number(offer?.ListPrice || offer?.Price) || 0,
      availability: offer?.AvailableQuantity > 0 ? 'InStock' : 'OutOfStock',
      image: cleanImageUrl,
      url: `/${vtexProduct.linkText}/p`,
      clusterHighlights: vtexProduct.clusterHighlights || {},
      productClusters: vtexProduct.productClusters || {},
      allSpecifications: vtexProduct.allSpecifications || [],
      allSpecificationsGroups: vtexProduct.allSpecificationsGroups || []
    }
  } catch (error) {
    console.error('[Vrein Resolver] Error transforming full product:', error)
    return null
  }
}

export const vreinResolvers = {
  Query: {
    vreinProducts: async (_: any, { sectionId, context }: any, ctx: any) => {
      try {
        const VREIN_HASH = process.env.NEXT_PUBLIC_VREIN_HASH || process.env.VREIN_HASH
        if (!VREIN_HASH) {
          throw new Error('[Vrein Resolver] NEXT_PUBLIC_VREIN_HASH env var is required but not set.')
        }

        console.log('[Vrein Resolver] Fetching recommendations for section:', sectionId)

        const VREIN_API_URL = 'https://s2.braindw.com/tracking/track'
        const VREIN_BRANCH_OFFICE = '1'
        const VREIN_SECRET = '9DIIDJ7DHDA8SDUA9SUOKDS2309.DJDJC.99DD8U3'
        const VTEX_ACCOUNT = process.env.VTEX_ACCOUNT || 'brain'

        let sessionGuid = ''
        let path = '/'
        try {
          const ctxParsed = JSON.parse(context || '{}')
          sessionGuid = ctxParsed.sessionGuid || ''
          path = ctxParsed.path || '/'
        } catch {
          // ignore
        }

        const contextParam = await buildVreinU(context || 'home//', VTEX_ACCOUNT)
        console.log('[Vrein Resolver] Built u param:', contextParam)

        const timestamp = Date.now()
        const vreinUrl = `${VREIN_API_URL}?HASH=${VREIN_HASH}&branchOffice=${VREIN_BRANCH_OFFICE}&u=${encodeURIComponent(contextParam)}&hs=${timestamp}&upath=${encodeURIComponent(path)}&sectionId=${encodeURIComponent(sectionId)}`

        const vreinCacheKey = `${VREIN_HASH}:${VREIN_BRANCH_OFFICE}:${sectionId}:${contextParam}`
        let vreinData = getCached<any[]>(vreinResponseCache, vreinCacheKey)

        if (vreinData) {
          console.log('[Vrein Resolver] Vrein API cache HIT for key:', vreinCacheKey)
        } else {
          console.log('[Vrein Resolver] Calling Vrein API:', vreinUrl)

          const cookies = sessionGuid ? ` guid=${sessionGuid}; ` : ''

          const vreinResponse = await fetch(vreinUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              ...(VREIN_SECRET ? {
                'bdw_secretcode': VREIN_SECRET,
                'bdw-secretcode': VREIN_SECRET,
              } : {}),
              'bdw_sectionid': sectionId,
              'X-VTEX-Use-Https': 'true',
              ...(cookies ? { 'Cookie': cookies } : {}),
            },
          })

          if (!vreinResponse.ok) {
            console.error('[Vrein Resolver] Vrein API error:', vreinResponse.status)
            return { products: [], totalCount: 0, title: '', endpointName: '', apiUrl: vreinUrl }
          }

          vreinData = await vreinResponse.json()
          setCached(vreinResponseCache, vreinCacheKey, vreinData!, VREIN_CACHE_TTL_MS)
        }

        const sections = vreinData as any[]

        const sectionIdLower = sectionId.toLowerCase()
        const section = sections.find((item: any) => item.Section?.toLowerCase() === sectionIdLower)

        if (!section || !section.Products || section.Products.length === 0) {
          console.warn('[Vrein Resolver] Section not found or empty:', sectionId)
          return { products: [], totalCount: 0, title: '', endpointName: '', apiUrl: vreinUrl }
        }

        const skus: string[] = section.Products

        const cachedProducts: Map<string, any> = new Map()
        const fetchNeeded: string[] = []

        for (const sku of skus) {
          const cached = getCached<any>(skuProductCache, sku)
          if (cached) {
            cachedProducts.set(sku, cached)
          } else {
            fetchNeeded.push(sku)
          }
        }

        const fetchedProducts: Map<string, any> = new Map()

        if (fetchNeeded.length > 0) {
          const chunks = chunkArray(fetchNeeded, BATCH_SIZE)

          const batchResults = await Promise.allSettled(
            chunks.map(async (chunk) => {
              const fqParams = chunk.map((sku) => `fq=skuId:${sku}`).join('&')
              const url = `https://${VTEX_ACCOUNT}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?${fqParams}`

              const response = await fetch(url, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                },
              })

              if (!response.ok) {
                throw new Error(`HTTP ${response.status} for batch of ${chunk.length} SKUs`)
              }

              const products: any[] = await response.json()
              return { chunk, products }
            })
          )

          for (const result of batchResults) {
            if (result.status === 'fulfilled') {
              const { chunk, products } = result.value

              const skuToProduct = new Map<string, any>()
              for (const vtexProduct of products) {
                if (!vtexProduct?.items) continue
                for (const item of vtexProduct.items) {
                  if (chunk.includes(String(item.itemId))) {
                    skuToProduct.set(String(item.itemId), vtexProduct)
                  }
                }
              }

              for (const sku of chunk) {
                const vtexProduct = skuToProduct.get(sku)
                if (!vtexProduct) continue

                const transformed = transformToFastStoreProduct(vtexProduct, sku)
                if (transformed) {
                  setCached(skuProductCache, sku, transformed, VTEX_CACHE_TTL_MS)
                  fetchedProducts.set(sku, transformed)
                }
              }
            } else {
              console.warn('[Vrein Resolver] Batch fetch failed:', result.reason?.message || result.reason)
            }
          }
        }

        const products: any[] = []
        for (const sku of skus) {
          const product = cachedProducts.get(sku) || fetchedProducts.get(sku)
          if (product) {
            products.push(product)
          }
        }

        console.log('[Vrein Resolver] Successfully fetched', products.length, 'products')

        return {
          products,
          totalCount: products.length,
          title: section.Title || '',
          endpointName: section.Endpoint || 'Contenidos',
          apiUrl: vreinUrl
        }
      } catch (error) {
        console.error('[Vrein Resolver] Error:', error)
        return { products: [], totalCount: 0, title: '', endpointName: '', apiUrl: '' }
      }
    },

    vreinImages: async (_: any, { sectionId, email, categoryId, whitelabel, sessionGuid }: any) => {
      try {
        const VREIN_HASH = process.env.NEXT_PUBLIC_VREIN_HASH || process.env.VREIN_HASH
        if (!VREIN_HASH) {
          throw new Error('[Vrein Resolver] NEXT_PUBLIC_VREIN_HASH env var is required but not set.')
        }

        const VREIN_BRANCH_OFFICE = '1'
        const VREIN_SECRET = '9DIIDJ7DHDA8SDUA9SUOKDS2309.DJDJC.99DD8U3'

        const params = new URLSearchParams({
          HASH: VREIN_HASH,
          email: email || '',
          branchOffice: VREIN_BRANCH_OFFICE,
          whitelabel: whitelabel || '',
          sectionid: sectionId,
          idcategory: categoryId || '',
        })

        const url = `https://s2.braindw.com/tracking/SmartImage?${params}`

        const cookies = sessionGuid ? `guid=${sessionGuid};` : ''

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'X-VTEX-Use-Https': 'true',
            'Cache-Control': 'no-store',
            ...(VREIN_SECRET ? { 'bdw-secretcode': VREIN_SECRET } : {}),
            ...(cookies ? { 'Cookie': cookies } : {}),
          },
        })

        if (!response.ok) {
          console.error('[Vrein Resolver] SmartImage API error:', response.status)
          return { images: [], smartCountdown: null }
        }

        const data = await response.json()

        if (!data || data.length === 0 || !data[0]?.Images) {
          return { images: [], smartCountdown: null }
        }

        const section = data[0]

        const images = section.Images.map((img: any) => ({
          title: section.Title || '',
          image: img.UrlDesktop || '',
          mobileImage: img.UrlMobile || '',
          link: img.Link || '',
        }))

        const smartCountdown = section.SmartCountdown
          ? {
              dateStart: section.SmartCountdown.DateStart || '',
              dateEnd: section.SmartCountdown.DateEnd || '',
              fontSizeDesktop: section.SmartCountdown.FontSizeDesktop || 20,
              fontSizeMobile: section.SmartCountdown.FontSizeMobile || 14,
              positionDesktop: section.SmartCountdown.PositionDesktop || '2.2',
              positionMobile: section.SmartCountdown.PositionMobile || '2.2',
              fontColor: section.SmartCountdown.FontColor || 'white',
              enabled: section.SmartCountdown.Enabled || false,
              timeZoneOffset: section.SmartCountdown.TimeZoneOffset || 0,
            }
          : null

        return { images, smartCountdown }
      } catch (error) {
        console.error('[Vrein Resolver] Error fetching images:', error)
        return { images: [], smartCountdown: null }
      }
    },

    vreinProductData: async (_: any, { productId, skuId }: any) => {
      try {
        const VTEX_ACCOUNT = process.env.VTEX_ACCOUNT || 'brain'

        let url = ''
        if (skuId) {
          url = `https://${VTEX_ACCOUNT}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=skuId:${skuId}`
        } else if (productId) {
          url = `https://${VTEX_ACCOUNT}.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=productId:${productId}`
        } else {
          return null
        }

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        })

        if (!response.ok) return null

        const data = await response.json()
        if (!data || data.length === 0) return null

        return transformToFullProduct(data[0])
      } catch (error) {
        console.error('[Vrein Resolver] Error fetching product data:', error)
        return null
      }
    },

    vreinCategoryId: async (_: any, { pathname }: any) => {
      try {
        const VTEX_ACCOUNT = process.env.VTEX_ACCOUNT || 'brain'
        const parts = (pathname || '').split('/').filter(Boolean)

        if (parts.length === 0) return { categoryId: '' }

        const depth = Math.max(parts.length, 3)
        const treeUrl = `https://${VTEX_ACCOUNT}.vtexcommercestable.com.br/api/catalog_system/pub/category/tree/${depth}`
        const res = await fetch(treeUrl, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        })

        if (!res.ok) return { categoryId: '' }

        const tree = await res.json()

        let currentLevel = tree
        let found: any = null

        for (const slug of parts) {
          found = currentLevel.find((cat: any) => {
            const catUrl = cat.url || ''
            const catSlug = catUrl.split('/').filter(Boolean).pop() || ''
            return slug.toLowerCase() === catSlug.toLowerCase()
          })

          if (!found) break
          currentLevel = found.children || []
        }

        return { categoryId: found ? String(found.id) : '' }
      } catch (error) {
        console.error('[Vrein Resolver] Error resolving categoryId:', error)
        return { categoryId: '' }
      }
    }
  }
}

export default vreinResolvers

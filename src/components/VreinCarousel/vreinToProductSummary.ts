import type { VreinProduct } from '../../types/vrein'

function normalizeImageUrl(url: string): string {
  if (!url || url.includes('via.placeholder.com')) return ''
  return url
    .replace('vteximg.com.br/arquivos/ids/', 'vtexassets.com/arquivos/ids/')
    .replace(/-\d+-\d+(\/[^/]+\.[a-z]+)$/, '$1')
}

export function vreinToProductSummary(item: VreinProduct) {
  const firstOffer = item.offers?.offers?.[0]

  const normalizedImages = (item.image ?? [])
    .map((img: any) => ({ ...img, url: normalizeImageUrl(img.url) }))
    .filter((img: any) => img.url !== '')

  return {
    id: item.id,
    slug: item.slug,
    sku: item.sku,
    name: item.name,
    gtin: '',
    unitMultiplier: null as number | null,
    brand: {
      name: item.brand?.name ?? '',
      brandName: item.brand?.name ?? '',
    },
    isVariantOf: {
      productGroupID: item.isVariantOf?.productGroupID ?? item.id,
      name: item.isVariantOf?.name ?? item.name,
      skuVariants: null as null,
    },
    image: normalizedImages.length > 0 ? normalizedImages : [{ url: '', alternateName: item.name }],
    offers: {
      lowPrice: firstOffer?.price ?? 0,
      lowPriceWithTaxes: firstOffer?.price ?? 0,
      offers: [
        {
          availability: firstOffer?.availability ?? 'https://schema.org/InStock',
          price: firstOffer?.price ?? 0,
          listPrice: firstOffer?.listPrice ?? 0,
          listPriceWithTaxes: firstOffer?.listPrice ?? 0,
          priceWithTaxes: firstOffer?.price ?? 0,
          quantity: 1,
          seller: { identifier: '1' },
        },
      ],
    },
    additionalProperty: [] as Array<{
      propertyID: string
      name: string
      value: unknown
      valueReference: unknown
    }>,
    advertisement: null as null,
  }
}

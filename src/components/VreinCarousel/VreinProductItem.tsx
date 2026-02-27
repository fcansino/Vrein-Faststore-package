import React from 'react'
import {
  ProductCard,
  ProductCardContent,
  ProductCardImage,
} from '@faststore/ui'
import type { VreinProduct } from '../../types/vrein'

type VreinProductItemProps = {
  item: VreinProduct
  bordered?: boolean
  showDiscountBadge?: boolean
  position?: number
  onProductClick?: (productId: string, productName: string, position: number) => void
}

export const VreinProductItem = ({
  item,
  bordered = false,
  showDiscountBadge = true,
  position = 0,
  onProductClick,
}: VreinProductItemProps) => {
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <ProductCard
      bordered={bordered}
      onClick={onProductClick
        ? () => onProductClick(item.sku, item.isVariantOf.name, position)
        : undefined}
    >
      <ProductCardImage aspectRatio={1}>
        <img
          data-fs-image
          src={item.image[0].url}
          alt={item.image[0].alternateName}
          loading="lazy"
        />
      </ProductCardImage>
      <ProductCardContent
        linkProps={{
          href: `/${item.slug}/p`,
        }}
        title={item.isVariantOf.name}
        price={{
          value: item.offers.offers[0].price,
          listPrice: item.offers.offers[0].listPrice,
          formatter: formatPrice,
        }}
        showDiscountBadge={showDiscountBadge}
      />
    </ProductCard>
  )
}

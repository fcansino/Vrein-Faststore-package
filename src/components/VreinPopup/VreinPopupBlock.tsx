import React from 'react'
import { Carousel } from '@faststore/ui'
import { VreinProductItem } from '../VreinCarousel/VreinProductItem'
import { safeHttpUrl } from './safeUrl'
import { blockContainerStyle, blockTitleStyle, blockCtaStyle } from './styles'
import type { VreinPopupBlock as VreinPopupBlockData } from '../../types/vrein'

type VreinPopupBlockProps = {
  block: VreinPopupBlockData
}

/**
 * One resolved popup block: optional title, a product carousel built from
 * the same `VreinProductItem` the carousel uses, and an optional CTA link.
 *
 * The API-supplied `link` is routed through `safeHttpUrl()` before ever
 * reaching an `href` (design safety note #1); no CTA renders when it comes
 * back `null`. `title` and the GA passthrough fields render as plain text /
 * attributes only — no `dangerouslySetInnerHTML` anywhere in this tree
 * (design safety note #2).
 */
export const VreinPopupBlock = ({ block }: VreinPopupBlockProps) => {
  const ctaHref = safeHttpUrl(block.link)

  return (
    <div
      data-vrein-popup-block-id={block.blockId}
      data-vrein-ga-event-action={block.gaEventAction || undefined}
      data-vrein-ga-event-category={block.gaEventCategory || undefined}
      data-vrein-ga-event-label={block.gaEventLabel || undefined}
      style={blockContainerStyle}
    >
      {block.title && <h3 style={blockTitleStyle}>{block.title}</h3>}

      <Carousel
        id={`vrein-popup-block-${block.blockId}`}
        itemsPerPage={2}
        variant="scroll"
        infiniteMode={false}
      >
        {block.products.map((product, index) => (
          <VreinProductItem key={product.sku} item={product} position={index} />
        ))}
      </Carousel>

      {ctaHref && (
        <a href={ctaHref} style={blockCtaStyle}>
          Ver más
        </a>
      )}
    </div>
  )
}

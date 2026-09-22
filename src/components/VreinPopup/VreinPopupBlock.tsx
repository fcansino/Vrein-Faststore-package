import React from 'react'
import { Carousel } from '@faststore/ui'
import { VreinProductItem } from '../VreinCarousel/VreinProductItem'
import { safeHttpUrl } from './safeUrl'
import {
  blockContainerStyle,
  blockTitleStyle,
  blockCtaStyle,
  bannerWrapperStyle,
  bannerLinkStyle,
  bannerImageStyle,
} from './styles'
import type { VreinPopupBlock as VreinPopupBlockData, VreinPopupImage } from '../../types/vrein'

type VreinPopupBlockProps = {
  block: VreinPopupBlockData
}

// Mobile source kicks in at the same breakpoint `useIsMobile` uses elsewhere
// in this package, so the banner's art direction matches the rest of the
// popup's mobile/desktop split.
const MOBILE_BREAKPOINT_QUERY = '(max-width: 768px)'

/**
 * One image inside an "images" block: a `<picture>` with a mobile `<source>`
 * (art-directed via media query) and the desktop image as the `<img>`
 * fallback, optionally wrapped in a link. Only `urlDesktop`/`urlMobile` reach
 * the DOM as `src`/`srcSet` — no `dangerouslySetInnerHTML` involved — and the
 * wrapping `<a>` only renders when `safeHttpUrl(image.link)` is non-null
 * (same XSS-prevention rule as the block-level CTA below).
 */
function VreinPopupBannerImage({
  image,
  alt,
  index,
}: {
  image: VreinPopupImage
  alt: string
  index: number
}) {
  const href = safeHttpUrl(image.link)
  // At least one of urlDesktop/urlMobile is guaranteed non-empty by the
  // resolver; the other can still fall back to it so <img src> is never "".
  const desktopSrc = image.urlDesktop || image.urlMobile
  const mobileSrc = image.urlMobile || image.urlDesktop

  const picture = (
    <picture>
      {mobileSrc && <source media={MOBILE_BREAKPOINT_QUERY} srcSet={mobileSrc} />}
      <img src={desktopSrc} alt={alt} style={bannerImageStyle} loading="lazy" />
    </picture>
  )

  return (
    <div key={index} style={bannerWrapperStyle}>
      {href ? (
        <a href={href} style={bannerLinkStyle}>
          {picture}
        </a>
      ) : (
        picture
      )}
    </div>
  )
}

/**
 * One resolved popup block: optional title, then either a product carousel
 * (built from the same `VreinProductItem` the carousel uses) or a stack of
 * image banners, depending on `block.blockType`, plus an optional CTA link.
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
      data-vrein-popup-block-type={block.blockType}
      data-vrein-ga-event-action={block.gaEventAction || undefined}
      data-vrein-ga-event-category={block.gaEventCategory || undefined}
      data-vrein-ga-event-label={block.gaEventLabel || undefined}
      style={blockContainerStyle}
    >
      {block.title && <h3 style={blockTitleStyle}>{block.title}</h3>}

      {block.blockType === 'images' ? (
        block.images.map((image, index) => (
          <VreinPopupBannerImage
            key={index}
            image={image}
            alt={block.title || `Banner ${index + 1}`}
            index={index}
          />
        ))
      ) : (
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
      )}

      {ctaHref && (
        <a href={ctaHref} style={blockCtaStyle}>
          Ver más
        </a>
      )}
    </div>
  )
}

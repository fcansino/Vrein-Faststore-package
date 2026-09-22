import type { CSSProperties } from 'react'

/**
 * Inline style objects for VreinPopup. No `.scss` file in package `src` for
 * this component (D14) — matches the existing VreinCarousel/VreinImageBanner
 * convention: inline styles plus stable `data-vrein-popup*` attributes.
 *
 * Every themable value is exposed as a `--vrein-popup-*` CSS custom property
 * with an inline fallback, so the storefront can theme the popup (a global
 * stylesheet, or a wrapper class overriding the custom properties) without a
 * package release.
 */

export const VREIN_POPUP_Z_INDEX = 1000

export const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: VREIN_POPUP_Z_INDEX,
  background: 'var(--vrein-popup-overlay-bg, rgba(0, 0, 0, 0.5))',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'var(--vrein-popup-overlay-padding, 16px)',
}

export const modalBoxStyle: CSSProperties = {
  position: 'relative',
  width: '100%',
  maxWidth: 'var(--vrein-popup-modal-max-width, 640px)',
  maxHeight: 'var(--vrein-popup-modal-max-height, 90vh)',
  overflowY: 'auto',
  background: 'var(--vrein-popup-modal-bg, #ffffff)',
  borderRadius: 'var(--vrein-popup-modal-radius, 8px)',
  padding: 'var(--vrein-popup-modal-padding, 24px)',
  boxShadow: 'var(--vrein-popup-modal-shadow, 0 8px 32px rgba(0, 0, 0, 0.25))',
}

export const closeButtonStyle: CSSProperties = {
  position: 'absolute',
  top: 'var(--vrein-popup-close-offset, 12px)',
  right: 'var(--vrein-popup-close-offset, 12px)',
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: '22px',
  lineHeight: 1,
  color: 'var(--vrein-popup-close-color, #333333)',
}

export function sliderRailStyle(collapsed: boolean): CSSProperties {
  return {
    position: 'fixed',
    top: '50%',
    right: collapsed ? 'calc(var(--vrein-popup-slider-width, 280px) * -1)' : '0',
    transform: 'translateY(-50%)',
    width: 'var(--vrein-popup-slider-width, 280px)',
    maxHeight: 'var(--vrein-popup-slider-max-height, 80vh)',
    overflowY: 'auto',
    background: 'var(--vrein-popup-slider-bg, #ffffff)',
    boxShadow: 'var(--vrein-popup-slider-shadow, -2px 0 12px rgba(0, 0, 0, 0.15))',
    borderRadius: 'var(--vrein-popup-slider-radius, 8px 0 0 8px)',
    zIndex: VREIN_POPUP_Z_INDEX,
    padding: 'var(--vrein-popup-slider-padding, 16px)',
    transition: 'right 0.25s ease-in-out',
  }
}

export const sliderToggleStyle: CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: 0,
  transform: 'translate(-100%, -50%) rotate(180deg)',
  writingMode: 'vertical-rl',
  border: 'none',
  background: 'var(--vrein-popup-slider-toggle-bg, #ffffff)',
  boxShadow: 'var(--vrein-popup-slider-shadow, -2px 0 12px rgba(0, 0, 0, 0.15))',
  borderRadius: '8px 0 0 8px',
  padding: '12px 6px',
  cursor: 'pointer',
  fontSize: '13px',
  color: 'var(--vrein-popup-slider-toggle-color, #333333)',
  whiteSpace: 'nowrap',
}

export const blockTitleStyle: CSSProperties = {
  fontSize: 'var(--vrein-popup-block-title-size, 1.125rem)',
  fontWeight: 600,
  marginBottom: 'var(--vrein-popup-block-title-margin, 12px)',
}

export const blockCtaStyle: CSSProperties = {
  display: 'inline-block',
  marginTop: 'var(--vrein-popup-block-cta-margin, 12px)',
  textDecoration: 'underline',
  color: 'var(--vrein-popup-block-cta-color, inherit)',
}

export const blockContainerStyle: CSSProperties = {
  marginBottom: 'var(--vrein-popup-block-gap, 20px)',
}

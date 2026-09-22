'use client'

import React, { useEffect, useRef } from 'react'
import type { VreinPopupData } from '../../types/vrein'
import { VreinPopupBlock } from './VreinPopupBlock'
import { overlayStyle, modalBoxStyle, closeButtonStyle } from './styles'

type VreinPopupModalProps = {
  data: VreinPopupData
  section: string
  onClose: () => void
}

/**
 * Overlay + centered content box + close control, capable of rendering one
 * or two resolved blocks in the same modal instance. Owns the dismiss
 * interaction (calls `onClose`, which the root wires to `usePopupDismissal`'s
 * `dismiss()`).
 *
 * Accessibility: `role="dialog"`, `aria-modal="true"`, an accessible close
 * label, Escape-to-close, and focus restoration on close (design safety
 * note #8 — the Magento reference only has a bare `aria-label`).
 */
export const VreinPopupModal = ({ data, section, onClose }: VreinPopupModalProps) => {
  const boxRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    previouslyFocused.current =
      typeof document !== 'undefined' ? (document.activeElement as HTMLElement | null) : null
    boxRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocused.current?.focus?.()
    }
  }, [onClose])

  return (
    <div
      data-vrein-popup
      data-type="modal"
      data-section={section}
      data-vrein-popup-backdrop
      style={overlayStyle}
      onClick={onClose}
    >
      <div
        ref={boxRef}
        role="dialog"
        aria-modal="true"
        aria-label="Promoción"
        tabIndex={-1}
        style={modalBoxStyle}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          data-vrein-popup-close
          aria-label="Cerrar"
          style={closeButtonStyle}
          onClick={onClose}
        >
          ×
        </button>

        {data.blocks.map((block) => (
          <VreinPopupBlock key={block.blockId} block={block} />
        ))}
      </div>
    </div>
  )
}

'use client'

import React from 'react'
import type { VreinPopupData } from '../../types/vrein'
import { VreinPopupBlock } from './VreinPopupBlock'
import { sliderRailStyle, sliderToggleStyle } from './styles'

type VreinPopupSliderProps = {
  data: VreinPopupData
  section: string
  collapsed: boolean
  onToggle: () => void
}

/**
 * Fixed right rail with a collapsible vertical-label tab, capable of
 * rendering one or two resolved blocks. Never consults the ShowOnce/
 * dismissal gate — the slider has no ShowOnce logic by design (spec:
 * "ShowOnce ignored for slider"). Collapse state is owned by the root via
 * `useSliderCollapse` (sessionStorage only, never localStorage) and does not
 * survive a full page reload.
 *
 * Two-blocks UX (label from the first non-empty block's title, each block
 * kept visually separate via the shared `VreinPopupBlock`) mirrors the
 * Magento port; whether blocks should instead be flattened into one list is
 * an open product question, not resolved by this change.
 */
export const VreinPopupSlider = ({ data, section, collapsed, onToggle }: VreinPopupSliderProps) => {
  const label = data.blocks.find((block) => block.title)?.title || 'Promociones'

  return (
    <div
      data-vrein-popup
      data-type="slider"
      data-section={section}
      data-collapsed={collapsed}
      // See VreinPopupModal.tsx for why this class is required here.
      className="section"
      style={sliderRailStyle(collapsed)}
    >
      <button
        type="button"
        data-vrein-popup-toggle
        aria-expanded={!collapsed}
        aria-label={collapsed ? 'Mostrar promociones' : 'Ocultar promociones'}
        style={sliderToggleStyle}
        onClick={onToggle}
      >
        {label}
      </button>

      {data.blocks.map((block) => (
        <VreinPopupBlock key={block.blockId} block={block} />
      ))}
    </div>
  )
}

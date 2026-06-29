import { useCallback, useEffect, useState } from 'react'
import { layoutTokens } from '@/design-system/tokens/layout'

export type RightPanelVariant = 'standard' | 'wide'

const STORAGE_KEYS: Record<RightPanelVariant, string> = {
  standard: 'majesco-copilot-width',
  wide: 'majesco-detail-panel-width',
}

function clampStandardWidth(value: number) {
  return Math.min(
    layoutTokens.copilotMaxWidth,
    Math.max(layoutTokens.copilotMinWidth, value),
  )
}

function clampWideWidth(value: number) {
  if (typeof window === 'undefined') {
    return 720
  }

  const viewportWidth = window.innerWidth
  const min = Math.max(
    layoutTokens.detailPanelMinWidth,
    viewportWidth * layoutTokens.detailPanelMinRatio,
  )
  const max = viewportWidth * layoutTokens.detailPanelMaxRatio
  return Math.min(max, Math.max(min, value))
}

function defaultWidthForVariant(variant: RightPanelVariant) {
  if (variant === 'wide') {
    if (typeof window === 'undefined') return 720
    return clampWideWidth(window.innerWidth * layoutTokens.detailPanelDefaultRatio)
  }
  return layoutTokens.copilotDefaultWidth
}

function readStoredWidth(variant: RightPanelVariant) {
  if (typeof window === 'undefined') return defaultWidthForVariant(variant)

  const stored = window.localStorage.getItem(STORAGE_KEYS[variant])
  if (!stored) return defaultWidthForVariant(variant)

  const parsed = Number(stored)
  if (!Number.isFinite(parsed)) return defaultWidthForVariant(variant)

  return variant === 'wide' ? clampWideWidth(parsed) : clampStandardWidth(parsed)
}

export function useRightPanelWidth(variant: RightPanelVariant = 'standard') {
  const [width, setWidth] = useState(() => readStoredWidth(variant))

  useEffect(() => {
    setWidth(readStoredWidth(variant))
  }, [variant])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS[variant], String(width))
  }, [variant, width])

  const startResize = useCallback(
    (startX: number) => {
      const startWidth = width
      const clamp = variant === 'wide' ? clampWideWidth : clampStandardWidth

      const onMouseMove = (event: MouseEvent) => {
        const nextWidth = clamp(startWidth + (startX - event.clientX))
        setWidth(nextWidth)
      }

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }

      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    },
    [variant, width],
  )

  return { width, setWidth, startResize }
}

/** @deprecated Use useRightPanelWidth('standard') */
export function useCopilotWidth() {
  return useRightPanelWidth('standard')
}

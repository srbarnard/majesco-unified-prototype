import { useCallback, useEffect, useState } from 'react'
import { layoutTokens } from '@/design-system/tokens/layout'

export type RightPanelVariant = 'standard' | 'wide'

/**
 * Shared storage for Copilot + detail drawers so open/close swaps keep one width.
 * v3: Copilot defaults aligned to the ~1/3 detail-panel width (was fixed ~380px).
 */
const STORAGE_KEY = 'majesco-right-panel-width-v3'

function clampPanelWidth(value: number) {
  if (typeof window === 'undefined') {
    return layoutTokens.detailPanelFallbackWidth
  }

  const viewportWidth = window.innerWidth
  const min = Math.max(
    layoutTokens.detailPanelMinWidth,
    viewportWidth * layoutTokens.detailPanelMinRatio,
  )
  const max = viewportWidth * layoutTokens.detailPanelMaxRatio
  return Math.min(max, Math.max(min, value))
}

function defaultPanelWidth() {
  if (typeof window === 'undefined') return layoutTokens.detailPanelFallbackWidth
  return clampPanelWidth(window.innerWidth * layoutTokens.detailPanelDefaultRatio)
}

function readStoredWidth() {
  if (typeof window === 'undefined') return defaultPanelWidth()

  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (!stored) return defaultPanelWidth()

  const parsed = Number(stored)
  if (!Number.isFinite(parsed)) return defaultPanelWidth()

  return clampPanelWidth(parsed)
}

/**
 * Resizable right-panel width. `variant` is retained for call-site compatibility;
 * Copilot and detail panels share one default and storage key.
 */
export function useRightPanelWidth(_variant: RightPanelVariant = 'standard') {
  const [width, setWidth] = useState(() => readStoredWidth())

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(width))
  }, [width])

  const startResize = useCallback(
    (startX: number) => {
      const startWidth = width

      const onMouseMove = (event: MouseEvent) => {
        setWidth(clampPanelWidth(startWidth + (startX - event.clientX)))
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
    [width],
  )

  return { width, setWidth, startResize }
}

/** @deprecated Use useRightPanelWidth() */
export function useCopilotWidth() {
  return useRightPanelWidth('standard')
}

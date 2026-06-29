import { useCallback, useEffect, useState } from 'react'
import { layoutTokens } from '@/design-system/tokens/layout'

const STORAGE_KEY = 'majesco-copilot-width'

function clampWidth(value: number) {
  return Math.min(
    layoutTokens.copilotMaxWidth,
    Math.max(layoutTokens.copilotMinWidth, value),
  )
}

function readStoredWidth() {
  if (typeof window === 'undefined') return layoutTokens.copilotDefaultWidth
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (!stored) return layoutTokens.copilotDefaultWidth
  const parsed = Number(stored)
  return Number.isFinite(parsed) ? clampWidth(parsed) : layoutTokens.copilotDefaultWidth
}

export function useCopilotWidth() {
  const [width, setWidth] = useState(readStoredWidth)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(width))
  }, [width])

  const startResize = useCallback(
    (startX: number) => {
      const startWidth = width

      const onMouseMove = (event: MouseEvent) => {
        const nextWidth = clampWidth(startWidth + (startX - event.clientX))
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
    [width],
  )

  return { width, setWidth, startResize }
}

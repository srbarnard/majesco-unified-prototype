import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react'

type SetPanelState<T> = Dispatch<SetStateAction<T>>

/**
 * Opens Copilot by default on desktop when `shouldDefaultOpen` is true (e.g. overview tab).
 * Keeps Copilot closed on mobile until the user explicitly toggles it.
 */
export function useDesktopCopilotInitialOpen<T extends string>(
  isDesktop: boolean,
  shouldDefaultOpen: boolean,
  copilotPanel: T,
  setActivePanel: SetPanelState<T | null>,
) {
  const applied = useRef(false)

  useEffect(() => {
    if (applied.current) return
    if (isDesktop && shouldDefaultOpen) {
      setActivePanel(copilotPanel)
    }
    applied.current = true
  }, [isDesktop, shouldDefaultOpen, copilotPanel, setActivePanel])
}

/** Closes Copilot when shrinking from desktop to mobile/tablet. */
export function useCloseCopilotWhenMobile<T extends string>(
  isDesktop: boolean,
  activePanel: T | null,
  copilotPanel: T,
  setActivePanel: SetPanelState<T | null>,
) {
  const wasDesktop = useRef(isDesktop)

  useEffect(() => {
    if (wasDesktop.current && !isDesktop && activePanel === copilotPanel) {
      setActivePanel(null)
    }
    wasDesktop.current = isDesktop
  }, [isDesktop, activePanel, copilotPanel, setActivePanel])
}

export function resolveOverviewCopilotPanel<T extends string>(
  isDesktop: boolean,
  current: T | null,
  copilotPanel: T,
  preservePanel?: T,
): T | null {
  if (preservePanel && current === preservePanel) {
    return current
  }
  return isDesktop ? copilotPanel : null
}

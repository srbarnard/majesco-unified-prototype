import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { layoutTokens } from '@/design-system/tokens/layout'

export type SecondaryPanel = 'activity' | 'favorites'

type SidebarContextValue = {
  navRailWidth: number
  secondaryPanel: SecondaryPanel | null
  secondaryPanelWidth: number
  leftOffsetWidth: number
  toggleSecondaryPanel: (panel: SecondaryPanel) => void
  closeSecondaryPanel: () => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [secondaryPanel, setSecondaryPanel] = useState<SecondaryPanel | null>(null)

  const toggleSecondaryPanel = useCallback((panel: SecondaryPanel) => {
    setSecondaryPanel((current) => (current === panel ? null : panel))
  }, [])

  const closeSecondaryPanel = useCallback(() => {
    setSecondaryPanel(null)
  }, [])

  const value = useMemo<SidebarContextValue>(
    () => ({
      navRailWidth: layoutTokens.navRailWidth,
      secondaryPanel,
      secondaryPanelWidth: layoutTokens.secondaryPanelWidth,
      leftOffsetWidth:
        layoutTokens.navRailWidth +
        (secondaryPanel ? layoutTokens.secondaryPanelWidth : 0),
      toggleSecondaryPanel,
      closeSecondaryPanel,
    }),
    [secondaryPanel, toggleSecondaryPanel, closeSecondaryPanel],
  )

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider')
  }
  return context
}

/** @deprecated Use navRailWidth */
export function useNavRailWidth() {
  return useSidebar().navRailWidth
}

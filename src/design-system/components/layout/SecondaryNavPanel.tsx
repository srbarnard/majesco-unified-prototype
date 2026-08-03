import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Slide from '@mui/material/Slide'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useRef } from 'react'
import { useSidebar } from '@/app/contexts/SidebarContext'
import { useAnimatedPanelPresence } from '@/design-system/hooks/useAnimatedPanelPresence'
import { surfacePanel } from '@/design-system/theme/themeSurfaces'
import {
  dockedPanelMotionSx,
  drawerTransitionDuration,
  getDrawerTransitionSlotProps,
} from '@/design-system/tokens/motion'
import { useIsDesktopLayout } from '@/pages/policies/hooks/useIsDesktopLayout'
import { ActivityPanel } from './ActivityPanel'
import { FavoritesPanel } from './FavoritesPanel'

export function SecondaryNavPanel() {
  const isDesktop = useIsDesktopLayout()
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)', { noSsr: true })
  const { secondaryPanel, secondaryPanelWidth, closeSecondaryPanel } = useSidebar()
  const lastPanelRef = useRef(secondaryPanel)
  const { mounted, entered } = useAnimatedPanelPresence(Boolean(secondaryPanel) && isDesktop, prefersReducedMotion)

  if (secondaryPanel) {
    lastPanelRef.current = secondaryPanel
  }

  const panelToRender = secondaryPanel ?? lastPanelRef.current

  const panelContent =
    panelToRender === 'activity' ? <ActivityPanel /> : panelToRender === 'favorites' ? <FavoritesPanel /> : null

  const { shellSx, innerSx } = dockedPanelMotionSx({
    side: 'left',
    entered,
    width: secondaryPanelWidth,
    reducedMotion: prefersReducedMotion,
  })

  return (
    <>
      <Drawer
        anchor="left"
        open={Boolean(secondaryPanel) && !isDesktop}
        slots={{ transition: Slide }}
        variant="temporary"
        onClose={closeSecondaryPanel}
        transitionDuration={drawerTransitionDuration}
        slotProps={getDrawerTransitionSlotProps()}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            width: secondaryPanelWidth,
            boxSizing: 'border-box',
            borderRight: 1,
            borderColor: 'divider',
          },
        }}
      >
        {panelContent}
      </Drawer>

      {mounted && panelContent ? (
        <Box
          sx={{
            ...shellSx,
            display: { xs: 'none', lg: 'block' },
          }}
        >
          <Box
            key={panelToRender ?? 'panel'}
            sx={{
              ...innerSx,
              bgcolor: (t) => surfacePanel(t),
            }}
          >
            {panelContent}
          </Box>
        </Box>
      ) : null}
    </>
  )
}

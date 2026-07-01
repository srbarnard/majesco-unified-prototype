import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { useSidebar } from '@/app/contexts/SidebarContext'
import { surfacePanel } from '@/design-system/theme/themeSurfaces'
import {
  drawerTransitionDuration,
  drawerTransitionEasing,
  panelSlideInFromLeftSx,
} from '@/design-system/tokens/motion'
import { ActivityPanel } from './ActivityPanel'
import { FavoritesPanel } from './FavoritesPanel'

export function SecondaryNavPanel() {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'))
  const { secondaryPanel, secondaryPanelWidth, closeSecondaryPanel } = useSidebar()

  if (!secondaryPanel) return null

  const panelContent =
    secondaryPanel === 'activity' ? <ActivityPanel /> : <FavoritesPanel />

  if (!isDesktop) {
    return (
      <Drawer
        anchor="left"
        open
        variant="temporary"
        onClose={closeSecondaryPanel}
        transitionDuration={drawerTransitionDuration}
        slotProps={{
          transition: {
            easing: drawerTransitionEasing,
          },
        }}
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
    )
  }

  return (
    <Box
      key={secondaryPanel}
      sx={{
        width: secondaryPanelWidth,
        flexShrink: 0,
        height: '100%',
        minHeight: 0,
        borderRight: 1,
        borderColor: 'divider',
        bgcolor: (t) => surfacePanel(t),
        overflow: 'hidden',
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        ...panelSlideInFromLeftSx(),
      }}
    >
      {panelContent}
    </Box>
  )
}

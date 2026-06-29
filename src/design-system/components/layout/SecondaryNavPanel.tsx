import Box from '@mui/material/Box'
import { useSidebar } from '@/app/contexts/SidebarContext'
import { surfacePanel } from '@/design-system/theme/themeSurfaces'
import { ActivityPanel } from './ActivityPanel'
import { FavoritesPanel } from './FavoritesPanel'

export function SecondaryNavPanel() {
  const { secondaryPanel, secondaryPanelWidth } = useSidebar()

  if (!secondaryPanel) return null

  return (
    <Box
      sx={{
        width: secondaryPanelWidth,
        flexShrink: 0,
        height: '100%',
        minHeight: 0,
        borderRight: 1,
        borderColor: 'divider',
        bgcolor: (theme) => surfacePanel(theme),
        overflow: 'hidden',
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
      }}
    >
      {secondaryPanel === 'activity' && <ActivityPanel />}
      {secondaryPanel === 'favorites' && <FavoritesPanel />}
    </Box>
  )
}

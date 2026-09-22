import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Slide from '@mui/material/Slide'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import {
  StudioHistoryPanel,
} from '@/pages/copilot-studio/components/StudioHistoryPanel'
import type { StudioChatThread } from '@/pages/copilot-studio/data/mockCopilotStudio'
import {
  dockedPanelMotionSx,
  drawerTransitionDuration,
  getDrawerTransitionSlotProps,
} from '@/design-system/tokens/motion'
import { useAnimatedPanelPresence } from '@/design-system/hooks/useAnimatedPanelPresence'
import { layoutTokens } from '@/design-system/tokens/layout'

type StudioChatDrawerProps = {
  open: boolean
  onClose: () => void
  activeThreadId?: string | null
  onThreadSelect?: (thread: StudioChatThread) => void
  onNewChat?: () => void
}

/** Left-side Copilot Studio history drawer (toggled from the right tool rail). */
export function StudioChatDrawer({
  open,
  onClose,
  activeThreadId,
  onThreadSelect,
  onNewChat,
}: StudioChatDrawerProps) {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'))
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const { mounted, entered } = useAnimatedPanelPresence(open, prefersReducedMotion)

  const drawerContent = (
    <StudioHistoryPanel
      onClose={onClose}
      activeThreadId={activeThreadId}
      onThreadSelect={onThreadSelect}
      onNewChat={onNewChat}
    />
  )

  if (!isDesktop) {
    return (
      <Drawer
        anchor="left"
        open={open}
        slots={{ transition: Slide }}
        variant="temporary"
        onClose={onClose}
        transitionDuration={drawerTransitionDuration}
        slotProps={getDrawerTransitionSlotProps()}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            width: layoutTokens.secondaryPanelWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    )
  }

  if (!mounted) return null

  const { shellSx, innerSx } = dockedPanelMotionSx({
    side: 'left',
    entered,
    width: layoutTokens.secondaryPanelWidth,
    reducedMotion: prefersReducedMotion,
  })

  return (
    <Box
      sx={{
        ...shellSx,
        display: { xs: 'none', lg: 'block' },
      }}
    >
      <Box sx={{ ...innerSx }}>{drawerContent}</Box>
    </Box>
  )
}

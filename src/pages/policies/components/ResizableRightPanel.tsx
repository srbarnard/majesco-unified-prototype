import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import type { ReactNode } from 'react'
import {
  useRightPanelWidth,
  type RightPanelVariant,
} from '@/pages/policies/hooks/useCopilotWidth'

type ResizableRightPanelProps = {
  open: boolean
  variant?: RightPanelVariant
  onClose?: () => void
  children: ReactNode
}

function PanelContent({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {children}
    </Box>
  )
}

export function ResizableRightPanel({ open, variant = 'standard', onClose, children }: ResizableRightPanelProps) {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'))
  const { width, startResize } = useRightPanelWidth(variant)

  if (!open) return null

  if (!isDesktop) {
    return (
      <Drawer
        anchor="right"
        open={open}
        variant="temporary"
        onClose={onClose}
        ModalProps={{
          keepMounted: true,
          hideBackdrop: true,
          disableScrollLock: true,
        }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            width: variant === 'wide' ? 'min(100%, 92vw)' : 'min(100%, 400px)',
            boxSizing: 'border-box',
            boxShadow: (t) => t.shadows[8],
          },
        }}
      >
        <PanelContent>{children}</PanelContent>
      </Drawer>
    )
  }

  return (
    <Box
      sx={{
        width,
        flexShrink: 0,
        alignSelf: 'stretch',
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderLeft: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        position: 'relative',
      }}
    >
      <Box
        onMouseDown={(event) => startResize(event.clientX)}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panel"
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 6,
          cursor: 'col-resize',
          zIndex: 2,
          transform: 'translateX(-50%)',
          '&:hover, &:active': {
            bgcolor: (t) => t.figmaPalette.blue[200],
          },
        }}
      />
      <PanelContent>{children}</PanelContent>
    </Box>
  )
}

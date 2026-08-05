import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import type { ReactNode } from 'react'
import { useAnimatedPanelPresence } from '@/design-system/hooks/useAnimatedPanelPresence'
import { useBottomSheetPresence } from '@/design-system/hooks/useBottomSheetPresence'
import { isDarkMode } from '@/design-system/theme/themeSurfaces'
import {
  bottomSheetBackdropMotionSx,
  bottomSheetMotionSx,
  dockedPanelMotionSx,
} from '@/design-system/tokens/motion'
import {
  useRightPanelWidth,
  type RightPanelVariant,
} from '@/pages/policies/hooks/useCopilotWidth'
import { useIsDesktopLayout } from '@/pages/policies/hooks/useIsDesktopLayout'

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

function BottomSheetDragHandle() {
  return (
    <Box
      sx={{
        flexShrink: 0,
        display: 'flex',
        justifyContent: 'center',
        pt: 1.25,
        pb: 0.75,
        cursor: 'grab',
        touchAction: 'none',
        '&:active': {
          cursor: 'grabbing',
        },
      }}
    >
      <Box
        sx={(theme) => ({
          width: 36,
          height: 4,
          borderRadius: 2,
          bgcolor: isDarkMode(theme) ? theme.figmaPalette.grey[600] : theme.figmaPalette.grey[300],
        })}
      />
    </Box>
  )
}

export function ResizableRightPanel({ open, variant = 'standard', onClose, children }: ResizableRightPanelProps) {
  const theme = useTheme()
  const isDesktop = useIsDesktopLayout()
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)', { noSsr: true })
  const { width, startResize } = useRightPanelWidth(variant)
  const handleClose = onClose ?? (() => {})

  const mobileOpen = open && !isDesktop
  const { mounted: sheetMounted, phase: sheetPhase } = useBottomSheetPresence(
    mobileOpen,
    prefersReducedMotion,
  )
  const { mounted, entered } = useAnimatedPanelPresence(open && isDesktop, prefersReducedMotion)

  const { shellSx, innerSx } = dockedPanelMotionSx({
    side: 'right',
    entered,
    width,
    reducedMotion: prefersReducedMotion,
  })

  return (
    <>
      {/*
        Phones / tablets: keyframe bottom sheet.
        Transitions often never paint a "from" frame on iOS Chrome; keyframes do.
      */}
      {sheetMounted ? (
        <Modal
          open
          onClose={handleClose}
          hideBackdrop
          disableScrollLock={false}
          sx={{
            display: { xs: 'block', lg: 'none' },
            zIndex: theme.zIndex.drawer + 1,
          }}
        >
          <Box
            sx={{
              position: 'fixed',
              inset: 0,
              display: 'flex',
              alignItems: 'flex-end',
              outline: 'none',
            }}
          >
            <Box
              aria-hidden
              onClick={handleClose}
              sx={{
                position: 'absolute',
                inset: 0,
                bgcolor: (t) =>
                  t.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.55)' : 'rgba(0, 0, 0, 0.32)',
                ...bottomSheetBackdropMotionSx({
                  phase: sheetPhase,
                  reducedMotion: prefersReducedMotion,
                }),
              }}
            />
            <Box
              role="dialog"
              aria-modal="true"
              sx={{
                ...bottomSheetMotionSx({
                  phase: sheetPhase,
                  reducedMotion: prefersReducedMotion,
                }),
                position: 'relative',
                zIndex: 1,
                bgcolor: 'background.paper',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <BottomSheetDragHandle />
              <PanelContent>{children}</PanelContent>
            </Box>
          </Box>
        </Modal>
      ) : null}

      {/* Desktop: docked right panel. Hidden below lg even if JS mismatch. */}
      {mounted ? (
        <Box
          sx={{
            ...shellSx,
            display: { xs: 'none', lg: 'block' },
          }}
        >
          <Box
            sx={{
              ...innerSx,
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
        </Box>
      ) : null}
    </>
  )
}

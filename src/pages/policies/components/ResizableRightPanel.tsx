import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import type { ReactNode } from 'react'
import { useAnimatedPanelPresence } from '@/design-system/hooks/useAnimatedPanelPresence'
import { isDarkMode } from '@/design-system/theme/themeSurfaces'
import { layoutTokens } from '@/design-system/tokens/layout'
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
  /**
   * Skip the exit slide when handing off to the shell tool drawer (Copilot/Notes/Email).
   * Avoids a flash of this panel sitting beside the newly opened tool.
   */
  skipExitAnimation?: boolean
  children: ReactNode
}

function PanelContent({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
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

export function ResizableRightPanel({
  open,
  variant = 'standard',
  onClose,
  skipExitAnimation = false,
  children,
}: ResizableRightPanelProps) {
  const theme = useTheme()
  const isDesktop = useIsDesktopLayout()
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)', { noSsr: true })
  const { width, startResize } = useRightPanelWidth(variant)
  const handleClose = onClose ?? (() => {})

  // JS breakpoint only — do not also gate with CSS display on the Modal
  // (that combo left the sheet mounted but translateY(100%) / display:none).
  const mobileOpen = open && !isDesktop
  const desktopOpen = open && isDesktop

  const { mounted: sheetMounted, entered: sheetEntered } = useAnimatedPanelPresence(
    mobileOpen,
    prefersReducedMotion,
    skipExitAnimation,
  )
  const { mounted, entered } = useAnimatedPanelPresence(
    desktopOpen,
    prefersReducedMotion,
    skipExitAnimation,
  )

  const { shellSx, innerSx } = dockedPanelMotionSx({
    side: 'right',
    entered,
    width,
    reducedMotion: prefersReducedMotion,
  })

  // Match AppRightToolDrawer — sit above the mobile bottom tool rail, not under it.
  const bottomOffset = `calc(${layoutTokens.toolRailBottomHeight}px + env(safe-area-inset-bottom, 0px))`
  const sheetMaxHeight = `calc(100dvh - ${layoutTokens.headerHeight}px - ${layoutTokens.toolRailBottomHeight}px - env(safe-area-inset-bottom, 0px))`

  return (
    <>
      {sheetMounted ? (
        <Modal
          open
          onClose={handleClose}
          hideBackdrop
          disableAutoFocus
          disableEnforceFocus
          disableRestoreFocus
          disableScrollLock={false}
          sx={{
            zIndex: theme.zIndex.drawer + 1,
            // Keep the fixed bottom tool rail outside the modal hit-area.
            bottom: bottomOffset,
          }}
        >
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: bottomOffset,
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
                  entered: sheetEntered,
                  reducedMotion: prefersReducedMotion,
                }),
              }}
            />
            <Box
              role="dialog"
              aria-modal="true"
              sx={{
                ...bottomSheetMotionSx({
                  entered: sheetEntered,
                  reducedMotion: prefersReducedMotion,
                }),
                position: 'relative',
                zIndex: 1,
                bgcolor: 'background.paper',
                display: 'flex',
                flexDirection: 'column',
                // Keep flex children (task/activity drawers) height-bounded so
                // their internal overflowY:auto regions can scroll on mobile.
                minHeight: 0,
                maxHeight: sheetMaxHeight,
              }}
            >
              <BottomSheetDragHandle />
              <PanelContent>{children}</PanelContent>
            </Box>
          </Box>
        </Modal>
      ) : null}

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

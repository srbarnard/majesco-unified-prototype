import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Slide from '@mui/material/Slide'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useGlobalSearch } from '@/app/contexts/GlobalSearchContext'
import { useRightTool } from '@/app/contexts/RightToolContext'
import { EmailToolPanel } from '@/design-system/components/layout/EmailToolPanel'
import { NotesToolPanel } from '@/design-system/components/layout/NotesToolPanel'
import { layoutTokens } from '@/design-system/tokens/layout'
import {
  drawerMotion,
  drawerTransitionDuration,
  getDrawerTransitionSlotProps,
} from '@/design-system/tokens/motion'
import { CopilotPanel } from '@/pages/policies/components/CopilotPanel'
import { useRightPanelWidth } from '@/pages/policies/hooks/useCopilotWidth'
import { NewTaskToolPanel } from '@/pages/tasks/components/NewTaskToolPanel'

function ToolPanelBody() {
  const {
    activeTool,
    closeTool,
    copilotSession,
    copilotCustomContent,
    copilotCustomRevision,
    notesCustomContent,
    filterContent,
    partiesContent,
  } = useRightTool()
  const { copilotView, agenticPrompt } = useGlobalSearch()

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {activeTool === 'copilot' ? (
        copilotCustomContent ? (
          <Box
            key={copilotCustomRevision}
            sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          >
            {copilotCustomContent}
          </Box>
        ) : copilotSession ? (
          <CopilotPanel {...copilotSession} onClose={closeTool} />
        ) : (
          <CopilotPanel
            context="global"
            globalView={copilotView ?? 'daily-summary'}
            agenticPrompt={agenticPrompt}
            onClose={closeTool}
          />
        )
      ) : null}
      {activeTool === 'notes' ? notesCustomContent ?? <NotesToolPanel /> : null}
      {activeTool === 'email' ? <EmailToolPanel /> : null}
      {activeTool === 'filter' ? filterContent : null}
      {activeTool === 'parties' ? partiesContent : null}
      {activeTool === 'newTask' ? <NewTaskToolPanel /> : null}
    </Box>
  )
}

/**
 * Tool panel beside the right rail on desktop; bottom sheet above the tool bar on mobile/tablet.
 */
export function AppRightToolDrawer() {
  const theme = useTheme()
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)', { noSsr: true })
  const isDesktopTools = useMediaQuery(theme.breakpoints.up('lg'))
  const { activeTool, closeTool } = useRightTool()
  const { width, startResize } = useRightPanelWidth()

  // History is a rail toggle for Copilot Studio's left drawer — not a right panel.
  const open = activeTool != null && activeTool !== 'history'
  const bottomOffset = `calc(${layoutTokens.toolRailBottomHeight}px + env(safe-area-inset-bottom, 0px))`

  if (!isDesktopTools) {
    return (
      <Drawer
        anchor="bottom"
        open={open}
        onClose={closeTool}
        slots={{ transition: Slide }}
        transitionDuration={drawerTransitionDuration}
        slotProps={getDrawerTransitionSlotProps(prefersReducedMotion, { direction: 'up' })}
        ModalProps={{ keepMounted: true }}
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          '& .MuiBackdrop-root': {
            bottom: bottomOffset,
            backgroundColor: (t) =>
              t.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.55)' : 'rgba(0, 0, 0, 0.32)',
          },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            left: 0,
            right: 0,
            bottom: bottomOffset,
            height: `${drawerMotion.bottomSheetHeightVh}dvh`,
            maxHeight: `calc(100dvh - ${layoutTokens.headerHeight}px - ${layoutTokens.toolRailBottomHeight}px - env(safe-area-inset-bottom, 0px))`,
            borderTopLeftRadius: drawerMotion.bottomSheetTopRadiusPx,
            borderTopRightRadius: drawerMotion.bottomSheetTopRadiusPx,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            overflow: 'hidden',
            boxShadow: (t) =>
              t.palette.mode === 'dark'
                ? '0 -8px 28px rgba(0, 0, 0, 0.45)'
                : '0 -8px 28px rgba(0, 0, 0, 0.12)',
          },
        }}
      >
        <Box
          sx={{
            height: '100%',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            bgcolor: 'background.paper',
          }}
        >
          <Box
            aria-hidden
            sx={{
              alignSelf: 'center',
              width: 40,
              height: 4,
              borderRadius: 2,
              bgcolor: 'divider',
              mt: 1,
              mb: 0.5,
              flexShrink: 0,
            }}
          />
          <ToolPanelBody />
        </Box>
      </Drawer>
    )
  }

  const drawerWidth = open ? width : 0

  return (
    <Box
      component="aside"
      aria-label={activeTool ? `${activeTool} panel` : 'Tool panel'}
      aria-hidden={!open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        borderLeft: open ? 1 : 0,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        zIndex: theme.zIndex.drawer,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width,
          height: '100%',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        {open ? (
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
        ) : null}

        <ToolPanelBody />
      </Box>
    </Box>
  )
}

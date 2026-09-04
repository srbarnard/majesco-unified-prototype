import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import { useGlobalSearch } from '@/app/contexts/GlobalSearchContext'
import { useRightTool } from '@/app/contexts/RightToolContext'
import { EmailToolPanel } from '@/design-system/components/layout/EmailToolPanel'
import { NotesToolPanel } from '@/design-system/components/layout/NotesToolPanel'
import { CopilotPanel } from '@/pages/policies/components/CopilotPanel'
import { useRightPanelWidth } from '@/pages/policies/hooks/useCopilotWidth'

/**
 * Resizable tool drawer left of the right tool rail.
 * Shares width storage with page detail/Copilot panels via useRightPanelWidth.
 */
export function AppRightToolDrawer() {
  const theme = useTheme()
  const { activeTool, closeTool, copilotSession, copilotCustomContent, filterContent, partiesContent } =
    useRightTool()
  const { copilotView, agenticPrompt } = useGlobalSearch()
  const { width, startResize } = useRightPanelWidth()

  const open = activeTool != null
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

        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {activeTool === 'copilot' ? (
            copilotCustomContent ? (
              copilotCustomContent
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
          {activeTool === 'notes' ? <NotesToolPanel /> : null}
          {activeTool === 'email' ? <EmailToolPanel /> : null}
          {activeTool === 'filter' ? filterContent : null}
          {activeTool === 'parties' ? partiesContent : null}
        </Box>
      </Box>
    </Box>
  )
}

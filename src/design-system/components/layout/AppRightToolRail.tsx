import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import StickyNote2OutlinedIcon from '@mui/icons-material/StickyNote2Outlined'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import { useColorScheme } from '@mui/material/styles'
import { CopilotIcon } from '@/design-system/components'
import { useRightTool, type RightToolId } from '@/app/contexts/RightToolContext'
import { layoutTokens } from '@/design-system/tokens/layout'
import { surfaceSubtle } from '@/design-system/theme/themeSurfaces'

type ToolDef = {
  id: RightToolId
  label: string
  icon: 'copilot' | 'notes' | 'email' | 'filter' | 'parties'
}

const GLOBAL_TOOLS: ToolDef[] = [
  { id: 'copilot', label: 'Copilot', icon: 'copilot' },
  { id: 'notes', label: 'Notes', icon: 'notes' },
  { id: 'email', label: 'Email', icon: 'email' },
]

function ToolIcon({
  kind,
  active,
  isDarkMode,
}: {
  kind: ToolDef['icon']
  active: boolean
  isDarkMode: boolean
}) {
  if (kind === 'copilot') {
    // Dark mode primary fill is light blue → charcoal mark.
    // Light mode primary fill is solid blue → white mark.
    return <CopilotIcon size={18} active={active} inverted={active && !isDarkMode} />
  }
  if (kind === 'notes') {
    return <StickyNote2OutlinedIcon sx={{ fontSize: 20 }} />
  }
  if (kind === 'email') {
    return <MailOutlineIcon sx={{ fontSize: 20 }} />
  }
  if (kind === 'filter') {
    return <FilterListOutlinedIcon sx={{ fontSize: 20 }} />
  }
  return <GroupsOutlinedIcon sx={{ fontSize: 20 }} />
}

/** Persistent Acrobat-style vertical tool rail on the far right of the app chrome. */
export function AppRightToolRail() {
  const { activeTool, toggleTool, filterContent, partiesContent } = useRightTool()
  const { mode, systemMode } = useColorScheme()
  const resolvedMode = mode === 'system' ? systemMode : mode
  const isDarkMode = resolvedMode === 'dark'

  const tools: ToolDef[] = [
    ...GLOBAL_TOOLS,
    ...(filterContent != null ? [{ id: 'filter' as const, label: 'Filter', icon: 'filter' as const }] : []),
    ...(partiesContent != null
      ? [{ id: 'parties' as const, label: 'Parties', icon: 'parties' as const }]
      : []),
  ]

  return (
    <Box
      component="aside"
      aria-label="Tools"
      sx={{
        width: layoutTokens.toolRailWidth,
        flexShrink: 0,
        alignSelf: 'stretch',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: 1.5,
        pb: 1.5,
        gap: 1,
        borderLeft: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Stack spacing={1} alignItems="center" sx={{ width: '100%' }}>
        {tools.map((tool) => {
          const active = activeTool === tool.id
          return (
            <Tooltip key={tool.id} title={tool.label} placement="left">
              <IconButton
                aria-label={tool.label}
                aria-pressed={active}
                onClick={() => toggleTool(tool.id)}
                sx={(theme) => ({
                  width: 36,
                  height: 36,
                  borderRadius: 1,
                  // Match chart pills: primary.main fill + contrastText icon (dark on light blue in dark mode).
                  color: active
                    ? theme.palette.primary.contrastText
                    : theme.palette.text.secondary,
                  bgcolor: active ? theme.palette.primary.main : 'transparent',
                  '& .MuiSvgIcon-root': {
                    color: 'inherit',
                  },
                  '&:hover': {
                    bgcolor: active
                      ? theme.palette.primary.dark
                      : surfaceSubtle(theme),
                    color: active
                      ? theme.palette.primary.contrastText
                      : theme.palette.text.primary,
                  },
                })}
              >
                <ToolIcon kind={tool.icon} active={active} isDarkMode={!!isDarkMode} />
              </IconButton>
            </Tooltip>
          )
        })}
      </Stack>
    </Box>
  )
}

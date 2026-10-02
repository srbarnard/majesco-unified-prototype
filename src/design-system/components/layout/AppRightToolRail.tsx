import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined'
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined'
import StickyNote2OutlinedIcon from '@mui/icons-material/StickyNote2Outlined'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import SvgIcon, { type SvgIconProps } from '@mui/material/SvgIcon'
import Tooltip from '@mui/material/Tooltip'
import { useColorScheme, useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useLocation } from 'react-router'
import { CopilotIcon } from '@/design-system/components'
import { useRightTool, type RightToolId } from '@/app/contexts/RightToolContext'
import { layoutTokens } from '@/design-system/tokens/layout'
import { surfaceSubtle } from '@/design-system/theme/themeSurfaces'

type ToolDef = {
  id: RightToolId
  label: string
  icon: 'copilot' | 'notes' | 'email' | 'newTask' | 'newCustomer' | 'newQuote' | 'filter' | 'parties' | 'history'
}

const GLOBAL_TOOLS: ToolDef[] = [
  { id: 'copilot', label: 'Chat', icon: 'copilot' },
  { id: 'notes', label: 'Notes', icon: 'notes' },
  { id: 'email', label: 'Email', icon: 'email' },
  { id: 'newTask', label: 'New task', icon: 'newTask' },
  { id: 'newCustomer', label: 'Create customer', icon: 'newCustomer' },
  { id: 'newQuote', label: 'Create quote', icon: 'newQuote' },
]

/** Material Symbols `list_alt_check` (outlined) — not shipped in @mui/icons-material. */
function ListAltCheckIcon(props: SvgIconProps) {
  return (
    <SvgIcon viewBox="0 -960 960 960" {...props}>
      <path d="M200-200v-560 454-85 191Zm0 80q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v320h-80v-320H200v560h280v80H200Zm494 40L552-222l57-56 85 85 170-170 56 57L694-80ZM348.5-451.5Q360-463 360-480t-11.5-28.5Q337-520 320-520t-28.5 11.5Q280-497 280-480t11.5 28.5Q303-440 320-440t28.5-11.5Zm0-160Q360-623 360-640t-11.5-28.5Q337-680 320-680t-28.5 11.5Q280-657 280-640t11.5 28.5Q303-600 320-600t28.5-11.5ZM440-440h240v-80H440v80Zm0-160h240v-80H440v80Z" />
    </SvgIcon>
  )
}

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
  if (kind === 'newTask') {
    return <ListAltCheckIcon sx={{ fontSize: 20 }} />
  }
  if (kind === 'newCustomer') {
    return <PersonAddAltOutlinedIcon sx={{ fontSize: 20 }} />
  }
  if (kind === 'newQuote') {
    return <RequestQuoteOutlinedIcon sx={{ fontSize: 20 }} />
  }
  if (kind === 'filter') {
    return <FilterListOutlinedIcon sx={{ fontSize: 20 }} />
  }
  if (kind === 'history') {
    return <HistoryOutlinedIcon sx={{ fontSize: 20 }} />
  }
  return <GroupsOutlinedIcon sx={{ fontSize: 20 }} />
}

/** Persistent tool rail — vertical on desktop, fixed bottom bar on mobile/tablet. */
export function AppRightToolRail() {
  const theme = useTheme()
  const location = useLocation()
  const isDesktopTools = useMediaQuery(theme.breakpoints.up('lg'))
  const { activeTool, toggleTool, filterContent, partiesContent, historyAvailable } = useRightTool()
  const { mode, systemMode } = useColorScheme()
  const resolvedMode = mode === 'system' ? systemMode : mode
  const isDarkMode = resolvedMode === 'dark'
  const hideCopilotTool = location.pathname === '/copilot-studio'

  const tools: ToolDef[] = [
    ...GLOBAL_TOOLS.filter((tool) => !(hideCopilotTool && tool.id === 'copilot')),
    ...(historyAvailable
      ? [{ id: 'history' as const, label: 'History', icon: 'history' as const }]
      : []),
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
        ...(isDesktopTools
          ? {
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
            }
          : {
              position: 'fixed',
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: (t) => t.zIndex.drawer + 2,
              height: `calc(${layoutTokens.toolRailBottomHeight}px + env(safe-area-inset-bottom, 0px))`,
              pb: 'env(safe-area-inset-bottom, 0px)',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              borderTop: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              boxShadow: (t) =>
                t.palette.mode === 'dark'
                  ? '0 -4px 16px rgba(0, 0, 0, 0.35)'
                  : '0 -4px 16px rgba(0, 0, 0, 0.08)',
            }),
      }}
    >
      <Stack
        direction={isDesktopTools ? 'column' : 'row'}
        spacing={isDesktopTools ? 1 : 0.5}
        alignItems="center"
        justifyContent={isDesktopTools ? 'flex-start' : 'space-evenly'}
        sx={{ width: '100%', maxWidth: isDesktopTools ? '100%' : 420, px: isDesktopTools ? 0 : 1 }}
      >
        {tools.map((tool) => {
          const active = activeTool === tool.id
          return (
            <Tooltip
              key={tool.id}
              title={tool.label}
              placement={isDesktopTools ? 'left' : 'top'}
            >
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

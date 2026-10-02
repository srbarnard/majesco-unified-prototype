import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import StickyNote2OutlinedIcon from '@mui/icons-material/StickyNote2Outlined'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import SvgIcon, { type SvgIconProps } from '@mui/material/SvgIcon'
import Tooltip from '@mui/material/Tooltip'
import { useColorScheme, useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useEffect, useState } from 'react'
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

const CHAT_TOOL: ToolDef = { id: 'copilot', label: 'Assistant', icon: 'copilot' }

const REORDERABLE_TOOLS: ToolDef[] = [
  { id: 'notes', label: 'Notes', icon: 'notes' },
  { id: 'email', label: 'Email', icon: 'email' },
  { id: 'newTask', label: 'New task', icon: 'newTask' },
  { id: 'newCustomer', label: 'Create customer', icon: 'newCustomer' },
  { id: 'newQuote', label: 'Create quote', icon: 'newQuote' },
]

const TOOL_ORDER_STORAGE_KEY = 'rightToolRail.order'

function readStoredOrder(): RightToolId[] {
  const defaults = REORDERABLE_TOOLS.map((tool) => tool.id)
  try {
    const stored = JSON.parse(sessionStorage.getItem(TOOL_ORDER_STORAGE_KEY) ?? 'null') as unknown
    if (!Array.isArray(stored)) return defaults
    const known = stored.filter((id): id is RightToolId => defaults.includes(id as RightToolId))
    return [...new Set([...known, ...defaults])]
  } catch {
    return defaults
  }
}

function moveTool(order: RightToolId[], dragged: RightToolId, target: RightToolId) {
  const from = order.indexOf(dragged)
  const to = order.indexOf(target)
  if (from < 0 || to < 0 || from === to) return order
  const next = [...order]
  next.splice(from, 1)
  next.splice(to, 0, dragged)
  return next
}

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
    return <CopilotIcon size={22} active={active} inverted={active && !isDarkMode} />
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
    return <ReceiptLongOutlinedIcon sx={{ fontSize: 20 }} />
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
  const [order, setOrder] = useState<RightToolId[]>(readStoredOrder)
  const [draggingId, setDraggingId] = useState<RightToolId | null>(null)

  useEffect(() => {
    sessionStorage.setItem(TOOL_ORDER_STORAGE_KEY, JSON.stringify(order))
  }, [order])

  const reorderable = order
    .map((id) => REORDERABLE_TOOLS.find((tool) => tool.id === id))
    .filter((tool): tool is ToolDef => Boolean(tool))

  const contextTools: ToolDef[] = [
    ...(historyAvailable
      ? [{ id: 'history' as const, label: 'History', icon: 'history' as const }]
      : []),
    ...(partiesContent != null
      ? [{ id: 'parties' as const, label: 'Parties', icon: 'parties' as const }]
      : []),
  ]

  const filterTool: ToolDef | null =
    filterContent != null ? { id: 'filter', label: 'Filter', icon: 'filter' } : null

  const renderTool = (tool: ToolDef, draggable = false) => {
    const active = activeTool === tool.id
    return (
      <Box
        key={tool.id}
        draggable={draggable || undefined}
        onDragStart={
          draggable
            ? (event) => {
                event.dataTransfer.effectAllowed = 'move'
                event.dataTransfer.setData('text/plain', tool.id)
                setDraggingId(tool.id)
              }
            : undefined
        }
        onDragOver={
          draggable
            ? (event) => {
                if (!draggingId) return
                event.preventDefault()
                event.dataTransfer.dropEffect = 'move'
                if (draggingId !== tool.id) setOrder((current) => moveTool(current, draggingId, tool.id))
              }
            : undefined
        }
        onDrop={draggable ? (event) => event.preventDefault() : undefined}
        onDragEnd={draggable ? () => setDraggingId(null) : undefined}
        sx={{
          display: 'flex',
          opacity: draggingId === tool.id ? 0.4 : 1,
          cursor: draggable ? (draggingId ? 'grabbing' : 'grab') : undefined,
        }}
      >
        <Tooltip
          title={draggingId ? '' : tool.label}
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
              cursor: 'inherit',
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
      </Box>
    )
  }

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
        sx={{
          width: '100%',
          maxWidth: isDesktopTools ? '100%' : 420,
          px: isDesktopTools ? 0 : 1,
          ...(isDesktopTools ? { flex: 1, minHeight: 0 } : {}),
        }}
      >
        {hideCopilotTool ? null : renderTool(CHAT_TOOL)}
        {reorderable.map((tool) => renderTool(tool, true))}
        {contextTools.map((tool) => renderTool(tool))}
        {filterTool ? (
          <Box
            sx={{
              display: 'flex',
              ...(isDesktopTools
                ? { mt: 'auto !important', pt: 2 }
                : { ml: '16px !important' }),
            }}
          >
            {renderTool(filterTool)}
          </Box>
        ) : null}
      </Stack>
    </Box>
  )
}

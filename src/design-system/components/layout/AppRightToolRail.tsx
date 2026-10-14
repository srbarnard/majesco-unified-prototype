import AppRegistrationOutlinedIcon from '@mui/icons-material/AppRegistrationOutlined'
import AssignmentLateOutlinedIcon from '@mui/icons-material/AssignmentLateOutlined'
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined'
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import StickyNote2OutlinedIcon from '@mui/icons-material/StickyNote2Outlined'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import { CopilotMarkIcon } from '@/design-system/icons/CopilotMarkIcon'
import { useRightTool, type RightToolId } from '@/app/contexts/RightToolContext'
import { layoutTokens } from '@/design-system/tokens/layout'
import { surfaceSubtle } from '@/design-system/theme/themeSurfaces'

type ToolDef = {
  id: RightToolId
  label: string
  icon: 'copilot' | 'notes' | 'email' | 'newTask' | 'newCustomer' | 'newSubmission' | 'newQuote' | 'newClaim' | 'filter' | 'parties' | 'history'
}

const CHAT_TOOL: ToolDef = { id: 'copilot', label: 'Copilot', icon: 'copilot' }

const REORDERABLE_TOOLS: ToolDef[] = [
  { id: 'notes', label: 'Notes', icon: 'notes' },
  { id: 'email', label: 'Email', icon: 'email' },
  { id: 'newTask', label: 'New task', icon: 'newTask' },
  { id: 'newCustomer', label: 'Create customer', icon: 'newCustomer' },
  { id: 'newSubmission', label: 'Create submission', icon: 'newSubmission' },
  { id: 'newQuote', label: 'Create quote', icon: 'newQuote' },
  { id: 'newClaim', label: 'Create claim', icon: 'newClaim' },
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

function ToolIcon({ kind }: { kind: ToolDef['icon'] }) {
  if (kind === 'copilot') {
    return <CopilotMarkIcon sx={{ fontSize: 22 }} />
  }
  if (kind === 'notes') {
    return <StickyNote2OutlinedIcon sx={{ fontSize: 20 }} />
  }
  if (kind === 'email') {
    return <MailOutlineIcon sx={{ fontSize: 20 }} />
  }
  if (kind === 'newTask') {
    return <InventoryOutlinedIcon sx={{ fontSize: 20 }} />
  }
  if (kind === 'newCustomer') {
    return <PersonAddAltOutlinedIcon sx={{ fontSize: 20 }} />
  }
  if (kind === 'newSubmission') {
    return <AppRegistrationOutlinedIcon sx={{ fontSize: 20 }} />
  }
  if (kind === 'newQuote') {
    return <ReceiptLongOutlinedIcon sx={{ fontSize: 20 }} />
  }
  if (kind === 'newClaim') {
    return <AssignmentLateOutlinedIcon sx={{ fontSize: 20 }} />
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
            <ToolIcon kind={tool.icon} />
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

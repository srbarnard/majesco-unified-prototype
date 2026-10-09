import MoreVertIcon from '@mui/icons-material/MoreVert'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import { useState, type SyntheticEvent } from 'react'
import { CopilotIcon, tableActionIconButtonSx } from '@/design-system/components'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import type { ClaimRecord } from '@/pages/claims/data/claimsStore'

const tableMenuItemSx = {
  fontFamily: figmaFontFamilyStack.body,
  fontSize: '0.8125rem',
  lineHeight: 1.4,
  minHeight: 36,
  py: 0.75,
} as const

export type ClaimRowAction = 'details' | 'assign' | 'note' | 'task' | 'discard'

/** Notify, Ask assistant, and More — the same row actions as Submissions. */
export function ClaimRowActions({
  row,
  isAssistantActive,
  onToggleAlert,
  onAskAssistant,
  onAction,
}: {
  row: ClaimRecord
  isAssistantActive: boolean
  onToggleAlert: (row: ClaimRecord) => void
  onAskAssistant: (row: ClaimRecord) => void
  onAction: (row: ClaimRecord, action: ClaimRowAction) => void
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const alertLabel = row.hasAlert ? 'Turn off alerts' : 'Turn on alerts'
  const pick = (action: ClaimRowAction) => {
    setAnchorEl(null)
    onAction(row, action)
  }
  const stop = (event: SyntheticEvent) => event.stopPropagation()

  return (
    <>
      <Stack direction="row" spacing={0.25} justifyContent="flex-end" alignItems="center" sx={{ width: '100%' }}>
        <Tooltip title={alertLabel}>
          <IconButton
            size="small"
            aria-label={`${alertLabel} for ${row.claimNumber}`}
            aria-pressed={row.hasAlert}
            onClick={(event) => {
              stop(event)
              onToggleAlert(row)
            }}
            onMouseDown={stop}
            sx={{ ...tableActionIconButtonSx, color: row.hasAlert ? 'primary.main' : 'text.secondary' }}
          >
            {row.hasAlert ? <NotificationsActiveIcon fontSize="small" /> : <NotificationsNoneOutlinedIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Ask assistant.">
          <IconButton
            size="small"
            aria-label={`Ask assistant about ${row.claimNumber}`}
            aria-pressed={isAssistantActive}
            onClick={(event) => {
              stop(event)
              onAskAssistant(row)
            }}
            onMouseDown={stop}
            sx={tableActionIconButtonSx}
          >
            <CopilotIcon size={22} />
          </IconButton>
        </Tooltip>
        <Tooltip title="More actions">
          <IconButton
            size="small"
            aria-label={`More actions for ${row.claimNumber}`}
            onClick={(event) => {
              stop(event)
              setAnchorEl(event.currentTarget)
            }}
            onMouseDown={stop}
            sx={tableActionIconButtonSx}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        MenuListProps={{ sx: { py: 0.5, '& .MuiMenuItem-root': tableMenuItemSx } }}
      >
        <MenuItem onClick={() => pick('details')}>View details</MenuItem>
        <MenuItem onClick={() => pick('assign')}>Assign</MenuItem>
        <MenuItem onClick={() => pick('note')}>Add note</MenuItem>
        <MenuItem onClick={() => pick('task')}>Add task</MenuItem>
        {row.status === 'Draft' ? <MenuItem onClick={() => pick('discard')}>Discard</MenuItem> : null}
      </Menu>
    </>
  )
}

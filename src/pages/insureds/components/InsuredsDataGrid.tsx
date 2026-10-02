import ContactPageOutlinedIcon from '@mui/icons-material/ContactPageOutlined'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import StarIcon from '@mui/icons-material/Star'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import {
  DataGridPremium,
  type GridApi,
  type GridColDef,
} from '@mui/x-data-grid-premium'
import { useMemo, useRef, useState } from 'react'
import type { MutableRefObject } from 'react'
import type { SxProps, Theme } from '@mui/material/styles'
import { useNavigate } from 'react-router'
import { useResponsivePinnedColumns } from '@/design-system/hooks/useResponsivePinnedColumns'
import {
  CopilotIcon,
  copilotActiveIconSx,
  dataGridInteractionSx,
  getListDataGridSlotProps,
  ListDataGridLink,
  listDataGridActionColumnProps,
  listDataGridFilterProps,
  tableActionIconButtonSx,
} from '@/design-system/components'
import { listDataGridContainerSx } from '@/design-system/tokens/tableLayout'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { dataGridShellSx } from '@/design-system/theme/themeSurfaces'
import { insuredIdFromName } from '@/pages/shared/insuredId'
import type { InsuredListRecord } from '@/pages/insureds/data/mockInsureds'
import { useNewTaskSelection, useTasksStore } from '@/app/contexts/TasksContext'
import { findRelated } from '@/pages/tasks/data/addTaskDraft'

type InsuredsDataGridProps = {
  apiRef: MutableRefObject<GridApi>
  rows: InsuredListRecord[]
  onInsuredCopilot?: (insured: InsuredListRecord) => void
  activeCopilotInsuredId?: string | null
}

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontSize: '0.8125rem',
} as const

function formatCurrency(value: number) {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

function CountLinkCell({
  value,
  to,
  ariaLabel,
}: {
  value: number | null
  to: string
  ariaLabel: string
}) {
  if (!value) return null

  return (
    <ListDataGridLink to={to} fontWeight={500} sx={{ width: '100%', textAlign: 'right', py: 0.25 }}>
      <Box component="span" aria-label={ariaLabel}>
        {value}
      </Box>
    </ListDataGridLink>
  )
}

const tableMenuItemSx = {
  fontFamily: figmaFontFamilyStack.body,
  fontSize: '0.8125rem',
  lineHeight: 1.4,
  minHeight: 36,
  py: 0.75,
} as const

function listSearchPath(basePath: string, insuredName: string) {
  return `${basePath}?q=${encodeURIComponent(insuredName)}`
}

function InsuredContactCell({ row }: { row: InsuredListRecord }) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const closeTimer = useRef<number | null>(null)
  const open = Boolean(anchorEl)

  const clearCloseTimer = () => {
    if (closeTimer.current != null) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  const openPopover = (element: HTMLElement) => {
    clearCloseTimer()
    setAnchorEl((current) => current ?? element)
  }

  const scheduleClose = () => {
    clearCloseTimer()
    closeTimer.current = window.setTimeout(() => setAnchorEl(null), 180)
  }

  return (
    <>
      <Stack
        direction="row"
        spacing={0.75}
        alignItems="center"
        sx={{ py: 0.25, minWidth: 0, cursor: 'pointer' }}
        onMouseEnter={(event) => openPopover(event.currentTarget)}
        onMouseLeave={scheduleClose}
        onClick={(event) => {
          event.stopPropagation()
          openPopover(event.currentTarget)
        }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <ContactPageOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary', flexShrink: 0 }} />
        <Typography variant="body2" noWrap sx={{ ...bodySx, fontWeight: 500 }}>
          {row.contactName}
        </Typography>
      </Stack>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        disableRestoreFocus
        disableAutoFocus
        disableEnforceFocus
        hideBackdrop
        sx={{ pointerEvents: 'none' }}
        slotProps={{
          paper: {
            onMouseEnter: clearCloseTimer,
            onMouseLeave: scheduleClose,
            onClick: (event) => event.stopPropagation(),
            sx: (theme) => ({
              pointerEvents: 'auto',
              mt: 0.75,
              py: 1.5,
              px: 1.75,
              minWidth: 240,
              maxWidth: 300,
              borderRadius: `${layoutTokens.cardRadius}px`,
              border: `1px solid ${theme.palette.divider}`,
              boxShadow:
                theme.palette.mode === 'dark'
                  ? '0 8px 24px rgba(0, 0, 0, 0.45)'
                  : '0 8px 24px rgba(0, 0, 0, 0.12)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -10,
                left: 0,
                right: 0,
                height: 10,
              },
            }),
          },
        }}
      >
        <Stack spacing={1.25}>
          <Box>
            <Typography variant="body2" sx={{ ...bodySx, lineHeight: 1.45 }}>
              {row.addressLine1}
            </Typography>
            <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="space-between">
              <Typography variant="body2" sx={{ ...bodySx, lineHeight: 1.45 }}>
                {row.cityStateZip}
              </Typography>
              <PlaceOutlinedIcon sx={{ fontSize: 16, color: 'primary.main', flexShrink: 0 }} />
            </Stack>
          </Box>
          <Typography variant="body2" sx={{ ...bodySx, lineHeight: 1.45 }}>
            <Box component="span" sx={{ fontWeight: 600 }}>
              Email:{' '}
            </Box>
            <Link
              href={`mailto:${row.contactEmail}`}
              underline="hover"
              onClick={(event) => event.stopPropagation()}
              sx={{ ...bodySx }}
            >
              Send message
            </Link>
          </Typography>
          <Typography variant="body2" sx={{ ...bodySx, lineHeight: 1.45 }}>
            <Box component="span" sx={{ fontWeight: 600 }}>
              Phone:{' '}
            </Box>
            {row.contactPhone}
          </Typography>
        </Stack>
      </Popover>
    </>
  )
}

function insuredRelated(row: InsuredListRecord) {
  return findRelated('Insured', insuredIdFromName(row.name), [row.name])
}

function RowActionsMenu({
  row,
  favorited,
  onToggleFavorite,
  onInsuredCopilot,
  isCopilotActive,
}: {
  row: InsuredListRecord
  favorited: boolean
  onToggleFavorite: (id: string) => void
  onInsuredCopilot?: (insured: InsuredListRecord) => void
  isCopilotActive?: boolean
}) {
  const navigate = useNavigate()
  const { openNewTask } = useTasksStore()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const insuredPath = `/insureds/${encodeURIComponent(insuredIdFromName(row.name))}`

  return (
    <>
      <Stack direction="row" spacing={0.25} justifyContent="flex-end" alignItems="center" sx={{ width: '100%' }}>
        <Tooltip title={favorited ? 'Remove from favorites' : 'Add to favorites'}>
          <IconButton
            size="small"
            aria-label={favorited ? `Unfavorite ${row.name}` : `Favorite ${row.name}`}
            aria-pressed={favorited}
            onClick={(event) => {
              event.stopPropagation()
              onToggleFavorite(row.id)
            }}
            onMouseDown={(event) => event.stopPropagation()}
            sx={tableActionIconButtonSx}
          >
            {favorited ? (
              <StarIcon sx={{ fontSize: 18, color: 'warning.main' }} />
            ) : (
              <StarBorderIcon sx={{ fontSize: 18 }} />
            )}
          </IconButton>
        </Tooltip>
        <Tooltip title="Ask assistant.">
          <IconButton
            size="small"
            aria-label={`Ask assistant about ${row.name}`}
            aria-pressed={isCopilotActive}
            onClick={(event) => {
              event.stopPropagation()
              onInsuredCopilot?.(row)
            }}
            onMouseDown={(event) => event.stopPropagation()}
            sx={copilotActiveIconSx(isCopilotActive)}
          >
            <CopilotIcon size={22} active={isCopilotActive} />
          </IconButton>
        </Tooltip>
        <Tooltip title="More actions">
          <IconButton
            size="small"
            aria-label={`More actions for ${row.name}`}
            onClick={(event) => {
              event.stopPropagation()
              setAnchorEl(event.currentTarget)
            }}
            onMouseDown={(event) => event.stopPropagation()}
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
        MenuListProps={{
          sx: {
            py: 0.5,
            '& .MuiMenuItem-root': tableMenuItemSx,
          },
        }}
      >
        <MenuItem
          onClick={() => {
            setAnchorEl(null)
            navigate(insuredPath)
          }}
        >
          View insured
        </MenuItem>
        <MenuItem disabled>Edit insured</MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorEl(null)
            openNewTask(insuredRelated(row))
          }}
        >
          Add task
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorEl(null)
            navigate(listSearchPath('/policies', row.name))
          }}
        >
          View policies
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorEl(null)
            navigate(listSearchPath('/quotes', row.name))
          }}
        >
          View quotes
        </MenuItem>
      </Menu>
    </>
  )
}

export function InsuredsDataGrid({
  apiRef,
  rows,
  onInsuredCopilot,
  activeCopilotInsuredId,
}: InsuredsDataGridProps) {
  const selectedInsured = rows.find((row) => row.id === activeCopilotInsuredId)
  useNewTaskSelection(selectedInsured ? insuredRelated(selectedInsured) : null)
  const [favorites, setFavorites] = useState<Record<string, boolean>>({})

  const handleToggleFavorite = (id: string) => {
    setFavorites((current) => ({ ...current, [id]: !current[id] }))
  }

  const columns = useMemo<GridColDef<InsuredListRecord>[]>(
    () => [
      {
        field: 'name',
        headerName: 'Insured name',
        flex: 1.5,
        minWidth: 220,
        sortable: true,
        renderCell: ({ row }) => (
          <ListDataGridLink
            to={`/insureds/${encodeURIComponent(insuredIdFromName(row.name))}`}
            fontWeight={500}
          >
            {row.name}
          </ListDataGridLink>
        ),
      },
      {
        field: 'contactName',
        headerName: 'Insured contact',
        flex: 1.15,
        minWidth: 168,
        sortable: true,
        renderCell: ({ row }) => <InsuredContactCell row={row} />,
      },
      {
        field: 'premiumInForce',
        headerName: 'Premium In-Force',
        flex: 1,
        minWidth: 140,
        type: 'number',
        sortable: true,
        align: 'right',
        headerAlign: 'right',
        renderCell: ({ row }) => (
          <Typography
            variant="body2"
            sx={{ ...bodySx, fontWeight: 500, py: 0.25, width: '100%', textAlign: 'right' }}
          >
            {formatCurrency(row.premiumInForce)}
          </Typography>
        ),
      },
      {
        field: 'totalIncurredLoss',
        headerName: 'Total incurred loss',
        flex: 1,
        minWidth: 150,
        type: 'number',
        sortable: true,
        align: 'right',
        headerAlign: 'right',
        renderCell: ({ row }) => (
          <Typography
            variant="body2"
            sx={{ ...bodySx, fontWeight: 500, py: 0.25, width: '100%', textAlign: 'right' }}
          >
            {formatCurrency(row.totalIncurredLoss)}
          </Typography>
        ),
      },
      {
        field: 'insuredType',
        headerName: 'Insured type',
        flex: 0.95,
        minWidth: 140,
        sortable: true,
        renderCell: ({ row }) => (
          <Typography variant="body2" sx={{ ...bodySx, py: 0.25 }}>
            {row.insuredType}
          </Typography>
        ),
      },
      {
        field: 'upcomingRenewals',
        headerName: 'Upcoming renewals',
        flex: 0.85,
        minWidth: 140,
        type: 'number',
        sortable: true,
        align: 'right',
        headerAlign: 'right',
        renderCell: ({ row }) => (
          <CountLinkCell
            value={row.upcomingRenewals}
            to={listSearchPath('/policies', row.name)}
            ariaLabel={`${row.upcomingRenewals} upcoming renewals for ${row.name}`}
          />
        ),
      },
      {
        field: 'openQuotes',
        headerName: 'Open quotes',
        flex: 0.75,
        minWidth: 120,
        type: 'number',
        sortable: true,
        align: 'right',
        headerAlign: 'right',
        renderCell: ({ row }) => (
          <CountLinkCell
            value={row.openQuotes}
            to={listSearchPath('/quotes', row.name)}
            ariaLabel={`${row.openQuotes} open quotes for ${row.name}`}
          />
        ),
      },
      {
        field: 'openClaims',
        headerName: 'Open claims',
        flex: 0.75,
        minWidth: 120,
        type: 'number',
        sortable: true,
        align: 'right',
        headerAlign: 'right',
        renderCell: ({ row }) => (
          <CountLinkCell
            value={row.openClaims}
            to="/claims"
            ariaLabel={`${row.openClaims} open claims for ${row.name}`}
          />
        ),
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 120,
        minWidth: 120,
        maxWidth: 120,
        sortable: false,
        resizable: false,
        align: 'right',
        headerAlign: 'right',
        ...listDataGridActionColumnProps,
        renderCell: ({ row }) => (
          <RowActionsMenu
            row={row}
            favorited={Boolean(favorites[row.id])}
            onToggleFavorite={handleToggleFavorite}
            onInsuredCopilot={onInsuredCopilot}
            isCopilotActive={activeCopilotInsuredId === row.id}
          />
        ),
      },
    ],
    [activeCopilotInsuredId, favorites, onInsuredCopilot],
  )

  const { pinnedColumns, disableColumnPinning } = useResponsivePinnedColumns({
    left: ['name'],
    right: ['actions'],
  })

  return (
    <Box sx={listDataGridContainerSx({ headerFilters: true, footer: true })}>
      <DataGridPremium
        apiRef={apiRef}
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        sortingOrder={['asc', 'desc']}
        initialState={{
          sorting: { sortModel: [{ field: 'name', sort: 'asc' }] },
          pagination: { paginationModel: { pageSize: 25, page: 0 } },
        }}
        pageSizeOptions={[10, 25, 50, 100]}
        pinnedColumns={pinnedColumns}
        disableColumnPinning={disableColumnPinning}
        disableColumnReorder
        columnHeaderHeight={40}
        getRowHeight={() => 'auto'}
        slotProps={getListDataGridSlotProps()}
        {...listDataGridFilterProps}
        sx={
          [
            ...dataGridShellSx(undefined, { headerFilters: true, footer: true }),
            dataGridInteractionSx,
          ] as SxProps<Theme>
        }
      />
    </Box>
  )
}

import MoreVertIcon from '@mui/icons-material/MoreVert'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import {
  DataGridPremium,
  type GridApi,
  type GridColDef,
  type GridRowSelectionModel,
} from '@mui/x-data-grid-premium'
import { useMemo, useState } from 'react'
import type { MutableRefObject } from 'react'
import type { SxProps, Theme } from '@mui/material/styles'
import { useNavigate } from 'react-router'
import { insuredIdFromName } from '@/pages/shared/insuredId'
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
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { dataGridShellSx } from '@/design-system/theme/themeSurfaces'
import { SubmissionStatusChip } from '@/pages/submissions/components/SubmissionStatusChip'
import type { SubmissionListRecord } from '@/pages/submissions/data/mockSubmissions'

const CHECKBOX_COLUMN_WIDTH = 50

type SubmissionsDataGridProps = {
  apiRef: MutableRefObject<GridApi>
  rows: SubmissionListRecord[]
  rowSelectionModel: GridRowSelectionModel
  onRowSelectionModelChange: (model: GridRowSelectionModel) => void
  onAskCopilot?: (submission: SubmissionListRecord) => void
  onAssign?: (submission: SubmissionListRecord) => void
  onAddNote?: (submission: SubmissionListRecord) => void
  onDiscard?: (submission: SubmissionListRecord) => void
  activeCopilotSubmissionId?: string | null
}

function formatSubmittedAt(value: string) {
  const date = new Date(value)
  const datePart = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const timePart = date
    .toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    .toLowerCase()
    .replace(' ', '')
  return `${datePart} ${timePart}`
}

function LobCell({ lines }: { lines: string[] }) {
  const [primary, ...rest] = lines
  const overflow = rest.length

  if (!primary) return null

  const tooltipTitle =
    lines.length > 1 ? (
      <Stack spacing={0.25}>
        {lines.map((line) => (
          <Typography key={line} variant="caption" sx={{ display: 'block', lineHeight: 1.4 }}>
            {line}
          </Typography>
        ))}
      </Stack>
    ) : (
      primary
    )

  return (
    <Tooltip title={tooltipTitle} enterDelay={200} placement="bottom-start">
      <Typography
        variant="body2"
        noWrap
        sx={{
          fontFamily: figmaFontFamilyStack.body,
          fontSize: '0.8125rem',
          py: 0.25,
          cursor: lines.length > 1 ? 'help' : 'default',
        }}
      >
        {primary}
        {overflow > 0 && (
          <Box component="span" sx={{ color: 'text.secondary', ml: 0.5 }}>
            +{overflow}
          </Box>
        )}
      </Typography>
    </Tooltip>
  )
}

function RowActionsMenu({
  row,
  onAskCopilot,
  onAssign,
  onAddNote,
  onDiscard,
  onViewDetails,
  isCopilotActive,
}: {
  row: SubmissionListRecord
  onAskCopilot?: (submission: SubmissionListRecord) => void
  onAssign?: (submission: SubmissionListRecord) => void
  onAddNote?: (submission: SubmissionListRecord) => void
  onDiscard?: (submission: SubmissionListRecord) => void
  onViewDetails?: (submission: SubmissionListRecord) => void
  isCopilotActive?: boolean
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  return (
    <>
      <Stack direction="row" spacing={0.25} justifyContent="flex-end" alignItems="center" sx={{ width: '100%' }}>
        <Tooltip title={row.hasAlert ? 'Alert active' : 'No alerts'}>
          <IconButton
            size="small"
            aria-label={row.hasAlert ? `Alerts for ${row.submissionNumber}` : `No alerts for ${row.submissionNumber}`}
            sx={{
              ...tableActionIconButtonSx,
              color: row.hasAlert ? 'primary.main' : 'text.secondary',
            }}
          >
            {row.hasAlert ? (
              <NotificationsActiveIcon fontSize="small" />
            ) : (
              <NotificationsNoneOutlinedIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
        <Tooltip title="Ask Copilot about this submission">
          <IconButton
            size="small"
            aria-label={`Ask Copilot about ${row.submissionNumber}`}
            aria-pressed={isCopilotActive}
            onClick={(event) => {
              event.stopPropagation()
              onAskCopilot?.(row)
            }}
            onMouseDown={(event) => event.stopPropagation()}
            sx={copilotActiveIconSx(isCopilotActive)}
          >
            <CopilotIcon size={18} active={isCopilotActive} />
          </IconButton>
        </Tooltip>
        <Tooltip title="More actions">
          <IconButton
            size="small"
            aria-label={`More actions for ${row.submissionNumber}`}
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
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem
          onClick={() => {
            setAnchorEl(null)
            onViewDetails?.(row)
          }}
        >
          View details
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorEl(null)
            onAssign?.(row)
          }}
        >
          Assign
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorEl(null)
            onAddNote?.(row)
          }}
        >
          Add note
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorEl(null)
            onDiscard?.(row)
          }}
        >
          Discard
        </MenuItem>
        <Divider />
        <MenuItem
          selected={isCopilotActive}
          onClick={() => {
            setAnchorEl(null)
            onAskCopilot?.(row)
          }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            <CopilotIcon size={18} active={isCopilotActive} />
          </ListItemIcon>
          <ListItemText>Ask Copilot</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}

export function SubmissionsDataGrid({
  apiRef,
  rows,
  rowSelectionModel,
  onRowSelectionModelChange,
  onAskCopilot,
  onAssign,
  onAddNote,
  onDiscard,
  activeCopilotSubmissionId,
}: SubmissionsDataGridProps) {
  const navigate = useNavigate()

  const handleViewDetails = (row: SubmissionListRecord) => {
    navigate(`/submissions/${encodeURIComponent(row.submissionNumber)}`)
  }

  const columns = useMemo<GridColDef<SubmissionListRecord>[]>(
    () => [
      {
        field: 'submissionNumber',
        headerName: 'Sub #',
        flex: 0.9,
        minWidth: 120,
        sortable: true,
        renderCell: ({ row }) => (
          <ListDataGridLink to={`/submissions/${encodeURIComponent(row.submissionNumber)}`}>
            {row.submissionNumber}
          </ListDataGridLink>
        ),
      },
      {
        field: 'status',
        headerName: 'Status',
        flex: 0.85,
        minWidth: 120,
        sortable: true,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <SubmissionStatusChip
            status={row.status}
            selected={activeCopilotSubmissionId === row.id}
            onClick={() => onAskCopilot?.(row)}
          />
        ),
      },
      {
        field: 'insuredName',
        headerName: 'Insured name',
        flex: 1.4,
        minWidth: 180,
        sortable: true,
        renderCell: ({ row }) => (
          <ListDataGridLink
            to={`/insureds/${encodeURIComponent(insuredIdFromName(row.insuredName))}`}
            fontWeight={500}
          >
            {row.insuredName}
          </ListDataGridLink>
        ),
      },
      {
        field: 'linesOfBusiness',
        headerName: 'LOB',
        flex: 1.1,
        minWidth: 150,
        sortable: true,
        valueGetter: (_, row) => row.linesOfBusiness.join(', '),
        renderCell: ({ row }) => <LobCell lines={row.linesOfBusiness} />,
      },
      {
        field: 'assignedTo',
        headerName: 'Assigned to',
        flex: 1.1,
        minWidth: 150,
        sortable: true,
        renderCell: ({ row }) => (
          <Typography
            variant="body2"
            sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem', py: 0.25 }}
          >
            {row.assignedTo}
          </Typography>
        ),
      },
      {
        field: 'submittedAt',
        headerName: 'Submitted at',
        flex: 1.1,
        minWidth: 160,
        type: 'dateTime',
        sortable: true,
        valueGetter: (_, row) => new Date(row.submittedAt),
        renderCell: ({ row }) => (
          <Typography
            variant="body2"
            sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem', py: 0.25 }}
          >
            {formatSubmittedAt(row.submittedAt)}
          </Typography>
        ),
      },
      {
        field: 'actions',
        headerName: '',
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
            onAskCopilot={onAskCopilot}
            onAssign={onAssign}
            onAddNote={onAddNote}
            onDiscard={onDiscard}
            onViewDetails={handleViewDetails}
            isCopilotActive={activeCopilotSubmissionId === row.id}
          />
        ),
      },
    ],
    [activeCopilotSubmissionId, onAddNote, onAskCopilot, onAssign, onDiscard],
  )

  return (
    <Box sx={listDataGridContainerSx({ headerFilters: true, footer: true })}>
      <DataGridPremium
        apiRef={apiRef}
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        checkboxSelection
        disableRowSelectionOnClick
        rowSelectionModel={rowSelectionModel}
        onRowSelectionModelChange={onRowSelectionModelChange}
        sortingOrder={['asc', 'desc']}
        initialState={{
          sorting: { sortModel: [{ field: 'submittedAt', sort: 'desc' }] },
          pagination: { paginationModel: { pageSize: 25, page: 0 } },
        }}
        pageSizeOptions={[10, 25, 50, 100]}
        pinnedColumns={{ left: ['__check__', 'submissionNumber'], right: ['actions'] }}
        disableColumnReorder
        columnHeaderHeight={40}
        getRowHeight={() => 'auto'}
        slotProps={getListDataGridSlotProps()}
        {...listDataGridFilterProps}
        sx={
          [
            ...dataGridShellSx(
              {
                '& .MuiDataGrid-columnHeader:not(.MuiDataGrid-columnHeaderCheckbox)': {
                  px: 1.5,
                  '&:focus, &:focus-within': { outline: 'none' },
                },
                '& .MuiDataGrid-columnHeaderCheckbox, & .MuiDataGrid-cellCheckbox': {
                  width: CHECKBOX_COLUMN_WIDTH,
                  minWidth: CHECKBOX_COLUMN_WIDTH,
                  maxWidth: CHECKBOX_COLUMN_WIDTH,
                  p: 0,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                },
                '& .MuiDataGrid-columnHeaderCheckbox .MuiDataGrid-columnHeaderDraggableContainer': {
                  width: '100%',
                  justifyContent: 'center',
                },
                '& .MuiDataGrid-columnHeaderCheckbox .MuiDataGrid-columnHeaderTitleContainer': {
                  flex: '0 0 auto',
                  width: 'auto',
                  minWidth: 0,
                  justifyContent: 'center',
                },
                '& .MuiDataGrid-columnHeaderCheckbox .MuiCheckbox-root, & .MuiDataGrid-cellCheckbox .MuiCheckbox-root':
                  {
                    p: 0.5,
                  },
                '& .MuiDataGrid-cell:not(.MuiDataGrid-cellCheckbox)': {
                  px: 1.5,
                  py: 1,
                  display: 'flex',
                  alignItems: 'center',
                  borderColor: 'divider',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  '&:focus, &:focus-within': { outline: 'none' },
                },
                '& .MuiDataGrid-cell[data-field="status"]': {
                  justifyContent: 'center',
                  alignItems: 'center',
                },
                '& .MuiDataGrid-columnHeader[data-field="status"] .MuiDataGrid-columnHeaderTitleContainer':
                  {
                    justifyContent: 'center',
                  },
                '& .MuiDataGrid-footerContainer': {
                  borderTop: 1,
                  borderColor: 'divider',
                  minHeight: 52,
                },
              },
              { headerFilters: true, footer: true },
            ),
            dataGridInteractionSx,
          ] as SxProps<Theme>
        }
      />
    </Box>
  )
}

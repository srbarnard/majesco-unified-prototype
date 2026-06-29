import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import {
  DataGridPremium,
  type GridColDef,
  type GridRowSelectionModel,
} from '@mui/x-data-grid-premium'
import { useMemo, useState } from 'react'
import type { SxProps, Theme } from '@mui/material/styles'
import {
  CopilotIcon,
  copilotActiveIconSx,
  dataGridInteractionSx,
  tableActionIconButtonSx,
  tableLinkSx,
} from '@/design-system/components'
import { accentSubtle, dataGridPinnedShadow, dataGridShellSx, surfaceMuted } from '@/design-system/theme/themeSurfaces'
import { formatRelativeListDate, formatTaskDueDate } from '@/design-system/utils/formatListDate'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import type { TaskRecord } from '@/pages/tasks/data/mockTasks'

const CHECKBOX_COLUMN_WIDTH = 50

type TasksDataGridProps = {
  rows: TaskRecord[]
  rowSelectionModel: GridRowSelectionModel
  onRowSelectionModelChange: (model: GridRowSelectionModel) => void
  onTaskCopilot?: (task: TaskRecord) => void
  activeCopilotTaskId?: string | null
}

const priorityColors = {
  High: '#E53935',
  Medium: '#FB8C00',
  Low: '#43A047',
} as const

function PriorityCell({ priority }: { priority: TaskRecord['priority'] }) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ py: 0.25 }}>
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          bgcolor: priorityColors[priority],
          flexShrink: 0,
        }}
      />
      <Typography variant="body2" sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem' }}>
        {priority}
      </Typography>
    </Stack>
  )
}

function copilotActionIconSx(active?: boolean) {
  return copilotActiveIconSx(active)
}

function RowActionsMenu({
  row,
  onTaskCopilot,
  isCopilotActive,
}: {
  row: TaskRecord
  onTaskCopilot?: (task: TaskRecord) => void
  isCopilotActive?: boolean
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  return (
    <>
      <Stack direction="row" spacing={0.25} justifyContent="flex-end" alignItems="center" sx={{ width: '100%' }}>
        <Tooltip title="Notifications">
          <IconButton size="small" aria-label={`Notifications for ${row.taskName}`} sx={tableActionIconButtonSx}>
            <NotificationsNoneOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Ask Copilot about this task">
          <IconButton
            size="small"
            aria-label={`Ask Copilot about ${row.taskName}`}
            aria-pressed={isCopilotActive}
            onClick={() => onTaskCopilot?.(row)}
            sx={copilotActionIconSx(isCopilotActive)}
          >
            <CopilotIcon size={18} active={isCopilotActive} />
          </IconButton>
        </Tooltip>
        <Tooltip title="More actions">
          <IconButton
            size="small"
            aria-label={`More actions for ${row.taskName}`}
            onClick={(event) => setAnchorEl(event.currentTarget)}
            sx={tableActionIconButtonSx}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => setAnchorEl(null)}>Edit</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Discard</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Reassign</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Mark as complete</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Ask Copilot</MenuItem>
      </Menu>
    </>
  )
}

export function TasksDataGrid({
  rows,
  rowSelectionModel,
  onRowSelectionModelChange,
  onTaskCopilot,
  activeCopilotTaskId,
}: TasksDataGridProps) {
  const columns = useMemo<GridColDef<TaskRecord>[]>(
    () => [
      {
        field: 'taskName',
        headerName: 'Task name',
        flex: 1.2,
        minWidth: 180,
        sortable: true,
        renderCell: ({ row }) => (
          <Link
            component="button"
            variant="body2"
            underline="hover"
            sx={{ fontWeight: 600, textAlign: 'left', py: 0.25, ...tableLinkSx }}
          >
            {row.taskName}
          </Link>
        ),
      },
      {
        field: 'assigner',
        headerName: 'Assigner',
        flex: 1,
        minWidth: 150,
        sortable: true,
        renderCell: ({ row }) => (
          <Typography variant="body2" sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem', py: 0.25 }}>
            {row.assigner}
          </Typography>
        ),
      },
      {
        field: 'priority',
        headerName: 'Priority',
        flex: 0.75,
        minWidth: 100,
        sortable: true,
        renderCell: ({ row }) => <PriorityCell priority={row.priority} />,
      },
      {
        field: 'assignedDate',
        headerName: 'Assigned date',
        flex: 0.85,
        minWidth: 120,
        sortable: true,
        valueGetter: (_, row) => new Date(row.assignedDate),
        renderCell: ({ row }) => (
          <Typography variant="body2" sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem', py: 0.25 }}>
            {formatRelativeListDate(row.assignedDate)}
          </Typography>
        ),
      },
      {
        field: 'dueDate',
        headerName: 'Due date',
        flex: 0.85,
        minWidth: 120,
        sortable: true,
        valueGetter: (_, row) => new Date(row.dueDate),
        renderCell: ({ row }) => {
          const label = formatTaskDueDate(row.dueDate)
          const isPastDue = label === 'Past due'

          return (
            <Typography
              variant="body2"
              sx={{
                fontFamily: figmaFontFamilyStack.body,
                fontSize: '0.8125rem',
                py: 0.25,
                color: isPastDue ? 'error.main' : 'text.primary',
                fontWeight: isPastDue ? 600 : 400,
              }}
            >
              {label}
            </Typography>
          )
        },
      },
      {
        field: 'refNumber',
        headerName: 'Ref. #',
        flex: 0.9,
        minWidth: 120,
        sortable: true,
        renderCell: ({ row }) => (
          <Typography variant="body2" sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem', py: 0.25 }}>
            {row.refNumber}
          </Typography>
        ),
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 120,
        minWidth: 120,
        maxWidth: 120,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        resizable: false,
        align: 'right',
        headerAlign: 'right',
        renderCell: ({ row }) => (
          <RowActionsMenu
            row={row}
            onTaskCopilot={onTaskCopilot}
            isCopilotActive={activeCopilotTaskId === row.id}
          />
        ),
      },
    ],
    [activeCopilotTaskId, onTaskCopilot],
  )

  return (
    <Box sx={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', flexDirection: 'column' }}>
      <DataGridPremium
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        checkboxSelection
        disableRowSelectionOnClick
        rowSelectionModel={rowSelectionModel}
        onRowSelectionModelChange={onRowSelectionModelChange}
        sortingOrder={['asc', 'desc']}
        initialState={{
          sorting: { sortModel: [{ field: 'dueDate', sort: 'asc' }] },
          pagination: { paginationModel: { pageSize: 10, page: 0 } },
        }}
        pageSizeOptions={[10, 25, 50]}
        pinnedColumns={{ left: ['__check__', 'taskName'], right: ['actions'] }}
        disableColumnReorder
        columnHeaderHeight={40}
        getRowHeight={() => 'auto'}
        sx={[...dataGridShellSx({
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
            '& .MuiDataGrid-columnHeaderCheckbox .MuiCheckbox-root, & .MuiDataGrid-cellCheckbox .MuiCheckbox-root': {
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
            '& .MuiDataGrid-cell--pinnedLeft, & .MuiDataGrid-columnHeader--pinnedLeft': {
              bgcolor: 'background.paper',
              boxShadow: (theme) => dataGridPinnedShadow(theme, 'left'),
            },
            '& .MuiDataGrid-columnHeader--pinnedLeft': {
              bgcolor: (theme) => surfaceMuted(theme),
            },
            '& .MuiDataGrid-cell--pinnedRight, & .MuiDataGrid-columnHeader--pinnedRight': {
              bgcolor: 'background.paper',
              boxShadow: (theme) => dataGridPinnedShadow(theme, 'right'),
            },
            '& .MuiDataGrid-columnHeader--pinnedRight': {
              bgcolor: (theme) => surfaceMuted(theme),
            },
            '& .MuiDataGrid-row.Mui-selected': {
              bgcolor: (theme) => accentSubtle(theme),
              '&:hover': {
                bgcolor: (theme) => accentSubtle(theme),
              },
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: 1,
              borderColor: 'divider',
              minHeight: 52,
            },
          }), dataGridInteractionSx] as SxProps<Theme>}
      />
    </Box>
  )
}

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined'
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
  type GridApi,
  type GridColDef,
  type GridRowSelectionModel,
} from '@mui/x-data-grid-premium'
import { useMemo, useState } from 'react'
import type { MutableRefObject } from 'react'
import type { SxProps, Theme } from '@mui/material/styles'
import { Link as RouterLink } from 'react-router'
import {
  CopilotIcon,
  copilotActiveIconSx,
  dataGridInteractionSx,
  getListDataGridSlotProps,
  listDataGridActionColumnProps,
  listDataGridFilterProps,
  tableActionIconButtonSx,
  tableLinkSx,
} from '@/design-system/components'
import { accentSubtle, dataGridPinnedShadow, dataGridShellSx, surfaceMuted } from '@/design-system/theme/themeSurfaces'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { TaskPriorityIndicator } from '@/pages/tasks/components/TaskPriorityIndicator'
import { TaskStatusChip } from '@/pages/tasks/components/TaskStatusChip'
import type { TaskRecord } from '@/pages/tasks/data/mockTasks'
import { getTaskPolicyRoute, getTaskRelatedEntityRoute, getTaskRelatedSummary } from '@/pages/tasks/data/mockTasks'
import { getTaskSlaTone, isTaskSlaUrgent } from '@/pages/tasks/utils/taskDisplayUtils'

const CHECKBOX_COLUMN_WIDTH = 50

const taskRowMenuItemSx = {
  fontFamily: figmaFontFamilyStack.body,
  fontSize: '0.875rem',
  fontWeight: 400,
  py: 1,
  border: 'none',
} as const

type TasksDataGridProps = {
  apiRef: MutableRefObject<GridApi>
  rows: TaskRecord[]
  rowSelectionModel: GridRowSelectionModel
  onRowSelectionModelChange: (model: GridRowSelectionModel) => void
  onTaskOpen?: (task: TaskRecord) => void
  onTaskCopilot?: (task: TaskRecord) => void
  onTaskComplete?: (task: TaskRecord) => void
  activeCopilotTaskId?: string | null
  activeTaskId?: string | null
}

function TaskNameCell({
  row,
  onTaskOpen,
  isActive,
}: {
  row: TaskRecord
  onTaskOpen?: (task: TaskRecord) => void
  isActive?: boolean
}) {
  return (
    <Stack spacing={0.25} sx={{ py: 0.25, minWidth: 0, alignItems: 'flex-start' }}>
      <Link
        component="button"
        variant="body2"
        underline="hover"
        onClick={() => onTaskOpen?.(row)}
        sx={{
          fontWeight: 400,
          textAlign: 'left',
          color: isActive ? 'primary.main' : undefined,
          ...tableLinkSx,
        }}
      >
        {row.taskName}
      </Link>
      <Typography
        variant="caption"
        color="text.secondary"
        noWrap
        sx={{
          fontFamily: figmaFontFamilyStack.body,
          fontSize: '0.6875rem',
          maxWidth: '100%',
          display: 'block',
        }}
      >
        {row.nextAction}
      </Typography>
    </Stack>
  )
}

function RelatedCell({ row }: { row: TaskRecord }) {
  const related = getTaskRelatedSummary(row)
  const policyRoute = getTaskPolicyRoute(row)

  return (
    <Stack spacing={0.125} sx={{ py: 0.25, minWidth: 0 }}>
      <Typography
        variant="body2"
        noWrap
        sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem', fontWeight: 400 }}
      >
        {related.primary}
      </Typography>
      {policyRoute ? (
        <Link
          component={RouterLink}
          to={policyRoute}
          variant="caption"
          underline="hover"
          onClick={(event) => event.stopPropagation()}
          sx={{ fontFamily: figmaFontFamilyStack.body, ...tableLinkSx }}
        >
          {related.secondary}
        </Link>
      ) : (
        <Typography variant="caption" color="text.secondary" noWrap sx={{ fontFamily: figmaFontFamilyStack.body }}>
          {related.secondary}
        </Typography>
      )}
    </Stack>
  )
}

function RowActionsMenu({
  row,
  onTaskCopilot,
  onTaskComplete,
  isCopilotActive,
}: {
  row: TaskRecord
  onTaskCopilot?: (task: TaskRecord) => void
  onTaskComplete?: (task: TaskRecord) => void
  isCopilotActive?: boolean
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const relatedRoute = getTaskRelatedEntityRoute(row)

  return (
    <>
      <Stack direction="row" spacing={0.25} justifyContent="flex-end" alignItems="center" sx={{ width: '100%' }}>
        <Tooltip title="Mark complete">
          <IconButton
            size="small"
            aria-label={`Mark ${row.taskName} complete`}
            onClick={() => onTaskComplete?.(row)}
            sx={tableActionIconButtonSx}
          >
            <CheckCircleOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Ask Copilot about this task">
          <IconButton
            size="small"
            aria-label={`Ask Copilot about ${row.taskName}`}
            aria-pressed={isCopilotActive}
            onClick={() => onTaskCopilot?.(row)}
            sx={copilotActiveIconSx(isCopilotActive)}
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
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{ paper: { sx: { minWidth: 200 } } }}
      >
        <MenuItem
          onClick={() => {
            onTaskComplete?.(row)
            setAnchorEl(null)
          }}
          sx={taskRowMenuItemSx}
        >
          Mark as complete
        </MenuItem>
        <MenuItem
          onClick={() => {
            onTaskCopilot?.(row)
            setAnchorEl(null)
          }}
          sx={taskRowMenuItemSx}
        >
          Ask Copilot
        </MenuItem>
        {relatedRoute ? (
          <MenuItem
            component={RouterLink}
            to={relatedRoute.to}
            onClick={() => setAnchorEl(null)}
            sx={taskRowMenuItemSx}
          >
            <Stack direction="row" spacing={0.75} alignItems="center">
              <OpenInNewOutlinedIcon sx={{ fontSize: 16 }} />
              <span>{relatedRoute.label}</span>
            </Stack>
          </MenuItem>
        ) : (
          <MenuItem disabled sx={taskRowMenuItemSx}>
            View related record
          </MenuItem>
        )}
        <MenuItem onClick={() => setAnchorEl(null)} sx={taskRowMenuItemSx}>
          Reassign
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)} sx={taskRowMenuItemSx}>
          Discard
        </MenuItem>
      </Menu>
    </>
  )
}

export function TasksDataGrid({
  apiRef,
  rows,
  rowSelectionModel,
  onRowSelectionModelChange,
  onTaskOpen,
  onTaskCopilot,
  onTaskComplete,
  activeCopilotTaskId,
  activeTaskId,
}: TasksDataGridProps) {
  const columns = useMemo<GridColDef<TaskRecord>[]>(
    () => [
      {
        field: 'taskName',
        headerName: 'Task',
        flex: 1.35,
        minWidth: 240,
        sortable: true,
        renderCell: ({ row }) => (
          <TaskNameCell row={row} onTaskOpen={onTaskOpen} isActive={activeTaskId === row.id} />
        ),
      },
      {
        field: 'priority',
        headerName: 'Priority',
        flex: 0.75,
        minWidth: 100,
        sortable: true,
        valueGetter: (_, row) => row.priority,
        renderCell: ({ row }) => <TaskPriorityIndicator priority={row.priority} />,
      },
      {
        field: 'ageIndicator',
        headerName: 'SLA / Age',
        flex: 0.95,
        minWidth: 130,
        sortable: true,
        valueGetter: (_, row) => row.dueDate,
        renderCell: ({ row }) => (
          <Stack spacing={0.125} sx={{ py: 0.25 }}>
            <Typography
              variant="body2"
              sx={{
                fontFamily: figmaFontFamilyStack.body,
                fontSize: '0.8125rem',
                color: getTaskSlaTone(row),
                fontWeight: isTaskSlaUrgent(row) ? 600 : 400,
              }}
            >
              {row.ageIndicator}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: figmaFontFamilyStack.body }}>
              {row.agingDays}d open
            </Typography>
          </Stack>
        ),
      },
      {
        field: 'displayStatus',
        headerName: 'Status',
        flex: 0.95,
        minWidth: 130,
        sortable: true,
        renderCell: ({ row }) => <TaskStatusChip displayStatus={row.displayStatus} />,
      },
      {
        field: 'relatedSummary',
        headerName: 'Related policy / Insured',
        flex: 1.2,
        minWidth: 180,
        sortable: true,
        valueGetter: (_, row) => getTaskRelatedSummary(row).primary,
        renderCell: ({ row }) => <RelatedCell row={row} />,
      },
      {
        field: 'assignedTo',
        headerName: 'Assigned',
        flex: 1,
        minWidth: 150,
        sortable: true,
        renderCell: ({ row }) => (
          <Stack spacing={0.125} sx={{ py: 0.25, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem' }} noWrap>
              {row.assignedTo}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ fontFamily: figmaFontFamilyStack.body }}>
              {row.team}
            </Typography>
          </Stack>
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
            onTaskCopilot={onTaskCopilot}
            onTaskComplete={onTaskComplete}
            isCopilotActive={activeCopilotTaskId === row.id}
          />
        ),
      },
    ],
    [activeCopilotTaskId, activeTaskId, onTaskComplete, onTaskCopilot, onTaskOpen],
  )

  return (
    <Box sx={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', flexDirection: 'column' }}>
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
          sorting: { sortModel: [{ field: 'ageIndicator', sort: 'asc' }] },
          pagination: { paginationModel: { pageSize: 10, page: 0 } },
        }}
        pageSizeOptions={[10, 25, 50]}
        pinnedColumns={{ left: ['__check__', 'taskName'], right: ['actions'] }}
        disableColumnReorder
        columnHeaderHeight={40}
        getRowHeight={() => 'auto'}
        getRowClassName={({ id }) => (activeTaskId === id ? 'task-row-active' : '')}
        slotProps={getListDataGridSlotProps()}
        {...listDataGridFilterProps}
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
              boxShadow: (theme) => dataGridPinnedShadow(theme, 'left'),
            },
            '& .MuiDataGrid-columnHeader--pinnedLeft': {
              bgcolor: (theme) => surfaceMuted(theme),
            },
            '& .MuiDataGrid-cell--pinnedRight, & .MuiDataGrid-columnHeader--pinnedRight': {
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
              '& .MuiDataGrid-cell--pinnedLeft, & .MuiDataGrid-cell--pinnedRight': {
                bgcolor: (theme) => accentSubtle(theme),
              },
              '&:hover .MuiDataGrid-cell--pinnedLeft, &:hover .MuiDataGrid-cell--pinnedRight': {
                bgcolor: (theme) => `${accentSubtle(theme)} !important`,
              },
            },
            '& .MuiDataGrid-row.task-row-active': {
              bgcolor: (theme) => accentSubtle(theme),
              '&:hover': {
                bgcolor: (theme) => accentSubtle(theme),
              },
              '& .MuiDataGrid-cell--pinnedLeft, & .MuiDataGrid-cell--pinnedRight': {
                bgcolor: (theme) => accentSubtle(theme),
              },
              '&:hover .MuiDataGrid-cell--pinnedLeft, &:hover .MuiDataGrid-cell--pinnedRight': {
                bgcolor: (theme) => `${accentSubtle(theme)} !important`,
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

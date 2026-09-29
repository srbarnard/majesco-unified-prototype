import MoreVertIcon from '@mui/icons-material/MoreVert'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
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
import { useResponsivePinnedColumns } from '@/design-system/hooks/useResponsivePinnedColumns'
import {
  CopilotIcon,
  copilotActiveIconSx,
  getListDataGridSlotProps,
  listDataGridActionColumnProps,
  listDataGridFilterProps,
  tableActionIconButtonSx,
  tableLinkSx,
} from '@/design-system/components'
import { listDataGridContainerSx } from '@/design-system/tokens/tableLayout'
import { accentSubtle, dataGridPinnedBodyCellBackground, dataGridPinnedShadow, dataGridShellSx, surfaceMuted } from '@/design-system/theme/themeSurfaces'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { TaskPriorityIndicator } from '@/pages/tasks/components/TaskPriorityIndicator'
import { TaskStatusChip } from '@/pages/tasks/components/TaskStatusChip'
import type { TaskRecord } from '@/pages/tasks/data/mockTasks'
import { getTaskPolicyRoute, getTaskRelatedSummary } from '@/pages/tasks/data/mockTasks'
const CHECKBOX_COLUMN_WIDTH = 50
const TASK_ROW_HEIGHT = 52

/** Tasks list: no blue row / link-cell hover fills (selected + active stay static). */
const tasksDataGridNoHoverSx = {
  '& .MuiDataGrid-row:hover, & .MuiDataGrid-row.Mui-hovered': {
    bgcolor: 'transparent !important',
    backgroundColor: 'transparent !important',
  },
  '& .MuiDataGrid-row:hover .MuiDataGrid-cell, & .MuiDataGrid-row.Mui-hovered .MuiDataGrid-cell': {
    bgcolor: 'transparent !important',
    backgroundColor: 'transparent !important',
    background: 'transparent !important',
  },
  '& .MuiDataGrid-row:hover .MuiDataGrid-cell--pinnedLeft, & .MuiDataGrid-row:hover .MuiDataGrid-cell--pinnedRight, & .MuiDataGrid-row.Mui-hovered .MuiDataGrid-cell--pinnedLeft, & .MuiDataGrid-row.Mui-hovered .MuiDataGrid-cell--pinnedRight':
    {
      bgcolor: (theme: Theme) => `${dataGridPinnedBodyCellBackground(theme)} !important`,
      backgroundColor: (theme: Theme) => `${dataGridPinnedBodyCellBackground(theme)} !important`,
      background: (theme: Theme) => `${dataGridPinnedBodyCellBackground(theme)} !important`,
    },
  '& .MuiDataGrid-cell:has(.MuiLink-root:hover), & .MuiDataGrid-cell--pinnedLeft:has(.MuiLink-root:hover), & .MuiDataGrid-cell--pinnedRight:has(.MuiLink-root:hover)':
    {
      bgcolor: 'transparent !important',
      backgroundColor: 'transparent !important',
      background: 'transparent !important',
    },
  '& .MuiDataGrid-row.Mui-selected:hover, & .MuiDataGrid-row.Mui-selected.Mui-hovered, & .MuiDataGrid-row.task-row-active:hover, & .MuiDataGrid-row.task-row-active.Mui-hovered':
    {
      bgcolor: (theme: Theme) => `${accentSubtle(theme)} !important`,
      backgroundColor: (theme: Theme) => `${accentSubtle(theme)} !important`,
    },
  '& .MuiDataGrid-row.Mui-selected:hover .MuiDataGrid-cell--pinnedLeft, & .MuiDataGrid-row.Mui-selected:hover .MuiDataGrid-cell--pinnedRight, & .MuiDataGrid-row.Mui-selected.Mui-hovered .MuiDataGrid-cell--pinnedLeft, & .MuiDataGrid-row.Mui-selected.Mui-hovered .MuiDataGrid-cell--pinnedRight, & .MuiDataGrid-row.task-row-active:hover .MuiDataGrid-cell--pinnedLeft, & .MuiDataGrid-row.task-row-active:hover .MuiDataGrid-cell--pinnedRight, & .MuiDataGrid-row.task-row-active.Mui-hovered .MuiDataGrid-cell--pinnedLeft, & .MuiDataGrid-row.task-row-active.Mui-hovered .MuiDataGrid-cell--pinnedRight':
    {
      bgcolor: (theme: Theme) => `${accentSubtle(theme)} !important`,
      backgroundColor: (theme: Theme) => `${accentSubtle(theme)} !important`,
      background: (theme: Theme) => `${accentSubtle(theme)} !important`,
    },
  '& .MuiDataGrid-cell .MuiIconButton-root:not([aria-pressed="true"])': {
    ...tableActionIconButtonSx,
  },
} as const

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
  onToggleAlert?: (task: TaskRecord) => void
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
  const subtitle = taskSubtitle(row)
  return (
    <Stack spacing={0} sx={{ minWidth: 0, width: '100%', alignItems: 'flex-start' }}>
      <Link
        component="button"
        variant="body2"
        underline="hover"
        onClick={() => onTaskOpen?.(row)}
        title={row.taskName}
        sx={{
          fontWeight: 500,
          fontSize: '0.8125rem',
          lineHeight: 1.35,
          textAlign: 'left',
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          color: isActive ? 'primary.main' : undefined,
          ...tableLinkSx,
        }}
      >
        {row.taskName}
      </Link>
      {subtitle ? (
        <Typography
          variant="caption"
          color="text.secondary"
          noWrap
          title={subtitle}
          sx={{
            fontFamily: figmaFontFamilyStack.body,
            fontSize: '0.6875rem',
            lineHeight: 1.35,
            maxWidth: '100%',
            display: 'block',
          }}
        >
          {subtitle}
        </Typography>
      ) : null}
    </Stack>
  )
}

/** One-line subtitle: the next step, unless it just restates the title. */
function taskSubtitle(row: TaskRecord) {
  const title = row.taskName.toLowerCase()
  const next = row.nextAction.trim()
  if (!next) return null
  const lead = next.toLowerCase().split(/\s+/).slice(0, 3).join(' ')
  return title.includes(lead) ? null : next
}

const singleLineSx = {
  fontFamily: figmaFontFamilyStack.body,
  fontSize: '0.8125rem',
  lineHeight: 1.35,
} as const

function RelatedCell({ row }: { row: TaskRecord }) {
  const related = getTaskRelatedSummary(row)
  const policyRoute = getTaskPolicyRoute(row)

  return (
    <Stack
      direction="row"
      spacing={0.75}
      alignItems="baseline"
      sx={{ minWidth: 0, width: '100%' }}
      title={`${related.primary} · ${related.secondary}`}
    >
      <Typography variant="body2" noWrap sx={{ ...singleLineSx, minWidth: 0, flexShrink: 1 }}>
        {related.primary}
      </Typography>
      {policyRoute ? (
        <Link
          component={RouterLink}
          to={policyRoute}
          variant="caption"
          underline="hover"
          onClick={(event) => event.stopPropagation()}
          sx={{ fontFamily: figmaFontFamilyStack.body, flexShrink: 0, whiteSpace: 'nowrap', ...tableLinkSx }}
        >
          {related.secondary}
        </Link>
      ) : (
        <Typography
          variant="caption"
          color="text.secondary"
          noWrap
          sx={{ fontFamily: figmaFontFamilyStack.body, flexShrink: 0 }}
        >
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
  onToggleAlert,
  isCopilotActive,
}: {
  row: TaskRecord
  onTaskCopilot?: (task: TaskRecord) => void
  onTaskComplete?: (task: TaskRecord) => void
  onToggleAlert?: (task: TaskRecord) => void
  isCopilotActive?: boolean
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const alertLabel = row.hasAlert ? 'Turn off alerts' : 'Turn on alerts'

  return (
    <>
      <Stack direction="row" spacing={0.25} justifyContent="flex-end" alignItems="center" sx={{ width: '100%' }}>
        <Tooltip title={alertLabel}>
          <IconButton
            size="small"
            aria-label={`${alertLabel} for ${row.taskName}`}
            aria-pressed={row.hasAlert}
            onClick={(event) => {
              event.stopPropagation()
              onToggleAlert?.(row)
            }}
            onMouseDown={(event) => event.stopPropagation()}
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
  onToggleAlert,
  activeCopilotTaskId,
  activeTaskId,
}: TasksDataGridProps) {
  const columns = useMemo<GridColDef<TaskRecord>[]>(
    () => [
      {
        field: 'taskName',
        headerName: 'Task',
        width: 300,
        minWidth: 240,
        sortable: true,
        renderCell: ({ row }) => (
          <TaskNameCell row={row} onTaskOpen={onTaskOpen} isActive={activeTaskId === row.id} />
        ),
      },
      {
        field: 'priority',
        headerName: 'Priority',
        flex: 0.6,
        minWidth: 96,
        sortable: true,
        valueGetter: (_, row) => row.priority,
        renderCell: ({ row }) => <TaskPriorityIndicator priority={row.priority} />,
      },
      {
        field: 'ageIndicator',
        headerName: 'SLA / Age',
        flex: 0.8,
        minWidth: 120,
        sortable: true,
        valueGetter: (_, row) => row.dueDate,
        renderCell: ({ row }) => (
          <Tooltip
            title={`${row.agingDays}d open${/\d{4}/.test(row.dueLabel) ? ` · due ${row.dueLabel}` : ''}`}
            placement="top-start"
          >
            <Typography variant="body2" noWrap sx={singleLineSx}>
              {row.ageIndicator}
            </Typography>
          </Tooltip>
        ),
      },
      {
        field: 'displayStatus',
        headerName: 'Status',
        flex: 0.85,
        minWidth: 130,
        sortable: true,
        renderCell: ({ row }) => <TaskStatusChip displayStatus={row.displayStatus} />,
      },
      {
        field: 'relatedSummary',
        headerName: 'Related policy / Insured',
        flex: 1.3,
        minWidth: 230,
        sortable: true,
        valueGetter: (_, row) => getTaskRelatedSummary(row).primary,
        renderCell: ({ row }) => <RelatedCell row={row} />,
      },
      {
        field: 'assignedTo',
        headerName: 'Assigned',
        flex: 0.85,
        minWidth: 130,
        sortable: true,
        renderCell: ({ row }) => (
          <Typography variant="body2" noWrap title={`${row.assignedTo} · ${row.team}`} sx={singleLineSx}>
            {row.assignedTo}
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
        resizable: false,
        align: 'right',
        headerAlign: 'right',
        ...listDataGridActionColumnProps,
        renderCell: ({ row }) => (
          <RowActionsMenu
            row={row}
            onTaskCopilot={onTaskCopilot}
            onTaskComplete={onTaskComplete}
            onToggleAlert={onToggleAlert}
            isCopilotActive={activeCopilotTaskId === row.id}
          />
        ),
      },
    ],
    [activeCopilotTaskId, activeTaskId, onTaskComplete, onTaskCopilot, onTaskOpen, onToggleAlert],
  )

  const { pinnedColumns, disableColumnPinning } = useResponsivePinnedColumns({
    left: ['__check__', 'taskName'],
    right: ['actions'],
  })

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
          sorting: { sortModel: [{ field: 'ageIndicator', sort: 'asc' }] },
          pagination: { paginationModel: { pageSize: 10, page: 0 } },
        }}
        pageSizeOptions={[10, 25, 50]}
        pinnedColumns={pinnedColumns}
        disableColumnPinning={disableColumnPinning}
        disableColumnReorder
        columnHeaderHeight={40}
        rowHeight={TASK_ROW_HEIGHT}
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
              py: 0,
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
          }, { headerFilters: true, footer: true }), tasksDataGridNoHoverSx] as SxProps<Theme>}
      />
    </Box>
  )
}

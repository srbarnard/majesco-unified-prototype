import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
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
import type { MouseEvent } from 'react'
import type { SxProps, Theme } from '@mui/material/styles'
import {
  Chip,
  CopilotIcon,
  dataGridInteractionSx,
  getListDataGridSlotProps,
  listDataGridActionColumnProps,
  listDataGridFilterProps,
  tableActionIconButtonSx,
  tableLinkSx,
} from '@/design-system/components'
import { accentSubtle, dataGridPinnedShadow, dataGridShellSx, surfaceMuted, surfaceSubtle } from '@/design-system/theme/themeSurfaces'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import type { PolicyDocument } from '@/pages/policies/data/mockDocuments'

const CHECKBOX_COLUMN_WIDTH = 50

type DocumentsDataGridProps = {
  rows: PolicyDocument[]
  rowSelectionModel: GridRowSelectionModel
  onRowSelectionModelChange: (model: GridRowSelectionModel) => void
  onDocumentOpen?: (document: PolicyDocument) => void
  activePreviewDocumentId?: string | null
  activeCopilotDocumentId?: string | null
}

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

function stopGridNavigation(event: MouseEvent) {
  event.stopPropagation()
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  })
}

function DocumentNameCell({
  row,
  onDocumentOpen,
  isPreviewActive,
}: {
  row: PolicyDocument
  onDocumentOpen?: (document: PolicyDocument) => void
  isPreviewActive?: boolean
}) {
  return (
    <Box sx={{ py: 0.25, width: '100%', pr: 1, minWidth: 0 }}>
      <Link
        component="button"
        variant="body2"
        underline="hover"
        onClick={(event) => {
          stopGridNavigation(event)
          onDocumentOpen?.(row)
        }}
        onMouseDown={stopGridNavigation}
        aria-pressed={isPreviewActive}
        sx={{
          fontWeight: 600,
          textAlign: 'left',
          display: 'block',
          mb: 0.5,
          ...bodySx,
          ...tableLinkSx,
          ...(isPreviewActive && { color: 'primary.main' }),
        }}
      >
        {row.fileName}
      </Link>
      <Stack direction="row" spacing={0.5} alignItems="flex-start">
        <Box sx={{ mt: 0.125, flexShrink: 0, lineHeight: 0, color: 'text.secondary' }}>
          <CopilotIcon size={14} active={false} />
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ ...bodySx, lineHeight: 1.5, flex: 1 }}>
          {row.aiSummary}
        </Typography>
      </Stack>
    </Box>
  )
}

function TagCell({ row }: { row: PolicyDocument }) {
  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ py: 0.25 }}>
      {row.tags.map((tag) => (
        <Chip
          key={tag}
          label={tag}
          size="small"
          variant={tag === 'Package' ? 'filled' : 'outlined'}
          color={tag === 'Package' ? 'info' : 'default'}
          icon={tag === 'Package' ? <EditOutlinedIcon sx={{ fontSize: '14px !important' }} /> : undefined}
          sx={{
            ...(tag === '2026 Renewal' && {
              bgcolor: (theme) => surfaceSubtle(theme),
              border: 'none',
            }),
          }}
        />
      ))}
    </Stack>
  )
}

function RowActionsMenu({
  row,
  onDocumentOpen,
  isPreviewActive,
  isCopilotActive,
}: {
  row: PolicyDocument
  onDocumentOpen?: (document: PolicyDocument) => void
  isPreviewActive?: boolean
  isCopilotActive?: boolean
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  return (
    <>
      <Stack direction="row" spacing={0.25} justifyContent="flex-end" alignItems="center" sx={{ width: '100%' }}>
        <Tooltip title="Download">
          <IconButton size="small" aria-label={`Download ${row.id}`} sx={tableActionIconButtonSx}>
            <DownloadOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Summarize with Copilot">
          <IconButton
            size="small"
            aria-label={`Summarize ${row.fileName} with Copilot`}
            aria-pressed={isPreviewActive || isCopilotActive}
            onClick={(event) => {
              stopGridNavigation(event)
              onDocumentOpen?.(row)
            }}
            sx={tableActionIconButtonSx}
          >
            <CopilotIcon size={18} active={Boolean(isPreviewActive || isCopilotActive)} />
          </IconButton>
        </Tooltip>
        <Tooltip title="More actions">
          <IconButton
            size="small"
            aria-label={`More actions for ${row.id}`}
            onClick={(event) => {
              stopGridNavigation(event)
              setAnchorEl(event.currentTarget)
            }}
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
            onDocumentOpen?.(row)
          }}
        >
          View details
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Rename</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Attach to submission</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Remove</MenuItem>
      </Menu>
    </>
  )
}

export function DocumentsDataGrid({
  rows,
  rowSelectionModel,
  onRowSelectionModelChange,
  onDocumentOpen,
  activePreviewDocumentId,
  activeCopilotDocumentId,
}: DocumentsDataGridProps) {
  const columns = useMemo<GridColDef<PolicyDocument>[]>(
    () => [
      {
        field: 'fileName',
        headerName: 'Document/Form/Package • AI Summary',
        flex: 1.6,
        minWidth: 280,
        sortable: true,
        renderCell: ({ row }) => (
          <DocumentNameCell
            row={row}
            onDocumentOpen={onDocumentOpen}
            isPreviewActive={activePreviewDocumentId === row.id}
          />
        ),
      },
      {
        field: 'tags',
        headerName: 'Tag',
        flex: 1,
        minWidth: 160,
        sortable: true,
        valueGetter: (_, row) => row.tags.join(', '),
        renderCell: ({ row }) => <TagCell row={row} />,
      },
      {
        field: 'author',
        headerName: 'Author',
        flex: 1,
        minWidth: 150,
        sortable: true,
        renderCell: ({ row }) => (
          <Box sx={{ py: 0.25, pr: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ ...bodySx, fontSize: '0.8125rem' }}>
              {row.author}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={bodySx}>
              {row.authorDetail}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'date',
        headerName: 'Date',
        flex: 0.75,
        minWidth: 108,
        type: 'date',
        sortable: true,
        valueGetter: (_, row) => new Date(row.date),
        renderCell: ({ row }) => (
          <Box sx={{ py: 0.25 }}>
            <Typography variant="body2" sx={{ ...bodySx, fontSize: '0.8125rem' }}>
              {formatDate(row.date)}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={bodySx}>
              {row.relativeTime}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'activityLabel',
        headerName: 'Activity',
        flex: 0.85,
        minWidth: 120,
        sortable: true,
        valueGetter: (_, row) => `${row.activityLabel}-${row.activityCount}`,
        renderCell: ({ row }) => (
          <Typography variant="body2" color="text.secondary" sx={{ ...bodySx, fontSize: '0.8125rem', py: 0.25 }}>
            {row.activityLabel} - {row.activityCount}
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
            onDocumentOpen={onDocumentOpen}
            isPreviewActive={activePreviewDocumentId === row.id}
            isCopilotActive={activeCopilotDocumentId === row.id}
          />
        ),
      },
    ],
    [activeCopilotDocumentId, activePreviewDocumentId, onDocumentOpen],
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
          sorting: { sortModel: [{ field: 'date', sort: 'desc' }] },
          pagination: { paginationModel: { pageSize: 15, page: 0 } },
        }}
        pageSizeOptions={[10, 15, 25, 50]}
        pinnedColumns={{ left: ['__check__', 'fileName'], right: ['actions'] }}
        disableColumnReorder
        columnHeaderHeight={40}
        getRowHeight={() => 'auto'}
        getRowClassName={({ id }) => (activePreviewDocumentId === id ? 'document-row-active' : '')}
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
              whiteSpace: 'normal',
              overflow: 'visible',
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
            '& .MuiDataGrid-row.document-row-active': {
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

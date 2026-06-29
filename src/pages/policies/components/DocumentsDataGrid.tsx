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
import { useMemo, useState } from 'react'
import {
  Chip,
  CopilotIcon,
  DataTable,
  sortDataTableRows,
  tableActionIconButtonSx,
  tableLinkSx,
  type DataTableColumn,
  type DataTableSort,
} from '@/design-system/components'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import type { PolicyDocument } from '@/pages/policies/data/mockDocuments'

type DocumentRow = PolicyDocument & Record<string, unknown>

type DocumentsDataGridProps = {
  rows: PolicyDocument[]
  selectedIds: Set<string>
  onSelectionChange: (selection: Set<string | number>) => void
  onDocumentCopilot?: (document: PolicyDocument) => void
  activeCopilotDocumentId?: string | null
}

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

function DocumentNameCell({ row }: { row: PolicyDocument }) {
  return (
    <Box sx={{ py: 0.25, width: '100%', pr: 1 }}>
      <Link
        component="button"
        variant="body2"
        underline="hover"
        sx={{ fontWeight: 600, textAlign: 'left', display: 'block', mb: 0.5, ...bodySx, ...tableLinkSx }}
      >
        {row.fileName}
      </Link>
      <Typography variant="caption" color="text.secondary" sx={{ ...bodySx, lineHeight: 1.5, display: 'block' }}>
        {row.aiSummary}
      </Typography>
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
              bgcolor: (theme) => theme.figmaPalette.grey[100],
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
  onDocumentCopilot,
  isCopilotActive,
}: {
  row: PolicyDocument
  onDocumentCopilot?: (document: PolicyDocument) => void
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
        <Tooltip title="More actions">
          <IconButton
            size="small"
            aria-label={`More actions for ${row.id}`}
            onClick={(event) => setAnchorEl(event.currentTarget)}
            sx={tableActionIconButtonSx}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Summarize with Copilot">
          <IconButton
            size="small"
            aria-label={`Summarize ${row.fileName} with Copilot`}
            aria-pressed={isCopilotActive}
            onClick={() => onDocumentCopilot?.(row)}
            sx={{
              ...tableActionIconButtonSx,
              ...(isCopilotActive && {
                bgcolor: (theme) => theme.figmaPalette.blue[50],
                '&:hover': {
                  bgcolor: (theme) => theme.figmaPalette.blue[50],
                },
              }),
            }}
          >
            <CopilotIcon size={18} active={isCopilotActive} />
          </IconButton>
        </Tooltip>
      </Stack>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => setAnchorEl(null)}>View details</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Rename</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Attach to submission</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Remove</MenuItem>
      </Menu>
    </>
  )
}

export function DocumentsDataGrid({
  rows,
  selectedIds,
  onSelectionChange,
  onDocumentCopilot,
  activeCopilotDocumentId,
}: DocumentsDataGridProps) {
  const [sort, setSort] = useState<DataTableSort>({ columnId: 'date', direction: 'desc' })

  const columns = useMemo<DataTableColumn<DocumentRow>[]>(
    () => [
      {
        id: 'fileName',
        label: 'Document/Form/Package • AI Summary',
        sortable: true,
        sortValue: (row) => row.fileName,
        render: (row) => <DocumentNameCell row={row} />,
      },
      {
        id: 'tags',
        label: 'Tag',
        sortable: true,
        sortValue: (row) => row.tags.join(', '),
        render: (row) => <TagCell row={row} />,
      },
      {
        id: 'author',
        label: 'Author',
        sortable: true,
        sortValue: (row) => row.author,
        render: (row) => (
          <Box sx={{ py: 0.25, pr: 1 }}>
            <Typography variant="body2" sx={bodySx}>
              {row.author}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={bodySx}>
              {row.authorDetail}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'date',
        label: 'Date',
        sortable: true,
        sortValue: (row) => new Date(row.date).getTime(),
        render: (row) => (
          <Box sx={{ py: 0.25 }}>
            <Typography variant="body2" sx={bodySx}>
              {new Date(row.date).toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric',
              })}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={bodySx}>
              {row.relativeTime}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'activityLabel',
        label: 'Activity',
        sortable: true,
        sortValue: (row) => `${row.activityLabel}-${row.activityCount}`,
        render: (row) => (
          <Typography variant="body2" color="text.secondary" sx={{ ...bodySx, py: 0.25 }}>
            {row.activityLabel} - {row.activityCount}
          </Typography>
        ),
      },
      {
        id: 'actions',
        label: 'Actions',
        align: 'right',
        render: (row) => (
          <RowActionsMenu
            row={row}
            onDocumentCopilot={onDocumentCopilot}
            isCopilotActive={activeCopilotDocumentId === row.id}
          />
        ),
      },
    ],
    [activeCopilotDocumentId, onDocumentCopilot],
  )

  const sortedRows = useMemo(
    () => sortDataTableRows(rows as DocumentRow[], columns, sort),
    [rows, columns, sort],
  )

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <DataTable<DocumentRow>
        borderless
        columns={columns}
        rows={sortedRows}
        getRowId={(row) => row.id}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={onSelectionChange}
        sort={sort}
        onSortChange={setSort}
        emptyMessage="No documents found."
      />
    </Box>
  )
}

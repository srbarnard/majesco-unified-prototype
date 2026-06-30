import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { DataGridPremium, type GridColDef } from '@mui/x-data-grid-premium'
import { useMemo } from 'react'
import type { SxProps, Theme } from '@mui/material/styles'
import { Chip, dataGridInteractionSx } from '@/design-system/components'
import { dataGridShellSx, surfaceMuted } from '@/design-system/theme/themeSurfaces'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import type { OverviewTransaction } from '@/pages/policies/data/mockOverview'

type RecentTransactionsDataGridProps = {
  rows: OverviewTransaction[]
}

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

const subtitleSx = {
  fontFamily: figmaFontFamilyStack.heading,
  fontWeight: 500,
} as const

function StatusChip({ status, tone }: { status: string; tone: OverviewTransaction['statusTone'] }) {
  const colorMap = {
    success: 'success',
    warning: 'warning',
    error: 'error',
    info: 'info',
    default: 'default',
  } as const

  return <Chip label={status} size="small" color={colorMap[tone]} variant="filled" />
}

export function RecentTransactionsDataGrid({ rows }: RecentTransactionsDataGridProps) {
  const columns = useMemo<GridColDef<OverviewTransaction>[]>(
    () => [
      {
        field: 'type',
        headerName: 'Type',
        flex: 0.9,
        minWidth: 120,
        sortable: true,
        renderCell: ({ row }) => (
          <Typography variant="body2" sx={{ ...bodySx, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
            {row.type}
            {row.revision && (
              <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5, ...bodySx }}>
                · {row.revision}
              </Typography>
            )}
          </Typography>
        ),
      },
      {
        field: 'description',
        headerName: 'Description',
        flex: 1.6,
        minWidth: 200,
        sortable: true,
        renderCell: ({ row }) => (
          <Typography variant="body2" sx={{ ...bodySx, fontSize: '0.8125rem', fontWeight: 500 }}>
            {row.description}
          </Typography>
        ),
      },
      {
        field: 'status',
        headerName: 'Status',
        flex: 0.85,
        minWidth: 110,
        sortable: true,
        renderCell: ({ row }) => <StatusChip status={row.status} tone={row.statusTone} />,
      },
      {
        field: 'premiumChange',
        headerName: 'Premium',
        flex: 0.85,
        minWidth: 108,
        sortable: false,
        renderCell: ({ row }) =>
          row.premiumChange ? (
            <Stack direction="row" spacing={0.25} alignItems="center">
              {row.premiumDirection === 'up' ? (
                <ArrowUpwardIcon sx={{ fontSize: 14, color: 'success.main' }} />
              ) : (
                <ArrowDownwardIcon sx={{ fontSize: 14, color: 'error.main' }} />
              )}
              <Typography
                variant="caption"
                fontWeight={600}
                color={row.premiumDirection === 'up' ? 'success.main' : 'error.main'}
                sx={bodySx}
              >
                {row.premiumChange}
              </Typography>
            </Stack>
          ) : (
            <Typography variant="caption" color="text.disabled" sx={bodySx}>
              —
            </Typography>
          ),
      },
      {
        field: 'effectiveDate',
        headerName: 'Date',
        flex: 0.8,
        minWidth: 108,
        sortable: true,
        renderCell: ({ row }) => (
          <Typography variant="body2" color="text.secondary" sx={{ ...bodySx, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
            {row.effectiveDate}
          </Typography>
        ),
      },
    ],
    [],
  )

  return (
    <Box sx={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', flexDirection: 'column' }}>
      <DataGridPremium
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        disableColumnMenu
        disableColumnReorder
        disableRowSelectionOnClick
        sortingOrder={['asc', 'desc']}
        columnHeaderHeight={40}
        rowHeight={52}
        hideFooter
        sx={
          [
            ...dataGridShellSx({
              border: 0,
              borderRadius: 0,
              bgcolor: 'background.paper',
              '& .MuiDataGrid-columnHeaders': {
                bgcolor: (theme) => surfaceMuted(theme),
                borderBottom: 1,
                borderColor: 'divider',
              },
              '& .MuiDataGrid-columnHeader': {
                px: 1.5,
                ...subtitleSx,
                fontSize: '0.75rem',
              },
              '& .MuiDataGrid-columnHeader:first-of-type': {
                pl: 2,
              },
              '& .MuiDataGrid-columnHeader:last-of-type': {
                pr: 2,
              },
              '& .MuiDataGrid-cell': {
                px: 1.5,
                py: 0,
                display: 'flex',
                alignItems: 'center',
                borderColor: 'divider',
              },
              '& .MuiDataGrid-cell:first-of-type': {
                pl: 2,
              },
              '& .MuiDataGrid-cell:last-of-type': {
                pr: 2,
              },
              '& .MuiDataGrid-row:last-of-type .MuiDataGrid-cell': {
                borderBottom: 0,
              },
            }),
            dataGridInteractionSx,
          ] as SxProps<Theme>
        }
      />
    </Box>
  )
}

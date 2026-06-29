import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { SxProps, Theme } from '@mui/material/styles'
import { DataGridPremium, type GridColDef } from '@mui/x-data-grid-premium'
import { useMemo } from 'react'
import { dataGridInteractionSx } from '@/design-system/components'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { surfaceMuted } from '@/design-system/theme/themeSurfaces'
import { teamMembersMock, type TeamMemberRecord } from '@/pages/tasks/data/mockTasks'

type TeamStructureOverviewProps = {
  searchQuery: string
}

function matchesSearch(member: TeamMemberRecord, query: string) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true
  return member.name.toLowerCase().includes(normalized) || member.title.toLowerCase().includes(normalized)
}

export function TeamStructureOverview({ searchQuery }: TeamStructureOverviewProps) {
  const rows = useMemo(
    () => teamMembersMock.filter((member) => matchesSearch(member, searchQuery)),
    [searchQuery],
  )

  const columns = useMemo<GridColDef<TeamMemberRecord>[]>(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        flex: 1.4,
        minWidth: 220,
        sortable: true,
        renderCell: ({ row }) => (
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ py: 0.25 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                fontSize: '0.75rem',
                fontWeight: 600,
                bgcolor: (theme) => theme.figmaPalette.grey[200],
                color: 'text.secondary',
              }}
            >
              {row.initials}
            </Avatar>
            <Typography variant="body2" sx={{ fontFamily: figmaFontFamilyStack.body, fontWeight: 500, fontSize: '0.8125rem' }}>
              {row.name}
            </Typography>
          </Stack>
        ),
      },
      {
        field: 'totalTasks',
        headerName: 'Total',
        flex: 0.6,
        minWidth: 80,
        sortable: true,
        renderCell: ({ row }) => (
          <Typography variant="body2" sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem' }}>
            {row.totalTasks}
          </Typography>
        ),
      },
      {
        field: 'dueToday',
        headerName: 'Due today',
        flex: 0.7,
        minWidth: 90,
        sortable: true,
      },
      {
        field: 'pastDue',
        headerName: 'Past due',
        flex: 0.7,
        minWidth: 90,
        sortable: true,
        renderCell: ({ row }) => (
          <Typography
            variant="body2"
            sx={{
              fontFamily: figmaFontFamilyStack.body,
              fontSize: '0.8125rem',
              color: row.pastDue > 0 ? 'error.main' : 'text.primary',
              fontWeight: row.pastDue > 0 ? 600 : 400,
            }}
          >
            {row.pastDue}
          </Typography>
        ),
      },
      {
        field: 'days0to2',
        headerName: '0-2 days',
        flex: 0.7,
        minWidth: 90,
        sortable: true,
      },
      {
        field: 'days3to5',
        headerName: '3-5 days',
        flex: 0.7,
        minWidth: 90,
        sortable: true,
      },
      {
        field: 'days6plus',
        headerName: '6+ days',
        flex: 0.7,
        minWidth: 90,
        sortable: true,
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
        sortingOrder={['asc', 'desc']}
        initialState={{
          sorting: { sortModel: [{ field: 'totalTasks', sort: 'desc' }] },
          pagination: { paginationModel: { pageSize: 10, page: 0 } },
        }}
        pageSizeOptions={[10, 25]}
        disableColumnReorder
        columnHeaderHeight={40}
        getRowHeight={() => 'auto'}
        sx={[
          {
            flex: 1,
            minHeight: 0,
            height: '100%',
            border: 'none',
            borderRadius: 0,
            bgcolor: 'background.paper',
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: (theme) => surfaceMuted(theme),
              borderBottom: 1,
              borderColor: 'divider',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 600,
              fontSize: '0.75rem',
              color: 'text.secondary',
            },
            '& .MuiDataGrid-cell': {
              px: 1.5,
              py: 1,
              display: 'flex',
              alignItems: 'center',
              borderColor: 'divider',
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: 1,
              borderColor: 'divider',
            },
          },
          dataGridInteractionSx,
        ] as SxProps<Theme>}
      />
    </Box>
  )
}

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  DataGridPremium,
  useGridApiRef,
  type GridApi,
  type GridColDef,
} from '@mui/x-data-grid-premium'
import { useMemo, useState, type ReactNode } from 'react'
import type { MutableRefObject } from 'react'
import type { SxProps, Theme } from '@mui/material/styles'
import {
  dataGridInteractionSx,
  getListDataGridSlotProps,
  ListDataGridToolbar,
  listDataGridFilterProps,
} from '@/design-system/components'
import { analyticsHeadingSx } from '@/design-system/components/analytics/analyticsStyles'
import { dataGridShellSx } from '@/design-system/theme/themeSurfaces'

export type InsightsTableColumn<T> = {
  id: string
  label: string
  align?: 'left' | 'right' | 'center'
  /** Sort / filter / export value. Falls back to string render output when omitted. */
  value?: (row: T) => string | number
  render: (row: T) => ReactNode
  minWidth?: number
  flex?: number
}

type InsightsDataGridProps<T> = {
  apiRef: MutableRefObject<GridApi>
  columns: InsightsTableColumn<T>[]
  rows: T[]
  getRowId: (row: T) => string
}

function resolveColumnValue<T>(column: InsightsTableColumn<T>, row: T): string | number {
  if (column.value) return column.value(row)
  const rendered = column.render(row)
  if (typeof rendered === 'string' || typeof rendered === 'number') return rendered
  return ''
}

export function InsightsDataGrid<T>({ apiRef, columns, rows, getRowId }: InsightsDataGridProps<T>) {
  const gridColumns = useMemo<GridColDef[]>(
    () =>
      columns.map((column) => ({
        field: column.id,
        headerName: column.label,
        flex: column.flex ?? 1,
        minWidth: column.minWidth ?? (column.align === 'right' ? 110 : 140),
        align: column.align ?? 'left',
        headerAlign: column.align ?? 'left',
        sortable: true,
        valueGetter: (_value, row) => resolveColumnValue(column, row as T),
        renderCell: ({ row }) => column.render(row as T),
      })),
    [columns],
  )

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <DataGridPremium
        apiRef={apiRef}
        rows={rows}
        columns={gridColumns}
        getRowId={(row) => getRowId(row as T)}
        sortingOrder={['asc', 'desc']}
        disableColumnReorder
        columnHeaderHeight={40}
        getRowHeight={() => 'auto'}
        autoHeight
        hideFooter
        slotProps={getListDataGridSlotProps()}
        {...listDataGridFilterProps}
        sx={
          [
            ...dataGridShellSx({
              minHeight: 'unset',
              maxHeight: 'none',
              height: 'auto',
            }),
            dataGridInteractionSx,
          ] as SxProps<Theme>
        }
      />
    </Box>
  )
}

type InsightsDataGridSectionProps<T> = {
  title?: string
  exportFileName: string
  exportAriaLabel?: string
  searchPlaceholder: string
  columns: InsightsTableColumn<T>[]
  rows: T[]
  getRowId: (row: T) => string
  /** Extra text indexed by the toolbar search field. */
  getSearchText?: (row: T) => string
}

export function InsightsDataGridSection<T>({
  title,
  exportFileName,
  exportAriaLabel,
  searchPlaceholder,
  columns,
  rows,
  getRowId,
  getSearchText,
}: InsightsDataGridSectionProps<T>) {
  const apiRef = useGridApiRef()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredRows = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase()
    if (!normalized) return rows
    return rows.filter((row) => {
      if (getSearchText?.(row).toLowerCase().includes(normalized)) return true
      return columns.some((column) =>
        String(resolveColumnValue(column, row)).toLowerCase().includes(normalized),
      )
    })
  }, [columns, getSearchText, rows, searchQuery])

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      {title ? (
        <Typography variant="subtitle1" sx={{ ...analyticsHeadingSx, fontSize: '1rem', mb: 1.5 }}>
          {title}
        </Typography>
      ) : null}
      <Stack spacing={1.5} sx={{ width: '100%', minWidth: 0 }}>
        <Box sx={{ flexShrink: 0 }}>
          <ListDataGridToolbar
            apiRef={apiRef}
            exportFileName={exportFileName}
            exportAriaLabel={exportAriaLabel}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder={searchPlaceholder}
          />
        </Box>
        <InsightsDataGrid
          apiRef={apiRef}
          columns={columns}
          rows={filteredRows}
          getRowId={getRowId}
        />
      </Stack>
    </Box>
  )
}

/** @deprecated Prefer InsightsDataGrid / InsightsDataGridSection */
export function InsightsDataTable<T>(props: {
  columns: InsightsTableColumn<T>[]
  rows: T[]
  getRowId: (row: T) => string
}) {
  const apiRef = useGridApiRef()
  return <InsightsDataGrid apiRef={apiRef} {...props} />
}

export function InsightsTableLink({ children }: { children: ReactNode }) {
  return (
    <Box component="span" sx={{ color: 'primary.main', fontWeight: 500, cursor: 'pointer' }}>
      {children}
    </Box>
  )
}

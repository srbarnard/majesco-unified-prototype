import Checkbox from '@mui/material/Checkbox'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableSortLabel from '@mui/material/TableSortLabel'
import type { SxProps, Theme } from '@mui/material/styles'
import type { ReactNode } from 'react'
import {
  accentLinkHover,
  accentSubtle,
  surfaceMuted,
} from '@/design-system/theme/themeSurfaces'

export type SortDirection = 'asc' | 'desc'

/** Icon buttons in table action columns — no hover fill. */
export const tableActionIconButtonSx = {
  bgcolor: 'transparent',
  backgroundColor: 'transparent',
  '&:hover': {
    bgcolor: 'transparent',
    backgroundColor: 'transparent',
  },
} as const

/** Copilot icon in data grid action columns — subtle fill when active. */
export function copilotActiveIconSx(active?: boolean) {
  return {
    ...tableActionIconButtonSx,
    ...(active && {
      bgcolor: (theme: Theme) => accentSubtle(theme),
      '&:hover': {
        bgcolor: (theme: Theme) => accentSubtle(theme),
      },
    }),
  }
}

/** Link styling inside tables — cell hover fill is handled by tableInteractionSx / dataGridInteractionSx. */
export const tableLinkSx: SxProps<Theme> = {
  '&:hover': {
    bgcolor: 'transparent',
    backgroundColor: 'transparent',
  },
}

const linkCellHoverSx = {
  bgcolor: (theme: Theme) => `${accentLinkHover(theme)} !important`,
  backgroundColor: (theme: Theme) => `${accentLinkHover(theme)} !important`,
  background: (theme: Theme) => `${accentLinkHover(theme)} !important`,
} as const

const pinnedCellPaperSx = {
  bgcolor: 'background.paper !important',
  backgroundColor: 'background.paper !important',
  background: 'background.paper !important',
} as const

/** MUI Table — no row/icon hovers; linked cells fill light blue on link hover. */
export const tableInteractionSx: SxProps<Theme> = {
  '& .MuiTableRow-root:hover': {
    bgcolor: 'transparent',
    backgroundColor: 'transparent',
  },
  '& .MuiTableRow-root:hover .MuiTableCell-root': {
    bgcolor: 'transparent',
    backgroundColor: 'transparent',
  },
  '& .MuiTableRow-root.Mui-selected:hover': {
    bgcolor: (theme) => accentSubtle(theme),
    backgroundColor: (theme) => accentSubtle(theme),
  },
  '& .MuiIconButton-root:not([aria-pressed="true"])': {
    ...tableActionIconButtonSx,
  },
  '& .MuiTableCell-root:has(.MuiLink-root:hover)': linkCellHoverSx,
}

/** MUI DataGrid — no row/icon hovers; linked cells fill light blue on link hover. */
export const dataGridInteractionSx: SxProps<Theme> = {
  '& .MuiDataGrid-row:hover, & .MuiDataGrid-row.Mui-hovered': {
    bgcolor: 'transparent !important',
    backgroundColor: 'transparent !important',
  },
  '& .MuiDataGrid-row:hover .MuiDataGrid-cell, & .MuiDataGrid-row.Mui-hovered .MuiDataGrid-cell': {
    bgcolor: 'transparent',
    backgroundColor: 'transparent',
  },
  '& .MuiDataGrid-row:hover .MuiDataGrid-cell--pinnedLeft, & .MuiDataGrid-row:hover .MuiDataGrid-cell--pinnedRight, & .MuiDataGrid-row.Mui-hovered .MuiDataGrid-cell--pinnedLeft, & .MuiDataGrid-row.Mui-hovered .MuiDataGrid-cell--pinnedRight':
    pinnedCellPaperSx,
  '& .MuiDataGrid-cell--pinnedLeft:hover, & .MuiDataGrid-cell--pinnedRight:hover': pinnedCellPaperSx,
  '& .MuiDataGrid-cell:has(.MuiLink-root:hover)': linkCellHoverSx,
  '& .MuiDataGrid-cell--pinnedLeft:has(.MuiLink-root:hover), & .MuiDataGrid-cell--pinnedRight:has(.MuiLink-root:hover)':
    linkCellHoverSx,
  '& .MuiDataGrid-cell .MuiIconButton-root:not([aria-pressed="true"])': {
    ...tableActionIconButtonSx,
  },
  '& .MuiDataGrid-cell .MuiLink-root:hover': {
    bgcolor: 'transparent',
    backgroundColor: 'transparent',
  },
}

export type DataTableColumn<T> = {
  id: keyof T | string
  label: string
  align?: 'left' | 'right' | 'center'
  width?: string | number
  sortable?: boolean
  sortValue?: (row: T) => string | number
  render?: (row: T) => ReactNode
}

export type DataTableSort = {
  columnId: string
  direction: SortDirection
}

export type DataTableProps<T extends Record<string, unknown>> = {
  columns: DataTableColumn<T>[]
  rows: T[]
  getRowId: (row: T) => string | number
  emptyMessage?: string
  selectable?: boolean
  selectedIds?: Set<string | number>
  onSelectionChange?: (selectedIds: Set<string | number>) => void
  sort?: DataTableSort
  onSortChange?: (sort: DataTableSort) => void
  /** Flat table — no outer border or radius (e.g. embedded in a page, not a card). */
  borderless?: boolean
}

function compareValues(a: string | number, b: string | number, direction: SortDirection) {
  const result =
    typeof a === 'number' && typeof b === 'number'
      ? a - b
      : String(a).localeCompare(String(b), undefined, { sensitivity: 'base' })

  return direction === 'asc' ? result : -result
}

const checkboxColumnSx = {
  width: 52,
  minWidth: 52,
  maxWidth: 52,
  pl: 2,
  pr: 0,
  boxSizing: 'border-box',
  '& .MuiCheckbox-root': {
    p: 0,
  },
} as const

/** Majesco data table with selection, sorting, and themed styling. */
export function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  getRowId,
  emptyMessage = 'No records found.',
  selectable = false,
  selectedIds = new Set(),
  onSelectionChange,
  sort,
  onSortChange,
  borderless = false,
}: DataTableProps<T>) {
  const rowIds = rows.map((row) => getRowId(row))
  const allSelected = rowIds.length > 0 && rowIds.every((id) => selectedIds.has(id))
  const someSelected = rowIds.some((id) => selectedIds.has(id)) && !allSelected

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return
    const next = new Set(selectedIds)
    if (checked) {
      rowIds.forEach((id) => next.add(id))
    } else {
      rowIds.forEach((id) => next.delete(id))
    }
    onSelectionChange(next)
  }

  const handleSelectRow = (id: string | number, checked: boolean) => {
    if (!onSelectionChange) return
    const next = new Set(selectedIds)
    if (checked) {
      next.add(id)
    } else {
      next.delete(id)
    }
    onSelectionChange(next)
  }

  const handleSort = (column: DataTableColumn<T>) => {
    if (!column.sortable || !onSortChange) return
    const columnId = String(column.id)
    const isActive = sort?.columnId === columnId
    const direction: SortDirection =
      isActive && sort.direction === 'asc' ? 'desc' : 'asc'
    onSortChange({ columnId, direction })
  }

  const colSpan = columns.length + (selectable ? 1 : 0)
  const TableWrapper = borderless ? Box : Paper

  return (
    <TableContainer
      component={TableWrapper}
      elevation={0}
      sx={{
        ...(borderless
          ? { border: 'none', borderRadius: 0, boxShadow: 'none' }
          : { border: 1, borderColor: 'divider', borderRadius: 1 }),
        bgcolor: 'background.paper',
        flex: borderless ? 1 : undefined,
        minHeight: borderless ? 0 : undefined,
        overflow: borderless ? 'auto' : undefined,
        ...tableInteractionSx,
      }}
    >
      <Table size="small" sx={{ tableLayout: borderless ? 'auto' : 'fixed', minWidth: borderless ? 720 : undefined }}>
        <TableHead>
          <TableRow
            sx={{
              bgcolor: (theme) => surfaceMuted(theme),
              '& .MuiTableCell-head': {
                fontWeight: 600,
                color: 'text.secondary',
                fontSize: '0.75rem',
                py: 1.5,
                borderBottom: 1,
                borderColor: 'divider',
              },
            }}
          >
            {selectable && (
              <TableCell
                padding="checkbox"
                sx={{
                  ...checkboxColumnSx,
                  py: 1.5,
                  verticalAlign: 'middle',
                }}
              >
                <Checkbox
                  size="small"
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={(event) => handleSelectAll(event.target.checked)}
                  inputProps={{ 'aria-label': 'Select all rows' }}
                />
              </TableCell>
            )}
            {columns.map((column) => {
              const columnId = String(column.id)
              const isSorted = sort?.columnId === columnId

              return (
                <TableCell
                  key={columnId}
                  align={column.align ?? 'left'}
                  sx={{ width: column.width }}
                  sortDirection={isSorted ? sort.direction : false}
                >
                  {column.sortable && onSortChange ? (
                    <TableSortLabel
                      active={isSorted}
                      direction={isSorted ? sort.direction : 'asc'}
                      onClick={() => handleSort(column)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              )
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={colSpan} align="center">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => {
              const id = getRowId(row)
              const isSelected = selectedIds.has(id)

              return (
                <TableRow
                  key={id}
                  selected={isSelected}
                  sx={{
                    '&:last-child td': { borderBottom: 0 },
                    '&.Mui-selected': {
                      bgcolor: (theme) => accentSubtle(theme),
                    },
                  }}
                >
                  {selectable && (
                    <TableCell
                      padding="checkbox"
                      sx={{
                        ...checkboxColumnSx,
                        py: 1.5,
                        verticalAlign: 'top',
                      }}
                    >
                      <Checkbox
                        size="small"
                        checked={isSelected}
                        onChange={(event) => handleSelectRow(id, event.target.checked)}
                        inputProps={{ 'aria-label': `Select row ${id}` }}
                        sx={{ mt: 0.125 }}
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell
                      key={String(column.id)}
                      align={column.align ?? 'left'}
                      sx={{ verticalAlign: 'top', py: 1.5 }}
                    >
                      {column.render
                        ? column.render(row)
                        : String(row[column.id as keyof T] ?? '')}
                    </TableCell>
                  ))}
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export function sortDataTableRows<T extends Record<string, unknown>>(
  rows: T[],
  columns: DataTableColumn<T>[],
  sort: DataTableSort | undefined,
): T[] {
  if (!sort) return rows

  const column = columns.find((col) => String(col.id) === sort.columnId)
  if (!column) return rows

  return [...rows].sort((rowA, rowB) => {
    const valueA = column.sortValue
      ? column.sortValue(rowA)
      : String(rowA[column.id as keyof T] ?? '')
    const valueB = column.sortValue
      ? column.sortValue(rowB)
      : String(rowB[column.id as keyof T] ?? '')

    return compareValues(valueA, valueB, sort.direction)
  })
}

export function filterDataTableRows<T extends Record<string, unknown>>(
  rows: T[],
  query: string,
  searchKeys: (keyof T)[],
): T[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return rows

  return rows.filter((row) =>
    searchKeys.some((key) => String(row[key] ?? '').toLowerCase().includes(normalized)),
  )
}

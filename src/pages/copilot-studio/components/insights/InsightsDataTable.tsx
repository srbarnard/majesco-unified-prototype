import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import { tableInteractionSx } from '@/design-system/components'
import { analyticsBodySx } from '@/design-system/components/analytics/analyticsStyles'
import { surfaceMuted } from '@/design-system/theme/themeSurfaces'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'

export type InsightsTableColumn<T> = {
  id: string
  label: string
  align?: 'left' | 'right' | 'center'
  render: (row: T) => ReactNode
}

type InsightsDataTableProps<T> = {
  columns: InsightsTableColumn<T>[]
  rows: T[]
  getRowId: (row: T) => string
}

const headCellSx = {
  fontFamily: figmaFontFamilyStack.heading,
  fontWeight: 600,
  fontSize: '0.75rem',
  color: 'text.secondary',
  py: 1.25,
  borderBottom: 1,
  borderColor: 'divider',
  whiteSpace: 'nowrap',
} as const

const bodyCellSx = {
  fontFamily: figmaFontFamilyStack.body,
  fontSize: '0.8125rem',
  py: 1.25,
  borderColor: 'divider',
} as const

export function InsightsDataTable<T>({ columns, rows, getRowId }: InsightsDataTableProps<T>) {
  return (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={tableInteractionSx}>
        <TableHead>
          <TableRow sx={{ bgcolor: (theme) => surfaceMuted(theme) }}>
            {columns.map((column) => (
              <TableCell key={column.id} sx={headCellSx} align={column.align ?? 'left'}>
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={getRowId(row)} hover={false}>
              {columns.map((column) => (
                <TableCell key={column.id} sx={bodyCellSx} align={column.align ?? 'left'}>
                  {typeof column.render(row) === 'string' ? (
                    <Typography variant="body2" sx={{ ...analyticsBodySx }}>
                      {column.render(row) as string}
                    </Typography>
                  ) : (
                    column.render(row)
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export function InsightsTableLink({ children }: { children: ReactNode }) {
  return (
    <Box component="span" sx={{ color: 'primary.main', fontWeight: 500, cursor: 'pointer' }}>
      {children}
    </Box>
  )
}

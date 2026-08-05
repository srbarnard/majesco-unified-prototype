import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { StatusChip, tableInteractionSx } from '@/design-system/components'
import { analyticsBodySx } from '@/design-system/components/analytics/analyticsStyles'
import { surfaceMuted } from '@/design-system/theme/themeSurfaces'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import type { SubmissionsQueuePerformanceRow } from '@/pages/submissions/analytics/submissionsAnalyticsData'

type SubmissionsQueuePerformanceTableProps = {
  rows: SubmissionsQueuePerformanceRow[]
}

function readyRateVariant(value: number) {
  if (value >= 70) return 'success' as const
  if (value >= 55) return 'info' as const
  if (value >= 45) return 'warning' as const
  return 'error' as const
}

function slaVariant(count: number) {
  if (count === 0) return 'success' as const
  if (count <= 2) return 'warning' as const
  return 'error' as const
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

export function SubmissionsQueuePerformanceTable({ rows }: SubmissionsQueuePerformanceTableProps) {
  return (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={tableInteractionSx} aria-label="Submission queue performance">
        <TableHead>
          <TableRow sx={{ bgcolor: (theme) => surfaceMuted(theme) }}>
            <TableCell sx={headCellSx}>Queue / assignee</TableCell>
            <TableCell align="right" sx={headCellSx}>
              Open
            </TableCell>
            <TableCell align="right" sx={headCellSx}>
              Blocked
            </TableCell>
            <TableCell align="right" sx={headCellSx}>
              Ready rate
            </TableCell>
            <TableCell align="right" sx={headCellSx}>
              Avg days to ready
            </TableCell>
            <TableCell align="right" sx={headCellSx}>
              Past SLA
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} hover={false}>
              <TableCell sx={bodyCellSx}>
                <Typography variant="body2" sx={{ ...analyticsBodySx, fontWeight: 500 }}>
                  {row.queue}
                </Typography>
              </TableCell>
              <TableCell align="right" sx={bodyCellSx}>
                {row.open}
              </TableCell>
              <TableCell align="right" sx={bodyCellSx}>
                {row.blocked}
              </TableCell>
              <TableCell sx={{ ...bodyCellSx, textAlign: 'right' }}>
                <Box sx={{ display: 'inline-flex' }}>
                  <StatusChip label={`${row.readyRate}%`} status={readyRateVariant(row.readyRate)} />
                </Box>
              </TableCell>
              <TableCell align="right" sx={bodyCellSx}>
                {row.avgDaysToReady.toFixed(1)}
              </TableCell>
              <TableCell sx={{ ...bodyCellSx, textAlign: 'right' }}>
                <Box sx={{ display: 'inline-flex' }}>
                  <StatusChip
                    label={row.pastSla === 0 ? 'None' : String(row.pastSla)}
                    status={slaVariant(row.pastSla)}
                  />
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

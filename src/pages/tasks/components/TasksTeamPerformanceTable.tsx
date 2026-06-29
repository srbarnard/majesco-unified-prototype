import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
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
import type { TasksTeamPerformanceRow } from '@/pages/tasks/analytics/tasksAnalyticsData'

type TasksTeamPerformanceTableProps = {
  rows: TasksTeamPerformanceRow[]
}

function slaAdherenceVariant(value: number) {
  if (value >= 93) return 'success' as const
  if (value >= 88) return 'info' as const
  if (value >= 84) return 'warning' as const
  return 'error' as const
}

function overdueVariant(count: number) {
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

export function TasksTeamPerformanceTable({ rows }: TasksTeamPerformanceTableProps) {
  return (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={tableInteractionSx}>
        <TableHead>
          <TableRow sx={{ bgcolor: (theme) => surfaceMuted(theme) }}>
            <TableCell sx={headCellSx}>Team member</TableCell>
            <TableCell sx={headCellSx} align="right">
              Open tasks
            </TableCell>
            <TableCell sx={headCellSx} align="right">
              Completion rate
            </TableCell>
            <TableCell sx={headCellSx} align="right">
              Avg SLA adherence
            </TableCell>
            <TableCell sx={headCellSx} align="right">
              High priority overdue
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} hover={false}>
              <TableCell sx={bodyCellSx}>
                <Stack spacing={0.125}>
                  <Typography variant="body2" sx={{ ...analyticsBodySx, fontWeight: 500 }}>
                    {row.member}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={analyticsBodySx}>
                    {row.team}
                  </Typography>
                </Stack>
              </TableCell>
              <TableCell sx={bodyCellSx} align="right">
                {row.openTasks}
              </TableCell>
              <TableCell sx={bodyCellSx} align="right">
                {row.completionRate}%
              </TableCell>
              <TableCell sx={{ ...bodyCellSx, textAlign: 'right' }}>
                <Box sx={{ display: 'inline-flex' }}>
                  <StatusChip label={`${row.slaAdherence}%`} status={slaAdherenceVariant(row.slaAdherence)} />
                </Box>
              </TableCell>
              <TableCell sx={{ ...bodyCellSx, textAlign: 'right' }}>
                <Box sx={{ display: 'inline-flex' }}>
                  <StatusChip
                    label={row.highPriorityOverdue === 0 ? 'None' : String(row.highPriorityOverdue)}
                    status={overdueVariant(row.highPriorityOverdue)}
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
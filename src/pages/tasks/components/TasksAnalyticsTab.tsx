import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid2'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { layoutTokens } from '@/design-system/tokens/layout'
import { TASKS_TOTAL_ROWS, tasksMock } from '@/pages/tasks/data/mockTasks'

function KpiCard({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: 1,
        borderColor: 'divider',
        borderRadius: `${layoutTokens.cardRadius}px`,
        height: '100%',
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: figmaFontFamilyStack.body, display: 'block', mb: 0.5 }}>
        {label}
      </Typography>
      <Typography sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600, fontSize: '1.5rem', lineHeight: 1.2 }}>
        {value}
      </Typography>
      {detail && (
        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: figmaFontFamilyStack.body, mt: 0.75 }}>
          {detail}
        </Typography>
      )}
    </Paper>
  )
}

export function TasksAnalyticsTab() {
  const highPriority = tasksMock.filter((task) => task.priority === 'High').length
  const pastDue = tasksMock.filter((task) => task.isPastDue).length
  const completed = tasksMock.filter((task) => task.status === 'Completed').length

  return (
    <Box sx={{ pb: 2 }}>
      <Typography
        variant="h6"
        sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600, mb: 2 }}
      >
        Task analytics
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="Open tasks" value={String(TASKS_TOTAL_ROWS)} detail="Across your team" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="High priority" value={String(highPriority)} detail="Requires attention" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="Past due" value={String(pastDue)} detail="Overdue items" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="Completed" value={String(completed)} detail="This period" />
        </Grid>
      </Grid>

      <Paper
        elevation={0}
        sx={{
          mt: 2,
          p: 2.5,
          border: 1,
          borderColor: 'divider',
          borderRadius: `${layoutTokens.cardRadius}px`,
        }}
      >
        <Typography sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600, mb: 1.5 }}>
          Workload insights
        </Typography>
        <Stack spacing={1} component="ul" sx={{ m: 0, pl: 2.5 }}>
          <Typography component="li" variant="body2" sx={{ fontFamily: figmaFontFamilyStack.body }}>
            18 high-priority tasks span quotes, policies, and claims references.
          </Typography>
          <Typography component="li" variant="body2" sx={{ fontFamily: figmaFontFamilyStack.body }}>
            3 tasks are past due and need immediate follow-up.
          </Typography>
          <Typography component="li" variant="body2" sx={{ fontFamily: figmaFontFamilyStack.body }}>
            Account managers carry the highest open-task volume this week.
          </Typography>
        </Stack>
      </Paper>
    </Box>
  )
}

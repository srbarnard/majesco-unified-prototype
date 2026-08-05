import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid2'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { AnalyticsCard } from '@/design-system/components/analytics/AnalyticsCard'
import { AnalyticsFilterBar } from '@/design-system/components/analytics/AnalyticsFilterBar'
import { AnalyticsInsightStrip } from '@/design-system/components/analytics/AnalyticsInsightStrip'
import { AnalyticsKpiStrip } from '@/design-system/components/analytics/AnalyticsKpiStrip'
import { AnalyticsMetricHeader } from '@/design-system/components/analytics/AnalyticsMetricHeader'
import { AnalyticsSectionTitle } from '@/design-system/components/analytics/AnalyticsSectionTitle'
import { ANALYTICS_GUTTER } from '@/design-system/components/analytics/analyticsStyles'
import { AnalyticsAreaLineChart } from '@/design-system/components/analytics/charts/AnalyticsAreaLineChart'
import { AnalyticsComboBarLineChart } from '@/design-system/components/analytics/charts/AnalyticsComboBarLineChart'
import { AnalyticsDonutChart } from '@/design-system/components/analytics/charts/AnalyticsDonutChart'
import { AnalyticsFunnelChart } from '@/design-system/components/analytics/charts/AnalyticsFunnelChart'
import {
  submissionsAgingBottlenecks,
  submissionsAnalyticsFilters,
  submissionsAnalyticsInsights,
  submissionsAnalyticsKpis,
  submissionsBlockingIssueMix,
  submissionsIntakeFunnel,
  submissionsIntakeTrend,
  submissionsLobMix,
  submissionsQueuePerformance,
  submissionsReadyRateTrend,
  submissionsStatusBreakdown,
  submissionsVsReady,
} from '@/pages/submissions/analytics/submissionsAnalyticsData'
import { SubmissionsQueuePerformanceTable } from '@/pages/submissions/components/SubmissionsQueuePerformanceTable'
import { TasksAgingBarChart } from '@/pages/tasks/components/TasksAgingBarChart'

export function SubmissionsAnalyticsDashboard() {
  return (
    <Stack spacing={ANALYTICS_GUTTER} sx={{ width: '100%', pb: 1 }}>
      <AnalyticsFilterBar config={submissionsAnalyticsFilters} />
      <AnalyticsInsightStrip insights={submissionsAnalyticsInsights} />
      <AnalyticsKpiStrip metrics={submissionsAnalyticsKpis} />

      <Stack spacing={1.5}>
        <AnalyticsSectionTitle
          title="Intake performance"
          subtitle="Volume, readiness, and conversion from receipt through quote-ready status."
        />
        <Grid container spacing={ANALYTICS_GUTTER}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <AnalyticsCard title="Intake funnel" contentSx={{ pt: 0 }}>
              <AnalyticsFunnelChart stages={submissionsIntakeFunnel} />
            </AnalyticsCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Grid container spacing={ANALYTICS_GUTTER}>
              <Grid size={{ xs: 12, md: 6 }}>
                <AnalyticsCard
                  header={
                    <AnalyticsMetricHeader
                      metric={{
                        id: 'intake-vs-ready',
                        title: 'Intake vs ready rate',
                        value: '38 / 61%',
                        trend: { direction: 'up', label: 'Ready rate 61%' },
                        tone: 'positive',
                      }}
                      compact
                    />
                  }
                  contentSx={{ pt: 0 }}
                >
                  <AnalyticsComboBarLineChart
                    data={submissionsVsReady}
                    barLabel="New intakes"
                    lineLabel="Ready rate"
                    height={200}
                  />
                </AnalyticsCard>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <AnalyticsCard
                  header={
                    <AnalyticsMetricHeader
                      metric={{
                        id: 'intake-volume',
                        title: 'Intake volume',
                        value: String(submissionsIntakeTrend.at(-1)?.value ?? 0),
                        trend: { direction: 'up', label: '36% vs Wk 1' },
                        tone: 'positive',
                      }}
                      compact
                    />
                  }
                  contentSx={{ pt: 0 }}
                >
                  <AnalyticsAreaLineChart
                    data={submissionsIntakeTrend}
                    yAxisLabel="Submissions"
                    height={200}
                  />
                </AnalyticsCard>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <AnalyticsCard title="Status mix" contentSx={{ pt: 0 }}>
                  <AnalyticsDonutChart data={submissionsStatusBreakdown} height={200} />
                </AnalyticsCard>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <AnalyticsCard
                  header={
                    <AnalyticsMetricHeader
                      metric={{
                        id: 'ready-rate-trend',
                        title: 'Ready rate trend',
                        value: `${submissionsReadyRateTrend.at(-1)?.value ?? 0}%`,
                        trend: { direction: 'up', label: '7 pts over 4 weeks' },
                        tone: 'positive',
                      }}
                      compact
                    />
                  }
                  contentSx={{ pt: 0 }}
                >
                  <AnalyticsAreaLineChart
                    data={submissionsReadyRateTrend}
                    yAxisLabel="Ready rate (%)"
                    valueFormatter={(value) => `${value}%`}
                    height={200}
                  />
                </AnalyticsCard>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Stack>

      <Stack spacing={1.5}>
        <AnalyticsSectionTitle
          title="Blocking & bottlenecks"
          subtitle="Where intake stalls — issue types and average age on open blocking work."
        />
        <Grid container spacing={ANALYTICS_GUTTER}>
          <Grid size={{ xs: 12, md: 5 }}>
            <AnalyticsCard title="Open blocking issues" contentSx={{ pt: 0 }}>
              <AnalyticsDonutChart data={submissionsBlockingIssueMix} height={240} />
            </AnalyticsCard>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <AnalyticsCard title="Avg age by bottleneck (days)" contentSx={{ pt: 0 }}>
              <TasksAgingBarChart data={submissionsAgingBottlenecks} />
            </AnalyticsCard>
          </Grid>
        </Grid>
      </Stack>

      <Stack spacing={1.5}>
        <AnalyticsSectionTitle
          title="Mix & distribution"
          subtitle="Line-of-business concentration across the open intake book."
        />
        <Grid container spacing={ANALYTICS_GUTTER}>
          <Grid size={{ xs: 12, md: 6 }}>
            <AnalyticsCard title="Open submissions by LOB" contentSx={{ pt: 0 }}>
              <AnalyticsDonutChart data={submissionsLobMix} height={240} />
            </AnalyticsCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <AnalyticsCard title="What this tells underwriting" contentSx={{ pt: 1 }}>
              <Stack spacing={1.25} sx={{ px: 0.5, pb: 1 }}>
                {[
                  'Commercial Auto remains the largest open book — prioritize loss-run follow-ups there first.',
                  'Package risks drive the low-confidence cluster; tighten SOV intake checks before triage.',
                  'Ready-rate gains came from producer templates; expand those to Property and WC next.',
                ].map((line) => (
                  <Stack key={line} direction="row" spacing={1} alignItems="flex-start">
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        mt: 0.75,
                        flexShrink: 0,
                      }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.45 }}>
                      {line}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </AnalyticsCard>
          </Grid>
        </Grid>
      </Stack>

      <Stack spacing={1.5}>
        <AnalyticsSectionTitle
          title="Queue performance"
          subtitle="Open workload, blocked share, and SLA pressure by assignee queue."
        />
        <AnalyticsCard contentSx={{ pt: 0, px: 0, pb: 0 }}>
          <SubmissionsQueuePerformanceTable rows={submissionsQueuePerformance} />
        </AnalyticsCard>
      </Stack>
    </Stack>
  )
}

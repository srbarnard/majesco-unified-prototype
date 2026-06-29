import Grid from '@mui/material/Grid2'
import Stack from '@mui/material/Stack'
import { AnalyticsCard } from '@/design-system/components/analytics/AnalyticsCard'
import { AnalyticsFilterBar } from '@/design-system/components/analytics/AnalyticsFilterBar'
import { AnalyticsInsightStrip } from '@/design-system/components/analytics/AnalyticsInsightStrip'
import { AnalyticsKpiStrip } from '@/design-system/components/analytics/AnalyticsKpiStrip'
import { AnalyticsMetricHeader } from '@/design-system/components/analytics/AnalyticsMetricHeader'
import { AnalyticsSectionTitle } from '@/design-system/components/analytics/AnalyticsSectionTitle'
import { ANALYTICS_GUTTER } from '@/design-system/components/analytics/analyticsStyles'
import { AnalyticsAreaLineChart } from '@/design-system/components/analytics/charts/AnalyticsAreaLineChart'
import { AnalyticsDonutChart } from '@/design-system/components/analytics/charts/AnalyticsDonutChart'
import {
  tasksAgingBottlenecks,
  tasksAnalyticsFilters,
  tasksAnalyticsInsights,
  tasksAnalyticsKpis,
  tasksSlaTrend,
  tasksStatusBreakdown,
  tasksTeamPerformance,
} from '@/pages/tasks/analytics/tasksAnalyticsData'
import { TasksAgingBarChart } from '@/pages/tasks/components/TasksAgingBarChart'
import { TasksTeamPerformanceTable } from '@/pages/tasks/components/TasksTeamPerformanceTable'

export function TasksAnalyticsDashboard() {
  const slaMetric = tasksAnalyticsKpis.find((kpi) => kpi.id === 'sla-compliance')

  return (
    <Stack spacing={ANALYTICS_GUTTER} sx={{ width: '100%', pb: 1 }}>
      <AnalyticsFilterBar config={tasksAnalyticsFilters} />
      <AnalyticsInsightStrip insights={tasksAnalyticsInsights} />
      <AnalyticsKpiStrip metrics={tasksAnalyticsKpis} />

      <Stack spacing={1.5}>
        <AnalyticsSectionTitle
          title="SLA & workload"
          subtitle="Compliance trend and open-task distribution across status categories."
        />
        <Grid container spacing={ANALYTICS_GUTTER}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <AnalyticsCard
              header={
                slaMetric ? (
                  <AnalyticsMetricHeader
                    metric={{
                      id: 'sla-trend',
                      title: 'SLA trend',
                      value: slaMetric.value,
                      trend: slaMetric.trend,
                      tone: slaMetric.tone,
                    }}
                    compact
                  />
                ) : undefined
              }
              contentSx={{ pt: 0 }}
            >
              <AnalyticsAreaLineChart
                data={tasksSlaTrend}
                yAxisLabel="SLA compliance (%)"
                valueFormatter={(value) => `${value}%`}
                height={240}
              />
            </AnalyticsCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <AnalyticsCard title="Tasks by status" contentSx={{ pt: 0 }}>
              <AnalyticsDonutChart data={tasksStatusBreakdown} height={240} />
            </AnalyticsCard>
          </Grid>
        </Grid>
      </Stack>

      <Stack spacing={1.5}>
        <AnalyticsSectionTitle
          title="Aging & bottlenecks"
          subtitle="Average open age by workflow — claims, submissions, underwriting, compliance, and renewals."
        />
        <AnalyticsCard title="Avg age by workflow (days)" contentSx={{ pt: 0 }}>
          <TasksAgingBarChart data={tasksAgingBottlenecks} />
        </AnalyticsCard>
      </Stack>

      <Stack spacing={1.5}>
        <AnalyticsSectionTitle
          title="Team performance"
          subtitle="Open workload, completion rate, and SLA adherence by assignee queue."
        />
        <AnalyticsCard contentSx={{ pt: 0, px: 0, pb: 0 }}>
          <TasksTeamPerformanceTable rows={tasksTeamPerformance} />
        </AnalyticsCard>
      </Stack>
    </Stack>
  )
}

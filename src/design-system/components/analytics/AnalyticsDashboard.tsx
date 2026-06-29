import Grid from '@mui/material/Grid2'
import Stack from '@mui/material/Stack'
import { AnalyticsCard } from '@/design-system/components/analytics/AnalyticsCard'
import { AnalyticsFilterBar } from '@/design-system/components/analytics/AnalyticsFilterBar'
import { AnalyticsKpiStrip } from '@/design-system/components/analytics/AnalyticsKpiStrip'
import { AnalyticsMetricHeader } from '@/design-system/components/analytics/AnalyticsMetricHeader'
import { AnalyticsSparklineCards } from '@/design-system/components/analytics/AnalyticsSparklineCards'
import { AnalyticsUSMapPlaceholder } from '@/design-system/components/analytics/AnalyticsUSMapPlaceholder'
import { AnalyticsAreaLineChart } from '@/design-system/components/analytics/charts/AnalyticsAreaLineChart'
import { AnalyticsComboBarLineChart } from '@/design-system/components/analytics/charts/AnalyticsComboBarLineChart'
import { AnalyticsDonutChart } from '@/design-system/components/analytics/charts/AnalyticsDonutChart'
import { AnalyticsStackedAreaChart } from '@/design-system/components/analytics/charts/AnalyticsStackedAreaChart'
import { AnalyticsStackedBarChart } from '@/design-system/components/analytics/charts/AnalyticsStackedBarChart'
import { ANALYTICS_GUTTER } from '@/design-system/components/analytics/analyticsStyles'
import type { AnalyticsDashboardConfig } from '@/design-system/components/analytics/types'

type AnalyticsDashboardProps = {
  config: AnalyticsDashboardConfig
}

export function AnalyticsDashboard({ config }: AnalyticsDashboardProps) {
  return (
    <Stack spacing={ANALYTICS_GUTTER} sx={{ width: '100%', pb: 1 }}>
      <AnalyticsKpiStrip metrics={config.kpiMetrics} />

      <Grid container spacing={ANALYTICS_GUTTER}>
        {config.mainCharts.map((chart) => (
          <Grid key={chart.id} size={{ xs: 12, lg: 6 }}>
            <AnalyticsCard
              header={<AnalyticsMetricHeader metric={chart.metric} />}
              contentSx={{ pt: 0 }}
            >
              {chart.type === 'area-line' && (
                <AnalyticsAreaLineChart
                  data={chart.data}
                  yAxisLabel={chart.yAxisLabel}
                  valueFormatter={chart.valueFormatter}
                />
              )}
              {chart.type === 'combo' && <AnalyticsComboBarLineChart data={chart.data} />}
            </AnalyticsCard>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={ANALYTICS_GUTTER}>
        {config.breakdownDonuts.map((donut) => (
          <Grid key={donut.id} size={{ xs: 12, md: 4 }}>
            <AnalyticsCard title={donut.title}>
              <AnalyticsDonutChart data={donut.data} />
            </AnalyticsCard>
          </Grid>
        ))}
      </Grid>

      <AnalyticsCard title={config.geographicSection.title}>
        <Stack spacing={2.5}>
          <AnalyticsFilterBar config={config.geographicSection.filters} />
          <Grid container spacing={ANALYTICS_GUTTER}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <AnalyticsCard title={config.geographicSection.mapCard.title} contentSx={{ pt: 0 }}>
                <AnalyticsUSMapPlaceholder
                  states={config.geographicSection.mapCard.states}
                  ariaLabel={config.geographicSection.mapCard.title}
                />
              </AnalyticsCard>
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <AnalyticsCard title={config.geographicSection.sideChart.title} contentSx={{ pt: 0 }}>
                <AnalyticsStackedBarChart
                  data={config.geographicSection.sideChart.data}
                  series={config.geographicSection.sideChart.series}
                  yAxisFormatter={config.geographicSection.sideChart.yAxisFormatter}
                />
              </AnalyticsCard>
            </Grid>
          </Grid>
        </Stack>
      </AnalyticsCard>

      <AnalyticsCard title={config.performanceSection.stackedArea.title}>
        <AnalyticsStackedAreaChart
          data={config.performanceSection.stackedArea.data}
          series={config.performanceSection.stackedArea.series}
          yAxisFormatter={config.performanceSection.stackedArea.yAxisFormatter}
          height={300}
        />
      </AnalyticsCard>

      <Grid container spacing={ANALYTICS_GUTTER}>
        {config.performanceSection.summaryCards.map((card) => (
          <Grid key={card.id} size={{ xs: 12, md: 4 }}>
            <AnalyticsSparklineCards cards={[card]} />
          </Grid>
        ))}
      </Grid>
    </Stack>
  )
}

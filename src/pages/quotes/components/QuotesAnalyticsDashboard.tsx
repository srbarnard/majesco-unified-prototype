import Grid from '@mui/material/Grid2'
import Stack from '@mui/material/Stack'
import { AnalyticsCard } from '@/design-system/components/analytics/AnalyticsCard'
import { AnalyticsFilterBar } from '@/design-system/components/analytics/AnalyticsFilterBar'
import { AnalyticsInsightStrip } from '@/design-system/components/analytics/AnalyticsInsightStrip'
import { AnalyticsKpiStrip } from '@/design-system/components/analytics/AnalyticsKpiStrip'
import { AnalyticsMetricHeader } from '@/design-system/components/analytics/AnalyticsMetricHeader'
import { AnalyticsSectionTitle } from '@/design-system/components/analytics/AnalyticsSectionTitle'
import { AnalyticsSparklineCards } from '@/design-system/components/analytics/AnalyticsSparklineCards'
import { AnalyticsUSMapPlaceholder } from '@/design-system/components/analytics/AnalyticsUSMapPlaceholder'
import { ANALYTICS_GUTTER } from '@/design-system/components/analytics/analyticsStyles'
import { AnalyticsAreaLineChart } from '@/design-system/components/analytics/charts/AnalyticsAreaLineChart'
import { AnalyticsComboBarLineChart } from '@/design-system/components/analytics/charts/AnalyticsComboBarLineChart'
import { AnalyticsDonutChart } from '@/design-system/components/analytics/charts/AnalyticsDonutChart'
import { AnalyticsFunnelChart } from '@/design-system/components/analytics/charts/AnalyticsFunnelChart'
import { AnalyticsStackedAreaChart } from '@/design-system/components/analytics/charts/AnalyticsStackedAreaChart'
import { AnalyticsStackedBarChart } from '@/design-system/components/analytics/charts/AnalyticsStackedBarChart'
import {
  bindRateByState,
  conversionRateTrend,
  healthSparklines,
  pipelineByStage,
  pipelinePremiumTrend,
  premiumMomentum,
  productLineSeries,
  productMix,
  quoteVelocityTrend,
  quotesAnalyticsFilters,
  quotesAnalyticsInsights,
  quotesAnalyticsKpis,
  quotesByState,
  quotesPipelineFunnel,
  submissionsVsBinds,
  topProducersByPremium,
} from '@/pages/quotes/analytics/quotesAnalyticsData'

export function QuotesAnalyticsDashboard() {
  return (
    <Stack spacing={ANALYTICS_GUTTER} sx={{ width: '100%', pb: 1 }}>
      <AnalyticsFilterBar config={quotesAnalyticsFilters} />
      <AnalyticsInsightStrip insights={quotesAnalyticsInsights} />
      <AnalyticsKpiStrip metrics={quotesAnalyticsKpis} />

      <Stack spacing={1.5}>
        <AnalyticsSectionTitle
          title="Pipeline performance"
          subtitle="Track volume, conversion, and speed from submission through issuance."
        />
        <Grid container spacing={ANALYTICS_GUTTER}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <AnalyticsCard title="Conversion funnel" contentSx={{ pt: 0 }}>
              <AnalyticsFunnelChart stages={quotesPipelineFunnel} />
            </AnalyticsCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Grid container spacing={ANALYTICS_GUTTER}>
              <Grid size={{ xs: 12, md: 6 }}>
                <AnalyticsCard
                  header={
                    <AnalyticsMetricHeader
                      metric={{
                        id: 'submissions-binds',
                        title: 'Submissions vs binds',
                        value: '88 / 34',
                        trend: { direction: 'up', label: 'Bind rate 38%' },
                        tone: 'positive',
                      }}
                      compact
                    />
                  }
                  contentSx={{ pt: 0 }}
                >
                  <AnalyticsComboBarLineChart
                    data={submissionsVsBinds}
                    barLabel="Submissions"
                    lineLabel="Bind rate"
                    height={200}
                  />
                </AnalyticsCard>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <AnalyticsCard
                  header={
                    <AnalyticsMetricHeader
                      metric={{
                        id: 'pipeline-premium',
                        title: 'Pipeline premium',
                        value: '$1.48M',
                        trend: { direction: 'up', label: '18% vs last month' },
                        tone: 'positive',
                      }}
                      compact
                    />
                  }
                  contentSx={{ pt: 0 }}
                >
                  <AnalyticsAreaLineChart
                    data={pipelinePremiumTrend}
                    yAxisLabel="Quoted premium"
                    valueFormatter={(value) => `$${Math.round(value / 1000)}K`}
                    height={200}
                  />
                </AnalyticsCard>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <AnalyticsCard
                  header={
                    <AnalyticsMetricHeader
                      metric={{
                        id: 'conversion-rate',
                        title: 'Conversion rate',
                        value: '38.2%',
                        trend: { direction: 'up', label: '4.1 pts vs last QTD' },
                        tone: 'positive',
                      }}
                      compact
                    />
                  }
                  contentSx={{ pt: 0 }}
                >
                  <AnalyticsAreaLineChart
                    data={conversionRateTrend}
                    yAxisLabel="Bind rate (%)"
                    valueFormatter={(value) => `${value}%`}
                    height={200}
                  />
                </AnalyticsCard>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <AnalyticsCard
                  header={
                    <AnalyticsMetricHeader
                      metric={{
                        id: 'quote-velocity',
                        title: 'Quote velocity',
                        value: '4.2 days',
                        trend: { direction: 'down', label: 'To present' },
                        tone: 'positive',
                      }}
                      compact
                    />
                  }
                  contentSx={{ pt: 0 }}
                >
                  <AnalyticsComboBarLineChart
                    data={quoteVelocityTrend}
                    barLabel="Days to quote"
                    lineLabel="Days to present"
                    lineValueFormatter={(value) => `${value}d`}
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
          title="Mix & distribution"
          subtitle="Where pipeline value is concentrated across stage, product, and producer."
        />
        <Grid container spacing={ANALYTICS_GUTTER}>
          <Grid size={{ xs: 12, md: 4 }}>
            <AnalyticsCard title="Pipeline by stage">
              <AnalyticsDonutChart data={pipelineByStage} />
            </AnalyticsCard>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <AnalyticsCard title="Product mix">
              <AnalyticsDonutChart data={productMix} />
            </AnalyticsCard>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <AnalyticsCard title="Top producers by premium">
              <AnalyticsDonutChart data={topProducersByPremium} />
            </AnalyticsCard>
          </Grid>
        </Grid>
      </Stack>

      <Stack spacing={1.5}>
        <AnalyticsSectionTitle
          title="Geographic performance"
          subtitle="Quote activity and bind rate variation across top states."
        />
        <Grid container spacing={ANALYTICS_GUTTER}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <AnalyticsCard title="Active quotes by state" contentSx={{ pt: 0 }}>
              <AnalyticsUSMapPlaceholder states={quotesByState} ariaLabel="Active quotes by state" />
            </AnalyticsCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <AnalyticsCard title="Bind rate by state & product" contentSx={{ pt: 0 }}>
              <AnalyticsStackedBarChart
                data={bindRateByState}
                series={productLineSeries}
                yAxisFormatter={(value) => `${value}%`}
                height={280}
              />
            </AnalyticsCard>
          </Grid>
        </Grid>
      </Stack>

      <Stack spacing={1.5}>
        <AnalyticsSectionTitle
          title="Momentum & health"
          subtitle="Premium growth and operational signals that need attention."
        />
        <AnalyticsCard title="Quoted premium momentum by product">
          <AnalyticsStackedAreaChart
            data={premiumMomentum}
            series={productLineSeries}
            yAxisFormatter={(value) => `$${(value / 1_000_000).toFixed(1)}M`}
            height={280}
          />
        </AnalyticsCard>
        <Grid container spacing={ANALYTICS_GUTTER}>
          {healthSparklines.map((card) => (
            <Grid key={card.id} size={{ xs: 12, md: 4 }}>
              <AnalyticsSparklineCards cards={[card]} />
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Stack>
  )
}

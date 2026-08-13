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
  bookByType,
  claimsVelocityTrend,
  healthSparklines,
  insuredsAnalyticsFilters,
  insuredsAnalyticsInsights,
  insuredsAnalyticsKpis,
  insuredsByState,
  insuredsPipelineFunnel,
  lossRatioByState,
  lossRatioTrend,
  newVsRenewal,
  premiumInForceTrend,
  premiumLineSeries,
  premiumMix,
  premiumMomentum,
  topInsuredsByPremium,
} from '@/pages/insureds/analytics/insuredsAnalyticsData'

export function InsuredsAnalyticsDashboard() {
  return (
    <Stack spacing={ANALYTICS_GUTTER} sx={{ width: '100%', pb: 1 }}>
      <AnalyticsFilterBar config={insuredsAnalyticsFilters} />
      <AnalyticsInsightStrip insights={insuredsAnalyticsInsights} />
      <AnalyticsKpiStrip metrics={insuredsAnalyticsKpis} />

      <Stack spacing={1.5}>
        <AnalyticsSectionTitle
          title="Book performance"
          subtitle="Track in-force premium, renewal conversion, and claims pressure across the insureds book."
        />
        <Grid container spacing={ANALYTICS_GUTTER}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <AnalyticsCard title="Account funnel" contentSx={{ pt: 0 }}>
              <AnalyticsFunnelChart stages={insuredsPipelineFunnel} />
            </AnalyticsCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Grid container spacing={ANALYTICS_GUTTER}>
              <Grid size={{ xs: 12, md: 6 }}>
                <AnalyticsCard
                  header={
                    <AnalyticsMetricHeader
                      metric={{
                        id: 'new-renewal',
                        title: 'New vs renewal',
                        value: '15 / 78%',
                        trend: { direction: 'up', label: 'Renewal retention 78%' },
                        tone: 'positive',
                      }}
                      compact
                    />
                  }
                  contentSx={{ pt: 0 }}
                >
                  <AnalyticsComboBarLineChart
                    data={newVsRenewal}
                    barLabel="New insureds"
                    lineLabel="Retention"
                    height={200}
                  />
                </AnalyticsCard>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <AnalyticsCard
                  header={
                    <AnalyticsMetricHeader
                      metric={{
                        id: 'premium-in-force',
                        title: 'Premium in-force',
                        value: '$62.4M',
                        trend: { direction: 'up', label: '6% vs last QTD' },
                        tone: 'positive',
                      }}
                      compact
                    />
                  }
                  contentSx={{ pt: 0 }}
                >
                  <AnalyticsAreaLineChart
                    data={premiumInForceTrend}
                    yAxisLabel="In-force premium"
                    valueFormatter={(value) => `$${Math.round(value / 1_000_000)}M`}
                    height={200}
                  />
                </AnalyticsCard>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <AnalyticsCard
                  header={
                    <AnalyticsMetricHeader
                      metric={{
                        id: 'loss-ratio',
                        title: 'Book loss ratio',
                        value: '48.2%',
                        trend: { direction: 'down', label: '2.1 pts vs last QTD' },
                        tone: 'positive',
                      }}
                      compact
                    />
                  }
                  contentSx={{ pt: 0 }}
                >
                  <AnalyticsAreaLineChart
                    data={lossRatioTrend}
                    yAxisLabel="Loss ratio (%)"
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
                        id: 'claims-velocity',
                        title: 'Claims velocity',
                        value: '11 open',
                        trend: { direction: 'up', label: 'New vs closed' },
                        tone: 'negative',
                      }}
                      compact
                    />
                  }
                  contentSx={{ pt: 0 }}
                >
                  <AnalyticsComboBarLineChart
                    data={claimsVelocityTrend}
                    barLabel="New claims"
                    lineLabel="Closed"
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
          subtitle="Where in-force premium is concentrated across type, industry, and account."
        />
        <Grid container spacing={ANALYTICS_GUTTER}>
          <Grid size={{ xs: 12, md: 4 }}>
            <AnalyticsCard title="Book by insured type">
              <AnalyticsDonutChart data={bookByType} />
            </AnalyticsCard>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <AnalyticsCard title="Premium mix">
              <AnalyticsDonutChart data={premiumMix} />
            </AnalyticsCard>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <AnalyticsCard title="Top insureds by premium">
              <AnalyticsDonutChart data={topInsuredsByPremium} />
            </AnalyticsCard>
          </Grid>
        </Grid>
      </Stack>

      <Stack spacing={1.5}>
        <AnalyticsSectionTitle
          title="Geographic performance"
          subtitle="Account concentration and loss-ratio variation across top states."
        />
        <Grid container spacing={ANALYTICS_GUTTER}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <AnalyticsCard title="Insureds by state" contentSx={{ pt: 0 }}>
              <AnalyticsUSMapPlaceholder states={insuredsByState} ariaLabel="Insureds by state" />
            </AnalyticsCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <AnalyticsCard title="Loss ratio by state & industry" contentSx={{ pt: 0 }}>
              <AnalyticsStackedBarChart
                data={lossRatioByState}
                series={premiumLineSeries}
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
        <AnalyticsCard title="In-force premium momentum by industry">
          <AnalyticsStackedAreaChart
            data={premiumMomentum}
            series={premiumLineSeries}
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

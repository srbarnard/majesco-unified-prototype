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
  formatPoliciesPremium,
  newBusinessVsRenewals,
  policiesByState,
  policiesHealthSparklines,
  policiesListAnalyticsFilters,
  policiesListAnalyticsInsights,
  policiesListAnalyticsKpis,
  policiesOverTime,
  policiesPortfolioFunnel,
  policiesProductSeries,
  premiumByProductAndState,
  premiumMomentumByProduct,
  premiumVolumeTrend,
  productMixByVolume,
  renewalRateTrend,
  statusBreakdown,
  topProducersByVolume,
} from '@/pages/policies/analytics/policiesListAnalyticsData'

export function PoliciesListAnalyticsDashboard() {
  return (
    <Stack spacing={ANALYTICS_GUTTER} sx={{ width: '100%', pb: 1 }}>
      <AnalyticsFilterBar config={policiesListAnalyticsFilters} />
      <AnalyticsInsightStrip insights={policiesListAnalyticsInsights} />
      <AnalyticsKpiStrip metrics={policiesListAnalyticsKpis} />

      <Stack spacing={1.5}>
        <AnalyticsSectionTitle
          title="Portfolio performance"
          subtitle="Policy count, premium growth, and retention across the full book of business."
        />
        <Grid container spacing={ANALYTICS_GUTTER}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <AnalyticsCard title="Book lifecycle" contentSx={{ pt: 0 }}>
              <AnalyticsFunnelChart stages={policiesPortfolioFunnel} />
            </AnalyticsCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Grid container spacing={ANALYTICS_GUTTER}>
              <Grid size={{ xs: 12, md: 6 }}>
                <AnalyticsCard
                  header={
                    <AnalyticsMetricHeader
                      metric={{
                        id: 'policies-over-time',
                        title: 'Policies over time',
                        value: String(policiesOverTime.at(-1)?.value ?? 0),
                        trend: { direction: 'up', label: '6% YTD growth' },
                        tone: 'positive',
                      }}
                      compact
                    />
                  }
                  contentSx={{ pt: 0 }}
                >
                  <AnalyticsAreaLineChart data={policiesOverTime} yAxisLabel="Policies" height={200} />
                </AnalyticsCard>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <AnalyticsCard
                  header={
                    <AnalyticsMetricHeader
                      metric={{
                        id: 'premium-volume',
                        title: 'Premium volume',
                        value: formatPoliciesPremium(premiumVolumeTrend.at(-1)?.value ?? 0),
                        trend: { direction: 'up', label: '11% vs last YTD' },
                        tone: 'positive',
                      }}
                      compact
                    />
                  }
                  contentSx={{ pt: 0 }}
                >
                  <AnalyticsAreaLineChart
                    data={premiumVolumeTrend}
                    yAxisLabel="In-force premium"
                    valueFormatter={(value) => formatPoliciesPremium(value)}
                    height={200}
                  />
                </AnalyticsCard>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <AnalyticsCard
                  header={
                    <AnalyticsMetricHeader
                      metric={{
                        id: 'renewal-rate-trend',
                        title: 'Renewal rate',
                        value: `${renewalRateTrend.at(-1)?.value ?? 0}%`,
                        trend: { direction: 'up', label: '1.8 pts vs prior year' },
                        tone: 'positive',
                      }}
                      compact
                    />
                  }
                  contentSx={{ pt: 0 }}
                >
                  <AnalyticsAreaLineChart
                    data={renewalRateTrend}
                    yAxisLabel="Renewal rate (%)"
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
                        id: 'new-vs-renewal',
                        title: 'New business vs renewals',
                        value: '15 / 38',
                        trend: { direction: 'up', label: 'NB share 28%' },
                        tone: 'neutral',
                      }}
                      compact
                    />
                  }
                  contentSx={{ pt: 0 }}
                >
                  <AnalyticsComboBarLineChart
                    data={newBusinessVsRenewals}
                    barLabel="New business"
                    lineLabel="Renewals"
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
          subtitle="Status, product, and producer concentration across the portfolio."
        />
        <Grid container spacing={ANALYTICS_GUTTER}>
          <Grid size={{ xs: 12, md: 4 }}>
            <AnalyticsCard title="Status breakdown">
              <AnalyticsDonutChart data={statusBreakdown} />
            </AnalyticsCard>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <AnalyticsCard title="Product mix by volume">
              <AnalyticsDonutChart data={productMixByVolume} />
            </AnalyticsCard>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <AnalyticsCard title="Top producers by volume">
              <AnalyticsDonutChart data={topProducersByVolume} />
            </AnalyticsCard>
          </Grid>
        </Grid>
      </Stack>

      <Stack spacing={1.5}>
        <AnalyticsSectionTitle
          title="Geographic footprint"
          subtitle="Policy count and premium distribution across top states."
        />
        <Grid container spacing={ANALYTICS_GUTTER}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <AnalyticsCard title="Policies by state" contentSx={{ pt: 0 }}>
              <AnalyticsUSMapPlaceholder states={policiesByState} ariaLabel="Policies by state" />
            </AnalyticsCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <AnalyticsCard title="Premium by product & state ($M)" contentSx={{ pt: 0 }}>
              <AnalyticsStackedBarChart
                data={premiumByProductAndState}
                series={policiesProductSeries}
                yAxisFormatter={(value) => `$${value}M`}
                height={280}
              />
            </AnalyticsCard>
          </Grid>
        </Grid>
      </Stack>

      <Stack spacing={1.5}>
        <AnalyticsSectionTitle
          title="Portfolio health"
          subtitle="Premium momentum and operational signals requiring attention."
        />
        <AnalyticsCard title="Written premium momentum by product ($M)">
          <AnalyticsStackedAreaChart
            data={premiumMomentumByProduct}
            series={policiesProductSeries}
            yAxisFormatter={(value) => `$${value}M`}
            height={280}
          />
        </AnalyticsCard>
        <Grid container spacing={ANALYTICS_GUTTER}>
          {policiesHealthSparklines.map((card) => (
            <Grid key={card.id} size={{ xs: 12, md: 4 }}>
              <AnalyticsSparklineCards cards={[card]} />
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Stack>
  )
}

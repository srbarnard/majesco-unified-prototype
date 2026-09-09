import Grid from '@mui/material/Grid2'
import Stack from '@mui/material/Stack'
import { useMemo } from 'react'
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
import { AnalyticsStackedBarChart } from '@/design-system/components/analytics/charts/AnalyticsStackedBarChart'
import { buildInsuredAnalyticsData } from '@/pages/insureds/analytics/buildInsuredAnalyticsData'
import type { InsuredDetailsRecord } from '@/pages/insureds/data/mockInsuredDetails'

type InsuredAnalyticsDashboardProps = {
  insured: InsuredDetailsRecord
}

export function InsuredAnalyticsDashboard({ insured }: InsuredAnalyticsDashboardProps) {
  const data = useMemo(() => buildInsuredAnalyticsData(insured), [insured])

  return (
    <Stack spacing={ANALYTICS_GUTTER} sx={{ width: '100%', pb: 1 }}>
      <AnalyticsFilterBar config={data.filters} />
      <AnalyticsInsightStrip insights={data.insights} />
      <AnalyticsKpiStrip metrics={data.kpis} />

      <Stack spacing={1.5}>
        <AnalyticsSectionTitle
          title="Account performance"
          subtitle={`Premium, claims pressure, and mid-term activity for ${insured.name}.`}
        />
        <Grid container spacing={ANALYTICS_GUTTER}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <AnalyticsCard title="Account funnel" contentSx={{ pt: 0 }}>
              <AnalyticsFunnelChart stages={data.accountFunnel} />
            </AnalyticsCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Grid container spacing={ANALYTICS_GUTTER}>
              <Grid size={{ xs: 12, md: 6 }}>
                <AnalyticsCard
                  header={
                    <AnalyticsMetricHeader
                      metric={{
                        id: 'premium-trend',
                        title: 'Premium in-force',
                        value: insured.totalPremium,
                        trend: { direction: 'up', label: 'Current term' },
                        tone: 'positive',
                      }}
                      compact
                    />
                  }
                  contentSx={{ pt: 0 }}
                >
                  <AnalyticsAreaLineChart data={data.premiumTrend} yAxisLabel="Premium" height={200} />
                </AnalyticsCard>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <AnalyticsCard
                  header={
                    <AnalyticsMetricHeader
                      metric={{
                        id: 'claims-velocity',
                        title: 'Claims velocity',
                        value: String(insured.openClaims),
                        trend: {
                          direction: insured.openClaims > 0 ? 'up' : 'down',
                          label: 'Open claims',
                        },
                        tone: insured.openClaims > 0 ? 'negative' : 'positive',
                      }}
                      compact
                    />
                  }
                  contentSx={{ pt: 0 }}
                >
                  <AnalyticsComboBarLineChart
                    data={data.claimsVelocity}
                    barLabel="New claims"
                    lineLabel="Loss ratio"
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
                        title: 'Loss ratio trend',
                        value: data.kpis.find((k) => k.id === 'loss-ratio')?.value ?? '—',
                        trend: { direction: 'neutral', label: 'Trailing 12M' },
                        tone: 'neutral',
                      }}
                      compact
                    />
                  }
                  contentSx={{ pt: 0 }}
                >
                  <AnalyticsAreaLineChart
                    data={data.lossRatioTrend}
                    yAxisLabel="Loss ratio (%)"
                    valueFormatter={(value) => `${value}%`}
                    height={200}
                  />
                </AnalyticsCard>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <AnalyticsCard title="Policies by product">
                  <AnalyticsDonutChart data={data.policiesByProduct} />
                </AnalyticsCard>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Stack>

      <Stack spacing={1.5}>
        <AnalyticsSectionTitle
          title="Exposure mix"
          subtitle="Line of business, claim type, and geographic concentration."
        />
        <Grid container spacing={ANALYTICS_GUTTER}>
          <Grid size={{ xs: 12, md: 4 }}>
            <AnalyticsCard title="Premium by line">
              <AnalyticsDonutChart data={data.premiumByLine} />
            </AnalyticsCard>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <AnalyticsCard title="Claims by type">
              <AnalyticsDonutChart data={data.claimsByType} />
            </AnalyticsCard>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <AnalyticsCard title="Exposure by state" contentSx={{ pt: 0 }}>
              <AnalyticsUSMapPlaceholder states={data.exposureByState} ariaLabel="Exposure by state" />
            </AnalyticsCard>
          </Grid>
        </Grid>
      </Stack>

      <Stack spacing={1.5}>
        <AnalyticsSectionTitle
          title="Policy contribution"
          subtitle="How each policy contributes to account premium."
        />
        <AnalyticsCard title="Premium by policy" contentSx={{ pt: 0 }}>
          <AnalyticsStackedBarChart
            data={data.premiumByPolicy.data}
            series={data.premiumByPolicy.series}
            yAxisFormatter={data.premiumByPolicy.yAxisFormatter}
            height={280}
          />
        </AnalyticsCard>
        <Grid container spacing={ANALYTICS_GUTTER}>
          {data.healthSparklines.map((card) => (
            <Grid key={card.id} size={{ xs: 12, md: 4 }}>
              <AnalyticsSparklineCards cards={[card]} />
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Stack>
  )
}

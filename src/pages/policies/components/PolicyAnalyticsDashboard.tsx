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
import { AnalyticsStackedAreaChart } from '@/design-system/components/analytics/charts/AnalyticsStackedAreaChart'
import { AnalyticsStackedBarChart } from '@/design-system/components/analytics/charts/AnalyticsStackedBarChart'
import { buildPolicyAnalyticsData } from '@/pages/policies/analytics/buildPolicyAnalyticsData'
import { formatPolicyCurrency, resolvePolicyContext } from '@/pages/policies/analytics/resolvePolicyContext'

type PolicyAnalyticsDashboardProps = {
  policyId: string
}

export function PolicyAnalyticsDashboard({ policyId }: PolicyAnalyticsDashboardProps) {
  const context = useMemo(() => resolvePolicyContext(policyId), [policyId])
  const data = useMemo(() => buildPolicyAnalyticsData(context), [context])

  return (
    <Stack spacing={ANALYTICS_GUTTER} sx={{ width: '100%', pb: 1 }}>
      <AnalyticsFilterBar config={data.filters} />
      <AnalyticsInsightStrip insights={data.insights} />
      <AnalyticsKpiStrip metrics={data.kpis} />

      <Stack spacing={1.5}>
        <AnalyticsSectionTitle
          title="Policy activity"
          subtitle={`Transaction volume and premium impact for ${context.policyNumber}.`}
        />
        <Grid container spacing={ANALYTICS_GUTTER}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <AnalyticsCard title="Term lifecycle" contentSx={{ pt: 0 }}>
              <AnalyticsFunnelChart stages={data.lifecycleFunnel} />
            </AnalyticsCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Grid container spacing={ANALYTICS_GUTTER}>
              <Grid size={{ xs: 12, md: 6 }}>
                <AnalyticsCard
                  header={
                    <AnalyticsMetricHeader
                      metric={{
                        id: 'transactions',
                        title: 'Transactions over time',
                        value: String(data.transactionsTrend.at(-1)?.value ?? 0),
                        trend: { direction: 'up', label: 'Current term' },
                        tone: 'positive',
                      }}
                      compact
                    />
                  }
                  contentSx={{ pt: 0 }}
                >
                  <AnalyticsAreaLineChart
                    data={data.transactionsTrend}
                    yAxisLabel="Transactions"
                    height={200}
                  />
                </AnalyticsCard>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <AnalyticsCard
                  header={
                    <AnalyticsMetricHeader
                      metric={{
                        id: 'premium-impact',
                        title: 'Premium impact',
                        value: context.premiumChange,
                        trend: {
                          direction: context.premiumChangeDirection,
                          label: 'Net endorsement change',
                        },
                        tone: context.premiumChangeDirection === 'up' ? 'negative' : 'positive',
                      }}
                      compact
                    />
                  }
                  contentSx={{ pt: 0 }}
                >
                  <AnalyticsComboBarLineChart
                    data={data.premiumImpactTrend}
                    barLabel="Endorsement change"
                    lineLabel="Renewal delta"
                    lineValueFormatter={(value) => formatPolicyCurrency(value)}
                    height={200}
                  />
                </AnalyticsCard>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <AnalyticsCard
                  header={
                    <AnalyticsMetricHeader
                      metric={{
                        id: 'endorsements',
                        title: 'Endorsement activity',
                        value: String(data.lifecycleFunnel.find((s) => s.id === 'endorsements')?.value ?? 0),
                        trend: { direction: 'up', label: 'Last 90 days' },
                        tone: 'neutral',
                      }}
                      compact
                    />
                  }
                  contentSx={{ pt: 0 }}
                >
                  <AnalyticsAreaLineChart data={data.endorsementActivity} yAxisLabel="Endorsements" height={200} />
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
                        trend: { direction: 'down', label: 'Improving' },
                        tone: 'positive',
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
            </Grid>
          </Grid>
        </Grid>
      </Stack>

      <Stack spacing={1.5}>
        <AnalyticsSectionTitle
          title="Exposure breakdown"
          subtitle={`${context.productLine} mix for ${context.companyName}.`}
        />
        <Grid container spacing={ANALYTICS_GUTTER}>
          <Grid size={{ xs: 12, md: 4 }}>
            <AnalyticsCard title={context.productLine.includes('Auto') ? 'Fleet by unit type' : 'Exposure by type'}>
              <AnalyticsDonutChart data={data.fleetByType} />
            </AnalyticsCard>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <AnalyticsCard title="Garaging / location">
              <AnalyticsDonutChart data={data.fleetByGaraging} />
            </AnalyticsCard>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <AnalyticsCard title="Transactions by type">
              <AnalyticsDonutChart data={data.transactionsByType} />
            </AnalyticsCard>
          </Grid>
        </Grid>
      </Stack>

      <Stack spacing={1.5}>
        <AnalyticsSectionTitle
          title="Geographic exposure"
          subtitle={`Risk concentration across ${context.riskState} and adjacent states.`}
        />
        <Grid container spacing={ANALYTICS_GUTTER}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <AnalyticsCard title="Units by state" contentSx={{ pt: 0 }}>
              <AnalyticsUSMapPlaceholder states={data.garagingByState} ariaLabel="Units by state" />
            </AnalyticsCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <AnalyticsCard title="Premium by coverage" contentSx={{ pt: 0 }}>
              <AnalyticsStackedBarChart
                data={data.premiumByCoverage.data}
                series={data.premiumByCoverage.series}
                yAxisFormatter={data.premiumByCoverage.yAxisFormatter}
                height={280}
              />
            </AnalyticsCard>
          </Grid>
        </Grid>
      </Stack>

      <Stack spacing={1.5}>
        <AnalyticsSectionTitle
          title="Term health"
          subtitle="Premium distribution and operational signals for this policy."
        />
        <AnalyticsCard title="Written premium by coverage">
          <AnalyticsStackedAreaChart
            data={data.premiumOverTerm.data}
            series={data.premiumOverTerm.series}
            yAxisFormatter={data.premiumOverTerm.yAxisFormatter}
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

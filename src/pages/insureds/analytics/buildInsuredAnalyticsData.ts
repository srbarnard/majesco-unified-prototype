import { figmaPalette } from '@/design-system/tokens/figma-palette'
import type { AnalyticsInsight } from '@/design-system/components/analytics/AnalyticsInsightStrip'
import type { AnalyticsFunnelStage } from '@/design-system/components/analytics/charts/AnalyticsFunnelChart'
import type {
  AnalyticsComboPoint,
  AnalyticsDonutSegment,
  AnalyticsKpiMetric,
  AnalyticsStackedPoint,
  AnalyticsStackedSeries,
  AnalyticsStateValue,
  AnalyticsTimeSeriesPoint,
} from '@/design-system/components/analytics/analyticsStyles'
import type { AnalyticsFilterBarConfig, AnalyticsSparklineCard } from '@/design-system/components/analytics/types'
import type { InsuredDetailsRecord } from '@/pages/insureds/data/mockInsuredDetails'
import {
  getInsuredClaims,
  getInsuredPolicies,
} from '@/pages/insureds/data/mockInsuredOverview'

const STATE_NAMES: Record<string, string> = {
  CA: 'California',
  TX: 'Texas',
  FL: 'Florida',
  NY: 'New York',
  WA: 'Washington',
  AZ: 'Arizona',
  NV: 'Nevada',
  IL: 'Illinois',
  PA: 'Pennsylvania',
}

export type InsuredAnalyticsData = {
  filters: AnalyticsFilterBarConfig
  insights: AnalyticsInsight[]
  kpis: AnalyticsKpiMetric[]
  accountFunnel: AnalyticsFunnelStage[]
  premiumTrend: AnalyticsTimeSeriesPoint[]
  claimsVelocity: AnalyticsComboPoint[]
  lossRatioTrend: AnalyticsTimeSeriesPoint[]
  policiesByProduct: AnalyticsDonutSegment[]
  premiumByLine: AnalyticsDonutSegment[]
  claimsByType: AnalyticsDonutSegment[]
  exposureByState: AnalyticsStateValue[]
  premiumByPolicy: {
    data: AnalyticsStackedPoint[]
    series: AnalyticsStackedSeries[]
    yAxisFormatter?: (value: number) => string
  }
  healthSparklines: AnalyticsSparklineCard[]
}

function parsePremium(value: string) {
  const normalized = value.replace(/[$,]/g, '').toUpperCase()
  if (normalized.endsWith('M')) return Math.round(Number.parseFloat(normalized) * 1_000_000)
  if (normalized.endsWith('K')) return Math.round(Number.parseFloat(normalized) * 1_000)
  return Number.parseInt(normalized, 10) || 850_000
}

function formatCompact(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`
  return `$${value}`
}

export function buildInsuredAnalyticsData(insured: InsuredDetailsRecord): InsuredAnalyticsData {
  const policies = getInsuredPolicies(insured)
  const claims = getInsuredClaims(insured)
  const totalPremium = parsePremium(insured.totalPremium)
  const openClaims = claims.filter((c) => c.status === 'Open').length || insured.openClaims

  const productCounts = policies.reduce<Record<string, number>>((acc, policy) => {
    acc[policy.product] = (acc[policy.product] ?? 0) + 1
    return acc
  }, {})

  const policiesByProduct: AnalyticsDonutSegment[] = Object.entries(productCounts).map(
    ([label, value], index) => ({
      name: label,
      value,
      color: [figmaPalette.teal[500], figmaPalette.purple[700], figmaPalette.green[700], figmaPalette.blue[500]][
        index % 4
      ],
    }),
  )

  const premiumByLine: AnalyticsDonutSegment[] = policies.map((policy, index) => ({
    name: policy.product,
    value: Math.max(1, Math.round(parsePremium(policy.premium) / 1000)),
    color: [figmaPalette.teal[500], figmaPalette.purple[700], figmaPalette.green[700], figmaPalette.blue[500]][
      index % 4
    ],
  }))

  const claimsByType: AnalyticsDonutSegment[] =
    claims.length > 0
      ? Object.entries(
          claims.reduce<Record<string, number>>((acc, claim) => {
            acc[claim.lossType] = (acc[claim.lossType] ?? 0) + 1
            return acc
          }, {}),
        ).map(([label, value], index) => ({
          name: label,
          value,
          color: [figmaPalette.amber[700], figmaPalette.red[500], figmaPalette.purple[400]][index % 3],
        }))
      : [
          {
            name: 'No open claims',
            value: 1,
            color: figmaPalette.green[600],
          },
        ]

  const state = insured.primaryState
  const stateAbbr =
    state.length === 2
      ? state
      : state === 'California'
        ? 'CA'
        : state === 'Texas'
          ? 'TX'
          : state === 'Florida'
            ? 'FL'
            : state === 'New York'
              ? 'NY'
              : state === 'Washington'
                ? 'WA'
                : state === 'Illinois'
                  ? 'IL'
                  : state === 'Ohio'
                    ? 'OH'
                    : state === 'Minnesota'
                      ? 'MN'
                      : 'CA'

  return {
    filters: {
      periodChips: ['Current term', 'YTD', 'Last 12M', 'Prior term'],
      activePeriod: 'Current term',
      dateRangeLabel: 'Jan 1 – Jun 26, 2026',
      filters: [
        {
          id: 'line',
          label: 'Line of business',
          value: 'All lines',
          options: ['All lines', ...policies.map((p) => p.product)],
        },
        {
          id: 'claims',
          label: 'Claims',
          value: 'All claims',
          options: ['All claims', 'Open only', 'Closed'],
        },
        {
          id: 'producer',
          label: 'Producer',
          value: insured.producer,
          options: [insured.producer, 'All producers'],
        },
      ],
    },
    insights: [
      {
        id: 'policies',
        label: `${policies.length} in-force policies · ${formatCompact(totalPremium)} TWP`,
        detail: `${insured.producer} · ${insured.accountManager} managing the account.`,
        tone: openClaims > 0 ? 'warning' : 'success',
      },
      {
        id: 'claims',
        label:
          openClaims > 0
            ? `${openClaims} open claim${openClaims === 1 ? '' : 's'} on the account`
            : 'No open claims on the account',
        detail:
          openClaims > 0
            ? 'Review reserves and loss control before renewal outreach.'
            : 'Clean claims run supports a favorable renewal posture.',
        tone: openClaims > 0 ? 'warning' : 'info',
      },
      {
        id: 'risk',
        label: insured.riskProfile,
        detail: `${insured.naics} · Primary state ${insured.primaryState}.`,
        tone: 'info',
      },
    ],
    kpis: [
      {
        id: 'premium',
        title: 'Premium in-force',
        value: insured.totalPremium,
        trend: { direction: 'up', label: 'vs prior term' },
        tone: 'positive',
      },
      {
        id: 'policies',
        title: 'Active policies',
        value: String(policies.length),
        trend: { direction: 'neutral', label: 'Current term' },
        tone: 'neutral',
      },
      {
        id: 'claims',
        title: 'Open claims',
        value: String(openClaims),
        trend: { direction: openClaims > 0 ? 'up' : 'down', label: 'Account-wide' },
        tone: openClaims > 0 ? 'negative' : 'positive',
      },
      {
        id: 'loss-ratio',
        title: 'Account loss ratio',
        value: openClaims > 0 ? '68%' : '42%',
        trend: { direction: openClaims > 0 ? 'up' : 'down', label: 'Trailing 12M' },
        tone: openClaims > 0 ? 'negative' : 'positive',
      },
    ],
    accountFunnel: [
      { id: 'policies', label: 'Policies', value: policies.length },
      { id: 'endorsements', label: 'Endorsements (90D)', value: Math.max(2, policies.length * 2) },
      { id: 'claims', label: 'Open claims', value: Math.max(openClaims, 0) },
      { id: 'quotes', label: 'Open quotes', value: insured.id === 'atlantic-ridge-construction-llc' ? 2 : 1 },
    ],
    premiumTrend: [
      { label: 'Jan', value: Math.round(totalPremium * 0.78) },
      { label: 'Feb', value: Math.round(totalPremium * 0.82) },
      { label: 'Mar', value: Math.round(totalPremium * 0.88) },
      { label: 'Apr', value: Math.round(totalPremium * 0.93) },
      { label: 'May', value: Math.round(totalPremium * 0.97) },
      { label: 'Jun', value: totalPremium },
    ],
    claimsVelocity: [
      { label: 'Jan', created: openClaims > 0 ? 1 : 0, completionRate: 38 },
      { label: 'Feb', created: 0, completionRate: 40 },
      { label: 'Mar', created: openClaims > 1 ? 1 : 0, completionRate: 44 },
      { label: 'Apr', created: openClaims > 0 ? 1 : 0, completionRate: 52 },
      { label: 'May', created: 0, completionRate: openClaims > 0 ? 61 : 48 },
      { label: 'Jun', created: openClaims > 0 ? 1 : 0, completionRate: openClaims > 0 ? 68 : 42 },
    ],
    lossRatioTrend: [
      { label: 'Jan', value: 41 },
      { label: 'Feb', value: 43 },
      { label: 'Mar', value: 47 },
      { label: 'Apr', value: openClaims > 0 ? 58 : 44 },
      { label: 'May', value: openClaims > 0 ? 64 : 43 },
      { label: 'Jun', value: openClaims > 0 ? 68 : 42 },
    ],
    policiesByProduct:
      policiesByProduct.length > 0
        ? policiesByProduct
        : [{ name: 'No policies', value: 1, color: figmaPalette.grey[400] }],
    premiumByLine:
      premiumByLine.length > 0
        ? premiumByLine
        : [{ name: 'Premium', value: 1, color: figmaPalette.teal[500] }],
    claimsByType,
    exposureByState: [
      {
        code: stateAbbr,
        name: STATE_NAMES[stateAbbr] ?? stateAbbr,
        value: Math.max(8, policies.length * 4),
      },
      ...(stateAbbr === 'CA'
        ? [
            { code: 'AZ', name: 'Arizona', value: 2 },
            { code: 'NV', name: 'Nevada', value: 1 },
          ]
        : [
            { code: 'CA', name: 'California', value: 1 },
            { code: 'TX', name: 'Texas', value: 1 },
          ]),
    ],
    premiumByPolicy: {
      data: policies.map((policy) => ({
        label: policy.policyNumber.slice(-8),
        liability: Math.round(parsePremium(policy.premium) * 0.45),
        physical: Math.round(parsePremium(policy.premium) * 0.3),
        other: Math.round(parsePremium(policy.premium) * 0.25),
      })),
      series: [
        { key: 'liability', label: 'Liability', color: figmaPalette.teal[500] },
        { key: 'physical', label: 'Physical / property', color: figmaPalette.purple[700] },
        { key: 'other', label: 'Other', color: figmaPalette.green[700] },
      ],
      yAxisFormatter: (value: number) => formatCompact(value),
    },
    healthSparklines: [
      {
        id: 'endorsements',
        title: 'Endorsements (90D)',
        value: String(Math.max(2, policies.length * 2)),
        trend: { direction: 'up', label: 'Mid-term activity' },
        tone: 'neutral',
        sparkline: [
          { label: 'W1', value: 1 },
          { label: 'W2', value: 2 },
          { label: 'W3', value: 1 },
          { label: 'W4', value: Math.max(2, policies.length * 2) },
        ],
      },
      {
        id: 'documents',
        title: 'Documents received',
        value: '24',
        trend: { direction: 'up', label: 'Account-wide' },
        tone: 'positive',
        sparkline: [
          { label: 'W1', value: 8 },
          { label: 'W2', value: 12 },
          { label: 'W3', value: 19 },
          { label: 'W4', value: 24 },
        ],
      },
      {
        id: 'retention',
        title: 'Projected retention',
        value: openClaims > 1 ? '72%' : '88%',
        trend: { direction: openClaims > 1 ? 'down' : 'up', label: 'Renewal outlook' },
        tone: openClaims > 1 ? 'negative' : 'positive',
        sparkline: [
          { label: 'W1', value: 90 },
          { label: 'W2', value: 86 },
          { label: 'W3', value: openClaims > 1 ? 78 : 87 },
          { label: 'W4', value: openClaims > 1 ? 72 : 88 },
        ],
      },
    ],
  }
}

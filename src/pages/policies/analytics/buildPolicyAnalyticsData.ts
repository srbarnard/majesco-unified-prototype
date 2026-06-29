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
import {
  formatPolicyCurrency,
  formatPolicyDateRange,
  type PolicyContext,
} from '@/pages/policies/analytics/resolvePolicyContext'
import { overviewTransactionsOverTimeMock } from '@/pages/policies/data/mockOverview'

export type PolicyAnalyticsData = {
  filters: AnalyticsFilterBarConfig
  insights: AnalyticsInsight[]
  kpis: AnalyticsKpiMetric[]
  lifecycleFunnel: AnalyticsFunnelStage[]
  transactionsTrend: AnalyticsTimeSeriesPoint[]
  premiumImpactTrend: AnalyticsComboPoint[]
  endorsementActivity: AnalyticsTimeSeriesPoint[]
  lossRatioTrend: AnalyticsTimeSeriesPoint[]
  fleetByType: AnalyticsDonutSegment[]
  fleetByGaraging: AnalyticsDonutSegment[]
  transactionsByType: AnalyticsDonutSegment[]
  garagingByState: AnalyticsStateValue[]
  premiumByCoverage: AnalyticsStackedChartSlice
  premiumOverTerm: AnalyticsStackedChartSlice
  healthSparklines: AnalyticsSparklineCard[]
}

type AnalyticsStackedChartSlice = {
  data: AnalyticsStackedPoint[]
  series: AnalyticsStackedSeries[]
  yAxisFormatter?: (value: number) => string
}

const coverageSeries: AnalyticsStackedSeries[] = [
  { key: 'liability', label: 'Liability', color: figmaPalette.teal[500] },
  { key: 'physicalDamage', label: 'Physical damage', color: figmaPalette.purple[700] },
  { key: 'medical', label: 'Medical payments', color: figmaPalette.green[700] },
  { key: 'uninsured', label: 'Uninsured motorist', color: figmaPalette.purple[400] },
  { key: 'other', label: 'Other', color: figmaPalette.blue[500] },
]

function scaleSeries(base: number, factor: number) {
  return Math.round(base * factor)
}

function buildPrimaryPolicyData(context: PolicyContext): PolicyAnalyticsData {
  const twpLabel = formatPolicyCurrency(context.twp)
  const ftpLabel = formatPolicyCurrency(context.ftp)
  const premiumTrendDirection = context.premiumChangeDirection === 'up' ? 'up' : 'down'
  const premiumTrendTone = context.premiumChangeDirection === 'up' ? 'negative' : 'positive'

  return {
    filters: {
      periodChips: ['Current term', 'YTD', 'Last 12M', 'Prior term'],
      activePeriod: 'Current term',
      dateRangeLabel: formatPolicyDateRange(context),
      filters: [
        {
          id: 'coverage',
          label: 'Coverage',
          value: 'All coverages',
          options: ['All coverages', 'Liability', 'Physical damage', 'Medical payments', 'UM/UIM'],
        },
        {
          id: 'transaction',
          label: 'Transaction',
          value: 'All activity',
          options: ['All activity', 'Endorsements', 'Billing', 'Claims', 'Renewals'],
        },
        {
          id: 'unit',
          label: 'Unit type',
          value: 'All units',
          options: ['All units', 'Heavy trucks', 'Light trucks', 'Trailers', 'Specialty'],
        },
      ],
    },
    insights: [
      {
        id: 'cancellation',
        label: 'Pending cancellation on billing hold',
        detail: 'Non-payment notice issued Apr 2 — reinstatement required before renewal.',
        tone: 'warning',
      },
      {
        id: 'claim',
        label: '1 open auto collision claim',
        detail: 'Claim opened Apr 2 with no reserve change in the last 14 days.',
        tone: 'info',
      },
      {
        id: 'renewal',
        label: 'Renewal quote issued May 13',
        detail: `Quoted ${context.premiumChange} vs current term — review before ${formatPolicyDateRange(context).split('–')[1]?.trim()}.`,
        tone: 'success',
      },
    ],
    kpis: [
      {
        id: 'written-premium',
        title: 'Written premium (TWP)',
        value: twpLabel,
        trend: { direction: premiumTrendDirection, label: `${context.premiumChange} vs prior term` },
        tone: premiumTrendTone,
      },
      {
        id: 'full-term-premium',
        title: 'Full term premium',
        value: ftpLabel,
        trend: { direction: 'neutral', label: 'Current term' },
        tone: 'neutral',
      },
      {
        id: 'fleet-units',
        title: 'Scheduled units',
        value: '48',
        trend: { direction: 'up', label: '+1 this term' },
        tone: 'positive',
      },
      {
        id: 'loss-ratio',
        title: 'Loss ratio',
        value: '42.6%',
        trend: { direction: 'down', label: '3.2 pts vs prior term' },
        tone: 'positive',
      },
    ],
    lifecycleFunnel: [
      { id: 'renewal', label: 'Renewal quote', value: 1, conversionLabel: 'Pending' },
      { id: 'endorsements', label: 'Endorsements', value: 4, conversionLabel: '90 days' },
      { id: 'billing', label: 'Billing events', value: 3, conversionLabel: 'Current term' },
      { id: 'claims', label: 'Claims', value: 1, conversionLabel: 'Open' },
      { id: 'documents', label: 'Documents', value: 100, conversionLabel: 'On file' },
    ],
    transactionsTrend: overviewTransactionsOverTimeMock.map((point) => ({
      label: point.label || point.date?.slice(0, 6) || '',
      value: point.value,
    })),
    premiumImpactTrend: [
      { label: 'Jan', created: 0, completionRate: 0 },
      { label: 'Feb', created: 1200, completionRate: 1200 },
      { label: 'Mar', created: 0, completionRate: 0 },
      { label: 'Apr', created: 2400, completionRate: 0 },
      { label: 'May', created: 1200, completionRate: 1200 },
      { label: 'Jun', created: 0, completionRate: 0 },
    ],
    endorsementActivity: [
      { label: 'Jan', value: 0 },
      { label: 'Feb', value: 1 },
      { label: 'Mar', value: 2 },
      { label: 'Apr', value: 4 },
      { label: 'May', value: 3 },
      { label: 'Jun', value: 4 },
    ],
    lossRatioTrend: [
      { label: 'Jan', value: 48 },
      { label: 'Feb', value: 46 },
      { label: 'Mar', value: 45 },
      { label: 'Apr', value: 44 },
      { label: 'May', value: 43 },
      { label: 'Jun', value: 42.6 },
    ],
    fleetByType: [
      { name: 'Heavy trucks', value: 18 },
      { name: 'Light trucks', value: 14 },
      { name: 'Trailers', value: 9 },
      { name: 'Specialty units', value: 7 },
    ],
    fleetByGaraging: [
      { name: 'San Diego, CA', value: 32 },
      { name: 'El Cajon, CA', value: 10 },
      { name: 'Chula Vista, CA', value: 6 },
    ],
    transactionsByType: [
      { name: 'Endorsements', value: 4 },
      { name: 'Billing', value: 3 },
      { name: 'Claims', value: 1 },
      { name: 'Renewals', value: 1 },
    ],
    garagingByState: [
      { code: 'CA', name: 'California', value: 48 },
      { code: 'AZ', name: 'Arizona', value: 4 },
      { code: 'NV', name: 'Nevada', value: 2 },
    ],
    premiumByCoverage: {
      data: [
        { label: 'Jan', liability: 42000, physicalDamage: 28000, medical: 8000, uninsured: 6000, other: 4000 },
        { label: 'Apr', liability: 44000, physicalDamage: 32000, medical: 8200, uninsured: 6200, other: 4200 },
        { label: 'Jun', liability: 46000, physicalDamage: 35000, medical: 8400, uninsured: 6400, other: 4400 },
      ],
      series: coverageSeries,
      yAxisFormatter: (value) => `$${Math.round(value / 1000)}K`,
    },
    premiumOverTerm: {
      data: [
        {
          label: 'Term start',
          liability: scaleSeries(context.twp * 0.42, 1),
          physicalDamage: scaleSeries(context.twp * 0.28, 1),
          medical: scaleSeries(context.twp * 0.12, 1),
          uninsured: scaleSeries(context.twp * 0.1, 1),
          other: scaleSeries(context.twp * 0.08, 1),
        },
        {
          label: 'Mid term',
          liability: scaleSeries(context.twp * 0.44, 1),
          physicalDamage: scaleSeries(context.twp * 0.3, 1),
          medical: scaleSeries(context.twp * 0.11, 1),
          uninsured: scaleSeries(context.twp * 0.09, 1),
          other: scaleSeries(context.twp * 0.06, 1),
        },
        {
          label: 'Current',
          liability: scaleSeries(context.twp * 0.45, 1),
          physicalDamage: scaleSeries(context.twp * 0.31, 1),
          medical: scaleSeries(context.twp * 0.11, 1),
          uninsured: scaleSeries(context.twp * 0.08, 1),
          other: scaleSeries(context.twp * 0.05, 1),
        },
      ],
      series: coverageSeries,
      yAxisFormatter: (value) => formatPolicyCurrency(value),
    },
    healthSparklines: [
      {
        id: 'billing',
        title: 'Billing balance',
        value: context.termPremiumLabel,
        trend: { direction: 'up', label: 'Past due' },
        tone: 'negative',
        sparkline: [
          { label: 'W1', value: 0 },
          { label: 'W2', value: 4200 },
          { label: 'W3', value: 8400 },
          { label: 'W4', value: 12450 },
        ],
      },
      {
        id: 'claims',
        title: 'Open claims',
        value: '1',
        trend: { direction: 'neutral', label: 'No change 14d' },
        tone: 'neutral',
        sparkline: [
          { label: 'W1', value: 0 },
          { label: 'W2', value: 0 },
          { label: 'W3', value: 1 },
          { label: 'W4', value: 1 },
        ],
      },
      {
        id: 'renewal',
        title: 'Days to expiration',
        value: '172',
        trend: { direction: 'down', label: 'Renewal quoted' },
        tone: 'positive',
        sparkline: [
          { label: 'W1', value: 190 },
          { label: 'W2', value: 186 },
          { label: 'W3', value: 179 },
          { label: 'W4', value: 172 },
        ],
      },
    ],
  }
}

function buildGenericPolicyData(context: PolicyContext): PolicyAnalyticsData {
  const seed = context.policyNumber.length
  const unitCount = 12 + (seed % 40)
  const endorsements = 1 + (seed % 5)
  const claims = seed % 3
  const lossRatio = 35 + (seed % 20)
  const twpLabel = formatPolicyCurrency(context.twp)
  const ftpLabel = formatPolicyCurrency(context.ftp)
  const premiumTrendDirection = context.premiumChangeDirection
  const premiumTrendTone = context.premiumChangeDirection === 'up' ? 'negative' : 'positive'

  const stateCode = context.riskState === 'Texas' ? 'TX' : context.riskState === 'Florida' ? 'FL' : context.riskState === 'New York' ? 'NY' : 'CA'

  return {
    filters: {
      periodChips: ['Current term', 'YTD', 'Last 12M', 'Prior term'],
      activePeriod: 'Current term',
      dateRangeLabel: formatPolicyDateRange(context),
      filters: [
        {
          id: 'coverage',
          label: 'Coverage',
          value: 'All coverages',
          options: ['All coverages', 'Primary', 'Excess', 'Property', 'Casualty'],
        },
        {
          id: 'transaction',
          label: 'Transaction',
          value: 'All activity',
          options: ['All activity', 'Endorsements', 'Billing', 'Claims', 'Renewals'],
        },
        {
          id: 'agency',
          label: 'Agency',
          value: context.agency,
          options: [context.agency, 'All agencies'],
        },
      ],
    },
    insights: [
      {
        id: 'renewal-window',
        label: `Renewal window opens in ${90 + (seed % 60)} days`,
        detail: `${context.companyName} — ${context.productLine} term ends ${formatPolicyDateRange(context).split('–')[1]?.trim()}.`,
        tone: 'info',
      },
      {
        id: 'endorsements',
        label: `${endorsements} endorsement${endorsements === 1 ? '' : 's'} this term`,
        detail: `Underwriter ${context.underwriter} · Agency ${context.agency}.`,
        tone: 'neutral',
      },
      {
        id: 'premium',
        label: `Written premium ${twpLabel}`,
        detail: `Full term premium ${ftpLabel} for ${context.productLine}.`,
        tone: claims > 0 ? 'warning' : 'success',
      },
    ],
    kpis: [
      {
        id: 'written-premium',
        title: 'Written premium (TWP)',
        value: twpLabel,
        trend: { direction: premiumTrendDirection, label: `${context.premiumChange} vs prior term` },
        tone: premiumTrendTone,
      },
      {
        id: 'full-term-premium',
        title: 'Full term premium',
        value: ftpLabel,
        trend: { direction: 'neutral', label: 'Current term' },
        tone: 'neutral',
      },
      {
        id: 'scheduled-units',
        title: context.productLine.includes('Auto') ? 'Scheduled units' : 'Locations',
        value: String(unitCount),
        trend: { direction: 'neutral', label: 'Current term' },
        tone: 'neutral',
      },
      {
        id: 'loss-ratio',
        title: 'Loss ratio',
        value: `${lossRatio}.${seed % 10}%`,
        trend: { direction: lossRatio > 45 ? 'up' : 'down', label: 'vs prior term' },
        tone: lossRatio > 45 ? 'negative' : 'positive',
      },
    ],
    lifecycleFunnel: [
      { id: 'quotes', label: 'Renewal activity', value: 1, conversionLabel: 'In progress' },
      { id: 'endorsements', label: 'Endorsements', value: endorsements, conversionLabel: 'Current term' },
      { id: 'billing', label: 'Billing events', value: 2 + (seed % 3), conversionLabel: 'Current term' },
      { id: 'claims', label: 'Claims', value: claims, conversionLabel: claims ? 'Open' : 'None' },
      { id: 'documents', label: 'Documents', value: 40 + (seed % 80), conversionLabel: 'On file' },
    ],
    transactionsTrend: [
      { label: 'Jan', value: seed % 3 },
      { label: 'Feb', value: 1 + (seed % 4) },
      { label: 'Mar', value: 2 + (seed % 3) },
      { label: 'Apr', value: endorsements },
      { label: 'May', value: 1 + (seed % 2) },
      { label: 'Jun', value: endorsements + (seed % 2) },
    ],
    premiumImpactTrend: [
      { label: 'Jan', created: 0, completionRate: 0 },
      { label: 'Feb', created: scaleSeries(context.ftp * 0.02, 1), completionRate: 0 },
      { label: 'Mar', created: 0, completionRate: 0 },
      { label: 'Apr', created: scaleSeries(context.ftp * 0.04, 1), completionRate: scaleSeries(context.ftp * 0.01, 1) },
      { label: 'May', created: scaleSeries(context.ftp * 0.02, 1), completionRate: 0 },
      { label: 'Jun', created: 0, completionRate: 0 },
    ],
    endorsementActivity: [
      { label: 'Jan', value: 0 },
      { label: 'Feb', value: 1 },
      { label: 'Mar', value: 1 },
      { label: 'Apr', value: endorsements },
      { label: 'May', value: Math.max(0, endorsements - 1) },
      { label: 'Jun', value: endorsements },
    ],
    lossRatioTrend: [
      { label: 'Jan', value: lossRatio + 4 },
      { label: 'Feb', value: lossRatio + 2 },
      { label: 'Mar', value: lossRatio + 1 },
      { label: 'Apr', value: lossRatio },
      { label: 'May', value: lossRatio - 0.5 },
      { label: 'Jun', value: lossRatio - 1 },
    ],
    fleetByType: context.productLine.includes('Auto')
      ? [
          { name: 'Heavy units', value: 30 + (seed % 20) },
          { name: 'Light units', value: 20 + (seed % 15) },
          { name: 'Trailers', value: 10 + (seed % 10) },
          { name: 'Other', value: 5 + (seed % 8) },
        ]
      : [
          { name: 'Primary locations', value: 40 + (seed % 25) },
          { name: 'Secondary locations', value: 20 + (seed % 15) },
          { name: 'Storage', value: 10 + (seed % 10) },
        ],
    fleetByGaraging: [
      { name: `${context.riskState} — primary`, value: 60 + (seed % 20) },
      { name: 'Secondary markets', value: 20 + (seed % 15) },
      { name: 'Other', value: 10 + (seed % 10) },
    ],
    transactionsByType: [
      { name: 'Endorsements', value: endorsements },
      { name: 'Billing', value: 2 + (seed % 3) },
      { name: 'Claims', value: claims },
      { name: 'Renewals', value: 1 },
    ],
    garagingByState: [
      { code: stateCode, name: context.riskState, value: unitCount },
      { code: 'TX', name: 'Texas', value: Math.max(2, seed % 8) },
      { code: 'FL', name: 'Florida', value: Math.max(1, seed % 6) },
    ],
    premiumByCoverage: {
      data: [
        {
          label: 'Q1',
          liability: scaleSeries(context.twp * 0.35, 1),
          physicalDamage: scaleSeries(context.twp * 0.25, 1),
          medical: scaleSeries(context.twp * 0.15, 1),
          uninsured: scaleSeries(context.twp * 0.12, 1),
          other: scaleSeries(context.twp * 0.13, 1),
        },
        {
          label: 'Q2',
          liability: scaleSeries(context.twp * 0.38, 1),
          physicalDamage: scaleSeries(context.twp * 0.27, 1),
          medical: scaleSeries(context.twp * 0.14, 1),
          uninsured: scaleSeries(context.twp * 0.11, 1),
          other: scaleSeries(context.twp * 0.1, 1),
        },
      ],
      series: coverageSeries,
      yAxisFormatter: (value) => formatPolicyCurrency(value),
    },
    premiumOverTerm: {
      data: [
        {
          label: 'Term start',
          liability: scaleSeries(context.twp * 0.4, 1),
          physicalDamage: scaleSeries(context.twp * 0.28, 1),
          medical: scaleSeries(context.twp * 0.12, 1),
          uninsured: scaleSeries(context.twp * 0.1, 1),
          other: scaleSeries(context.twp * 0.1, 1),
        },
        {
          label: 'Current',
          liability: scaleSeries(context.twp * 0.42, 1),
          physicalDamage: scaleSeries(context.twp * 0.3, 1),
          medical: scaleSeries(context.twp * 0.11, 1),
          uninsured: scaleSeries(context.twp * 0.09, 1),
          other: scaleSeries(context.twp * 0.08, 1),
        },
      ],
      series: coverageSeries,
      yAxisFormatter: (value) => formatPolicyCurrency(value),
    },
    healthSparklines: [
      {
        id: 'endorsements',
        title: 'Endorsements',
        value: String(endorsements),
        trend: { direction: 'neutral', label: 'Current term' },
        tone: 'neutral',
        sparkline: [
          { label: 'Q1', value: 1 },
          { label: 'Q2', value: endorsements },
        ],
      },
      {
        id: 'claims',
        title: 'Open claims',
        value: String(claims),
        trend: { direction: claims ? 'up' : 'neutral', label: claims ? 'Active' : 'None' },
        tone: claims ? 'negative' : 'positive',
        sparkline: [
          { label: 'Q1', value: 0 },
          { label: 'Q2', value: claims },
        ],
      },
      {
        id: 'renewal',
        title: 'Days to expiration',
        value: String(120 + (seed % 120)),
        trend: { direction: 'down', label: 'Current term' },
        tone: 'positive',
        sparkline: [
          { label: 'Q1', value: 200 },
          { label: 'Q2', value: 120 + (seed % 120) },
        ],
      },
    ],
  }
}

export function buildPolicyAnalyticsData(context: PolicyContext): PolicyAnalyticsData {
  return context.isPrimaryMock ? buildPrimaryPolicyData(context) : buildGenericPolicyData(context)
}

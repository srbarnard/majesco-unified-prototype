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
import { POLICIES_TOTAL_ROWS } from '@/pages/policies/data/mockPoliciesList'

export const policiesProductSeries: AnalyticsStackedSeries[] = [
  { key: 'commercialAuto', label: 'Commercial Auto', color: figmaPalette.teal[500] },
  { key: 'commercialPackage', label: 'Commercial Package', color: figmaPalette.purple[700] },
  { key: 'generalLiability', label: 'General Liability', color: figmaPalette.green[700] },
  { key: 'businessOwners', label: 'Business Owners', color: figmaPalette.purple[400] },
  { key: 'umbrella', label: 'Umbrella', color: figmaPalette.blue[500] },
]

export const policiesListAnalyticsFilters: AnalyticsFilterBarConfig = {
  periodChips: ['7D', '30D', 'QTD', 'YTD', 'Rolling 12M'],
  activePeriod: 'YTD',
  dateRangeLabel: 'Jan 1 – Jun 26, 2026',
  filters: [
    {
      id: 'product',
      label: 'Product',
      value: 'All products',
      options: [
        'All products',
        'Commercial Auto',
        'Commercial Package',
        'Business Owners Policy',
        'Umbrella Liability',
        'Commercial General Liability',
      ],
    },
    {
      id: 'status',
      label: 'Status',
      value: 'All statuses',
      options: ['All statuses', 'Open', 'In review', 'Quoted', 'Declined'],
    },
    {
      id: 'producer',
      label: 'Producer',
      value: 'All producers',
      options: [
        'All producers',
        'Harborview Agency',
        'Atlas Insurance',
        'Blue Ridge Insurance',
        'ClearPath Insurance',
        'Evergreen Risk',
      ],
    },
  ],
}

export const policiesListAnalyticsInsights: AnalyticsInsight[] = [
  {
    id: 'renewals',
    label: '14 renewals due within 30 days',
    detail: '$6.2M in term premium requires underwriting review or remarket decision.',
    tone: 'warning',
  },
  {
    id: 'claims',
    label: 'Claims frequency up in Commercial Auto',
    detail: 'Loss ratio 4.2 pts above portfolio average — 3 accounts driving the increase.',
    tone: 'info',
  },
  {
    id: 'growth',
    label: 'New business premium ahead of plan',
    detail: 'YTD written premium is 8% above target, led by mid-market package accounts.',
    tone: 'success',
  },
]

export const policiesListAnalyticsKpis: AnalyticsKpiMetric[] = [
  {
    id: 'total-policies',
    title: 'Total policies',
    value: String(POLICIES_TOTAL_ROWS),
    trend: { direction: 'up', label: '6% vs last YTD' },
    tone: 'positive',
  },
  {
    id: 'active-policies',
    title: 'Active policies',
    value: '87',
    trend: { direction: 'up', label: '3 net adds this month' },
    tone: 'positive',
  },
  {
    id: 'renewal-rate',
    title: 'Renewal rate',
    value: '92.4%',
    trend: { direction: 'up', label: '1.8 pts vs last year' },
    tone: 'positive',
  },
  {
    id: 'avg-premium',
    title: 'Average premium',
    value: '$18.4K',
    trend: { direction: 'up', label: '4% vs prior term' },
    tone: 'neutral',
  },
  {
    id: 'in-force-premium',
    title: 'In-force premium',
    value: '$18.6M',
    trend: { direction: 'up', label: '11% vs last YTD' },
    tone: 'positive',
  },
  {
    id: 'claims-count',
    title: 'Open claims',
    value: '24',
    trend: { direction: 'down', label: '3 fewer than last month' },
    tone: 'positive',
  },
]

export const policiesPortfolioFunnel: AnalyticsFunnelStage[] = [
  { id: 'quoted', label: 'Quoted', value: 142, conversionLabel: '100%' },
  { id: 'bound', label: 'Bound', value: 118, conversionLabel: '83%' },
  { id: 'issued', label: 'Issued', value: 112, conversionLabel: '79%' },
  { id: 'in-force', label: 'In-force', value: 100, conversionLabel: '70%' },
  { id: 'renewed', label: 'Renewed', value: 92, conversionLabel: '65%' },
]

export const policiesOverTime: AnalyticsTimeSeriesPoint[] = [
  { label: 'Jan', value: 78 },
  { label: 'Feb', value: 81 },
  { label: 'Mar', value: 84 },
  { label: 'Apr', value: 88 },
  { label: 'May', value: 94 },
  { label: 'Jun', value: 100 },
]

export const premiumVolumeTrend: AnalyticsTimeSeriesPoint[] = [
  { label: 'Jan', value: 12400000 },
  { label: 'Feb', value: 13100000 },
  { label: 'Mar', value: 13800000 },
  { label: 'Apr', value: 15200000 },
  { label: 'May', value: 16900000 },
  { label: 'Jun', value: 18600000 },
]

export const renewalRateTrend: AnalyticsTimeSeriesPoint[] = [
  { label: 'Jan', value: 88 },
  { label: 'Feb', value: 89 },
  { label: 'Mar', value: 90 },
  { label: 'Apr', value: 91 },
  { label: 'May', value: 92 },
  { label: 'Jun', value: 92.4 },
]

export const newBusinessVsRenewals: AnalyticsComboPoint[] = [
  { label: 'Jan', created: 12, completionRate: 28 },
  { label: 'Feb', created: 14, completionRate: 30 },
  { label: 'Mar', created: 11, completionRate: 32 },
  { label: 'Apr', created: 16, completionRate: 34 },
  { label: 'May', created: 18, completionRate: 36 },
  { label: 'Jun', created: 15, completionRate: 38 },
]

export const statusBreakdown: AnalyticsDonutSegment[] = [
  { name: 'Open', value: 42 },
  { name: 'In review', value: 24 },
  { name: 'Quoted', value: 18 },
  { name: 'Declined', value: 16 },
]

export const productMixByVolume: AnalyticsDonutSegment[] = [
  { name: 'Commercial Auto', value: 34 },
  { name: 'Commercial Package', value: 22 },
  { name: 'Business Owners Policy', value: 18 },
  { name: 'Umbrella Liability', value: 14 },
  { name: 'Commercial General Liability', value: 12 },
]

export const topProducersByVolume: AnalyticsDonutSegment[] = [
  { name: 'Harborview Agency', value: 26 },
  { name: 'Atlas Insurance', value: 21 },
  { name: 'Blue Ridge Insurance', value: 17 },
  { name: 'ClearPath Insurance', value: 14 },
  { name: 'Evergreen Risk', value: 12 },
]

export const policiesByState: AnalyticsStateValue[] = [
  { code: 'CA', name: 'California', value: 28 },
  { code: 'TX', name: 'Texas', value: 22 },
  { code: 'FL', name: 'Florida', value: 18 },
  { code: 'NY', name: 'New York', value: 14 },
  { code: 'IL', name: 'Illinois', value: 11 },
  { code: 'GA', name: 'Georgia', value: 10 },
  { code: 'NC', name: 'North Carolina', value: 9 },
  { code: 'OH', name: 'Ohio', value: 8 },
  { code: 'PA', name: 'Pennsylvania', value: 7 },
  { code: 'CO', name: 'Colorado', value: 6 },
  { code: 'AZ', name: 'Arizona', value: 6 },
  { code: 'WA', name: 'Washington', value: 5 },
  { code: 'MN', name: 'Minnesota', value: 5 },
  { code: 'MO', name: 'Missouri', value: 4 },
  { code: 'TN', name: 'Tennessee', value: 4 },
  { code: 'OR', name: 'Oregon', value: 3 },
  { code: 'NV', name: 'Nevada', value: 3 },
  { code: 'LA', name: 'Louisiana', value: 2 },
]

export const premiumByProductAndState: AnalyticsStackedPoint[] = [
  {
    label: 'CA',
    commercialAuto: 2.8,
    commercialPackage: 1.9,
    generalLiability: 1.2,
    businessOwners: 0.9,
    umbrella: 0.7,
  },
  {
    label: 'TX',
    commercialAuto: 2.1,
    commercialPackage: 1.5,
    generalLiability: 1.0,
    businessOwners: 0.8,
    umbrella: 0.6,
  },
  {
    label: 'FL',
    commercialAuto: 1.8,
    commercialPackage: 1.3,
    generalLiability: 0.9,
    businessOwners: 0.7,
    umbrella: 0.5,
  },
  {
    label: 'NY',
    commercialAuto: 1.6,
    commercialPackage: 1.2,
    generalLiability: 0.8,
    businessOwners: 0.6,
    umbrella: 0.4,
  },
  {
    label: 'IL',
    commercialAuto: 1.4,
    commercialPackage: 1.0,
    generalLiability: 0.7,
    businessOwners: 0.5,
    umbrella: 0.4,
  },
  {
    label: 'GA',
    commercialAuto: 1.2,
    commercialPackage: 0.9,
    generalLiability: 0.6,
    businessOwners: 0.5,
    umbrella: 0.3,
  },
]

export const premiumMomentumByProduct: AnalyticsStackedPoint[] = [
  {
    label: 'Jan',
    commercialAuto: 4.2,
    commercialPackage: 2.8,
    generalLiability: 1.6,
    businessOwners: 1.2,
    umbrella: 0.8,
  },
  {
    label: 'Feb',
    commercialAuto: 4.6,
    commercialPackage: 3.0,
    generalLiability: 1.7,
    businessOwners: 1.3,
    umbrella: 0.9,
  },
  {
    label: 'Mar',
    commercialAuto: 5.1,
    commercialPackage: 3.2,
    generalLiability: 1.9,
    businessOwners: 1.4,
    umbrella: 1.0,
  },
  {
    label: 'Apr',
    commercialAuto: 5.8,
    commercialPackage: 3.6,
    generalLiability: 2.1,
    businessOwners: 1.6,
    umbrella: 1.1,
  },
  {
    label: 'May',
    commercialAuto: 6.4,
    commercialPackage: 3.9,
    generalLiability: 2.3,
    businessOwners: 1.8,
    umbrella: 1.2,
  },
  {
    label: 'Jun',
    commercialAuto: 7.1,
    commercialPackage: 4.2,
    generalLiability: 2.5,
    businessOwners: 2.0,
    umbrella: 1.3,
  },
]

export const policiesHealthSparklines: AnalyticsSparklineCard[] = [
  {
    id: 'lapse-risk',
    title: 'Lapse risk',
    value: '9',
    trend: { direction: 'down', label: '2 vs last month' },
    tone: 'positive',
    sparkline: [
      { label: 'W1', value: 14 },
      { label: 'W2', value: 12 },
      { label: 'W3', value: 11 },
      { label: 'W4', value: 9 },
    ],
  },
  {
    id: 'endorsements',
    title: 'Endorsements pending',
    value: '17',
    trend: { direction: 'up', label: '5 over SLA' },
    tone: 'negative',
    sparkline: [
      { label: 'W1', value: 10 },
      { label: 'W2', value: 12 },
      { label: 'W3', value: 14 },
      { label: 'W4', value: 17 },
    ],
  },
  {
    id: 'loss-ratio',
    title: 'Portfolio loss ratio',
    value: '58.2%',
    trend: { direction: 'down', label: '1.4 pts improvement' },
    tone: 'positive',
    sparkline: [
      { label: 'W1', value: 61 },
      { label: 'W2', value: 60 },
      { label: 'W3', value: 59 },
      { label: 'W4', value: 58.2 },
    ],
  },
]

export function formatPoliciesPremium(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1000) return `$${Math.round(value / 1000)}K`
  return `$${value.toLocaleString('en-US')}`
}

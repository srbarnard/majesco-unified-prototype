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

export const productLineSeries: AnalyticsStackedSeries[] = [
  { key: 'commercialAuto', label: 'Commercial Auto', color: figmaPalette.teal[500] },
  { key: 'commercialPackage', label: 'Commercial Package', color: figmaPalette.purple[700] },
  { key: 'generalLiability', label: 'General Liability', color: figmaPalette.green[700] },
  { key: 'property', label: 'Property', color: figmaPalette.purple[400] },
  { key: 'umbrella', label: 'Umbrella', color: figmaPalette.blue[500] },
]

export const quotesAnalyticsFilters: AnalyticsFilterBarConfig = {
  periodChips: ['7D', '30D', 'QTD', 'YTD', 'Rolling 12M'],
  activePeriod: 'QTD',
  dateRangeLabel: 'Apr 1 – Jun 26, 2026',
  filters: [
    {
      id: 'product',
      label: 'Product',
      value: 'All products',
      options: ['All products', 'Commercial Auto', 'Commercial Package', 'General Liability', 'Property', 'Umbrella'],
    },
    {
      id: 'producer',
      label: 'Producer',
      value: 'All producers',
      options: ['All producers', 'Harborview Agency', 'Summit Risk', 'Atlas Insurance Group'],
    },
    {
      id: 'segment',
      label: 'Segment',
      value: 'All segments',
      options: ['All segments', 'New business', 'Renewal', 'Remarket'],
    },
  ],
}

export const quotesAnalyticsInsights: AnalyticsInsight[] = [
  {
    id: 'expiring',
    label: '12 quotes expiring within 7 days',
    detail: '$1.4M in quoted premium needs a decision before effective date.',
    tone: 'warning',
  },
  {
    id: 'uw-queue',
    label: '8 quotes in underwriting review',
    detail: 'Average time in queue: 2.3 days — 3 are past SLA.',
    tone: 'info',
  },
  {
    id: 'bind-momentum',
    label: 'Bind rate improved in Commercial Auto',
    detail: 'Up 6 pts vs last quarter; largest lift from mid-market accounts.',
    tone: 'success',
  },
]

export const quotesAnalyticsKpis: AnalyticsKpiMetric[] = [
  {
    id: 'pipeline-value',
    title: 'Pipeline value',
    value: '$4.8M',
    trend: { direction: 'up', label: '12% vs last QTD' },
    tone: 'positive',
  },
  {
    id: 'active-quotes',
    title: 'Active quotes',
    value: '186',
    trend: { direction: 'down', label: '8% vs last QTD' },
    tone: 'negative',
  },
  {
    id: 'bind-rate',
    title: 'Bind rate',
    value: '38.2%',
    trend: { direction: 'up', label: '4.1 pts vs last QTD' },
    tone: 'positive',
  },
  {
    id: 'avg-cycle',
    title: 'Avg quote cycle',
    value: '4.2 days',
    trend: { direction: 'down', label: '0.6 days faster' },
    tone: 'positive',
  },
]

export const quotesPipelineFunnel: AnalyticsFunnelStage[] = [
  { id: 'submitted', label: 'Submitted', value: 312, conversionLabel: '100%' },
  { id: 'rated', label: 'Rated', value: 284, conversionLabel: '91%' },
  { id: 'presented', label: 'Presented', value: 228, conversionLabel: '73%' },
  { id: 'bound', label: 'Bound', value: 119, conversionLabel: '38%' },
  { id: 'issued', label: 'Issued', value: 104, conversionLabel: '33%' },
]

export const submissionsVsBinds: AnalyticsComboPoint[] = [
  { label: 'Apr W1', created: 68, completionRate: 34 },
  { label: 'Apr W3', created: 74, completionRate: 36 },
  { label: 'May W1', created: 82, completionRate: 37 },
  { label: 'May W3', created: 79, completionRate: 39 },
  { label: 'Jun W1', created: 91, completionRate: 41 },
  { label: 'Jun W3', created: 88, completionRate: 38 },
]

export const pipelinePremiumTrend: AnalyticsTimeSeriesPoint[] = [
  { label: 'Apr W1', value: 920000 },
  { label: 'Apr W3', value: 1040000 },
  { label: 'May W1', value: 1180000 },
  { label: 'May W3', value: 1260000 },
  { label: 'Jun W1', value: 1420000 },
  { label: 'Jun W3', value: 1480000 },
]

export const conversionRateTrend: AnalyticsTimeSeriesPoint[] = [
  { label: 'Apr W1', value: 31 },
  { label: 'Apr W3', value: 33 },
  { label: 'May W1', value: 35 },
  { label: 'May W3', value: 36 },
  { label: 'Jun W1', value: 39 },
  { label: 'Jun W3', value: 38 },
]

export const quoteVelocityTrend: AnalyticsComboPoint[] = [
  { label: 'Apr W1', created: 5.8, completionRate: 2.1 },
  { label: 'Apr W3', created: 5.4, completionRate: 2.0 },
  { label: 'May W1', created: 4.9, completionRate: 1.9 },
  { label: 'May W3', created: 4.6, completionRate: 1.8 },
  { label: 'Jun W1', created: 4.3, completionRate: 1.7 },
  { label: 'Jun W3', created: 4.2, completionRate: 1.6 },
]

export const pipelineByStage: AnalyticsDonutSegment[] = [
  { name: 'Draft', value: 22 },
  { name: 'Quoted', value: 28 },
  { name: 'Presented', value: 18 },
  { name: 'Ready for booking', value: 14 },
  { name: 'Referred', value: 10 },
  { name: 'Pending issuance', value: 8 },
]

export const productMix: AnalyticsDonutSegment[] = [
  { name: 'Commercial Auto', value: 36 },
  { name: 'Commercial Package', value: 24 },
  { name: 'General Liability', value: 18 },
  { name: 'Property', value: 12 },
  { name: 'Umbrella', value: 10 },
]

export const topProducersByPremium: AnalyticsDonutSegment[] = [
  { name: 'Harborview Agency', value: 28 },
  { name: 'Summit Risk', value: 21 },
  { name: 'Atlas Insurance Group', value: 16 },
  { name: 'Blue Ridge Insurance', value: 14 },
  { name: 'First Coastal Agency', value: 11 },
]

export const quotesByState: AnalyticsStateValue[] = [
  { code: 'CA', name: 'California', value: 420 },
  { code: 'TX', name: 'Texas', value: 380 },
  { code: 'FL', name: 'Florida', value: 310 },
  { code: 'NY', name: 'New York', value: 290 },
  { code: 'IL', name: 'Illinois', value: 210 },
  { code: 'GA', name: 'Georgia', value: 185 },
  { code: 'NC', name: 'North Carolina', value: 160 },
  { code: 'OH', name: 'Ohio', value: 145 },
  { code: 'PA', name: 'Pennsylvania', value: 132 },
  { code: 'CO', name: 'Colorado', value: 118 },
  { code: 'AZ', name: 'Arizona', value: 104 },
  { code: 'WA', name: 'Washington', value: 96 },
  { code: 'MN', name: 'Minnesota', value: 88 },
  { code: 'MO', name: 'Missouri', value: 76 },
  { code: 'TN', name: 'Tennessee', value: 68 },
  { code: 'OR', name: 'Oregon', value: 62 },
  { code: 'NV', name: 'Nevada', value: 54 },
  { code: 'LA', name: 'Louisiana', value: 48 },
]

export const bindRateByState: AnalyticsStackedPoint[] = [
  { label: 'CA', commercialAuto: 42, commercialPackage: 38, generalLiability: 35, property: 33, umbrella: 40 },
  { label: 'TX', commercialAuto: 36, commercialPackage: 34, generalLiability: 31, property: 29, umbrella: 33 },
  { label: 'FL', commercialAuto: 39, commercialPackage: 37, generalLiability: 32, property: 30, umbrella: 35 },
  { label: 'NY', commercialAuto: 33, commercialPackage: 31, generalLiability: 28, property: 27, umbrella: 30 },
  { label: 'IL', commercialAuto: 37, commercialPackage: 35, generalLiability: 33, property: 31, umbrella: 34 },
  { label: 'GA', commercialAuto: 35, commercialPackage: 33, generalLiability: 30, property: 28, umbrella: 32 },
]

export const premiumMomentum: AnalyticsStackedPoint[] = [
  {
    label: 'Apr',
    commercialAuto: 420000,
    commercialPackage: 280000,
    generalLiability: 180000,
    property: 140000,
    umbrella: 90000,
  },
  {
    label: 'May',
    commercialAuto: 560000,
    commercialPackage: 340000,
    generalLiability: 210000,
    property: 170000,
    umbrella: 100000,
  },
  {
    label: 'Jun',
    commercialAuto: 860000,
    commercialPackage: 510000,
    generalLiability: 350000,
    property: 270000,
    umbrella: 145000,
  },
]

export const healthSparklines: AnalyticsSparklineCard[] = [
  {
    id: 'stale-quotes',
    title: 'Stale quotes',
    value: '23',
    trend: { direction: 'down', label: '5 vs last week' },
    tone: 'positive',
    sparkline: [
      { label: 'W1', value: 31 },
      { label: 'W2', value: 28 },
      { label: 'W3', value: 26 },
      { label: 'W4', value: 23 },
    ],
  },
  {
    id: 'uw-queue',
    title: 'UW queue',
    value: '8',
    trend: { direction: 'up', label: '2 over SLA' },
    tone: 'negative',
    sparkline: [
      { label: 'W1', value: 5 },
      { label: 'W2', value: 6 },
      { label: 'W3', value: 7 },
      { label: 'W4', value: 8 },
    ],
  },
  {
    id: 'expiring-soon',
    title: 'Expiring soon',
    value: '12',
    trend: { direction: 'up', label: 'Next 7 days' },
    tone: 'negative',
    sparkline: [
      { label: 'W1', value: 6 },
      { label: 'W2', value: 8 },
      { label: 'W3', value: 10 },
      { label: 'W4', value: 12 },
    ],
  },
]

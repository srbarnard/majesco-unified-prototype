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

export const premiumLineSeries: AnalyticsStackedSeries[] = [
  { key: 'construction', label: 'Construction', color: figmaPalette.teal[500] },
  { key: 'logistics', label: 'Logistics', color: figmaPalette.purple[700] },
  { key: 'realty', label: 'Realty', color: figmaPalette.green[700] },
  { key: 'hospitality', label: 'Hospitality', color: figmaPalette.purple[400] },
  { key: 'healthcare', label: 'Healthcare', color: figmaPalette.blue[500] },
]

export const insuredsAnalyticsFilters: AnalyticsFilterBarConfig = {
  periodChips: ['7D', '30D', 'QTD', 'YTD', 'Rolling 12M'],
  activePeriod: 'QTD',
  dateRangeLabel: 'Apr 1 – Jun 26, 2026',
  filters: [
    {
      id: 'type',
      label: 'Insured type',
      value: 'All types',
      options: ['All types', 'Commercial', 'Non-commercial'],
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
      options: ['All segments', 'Renewal', 'New business', 'High loss'],
    },
  ],
}

export const insuredsAnalyticsInsights: AnalyticsInsight[] = [
  {
    id: 'renewals',
    label: '18 insureds renewing within 90 days',
    detail: '$8.4M in-force premium needs producer outreach before expiration.',
    tone: 'warning',
  },
  {
    id: 'quotes',
    label: '14 insureds have open quotes',
    detail: 'Average quoted premium $412K — 5 have had no activity in 14 days.',
    tone: 'info',
  },
  {
    id: 'claims',
    label: 'Incurred loss concentrated in construction',
    detail: 'Atlantic Ridge and Granite State account for 28% of open incurred loss.',
    tone: 'success',
  },
]

export const insuredsAnalyticsKpis: AnalyticsKpiMetric[] = [
  {
    id: 'in-force',
    title: 'Premium in-force',
    value: '$62.4M',
    trend: { direction: 'up', label: '6% vs last QTD' },
    tone: 'positive',
  },
  {
    id: 'active-insureds',
    title: 'Active insureds',
    value: '75',
    trend: { direction: 'up', label: '4 vs last QTD' },
    tone: 'positive',
  },
  {
    id: 'loss-ratio',
    title: 'Book loss ratio',
    value: '48.2%',
    trend: { direction: 'down', label: '2.1 pts vs last QTD' },
    tone: 'positive',
  },
  {
    id: 'open-claims',
    title: 'Open claims',
    value: '11',
    trend: { direction: 'up', label: '3 vs last month' },
    tone: 'negative',
  },
]

export const insuredsPipelineFunnel: AnalyticsFunnelStage[] = [
  { id: 'prospects', label: 'Prospects', value: 210, conversionLabel: '100%' },
  { id: 'quoted', label: 'Quoted', value: 148, conversionLabel: '70%' },
  { id: 'bound', label: 'Bound', value: 96, conversionLabel: '46%' },
  { id: 'in-force', label: 'In-force', value: 75, conversionLabel: '36%' },
  { id: 'renewed', label: 'Renewed', value: 61, conversionLabel: '29%' },
]

export const newVsRenewal: AnalyticsComboPoint[] = [
  { label: 'Apr W1', created: 12, completionRate: 68 },
  { label: 'Apr W3', created: 14, completionRate: 71 },
  { label: 'May W1', created: 11, completionRate: 74 },
  { label: 'May W3', created: 16, completionRate: 72 },
  { label: 'Jun W1', created: 13, completionRate: 76 },
  { label: 'Jun W3', created: 15, completionRate: 78 },
]

export const premiumInForceTrend: AnalyticsTimeSeriesPoint[] = [
  { label: 'Apr W1', value: 54_200_000 },
  { label: 'Apr W3', value: 55_800_000 },
  { label: 'May W1', value: 57_400_000 },
  { label: 'May W3', value: 59_100_000 },
  { label: 'Jun W1', value: 60_800_000 },
  { label: 'Jun W3', value: 62_400_000 },
]

export const lossRatioTrend: AnalyticsTimeSeriesPoint[] = [
  { label: 'Apr W1', value: 52 },
  { label: 'Apr W3', value: 51 },
  { label: 'May W1', value: 50 },
  { label: 'May W3', value: 49 },
  { label: 'Jun W1', value: 49 },
  { label: 'Jun W3', value: 48 },
]

export const claimsVelocityTrend: AnalyticsComboPoint[] = [
  { label: 'Apr W1', created: 9, completionRate: 6 },
  { label: 'Apr W3', created: 8, completionRate: 5 },
  { label: 'May W1', created: 11, completionRate: 7 },
  { label: 'May W3', created: 10, completionRate: 6 },
  { label: 'Jun W1', created: 12, completionRate: 8 },
  { label: 'Jun W3', created: 11, completionRate: 7 },
]

export const bookByType: AnalyticsDonutSegment[] = [
  { name: 'Commercial', value: 62 },
  { name: 'Non-commercial', value: 13 },
]

export const premiumMix: AnalyticsDonutSegment[] = [
  { name: 'Construction', value: 28 },
  { name: 'Logistics', value: 18 },
  { name: 'Realty', value: 16 },
  { name: 'Hospitality', value: 14 },
  { name: 'Healthcare', value: 12 },
  { name: 'Other', value: 12 },
]

export const topInsuredsByPremium: AnalyticsDonutSegment[] = [
  { name: 'Atlantic Ridge Construction', value: 22 },
  { name: 'Maple Grove Property Mgmt', value: 18 },
  { name: 'Granite State Builders', value: 16 },
  { name: 'Prairie Wind Energy', value: 14 },
  { name: 'Keystone Commercial Realty', value: 12 },
  { name: 'Others', value: 18 },
]

export const insuredsByState: AnalyticsStateValue[] = [
  { code: 'CA', name: 'California', value: 14 },
  { code: 'TX', name: 'Texas', value: 11 },
  { code: 'FL', name: 'Florida', value: 8 },
  { code: 'NY', name: 'New York', value: 7 },
  { code: 'IL', name: 'Illinois', value: 6 },
  { code: 'PA', name: 'Pennsylvania', value: 5 },
  { code: 'OH', name: 'Ohio', value: 4 },
  { code: 'CO', name: 'Colorado', value: 4 },
  { code: 'AZ', name: 'Arizona', value: 3 },
  { code: 'WA', name: 'Washington', value: 3 },
  { code: 'TN', name: 'Tennessee', value: 3 },
  { code: 'MN', name: 'Minnesota', value: 2 },
  { code: 'OR', name: 'Oregon', value: 2 },
  { code: 'NE', name: 'Nebraska', value: 1 },
  { code: 'GA', name: 'Georgia', value: 2 },
]

export const lossRatioByState: AnalyticsStackedPoint[] = [
  { label: 'CA', construction: 54, logistics: 41, realty: 38, hospitality: 44, healthcare: 36 },
  { label: 'TX', construction: 48, logistics: 46, realty: 33, hospitality: 40, healthcare: 34 },
  { label: 'FL', construction: 51, logistics: 39, realty: 35, hospitality: 47, healthcare: 32 },
  { label: 'NY', construction: 46, logistics: 37, realty: 42, hospitality: 39, healthcare: 31 },
  { label: 'IL', construction: 49, logistics: 43, realty: 36, hospitality: 41, healthcare: 33 },
  { label: 'PA', construction: 44, logistics: 35, realty: 34, hospitality: 38, healthcare: 30 },
]

export const premiumMomentum: AnalyticsStackedPoint[] = [
  {
    label: 'Apr',
    construction: 4_200_000,
    logistics: 2_800_000,
    realty: 2_400_000,
    hospitality: 1_800_000,
    healthcare: 1_400_000,
  },
  {
    label: 'May',
    construction: 4_600_000,
    logistics: 3_100_000,
    realty: 2_700_000,
    hospitality: 1_900_000,
    healthcare: 1_500_000,
  },
  {
    label: 'Jun',
    construction: 5_100_000,
    logistics: 3_400_000,
    realty: 3_000_000,
    hospitality: 2_100_000,
    healthcare: 1_700_000,
  },
]

export const healthSparklines: AnalyticsSparklineCard[] = [
  {
    id: 'upcoming-renewals',
    title: 'Upcoming renewals',
    value: '18',
    trend: { direction: 'up', label: 'Next 90 days' },
    tone: 'negative',
    sparkline: [
      { label: 'W1', value: 11 },
      { label: 'W2', value: 13 },
      { label: 'W3', value: 16 },
      { label: 'W4', value: 18 },
    ],
  },
  {
    id: 'open-quotes',
    title: 'Open quotes',
    value: '14',
    trend: { direction: 'down', label: '3 vs last week' },
    tone: 'positive',
    sparkline: [
      { label: 'W1', value: 19 },
      { label: 'W2', value: 17 },
      { label: 'W3', value: 16 },
      { label: 'W4', value: 14 },
    ],
  },
  {
    id: 'open-claims',
    title: 'Open claims',
    value: '11',
    trend: { direction: 'up', label: '2 new this week' },
    tone: 'negative',
    sparkline: [
      { label: 'W1', value: 8 },
      { label: 'W2', value: 9 },
      { label: 'W3', value: 10 },
      { label: 'W4', value: 11 },
    ],
  },
]

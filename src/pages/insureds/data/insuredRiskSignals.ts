import type { PulseRange } from '@/app/data/pulseMock'
import type { InsightStatus } from '@/design-system/components/InsightCallout'
import type { OverviewTimeSeriesPoint } from '@/pages/policies/data/mockOverview'

export type InsuredRiskSignalPill = 'risk' | 'premium'

export type InsuredRiskInsight = {
  status: InsightStatus
  title: string
  body: string
}

export type InsuredPremiumMixPoint = {
  label: string
  date?: string
  auto: number
  liability: number
  workersComp: number
}

/** Full-term risk score series (0–100). Sliced by Pulse range in the UI. */
export const insuredRiskScoreSeries: OverviewTimeSeriesPoint[] = [
  { label: 'Jan 2026', value: 48, date: 'Jan 8, 2026' },
  { label: '', value: 50, date: 'Jan 22, 2026' },
  { label: 'Feb 2026', value: 49, date: 'Feb 5, 2026' },
  { label: '', value: 52, date: 'Feb 19, 2026' },
  { label: 'Mar 2026', value: 54, date: 'Mar 6, 2026' },
  { label: '', value: 53, date: 'Mar 20, 2026' },
  { label: 'Apr 2026', value: 58, date: 'Apr 3, 2026' },
  { label: '', value: 61, date: 'Apr 15, 2026' },
  { label: '', value: 59, date: 'Apr 28, 2026' },
  { label: 'May 2026', value: 57, date: 'May 8, 2026' },
  { label: '', value: 56, date: 'May 21, 2026' },
  { label: 'Jun 2026', value: 55, date: 'Jun 4, 2026' },
  { label: '', value: 55, date: 'Jun 18, 2026' },
]

/** Premium contribution by line ($K). */
export const insuredPremiumMixSeries: InsuredPremiumMixPoint[] = [
  { label: 'Jan 2026', date: 'Jan 2026', auto: 980, liability: 380, workersComp: 480 },
  { label: '', date: 'Jan mid', auto: 990, liability: 385, workersComp: 485 },
  { label: 'Feb 2026', date: 'Feb 2026', auto: 1010, liability: 390, workersComp: 490 },
  { label: '', date: 'Feb mid', auto: 1020, liability: 395, workersComp: 495 },
  { label: 'Mar 2026', date: 'Mar 2026', auto: 1040, liability: 400, workersComp: 505 },
  { label: '', date: 'Mar mid', auto: 1055, liability: 410, workersComp: 510 },
  { label: 'Apr 2026', date: 'Apr 2026', auto: 1120, liability: 430, workersComp: 540 },
  { label: '', date: 'Apr mid', auto: 1180, liability: 450, workersComp: 560 },
  { label: '', date: 'Apr late', auto: 1205, liability: 460, workersComp: 575 },
  { label: 'May 2026', date: 'May 2026', auto: 1220, liability: 470, workersComp: 590 },
  { label: '', date: 'May mid', auto: 1235, liability: 475, workersComp: 600 },
  { label: 'Jun 2026', date: 'Jun 2026', auto: 1245, liability: 486, workersComp: 612 },
  { label: '', date: 'Jun mid', auto: 1245, liability: 486, workersComp: 612 },
]

const RANGE_POINT_COUNTS: Record<PulseRange, number> = {
  '30D': 5,
  '90D': 9,
  '6M': 13,
}

export function sliceInsuredSeriesByRange<T>(data: T[], range: PulseRange): T[] {
  const count = Math.min(RANGE_POINT_COUNTS[range], data.length)
  return data.slice(-count)
}

export const insuredRiskInsights: Record<InsuredRiskSignalPill, Record<PulseRange, InsuredRiskInsight>> = {
  risk: {
    '30D': {
      status: 'neutral',
      title: 'Risk score steady at 55',
      body: 'Account risk held flat over the last 30 days after the April claim-driven spike cooled.',
    },
    '90D': {
      status: 'negative',
      title: 'Risk score up 7 pts vs prior 90 days',
      body: 'April claim intake and mid-term fleet growth lifted the account score; watch reserve changes into renewal.',
    },
    '6M': {
      status: 'negative',
      title: 'Risk score elevated vs prior term',
      body: 'Term-to-date risk is above the Jan baseline. Fleet + GL concentration in California remains the primary driver.',
    },
  },
  premium: {
    '30D': {
      status: 'positive',
      title: 'Premium mix stable last 30 days',
      body: 'Commercial Auto still leads written premium; GL and WC held share with no mid-month spikes.',
    },
    '90D': {
      status: 'neutral',
      title: 'Auto share grew on fleet adds',
      body: 'Commercial Auto contribution rose after April vehicle endorsements; GL/WC grew more slowly.',
    },
    '6M': {
      status: 'positive',
      title: 'Balanced growth across lines',
      body: 'All three lines expanded over the term. Auto remains the largest share with healthy GL and WC support.',
    },
  },
}

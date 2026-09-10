import type { PulseRange } from '@/app/data/pulseMock'
import type { InsightStatus } from '@/design-system/components/InsightCallout'
import type { OverviewTimeSeriesPoint } from '@/pages/policies/data/mockOverview'

export type QuoteCoverageSignalPill = 'mix' | 'share'

export type QuoteCoverageInsight = {
  status: InsightStatus
  title: string
  body: string
}

/** Coverage premium ($K) by line across rating iterations. */
export type QuoteCoverageMixPoint = {
  label: string
  date?: string
  liability: number
  comprehensive: number
  collision: number
  uninsured: number
}

/** Percent share of total quoted premium by line (sums to ~100). */
export type QuoteCoverageSharePoint = {
  label: string
  date?: string
  liability: number
  comprehensive: number
  collision: number
  uninsured: number
}

/** Progressive rating run-up to current $1.245M quote. */
export const quoteCoverageMixSeries: QuoteCoverageMixPoint[] = [
  { label: 'Jan 2026', date: 'Jan 8, 2026', liability: 720, comprehensive: 180, collision: 95, uninsured: 48 },
  { label: '', date: 'Jan 22, 2026', liability: 735, comprehensive: 185, collision: 98, uninsured: 50 },
  { label: 'Feb 2026', date: 'Feb 5, 2026', liability: 760, comprehensive: 192, collision: 102, uninsured: 52 },
  { label: '', date: 'Feb 19, 2026', liability: 780, comprehensive: 198, collision: 108, uninsured: 54 },
  { label: 'Mar 2026', date: 'Mar 6, 2026', liability: 800, comprehensive: 205, collision: 112, uninsured: 55 },
  { label: '', date: 'Mar 20, 2026', liability: 810, comprehensive: 208, collision: 115, uninsured: 56 },
  { label: 'Apr 2026', date: 'Apr 3, 2026', liability: 825, comprehensive: 212, collision: 118, uninsured: 57 },
  { label: '', date: 'Apr 15, 2026', liability: 835, comprehensive: 215, collision: 120, uninsured: 58 },
  { label: '', date: 'Apr 28, 2026', liability: 838, comprehensive: 216, collision: 122, uninsured: 59 },
  { label: 'May 2026', date: 'May 8, 2026', liability: 840, comprehensive: 217, collision: 123, uninsured: 59 },
  { label: '', date: 'May 21, 2026', liability: 841, comprehensive: 218, collision: 124, uninsured: 60 },
  { label: 'Jun 2026', date: 'Jun 4, 2026', liability: 842, comprehensive: 218, collision: 124, uninsured: 60 },
  { label: '', date: 'Jun 12, 2026', liability: 842, comprehensive: 219, collision: 124, uninsured: 60 },
]

/** Line share of TWP — liability remains dominant as fleet adds lift physical damage. */
export const quoteCoverageShareSeries: QuoteCoverageSharePoint[] = [
  { label: 'Jan 2026', date: 'Jan 8, 2026', liability: 69, comprehensive: 17, collision: 9, uninsured: 5 },
  { label: '', date: 'Jan 22, 2026', liability: 69, comprehensive: 17, collision: 9, uninsured: 5 },
  { label: 'Feb 2026', date: 'Feb 5, 2026', liability: 69, comprehensive: 17, collision: 9, uninsured: 5 },
  { label: '', date: 'Feb 19, 2026', liability: 68, comprehensive: 17, collision: 10, uninsured: 5 },
  { label: 'Mar 2026', date: 'Mar 6, 2026', liability: 68, comprehensive: 17, collision: 10, uninsured: 5 },
  { label: '', date: 'Mar 20, 2026', liability: 68, comprehensive: 17, collision: 10, uninsured: 5 },
  { label: 'Apr 2026', date: 'Apr 3, 2026', liability: 68, comprehensive: 17, collision: 10, uninsured: 5 },
  { label: '', date: 'Apr 15, 2026', liability: 68, comprehensive: 17, collision: 10, uninsured: 5 },
  { label: '', date: 'Apr 28, 2026', liability: 68, comprehensive: 17, collision: 10, uninsured: 5 },
  { label: 'May 2026', date: 'May 8, 2026', liability: 68, comprehensive: 17, collision: 10, uninsured: 5 },
  { label: '', date: 'May 21, 2026', liability: 68, comprehensive: 17, collision: 10, uninsured: 5 },
  { label: 'Jun 2026', date: 'Jun 4, 2026', liability: 68, comprehensive: 17, collision: 10, uninsured: 5 },
  { label: '', date: 'Jun 12, 2026', liability: 68, comprehensive: 17, collision: 10, uninsured: 5 },
]

/** Total quoted premium ($K) — companion series for tooltip totals if needed. */
export const quoteTotalPremiumSeries: OverviewTimeSeriesPoint[] = quoteCoverageMixSeries.map((point) => ({
  label: point.label,
  date: point.date,
  value: point.liability + point.comprehensive + point.collision + point.uninsured,
}))

const RANGE_POINT_COUNTS: Record<PulseRange, number> = {
  '30D': 5,
  '90D': 9,
  '6M': 13,
}

export function sliceQuoteSeriesByRange<T>(data: T[], range: PulseRange): T[] {
  const count = Math.min(RANGE_POINT_COUNTS[range], data.length)
  return data.slice(-count)
}

export const quoteCoverageInsights: Record<
  QuoteCoverageSignalPill,
  Record<PulseRange, QuoteCoverageInsight>
> = {
  mix: {
    '30D': {
      status: 'neutral',
      title: 'Coverage premium stable into v3',
      body: 'Liability, Comp, Collision, and UM held flat over the last rating pass — no mid-month endorsement spikes.',
    },
    '90D': {
      status: 'positive',
      title: 'Physical damage climbed with fleet adds',
      body: 'April vehicle schedule growth lifted Comp and Collision while CSL liability stayed the largest contributor.',
    },
    '6M': {
      status: 'positive',
      title: 'Rated premium matured across all lines',
      body: 'From first indication to v3, every coverage line rose with the 12-unit schedule. Liability still anchors ~68% of TWP.',
    },
  },
  share: {
    '30D': {
      status: 'neutral',
      title: 'Line share unchanged last 30 days',
      body: 'CSL liability remains ~68% of quoted premium; Comp / Collision / UM shares are steady into presentment.',
    },
    '90D': {
      status: 'neutral',
      title: 'Collision share edged up on units',
      body: 'Fleet adds nudged Collision from 9% toward 10% of TWP; liability share compressed slightly without a rate change.',
    },
    '6M': {
      status: 'positive',
      title: 'Balanced coverage composition',
      body: 'Share mix is stable term-to-date. Liability leads; physical damage and UM support a standard Business Auto profile.',
    },
  },
}

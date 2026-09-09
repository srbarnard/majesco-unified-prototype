import type { InsightStatus } from '@/design-system/components/InsightCallout'

export type RiskLossYearPoint = {
  year: string
  incurred: number | null
  onFile: boolean
}

export type RiskRevenueExposurePoint = {
  year: string
  revenue: number
  exposure: number
}

export type RiskSignalInsightContent = {
  title: string
  body: string
  status: InsightStatus
}

export type SubmissionRiskSignals = {
  lossYears: RiskLossYearPoint[]
  revenueExposure: RiskRevenueExposurePoint[]
  lossInsight: RiskSignalInsightContent
  revenueInsight: RiskSignalInsightContent
}

const YEARS = ['2022', '2023', '2024', '2025', '2026'] as const

function lossYears(
  points: Array<{ incurred: number | null; onFile: boolean }>,
): RiskLossYearPoint[] {
  return YEARS.map((year, index) => ({
    year,
    incurred: points[index]?.incurred ?? null,
    onFile: points[index]?.onFile ?? false,
  }))
}

function revenueExposure(
  points: Array<{ revenue: number; exposure: number }>,
): RiskRevenueExposurePoint[] {
  return YEARS.map((year, index) => ({
    year,
    revenue: points[index]?.revenue ?? 0,
    exposure: points[index]?.exposure ?? 0,
  }))
}

/** Curated Ready submissions — distinct chart + insight stories. */
const RISK_SIGNALS_BY_SUBMISSION: Record<string, SubmissionRiskSignals> = {
  // Incomplete loss depth + revenue outpacing schedule
  'SUB-00123': {
    lossYears: lossYears([
      { incurred: 42000, onFile: true },
      { incurred: 31000, onFile: true },
      { incurred: null, onFile: false },
      { incurred: null, onFile: false },
      { incurred: null, onFile: false },
    ]),
    revenueExposure: revenueExposure([
      { revenue: 4.2, exposure: 4.0 },
      { revenue: 5.1, exposure: 4.2 },
      { revenue: 6.8, exposure: 4.4 },
      { revenue: 8.9, exposure: 4.7 },
      { revenue: 11.4, exposure: 5.0 },
    ]),
    lossInsight: {
      title: '3-year minimum · 2 on file',
      body: '2 of 3 required years on file — limited depth',
      status: 'negative',
    },
    revenueInsight: {
      title: 'Revenue +171% vs exposure +25%',
      body: 'Growth outpacing schedule',
      status: 'negative',
    },
  },

  // Clean loss run; hospitality revenue seasonality with tracking exposure
  'SUB-00120': {
    lossYears: lossYears([
      { incurred: 18500, onFile: true },
      { incurred: 14200, onFile: true },
      { incurred: 9800, onFile: true },
      { incurred: 7600, onFile: true },
      { incurred: 6100, onFile: true },
    ]),
    revenueExposure: revenueExposure([
      { revenue: 12.4, exposure: 11.8 },
      { revenue: 13.1, exposure: 12.4 },
      { revenue: 15.8, exposure: 14.9 },
      { revenue: 14.2, exposure: 13.6 },
      { revenue: 16.5, exposure: 15.8 },
    ]),
    lossInsight: {
      title: '5-year loss run · declining severity',
      body: 'Incurred trend down 67% since 2022 — favorable loss development',
      status: 'positive',
    },
    revenueInsight: {
      title: 'Seasonal occupancy · exposure tracking',
      body: 'Q3 revenue spike matched by schedule updates within 6%',
      status: 'neutral',
    },
  },

  // Stable inland marine — both signals healthy
  'SUB-00118': {
    lossYears: lossYears([
      { incurred: 4200, onFile: true },
      { incurred: 0, onFile: true },
      { incurred: 2800, onFile: true },
      { incurred: 1100, onFile: true },
      { incurred: 0, onFile: true },
    ]),
    revenueExposure: revenueExposure([
      { revenue: 2.1, exposure: 2.0 },
      { revenue: 2.2, exposure: 2.1 },
      { revenue: 2.35, exposure: 2.3 },
      { revenue: 2.4, exposure: 2.35 },
      { revenue: 2.5, exposure: 2.45 },
    ]),
    lossInsight: {
      title: '5-year history · light severity',
      body: 'Two zero-loss years on file — inland marine schedule looks stable',
      status: 'positive',
    },
    revenueInsight: {
      title: 'Revenue and exposure aligned',
      body: 'Schedule keeps pace with modest cargo growth (+19% vs +22%)',
      status: 'positive',
    },
  },

  // Complete loss years with one spike; well-scheduled professional
  'SUB-00116': {
    lossYears: lossYears([
      { incurred: 8500, onFile: true },
      { incurred: 9200, onFile: true },
      { incurred: 64000, onFile: true },
      { incurred: 11000, onFile: true },
      { incurred: 7800, onFile: true },
    ]),
    revenueExposure: revenueExposure([
      { revenue: 8.4, exposure: 8.6 },
      { revenue: 8.7, exposure: 8.9 },
      { revenue: 9.1, exposure: 9.4 },
      { revenue: 9.3, exposure: 9.7 },
      { revenue: 9.6, exposure: 10.1 },
    ]),
    lossInsight: {
      title: '2024 severity spike · otherwise clean',
      body: 'One large claim year on an otherwise light professional book',
      status: 'neutral',
    },
    revenueInsight: {
      title: 'Exposure ahead of revenue',
      body: 'Schedule limits run +5–8% above revenue — conservative adequacy',
      status: 'positive',
    },
  },

  // Thin loss file; moderate divergence
  'SUB-00115': {
    lossYears: lossYears([
      { incurred: 22000, onFile: true },
      { incurred: null, onFile: false },
      { incurred: null, onFile: false },
      { incurred: null, onFile: false },
      { incurred: null, onFile: false },
    ]),
    revenueExposure: revenueExposure([
      { revenue: 3.2, exposure: 3.4 },
      { revenue: 3.8, exposure: 3.6 },
      { revenue: 4.9, exposure: 3.9 },
      { revenue: 6.1, exposure: 4.2 },
      { revenue: 7.4, exposure: 4.5 },
    ]),
    lossInsight: {
      title: '3-year minimum · 1 on file',
      body: 'Only 2022 submitted — request prior carrier loss runs',
      status: 'negative',
    },
    revenueInsight: {
      title: 'Revenue +131% vs exposure +32%',
      body: 'Property TIV lagging unit growth — schedule refresh needed',
      status: 'negative',
    },
  },

  // Small BOP — quiet and aligned
  'SUB-00113': {
    lossYears: lossYears([
      { incurred: 0, onFile: true },
      { incurred: 1200, onFile: true },
      { incurred: 0, onFile: true },
      { incurred: 450, onFile: true },
      { incurred: 0, onFile: true },
    ]),
    revenueExposure: revenueExposure([
      { revenue: 0.85, exposure: 0.9 },
      { revenue: 0.9, exposure: 0.92 },
      { revenue: 0.95, exposure: 0.98 },
      { revenue: 1.0, exposure: 1.02 },
      { revenue: 1.05, exposure: 1.08 },
    ]),
    lossInsight: {
      title: '5-year history · near-zero activity',
      body: 'Three clean years and two small attritional hits — quiet BOP profile',
      status: 'positive',
    },
    revenueInsight: {
      title: 'Schedule keeps pace',
      body: 'Exposure tracks revenue within 3% across the period',
      status: 'positive',
    },
  },
}

const FALLBACK_PROFILES: SubmissionRiskSignals[] = [
  {
    lossYears: lossYears([
      { incurred: 15000, onFile: true },
      { incurred: 21000, onFile: true },
      { incurred: 12000, onFile: true },
      { incurred: null, onFile: false },
      { incurred: null, onFile: false },
    ]),
    revenueExposure: revenueExposure([
      { revenue: 5.0, exposure: 4.8 },
      { revenue: 5.4, exposure: 5.0 },
      { revenue: 6.2, exposure: 5.3 },
      { revenue: 7.1, exposure: 5.6 },
      { revenue: 8.0, exposure: 5.9 },
    ]),
    lossInsight: {
      title: '3-year minimum · 3 on file',
      body: 'Required years present — 2025–26 still outstanding',
      status: 'neutral',
    },
    revenueInsight: {
      title: 'Revenue +60% vs exposure +23%',
      body: 'Growth ahead of schedule — confirm values refresh',
      status: 'negative',
    },
  },
  {
    lossYears: lossYears([
      { incurred: 8000, onFile: true },
      { incurred: 6500, onFile: true },
      { incurred: 5400, onFile: true },
      { incurred: 4100, onFile: true },
      { incurred: 3800, onFile: true },
    ]),
    revenueExposure: revenueExposure([
      { revenue: 6.5, exposure: 6.6 },
      { revenue: 6.8, exposure: 6.9 },
      { revenue: 7.0, exposure: 7.2 },
      { revenue: 7.3, exposure: 7.5 },
      { revenue: 7.6, exposure: 7.9 },
    ]),
    lossInsight: {
      title: '5-year improving severity',
      body: 'Incurred trend steadily down — supportive loss history',
      status: 'positive',
    },
    revenueInsight: {
      title: 'Exposure slightly ahead',
      body: 'Schedule maintains a small cushion over revenue',
      status: 'positive',
    },
  },
  {
    lossYears: lossYears([
      { incurred: 55000, onFile: true },
      { incurred: null, onFile: false },
      { incurred: 28000, onFile: true },
      { incurred: null, onFile: false },
      { incurred: null, onFile: false },
    ]),
    revenueExposure: revenueExposure([
      { revenue: 2.8, exposure: 3.0 },
      { revenue: 3.5, exposure: 3.1 },
      { revenue: 4.4, exposure: 3.2 },
      { revenue: 5.6, exposure: 3.4 },
      { revenue: 6.9, exposure: 3.6 },
    ]),
    lossInsight: {
      title: 'Fragmented loss file · 2 years',
      body: 'Gaps in 2023 and 2025 — producer follow-up required',
      status: 'negative',
    },
    revenueInsight: {
      title: 'Revenue +146% vs exposure +20%',
      body: 'Material schedule lag relative to growth',
      status: 'negative',
    },
  },
]

function hashSubmissionNumber(submissionNumber: string): number {
  let hash = 0
  for (let i = 0; i < submissionNumber.length; i += 1) {
    hash = (hash * 31 + submissionNumber.charCodeAt(i)) >>> 0
  }
  return hash
}

export function getSubmissionRiskSignals(submissionNumber: string): SubmissionRiskSignals {
  const curated = RISK_SIGNALS_BY_SUBMISSION[submissionNumber]
  if (curated) return curated

  const index = hashSubmissionNumber(submissionNumber) % FALLBACK_PROFILES.length
  return FALLBACK_PROFILES[index] ?? FALLBACK_PROFILES[0]
}

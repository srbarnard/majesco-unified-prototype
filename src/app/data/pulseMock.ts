import type { RecentActivityItem, RecentActivityKind } from '@/app/data/homeMock'
import { getActivityDayGroup } from '@/app/data/homeMock'

export type PulseFilter = 'renewals' | 'quotes' | 'claims' | 'endorsements' | 'tasks'

export type PulseRange = '30D' | '90D' | '6M'

export const PULSE_RANGES: Array<{ id: PulseRange; label: string; days: number }> = [
  { id: '30D', label: '30D', days: 30 },
  { id: '90D', label: '90D', days: 90 },
  { id: '6M', label: '6M', days: 180 },
]

export const PULSE_RANGE_DAYS: Record<PulseRange, number> = {
  '30D': 30,
  '90D': 90,
  '6M': 180,
}

export const PULSE_FILTERS: Array<{ id: PulseFilter; label: string }> = [
  { id: 'renewals', label: 'Renewals' },
  { id: 'quotes', label: 'Quotes' },
  { id: 'claims', label: 'Claims' },
  { id: 'endorsements', label: 'Endorsements' },
  { id: 'tasks', label: 'Tasks' },
]

export const PULSE_ACTIVITY_HEADINGS: Record<PulseFilter, string> = {
  renewals: 'Recent renewals',
  quotes: 'Recent quotes',
  claims: 'Recent claims',
  endorsements: 'Recent endorsements',
  tasks: 'Recent tasks',
}

export type PulseTimePoint = {
  label: string
  value: number
}

export type PulseDualPoint = {
  label: string
  primary: number
  secondary: number
}

/** Lookahead renewals seed: expiring (high/lumpy) vs quoted/in progress (lower, uneven catch-up). */
export const pulseRenewalsChart: PulseDualPoint[] = [
  { label: 'W1', primary: 720, secondary: 310 },
  { label: 'W2', primary: 910, secondary: 360 },
  { label: 'W3', primary: 640, secondary: 420 },
  { label: 'W4', primary: 1050, secondary: 390 },
  { label: 'W5', primary: 780, secondary: 510 },
  { label: 'W6', primary: 680, secondary: 560 },
  { label: 'W7', primary: 980, secondary: 470 },
  { label: 'W8', primary: 820, secondary: 640 },
  { label: 'W9', primary: 590, secondary: 580 },
  { label: 'W10', primary: 1120, secondary: 520 },
  { label: 'W11', primary: 860, secondary: 710 },
  { label: 'W12', primary: 740, secondary: 690 },
  { label: 'W13', primary: 990, secondary: 610 },
  { label: 'W14', primary: 670, secondary: 630 },
  { label: 'W15', primary: 1080, secondary: 540 },
  { label: 'W16', primary: 800, secondary: 720 },
  { label: 'W17', primary: 730, secondary: 680 },
  { label: 'W18', primary: 940, secondary: 590 },
  { label: 'W19', primary: 610, secondary: 570 },
  { label: 'W20', primary: 1010, secondary: 650 },
  { label: 'W21', primary: 850, secondary: 760 },
  { label: 'W22', primary: 700, secondary: 640 },
  { label: 'W23', primary: 960, secondary: 580 },
  { label: 'W24', primary: 790, secondary: 710 },
  { label: 'W25', primary: 880, secondary: 660 },
  { label: 'W26', primary: 1020, secondary: 620 },
]

export const pulseQuotesChart: PulseDualPoint[] = [
  { label: 'Apr', primary: 820, secondary: 640 },
  { label: 'May', primary: 910, secondary: 720 },
  { label: 'Jun', primary: 880, secondary: 760 },
  { label: 'Jul', primary: 1020, secondary: 840 },
  { label: 'Aug', primary: 960, secondary: 790 },
  { label: 'Sep', primary: 1080, secondary: 860 },
]

export const pulseClaimsChart: PulseTimePoint[] = [
  { label: 'Aug 4', value: 2 },
  { label: 'Aug 8', value: 1 },
  { label: 'Aug 12', value: 3 },
  { label: 'Aug 16', value: 2 },
  { label: 'Aug 20', value: 4 },
  { label: 'Aug 24', value: 1 },
  { label: 'Aug 28', value: 3 },
  { label: 'Sep 1', value: 2 },
]

export const pulseEndorsementsChart: PulseTimePoint[] = [
  { label: 'Aug 4', value: 5 },
  { label: 'Aug 8', value: 3 },
  { label: 'Aug 12', value: 6 },
  { label: 'Aug 16', value: 4 },
  { label: 'Aug 20', value: 7 },
  { label: 'Aug 24', value: 5 },
  { label: 'Aug 28', value: 8 },
  { label: 'Sep 1', value: 6 },
]

export const pulseTasksChart: PulseDualPoint[] = [
  { label: 'Aug 4', primary: 14, secondary: 11 },
  { label: 'Aug 8', primary: 12, secondary: 10 },
  { label: 'Aug 12', primary: 16, secondary: 13 },
  { label: 'Aug 16', primary: 11, secondary: 12 },
  { label: 'Aug 20', primary: 18, secondary: 15 },
  { label: 'Aug 24', primary: 13, secondary: 14 },
  { label: 'Aug 28', primary: 15, secondary: 16 },
  { label: 'Sep 1', primary: 17, secondary: 14 },
]

const pulseKindsByFilter: Record<PulseFilter, RecentActivityKind[]> = {
  renewals: ['renewal'],
  quotes: ['quote'],
  claims: ['claim'],
  endorsements: ['endorsement'],
  tasks: ['task'],
}

/** Extended activity pool for Pulse list rows (max 5 per chip). */
export const pulseActivityMock: RecentActivityItem[] = [
  {
    id: 'pa-1',
    kind: 'renewal',
    label: 'Renewal quote sent',
    detail: '2026 package emailed to producer for Red Oak Hospitality Group',
    timestamp: 'Today · 8:15 AM',
    referenceId: 'RNW-2026-118902',
    status: 'Sent to producer',
    statusVariant: 'info',
    performedBy: 'Renewal Agent · Automated',
    insuredName: 'Red Oak Hospitality Group',
    policyNumber: '01-CP-000017810-0',
    summary: '',
    fields: [],
    insights: [],
  },
  {
    id: 'pa-2',
    kind: 'renewal',
    label: 'Renewal pricing approved',
    detail: 'Silverline Manufacturing rate locked for Aug 15 effective',
    timestamp: 'Today · 11:20 AM',
    referenceId: 'RNW-2026-118710',
    status: 'Approved',
    statusVariant: 'success',
    performedBy: 'James Ortiz · Underwriting',
    insuredName: 'Silverline Manufacturing Co.',
    policyNumber: '01-CP-000017813-0',
    summary: '',
    fields: [],
    insights: [],
  },
  {
    id: 'pa-3',
    kind: 'renewal',
    label: 'Renewal task created',
    detail: 'Midwest Fabrication submission prep assigned to underwriting',
    timestamp: 'Yesterday · 9:05 AM',
    referenceId: 'RNW-2026-118501',
    status: 'Open',
    statusVariant: 'info',
    performedBy: 'System',
    insuredName: 'Midwest Fabrication Inc.',
    policyNumber: '01-CP-000017809-0',
    summary: '',
    fields: [],
    insights: [],
  },
  {
    id: 'pa-4',
    kind: 'renewal',
    label: 'Renewal notice delivered',
    detail: 'Horizon Fleet Services received 60-day non-renewal notice',
    timestamp: 'Yesterday · 3:40 PM',
    referenceId: 'RNW-2026-117902',
    status: 'Delivered',
    statusVariant: 'info',
    performedBy: 'Renewal Agent · Automated',
    insuredName: 'Horizon Fleet Services LLC',
    policyNumber: '01-CA-000100012-0',
    summary: '',
    fields: [],
    insights: [],
  },
  {
    id: 'pa-5',
    kind: 'renewal',
    label: 'Renewal loss runs requested',
    detail: 'Carrier loss runs queued for Keystone Commercial Realty',
    timestamp: 'Yesterday · 1:10 PM',
    referenceId: 'RNW-2026-117801',
    status: 'Pending',
    statusVariant: 'warning',
    performedBy: 'Sarah Chen · Underwriting',
    insuredName: 'Keystone Commercial Realty',
    policyNumber: '01-BP-000028511-0',
    summary: '',
    fields: [],
    insights: [],
  },
  {
    id: 'pa-6',
    kind: 'quote',
    label: 'Quote bound',
    detail: 'Summit Outdoor Equipment new business issued as 01-GL-000031902-0',
    timestamp: 'Today · 10:05 AM',
    referenceId: 'Q-2026-77102',
    status: 'Bound',
    statusVariant: 'success',
    performedBy: 'Emily Tran · Underwriting',
    insuredName: 'Summit Outdoor Equipment Inc.',
    policyNumber: '01-GL-000031902-0',
    quoteNumber: 'Q-2026-77102',
    summary: '',
    fields: [],
    insights: [],
  },
  {
    id: 'pa-7',
    kind: 'quote',
    label: 'Quote referred',
    detail: 'Cascade Transport package escalated for senior review',
    timestamp: 'Yesterday · 3:40 PM',
    referenceId: 'Q-2026-77088',
    status: 'Referred',
    statusVariant: 'warning',
    performedBy: 'Sarah Chen · Underwriting',
    insuredName: 'Cascade Transport Services',
    quoteNumber: 'Q-2026-77088',
    summary: '',
    fields: [],
    insights: [],
  },
  {
    id: 'pa-8',
    kind: 'quote',
    label: 'Quote presented',
    detail: 'Indication delivered to Marcus Webb for Atlantic Ridge Construction',
    timestamp: 'Aug 29, 2026',
    referenceId: 'Q-2026-77012',
    status: 'Presented',
    statusVariant: 'info',
    performedBy: 'Marcus Webb · Producer',
    insuredName: 'Atlantic Ridge Construction LLC',
    quoteNumber: 'Q-2026-77012',
    summary: '',
    fields: [],
    insights: [],
  },
  {
    id: 'pa-9',
    kind: 'quote',
    label: 'Quote draft saved',
    detail: 'Northshore Medical Group draft retained with open rating questions',
    timestamp: 'Aug 26, 2026',
    referenceId: 'Q-2026-76990',
    status: 'Draft',
    statusVariant: 'info',
    performedBy: 'Emily Tran · Underwriting',
    insuredName: 'Northshore Medical Group P.C.',
    quoteNumber: 'Q-2026-76990',
    summary: '',
    fields: [],
    insights: [],
  },
  {
    id: 'pa-10',
    kind: 'quote',
    label: 'Quote pending issuance',
    detail: 'Blue Harbor Logistics awaiting booking confirmation',
    timestamp: 'Aug 20, 2026',
    referenceId: 'Q-2026-76901',
    status: 'Pending issuance',
    statusVariant: 'warning',
    performedBy: 'System',
    insuredName: 'Blue Harbor Logistics Inc.',
    quoteNumber: 'Q-2026-76901',
    summary: '',
    fields: [],
    insights: [],
  },
  {
    id: 'pa-11',
    kind: 'claim',
    label: 'Claim note added',
    detail: 'Repair estimate uploaded for fleet unit 14 on 01-CA-000100005-0',
    timestamp: 'Today · 9:18 AM',
    referenceId: 'CLM-2026-004412',
    status: 'In progress',
    statusVariant: 'warning',
    performedBy: 'Lisa Park · Claims adjuster',
    insuredName: 'Atlantic Ridge Construction LLC',
    policyNumber: '01-CA-000100005-0',
    claimNumber: 'CLM-2026-004412',
    summary: '',
    fields: [],
    insights: [],
  },
  {
    id: 'pa-12',
    kind: 'claim',
    label: 'Claim opened',
    detail: 'FNOL logged for rear-end collision involving fleet unit 14',
    timestamp: 'Yesterday · 2:05 PM',
    referenceId: 'CLM-2026-004401',
    status: 'Open',
    statusVariant: 'info',
    performedBy: 'Producer portal',
    insuredName: 'Atlantic Ridge Construction LLC',
    claimNumber: 'CLM-2026-004401',
    summary: '',
    fields: [],
    insights: [],
  },
  {
    id: 'pa-13',
    kind: 'claim',
    label: 'Claim reserve updated',
    detail: 'Reserve raised to $22,000 on CLM-2026-004412',
    timestamp: 'Aug 28, 2026',
    referenceId: 'CLM-2026-004412',
    status: 'In progress',
    statusVariant: 'warning',
    performedBy: 'Lisa Park · Claims adjuster',
    insuredName: 'Atlantic Ridge Construction LLC',
    claimNumber: 'CLM-2026-004412',
    summary: '',
    fields: [],
    insights: [],
  },
  {
    id: 'pa-14',
    kind: 'claim',
    label: 'Claim assigned',
    detail: 'Northstar Retail Partners property claim routed to regional adjuster',
    timestamp: 'Aug 25, 2026',
    referenceId: 'CLM-2026-004380',
    status: 'Assigned',
    statusVariant: 'info',
    performedBy: 'Claims Triage Agent',
    insuredName: 'Northstar Retail Partners',
    claimNumber: 'CLM-2026-004380',
    summary: '',
    fields: [],
    insights: [],
  },
  {
    id: 'pa-15',
    kind: 'claim',
    label: 'Claim closed',
    detail: 'Midwest Fabrication glass-only claim closed with no payment',
    timestamp: 'Aug 18, 2026',
    referenceId: 'CLM-2026-004210',
    status: 'Closed',
    statusVariant: 'success',
    performedBy: 'Adjuster · Field',
    insuredName: 'Midwest Fabrication Inc.',
    claimNumber: 'CLM-2026-004210',
    summary: '',
    fields: [],
    insights: [],
  },
  {
    id: 'pa-16',
    kind: 'endorsement',
    label: 'Endorsement issued',
    detail: 'Vehicle added to Commercial Auto 01-CA-000100005-0 for Atlantic Ridge',
    timestamp: 'Today · 9:42 AM',
    referenceId: 'END-2026-004821',
    status: 'Issued',
    statusVariant: 'success',
    performedBy: 'Sarah Chen · Underwriting',
    insuredName: 'Atlantic Ridge Construction LLC',
    policyNumber: '01-CA-000100005-0',
    summary: '',
    fields: [],
    insights: [],
  },
  {
    id: 'pa-17',
    kind: 'endorsement',
    label: 'Endorsement quoted',
    detail: 'Additional insured endorsement priced for Keystone Commercial Realty',
    timestamp: 'Yesterday · 4:10 PM',
    referenceId: 'END-2026-004710',
    status: 'Quoted',
    statusVariant: 'info',
    performedBy: 'Emily Tran · Underwriting',
    insuredName: 'Keystone Commercial Realty',
    policyNumber: '01-BP-000028511-0',
    summary: '',
    fields: [],
    insights: [],
  },
  {
    id: 'pa-18',
    kind: 'endorsement',
    label: 'Endorsement pending',
    detail: 'Horizon Fleet driver add awaiting inspection clearance',
    timestamp: 'Aug 27, 2026',
    referenceId: 'END-2026-004680',
    status: 'Pending',
    statusVariant: 'warning',
    performedBy: 'Producer portal',
    insuredName: 'Horizon Fleet Services LLC',
    policyNumber: '01-CA-000100012-0',
    summary: '',
    fields: [],
    insights: [],
  },
  {
    id: 'pa-19',
    kind: 'endorsement',
    label: 'Endorsement bound',
    detail: 'Garaging change bound for Northstar Retail Partners',
    timestamp: 'Aug 23, 2026',
    referenceId: 'END-2026-004650',
    status: 'Bound',
    statusVariant: 'success',
    performedBy: 'Policy Admin · System',
    insuredName: 'Northstar Retail Partners',
    policyNumber: '01-BP-000028511-0',
    summary: '',
    fields: [],
    insights: [],
  },
  {
    id: 'pa-20',
    kind: 'endorsement',
    label: 'Endorsement declined',
    detail: 'Coverage limit increase declined for Summit Outdoor Equipment',
    timestamp: 'Aug 19, 2026',
    referenceId: 'END-2026-004620',
    status: 'Declined',
    statusVariant: 'error',
    performedBy: 'Sarah Chen · Underwriting',
    insuredName: 'Summit Outdoor Equipment Inc.',
    policyNumber: '01-GL-000031902-0',
    summary: '',
    fields: [],
    insights: [],
  },
  {
    id: 'pa-21',
    kind: 'task',
    label: 'Task completed',
    detail: 'Review Loss Runs closed for Midwest Fabrication Inc.',
    timestamp: 'Yesterday · 4:30 PM',
    referenceId: 'TSK-2026-77204',
    status: 'Completed',
    statusVariant: 'success',
    performedBy: 'James Ortiz · Underwriting',
    insuredName: 'Midwest Fabrication Inc.',
    policyNumber: '01-GL-000009881-0',
    summary: '',
    fields: [],
    insights: [],
  },
  {
    id: 'pa-22',
    kind: 'task',
    label: 'Task assigned',
    detail: 'Bind endorsement routed to Northshore Medical Group desk',
    timestamp: 'Today · 7:50 AM',
    referenceId: 'TSK-2026-77218',
    status: 'Open',
    statusVariant: 'info',
    performedBy: 'System',
    insuredName: 'Northshore Medical Group P.C.',
    policyNumber: '01-CA-000100009-0',
    summary: '',
    fields: [],
    insights: [],
  },
  {
    id: 'pa-23',
    kind: 'task',
    label: 'Task overdue',
    detail: 'Review Loss Runs past due on Midwest Fabrication renewal',
    timestamp: 'Yesterday · 8:00 AM',
    referenceId: 'TSK-2026-77190',
    status: 'Past due',
    statusVariant: 'error',
    performedBy: 'System',
    insuredName: 'Midwest Fabrication Inc.',
    policyNumber: '01-CP-000017809-0',
    summary: '',
    fields: [],
    insights: [],
  },
  {
    id: 'pa-24',
    kind: 'task',
    label: 'Task created',
    detail: 'Verify additional insured certificate for Keystone Commercial Realty',
    timestamp: 'Aug 27, 2026',
    referenceId: 'TSK-2026-77150',
    status: 'Open',
    statusVariant: 'info',
    performedBy: 'Sarah Chen · Underwriting',
    insuredName: 'Keystone Commercial Realty',
    policyNumber: '01-BP-000028511-0',
    summary: '',
    fields: [],
    insights: [],
  },
  {
    id: 'pa-25',
    kind: 'task',
    label: 'Task completed',
    detail: 'Inspection follow-up closed for Horizon Fleet Services',
    timestamp: 'Aug 21, 2026',
    referenceId: 'TSK-2026-77120',
    status: 'Completed',
    statusVariant: 'success',
    performedBy: 'Field Ops',
    insuredName: 'Horizon Fleet Services LLC',
    policyNumber: '01-CA-000100012-0',
    summary: '',
    fields: [],
    insights: [],
  },
  {
    id: 'pa-26',
    kind: 'policy',
    label: 'Policy updated',
    detail: 'Garaging address change posted to 01-BP-000028511-0',
    timestamp: 'Aug 24, 2026',
    referenceId: 'POL-CHG-2026-55102',
    status: 'Posted',
    statusVariant: 'info',
    performedBy: 'Policy Admin · System',
    insuredName: 'Northstar Retail Partners',
    policyNumber: '01-BP-000028511-0',
    summary: '',
    fields: [],
    insights: [],
  },
  {
    id: 'pa-27',
    kind: 'document',
    label: 'Document uploaded',
    detail: 'Updated fleet schedule received for policy 01-CP-000017809-0',
    timestamp: 'Yesterday · 2:10 PM',
    referenceId: 'DOC-2026-33901',
    status: 'Received',
    statusVariant: 'info',
    performedBy: 'Producer portal · Self-service',
    insuredName: 'Cascade Transport Services',
    policyNumber: '01-CP-000017809-0',
    summary: '',
    fields: [],
    insights: [],
  },
]

const pulseActivityTiming: Record<string, { daysAgo?: number; daysAhead?: number }> = {
  // Renewals — recent Today / Yesterday for ActivityRail
  'pa-1': { daysAgo: 0 },
  'pa-2': { daysAgo: 0 },
  'pa-3': { daysAgo: 1 },
  'pa-4': { daysAgo: 1 },
  'pa-5': { daysAgo: 1 },
  'pa-26': { daysAgo: 9 },
  // Quotes — all within 30D so every range has 5 rows
  'pa-6': { daysAgo: 0 },
  'pa-7': { daysAgo: 1 },
  'pa-8': { daysAgo: 4 },
  'pa-9': { daysAgo: 7 },
  'pa-10': { daysAgo: 13 },
  // Claims — all within 30D
  'pa-11': { daysAgo: 0 },
  'pa-12': { daysAgo: 1 },
  'pa-13': { daysAgo: 5 },
  'pa-14': { daysAgo: 8 },
  'pa-15': { daysAgo: 15 },
  // Endorsements — all within 30D
  'pa-16': { daysAgo: 0 },
  'pa-17': { daysAgo: 1 },
  'pa-18': { daysAgo: 6 },
  'pa-19': { daysAgo: 10 },
  'pa-20': { daysAgo: 14 },
  // Tasks — all within 30D
  'pa-21': { daysAgo: 1 },
  'pa-22': { daysAgo: 0 },
  'pa-23': { daysAgo: 1 },
  'pa-24': { daysAgo: 6 },
  'pa-25': { daysAgo: 12 },
  // Misc for All mix
  'pa-27': { daysAgo: 1 },
}

function lookbackPointCount(range: PulseRange): number {
  switch (range) {
    case '30D':
      return 7
    case '90D':
      return 21
    case '6M':
      return 42
  }
}

function renewalsWeekCount(range: PulseRange): number {
  switch (range) {
    case '30D':
      return 5
    case '90D':
      return 13
    case '6M':
      return 26
  }
}

function quotesPointCount(range: PulseRange): number {
  switch (range) {
    case '30D':
      return 8
    case '90D':
      return 16
    case '6M':
      return 26
  }
}

function buildQuotesSeries(range: PulseRange): PulseDualPoint[] {
  const pointCount = quotesPointCount(range)
  const stepDays = range === '6M' ? 7 : range === '90D' ? 5 : 4
  const anchor = new Date(2026, 8, 1)
  const seed = pulseQuotesChart
  const full: PulseDualPoint[] = []

  for (let i = pointCount - 1; i >= 0; i -= 1) {
    const d = new Date(anchor)
    d.setDate(d.getDate() - i * stepDays)
    const seedPoint = seed[i % seed.length]
    full.push({
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      primary: Math.max(120, seedPoint.primary + ((pointCount - i) % 5) * 18 - 20),
      secondary: Math.max(90, seedPoint.secondary + ((pointCount - i) % 4) * 14 - 12),
    })
  }

  return full
}

function buildLookbackSeries(seed: PulseTimePoint[], range: PulseRange): PulseTimePoint[] {
  const pointCount = lookbackPointCount(range)
  const stepDays = 4
  const anchor = new Date(2026, 8, 1)
  const full: PulseTimePoint[] = []

  for (let i = 41; i >= 0; i -= 1) {
    const d = new Date(anchor)
    d.setDate(d.getDate() - i * stepDays)
    const seedPoint = seed[i % seed.length]
    full.push({
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.max(1, seedPoint.value + ((41 - i) % 5) - 2),
    })
  }

  return full.slice(-pointCount)
}

function buildLookbackDualSeries(seed: PulseDualPoint[], range: PulseRange): PulseDualPoint[] {
  const pointCount = lookbackPointCount(range)
  const stepDays = 4
  const anchor = new Date(2026, 8, 1)
  const full: PulseDualPoint[] = []

  for (let i = 41; i >= 0; i -= 1) {
    const d = new Date(anchor)
    d.setDate(d.getDate() - i * stepDays)
    const seedPoint = seed[i % seed.length]
    full.push({
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      primary: Math.max(1, seedPoint.primary + ((41 - i) % 4) - 1),
      secondary: Math.max(1, seedPoint.secondary + ((41 - i) % 3) - 1),
    })
  }

  return full.slice(-pointCount)
}

function buildRenewalsSeries(range: PulseRange): PulseDualPoint[] {
  const weekCount = renewalsWeekCount(range)
  const start = new Date(2026, 8, 8)
  const seed = pulseRenewalsChart

  return Array.from({ length: weekCount }, (_, weekIndex) => {
    const d = new Date(start)
    d.setDate(d.getDate() + weekIndex * 7)
    const point = seed[weekIndex % seed.length]
    return {
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      primary: point.primary,
      secondary: Math.min(point.secondary, point.primary - 20),
    }
  })
}

export type PulseChartData =
  | { kind: 'time'; data: PulseTimePoint[]; yLabel: string }
  | {
      kind: 'dual'
      data: PulseDualPoint[]
      primaryLabel: string
      secondaryLabel: string
      yFormatter: (v: number) => string
      showGap?: boolean
    }

export function getPulseChartData(filter: PulseFilter, range: PulseRange): PulseChartData {
  switch (filter) {
    case 'renewals':
      return {
        kind: 'dual',
        data: buildRenewalsSeries(range),
        primaryLabel: 'Expiring premium',
        secondaryLabel: 'Already quoted / in progress',
        yFormatter: (v) => `$${v}K`,
        showGap: true,
      }
    case 'quotes':
      return {
        kind: 'dual',
        data: buildQuotesSeries(range),
        primaryLabel: 'Quoted',
        secondaryLabel: 'Bound',
        yFormatter: (v) => `$${v}K`,
      }
    case 'claims':
      return { kind: 'time', data: buildLookbackSeries(pulseClaimsChart, range), yLabel: 'New claims' }
    case 'endorsements':
      return {
        kind: 'time',
        data: buildLookbackSeries(pulseEndorsementsChart, range),
        yLabel: 'Endorsements',
      }
    case 'tasks':
      return {
        kind: 'dual',
        data: buildLookbackDualSeries(pulseTasksChart, range),
        primaryLabel: 'Opened',
        secondaryLabel: 'Completed',
        yFormatter: (v) => `${v}`,
      }
  }
}

function activityMatchesRange(
  itemId: string,
  range: PulseRange,
  mode: 'lookback' | 'lookahead',
): boolean {
  const timing = pulseActivityTiming[itemId]
  if (!timing) return true
  const maxDays = PULSE_RANGE_DAYS[range]

  if (mode === 'lookback') {
    return (timing.daysAgo ?? Infinity) <= maxDays
  }

  if (timing.daysAhead !== undefined) {
    return timing.daysAhead <= maxDays
  }
  return (timing.daysAgo ?? Infinity) <= Math.min(maxDays, 14)
}

function sortActivities(items: RecentActivityItem[], mode: 'lookback' | 'lookahead'): RecentActivityItem[] {
  return [...items].sort((a, b) => {
    const ta = pulseActivityTiming[a.id]
    const tb = pulseActivityTiming[b.id]
    if (mode === 'lookahead') {
      const aa = ta?.daysAhead ?? ta?.daysAgo ?? 999
      const ab = tb?.daysAhead ?? tb?.daysAgo ?? 999
      return aa - ab
    }
    return (ta?.daysAgo ?? 999) - (tb?.daysAgo ?? 999)
  })
}

export function getPulseActivities(filter: PulseFilter, range: PulseRange, limit = 5): RecentActivityItem[] {
  const mode = filter === 'renewals' ? 'lookahead' : 'lookback'
  const kinds = pulseKindsByFilter[filter]
  const items = pulseActivityMock.filter(
    (item) => kinds.includes(item.kind) && activityMatchesRange(item.id, range, mode),
  )

  return sortActivities(items, mode).slice(0, limit)
}

/** Home ActivityRail: Today / Yesterday items for the selected chart chip (max 6). */
export function getPulseRailActivities(filter: PulseFilter, limit = 6): RecentActivityItem[] {
  const kinds = pulseKindsByFilter[filter]
  const scoped = pulseActivityMock.filter((item) => kinds.includes(item.kind))

  const today = scoped.filter((item) => getActivityDayGroup(item.timestamp) === 'Today')
  const yesterday = scoped.filter((item) => getActivityDayGroup(item.timestamp) === 'Yesterday')
  const earlier = scoped.filter((item) => getActivityDayGroup(item.timestamp) === 'Earlier')

  return [...today, ...yesterday, ...earlier].slice(0, limit)
}

export function formatPulseTimestamp(timestamp: string): string {
  if (timestamp.startsWith('Today · ')) {
    return timestamp.replace('Today · ', '')
  }
  if (timestamp.startsWith('Yesterday · ')) {
    return timestamp.replace('Yesterday · ', '')
  }
  if (timestamp.startsWith('Yesterday')) {
    return 'Yesterday'
  }
  const match = timestamp.match(/^([A-Za-z]{3} \d{1,2})/)
  return match ? match[1] : timestamp
}

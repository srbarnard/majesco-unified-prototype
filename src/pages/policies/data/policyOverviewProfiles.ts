import type { PulseRange } from '@/app/data/pulseMock'
import type { InsightStatus } from '@/design-system/components/InsightCallout'
import type { ExposureByFips } from '@/pages/policies/components/ExposureMap'
import {
  overviewStatsMock,
  overviewTransactionsMock,
  overviewTransactionsOverTimeMock,
  type OverviewStat,
  type OverviewTimeSeriesPoint,
  type OverviewTransaction,
} from '@/pages/policies/data/mockOverview'
import { policiesListMock, type PolicyListRecord } from '@/pages/policies/data/mockPoliciesList'
import { policyDetailsMock } from '@/pages/policies/data/mockPolicyDetails'

export type PolicySignalInsight = {
  status: InsightStatus
  title: string
  body: string
}

export type ExposureRangeSnapshot = {
  fips: ExposureByFips
  insight: PolicySignalInsight
}

export type PolicyOverviewProfile = {
  policyNumber: string
  companyName: string
  productLine: string
  riskState: string
  stats: OverviewStat[]
  transactionsOverTime: OverviewTimeSeriesPoint[]
  transactions: OverviewTransaction[]
  transactionInsights: Record<PulseRange, PolicySignalInsight>
  /** Geographic exposure evolves across the Pulse date ranges. */
  exposureByRange: Record<PulseRange, ExposureRangeSnapshot>
}

function seedFromPolicyNumber(policyNumber: string) {
  return policyNumber.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
}

function productLineFromRecord(record: PolicyListRecord) {
  if (record.product.includes('Auto')) return 'Commercial Auto'
  if (record.product.includes('Package')) return 'Commercial Package'
  if (record.product.includes('Property') || record.product.includes('Owners')) return 'Business Property'
  if (record.product.includes('Workers')) return 'Workers Compensation'
  if (record.product.includes('Liability') || record.product.includes('General')) return 'General Liability'
  if (record.product.includes('Umbrella')) return 'Umbrella'
  return record.product
}

function scaleSeries(
  base: OverviewTimeSeriesPoint[],
  scale: number,
  bump: number,
): OverviewTimeSeriesPoint[] {
  return base.map((point, index) => ({
    ...point,
    value: Math.max(0, Math.round(point.value * scale + ((index + bump) % 3) - 1)),
  }))
}

function insightSet(
  positiveTitle: string,
  positiveBody: string,
  midTitle: string,
  midBody: string,
  termTitle: string,
  termBody: string,
  status: InsightStatus = 'positive',
): Record<PulseRange, PolicySignalInsight> {
  return {
    '30D': { status, title: positiveTitle, body: positiveBody },
    '90D': { status, title: midTitle, body: midBody },
    '6M': { status, title: termTitle, body: termBody },
  }
}

function scaleExposureFips(fips: ExposureByFips, factor: number): ExposureByFips {
  const next: ExposureByFips = {}
  for (const [fipsCode, row] of Object.entries(fips)) {
    const units = Math.max(1, Math.round(row.units * factor))
    const level =
      units >= 12 ? 'high' : units >= 3 ? 'medium' : ('low' as const)
    next[fipsCode] = { ...row, units, level: row.level === 'high' && units >= 8 ? 'high' : level }
  }
  return next
}

function dropSmallestSpill(fips: ExposureByFips): ExposureByFips {
  const entries = Object.entries(fips)
  if (entries.length < 3) return fips
  const sorted = [...entries].sort((a, b) => a[1].units - b[1].units)
  const [, ...keep] = sorted
  return Object.fromEntries(keep)
}

function bumpSpillUnits(fips: ExposureByFips, add: number): ExposureByFips {
  const entries = Object.entries(fips)
  if (entries.length < 2) return fips
  const sorted = [...entries].sort((a, b) => b[1].units - a[1].units)
  const primary = sorted[0]
  const spill = sorted.slice(1).map(([code, row]) => [
    code,
    {
      ...row,
      units: row.units + add,
      level: row.units + add >= 12 ? ('high' as const) : row.units + add >= 3 ? ('medium' as const) : row.level,
    },
  ])
  return Object.fromEntries([primary, ...spill])
}

/**
 * Expand a 90D exposure snapshot into 30D / 90D / 6M geography + insights.
 * Short window = tighter footprint; term window = more units / spill.
 */
function exposureByRange(
  midFips: ExposureByFips,
  midInsight: PolicySignalInsight,
  short?: Partial<PolicySignalInsight>,
  term?: Partial<PolicySignalInsight>,
): Record<PulseRange, ExposureRangeSnapshot> {
  const shortFips = dropSmallestSpill(scaleExposureFips(midFips, 0.82))
  const termFips = bumpSpillUnits(scaleExposureFips(midFips, 1.18), 1)

  return {
    '30D': {
      fips: shortFips,
      insight: {
        status: short?.status ?? midInsight.status,
        title: short?.title ?? midInsight.title.replace(/holds \d+%/, 'holds a larger share'),
        body:
          short?.body ??
          midInsight.body.replace(
            /\((\d+) units?\)/,
            (_m, n: string) => `(${Math.max(1, Math.round(Number(n) * 0.82))} units)`,
          ),
      },
    },
    '90D': { fips: midFips, insight: midInsight },
    '6M': {
      fips: termFips,
      insight: {
        status: term?.status ?? midInsight.status,
        title: term?.title ?? midInsight.title,
        body:
          term?.body ??
          midInsight.body.replace(
            /\((\d+) units?\)/,
            (_m, n: string) => `(${Math.max(1, Math.round(Number(n) * 1.18))} units)`,
          ),
      },
    },
  }
}

const ATLANTIC_PROFILE: PolicyOverviewProfile = {
  policyNumber: policyDetailsMock.policyNumber,
  companyName: policyDetailsMock.companyName,
  productLine: 'Commercial Auto',
  riskState: 'California',
  stats: overviewStatsMock,
  transactionsOverTime: overviewTransactionsOverTimeMock,
  transactions: overviewTransactionsMock,
  transactionInsights: insightSet(
    'Activity up 12% vs prior 30 days',
    'Endorsement and billing volume is ahead of last month, led by the Ford F-350 add and Q2 installment posting.',
    'Activity up 15% vs prior 90 days',
    'Transaction pace is elevated on endorsements and renewals. Watch the open claim and pending audit for premium impact.',
    'Activity up 18% vs prior term',
    'Term-to-date activity is ahead of the prior term. Most volume is in-force endorsements; one open claim remains the key watch-out.',
  ),
  exposureByRange: exposureByRange(
    {
      '06': { state: 'CA', units: 48, level: 'high' },
      '04': { state: 'AZ', units: 4, level: 'medium' },
      '32': { state: 'NV', units: 2, level: 'medium' },
    },
    {
      status: 'negative',
      title: 'California holds 89% of scheduled units',
      body: 'Garaging concentrated in CA (48 units), light spill into AZ and NV.',
    },
    {
      title: 'California holds 92% of scheduled units',
      body: 'Last 30 days: CA (39 units) dominates; AZ spill only — NV not yet on schedule.',
    },
    {
      title: 'California holds 85% of scheduled units',
      body: 'Term growth: CA (57 units) with heavier AZ/NV spill as the fleet expanded west.',
    },
  ),
}

/** Curated heroes keyed by listing policy number — distinct Overview stories. */
const CURATED_PROFILES: Record<string, PolicyOverviewProfile> = {
  [ATLANTIC_PROFILE.policyNumber]: ATLANTIC_PROFILE,

  '01-CP-000017809-0': {
    policyNumber: '01-CP-000017809-0',
    companyName: 'Midwest Fabrication Inc.',
    productLine: 'Commercial Package',
    riskState: 'Illinois',
    stats: [
      { id: 'endorsements', label: 'Endorsements', value: 2, helperText: 'Last 90 days', tone: 'success' },
      { id: 'locations', label: 'Locations', value: 3, helperText: 'IL · WI · IN', tone: 'info' },
      { id: 'pending-changes', label: 'Pending Changes', value: 1, helperText: 'Needs review', tone: 'warning' },
      { id: 'active-claims', label: 'Active Claim', value: 1, helperText: 'Open status', tone: 'error' },
    ],
    transactionsOverTime: scaleSeries(overviewTransactionsOverTimeMock, 0.7, 1),
    transactions: [
      {
        id: 'mw-1',
        type: 'Endorsement',
        description: 'Add Rockford warehouse to package schedule',
        status: 'In-Force',
        statusTone: 'success',
        premiumChange: '+$4,860.00',
        premiumDirection: 'up',
        effectiveDate: 'Jun 14, 2026',
        revision: 'Rev 3',
      },
      {
        id: 'mw-2',
        type: 'Claim',
        description: 'Machine-guarding injury — fabrication floor',
        status: 'Open',
        statusTone: 'warning',
        effectiveDate: 'Jun 2, 2026',
      },
      {
        id: 'mw-3',
        type: 'Billing',
        description: 'Installment invoice posted — Q2 package',
        status: 'In-Force',
        statusTone: 'success',
        effectiveDate: 'May 28, 2026',
        revision: 'Rev 2',
      },
      {
        id: 'mw-4',
        type: 'Inspection',
        description: 'Loss control visit — press brake guarding',
        status: 'Scheduled',
        statusTone: 'default',
        effectiveDate: 'May 12, 2026',
      },
      {
        id: 'mw-5',
        type: 'Policy Change',
        description: 'Update named insured DBA on package',
        status: 'In-Force',
        statusTone: 'success',
        effectiveDate: 'Apr 30, 2026',
        revision: 'Rev 2',
      },
      {
        id: 'mw-6',
        type: 'Certificate',
        description: 'COI issued for OEM supplier contract',
        status: 'Issued',
        statusTone: 'info',
        effectiveDate: 'Apr 18, 2026',
      },
    ],
    transactionInsights: insightSet(
      'Activity up 8% vs prior 30 days',
      'Warehouse add and billing drove recent package activity; claim remains open on the fabrication floor.',
      'Activity flat vs prior 90 days',
      'Endorsement volume is steady. Loss-control inspection is the next milestone before renewal prep.',
      'Activity down 4% vs prior term',
      'Fewer mid-term changes than last term; open claim is the primary underwriting watch-out.',
      'neutral',
    ),
    exposureByRange: exposureByRange(
      {
        '17': { state: 'IL', units: 22, level: 'high' },
        '55': { state: 'WI', units: 6, level: 'medium' },
        '18': { state: 'IN', units: 3, level: 'medium' },
      },
      {
        status: 'negative',
        title: 'Illinois holds 71% of scheduled locations',
        body: 'Package exposure concentrated in IL (22 units), with light spill into WI and IN.',
      },
    ),
  },

  '01-BP-000028506-0': {
    policyNumber: '01-BP-000028506-0',
    companyName: 'Maple Grove Property Management',
    productLine: 'Business Property',
    riskState: 'Minnesota',
    stats: [
      { id: 'buildings', label: 'Buildings', value: 12, helperText: 'On schedule', tone: 'info' },
      { id: 'endorsements', label: 'Endorsements', value: 1, helperText: 'Last 90 days', tone: 'success' },
      { id: 'pending-changes', label: 'Pending Changes', value: 4, helperText: 'Needs review', tone: 'warning' },
      { id: 'active-claims', label: 'Active Claim', value: 1, helperText: 'Water damage', tone: 'error' },
    ],
    transactionsOverTime: scaleSeries(overviewTransactionsOverTimeMock, 0.55, 2),
    transactions: [
      {
        id: 'mg-1',
        type: 'Claim',
        description: 'Water damage — Building C mechanical room',
        status: 'Open',
        statusTone: 'warning',
        effectiveDate: 'Jun 16, 2026',
      },
      {
        id: 'mg-2',
        type: 'Endorsement',
        description: 'Increase building limit — Maple Grove tower',
        status: 'Pending',
        statusTone: 'info',
        premiumChange: '+$6,200.00',
        premiumDirection: 'up',
        effectiveDate: 'Jun 9, 2026',
        revision: 'Rev 4',
      },
      {
        id: 'mg-3',
        type: 'Policy Change',
        description: 'Add sprinkler credit documentation',
        status: 'In-Force',
        statusTone: 'success',
        effectiveDate: 'May 22, 2026',
        revision: 'Rev 3',
      },
      {
        id: 'mg-4',
        type: 'Inspection',
        description: 'Property survey — roof and HVAC',
        status: 'Scheduled',
        statusTone: 'default',
        effectiveDate: 'May 8, 2026',
      },
      {
        id: 'mg-5',
        type: 'Billing',
        description: 'Escrow installment posted',
        status: 'In-Force',
        statusTone: 'success',
        effectiveDate: 'Apr 28, 2026',
      },
    ],
    transactionInsights: insightSet(
      'Activity up 6% vs prior 30 days',
      'Water claim and building-limit endorsement dominate recent activity.',
      'Activity up 11% vs prior 90 days',
      'Pending limit changes and survey work are elevating mid-term workload.',
      'Activity up 9% vs prior term',
      'Property schedule growth is outpacing last term; open water claim needs resolution before renewal.',
    ),
    exposureByRange: exposureByRange(
      {
        '27': { state: 'MN', units: 12, level: 'high' },
        '55': { state: 'WI', units: 2, level: 'medium' },
      },
      {
        status: 'negative',
        title: 'Minnesota holds 86% of building TIV',
        body: 'Schedule concentrated in MN (12 buildings), with two satellite sites in WI.',
      },
    ),
  },

  '01-CP-000017813-0': {
    policyNumber: '01-CP-000017813-0',
    companyName: 'Silverline Manufacturing Co.',
    productLine: 'Commercial Package',
    riskState: 'Ohio',
    stats: [
      { id: 'endorsements', label: 'Endorsements', value: 0, helperText: 'Last 90 days', tone: 'success' },
      { id: 'locations', label: 'Locations', value: 2, helperText: 'OH · PA', tone: 'info' },
      { id: 'pending-changes', label: 'Pending Changes', value: 0, helperText: 'Clear', tone: 'success' },
      { id: 'active-claims', label: 'Active Claim', value: 0, helperText: 'None open', tone: 'success' },
    ],
    transactionsOverTime: scaleSeries(overviewTransactionsOverTimeMock, 0.35, 0),
    transactions: [
      {
        id: 'sl-1',
        type: 'Renewal',
        description: 'Non-renewal notice drafted — product mismatch',
        status: 'Pending',
        statusTone: 'warning',
        effectiveDate: 'Jun 10, 2026',
        revision: 'Rev 1',
      },
      {
        id: 'sl-2',
        type: 'Note',
        description: 'Underwriting declined package terms — referral closed',
        status: 'Logged',
        statusTone: 'default',
        effectiveDate: 'May 30, 2026',
      },
      {
        id: 'sl-3',
        type: 'Billing',
        description: 'Final earned premium statement posted',
        status: 'In-Force',
        statusTone: 'success',
        effectiveDate: 'May 4, 2026',
      },
    ],
    transactionInsights: insightSet(
      'Activity down 22% vs prior 30 days',
      'File is quiet after decline — only administrative billing remains.',
      'Activity down 31% vs prior 90 days',
      'No endorsements or claims; non-renewal workflow is the only open thread.',
      'Activity down 40% vs prior term',
      'Declined package shows minimal mid-term motion versus last term.',
      'negative',
    ),
    exposureByRange: exposureByRange(
      {
        '39': { state: 'OH', units: 8, level: 'high' },
        '42': { state: 'PA', units: 2, level: 'medium' },
      },
      {
        status: 'neutral',
        title: 'Ohio holds 80% of package exposure',
        body: 'Primary plant in OH with a secondary PA distribution site.',
      },
    ),
  },

  '01-CA-000100009-0': {
    policyNumber: '01-CA-000100009-0',
    companyName: 'Northshore Medical Group, P.C.',
    productLine: 'Commercial Auto',
    riskState: 'New York',
    stats: [
      { id: 'endorsements', label: 'Endorsements', value: 3, helperText: 'Last 90 days', tone: 'success' },
      { id: 'vehicles-added', label: 'Vehicles Added', value: 2, helperText: 'Current term', tone: 'info' },
      { id: 'pending-changes', label: 'Pending Changes', value: 1, helperText: 'Driver MVR', tone: 'warning' },
      { id: 'active-claims', label: 'Active Claim', value: 0, helperText: 'None open', tone: 'success' },
    ],
    transactionsOverTime: scaleSeries(overviewTransactionsOverTimeMock, 0.85, 3),
    transactions: [
      {
        id: 'nm-1',
        type: 'Endorsement',
        description: 'Add two courier vans to auto schedule',
        status: 'In-Force',
        statusTone: 'success',
        premiumChange: '+$2,140.00',
        premiumDirection: 'up',
        effectiveDate: 'Jun 17, 2026',
        revision: 'Rev 5',
      },
      {
        id: 'nm-2',
        type: 'Policy Change',
        description: 'Pending MVR clearance — new driver',
        status: 'Pending',
        statusTone: 'warning',
        effectiveDate: 'Jun 11, 2026',
        revision: 'Rev 5',
      },
      {
        id: 'nm-3',
        type: 'Certificate',
        description: 'COI for hospital campus parking permit',
        status: 'Issued',
        statusTone: 'info',
        effectiveDate: 'May 29, 2026',
      },
      {
        id: 'nm-4',
        type: 'Billing',
        description: 'Installment invoice posted — Q2',
        status: 'In-Force',
        statusTone: 'success',
        effectiveDate: 'May 15, 2026',
      },
      {
        id: 'nm-5',
        type: 'Endorsement',
        description: 'Remove retired sedan from schedule',
        status: 'In-Force',
        statusTone: 'success',
        premiumChange: '-$420.00',
        premiumDirection: 'down',
        effectiveDate: 'Apr 22, 2026',
        revision: 'Rev 4',
      },
    ],
    transactionInsights: insightSet(
      'Activity up 14% vs prior 30 days',
      'Courier van adds and driver MVR work are driving recent auto activity.',
      'Activity up 10% vs prior 90 days',
      'Fleet growth is healthy with no open claims; clear the pending MVR to close the change.',
      'Activity up 16% vs prior term',
      'Term activity is ahead of last year on endorsements; claim-free run is a positive signal.',
    ),
    exposureByRange: exposureByRange(
      {
        '36': { state: 'NY', units: 18, level: 'high' },
        '34': { state: 'NJ', units: 5, level: 'medium' },
        '09': { state: 'CT', units: 2, level: 'medium' },
      },
      {
        status: 'negative',
        title: 'New York holds 72% of scheduled units',
        body: 'Medical courier fleet concentrated in NY (18 units), with NJ and CT spill.',
      },
    ),
  },

  '01-CP-000017810-0': {
    policyNumber: '01-CP-000017810-0',
    companyName: 'Red Oak Hospitality Group',
    productLine: 'Commercial Package',
    riskState: 'Florida',
    stats: [
      { id: 'endorsements', label: 'Endorsements', value: 5, helperText: 'Last 90 days', tone: 'success' },
      { id: 'locations', label: 'Locations', value: 7, helperText: 'FL · GA', tone: 'info' },
      { id: 'pending-changes', label: 'Pending Changes', value: 2, helperText: 'Needs review', tone: 'warning' },
      { id: 'active-claims', label: 'Active Claim', value: 2, helperText: 'Open status', tone: 'error' },
    ],
    transactionsOverTime: scaleSeries(overviewTransactionsOverTimeMock, 1.15, 2),
    transactions: [
      {
        id: 'ro-1',
        type: 'Claim',
        description: 'Guest slip-and-fall — Orlando lobby',
        status: 'Open',
        statusTone: 'warning',
        effectiveDate: 'Jun 19, 2026',
      },
      {
        id: 'ro-2',
        type: 'Claim',
        description: 'Kitchen grease fire — Savannah property',
        status: 'Open',
        statusTone: 'error',
        effectiveDate: 'Jun 7, 2026',
      },
      {
        id: 'ro-3',
        type: 'Endorsement',
        description: 'Add seasonal patio liquor coverage',
        status: 'In-Force',
        statusTone: 'success',
        premiumChange: '+$980.00',
        premiumDirection: 'up',
        effectiveDate: 'May 26, 2026',
        revision: 'Rev 7',
      },
      {
        id: 'ro-4',
        type: 'Renewal',
        description: '2026 package renewal quote to producer',
        status: 'Pending',
        statusTone: 'info',
        premiumChange: '+$18,400.00',
        premiumDirection: 'up',
        effectiveDate: 'May 12, 2026',
        revision: 'Rev 6',
      },
      {
        id: 'ro-5',
        type: 'Inspection',
        description: 'Hospitality loss control — kitchen hoods',
        status: 'Scheduled',
        statusTone: 'default',
        effectiveDate: 'Apr 28, 2026',
      },
    ],
    transactionInsights: insightSet(
      'Activity up 21% vs prior 30 days',
      'Two open claims and seasonal endorsements are elevating package activity.',
      'Activity up 19% vs prior 90 days',
      'Hospitality volatility is high — renewal quote and kitchen claim need coordinated review.',
      'Activity up 24% vs prior term',
      'Term activity well ahead of last year; claim frequency is the primary risk signal.',
      'negative',
    ),
    exposureByRange: exposureByRange(
      {
        '12': { state: 'FL', units: 28, level: 'high' },
        '13': { state: 'GA', units: 7, level: 'medium' },
      },
      {
        status: 'negative',
        title: 'Florida holds 80% of hospitality TIV',
        body: 'Locations concentrated in FL (28 units) with GA spill — coastal CAT exposure is elevated.',
      },
    ),
  },

  '01-CA-000100012-0': {
    policyNumber: '01-CA-000100012-0',
    companyName: 'Horizon Fleet Services, LLC',
    productLine: 'Commercial Auto',
    riskState: 'Texas',
    stats: [
      { id: 'endorsements', label: 'Endorsements', value: 6, helperText: 'Last 90 days', tone: 'success' },
      { id: 'vehicles-added', label: 'Vehicles Added', value: 4, helperText: 'Current term', tone: 'info' },
      { id: 'pending-changes', label: 'Pending Changes', value: 2, helperText: 'Needs review', tone: 'warning' },
      { id: 'active-claims', label: 'Active Claim', value: 1, helperText: 'Open status', tone: 'error' },
    ],
    transactionsOverTime: scaleSeries(overviewTransactionsOverTimeMock, 1.25, 1),
    transactions: [
      {
        id: 'hf-1',
        type: 'Endorsement',
        description: 'Add 4 Class 8 tractors to long-haul schedule',
        status: 'In-Force',
        statusTone: 'success',
        premiumChange: '+$9,840.00',
        premiumDirection: 'up',
        effectiveDate: 'Jun 20, 2026',
        revision: 'Rev 8',
      },
      {
        id: 'hf-2',
        type: 'Claim',
        description: 'Interstate rear-end — unit 22',
        status: 'Open',
        statusTone: 'warning',
        effectiveDate: 'Jun 13, 2026',
      },
      {
        id: 'hf-3',
        type: 'Audit',
        description: 'Mileage audit adjustment — Q1 variance',
        status: 'Pending',
        statusTone: 'warning',
        premiumChange: '+$5,100.00',
        premiumDirection: 'up',
        effectiveDate: 'May 31, 2026',
      },
      {
        id: 'hf-4',
        type: 'Billing',
        description: 'Installment invoice posted — fleet schedule',
        status: 'In-Force',
        statusTone: 'success',
        effectiveDate: 'May 18, 2026',
      },
      {
        id: 'hf-5',
        type: 'Endorsement',
        description: 'Update radius of operations — 500+ miles',
        status: 'In-Force',
        statusTone: 'success',
        premiumChange: '+$1,560.00',
        premiumDirection: 'up',
        effectiveDate: 'Apr 26, 2026',
        revision: 'Rev 7',
      },
    ],
    transactionInsights: insightSet(
      'Activity up 18% vs prior 30 days',
      'Tractor adds and the open interstate claim are driving fleet activity.',
      'Activity up 22% vs prior 90 days',
      'Mileage audit and radius change increase mid-term premium volatility.',
      'Activity up 27% vs prior term',
      'Fleet growth is well ahead of last term; monitor claim severity on unit 22.',
    ),
    exposureByRange: exposureByRange(
      {
        '48': { state: 'TX', units: 36, level: 'high' },
        '40': { state: 'OK', units: 5, level: 'medium' },
        '22': { state: 'LA', units: 3, level: 'medium' },
      },
      {
        status: 'negative',
        title: 'Texas holds 82% of scheduled units',
        body: 'Long-haul fleet concentrated in TX (36 units), with OK and LA terminals.',
      },
    ),
  },

  '01-CP-000017831-0': {
    policyNumber: '01-CP-000017831-0',
    companyName: 'Blue Harbor Logistics Inc.',
    productLine: 'Commercial Package',
    riskState: 'Washington',
    stats: [
      { id: 'endorsements', label: 'Endorsements', value: 3, helperText: 'Last 90 days', tone: 'success' },
      { id: 'locations', label: 'Locations', value: 5, helperText: 'WA · OR', tone: 'info' },
      { id: 'pending-changes', label: 'Pending Changes', value: 1, helperText: 'Needs review', tone: 'warning' },
      { id: 'active-claims', label: 'Active Claim', value: 0, helperText: 'None open', tone: 'success' },
    ],
    transactionsOverTime: scaleSeries(overviewTransactionsOverTimeMock, 0.9, 4),
    transactions: [
      {
        id: 'bh-1',
        type: 'Endorsement',
        description: 'Add Tacoma cold-storage warehouse',
        status: 'In-Force',
        statusTone: 'success',
        premiumChange: '+$3,720.00',
        premiumDirection: 'up',
        effectiveDate: 'Jun 15, 2026',
        revision: 'Rev 4',
      },
      {
        id: 'bh-2',
        type: 'Certificate',
        description: 'COI for port authority lease',
        status: 'Issued',
        statusTone: 'info',
        effectiveDate: 'Jun 3, 2026',
      },
      {
        id: 'bh-3',
        type: 'Policy Change',
        description: 'Update cargo limit for inland marine',
        status: 'Pending',
        statusTone: 'warning',
        premiumChange: '+$1,100.00',
        premiumDirection: 'up',
        effectiveDate: 'May 24, 2026',
        revision: 'Rev 4',
      },
      {
        id: 'bh-4',
        type: 'Billing',
        description: 'Installment invoice posted — Q2',
        status: 'In-Force',
        statusTone: 'success',
        effectiveDate: 'May 10, 2026',
      },
      {
        id: 'bh-5',
        type: 'Inspection',
        description: 'Warehouse racking survey — Tacoma',
        status: 'Scheduled',
        statusTone: 'default',
        effectiveDate: 'Apr 19, 2026',
      },
    ],
    transactionInsights: insightSet(
      'Activity up 9% vs prior 30 days',
      'Cold-storage add and cargo limit change are the main package movers.',
      'Activity up 7% vs prior 90 days',
      'Claim-free run continues; pending cargo limit is the only open underwriting item.',
      'Activity up 11% vs prior term',
      'Steady logistics growth versus last term with no open claims.',
    ),
    exposureByRange: exposureByRange(
      {
        '53': { state: 'WA', units: 16, level: 'high' },
        '41': { state: 'OR', units: 4, level: 'medium' },
      },
      {
        status: 'neutral',
        title: 'Washington holds 80% of logistics TIV',
        body: 'Warehousing concentrated in WA (16 units) with OR cross-dock spill.',
      },
    ),
  },
}

const FALLBACK_EXPOSURE: Array<{ fips: ExposureByFips; insight: PolicySignalInsight; riskState: string }> = [
  {
    riskState: 'Texas',
    fips: {
      '48': { state: 'TX', units: 14, level: 'high' },
      '40': { state: 'OK', units: 3, level: 'medium' },
    },
    insight: {
      status: 'negative',
      title: 'Texas holds most scheduled exposure',
      body: 'Primary concentration in TX with light OK spill.',
    },
  },
  {
    riskState: 'Florida',
    fips: {
      '12': { state: 'FL', units: 11, level: 'high' },
      '13': { state: 'GA', units: 2, level: 'medium' },
    },
    insight: {
      status: 'negative',
      title: 'Florida holds most scheduled exposure',
      body: 'Primary concentration in FL with light GA spill.',
    },
  },
  {
    riskState: 'New York',
    fips: {
      '36': { state: 'NY', units: 9, level: 'high' },
      '34': { state: 'NJ', units: 3, level: 'medium' },
    },
    insight: {
      status: 'neutral',
      title: 'New York holds most scheduled exposure',
      body: 'Primary concentration in NY with NJ spill.',
    },
  },
  {
    riskState: 'Colorado',
    fips: {
      '08': { state: 'CO', units: 10, level: 'high' },
      '35': { state: 'NM', units: 2, level: 'medium' },
    },
    insight: {
      status: 'neutral',
      title: 'Colorado holds most scheduled exposure',
      body: 'Primary concentration in CO with light NM spill.',
    },
  },
]

function buildFallbackTransactions(record: PolicyListRecord, seed: number): OverviewTransaction[] {
  const product = productLineFromRecord(record)
  const claimOpen = record.openClaimsCount > 0
  return [
    {
      id: `${record.id}-tx-1`,
      type: claimOpen ? 'Claim' : 'Endorsement',
      description: claimOpen
        ? `${product} claim intake — file ${record.policyNumber.slice(-6)}`
        : `${product} schedule update for ${record.insuredName}`,
      status: claimOpen ? 'Open' : 'In-Force',
      statusTone: claimOpen ? 'warning' : 'success',
      premiumChange: claimOpen ? undefined : seed % 2 === 0 ? '+$1,280.00' : '+$640.00',
      premiumDirection: 'up',
      effectiveDate: 'Jun 12, 2026',
      revision: 'Rev 2',
    },
    {
      id: `${record.id}-tx-2`,
      type: 'Billing',
      description: 'Installment invoice posted',
      status: 'In-Force',
      statusTone: 'success',
      effectiveDate: 'May 28, 2026',
    },
    {
      id: `${record.id}-tx-3`,
      type: 'Certificate',
      description: 'Certificate of insurance issued to counterparty',
      status: 'Issued',
      statusTone: 'info',
      effectiveDate: 'May 10, 2026',
    },
    {
      id: `${record.id}-tx-4`,
      type: record.status === 'Quoted' ? 'Renewal' : 'Policy Change',
      description:
        record.status === 'Quoted'
          ? 'Renewal quote package sent to producer'
          : 'Named insured / mailing address refresh',
      status: record.status === 'Quoted' ? 'Pending' : 'In-Force',
      statusTone: record.status === 'Quoted' ? 'info' : 'success',
      effectiveDate: 'Apr 22, 2026',
      revision: 'Rev 1',
    },
  ]
}

function buildFallbackProfile(record: PolicyListRecord): PolicyOverviewProfile {
  const seed = seedFromPolicyNumber(record.policyNumber)
  const exposure = FALLBACK_EXPOSURE[seed % FALLBACK_EXPOSURE.length]
  const claims = record.openClaimsCount
  const pending = seed % 4
  const endorsements = (seed % 5) + (record.status === 'Open' ? 2 : 0)

  return {
    policyNumber: record.policyNumber,
    companyName: record.insuredName,
    productLine: productLineFromRecord(record),
    riskState: exposure.riskState,
    stats: [
      {
        id: 'endorsements',
        label: 'Endorsements',
        value: endorsements,
        helperText: 'Last 90 days',
        tone: 'success',
      },
      {
        id: 'metric-2',
        label: productLineFromRecord(record).includes('Auto') ? 'Vehicles' : 'Locations',
        value: (seed % 7) + 2,
        helperText: 'On schedule',
        tone: 'info',
      },
      {
        id: 'pending-changes',
        label: 'Pending Changes',
        value: pending,
        helperText: pending > 0 ? 'Needs review' : 'Clear',
        tone: pending > 0 ? 'warning' : 'success',
      },
      {
        id: 'active-claims',
        label: claims === 1 ? 'Active Claim' : 'Active Claims',
        value: claims,
        helperText: claims > 0 ? 'Open status' : 'None open',
        tone: claims > 0 ? 'error' : 'success',
      },
    ],
    transactionsOverTime: scaleSeries(overviewTransactionsOverTimeMock, 0.5 + (seed % 5) * 0.12, seed),
    transactions: buildFallbackTransactions(record, seed),
    transactionInsights: insightSet(
      claims > 0 ? 'Activity elevated vs prior 30 days' : 'Activity steady vs prior 30 days',
      claims > 0
        ? `Open claim activity is shaping the last 30 days for ${record.insuredName}.`
        : `Recent ${productLineFromRecord(record).toLowerCase()} activity is in line with expectations.`,
      'Activity stable vs prior 90 days',
      `${pending} pending change${pending === 1 ? '' : 's'} and ${endorsements} recent endorsement${endorsements === 1 ? '' : 's'} on file.`,
      claims > 0 ? 'Watch claim severity into renewal' : 'Term activity supports a clean renewal path',
      claims > 0
        ? 'Resolve open claims before locking renewal terms.'
        : 'No open claims — continue routine mid-term maintenance.',
      claims > 0 ? 'negative' : 'positive',
    ),
    exposureByRange: exposureByRange(exposure.fips, exposure.insight),
  }
}

/**
 * Resolve Overview payloads for a policy listing ID / number.
 * Curated heroes get distinct stories; remaining list rows use seeded fallbacks.
 */
export function getPolicyOverviewProfile(policyId: string): PolicyOverviewProfile {
  const decoded = decodeURIComponent(policyId)
  const curated = CURATED_PROFILES[decoded]
  if (curated) return curated

  const listRecord =
    policiesListMock.find((row) => row.policyNumber === decoded || row.id === decoded) ?? null

  if (listRecord) return buildFallbackProfile(listRecord)

  return {
    ...ATLANTIC_PROFILE,
    policyNumber: decoded,
    companyName: decoded,
  }
}

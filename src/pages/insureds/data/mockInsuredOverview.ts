import type { RecentActivityItem } from '@/app/data/homeMock'
import type { InsuredDetailsRecord } from '@/pages/insureds/data/mockInsuredDetails'
import { insuredDetailsMock } from '@/pages/insureds/data/mockInsuredDetails'
import { policiesListMock, type PolicyListRecord } from '@/pages/policies/data/mockPoliciesList'
import { insuredIdFromName } from '@/pages/shared/insuredId'

export type InsuredOverviewPolicy = {
  id: string
  policyNumber: string
  product: string
  status: string
  effectiveDate: string
  expirationDate: string
  premium: string
  openClaimsCount: number
}

export type InsuredOverviewClaim = {
  id: string
  claimNumber: string
  policyNumber: string
  lossType: string
  status: 'Open' | 'Closed' | 'Pending'
  reserve: string
  dateOfLoss: string
  description: string
}

function formatCurrency(value: number) {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })
}

function formatListDate(iso: string) {
  const date = new Date(`${iso}T12:00:00`)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/** Extra Atlantic Ridge policies so Overview matches the 3-policy hero stats. */
const ATLANTIC_EXTRA_POLICIES: InsuredOverviewPolicy[] = [
  {
    id: 'atlantic-gl',
    policyNumber: '01-GL-000033428-0',
    product: 'General Liability',
    status: 'In-Force',
    effectiveDate: 'Jun 1, 2026',
    expirationDate: 'Jun 1, 2027',
    premium: '$486,200',
    openClaimsCount: 0,
  },
  {
    id: 'atlantic-wc',
    policyNumber: '01-WC-000019204-0',
    product: 'Workers Compensation',
    status: 'In-Force',
    effectiveDate: 'Jun 1, 2026',
    expirationDate: 'Jun 1, 2027',
    premium: '$612,480',
    openClaimsCount: 0,
  },
]

const ATLANTIC_CLAIMS: InsuredOverviewClaim[] = [
  {
    id: 'cl-1',
    claimNumber: 'CL-2026-4781',
    policyNumber: '01-CA-000100005-0',
    lossType: 'Auto liability',
    status: 'Open',
    reserve: '$142,500',
    dateOfLoss: 'Apr 2, 2026',
    description: 'Intersection collision — unit 14 · reserve review pending',
  },
  {
    id: 'cl-2',
    claimNumber: 'CL-2025-3890',
    policyNumber: '01-CA-000100005-0',
    lossType: 'Physical damage',
    status: 'Closed',
    reserve: '$18,400',
    dateOfLoss: 'Nov 12, 2025',
    description: 'Backing incident at Harbor View yard — closed paid',
  },
]

function policyFromList(row: PolicyListRecord): InsuredOverviewPolicy {
  return {
    id: row.id,
    policyNumber: row.policyNumber,
    product: row.product,
    status: row.status,
    effectiveDate: formatListDate(row.effectiveDate),
    expirationDate: formatListDate(row.expirationDate),
    premium: formatCurrency(row.twp),
    openClaimsCount: row.openClaimsCount,
  }
}

export function getInsuredPolicies(insured: InsuredDetailsRecord): InsuredOverviewPolicy[] {
  const matched = policiesListMock
    .filter((row) => insuredIdFromName(row.insuredName) === insured.id || row.insuredName === insured.name)
    .map(policyFromList)

  if (insured.id === insuredDetailsMock.id) {
    const primary = matched[0] ?? {
      id: 'atlantic-ca',
      policyNumber: '01-CA-000100005-0',
      product: 'Commercial Auto',
      status: 'In-Force',
      effectiveDate: 'Jul 1, 2026',
      expirationDate: 'Jul 1, 2027',
      premium: '$1,245,320',
      openClaimsCount: 2,
    }
    return [primary, ...ATLANTIC_EXTRA_POLICIES]
  }

  if (matched.length > 0) return matched

  return [
    {
      id: `${insured.id}-policy`,
      policyNumber: `01-XX-${insured.id.slice(0, 8).toUpperCase()}-0`,
      product: 'Commercial Package',
      status: insured.status === 'Active' ? 'In-Force' : 'Quoted',
      effectiveDate: 'Jan 1, 2026',
      expirationDate: 'Jan 1, 2027',
      premium: insured.totalPremium,
      openClaimsCount: insured.openClaims,
    },
  ]
}

export function getInsuredClaims(insured: InsuredDetailsRecord): InsuredOverviewClaim[] {
  if (insured.id === insuredDetailsMock.id) return ATLANTIC_CLAIMS

  const policies = getInsuredPolicies(insured)
  const primary = policies[0]
  if (!primary || insured.openClaims <= 0) return []

  return Array.from({ length: Math.min(insured.openClaims, 3) }, (_, index) => ({
    id: `${insured.id}-claim-${index + 1}`,
    claimNumber: `CL-2026-${4000 + (insured.id.charCodeAt(0) % 50) + index}`,
    policyNumber: primary.policyNumber,
    lossType: index === 0 ? 'Liability' : 'Property',
    status: index === 0 ? ('Open' as const) : ('Pending' as const),
    reserve: formatCurrency(24_000 + index * 12_500),
    dateOfLoss: index === 0 ? 'May 12, 2026' : 'Apr 3, 2026',
    description: `${insured.name} claim file · ${primary.product}`,
  }))
}

export function getInsuredPrimaryPolicyNumber(insured: InsuredDetailsRecord) {
  return getInsuredPolicies(insured)[0]?.policyNumber ?? '01-CA-000100005-0'
}

/**
 * Account-level activity for ActivityRail — mirrors policy Overview recent activity.
 */
export function getInsuredActivityItems(insured: InsuredDetailsRecord): RecentActivityItem[] {
  const policies = getInsuredPolicies(insured)
  const claims = getInsuredClaims(insured)
  const primary = policies[0]
  const policyHref = primary
    ? `/policies/${encodeURIComponent(primary.policyNumber)}`
    : `/insureds/${encodeURIComponent(insured.id)}`
  const docsHref = `${policyHref}?tab=documents`

  if (insured.id === insuredDetailsMock.id) {
    return [
      {
        id: 'ia-1',
        kind: 'endorsement',
        label: 'Endorsement issued',
        detail: 'Vehicle added to Commercial Auto schedule',
        timestamp: 'Today · 11:40 AM',
        referenceId: 'END-14',
        status: 'In-Force',
        statusVariant: 'success',
        performedBy: 'Policy operations',
        insuredName: insured.name,
        policyNumber: primary?.policyNumber,
        summary: 'Ford F-350 added to fleet schedule on 01-CA-000100005-0.',
        fields: [
          { label: 'Policy', value: primary?.policyNumber ?? '—' },
          { label: 'Status', value: 'In-Force' },
          { label: 'Effective date', value: 'Apr 15, 2026' },
        ],
        insights: ['Premium impact +$1,280 on Commercial Auto.'],
        primaryLink: { label: 'View policy', to: policyHref },
        secondaryLink: { label: 'View documents', to: docsHref },
      },
      {
        id: 'ia-2',
        kind: 'claim',
        label: 'Claim opened',
        detail: claims[0]?.description ?? 'Auto liability claim opened',
        timestamp: 'Today · 9:18 AM',
        referenceId: claims[0]?.claimNumber ?? 'CL-2026-4781',
        status: 'Open',
        statusVariant: 'warning',
        performedBy: 'Claims',
        insuredName: insured.name,
        policyNumber: claims[0]?.policyNumber,
        claimNumber: claims[0]?.claimNumber,
        summary: claims[0]?.description,
        fields: [
          { label: 'Claim', value: claims[0]?.claimNumber ?? '—' },
          { label: 'Reserve', value: claims[0]?.reserve ?? '—' },
          { label: 'Date of loss', value: claims[0]?.dateOfLoss ?? '—' },
        ],
        insights: ['Reserve review requested — no change in last 14 days.'],
        primaryLink: { label: 'View policy', to: policyHref },
        secondaryLink: { label: 'View documents', to: docsHref },
      },
      {
        id: 'ia-3',
        kind: 'renewal',
        label: 'Renewal quote started',
        detail: 'Commercial Auto renewal effective Jun 1, 2026',
        timestamp: 'Yesterday · 4:05 PM',
        referenceId: 'RNW-2026',
        status: 'Pending',
        statusVariant: 'info',
        performedBy: 'Underwriting',
        insuredName: insured.name,
        policyNumber: primary?.policyNumber,
        summary: 'Renewal package in progress with Lockton.',
        fields: [
          { label: 'Policy', value: primary?.policyNumber ?? '—' },
          { label: 'Effective', value: 'Jun 1, 2026' },
        ],
        insights: ['Renewal season starts in 90 days — review loss runs.'],
        primaryLink: { label: 'View policy', to: policyHref },
        secondaryLink: { label: 'View documents', to: docsHref },
      },
      {
        id: 'ia-4',
        kind: 'document',
        label: 'Document uploaded',
        detail: 'Updated fleet schedule received from producer',
        timestamp: 'Yesterday · 10:22 AM',
        referenceId: 'DOC-FL-22',
        status: 'Received',
        statusVariant: 'info',
        performedBy: 'Producer portal',
        insuredName: insured.name,
        policyNumber: primary?.policyNumber,
        summary: 'Fleet schedule package attached across account policies.',
        fields: [
          { label: 'Source', value: 'Liberty Group' },
          { label: 'Policy', value: primary?.policyNumber ?? '—' },
        ],
        insights: ['Document available on the insured Documents tab.'],
        primaryLink: { label: 'View documents', to: docsHref },
        secondaryLink: { label: 'View policy', to: policyHref },
      },
      {
        id: 'ia-5',
        kind: 'billing',
        label: 'Installment posted',
        detail: 'Q2 installment posted across in-force policies',
        timestamp: 'Apr 28, 2026',
        referenceId: 'BILL-Q2',
        status: 'Posted',
        statusVariant: 'success',
        performedBy: 'Billing',
        insuredName: insured.name,
        policyNumber: primary?.policyNumber,
        summary: 'Account-level installment applied to Commercial Auto and GL.',
        fields: [
          { label: 'Amount', value: '$214,800' },
          { label: 'Period', value: 'Q2 2026' },
        ],
        insights: ['No past-due balance on the account.'],
        primaryLink: { label: 'View policy', to: policyHref },
        secondaryLink: { label: 'View documents', to: docsHref },
      },
    ]
  }

  return [
    {
      id: `${insured.id}-activity-1`,
      kind: 'policy',
      label: 'Account reviewed',
      detail: `Prototype activity for ${insured.name}`,
      timestamp: 'Today · 10:00 AM',
      referenceId: insured.id.slice(0, 12).toUpperCase(),
      status: insured.status,
      statusVariant: 'info',
      performedBy: 'Account team',
      insuredName: insured.name,
      policyNumber: primary?.policyNumber,
      summary: `Open the related policy for ${insured.name} to continue underwriting work.`,
      fields: [
        { label: 'Policies', value: String(policies.length) },
        { label: 'Open claims', value: String(claims.length) },
      ],
      insights: [`${policies.length} policies · ${claims.length} open claims on this account.`],
      primaryLink: { label: 'View policy', to: policyHref },
      secondaryLink: { label: 'View documents', to: docsHref },
    },
  ]
}

export function insuredActivitySubtitle(item: RecentActivityItem) {
  if (item.status) return `${item.detail} · ${item.status}`
  return item.detail
}

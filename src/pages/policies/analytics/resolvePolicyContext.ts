import { policyDetailsMock } from '@/pages/policies/data/mockPolicyDetails'
import { policiesListMock, type PolicyListRecord } from '@/pages/policies/data/mockPoliciesList'

export type PolicyContext = {
  policyNumber: string
  companyName: string
  status: string
  policyType: string
  productLine: string
  riskState: string
  agency: string
  underwriter: string
  effectiveDate: string
  expirationDate: string
  twp: number
  ftp: number
  termPremiumLabel: string
  premiumChange: string
  premiumChangeDirection: 'up' | 'down'
  isPrimaryMock: boolean
}

function getProductLineFromPolicyNumber(policyNumber: string) {
  if (policyNumber.includes('-CA-')) return 'Commercial Auto'
  if (policyNumber.includes('-CP-')) return 'Commercial Package'
  if (policyNumber.includes('-BP-')) return 'Business Property'
  return 'Commercial Lines'
}

function formatDisplayDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function seedFromPolicyNumber(policyNumber: string) {
  return policyNumber.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
}

export function resolvePolicyContext(policyId: string): PolicyContext {
  const decodedId = decodeURIComponent(policyId)
  const listRecord = policiesListMock.find((row) => row.policyNumber === decodedId)
  const isPrimaryMock = decodedId === policyDetailsMock.policyNumber

  if (isPrimaryMock) {
    const listMatch = listRecord ?? policiesListMock[0]
    return {
      policyNumber: policyDetailsMock.policyNumber,
      companyName: policyDetailsMock.companyName,
      status: policyDetailsMock.status,
      policyType: policyDetailsMock.policyType,
      productLine: getProductLineFromPolicyNumber(policyDetailsMock.policyNumber),
      riskState: policyDetailsMock.riskState,
      agency: listMatch.agency,
      underwriter: listMatch.underwriter,
      effectiveDate: listMatch.effectiveDate,
      expirationDate: listMatch.expirationDate,
      twp: listMatch.twp,
      ftp: listMatch.ftp,
      termPremiumLabel: policyDetailsMock.termPremium,
      premiumChange: policyDetailsMock.premiumChange,
      premiumChangeDirection: policyDetailsMock.premiumChangeDirection,
      isPrimaryMock: true,
    }
  }

  const record: PolicyListRecord =
    listRecord ?? {
      id: 'fallback',
      policyNumber: decodedId,
      effectiveDate: '2025-06-01',
      expirationDate: '2026-06-01',
      insuredName: decodedId,
      agency: 'Agency',
      agencyNumber: '9000000000',
      underwriter: 'Underwriter',
      twp: 500000,
      ftp: 480000,
    }

  const seed = seedFromPolicyNumber(record.policyNumber)

  return {
    policyNumber: record.policyNumber,
    companyName: record.insuredName,
    status: 'In-Force',
    policyType: `${getProductLineFromPolicyNumber(record.policyNumber)} Policy`,
    productLine: getProductLineFromPolicyNumber(record.policyNumber),
    riskState: ['California', 'Texas', 'Florida', 'New York'][seed % 4],
    agency: record.agency,
    underwriter: record.underwriter,
    effectiveDate: record.effectiveDate,
    expirationDate: record.expirationDate,
    twp: record.twp,
    ftp: record.ftp,
    termPremiumLabel: `$${Math.round(record.ftp / 12).toLocaleString('en-US')}`,
    premiumChange: `$${Math.round((seed % 9) * 120).toLocaleString('en-US')}`,
    premiumChangeDirection: seed % 2 === 0 ? 'up' : 'down',
    isPrimaryMock: false,
  }
}

export function formatPolicyCurrency(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1000) return `$${Math.round(value / 1000)}K`
  return `$${value.toLocaleString('en-US')}`
}

export function formatPolicyDateRange(context: PolicyContext) {
  return `${formatDisplayDate(context.effectiveDate)} – ${formatDisplayDate(context.expirationDate)}`
}

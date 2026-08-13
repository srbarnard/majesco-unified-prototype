import { policiesListMock } from '@/pages/policies/data/mockPoliciesList'
import { insuredIdFromName } from '@/pages/shared/insuredId'
import {
  insuredDetailsMock,
  insuredOverviewStatsMock,
  insuredRecentActivityMock,
  type InsuredDetailsRecord,
} from '@/pages/insureds/data/mockInsuredDetails'
import { insuredsMock } from '@/pages/insureds/data/mockInsureds'

export function resolveInsuredContext(insuredId: string | undefined): InsuredDetailsRecord {
  if (!insuredId || insuredId === insuredDetailsMock.id) {
    return insuredDetailsMock
  }

  const decoded = decodeURIComponent(insuredId)
  const fromList = policiesListMock.find(
    (row) => insuredIdFromName(row.insuredName) === decoded || row.insuredName === decoded,
  )
  const fromInsureds = insuredsMock.find(
    (row) => insuredIdFromName(row.name) === decoded || row.name === decoded,
  )

  if (fromList || fromInsureds) {
    const name = fromList?.insuredName ?? fromInsureds!.name
    const premium = fromInsureds
      ? fromInsureds.premiumInForce.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        })
      : '$1.24M'

    return {
      ...insuredDetailsMock,
      id: insuredIdFromName(name),
      name,
      policyCount: fromInsureds?.upcomingRenewals ? Math.max(1, fromInsureds.upcomingRenewals) : 1,
      totalPremium: premium,
      openClaims: fromInsureds?.openClaims ?? 0,
      primaryState: fromInsureds?.cityStateZip.match(/\b([A-Z]{2})\s+\d{5}\b/)?.[1] ?? 'Multi-state',
      address: fromInsureds ? `${fromInsureds.addressLine1}, ${fromInsureds.cityStateZip}` : insuredDetailsMock.address,
      phone: fromInsureds?.contactPhone ?? insuredDetailsMock.phone,
      email: fromInsureds?.contactEmail ?? insuredDetailsMock.email,
      copilotSummary: `**${name}** has **${fromInsureds?.insuredType.toLowerCase() ?? 'commercial'}** coverage in force${fromInsureds ? ` totaling **${premium}**` : ''}. Review renewal timing and claims activity before producer outreach.`,
      copilotInsights: [
        fromList ? `Policy ${fromList.policyNumber} · ${fromList.agency}` : `${fromInsureds?.insuredType} insured`,
        fromInsureds
          ? `Contact ${fromInsureds.contactName} · ${fromInsureds.contactPhone}`
          : `Underwriter: ${fromList?.underwriter}`,
        fromInsureds
          ? `${fromInsureds.openQuotes ?? 0} open quotes · ${fromInsureds.openClaims ?? 0} open claims`
          : `Effective ${fromList?.effectiveDate} – Expires ${fromList?.expirationDate}`,
      ],
    }
  }

  return {
    ...insuredDetailsMock,
    id: decoded,
    name: decoded.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
    policyCount: 1,
    totalPremium: '$850K',
    openClaims: 0,
    copilotSummary: `Placeholder insured record for **${decoded}**. Link policies and claims when backend data is available.`,
    copilotInsights: ['Sample insured context for prototype navigation'],
  }
}

export function getInsuredOverviewStats(insured: InsuredDetailsRecord) {
  if (insured.id === insuredDetailsMock.id) {
    return insuredOverviewStatsMock
  }

  return insuredOverviewStatsMock.map((stat) => {
    if (stat.id === 'policies') return { ...stat, value: insured.policyCount }
    if (stat.id === 'premium') return { ...stat, value: insured.totalPremium }
    if (stat.id === 'claims') return { ...stat, value: insured.openClaims }
    return stat
  })
}

export function getInsuredRecentActivity(insured: InsuredDetailsRecord) {
  if (insured.id === insuredDetailsMock.id) {
    return insuredRecentActivityMock
  }

  return [
    {
      id: 'fallback',
      label: 'Account viewed',
      detail: `Prototype placeholder activity for ${insured.name}`,
      timestamp: 'Today',
    },
  ]
}

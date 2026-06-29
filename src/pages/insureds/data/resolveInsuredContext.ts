import { policiesListMock } from '@/pages/policies/data/mockPoliciesList'
import { insuredIdFromName } from '@/pages/shared/insuredId'
import {
  insuredDetailsMock,
  insuredOverviewStatsMock,
  insuredRecentActivityMock,
  type InsuredDetailsRecord,
} from '@/pages/insureds/data/mockInsuredDetails'

export function resolveInsuredContext(insuredId: string | undefined): InsuredDetailsRecord {
  if (!insuredId || insuredId === insuredDetailsMock.id) {
    return insuredDetailsMock
  }

  const decoded = decodeURIComponent(insuredId)
  const fromList = policiesListMock.find(
    (row) => insuredIdFromName(row.insuredName) === decoded || row.insuredName === decoded,
  )

  if (fromList) {
    return {
      ...insuredDetailsMock,
      id: insuredIdFromName(fromList.insuredName),
      name: fromList.insuredName,
      policyCount: 1,
      totalPremium: '$1.24M',
      openClaims: 0,
      primaryState: 'Multi-state',
      copilotSummary: `**${fromList.insuredName}** has **1 active policy** with **${fromList.agency}**. Review renewal timing and billing activity before producer outreach.`,
      copilotInsights: [
        `Policy ${fromList.policyNumber} · ${fromList.agency}`,
        `Underwriter: ${fromList.underwriter}`,
        `Effective ${fromList.effectiveDate} – Expires ${fromList.expirationDate}`,
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

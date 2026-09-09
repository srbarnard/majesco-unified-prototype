import { policiesListMock } from '@/pages/policies/data/mockPoliciesList'
import { insuredIdFromName } from '@/pages/shared/insuredId'
import {
  insuredDetailsMock,
  insuredOverviewStatsMock,
  type InsuredDetailsRecord,
} from '@/pages/insureds/data/mockInsuredDetails'
import { insuredsMock, type InsuredListRecord, type InsuredType } from '@/pages/insureds/data/mockInsureds'

function formatPremium(value: number) {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}M`
  }
  if (value >= 1_000) {
    return `$${Math.round(value / 1_000)}K`
  }
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

function stateFromZipLine(cityStateZip: string) {
  return cityStateZip.match(/\b([A-Z]{2})\s+\d{5}\b/)?.[1] ?? 'Multi-state'
}

function naicsForType(type: InsuredType, name: string) {
  if (type === 'Non-commercial') {
    if (/dental/i.test(name)) return '621210 — Offices of Dentists'
    if (/medical|clinic|practice|healthcare/i.test(name)) return '621111 — Offices of Physicians'
    if (/parish|nonprofit|civic|mutual|housing|school|athletics|volunteer/i.test(name)) {
      return '813110 — Religious / Civic Organizations'
    }
    return '624190 — Other Individual and Family Services'
  }
  if (/construction|builders|roofing/i.test(name)) return '236220 — Commercial Building Construction'
  if (/fleet|logistics|freight|courier|transport/i.test(name)) return '484121 — General Freight Trucking'
  if (/hospitality|restaurant|lodging|hotel/i.test(name)) return '721110 — Hotels and Motels'
  if (/manufactur|fabricat|machining/i.test(name)) return '332710 — Machine Shops'
  if (/realty|property management/i.test(name)) return '531312 — Nonresidential Property Managers'
  return '238990 — Specialty Trade Contractors'
}

function riskForListRow(row: InsuredListRecord) {
  const lossRatio = row.premiumInForce > 0 ? row.totalIncurredLoss / row.premiumInForce : 0
  if (row.insuredType === 'Non-commercial') {
    if (lossRatio > 0.25 || (row.openClaims ?? 0) > 0) return 'Medium risk · Professional / premises exposure'
    return 'Low risk · Limited schedule exposure'
  }
  if (lossRatio > 0.55 || (row.openClaims ?? 0) >= 2) return 'High risk · Claims + concentrated schedule'
  if (lossRatio > 0.3 || (row.openClaims ?? 0) > 0) return 'Medium risk · Mid-term claim / growth pressure'
  return 'Low–medium risk · Stable commercial book'
}

function policyCountForRow(row: InsuredListRecord) {
  const renewals = row.upcomingRenewals ?? 0
  if (row.insuredType === 'Non-commercial') return Math.max(1, renewals || 1)
  return Math.max(2, renewals + 1 + ((row.openQuotes ?? 0) > 0 ? 1 : 0))
}

function customerSinceForIndex(seed: number) {
  const years = ['2016', '2017', '2018', '2019', '2020', '2021', '2022']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']
  return `${months[seed % months.length]} ${years[seed % years.length]}`
}

function findListRow(decoded: string): InsuredListRecord | undefined {
  return insuredsMock.find(
    (row) => insuredIdFromName(row.name) === decoded || row.name === decoded,
  )
}

export function resolveInsuredContext(insuredId: string | undefined): InsuredDetailsRecord {
  if (!insuredId || insuredId === insuredDetailsMock.id) {
    return insuredDetailsMock
  }

  const decoded = decodeURIComponent(insuredId)
  const fromInsureds = findListRow(decoded)
  const fromList = policiesListMock.find(
    (row) => insuredIdFromName(row.insuredName) === decoded || row.insuredName === decoded,
  )

  if (fromInsureds || fromList) {
    const name = fromInsureds?.name ?? fromList!.insuredName
    const type = fromInsureds?.insuredType ?? 'Commercial'
    const premium = fromInsureds ? formatPremium(fromInsureds.premiumInForce) : '$1.24M'
    const openClaims = fromInsureds?.openClaims ?? 0
    const openQuotes = fromInsureds?.openQuotes ?? 0
    const policyCount = fromInsureds ? policyCountForRow(fromInsureds) : 1
    const seed = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)

    return {
      ...insuredDetailsMock,
      id: insuredIdFromName(name),
      name,
      status: openClaims > 1 ? 'Active' : fromInsureds?.openQuotes ? 'Active' : 'Active',
      policyCount,
      totalPremium: premium,
      openClaims,
      producer: fromList?.agency ?? (type === 'Non-commercial' ? 'Community Producers' : 'Harborview Agency'),
      naics: naicsForType(type, name),
      riskProfile: fromInsureds ? riskForListRow(fromInsureds) : insuredDetailsMock.riskProfile,
      primaryState: fromInsureds
        ? stateFromZipLine(fromInsureds.cityStateZip)
        : insuredDetailsMock.primaryState,
      customerSince: customerSinceForIndex(seed),
      address: fromInsureds
        ? `${fromInsureds.addressLine1}, ${fromInsureds.cityStateZip}`
        : insuredDetailsMock.address,
      phone: fromInsureds?.contactPhone ?? insuredDetailsMock.phone,
      email: fromInsureds?.contactEmail ?? insuredDetailsMock.email,
      website: undefined,
      accountManager: fromInsureds?.contactName ?? insuredDetailsMock.accountManager,
      contacts: [
        {
          id: 'primary',
          role: 'Primary contact',
          name: fromInsureds?.contactName ?? 'Account contact',
          email: fromInsureds?.contactEmail,
          phone: fromInsureds?.contactPhone,
          defaultExpanded: true,
        },
        {
          id: 'producer',
          role: 'Producer',
          name: fromList?.agency ?? 'Agency desk',
          email: 'commercial@agency.com',
        },
      ],
      copilotSummary: `**${name}** is a **${type.toLowerCase()}** insured with **${premium}** in-force premium across **${policyCount}** policies${
        openClaims > 0 ? ` and **${openClaims} open claim${openClaims === 1 ? '' : 's'}**` : ''
      }.`,
      copilotInsights: [
        `${type} · ${premium} TWP`,
        openQuotes > 0
          ? `${openQuotes} open quote${openQuotes === 1 ? '' : 's'} in pipeline`
          : 'No open quotes on file',
        openClaims > 0
          ? `${openClaims} open claim${openClaims === 1 ? '' : 's'} need review`
          : 'No open claims',
        fromInsureds
          ? `Contact ${fromInsureds.contactName} · ${fromInsureds.contactPhone}`
          : `Policy ${fromList?.policyNumber}`,
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
  const listRow = findListRow(insured.id) ?? findListRow(insured.name)

  if (insured.id === insuredDetailsMock.id) {
    return insuredOverviewStatsMock
  }

  const openQuotes = listRow?.openQuotes ?? 0
  const isCommercial = listRow?.insuredType !== 'Non-commercial'

  return [
    {
      id: 'policies',
      label: 'Active Policies',
      value: insured.policyCount,
      helperText: isCommercial ? 'Commercial lines' : 'Specialty book',
      tone: 'success' as const,
    },
    {
      id: 'premium',
      label: 'Total Premium',
      value: insured.totalPremium,
      helperText: 'In-force TWP',
      tone: 'info' as const,
    },
    {
      id: 'claims',
      label: insured.openClaims === 1 ? 'Open Claim' : 'Open Claims',
      value: insured.openClaims,
      helperText: insured.openClaims > 0 ? 'Needs review' : 'None open',
      tone: (insured.openClaims > 0 ? 'warning' : 'success') as const,
    },
    {
      id: 'quotes',
      label: openQuotes === 1 ? 'Open Quote' : 'Open Quotes',
      value: openQuotes,
      helperText: openQuotes > 0 ? 'Pipeline' : 'Clear',
      tone: (openQuotes > 0 ? 'info' : 'success') as const,
    },
  ]
}

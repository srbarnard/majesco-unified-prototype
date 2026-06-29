import type { PolicyParty } from '@/pages/policies/data/mockPolicyDetails'
import type { OverviewStat } from '@/pages/policies/data/mockOverview'
import type { QuoteStatus } from '@/pages/quotes/data/mockQuotes'

export type QuoteCoverageLine = {
  id: string
  line: string
  limit: string
  deductible: string
  premium: string
}

export type QuoteDetailsRecord = {
  id: string
  quoteNumber: string
  insuredName: string
  status: QuoteStatus
  product: string
  effectiveDate: string
  expirationDate: string
  premium: string
  producer: string
  underwriter: string
  submissionDate: string
  version: string
  copilotSummary: string
  copilotInsights: string[]
  parties: PolicyParty[]
  coverageLines: QuoteCoverageLine[]
}

export const quoteDetailsMock: QuoteDetailsRecord = {
  id: '01-CA-000100005-0',
  quoteNumber: '01-CA-000100005-0',
  insuredName: 'Redwood Ridge Construction LLC',
  status: 'Quoted',
  product: 'Commercial Auto — Business Auto',
  effectiveDate: 'Jul 1, 2026',
  expirationDate: 'Jul 1, 2027',
  premium: '$1,245,320',
  producer: 'Atlantic Ridge Construction, LLC',
  underwriter: 'Jordan Ellis',
  submissionDate: 'Jun 12, 2026',
  version: 'v3 — Rated',
  copilotSummary:
    'Quote **01-CA-000100005-0** for **Redwood Ridge Construction LLC** is **Quoted** at **$1.25M** for a **12-vehicle fleet**. Review garaging changes and the **VIN decode exception** before presenting to the producer.',
  copilotInsights: [
    'Commercial Auto · 12 scheduled vehicles',
    'Rating exception on 1 VIN — trim mismatch flagged',
    'Effective Jul 1, 2026 · Producer: Atlantic Ridge Construction',
    'Last updated today · Version v3 rated',
  ],
  parties: [
    {
      id: 'insured',
      role: 'Named insured',
      name: 'Redwood Ridge Construction LLC',
      address: '890 Redwood Industrial Pkwy, Oakland, CA 94621',
      email: 'ops@redwoodridge.com',
      defaultExpanded: true,
    },
    {
      id: 'producer',
      role: 'Producer',
      name: 'Atlantic Ridge Construction, LLC',
      email: 'commercial@libertygroup.com',
    },
    {
      id: 'underwriter',
      role: 'Underwriter',
      name: 'Jordan Ellis',
      email: 'jordan.ellis@pinnacle.com',
    },
  ],
  coverageLines: [
    { id: 'liab', line: 'Combined single limit liability', limit: '$1,000,000', deductible: '—', premium: '$842,400' },
    { id: 'comp', line: 'Comprehensive', limit: 'ACV', deductible: '$1,000', premium: '$218,600' },
    { id: 'coll', line: 'Collision', limit: 'ACV', deductible: '$2,500', premium: '$124,320' },
    { id: 'um', line: 'Uninsured motorist', limit: '$1,000,000', deductible: '—', premium: '$60,000' },
  ],
}

export const quoteOverviewStatsMock: OverviewStat[] = [
  { id: 'premium', label: 'Quoted Premium', value: '$1.25M', helperText: 'Annual TWP', tone: 'success' },
  { id: 'product', label: 'Product', value: 'Comm Auto', helperText: 'Business Auto', tone: 'info' },
  { id: 'effective', label: 'Effective Date', value: 'Jul 1', helperText: '2026 term', tone: 'info' },
  { id: 'vehicles', label: 'Vehicles', value: 12, helperText: 'Scheduled units', tone: 'warning' },
]

export const quoteUnderwritingNotesMock = [
  'Fleet garaging verified for CA — 2 units garaged out of state (OR) require UW review.',
  'Loss history: 1 incurred claim in prior 3 years — within appetite.',
  'Driver MVR review complete — 1 minor violation on secondary driver.',
]

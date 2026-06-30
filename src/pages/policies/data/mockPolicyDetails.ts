export type PolicyParty = {
  id: string
  role: string
  name: string
  address?: string
  email?: string
  phone?: string
  defaultExpanded?: boolean
}

export const policyDetailsMock = {
  companyName: 'Atlantic Ridge Construction, LLC',
  policyNumber: '01-CA-000100005-0',
  status: 'In-Force',
  riskLevel: 'Medium Risk',
  effectiveDate: 'Jun 1, 2026',
  effectiveDateLabel: 'Effective Date',
  effectiveDateStatus: 'Needs Review',
  termPremium: '$12,450',
  termPremiumLabel: 'Term Premium',
  premiumChange: '$1,200.00',
  premiumChangeDirection: 'up' as const,
  confidence: '100%',
  confidenceLabel: 'Confidence',
  keyChanges: '3 Key Changes',
  namedInsured: 'Atlantic Ridge Construction, LLC',
  riskState: 'California',
  primaryGarage: 'San Diego, CA',
  policyType: 'Commercial Auto - Business Auto',
  useCase: 'Construction fleet operations',
  documentCount: 40,
  documentConfidence: 92,
  documentStorySyncedAt: '4 min ago',
  documentStory:
    'The most recent transaction on this policy was a renewal quote on 05/13/2026. Since the prior transaction, 7 documents were added or updated across renewal, endorsement, claims, and billing.',
  documentStoryHighlights: [
    { label: 'Renewal package from Lockton', date: '05/13' },
    { label: 'A refreshed MVR report for 3 drivers', date: '05/12' },
    { label: 'COI issued to Walmart DC #4421', date: '05/10' },
    { label: 'Endorsement AI for West Coast Distribution', date: '05/10' },
    { label: 'Loss control report with dock safety recommendations', date: '04/28' },
  ],
  copilotSummary:
    'This policy has **multiple mid-term changes** and a **pending cancellation** triggered by non-payment. Review recent endorsements and the active claim before renewal.',
  copilotInsights: [
    '4 endorsements processed in the last 90 days',
    '1 vehicle added on April 15, 2026',
    'Pending cancellation due to non-payment',
    'Active claim associated with this policy',
  ],
}

export const policyPartiesMock: PolicyParty[] = [
  {
    id: 'applicant',
    role: 'Applicant',
    name: 'Atlantic Ridge Construction, LLC',
    address: '1240 Harbor View Blvd, San Diego, CA 92101',
    email: 'ops@atlanticridge.com',
    phone: '(619) 555-0142',
    defaultExpanded: true,
  },
  {
    id: 'sub-producer',
    role: 'Sub producer',
    name: 'Iva Lockman',
    email: 'iva.lockman@libertygroup.com',
  },
  {
    id: 'producer',
    role: 'Producer',
    name: 'Liberty Group',
    email: 'commercial@libertygroup.com',
  },
  {
    id: 'customer',
    role: 'Customer',
    name: 'Pinnacle Insurance',
    email: 'underwriting@pinnacle.com',
  },
]

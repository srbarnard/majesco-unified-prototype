import type { PolicyParty } from '@/pages/policies/data/mockPolicyDetails'
import type { OverviewStat } from '@/pages/policies/data/mockOverview'

export type InsuredActivityItem = {
  id: string
  label: string
  detail: string
  timestamp: string
}

export type InsuredDetailsRecord = {
  id: string
  name: string
  status: 'Active' | 'Prospect' | 'Inactive'
  policyCount: number
  totalPremium: string
  openClaims: number
  producer: string
  naics: string
  riskProfile: string
  primaryState: string
  address: string
  phone: string
  email: string
  website?: string
  accountManager: string
  copilotSummary: string
  copilotInsights: string[]
  contacts: PolicyParty[]
}

export const insuredDetailsMock: InsuredDetailsRecord = {
  id: 'atlantic-ridge-construction-llc',
  name: 'Atlantic Ridge Construction, LLC',
  status: 'Active',
  policyCount: 3,
  totalPremium: '$2.84M',
  openClaims: 1,
  producer: 'Liberty Group',
  naics: '236220 — Commercial Building Construction',
  riskProfile: 'Medium risk · Fleet + GL exposure',
  primaryState: 'California',
  address: '1240 Harbor View Blvd, San Diego, CA 92101',
  phone: '(619) 555-0142',
  email: 'ops@atlanticridge.com',
  website: 'atlanticridge.com',
  accountManager: 'Jordan Ellis',
  copilotSummary:
    'Atlantic Ridge Construction maintains **3 active commercial policies** with **one open claim** on the auto fleet. Renewal season starts in **90 days** — review loss runs and recent endorsements before outreach.',
  copilotInsights: [
    '3 in-force policies · $2.84M total premium',
    '1 open auto liability claim (reserve review pending)',
    'Last endorsement: vehicle added Apr 15, 2026',
    'Producer: Liberty Group · Account manager: Jordan Ellis',
  ],
  contacts: [
    {
      id: 'primary',
      role: 'Primary contact',
      name: 'Morgan Chen',
      email: 'morgan.chen@atlanticridge.com',
      phone: '(619) 555-0198',
      defaultExpanded: true,
    },
    {
      id: 'risk',
      role: 'Risk manager',
      name: 'Elena Vasquez',
      email: 'elena.vasquez@atlanticridge.com',
      phone: '(619) 555-0174',
    },
    {
      id: 'producer',
      role: 'Producer',
      name: 'Liberty Group',
      email: 'commercial@libertygroup.com',
    },
  ],
}

export const insuredOverviewStatsMock: OverviewStat[] = [
  { id: 'policies', label: 'Active Policies', value: 3, helperText: 'Commercial lines', tone: 'success' },
  { id: 'premium', label: 'Total Premium', value: '$2.84M', helperText: 'In-force TWP', tone: 'info' },
  { id: 'claims', label: 'Open Claims', value: 1, helperText: 'Auto liability', tone: 'warning' },
  { id: 'quotes', label: 'Open Quotes', value: 2, helperText: 'Renewal pipeline', tone: 'info' },
]

export const insuredRecentActivityMock: InsuredActivityItem[] = [
  {
    id: 'a1',
    label: 'Endorsement issued',
    detail: 'Vehicle added to Commercial Auto policy 01-CA-000100005-0',
    timestamp: 'Apr 15, 2026',
  },
  {
    id: 'a2',
    label: 'Claim opened',
    detail: 'Auto liability — reserve review requested by claims',
    timestamp: 'Apr 8, 2026',
  },
  {
    id: 'a3',
    label: 'Renewal quote started',
    detail: 'Commercial Auto renewal effective Jun 1, 2026',
    timestamp: 'May 13, 2026',
  },
  {
    id: 'a4',
    label: 'Document uploaded',
    detail: 'Updated fleet schedule received from producer',
    timestamp: 'May 22, 2026',
  },
]

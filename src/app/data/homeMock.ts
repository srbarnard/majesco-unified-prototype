export type PriorityTaskCard = {
  id: string
  title: string
  account: string
  policyNumber: string
  priority: 'High' | 'Medium' | 'Low'
  dueLabel: string
  isPastDue?: boolean
}

export type AgenticActivityItem = {
  id: string
  agentInitials: string
  agentName: string
  headline: string
  description: string
  accentColor: string
}

export type RecentActivityKind =
  | 'endorsement'
  | 'renewal'
  | 'task'
  | 'document'
  | 'policy'
  | 'claim'
  | 'billing'
  | 'quote'

export type RecentActivityField = {
  label: string
  value: string
}

export type RecentActivityLink = {
  label: string
  to: string
}

export type RecentActivityItem = {
  id: string
  kind: RecentActivityKind
  label: string
  detail: string
  timestamp: string
  referenceId: string
  status: string
  statusVariant: 'success' | 'warning' | 'error' | 'info' | 'default'
  performedBy: string
  insuredName: string
  policyNumber?: string
  quoteNumber?: string
  claimNumber?: string
  summary: string
  fields: RecentActivityField[]
  insights: string[]
  primaryLink?: RecentActivityLink
  secondaryLink?: RecentActivityLink
}

export const priorityTasksMock: PriorityTaskCard[] = [
  {
    id: 'pt-1',
    title: 'Finalize Proposal',
    account: 'Atlantic Ridge Construction LLC',
    policyNumber: '01-CA-000100005-0',
    priority: 'High',
    dueLabel: 'Due tomorrow',
  },
  {
    id: 'pt-2',
    title: 'Review Loss Runs',
    account: 'Midwest Fabrication Inc.',
    policyNumber: '01-CP-000017809-0',
    priority: 'High',
    dueLabel: 'Past due',
    isPastDue: true,
  },
  {
    id: 'pt-3',
    title: 'Approve Renewal Pricing',
    account: 'New business policy bound',
    policyNumber: '01-BP-000028506-0',
    priority: 'Medium',
    dueLabel: 'Due today',
  },
  {
    id: 'pt-4',
    title: 'Group Underwriting Review',
    account: 'Red Oak Hospitality Group',
    policyNumber: '01-CP-000017810-0',
    priority: 'High',
    dueLabel: 'Due today',
  },
  {
    id: 'pt-5',
    title: 'Send Quote to Producer',
    account: 'Summit Outdoor Equipment Inc.',
    policyNumber: '01-CA-000100006-0',
    priority: 'Low',
    dueLabel: 'Due in 3 days',
  },
  {
    id: 'pt-6',
    title: 'Complete Inspection Follow-up',
    account: 'Horizon Fleet Services LLC',
    policyNumber: '01-CA-000100012-0',
    priority: 'Medium',
    dueLabel: 'Due tomorrow',
  },
  {
    id: 'pt-7',
    title: 'Bind Endorsement',
    account: 'Northshore Medical Group P.C.',
    policyNumber: '01-CA-000100009-0',
    priority: 'High',
    dueLabel: 'Past due',
    isPastDue: true,
  },
  {
    id: 'pt-8',
    title: 'Verify Additional Insured',
    account: 'Keystone Commercial Realty',
    policyNumber: '01-BP-000028511-0',
    priority: 'Medium',
    dueLabel: 'Due in 5 days',
  },
  {
    id: 'pt-9',
    title: 'Reconcile Billing Discrepancy',
    account: 'Blue Harbor Logistics Inc.',
    policyNumber: '01-CP-000017809-0',
    priority: 'Low',
    dueLabel: 'Due next week',
  },
  {
    id: 'pt-10',
    title: 'Prepare Renewal Submission',
    account: 'Silverline Manufacturing Co.',
    policyNumber: '01-CP-000017813-0',
    priority: 'High',
    dueLabel: 'Due tomorrow',
  },
]

/** User and system activity for the homepage Recent activity card. */
export const recentActivityMock: RecentActivityItem[] = [
  {
    id: 'ra-1',
    kind: 'endorsement',
    label: 'Endorsement issued',
    detail: 'Vehicle added to Commercial Auto policy 01-CA-000100005-0 for Atlantic Ridge Construction',
    timestamp: 'Today · 9:42 AM',
    referenceId: 'END-2026-004821',
    status: 'Issued',
    statusVariant: 'success',
    performedBy: 'Sarah Chen · Underwriting',
    insuredName: 'Atlantic Ridge Construction LLC',
    policyNumber: '01-CA-000100005-0',
    summary:
      'Endorsement END-2026-004821 added a 2024 Ford F-550 service truck to the Commercial Auto fleet schedule. Coverage is effective immediately with no lapse in protection.',
    fields: [
      { label: 'Endorsement type', value: 'Vehicle add' },
      { label: 'Effective date', value: 'Jun 26, 2026' },
      { label: 'Vehicle', value: '2024 Ford F-550 · VIN 1FDUF5HT8EEA12345' },
      { label: 'Premium change', value: '+$1,842 annual' },
    ],
    insights: [
      'Fleet count increased to 18 units — verify garaging location matches policy territory.',
      'Prior loss history on similar vehicles is clean; no referral required.',
    ],
    primaryLink: { label: 'View endorsement', to: '/policies/01-CA-000100005-0' },
    secondaryLink: { label: 'View policy', to: '/policies/01-CA-000100005-0' },
  },
  {
    id: 'ra-2',
    kind: 'renewal',
    label: 'Renewal quote sent',
    detail: '2026 renewal package emailed to producer for Red Oak Hospitality Group',
    timestamp: 'Today · 8:15 AM',
    referenceId: 'RNW-2026-118902',
    status: 'Sent to producer',
    statusVariant: 'info',
    performedBy: 'Renewal Agent · Automated',
    insuredName: 'Red Oak Hospitality Group',
    policyNumber: '01-CP-000014332-0',
    quoteNumber: 'Q-2026-88421',
    summary:
      'The 2026 renewal quote package for Red Oak Hospitality Group was generated and emailed to the assigned producer. Package includes updated loss runs, rate indication, and coverage comparison.',
    fields: [
      { label: 'Renewal effective', value: 'Aug 1, 2026' },
      { label: 'Expiring premium', value: '$284,500' },
      { label: 'Indicated renewal', value: '$312,800 (+9.9%)' },
      { label: 'Producer', value: 'Marcus Webb · Apex Insurance Group' },
    ],
    insights: [
      'Loss ratio improved 4 pts YoY — consider retention discount if bound within 14 days.',
      'Two open claims may affect final terms if not closed before bind.',
    ],
    primaryLink: { label: 'View renewal quote', to: '/quotes' },
    secondaryLink: { label: 'View policy', to: '/policies/01-CP-000014332-0' },
  },
  {
    id: 'ra-3',
    kind: 'task',
    label: 'Task completed',
    detail: 'Review Loss Runs marked complete for Midwest Fabrication Inc.',
    timestamp: 'Yesterday · 4:30 PM',
    referenceId: 'TSK-2026-77204',
    status: 'Completed',
    statusVariant: 'success',
    performedBy: 'James Ortiz · Underwriting',
    insuredName: 'Midwest Fabrication Inc.',
    policyNumber: '01-GL-000009881-0',
    summary:
      'Underwriting task to review five-year loss runs for Midwest Fabrication Inc. was completed. No adverse trends identified; account cleared for renewal processing.',
    fields: [
      { label: 'Task name', value: 'Review Loss Runs' },
      { label: 'Completed by', value: 'James Ortiz' },
      { label: 'Duration', value: '2d 4h open' },
      { label: 'Outcome', value: 'Approved — proceed to renewal' },
    ],
    insights: ['Loss runs match carrier bordereaux; no large claim development since last review.'],
    primaryLink: { label: 'View tasks', to: '/tasks' },
    secondaryLink: { label: 'View policy', to: '/policies/01-GL-000009881-0' },
  },
  {
    id: 'ra-4',
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
    summary:
      'An updated fleet schedule spreadsheet was uploaded via the producer portal. Document is pending underwriting review for vehicle adds and VIN corrections.',
    fields: [
      { label: 'Document', value: 'Fleet_Schedule_Q2_2026.xlsx' },
      { label: 'Source', value: 'Producer portal' },
      { label: 'Pages / size', value: '1 file · 248 KB' },
      { label: 'Review status', value: 'Pending UW review' },
    ],
    insights: ['Three new vehicles flagged — schedule differs from last bound version by +3 units.'],
    primaryLink: { label: 'View documents', to: '/policies/01-CP-000017809-0' },
    secondaryLink: { label: 'View policy', to: '/policies/01-CP-000017809-0' },
  },
  {
    id: 'ra-5',
    kind: 'policy',
    label: 'Policy updated',
    detail: 'Garaging address change posted to 01-BP-000028511-0',
    timestamp: 'Jun 24, 2026',
    referenceId: 'POL-CHG-2026-55102',
    status: 'Posted',
    statusVariant: 'info',
    performedBy: 'Policy Admin · System',
    insuredName: 'Northstar Retail Partners',
    policyNumber: '01-BP-000028511-0',
    summary:
      'Garaging address for three covered locations was updated on the Businessowners policy. Changes were validated against territory rules and posted without endorsement.',
    fields: [
      { label: 'Change type', value: 'Garaging address' },
      { label: 'Locations updated', value: '3' },
      { label: 'New territory', value: 'Cook County, IL' },
      { label: 'Premium impact', value: 'No change' },
    ],
    insights: ['All locations remain within approved territory — no re-rating required.'],
    primaryLink: { label: 'View policy', to: '/policies/01-BP-000028511-0' },
  },
  {
    id: 'ra-6',
    kind: 'claim',
    label: 'Claim note added',
    detail: 'Adjuster uploaded repair estimate for unit 14 on 01-CA-000100005-0',
    timestamp: 'Jun 23, 2026',
    referenceId: 'CLM-2026-004412',
    status: 'In progress',
    statusVariant: 'warning',
    performedBy: 'Lisa Park · Claims adjuster',
    insuredName: 'Atlantic Ridge Construction LLC',
    policyNumber: '01-CA-000100005-0',
    claimNumber: 'CLM-2026-004412',
    summary:
      'Adjuster Lisa Park uploaded a repair estimate for a rear-end collision involving unit 14. Reserve updated pending shop authorization and supplement review.',
    fields: [
      { label: 'Loss date', value: 'Jun 18, 2026' },
      { label: 'Unit', value: '14 · 2022 Chevy Silverado 3500' },
      { label: 'Estimate amount', value: '$18,420' },
      { label: 'Reserve', value: '$22,000' },
    ],
    insights: [
      'Estimate is within fleet average for similar collisions.',
      'Prior claim on unit 14 was closed with no payment — monitor for frequency.',
    ],
    primaryLink: { label: 'View claim', to: '/policies/01-CA-000100005-0' },
    secondaryLink: { label: 'View policy', to: '/policies/01-CA-000100005-0' },
  },
  {
    id: 'ra-7',
    kind: 'billing',
    label: 'Billing notice sent',
    detail: 'Q2 installment invoice delivered for Blue Harbor Logistics Inc.',
    timestamp: 'Jun 22, 2026',
    referenceId: 'INV-2026-Q2-8821',
    status: 'Delivered',
    statusVariant: 'info',
    performedBy: 'Billing · Automated',
    insuredName: 'Blue Harbor Logistics Inc.',
    policyNumber: '01-CA-000021904-0',
    summary:
      'Q2 installment invoice was emailed to the billing contact and producer. Payment is due Jul 15, 2026. Account is current with no past-due balance.',
    fields: [
      { label: 'Invoice amount', value: '$47,250.00' },
      { label: 'Due date', value: 'Jul 15, 2026' },
      { label: 'Payment plan', value: 'Quarterly · 4 installments' },
      { label: 'Delivery', value: 'Email · billing@blueharborlogistics.com' },
    ],
    insights: ['Account paid on time for last three installments — low cancellation risk.'],
    primaryLink: { label: 'View billing', to: '/policies/01-CA-000021904-0' },
    secondaryLink: { label: 'View policy', to: '/policies/01-CA-000021904-0' },
  },
  {
    id: 'ra-8',
    kind: 'quote',
    label: 'Quote bound',
    detail: 'New business policy issued for Summit Outdoor Equipment Inc.',
    timestamp: 'Jun 21, 2026',
    referenceId: 'Q-2026-77102',
    status: 'Bound',
    statusVariant: 'success',
    performedBy: 'Emily Tran · Underwriting',
    insuredName: 'Summit Outdoor Equipment Inc.',
    policyNumber: '01-GL-000031902-0',
    quoteNumber: 'Q-2026-77102',
    summary:
      'New business General Liability quote was bound and converted to policy 01-GL-000031902-0. Coverage is effective Jul 1, 2026 with standard payment terms.',
    fields: [
      { label: 'Line of business', value: 'General Liability' },
      { label: 'Effective date', value: 'Jul 1, 2026' },
      { label: 'Bound premium', value: '$86,400 annual' },
      { label: 'Producer', value: 'Alicia Morales · Summit Agency Partners' },
    ],
    insights: [
      'Quote bound 3 days ahead of effective date — welcome kit scheduled for delivery.',
      'No subjectivities outstanding at bind.',
    ],
    primaryLink: { label: 'View quote', to: '/quotes' },
    secondaryLink: { label: 'View policy', to: '/policies/01-GL-000031902-0' },
  },
]

export const agenticActivityMock: AgenticActivityItem[] = [
  {
    id: 'aa-1',
    agentInitials: 'Q',
    agentName: 'Quoting Agent',
    headline: '45 renewal quotes generated',
    description: 'Automated renewal quotes for commercial auto and package lines.',
    accentColor: '#2563EB',
  },
  {
    id: 'aa-2',
    agentInitials: 'PA',
    agentName: 'Payment Allocation Agent',
    headline: '1,000 payments applied · $1.0M processed',
    description: 'Applied incoming payments across 312 policy accounts.',
    accentColor: '#0D9488',
  },
  {
    id: 'aa-3',
    agentInitials: 'CT',
    agentName: 'Claims Triage & Assignment Agent',
    headline: '18 new claims routed',
    description: 'Routed new FNOL submissions to adjusters by severity and line.',
    accentColor: '#EA580C',
  },
  {
    id: 'aa-4',
    agentInitials: 'CI',
    agentName: 'Certificate of Insurance Agent',
    headline: '7 policy status changes',
    description: 'Updated COI records after endorsement and renewal events.',
    accentColor: '#7C3AED',
  },
  {
    id: 'aa-5',
    agentInitials: 'CR',
    agentName: 'Cancellation & Reinstatement Agent',
    headline: '7 policy status changes',
    description: 'Processed cancellation notices and reinstatement requests.',
    accentColor: '#DC2626',
  },
]

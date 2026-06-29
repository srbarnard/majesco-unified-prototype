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

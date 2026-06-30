import type { AnalyticsKpiMetric, AnalyticsTimeSeriesPoint } from '@/design-system/components/analytics/analyticsStyles'

export type StudioTab = 'chat' | 'prompts' | 'agents' | 'insights'

export type StudioAgentCategory = 'P&C Policy' | 'P&C Billing' | 'P&C Claims'

export type StudioAgentStatus = 'Active' | 'Inactive' | 'Draft'

export type StudioAgent = {
  id: string
  title: string
  description: string
  category: StudioAgentCategory
  kind: string
  version: string
  status: StudioAgentStatus
  lastRun: string
  interactionCount: number
  favorite: boolean
}

export type StudioPromptCategory = 'All products' | 'Policy' | 'Billing' | 'Claims'

export type StudioPrompt = {
  id: string
  title: string
  description: string
  category: Exclude<StudioPromptCategory, 'All products'>
  type: 'system' | 'helper'
  favorite: boolean
}

export type StudioChatThread = {
  id: string
  title: string
  timestamp: string
  agentRun?: boolean
  messages?: StudioChatMessage[]
}

export type StudioChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  elapsedSeconds?: number
}

const agentSeed: Omit<StudioAgent, 'id'>[] = [
  {
    title: 'Commercial Package Quote Creation Agent',
    description: 'Generates rated renewal and new business quotes for commercial package lines with coverage comparison.',
    category: 'P&C Policy',
    kind: 'quote',
    version: 'v2026.03.00',
    status: 'Active',
    lastRun: 'Jun 25, 2026',
    interactionCount: 44,
    favorite: true,
  },
  {
    title: 'Document Agent — Billing',
    description: 'Extracts invoice terms, payment schedules, and billing contacts from uploaded documents.',
    category: 'P&C Billing',
    kind: 'document',
    version: 'v2026.03.00',
    status: 'Active',
    lastRun: 'Jun 25, 2026',
    interactionCount: 58,
    favorite: false,
  },
  {
    title: 'Document Agent — Claims',
    description: 'Summarizes claim notes, estimates, and adjuster reports into structured claim file updates.',
    category: 'P&C Claims',
    kind: 'document',
    version: 'v2026.03.00',
    status: 'Active',
    lastRun: 'Jun 25, 2026',
    interactionCount: 55,
    favorite: false,
  },
  {
    title: 'Commercial Package Cancellation & Reinstatement Agent',
    description: 'Processes cancellation requests, calculates return premium, and handles reinstatement workflows.',
    category: 'P&C Policy',
    kind: 'cancellation',
    version: 'v2026.03.00',
    status: 'Active',
    lastRun: 'Jun 24, 2026',
    interactionCount: 31,
    favorite: false,
  },
  {
    title: 'Payment Allocation Agent',
    description: 'Applies incoming payments across policy accounts and reconciles suspense balances automatically.',
    category: 'P&C Billing',
    kind: 'payment',
    version: 'v2026.02.14',
    status: 'Active',
    lastRun: 'Jun 25, 2026',
    interactionCount: 112,
    favorite: true,
  },
  {
    title: 'Claims Triage & Assignment Agent',
    description: 'Routes new FNOL submissions to adjusters based on severity, line of business, and workload.',
    category: 'P&C Claims',
    kind: 'triage',
    version: 'v2026.03.00',
    status: 'Active',
    lastRun: 'Jun 25, 2026',
    interactionCount: 67,
    favorite: true,
  },
  {
    title: 'Renewal Quote Generation Agent',
    description: 'Automated renewal quotes for commercial auto and package lines with loss run integration.',
    category: 'P&C Policy',
    kind: 'renewal',
    version: 'v2026.03.00',
    status: 'Active',
    lastRun: 'Jun 24, 2026',
    interactionCount: 89,
    favorite: false,
  },
  {
    title: 'Certificate of Insurance Agent',
    description: 'Issues ACORD certificates, validates holder requirements, and tracks outstanding requests.',
    category: 'P&C Policy',
    kind: 'certificate',
    version: 'v2026.02.14',
    status: 'Active',
    lastRun: 'Jun 23, 2026',
    interactionCount: 42,
    favorite: false,
  },
  {
    title: 'Underwriting Referral Agent',
    description: 'Flags accounts exceeding appetite thresholds and prepares referral worksheets for senior UW.',
    category: 'P&C Policy',
    kind: 'underwriting',
    version: 'v2026.02.14',
    status: 'Active',
    lastRun: 'Jun 22, 2026',
    interactionCount: 28,
    favorite: false,
  },
  {
    title: 'Fleet Schedule Validation Agent',
    description: 'Compares uploaded fleet schedules against bound policies and highlights VIN discrepancies.',
    category: 'P&C Policy',
    kind: 'fleet',
    version: 'v2026.01.08',
    status: 'Active',
    lastRun: 'Jun 21, 2026',
    interactionCount: 19,
    favorite: false,
  },
  {
    title: 'Installment Billing Notice Agent',
    description: 'Generates and delivers installment invoices with dunning reminders for past-due accounts.',
    category: 'P&C Billing',
    kind: 'payment',
    version: 'v2026.03.00',
    status: 'Active',
    lastRun: 'Jun 25, 2026',
    interactionCount: 73,
    favorite: false,
  },
  {
    title: 'Reserve Adequacy Review Agent',
    description: 'Reviews claim reserves against similar loss patterns and recommends adjustment thresholds.',
    category: 'P&C Claims',
    kind: 'triage',
    version: 'v2026.02.14',
    status: 'Active',
    lastRun: 'Jun 20, 2026',
    interactionCount: 15,
    favorite: false,
  },
  {
    title: 'Litigation Escalation Agent',
    description: 'Identifies claims approaching litigation thresholds and prepares counsel referral packages.',
    category: 'P&C Claims',
    kind: 'litigation',
    version: 'v2026.01.08',
    status: 'Active',
    lastRun: 'Jun 19, 2026',
    interactionCount: 9,
    favorite: false,
  },
  {
    title: 'Endorsement Processing Agent',
    description: 'Validates endorsement requests, calculates premium impact, and issues policy changes.',
    category: 'P&C Policy',
    kind: 'quote',
    version: 'v2026.03.00',
    status: 'Active',
    lastRun: 'Jun 25, 2026',
    interactionCount: 36,
    favorite: false,
  },
  {
    title: 'Producer Commission Reconciliation Agent',
    description: 'Matches commission statements to bound policies and flags discrepancies for review.',
    category: 'P&C Billing',
    kind: 'payment',
    version: 'v2026.02.14',
    status: 'Active',
    lastRun: 'Jun 18, 2026',
    interactionCount: 22,
    favorite: false,
  },
  {
    title: 'Loss Run Retrieval Agent',
    description: 'Requests and ingests carrier loss runs, normalizes data, and attaches to underwriting files.',
    category: 'P&C Policy',
    kind: 'document',
    version: 'v2026.02.14',
    status: 'Active',
    lastRun: 'Jun 17, 2026',
    interactionCount: 47,
    favorite: false,
  },
  {
    title: 'Subrogation Recovery Agent',
    description: 'Tracks subrogation opportunities, drafts demand letters, and monitors recovery timelines.',
    category: 'P&C Claims',
    kind: 'litigation',
    version: 'v2026.01.08',
    status: 'Active',
    lastRun: 'Jun 16, 2026',
    interactionCount: 11,
    favorite: false,
  },
  {
    title: 'Policy Document Indexing Agent',
    description: 'Classifies uploaded policy documents and extracts key metadata for search and retrieval.',
    category: 'P&C Policy',
    kind: 'document',
    version: 'v2026.03.00',
    status: 'Active',
    lastRun: 'Jun 25, 2026',
    interactionCount: 61,
    favorite: false,
  },
  {
    title: 'Premium Audit Preparation Agent',
    description: 'Gathers payroll and exposure data for upcoming audits and flags potential audit variances.',
    category: 'P&C Billing',
    kind: 'underwriting',
    version: 'v2026.02.14',
    status: 'Active',
    lastRun: 'Jun 15, 2026',
    interactionCount: 8,
    favorite: false,
  },
  {
    title: 'FNOL Intake & Validation Agent',
    description: 'Validates first notice of loss submissions and enriches claim files with policy context.',
    category: 'P&C Claims',
    kind: 'triage',
    version: 'v2026.03.00',
    status: 'Active',
    lastRun: 'Jun 25, 2026',
    interactionCount: 52,
    favorite: false,
  },
  {
    title: 'Renewal Retention Outreach Agent',
    description: 'Drafts producer outreach for at-risk renewals with competitive positioning and loss summaries.',
    category: 'P&C Policy',
    kind: 'renewal',
    version: 'v2026.02.14',
    status: 'Active',
    lastRun: 'Jun 14, 2026',
    interactionCount: 33,
    favorite: false,
  },
  {
    title: 'Suspense Account Resolution Agent',
    description: 'Identifies unmatched payments in suspense and proposes allocation across open balances.',
    category: 'P&C Billing',
    kind: 'payment',
    version: 'v2026.01.08',
    status: 'Active',
    lastRun: 'Jun 13, 2026',
    interactionCount: 26,
    favorite: false,
  },
  {
    title: 'Medical Bill Review Agent',
    description: 'Reviews medical bills against fee schedules and flags outliers for adjuster review.',
    category: 'P&C Claims',
    kind: 'document',
    version: 'v2026.02.14',
    status: 'Active',
    lastRun: 'Jun 12, 2026',
    interactionCount: 18,
    favorite: false,
  },
  {
    title: 'Quote Comparison Agent',
    description: 'Compares competing quotes side-by-side and highlights coverage gaps for producer review.',
    category: 'P&C Policy',
    kind: 'quote',
    version: 'v2026.01.08',
    status: 'Inactive',
    lastRun: 'Jun 10, 2026',
    interactionCount: 14,
    favorite: false,
  },
  {
    title: 'Compliance Document Review Agent',
    description: 'Validates regulatory filings and state-specific compliance documents before submission.',
    category: 'P&C Policy',
    kind: 'underwriting',
    version: 'v2026.01.08',
    status: 'Draft',
    lastRun: '—',
    interactionCount: 0,
    favorite: false,
  },
]

export const studioAgentsMock: StudioAgent[] = agentSeed.map((agent, index) => ({
  id: `agent-${String(index + 1).padStart(3, '0')}`,
  ...agent,
}))

export const studioPromptsMock: StudioPrompt[] = [
  {
    id: 'prompt-1',
    title: 'Show me all billing terms and effective dates',
    description:
      'Can you show me all billing terms, installment schedules, and effective dates for policy [POLICY NUMBER]?',
    category: 'Billing',
    type: 'system',
    favorite: true,
  },
  {
    id: 'prompt-2',
    title: 'Find policy',
    description: 'Look up policy [POLICY NUMBER] and summarize coverage, status, and recent activity.',
    category: 'Policy',
    type: 'helper',
    favorite: false,
  },
  {
    id: 'prompt-3',
    title: 'List all policies under account',
    description: 'Show all active and pending policies for insured [ACCOUNT NAME] with expiration dates.',
    category: 'Policy',
    type: 'system',
    favorite: false,
  },
  {
    id: 'prompt-4',
    title: 'Which claims need my attention?',
    description: 'Summarize open claims assigned to me with reserves above threshold and aging over 14 days.',
    category: 'Claims',
    type: 'system',
    favorite: true,
  },
  {
    id: 'prompt-5',
    title: 'Summarize upcoming renewals',
    description: 'List renewals due in the next 60 days sorted by premium with loss ratio trends.',
    category: 'Policy',
    type: 'helper',
    favorite: false,
  },
  {
    id: 'prompt-6',
    title: 'Generate renewal quote package',
    description: 'Create a renewal quote for policy [POLICY NUMBER] including loss runs and rate indication.',
    category: 'Policy',
    type: 'system',
    favorite: false,
  },
  {
    id: 'prompt-7',
    title: 'Review past-due invoices',
    description: 'Show all accounts with invoices past due over 30 days and total outstanding balance.',
    category: 'Billing',
    type: 'helper',
    favorite: false,
  },
  {
    id: 'prompt-8',
    title: 'Draft claim status update',
    description: 'Write a producer-friendly status update for claim [CLAIM NUMBER] including reserve and next steps.',
    category: 'Claims',
    type: 'helper',
    favorite: false,
  },
  {
    id: 'prompt-9',
    title: 'Compare fleet schedule to policy',
    description: 'Compare the latest fleet schedule upload against bound vehicles on policy [POLICY NUMBER].',
    category: 'Policy',
    type: 'system',
    favorite: false,
  },
]

export const studioChatThreadsMock: StudioChatThread[] = [
  {
    id: 'chat-billing',
    title: 'Can you show me all billing terms and effective dates',
    timestamp: 'Today',
    messages: [
      {
        id: 'chat-billing-u1',
        role: 'user',
        content:
          'Can you show me all billing terms and effective dates for policy [POLICY NUMBER]?',
      },
      {
        id: 'chat-billing-a1',
        role: 'assistant',
        content:
          'The policy number you provided appears to be incomplete or invalid. Please provide the exact policy number so I can retrieve all billing terms and effective dates for you.',
        elapsedSeconds: 4.14,
      },
    ],
  },
  { id: 'chat-1', title: 'Which claims need my attention?', timestamp: 'Today', agentRun: false },
  { id: 'chat-2', title: 'Run Commercial Package Quote Creation Agent', timestamp: 'Today', agentRun: true },
  { id: 'chat-3', title: 'Run Payment Allocation Agent', timestamp: 'Today', agentRun: true },
  { id: 'chat-4', title: 'Summarize upcoming renewals', timestamp: 'Yesterday', agentRun: false },
  { id: 'chat-5', title: 'Create a note for HO13413 claim file', timestamp: 'Yesterday', agentRun: false },
  { id: 'chat-6', title: 'Review loss runs for Midwest Fabrication', timestamp: 'Jun 24, 2026', agentRun: false },
]

export const studioInsightsKpis: AnalyticsKpiMetric[] = [
  {
    id: 'interactions',
    title: 'Total interactions',
    value: '793',
    trend: { direction: 'up', label: '12% vs prior period' },
    tone: 'positive',
  },
  {
    id: 'messages',
    title: 'Total messages',
    value: '1,619',
    trend: { direction: 'up', label: '8% vs prior period' },
    tone: 'positive',
  },
  {
    id: 'avg-messages',
    title: 'Avg messages / interaction',
    value: '2.0',
    trend: { direction: 'neutral', label: 'Stable' },
    tone: 'neutral',
  },
  {
    id: 'active-agents',
    title: 'Active agents',
    value: '23',
    trend: { direction: 'up', label: '2 added this month' },
    tone: 'positive',
  },
]

export const studioInteractionTrend: AnalyticsTimeSeriesPoint[] = [
  { label: 'Jun 23', value: 98 },
  { label: 'Jun 24', value: 112 },
  { label: 'Jun 25', value: 87 },
  { label: 'Jun 26', value: 124 },
  { label: 'Jun 27', value: 105 },
  { label: 'Jun 28', value: 91 },
  { label: 'Jun 29', value: 166 },
  { label: 'Jun 30', value: 10 },
]

export const studioPromptCategories: StudioPromptCategory[] = ['All products', 'Policy', 'Billing', 'Claims']

export const studioAgentStatusFilters: StudioAgentStatus[] = ['Active', 'Inactive', 'Draft']

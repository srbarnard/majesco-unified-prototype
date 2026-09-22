import type { AnalyticsKpiMetric, AnalyticsTimeSeriesPoint } from '@/design-system/components/analytics/analyticsStyles'
import { copilotDrawerPromptGroups } from '@/pages/policies/components/copilot/copilotDrawerData'

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

export type StudioPromptCategory = 'All products' | 'Actions' | 'Information' | 'Help' | 'Other'

export type StudioPrompt = {
  id: string
  title: string
  description: string
  category: Exclude<StudioPromptCategory, 'All products'>
  type: 'action' | 'prompt'
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

export const studioPromptsMock: StudioPrompt[] = copilotDrawerPromptGroups.flatMap((group) => {
  const category = group.label as Exclude<StudioPromptCategory, 'All products'>
  const type: StudioPrompt['type'] = group.id === 'actions' ? 'action' : 'prompt'
  return group.prompts.map((prompt) => ({
    id: prompt.id,
    title: prompt.title,
    description: `${group.label} prompt shared with the Copilot drawer.`,
    category,
    type,
    favorite: prompt.favorite,
  }))
})

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
  {
    id: 'chat-1',
    title: 'Which claims need my attention?',
    timestamp: 'Today',
    agentRun: false,
    messages: [
      {
        id: 'chat-1-u1',
        role: 'user',
        content: 'Which claims need my attention?',
      },
      {
        id: 'chat-1-a1',
        role: 'assistant',
        content:
          'Three open claims need attention: CLM-2026-004412 (reserve review), CLM-2026-003891 (awaiting estimate), and CLM-2026-003104 (litigation referral pending). I can summarize any of these in detail.',
        elapsedSeconds: 3.62,
      },
    ],
  },
  {
    id: 'chat-2',
    title: 'Run Commercial Package Quote Creation Agent',
    timestamp: 'Today',
    agentRun: true,
    messages: [
      {
        id: 'chat-2-u1',
        role: 'user',
        content: 'Run Commercial Package Quote Creation Agent',
      },
      {
        id: 'chat-2-a1',
        role: 'assistant',
        content:
          'Commercial Package Quote Creation Agent finished for Atlantic Ridge Construction LLC. Draft package is ready with GL, property, and inland marine options. Open the agent run to review rating factors and referral flags.',
        elapsedSeconds: 6.41,
      },
    ],
  },
  {
    id: 'chat-3',
    title: 'Run Payment Allocation Agent',
    timestamp: 'Today',
    agentRun: true,
    messages: [
      {
        id: 'chat-3-u1',
        role: 'user',
        content: 'Run Payment Allocation Agent',
      },
      {
        id: 'chat-3-a1',
        role: 'assistant',
        content:
          'Payment Allocation Agent applied $48,250 across 6 open invoices for Midwest Fabrication Inc. Two residual credits remain unmatched and need producer confirmation.',
        elapsedSeconds: 5.27,
      },
    ],
  },
  {
    id: 'chat-4',
    title: 'Summarize upcoming renewals',
    timestamp: 'Yesterday',
    agentRun: false,
    messages: [
      {
        id: 'chat-4-u1',
        role: 'user',
        content: 'Summarize upcoming renewals',
      },
      {
        id: 'chat-4-a1',
        role: 'assistant',
        content:
          'You have 14 renewals due in the next 60 days totaling $2.4M in premium. Four accounts show loss ratio increases above 10 points — I recommend prioritizing Atlantic Ridge Construction and Red Oak Hospitality Group.',
        elapsedSeconds: 5.08,
      },
    ],
  },
  {
    id: 'chat-5',
    title: 'Create a note for HO13413 claim file',
    timestamp: 'Yesterday',
    agentRun: false,
    messages: [
      {
        id: 'chat-5-u1',
        role: 'user',
        content: 'Create a note for HO13413 claim file',
      },
      {
        id: 'chat-5-a1',
        role: 'assistant',
        content:
          'Draft note ready for claim HO13413: inspected damages confirmed, estimate pending from contractor, and insured notified of next steps. Save to the file or edit before posting.',
        elapsedSeconds: 2.94,
      },
    ],
  },
  {
    id: 'chat-6',
    title: 'Review loss runs for Midwest Fabrication',
    timestamp: 'Jun 24, 2026',
    agentRun: false,
    messages: [
      {
        id: 'chat-6-u1',
        role: 'user',
        content: 'Review loss runs for Midwest Fabrication',
      },
      {
        id: 'chat-6-a1',
        role: 'assistant',
        content:
          '5-year loss runs for Midwest Fabrication show 4 closed claims and 1 open water-damage claim. Frequency is within appetite; severity on the open claim is driving the renewal referral.',
        elapsedSeconds: 4.55,
      },
    ],
  },
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

export const studioPromptCategories: StudioPromptCategory[] = [
  'All products',
  'Actions',
  'Information',
  'Help',
  'Other',
]

export const studioAgentStatusFilters: StudioAgentStatus[] = ['Active', 'Inactive', 'Draft']

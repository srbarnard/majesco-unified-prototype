export type CopilotDrawerPrompt = {
  id: string
  title: string
  favorite: boolean
}

export type CopilotDrawerPromptGroup = {
  id: string
  label: string
  prompts: CopilotDrawerPrompt[]
}

export const copilotDrawerPromptGroups: CopilotDrawerPromptGroup[] = [
  {
    id: 'actions',
    label: 'Actions',
    prompts: [
      { id: 'prompt-policy-change', title: 'Policy Change Intelligence Snapshot', favorite: true },
      { id: 'prompt-payment-risk', title: 'Payment Behavior Risk Analysis', favorite: true },
      { id: 'prompt-360-claim', title: '360 View of Claim', favorite: true },
      { id: 'prompt-pre-bind', title: 'Pre-Bind Assessment', favorite: false },
      { id: 'prompt-claim-snapshot', title: 'Claim Snapshot', favorite: false },
    ],
  },
  {
    id: 'information',
    label: 'Information',
    prompts: [
      { id: 'prompt-find-policy', title: 'Find policy and summarize coverage', favorite: false },
      { id: 'prompt-account-policies', title: 'List all policies under account', favorite: false },
      { id: 'prompt-billing-terms', title: 'Show billing terms and effective dates', favorite: false },
    ],
  },
  {
    id: 'help',
    label: 'Help',
    prompts: [
      { id: 'prompt-how-endorsement', title: 'How do I process an endorsement?', favorite: false },
      { id: 'prompt-how-renewal', title: 'How do I start a renewal quote?', favorite: false },
    ],
  },
  {
    id: 'other',
    label: 'Other',
    prompts: [
      { id: 'prompt-draft-email', title: 'Draft a producer status email', favorite: false },
      { id: 'prompt-create-note', title: 'Create a note for a claim file', favorite: false },
    ],
  },
]

export type CopilotDrawerAgent = {
  id: string
  title: string
  favorite: boolean
}

export type CopilotDrawerAgentGroup = {
  id: string
  label: string
  agents: CopilotDrawerAgent[]
}

export const copilotDrawerAgentGroups: CopilotDrawerAgentGroup[] = [
  {
    id: 'active',
    label: 'Active',
    agents: [
      { id: 'agent-agency-cash', title: 'Agency Cash Allocation Agent', favorite: true },
      { id: 'agent-claim-invoice', title: 'Claim Invoice Processing Agent', favorite: true },
      { id: 'agent-glass-invoice', title: 'Glass Invoice Processing Agent', favorite: true },
      { id: 'agent-payment-allocation', title: 'Payment Allocation Agent', favorite: true },
      { id: 'agent-siu-claims', title: 'SIU Claims Agent', favorite: true },
    ],
  },
  {
    id: 'inactive',
    label: 'Inactive',
    agents: [
      { id: 'agent-quote-comparison', title: 'Quote Comparison Agent', favorite: false },
      { id: 'agent-compliance-review', title: 'Compliance Document Review Agent', favorite: false },
    ],
  },
]

export type CopilotHistoryKind = 'chat' | 'agent' | 'action'

export type CopilotHistoryEntry = {
  id: string
  title: string
  kind: CopilotHistoryKind
  messages: CopilotHistoryMessage[]
}

export type CopilotHistoryMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  elapsedSeconds?: number
}

export const copilotHistoryEntries: CopilotHistoryEntry[] = [
  {
    id: 'history-claims-attention',
    title: 'Which claims need my attention?',
    kind: 'chat',
    messages: [
      {
        id: 'history-claims-attention-u1',
        role: 'user',
        content: 'Which claims need my attention?',
      },
      {
        id: 'history-claims-attention-a1',
        role: 'assistant',
        content:
          '4 claims need immediate action. The highest priority is CL-2026-4781 (Atlantic Ridge Construction) with a $142,500 reserve and missing documentation — the adjuster follow-up is overdue.',
        elapsedSeconds: 5.21,
      },
    ],
  },
  {
    id: 'history-gl-quote-agent',
    title: 'Run GL Quote Creation Agent',
    kind: 'agent',
    messages: [
      {
        id: 'history-gl-quote-agent-u1',
        role: 'user',
        content: 'Run GL Quote Creation Agent for Keystone Commercial Realty.',
      },
      {
        id: 'history-gl-quote-agent-a1',
        role: 'assistant',
        content:
          'The GL Quote Creation Agent generated a rated quote for Keystone Commercial Realty with a quoted premium of $84,200 effective Aug 1, 2026. Coverage comparison and loss run summary are attached.',
        elapsedSeconds: 8.74,
      },
    ],
  },
  {
    id: 'history-midterm-change',
    title: 'Policy Midterm Change Summary',
    kind: 'action',
    messages: [
      {
        id: 'history-midterm-change-u1',
        role: 'user',
        content: 'Summarize the midterm change for policy 01-BP-000009546-0.',
      },
      {
        id: 'history-midterm-change-a1',
        role: 'assistant',
        content:
          'The midterm change added a scheduled location and increased building limits by $250,000, resulting in a prorated additional premium of $1,340 effective Jun 15, 2026.',
        elapsedSeconds: 4.02,
      },
    ],
  },
  {
    id: 'history-high-risk',
    title: 'What high risk accounts need my attention?',
    kind: 'chat',
    messages: [
      {
        id: 'history-high-risk-u1',
        role: 'user',
        content: 'What high risk accounts need my attention?',
      },
      {
        id: 'history-high-risk-a1',
        role: 'assistant',
        content:
          '3 accounts are flagged for immediate underwriting review: Atlantic Ridge Construction (loss ratio 78%), Red Oak Hospitality Group (premium increase pending), and Monarch Office Solutions (missing updated loss runs).',
        elapsedSeconds: 6.42,
      },
    ],
  },
  {
    id: 'history-renewals',
    title: 'Summarize upcoming renewals',
    kind: 'chat',
    messages: [
      {
        id: 'history-renewals-u1',
        role: 'user',
        content: 'Summarize upcoming renewals.',
      },
      {
        id: 'history-renewals-a1',
        role: 'assistant',
        content:
          '18 policies are renewing in the next 90 days and 6 still need quotes started. The nearest is Summit Outdoor Equipment renewing Jun 28 — quoted and awaiting producer response.',
        elapsedSeconds: 5.87,
      },
    ],
  },
  {
    id: 'history-billing-agent',
    title: 'Run Billing Agent',
    kind: 'agent',
    messages: [
      {
        id: 'history-billing-agent-u1',
        role: 'user',
        content: 'Run Billing Agent to reconcile suspense balances.',
      },
      {
        id: 'history-billing-agent-a1',
        role: 'assistant',
        content:
          'The Billing Agent reconciled 12 payments from suspense and matched them to open balances. 2 payments remain unmatched and require manual review.',
        elapsedSeconds: 7.33,
      },
    ],
  },
  {
    id: 'history-billing-plans',
    title: 'Billing & Payment Plan Options',
    kind: 'action',
    messages: [
      {
        id: 'history-billing-plans-u1',
        role: 'user',
        content: 'Show billing and payment plan options for this account.',
      },
      {
        id: 'history-billing-plans-a1',
        role: 'assistant',
        content:
          'This account is eligible for annual, semi-annual, quarterly, and 10-pay monthly plans. The current plan is quarterly with the next installment of $4,210 due Jul 15, 2026.',
        elapsedSeconds: 3.65,
      },
    ],
  },
  {
    id: 'history-gl-quote-mga',
    title: 'GL Quote Creation for MGA',
    kind: 'chat',
    messages: [
      {
        id: 'history-gl-quote-mga-u1',
        role: 'user',
        content: 'Create a GL quote for the MGA submission.',
      },
      {
        id: 'history-gl-quote-mga-a1',
        role: 'assistant',
        content:
          'I drafted a GL quote for the MGA submission with a quoted premium of $62,500. A referral to underwriting is required because the account exceeds the appetite threshold for gross receipts.',
        elapsedSeconds: 6.18,
      },
    ],
  },
  {
    id: 'history-cancellation',
    title: 'Pending cancellation review',
    kind: 'chat',
    messages: [
      {
        id: 'history-cancellation-u1',
        role: 'user',
        content: 'Review pending cancellations.',
      },
      {
        id: 'history-cancellation-a1',
        role: 'assistant',
        content:
          '5 policies have pending cancellations. 2 are for non-payment with a reinstatement window still open, and 3 are insured-requested effective end of month.',
        elapsedSeconds: 4.49,
      },
    ],
  },
  {
    id: 'history-loss-history',
    title: 'Loss history analysis for Keystone Realty',
    kind: 'chat',
    messages: [
      {
        id: 'history-loss-history-u1',
        role: 'user',
        content: 'Analyze loss history for Keystone Realty.',
      },
      {
        id: 'history-loss-history-a1',
        role: 'assistant',
        content:
          'Keystone Realty had 4 claims over the last 3 years totaling $118,000 in incurred losses, driven primarily by water damage. The 3-year loss ratio is 41%, within acceptable range for renewal.',
        elapsedSeconds: 5.95,
      },
    ],
  },
]

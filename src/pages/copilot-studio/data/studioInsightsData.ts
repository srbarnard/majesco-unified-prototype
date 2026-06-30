import type { AnalyticsKpiMetric, AnalyticsTimeSeriesPoint } from '@/design-system/components/analytics/analyticsStyles'

export type StudioInsightsView = 'overview' | 'assistants' | 'agents' | 'email' | 'mcp'

export type StudioInsightsUserRow = {
  id: string
  user: string
  interactions: number
  runs?: number
  agentsUsed?: number
  avgRunsPerInteraction?: number
  messages?: number
  avgMsgPerInteraction?: number
  daysActive?: number
  avgDurationSeconds?: number
}

export type StudioInsightsMailboxRow = {
  id: string
  mailbox: string
  provider: string
  processed: number
  clear: number
  doNotProcess: number
  spam: number
  failed: number
  pending: number
  avgDuration: string
  syncStatus: 'Healthy' | 'Auth Failed'
}

export type StudioInsightsMcpRow = {
  id: string
  date: string
  mcp: string
  tool: string
  status: 'success' | 'failed'
  total: number
  success: number
  failed: number
  avgMs: number
  users: number
}

export const studioInsightsLastUpdated = 'Jun 30, 2026, 4:22 PM'

export const studioOverviewInteractionTrend: AnalyticsTimeSeriesPoint[] = [
  { label: 'Jun 23', value: 45 },
  { label: 'Jun 24', value: 39 },
  { label: 'Jun 25', value: 82 },
  { label: 'Jun 26', value: 85 },
  { label: 'Jun 27', value: 18 },
  { label: 'Jun 28', value: 16 },
  { label: 'Jun 29', value: 166 },
  { label: 'Jun 30', value: 135 },
]

export const studioOverviewCreditTrend: AnalyticsTimeSeriesPoint[] = [
  { label: 'Jun 23', value: 0 },
  { label: 'Jun 24', value: 0 },
  { label: 'Jun 25', value: 0 },
  { label: 'Jun 26', value: 0 },
  { label: 'Jun 27', value: 0 },
  { label: 'Jun 28', value: 0 },
  { label: 'Jun 29', value: 0 },
  { label: 'Jun 30', value: 0 },
]

export const studioAssistantsKpis: AnalyticsKpiMetric[] = [
  {
    id: 'assistant-interactions',
    title: 'Total assistant interactions',
    value: '584',
    trend: { direction: 'neutral', label: 'in the selected time period' },
    tone: 'neutral',
  },
  {
    id: 'assistant-messages',
    title: 'Chat messages sent',
    value: '1,358',
    trend: { direction: 'neutral', label: 'in the selected time period' },
    tone: 'neutral',
  },
  {
    id: 'assistant-avg-messages',
    title: 'Avg messages / interaction',
    value: '2.3',
    trend: { direction: 'neutral', label: 'in the selected time period' },
    tone: 'neutral',
  },
]

export const studioAssistantsTrend: AnalyticsTimeSeriesPoint[] = studioOverviewInteractionTrend

export const studioAssistantsUsers: StudioInsightsUserRow[] = [
  { id: 'u1', user: 'Test Automation', interactions: 142, messages: 318, avgMsgPerInteraction: 2.2, daysActive: 7, avgDurationSeconds: 48 },
  { id: 'u2', user: 'Tanmay.Yendhe', interactions: 98, messages: 214, avgMsgPerInteraction: 2.2, daysActive: 6, avgDurationSeconds: 52 },
  { id: 'u3', user: 'ROHAN.NAIK', interactions: 76, messages: 168, avgMsgPerInteraction: 2.2, daysActive: 5, avgDurationSeconds: 44 },
  { id: 'u4', user: 'Default Administrator', interactions: 64, messages: 142, avgMsgPerInteraction: 2.2, daysActive: 5, avgDurationSeconds: 39 },
  { id: 'u5', user: 'pradipto.talukdar', interactions: 58, messages: 126, avgMsgPerInteraction: 2.2, daysActive: 4, avgDurationSeconds: 41 },
  { id: 'u6', user: 'Sarah.Mitchell', interactions: 42, messages: 96, avgMsgPerInteraction: 2.3, daysActive: 4, avgDurationSeconds: 37 },
  { id: 'u7', user: 'James.Chen', interactions: 38, messages: 84, avgMsgPerInteraction: 2.2, daysActive: 3, avgDurationSeconds: 35 },
]

export const studioAgentsKpis: AnalyticsKpiMetric[] = [
  {
    id: 'agent-interactions',
    title: 'Total agent interactions',
    value: '213',
    trend: { direction: 'neutral', label: 'in the selected time period' },
    tone: 'neutral',
  },
  {
    id: 'agent-runs',
    title: 'Total runs',
    value: '280',
    trend: { direction: 'neutral', label: 'in the selected time period' },
    tone: 'neutral',
  },
  {
    id: 'agent-avg-runs',
    title: 'Avg runs / interaction',
    value: '1.3',
    trend: { direction: 'neutral', label: 'in the selected time period' },
    tone: 'neutral',
  },
]

export const studioAgentsTrend: AnalyticsTimeSeriesPoint[] = [
  { label: 'Jun 23', value: 41 },
  { label: 'Jun 24', value: 9 },
  { label: 'Jun 25', value: 23 },
  { label: 'Jun 26', value: 34 },
  { label: 'Jun 27', value: 97 },
  { label: 'Jun 28', value: 54 },
  { label: 'Jun 29', value: 38 },
  { label: 'Jun 30', value: 21 },
]

export const studioAgentsUsers: StudioInsightsUserRow[] = [
  { id: 'a1', user: 'Default Administrator', interactions: 48, runs: 62, agentsUsed: 4, avgRunsPerInteraction: 1.3 },
  { id: 'a2', user: 'pradipto.talukdar', interactions: 36, runs: 47, agentsUsed: 3, avgRunsPerInteraction: 1.3 },
  { id: 'a3', user: 'Tanmay.Yendhe', interactions: 28, runs: 36, agentsUsed: 3, avgRunsPerInteraction: 1.3 },
  { id: 'a4', user: 'ROHAN.NAIK', interactions: 24, runs: 31, agentsUsed: 2, avgRunsPerInteraction: 1.3 },
  { id: 'a5', user: 'Sarah.Mitchell', interactions: 22, runs: 28, agentsUsed: 2, avgRunsPerInteraction: 1.3 },
  { id: 'a6', user: 'James.Chen', interactions: 18, runs: 24, agentsUsed: 2, avgRunsPerInteraction: 1.3 },
  { id: 'a7', user: 'Test Automation', interactions: 16, runs: 21, agentsUsed: 2, avgRunsPerInteraction: 1.3 },
]

export const studioEmailKpis: AnalyticsKpiMetric[] = [
  { id: 'email-processed', title: 'Email processed', value: '45', trend: { direction: 'neutral', label: 'across 2 active mailboxes' }, tone: 'neutral' },
  { id: 'email-clear', title: 'Clear — routed to agent', value: '25', trend: { direction: 'neutral', label: '55.6% — routed to agent' }, tone: 'positive' },
  { id: 'email-dnp', title: 'Did Not Process', value: '14', trend: { direction: 'neutral', label: '31.1% — not routed' }, tone: 'neutral' },
  { id: 'email-spam', title: 'Spam', value: '0', trend: { direction: 'neutral', label: '0.0% — junk/phish' }, tone: 'neutral' },
  { id: 'email-failed', title: 'Failed', value: '3', trend: { direction: 'neutral', label: '6.7% — processing failed' }, tone: 'negative' },
  { id: 'email-pending', title: 'Pending', value: '3', trend: { direction: 'neutral', label: '6.7% — pending' }, tone: 'neutral' },
]

export const studioEmailMailboxes: StudioInsightsMailboxRow[] = [
  {
    id: 'mb1',
    mailbox: 'pc-claims-agent',
    provider: 'OUTLOOK',
    processed: 45,
    clear: 25,
    doNotProcess: 14,
    spam: 0,
    failed: 3,
    pending: 3,
    avgDuration: '62.3s',
    syncStatus: 'Healthy',
  },
  {
    id: 'mb2',
    mailbox: 'pnc-policy-mailbox',
    provider: 'OUTLOOK',
    processed: 0,
    clear: 0,
    doNotProcess: 0,
    spam: 0,
    failed: 0,
    pending: 0,
    avgDuration: '—',
    syncStatus: 'Auth Failed',
  },
]

export const studioMcpKpis: AnalyticsKpiMetric[] = [
  { id: 'mcp-calls', title: 'Total Calls', value: '8', trend: { direction: 'neutral', label: 'in the selected time period' }, tone: 'neutral' },
  { id: 'mcp-success', title: 'Success Rate', value: '100.0%', trend: { direction: 'neutral', label: '0 failed' }, tone: 'positive' },
  { id: 'mcp-duration', title: 'Avg Duration', value: '2035 ms', trend: { direction: 'neutral', label: 'in the selected time period' }, tone: 'neutral' },
  { id: 'mcp-tracked', title: 'MCPs Tracked', value: '7', trend: { direction: 'neutral', label: 'in the selected time period' }, tone: 'neutral' },
]

export const studioMcpInvocationTrend: AnalyticsTimeSeriesPoint[] = [
  { label: 'Jun 23', value: 0 },
  { label: 'Jun 24', value: 0 },
  { label: 'Jun 25', value: 6 },
  { label: 'Jun 26', value: 0 },
  { label: 'Jun 27', value: 0 },
  { label: 'Jun 28', value: 0 },
  { label: 'Jun 29', value: 0 },
  { label: 'Jun 30', value: 2 },
]

export const studioMcpInvocations: StudioInsightsMcpRow[] = [
  {
    id: 'm1',
    date: '2026-06-25',
    mcp: 'ClaimMCPServer',
    tool: 'Retrieve Claim Details',
    status: 'success',
    total: 2,
    success: 2,
    failed: 0,
    avgMs: 1699,
    users: 1,
  },
]

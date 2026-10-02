import type { AnalyticsKpiMetric, AnalyticsTimeSeriesPoint } from '@/design-system/components/analytics/analyticsStyles'
import type { PulseRange } from '@/app/data/pulseMock'

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

/** Point counts aligned with details-screen PulseChartControls ranges. */
const INSIGHTS_RANGE_POINT_COUNTS: Record<PulseRange, number> = {
  '30D': 8,
  '90D': 14,
  '6M': 24,
}

export function sliceStudioInsightsSeriesByRange<T>(data: T[], range: PulseRange): T[] {
  const count = Math.min(INSIGHTS_RANGE_POINT_COUNTS[range], data.length)
  return data.slice(-count)
}

function buildDailyTrend(values: number[], endLabel = 'Jun 30'): AnalyticsTimeSeriesPoint[] {
  const monthMap: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  }
  const [mon, day] = endLabel.split(' ')
  const endDate = new Date(2026, monthMap[mon] ?? 5, Number(day) || 30)

  return values.map((value, index) => {
    const date = new Date(endDate)
    date.setDate(endDate.getDate() - (values.length - 1 - index))
    const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return { label, value }
  })
}

const overviewInteractionValues = [
  22, 28, 31, 19, 35, 41, 38, 44, 29, 33, 48, 52, 36, 40, 45, 39, 55, 61, 42, 45, 39, 82, 85, 18, 16, 166, 135,
].slice(-24)

const agentsInteractionValues = [
  12, 15, 18, 11, 20, 22, 19, 24, 16, 18, 26, 28, 21, 23, 25, 20, 30, 34, 22, 41, 9, 23, 34, 97, 54, 38, 21,
].slice(-24)

export const studioOverviewInteractionTrend: AnalyticsTimeSeriesPoint[] = buildDailyTrend(overviewInteractionValues)

/** Daily credit consumption — tracks interaction volume with a bit of noise. */
const overviewCreditValues = [
  180, 210, 245, 160, 290, 320, 305, 360, 240, 270, 390, 420, 295, 330, 370, 315, 450, 490, 340, 365, 310, 640, 680, 150, 130, 1280, 1050,
].slice(-24)

export const studioOverviewCreditTrend: AnalyticsTimeSeriesPoint[] = buildDailyTrend(overviewCreditValues)

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
    title: 'Assistant messages sent',
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

export const studioAgentsTrend: AnalyticsTimeSeriesPoint[] = buildDailyTrend(agentsInteractionValues)

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
  { id: 'mcp-calls', title: 'Total Calls', value: '148', trend: { direction: 'neutral', label: 'in the selected time period' }, tone: 'neutral' },
  { id: 'mcp-success', title: 'Success Rate', value: '94.6%', trend: { direction: 'neutral', label: '8 failed' }, tone: 'positive' },
  { id: 'mcp-duration', title: 'Avg Duration', value: '1842 ms', trend: { direction: 'neutral', label: 'in the selected time period' }, tone: 'neutral' },
  { id: 'mcp-tracked', title: 'MCPs Tracked', value: '7', trend: { direction: 'neutral', label: 'in the selected time period' }, tone: 'neutral' },
]

const mcpInvocationValues = [
  2, 1, 3, 2, 0, 4, 3, 1, 2, 5, 2, 0, 1, 4, 3, 4, 2, 1, 3, 5, 2, 6, 3, 4, 2, 1, 5, 8,
].slice(-24)

export const studioMcpInvocationTrend: AnalyticsTimeSeriesPoint[] = buildDailyTrend(mcpInvocationValues)

export const studioMcpInvocations: StudioInsightsMcpRow[] = [
  {
    id: 'm1',
    date: '2026-06-30',
    mcp: 'ClaimMCPServer',
    tool: 'Retrieve Claim Details',
    status: 'success',
    total: 4,
    success: 4,
    failed: 0,
    avgMs: 1699,
    users: 2,
  },
  {
    id: 'm2',
    date: '2026-06-29',
    mcp: 'PolicyMCPServer',
    tool: 'Get Policy Summary',
    status: 'success',
    total: 5,
    success: 5,
    failed: 0,
    avgMs: 1420,
    users: 3,
  },
  {
    id: 'm3',
    date: '2026-06-28',
    mcp: 'QuoteMCPServer',
    tool: 'List Open Quotes',
    status: 'failed',
    total: 2,
    success: 1,
    failed: 1,
    avgMs: 3104,
    users: 1,
  },
  {
    id: 'm4',
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

const mcpPerUserValues = [
  1, 2, 1, 3, 2, 2, 4, 3, 2, 3, 4, 2, 3, 5, 4, 3, 2, 4, 5, 3, 4, 6, 3, 5,
].slice(-24)

export const studioMcpPerUserTrend: AnalyticsTimeSeriesPoint[] = buildDailyTrend(mcpPerUserValues)

export type StudioInsightsMcpUserRow = {
  id: string
  user: string
  calls: number
  tools: number
  avgMs: number
  lastActive: string
}

export const studioMcpUsers: StudioInsightsMcpUserRow[] = [
  { id: 'mu1', user: 'Default Administrator', calls: 42, tools: 6, avgMs: 1580, lastActive: '2026-06-30' },
  { id: 'mu2', user: 'Tanmay.Yendhe', calls: 28, tools: 4, avgMs: 1720, lastActive: '2026-06-30' },
  { id: 'mu3', user: 'pradipto.talukdar', calls: 24, tools: 5, avgMs: 1490, lastActive: '2026-06-29' },
  { id: 'mu4', user: 'ROHAN.NAIK', calls: 18, tools: 3, avgMs: 2010, lastActive: '2026-06-29' },
  { id: 'mu5', user: 'Sarah.Mitchell', calls: 14, tools: 3, avgMs: 1655, lastActive: '2026-06-28' },
  { id: 'mu6', user: 'James.Chen', calls: 12, tools: 2, avgMs: 1880, lastActive: '2026-06-27' },
  { id: 'mu7', user: 'Test Automation', calls: 10, tools: 4, avgMs: 980, lastActive: '2026-06-30' },
]

const mcpDiscoveryValues = [
  0, 1, 0, 0, 2, 1, 0, 1, 0, 2, 1, 0, 0, 1, 3, 0, 1, 0, 2, 1, 0, 1, 2, 1,
].slice(-24)

export const studioMcpDiscoveryTrend: AnalyticsTimeSeriesPoint[] = buildDailyTrend(mcpDiscoveryValues)

export type StudioInsightsMcpDiscoveryRow = {
  id: string
  date: string
  mcp: string
  event: string
  toolsFound: number
  status: 'success' | 'failed'
}

export const studioMcpDiscoveries: StudioInsightsMcpDiscoveryRow[] = [
  {
    id: 'md1',
    date: '2026-06-30',
    mcp: 'ClaimMCPServer',
    event: 'Tool catalog refresh',
    toolsFound: 12,
    status: 'success',
  },
  {
    id: 'md2',
    date: '2026-06-29',
    mcp: 'PolicyMCPServer',
    event: 'Server handshake',
    toolsFound: 8,
    status: 'success',
  },
  {
    id: 'md3',
    date: '2026-06-28',
    mcp: 'BillingMCPServer',
    event: 'Tool catalog refresh',
    toolsFound: 5,
    status: 'success',
  },
  {
    id: 'md4',
    date: '2026-06-26',
    mcp: 'QuoteMCPServer',
    event: 'Schema probe',
    toolsFound: 0,
    status: 'failed',
  },
  {
    id: 'md5',
    date: '2026-06-24',
    mcp: 'DocumentMCPServer',
    event: 'Server handshake',
    toolsFound: 6,
    status: 'success',
  },
]

const mcpErrorValues = [
  0, 0, 1, 0, 0, 2, 0, 1, 0, 0, 1, 0, 0, 0, 2, 1, 0, 0, 1, 0, 0, 1, 0, 2,
].slice(-24)

export const studioMcpErrorTrend: AnalyticsTimeSeriesPoint[] = buildDailyTrend(mcpErrorValues)

export type StudioInsightsMcpErrorRow = {
  id: string
  date: string
  mcp: string
  tool: string
  code: string
  message: string
  count: number
}

export const studioMcpErrors: StudioInsightsMcpErrorRow[] = [
  {
    id: 'me1',
    date: '2026-06-30',
    mcp: 'QuoteMCPServer',
    tool: 'List Open Quotes',
    code: 'TIMEOUT',
    message: 'Upstream quote service exceeded 3s budget',
    count: 2,
  },
  {
    id: 'me2',
    date: '2026-06-28',
    mcp: 'ClaimMCPServer',
    tool: 'Retrieve Claim Details',
    code: 'VALIDATION',
    message: 'Missing claimNumber argument',
    count: 1,
  },
  {
    id: 'me3',
    date: '2026-06-26',
    mcp: 'PolicyMCPServer',
    tool: 'Get Policy Summary',
    code: 'NOT_FOUND',
    message: 'Policy 01-CA-000482 not in book',
    count: 3,
  },
  {
    id: 'me4',
    date: '2026-06-22',
    mcp: 'BillingMCPServer',
    tool: 'Get Invoice Status',
    code: 'RATE_LIMIT',
    message: 'Billing API returned 429',
    count: 2,
  },
]

const mcpAuthFailureValues = [
  0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 0, 1, 0, 1,
].slice(-24)

export const studioMcpAuthFailureTrend: AnalyticsTimeSeriesPoint[] = buildDailyTrend(mcpAuthFailureValues)

export type StudioInsightsMcpAuthFailureRow = {
  id: string
  date: string
  mcp: string
  user: string
  reason: string
  count: number
}

export const studioMcpAuthFailures: StudioInsightsMcpAuthFailureRow[] = [
  {
    id: 'ma1',
    date: '2026-06-30',
    mcp: 'DocumentMCPServer',
    user: 'James.Chen',
    reason: 'Expired OAuth token',
    count: 1,
  },
  {
    id: 'ma2',
    date: '2026-06-27',
    mcp: 'BillingMCPServer',
    user: 'ROHAN.NAIK',
    reason: 'Missing scope: billing.read',
    count: 2,
  },
  {
    id: 'ma3',
    date: '2026-06-23',
    mcp: 'ClaimMCPServer',
    user: 'Sarah.Mitchell',
    reason: 'SSO session revoked',
    count: 1,
  },
  {
    id: 'ma4',
    date: '2026-06-18',
    mcp: 'PolicyMCPServer',
    user: 'Test Automation',
    reason: 'API key rotated',
    count: 3,
  },
]

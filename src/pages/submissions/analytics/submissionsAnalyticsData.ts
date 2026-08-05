import { figmaPalette } from '@/design-system/tokens/figma-palette'
import type { AnalyticsInsight } from '@/design-system/components/analytics/AnalyticsInsightStrip'
import type { AnalyticsFunnelStage } from '@/design-system/components/analytics/charts/AnalyticsFunnelChart'
import type {
  AnalyticsComboPoint,
  AnalyticsDonutSegment,
  AnalyticsKpiMetric,
  AnalyticsTimeSeriesPoint,
} from '@/design-system/components/analytics/analyticsStyles'
import type { AnalyticsFilterBarConfig } from '@/design-system/components/analytics/types'
import type { TasksAgingBucket } from '@/pages/tasks/analytics/tasksAnalyticsData'

const STATUS_COLORS = {
  ready: figmaPalette.green[700],
  blocked: figmaPalette.red[500],
  queue: figmaPalette.lightBlue[500],
  warning: figmaPalette.amber[600],
  neutral: figmaPalette.grey[500],
  teal: figmaPalette.teal[500],
  purple: figmaPalette.purple[700],
  blue: figmaPalette.blue[500],
} as const

export const submissionsAnalyticsFilters: AnalyticsFilterBarConfig = {
  periodChips: ['7D', '30D', '90D', 'QTD', 'YTD'],
  activePeriod: '30D',
  dateRangeLabel: 'May 28 – Jun 26, 2026',
  filters: [
    {
      id: 'line',
      label: 'Line of business',
      value: 'All lines',
      options: [
        'All lines',
        'Commercial Auto',
        'Commercial Package',
        'General Liability',
        'Property',
        'Workers Compensation',
      ],
    },
    {
      id: 'assignee',
      label: 'Assignee',
      value: 'All assignees',
      options: [
        'All assignees',
        'Underwriting Queue',
        'Jordan Ellis',
        'Maria Santos',
        'Alex Rivera',
        'Unassigned',
      ],
    },
    {
      id: 'status',
      label: 'Status',
      value: 'All statuses',
      options: ['All statuses', 'Ready', 'Blocked'],
    },
  ],
}

export const submissionsAnalyticsInsights: AnalyticsInsight[] = [
  {
    id: 'blocking-docs',
    label: '18 submissions blocked on missing docs',
    detail: 'Loss runs and payroll confirmations account for 62% of open blocking issues.',
    tone: 'warning',
  },
  {
    id: 'sla-risk',
    label: '11 intakes past 48h triage SLA',
    detail: 'Commercial Auto mid-market accounts are aging fastest in the Underwriting Queue.',
    tone: 'warning',
  },
  {
    id: 'ready-lift',
    label: 'Ready rate up 5.2 pts',
    detail: 'Producer follow-up templates cut average time-to-ready by 0.7 days this period.',
    tone: 'success',
  },
  {
    id: 'confidence',
    label: 'Low-confidence cluster on package risks',
    detail: '12 Commercial Package submissions sit below 70% intake confidence — review SOV quality.',
    tone: 'info',
  },
]

export const submissionsAnalyticsKpis: AnalyticsKpiMetric[] = [
  {
    id: 'open-submissions',
    title: 'Open submissions',
    value: '124',
    trend: { direction: 'up', label: '9% vs prior 30d' },
    tone: 'neutral',
  },
  {
    id: 'ready-rate',
    title: 'Ready rate',
    value: '61.3%',
    trend: { direction: 'up', label: '5.2 pts vs prior 30d' },
    tone: 'positive',
  },
  {
    id: 'blocked',
    title: 'Blocked',
    value: '48',
    trend: { direction: 'down', label: '6 fewer than prior 30d' },
    tone: 'positive',
  },
  {
    id: 'time-to-ready',
    title: 'Avg time to ready',
    value: '2.4 days',
    trend: { direction: 'down', label: '0.7d faster' },
    tone: 'positive',
  },
]

export const submissionsIntakeFunnel: AnalyticsFunnelStage[] = [
  { id: 'received', label: 'Received', value: 186, color: STATUS_COLORS.queue },
  { id: 'triaged', label: 'Triaged', value: 162, color: STATUS_COLORS.teal },
  { id: 'issues-cleared', label: 'Issues cleared', value: 118, color: STATUS_COLORS.blue },
  { id: 'ready', label: 'Ready for quote', value: 96, color: STATUS_COLORS.ready },
  { id: 'quoted', label: 'Quoted', value: 71, color: STATUS_COLORS.purple },
]

export const submissionsStatusBreakdown: AnalyticsDonutSegment[] = [
  { name: 'Ready', value: 76, color: STATUS_COLORS.ready },
  { name: 'Blocked', value: 48, color: STATUS_COLORS.blocked },
]

export const submissionsLobMix: AnalyticsDonutSegment[] = [
  { name: 'Commercial Auto', value: 38, color: STATUS_COLORS.teal },
  { name: 'Commercial Package', value: 29, color: STATUS_COLORS.purple },
  { name: 'General Liability', value: 24, color: STATUS_COLORS.ready },
  { name: 'Property', value: 18, color: STATUS_COLORS.blue },
  { name: 'Workers Comp', value: 15, color: STATUS_COLORS.warning },
]

export const submissionsIntakeTrend: AnalyticsTimeSeriesPoint[] = [
  { label: 'Wk 1', value: 28 },
  { label: 'Wk 2', value: 31 },
  { label: 'Wk 3', value: 27 },
  { label: 'Wk 4', value: 38 },
]

export const submissionsReadyRateTrend: AnalyticsTimeSeriesPoint[] = [
  { label: 'Wk 1', value: 54 },
  { label: 'Wk 2', value: 56 },
  { label: 'Wk 3', value: 59 },
  { label: 'Wk 4', value: 61 },
]

export const submissionsVsReady: AnalyticsComboPoint[] = [
  { label: 'Wk 1', bar: 28, line: 54 },
  { label: 'Wk 2', bar: 31, line: 56 },
  { label: 'Wk 3', bar: 27, line: 59 },
  { label: 'Wk 4', bar: 38, line: 61 },
]

export const submissionsAgingBottlenecks: TasksAgingBucket[] = [
  { label: 'Loss runs / claims history', value: 4.8, color: STATUS_COLORS.blocked },
  { label: 'Payroll / exposure confirm', value: 4.2, color: STATUS_COLORS.warning },
  { label: 'SOV / schedule quality', value: 3.7, color: STATUS_COLORS.warning },
  { label: 'Producer follow-up lag', value: 3.1, color: STATUS_COLORS.queue },
  { label: 'Appetite / referral hold', value: 2.6, color: STATUS_COLORS.teal },
  { label: 'Address / location verify', value: 2.1, color: STATUS_COLORS.neutral },
]

export type SubmissionsQueuePerformanceRow = {
  id: string
  queue: string
  open: number
  blocked: number
  readyRate: number
  avgDaysToReady: number
  pastSla: number
}

export const submissionsQueuePerformance: SubmissionsQueuePerformanceRow[] = [
  {
    id: '1',
    queue: 'Underwriting Queue',
    open: 42,
    blocked: 19,
    readyRate: 55,
    avgDaysToReady: 2.9,
    pastSla: 7,
  },
  {
    id: '2',
    queue: 'Jordan Ellis',
    open: 18,
    blocked: 6,
    readyRate: 67,
    avgDaysToReady: 2.1,
    pastSla: 1,
  },
  {
    id: '3',
    queue: 'Maria Santos',
    open: 15,
    blocked: 4,
    readyRate: 73,
    avgDaysToReady: 1.8,
    pastSla: 0,
  },
  {
    id: '4',
    queue: 'Alex Rivera',
    open: 21,
    blocked: 9,
    readyRate: 57,
    avgDaysToReady: 2.6,
    pastSla: 3,
  },
  {
    id: '5',
    queue: 'Unassigned',
    open: 12,
    blocked: 5,
    readyRate: 42,
    avgDaysToReady: 3.4,
    pastSla: 4,
  },
]

export const submissionsBlockingIssueMix: AnalyticsDonutSegment[] = [
  { name: 'Missing loss runs', value: 16, color: STATUS_COLORS.blocked },
  { name: 'Payroll / exposure', value: 12, color: STATUS_COLORS.warning },
  { name: 'Incomplete SOV', value: 9, color: STATUS_COLORS.purple },
  { name: 'Driver / vehicle schedule', value: 7, color: STATUS_COLORS.teal },
  { name: 'Other', value: 4, color: STATUS_COLORS.neutral },
]

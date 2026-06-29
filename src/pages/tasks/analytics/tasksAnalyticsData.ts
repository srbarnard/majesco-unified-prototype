import { figmaPalette } from '@/design-system/tokens/figma-palette'
import type { AnalyticsInsight } from '@/design-system/components/analytics/AnalyticsInsightStrip'
import type {
  AnalyticsDonutSegment,
  AnalyticsKpiMetric,
  AnalyticsTimeSeriesPoint,
} from '@/design-system/components/analytics/analyticsStyles'
import type { AnalyticsFilterBarConfig } from '@/design-system/components/analytics/types'

export type TasksAgingBucket = {
  label: string
  value: number
  color: string
}

export type TasksTeamPerformanceRow = {
  id: string
  member: string
  team: string
  openTasks: number
  completionRate: number
  slaAdherence: number
  highPriorityOverdue: number
}

/** Status donut colors aligned with StatusChip variants (info / warning / default / error / success). */
const STATUS_CHART_COLORS = {
  info: figmaPalette.lightBlue[500],
  warning: figmaPalette.amber[600],
  default: figmaPalette.grey[500],
  error: figmaPalette.red[500],
  success: figmaPalette.green[700],
} as const

export const tasksAnalyticsFilters: AnalyticsFilterBarConfig = {
  periodChips: ['7D', '30D', '90D', 'QTD', 'YTD'],
  activePeriod: '30D',
  dateRangeLabel: 'May 28 – Jun 26, 2026',
  filters: [
    {
      id: 'team',
      label: 'Team',
      value: 'All teams',
      options: [
        'All teams',
        'Commercial UW',
        'Policy Services',
        'Enterprise Compliance',
        'BML Commercial Lines',
        'Personal Lines Processing',
        'Distribution Operations',
      ],
    },
    {
      id: 'workflow',
      label: 'Workflow',
      value: 'All workflows',
      options: [
        'All workflows',
        'Claims follow-up',
        'Submissions intake',
        'Renewals',
        'Compliance screening',
        'Auto quote exceptions',
        'Producer support',
      ],
    },
    {
      id: 'priority',
      label: 'Priority',
      value: 'All priorities',
      options: ['All priorities', 'High', 'Medium', 'Low'],
    },
  ],
}

export const tasksAnalyticsInsights: AnalyticsInsight[] = [
  {
    id: 'compliance-sla',
    label: '5 compliance tasks past SLA',
    detail: 'Enterprise Compliance queue aging 5.8 days on average — Tier 2 escalation recommended.',
    tone: 'warning',
  },
  {
    id: 'personal-lines-overdue',
    label: '9 high-priority overdue in Personal Lines',
    detail: 'Auto Installer and Bind Desk carry most same-day bind exceptions this period.',
    tone: 'warning',
  },
  {
    id: 'sla-improvement',
    label: 'SLA compliance up 0.8 pts',
    detail: 'Policy Services and Producer Desk led the gain; screening remains the primary portfolio drag.',
    tone: 'success',
  },
  {
    id: 'submission-volume',
    label: 'Submission intake volume up 14%',
    detail: 'BML queue WIP driven by incomplete SOV documents on 14 active tasks.',
    tone: 'info',
  },
]

export const tasksAnalyticsKpis: AnalyticsKpiMetric[] = [
  {
    id: 'open-tasks',
    title: 'Total open tasks',
    value: '847',
    trend: { direction: 'up', label: '3% vs prior 30d' },
    tone: 'neutral',
  },
  {
    id: 'sla-compliance',
    title: 'SLA compliance',
    value: '94.6%',
    trend: { direction: 'up', label: '0.8 pts vs prior 30d' },
    tone: 'positive',
  },
  {
    id: 'avg-age',
    title: 'Avg age (days)',
    value: '4.2',
    trend: { direction: 'down', label: '−0.3d vs prior 30d' },
    tone: 'positive',
  },
  {
    id: 'completed',
    title: 'Tasks completed this period',
    value: '186',
    trend: { direction: 'up', label: '9% vs prior 30d' },
    tone: 'positive',
  },
]

export const tasksSlaTrend: AnalyticsTimeSeriesPoint[] = [
  { label: 'Wk 1', value: 93.2 },
  { label: 'Wk 2', value: 93.8 },
  { label: 'Wk 3', value: 94.1 },
  { label: 'Wk 4', value: 94.6 },
]

export const tasksStatusBreakdown: AnalyticsDonutSegment[] = [
  { name: 'In progress', value: 218, color: STATUS_CHART_COLORS.info },
  { name: 'Pending', value: 196, color: STATUS_CHART_COLORS.warning },
  { name: 'Open', value: 164, color: STATUS_CHART_COLORS.default },
  { name: 'In review', value: 112, color: STATUS_CHART_COLORS.info },
  { name: 'Exception / Failed', value: 89, color: STATUS_CHART_COLORS.error },
  { name: 'Completed', value: 68, color: STATUS_CHART_COLORS.success },
]

export const tasksAgingBottlenecks: TasksAgingBucket[] = [
  { label: 'Compliance screening', value: 5.8, color: STATUS_CHART_COLORS.error },
  { label: 'Renewal UW review', value: 5.1, color: STATUS_CHART_COLORS.warning },
  { label: 'Claims follow-up', value: 4.6, color: STATUS_CHART_COLORS.warning },
  { label: 'Submission intake (BML)', value: 3.9, color: STATUS_CHART_COLORS.info },
  { label: 'Endorsement processing', value: 3.4, color: STATUS_CHART_COLORS.info },
  { label: 'Producer inquiries', value: 2.8, color: STATUS_CHART_COLORS.default },
]

export const tasksTeamPerformance: TasksTeamPerformanceRow[] = [
  { id: '1', member: 'Jordan Ellis', team: 'Commercial UW — Midwest', openTasks: 58, completionRate: 86, slaAdherence: 90, highPriorityOverdue: 4 },
  { id: '2', member: 'Maria Santos', team: 'Policy Services', openTasks: 47, completionRate: 91, slaAdherence: 93, highPriorityOverdue: 1 },
  { id: '3', member: 'Compliance Ops', team: 'Enterprise Compliance', openTasks: 42, completionRate: 82, slaAdherence: 88, highPriorityOverdue: 5 },
  { id: '4', member: 'Submission Processing', team: 'BML Commercial Lines', openTasks: 64, completionRate: 84, slaAdherence: 88, highPriorityOverdue: 3 },
  { id: '5', member: 'Auto Installer Queue', team: 'Personal Lines Processing', openTasks: 78, completionRate: 80, slaAdherence: 86, highPriorityOverdue: 7 },
  { id: '6', member: 'Bind Desk', team: 'Personal Lines Processing', openTasks: 36, completionRate: 89, slaAdherence: 91, highPriorityOverdue: 2 },
  { id: '7', member: 'Account Support — Producer Desk', team: 'Distribution Operations', openTasks: 29, completionRate: 93, slaAdherence: 95, highPriorityOverdue: 0 },
  { id: '8', member: 'Premium Audit', team: 'Policy Administration', openTasks: 22, completionRate: 90, slaAdherence: 94, highPriorityOverdue: 1 },
]

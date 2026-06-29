import type { PoliciesListFilters } from '@/pages/policies/filters/policiesListFilterTypes'
import type { QuotesListFilters } from '@/pages/quotes/filters/quotesListFilterTypes'
import type { TasksFilters } from '@/pages/tasks/filters/tasksFilterTypes'

export type QuickLookupId =
  | 'policies-expiring-30'
  | 'quotes-ready-booking'
  | 'tasks-high-priority'
  | 'tasks-overdue'
  | 'policies-open-claims'

export type AgenticSearchId =
  | 'high-risk-accounts'
  | 'summarize-renewals'
  | 'claims-attention'
  | 'recent-activity'

export type QuickLookupItem = {
  id: QuickLookupId
  label: string
  description: string
  path: string
}

export type AgenticSearchItem = {
  id: AgenticSearchId
  label: string
  prompt: string
}

export const QUICK_LOOKUPS: QuickLookupItem[] = [
  {
    id: 'policies-expiring-30',
    label: 'Policies expiring in next 30 days',
    description: 'Policies · Expiration · Next 30 days',
    path: '/policies',
  },
  {
    id: 'quotes-ready-booking',
    label: 'Quotes ready for booking',
    description: 'Quotes · Status · Quoted',
    path: '/quotes',
  },
  {
    id: 'tasks-high-priority',
    label: 'High priority tasks',
    description: 'Tasks · Priority · High',
    path: '/tasks',
  },
  {
    id: 'tasks-overdue',
    label: 'Overdue tasks',
    description: 'Tasks · Due date · Past due',
    path: '/tasks',
  },
  {
    id: 'policies-open-claims',
    label: 'Policies with open claims',
    description: 'Policies · Open claims',
    path: '/policies',
  },
]

export const AGENTIC_SEARCHES: AgenticSearchItem[] = [
  {
    id: 'high-risk-accounts',
    label: 'Which high risk accounts need attention?',
    prompt: 'Which high risk accounts need attention?',
  },
  {
    id: 'summarize-renewals',
    label: 'Summarize upcoming renewals',
    prompt: 'Summarize upcoming renewals',
  },
  {
    id: 'claims-attention',
    label: 'What claims need my attention?',
    prompt: 'What claims need my attention?',
  },
  {
    id: 'recent-activity',
    label: 'Show me policies with recent activity',
    prompt: 'Show me policies with recent activity',
  },
]

export const RECENT_SEARCHES = [
  'Atlantic Ridge Construction, LLC',
  'Which claims need my attention?',
  'Policies expiring next 30 days',
  '01-CA-000100005-0',
] as const

export const POLICY_NUMBER_PATTERN = /^\d{2}-[A-Z]{2,3}-\d+-\d$/

export type GlobalSearchAction =
  | { type: 'policy'; policyNumber: string }
  | { type: 'lookup'; id: QuickLookupId }
  | { type: 'agentic'; id: AgenticSearchId }
  | { type: 'agentic-prompt'; prompt: string }

const RECENT_LOOKUP_ALIASES: Record<string, QuickLookupId> = {
  'policies expiring next 30 days': 'policies-expiring-30',
  'policies expiring in next 30 days': 'policies-expiring-30',
}

export function isPolicyNumber(value: string) {
  return POLICY_NUMBER_PATTERN.test(value.trim())
}

export function resolveGlobalSearchInput(query: string): GlobalSearchAction | null {
  const trimmed = query.trim()
  if (!trimmed) return null

  if (isPolicyNumber(trimmed)) {
    return { type: 'policy', policyNumber: trimmed }
  }

  const normalized = trimmed.toLowerCase()

  const aliasLookup = RECENT_LOOKUP_ALIASES[normalized]
  if (aliasLookup) {
    return { type: 'lookup', id: aliasLookup }
  }

  const quickLookup = QUICK_LOOKUPS.find(
    (item) =>
      item.label.toLowerCase() === normalized ||
      item.label.toLowerCase().includes(normalized) ||
      item.description.toLowerCase().includes(normalized),
  )
  if (quickLookup) {
    return { type: 'lookup', id: quickLookup.id }
  }

  const agentic = AGENTIC_SEARCHES.find((item) => item.label.toLowerCase() === normalized)
  if (agentic) {
    return { type: 'agentic', id: agentic.id }
  }

  return { type: 'agentic-prompt', prompt: trimmed }
}

export function resolvePoliciesLookup(id: QuickLookupId): Partial<PoliciesListFilters> | null {
  switch (id) {
    case 'policies-expiring-30':
      return { expirationDatePreset: 'next-30-days' }
    case 'policies-open-claims':
      return { openClaimsOnly: true }
    default:
      return null
  }
}

export function resolveQuotesLookup(id: QuickLookupId): Partial<QuotesListFilters> | null {
  if (id === 'quotes-ready-booking') {
    return { statuses: ['Quoted'] }
  }
  return null
}

export function resolveTasksLookup(id: QuickLookupId): Partial<TasksFilters> | null {
  switch (id) {
    case 'tasks-high-priority':
      return { priorities: ['High'] }
    case 'tasks-overdue':
      return { dueDatePreset: 'past-due' }
    default:
      return null
  }
}

import { priorityTasksMock, type PriorityTaskCard } from '@/app/data/homeMock'
import type { TaskRecord, TaskTheme } from '@/pages/tasks/data/mockTasks'

function normalizePriorityTaskId(id: string) {
  return id.replace(/-clone-(prev|next)$/, '')
}

function refNumberFromId(id: string) {
  return `HOME-${id.replace('pt-', '').toUpperCase()}`
}

function themeForPriority(priority: PriorityTaskCard['priority']): TaskTheme {
  if (priority === 'High') return 'Exception handling'
  if (priority === 'Medium') return 'Producer support'
  return 'Compliance watch'
}

function nextActionForTask(card: PriorityTaskCard) {
  return card.nextActionLabel
}

function descriptionForPriorityTask(card: PriorityTaskCard) {
  const lead = `${card.title} for ${card.account}. Policy ${card.policyNumber} requires follow-up from the home priority queue.`
  const context =
    'Review supporting documents, confirm producer expectations, and document any underwriting or service exceptions before closing the task.'
  const pastDue =
    'This task is past due — prioritize producer outreach, capture blockers in notes, and escalate if binding or renewal deadlines are at risk.'

  return [lead, context, card.isPastDue ? pastDue : null].filter(Boolean).join(' ')
}

export function resolvePriorityTaskRecord(card: PriorityTaskCard): TaskRecord {
  const baseId = normalizePriorityTaskId(card.id)
  const canonical = priorityTasksMock.find((entry) => entry.id === baseId) ?? card

  return {
    id: baseId,
    taskName: canonical.title,
    assigner: 'Workflow Engine',
    assignedTo: 'Chris Reynolds',
    team: 'Account Management',
    priority: canonical.priority,
    priorityReason: `${canonical.priority} priority item on ${canonical.account}; policy ${canonical.policyNumber}.`,
    status: canonical.isPastDue ? 'Started' : 'Pending',
    displayStatus: canonical.isPastDue ? 'Past due' : 'Open',
    nextAction: nextActionForTask(canonical),
    theme: themeForPriority(canonical.priority),
    assignedDate: '2026-06-24',
    dueDate: '2026-06-28',
    assignedLabel: 'Jun 24, 2026',
    dueLabel: canonical.dueLabel,
    ageIndicator: canonical.dueLabel,
    refNumber: refNumberFromId(baseId),
    referenceType: 'Policy',
    agingDays: canonical.isPastDue ? 2 : 1,
    isPastDue: Boolean(canonical.isPastDue),
    hasAiInsights: false,
    description: descriptionForPriorityTask(canonical),
    copilotInsights: [],
    documents: [
      { id: 'doc-1', name: 'Supporting policy documents', status: 'Received', required: true },
      { id: 'doc-2', name: 'Producer correspondence', status: 'Missing', required: false },
    ],
    blockingIssues: canonical.isPastDue ? 'Due date passed without completion.' : null,
    notes: 'Opened from homepage priority tasks.',
    relatedEntities: {
      policyNumber: canonical.policyNumber,
      quoteNumber: null,
      insuredName: canonical.account,
      producer: 'Liberty Group',
      submissionId: null,
      claimNumber: null,
    },
  }
}

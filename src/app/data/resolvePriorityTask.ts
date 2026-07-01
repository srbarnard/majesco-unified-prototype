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

function nextActionForTask(title: string, isPastDue?: boolean) {
  if (isPastDue) {
    return `Resolve overdue items for "${title}" and update task status when complete.`
  }
  return `Review account context and complete "${title}" before the due date.`
}

function descriptionForPriorityTask(card: PriorityTaskCard) {
  const lead = `${card.title} for ${card.account}. Policy ${card.policyNumber} requires follow-up from the home priority queue.`
  const context =
    'Copilot surfaced this item based on due date, open workflow status, and recent account activity. Review supporting documents, confirm producer expectations, and document any underwriting or service exceptions before closing the task.'
  const pastDue =
    'This task is past due — prioritize producer outreach, capture blockers in notes, and escalate if binding or renewal deadlines are at risk.'
  const closing =
    'Use Ask Copilot to draft a status update, checklist, or referral memo once account context has been validated.'

  return [lead, context, card.isPastDue ? pastDue : null, closing].filter(Boolean).join(' ')
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
    nextAction: nextActionForTask(canonical.title, canonical.isPastDue),
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
    hasAiInsights: true,
    description: descriptionForPriorityTask(canonical),
    copilotInsights: [
      `Insured account: ${canonical.account}.`,
      `Policy ${canonical.policyNumber} is linked to this task.`,
      canonical.isPastDue
        ? 'Task is past due — prioritize outreach and document any blockers.'
        : 'Copilot can draft a status update or next-step checklist for this task.',
    ],
    documents: [
      { name: 'Supporting policy documents', status: 'Received', required: true },
      { name: 'Producer correspondence', status: 'Missing', required: false },
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

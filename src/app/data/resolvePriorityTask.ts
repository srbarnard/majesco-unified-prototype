import { priorityTasksMock, type PriorityTaskCard } from '@/app/data/homeMock'
import type { TaskDocument, TaskRecord, TaskTheme } from '@/pages/tasks/data/mockTasks'

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

/** Distinct attachment sets per priority card so each drawer shows different files. */
function documentsForPriorityTask(taskId: string): TaskDocument[] {
  const sets: Record<string, TaskDocument[]> = {
    'pt-1': [
      { id: 'task-att-proposal-deck', name: 'Proposal deck', status: 'Received', required: true, type: 'pdf' },
      { id: 'task-att-fleet-schedule', name: 'Fleet schedule', status: 'Received', required: true, type: 'spreadsheet' },
      { id: 'task-att-producer-send-confirm', name: 'Producer send confirmation', status: 'Missing', required: false, type: 'email' },
    ],
    'pt-2': [
      { id: 'task-att-priority-loss-runs', name: 'Loss runs excerpt', status: 'Received', required: true, type: 'pdf' },
      { id: 'task-att-loss-trend-sheet', name: 'Loss trend worksheet', status: 'Received', required: false, type: 'spreadsheet' },
      { id: 'task-att-carrier-request', name: 'Carrier retrieval request', status: 'Missing', required: true, type: 'email' },
    ],
    'pt-3': [
      { id: 'task-att-renewal-pricing', name: 'Renewal pricing worksheet', status: 'Received', required: true, type: 'spreadsheet' },
      { id: 'task-att-rate-approval', name: 'Rate approval form', status: 'Missing', required: true, type: 'form' },
      { id: 'task-att-uw-notes-renewal', name: 'UW pricing notes', status: 'Received', required: false, type: 'pdf' },
    ],
    'pt-4': [
      { id: 'task-att-referral-packet', name: 'Group UW referral packet', status: 'Received', required: true, type: 'package' },
      { id: 'task-att-hospitality-sov', name: 'Hospitality SOV', status: 'Received', required: true, type: 'spreadsheet' },
      { id: 'task-att-referral-email', name: 'Referral acknowledgment', status: 'Missing', required: false, type: 'email' },
    ],
    'pt-5': [
      { id: 'task-att-quote-package', name: 'Quote package', status: 'Received', required: true, type: 'package' },
      { id: 'task-att-coverage-summary', name: 'Coverage summary', status: 'Received', required: true, type: 'pdf' },
      { id: 'task-att-quote-email-draft', name: 'Producer quote email', status: 'Missing', required: true, type: 'email' },
    ],
    'pt-6': [
      { id: 'task-att-inspection-report', name: 'Inspection report', status: 'Received', required: true, type: 'pdf' },
      { id: 'task-att-inspection-photos', name: 'Inspection photos', status: 'Received', required: false, type: 'image' },
      { id: 'task-att-followup-schedule', name: 'Follow-up schedule', status: 'Missing', required: true, type: 'spreadsheet' },
    ],
    'pt-7': [
      { id: 'task-att-endorsement-draft', name: 'Endorsement draft', status: 'Received', required: true, type: 'pdf' },
      { id: 'task-att-ai-request', name: 'Additional insured request', status: 'Received', required: true, type: 'form' },
      { id: 'task-att-bind-email', name: 'Bind confirmation email', status: 'Missing', required: true, type: 'email' },
    ],
    'pt-8': [
      { id: 'task-att-ai-cert', name: 'Additional insured certificate', status: 'Received', required: true, type: 'pdf' },
      { id: 'task-att-contract-exhibit', name: 'Contract exhibit scan', status: 'Received', required: false, type: 'image' },
      { id: 'task-att-ai-verification', name: 'AI verification checklist', status: 'Missing', required: true, type: 'form' },
    ],
    'pt-9': [
      { id: 'task-att-billing-ledger', name: 'Billing ledger extract', status: 'Received', required: true, type: 'spreadsheet' },
      { id: 'task-att-invoice-scan', name: 'Disputed invoice scan', status: 'Received', required: true, type: 'image' },
      { id: 'task-att-billing-adjust-note', name: 'Adjustment posting note', status: 'Missing', required: true, type: 'email' },
    ],
    'pt-10': [
      { id: 'task-att-renewal-submission', name: 'Renewal submission packet', status: 'Received', required: true, type: 'package' },
      { id: 'task-att-silverline-loss-runs', name: 'Silverline loss runs', status: 'Missing', required: true, type: 'pdf' },
      { id: 'task-att-renewal-app-form', name: 'Renewal application', status: 'Received', required: true, type: 'form' },
    ],
  }

  return (
    sets[taskId] ?? [
      { id: 'task-att-supporting-policy', name: 'Supporting policy documents', status: 'Received', required: true, type: 'package' },
      { id: 'task-att-producer-correspondence', name: 'Producer correspondence', status: 'Missing', required: false, type: 'email' },
    ]
  )
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
    hasAlert: Boolean(canonical.isPastDue),
    hasAiInsights: false,
    description: descriptionForPriorityTask(canonical),
    copilotInsights: [],
    documents: documentsForPriorityTask(baseId),
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

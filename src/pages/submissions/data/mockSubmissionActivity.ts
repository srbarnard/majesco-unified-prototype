import type { RecentActivityItem } from '@/app/data/homeMock'
import { getActivityTypeChipStatus } from '@/app/pages/home/activityVisuals'
import { submissionsMock } from '@/pages/submissions/data/mockSubmissions'
import type { SubmissionDetailsRecord } from '@/pages/submissions/data/resolveSubmissionContext'
import { isSubmissionAssignmentQueue } from '@/pages/submissions/data/resolveSubmissionContext'

export function isSubmissionNoteActivity(item: RecentActivityItem) {
  return item.label === 'Note added' && Boolean(item.detail?.trim())
}

type SubmissionActivitySource = Pick<
  SubmissionDetailsRecord,
  | 'id'
  | 'submissionNumber'
  | 'insuredName'
  | 'status'
  | 'assignedTo'
  | 'submittedAt'
  | 'issues'
  | 'notes'
  | 'confidence'
>

function submissionHref(submissionNumber: string) {
  return `/submissions/${encodeURIComponent(submissionNumber)}`
}

function documentsHref(submissionNumber: string) {
  return `/submissions/${encodeURIComponent(submissionNumber)}?tab=documents`
}

/**
 * Record-scoped activity for the Submission Overview activity rail.
 * Uses Home ActivityRail timestamps (Today / Yesterday) so day groups render.
 * Kinds vary so ActivityDetailsPanel can show type-specific chrome.
 */
export function getSubmissionActivity(submission: SubmissionActivitySource): RecentActivityItem[] {
  const href = submissionHref(submission.submissionNumber)
  const docsHref = documentsHref(submission.submissionNumber)
  const openBlocking = submission.issues.filter(
    (issue) => issue.severity === 'blocking' && !issue.resolvedAt,
  )
  const topBlocker = openBlocking[0]
  const assignedIsQueue = isSubmissionAssignmentQueue(submission.assignedTo)
  const note = submission.notes[0]
  const underwriter = assignedIsQueue ? 'Intake · System' : `${submission.assignedTo} · Underwriting`

  const items: RecentActivityItem[] = [
    {
      id: `${submission.id}-act-note`,
      kind: 'task',
      label: note ? 'Note added' : 'Intake review updated',
      detail: note ?? 'Intake review notes updated',
      timestamp: 'Today · 10:12 AM',
      referenceId: `NOTE-${submission.submissionNumber}`,
      status: 'Logged',
      statusVariant: getActivityTypeChipStatus('task'),
      performedBy: underwriter,
      insuredName: submission.insuredName,
      submissionNumber: submission.submissionNumber,
      summary: note
        ? `A note was added on ${submission.submissionNumber}: ${note}`
        : `Intake review was updated for ${submission.submissionNumber}.`,
      fields: [
        { label: 'Task name', value: note ? 'Add submission note' : 'Update intake review' },
        { label: 'Submission', value: submission.submissionNumber },
        { label: 'Author', value: assignedIsQueue ? 'System' : submission.assignedTo },
        { label: 'Outcome', value: 'Logged to file' },
      ],
      insights: note
        ? ['Note is visible on Overview and in Copilot briefing context.']
        : ['Intake checklist progressed without a producer follow-up.'],
      primaryLink: { label: 'View submission', to: href },
      secondaryLink: { label: 'View documents', to: docsHref },
    },
    {
      id: `${submission.id}-act-assign`,
      kind: 'task',
      label: assignedIsQueue ? 'Assigned to queue' : 'Assigned to underwriter',
      detail: assignedIsQueue
        ? `Routed to ${submission.assignedTo}`
        : `Assigned to ${submission.assignedTo}`,
      timestamp: 'Today · 9:05 AM',
      referenceId: `ASN-${submission.submissionNumber}`,
      status: assignedIsQueue ? 'Queued' : 'Assigned',
      statusVariant: assignedIsQueue ? 'warning' : getActivityTypeChipStatus('task'),
      performedBy: 'Intake routing · Automated',
      insuredName: submission.insuredName,
      submissionNumber: submission.submissionNumber,
      summary: assignedIsQueue
        ? `Submission ${submission.submissionNumber} was placed in ${submission.assignedTo} pending underwriter pickup.`
        : `Submission ${submission.submissionNumber} was assigned to ${submission.assignedTo}.`,
      fields: [
        { label: 'Task name', value: 'Route submission' },
        { label: 'Submission', value: submission.submissionNumber },
        { label: assignedIsQueue ? 'Queue' : 'Underwriter', value: submission.assignedTo },
        { label: 'Routing', value: assignedIsQueue ? 'Work queue' : 'Named underwriter' },
      ],
      insights: assignedIsQueue
        ? ['Queue ownership keeps the file moving until an underwriter picks it up.']
        : [`${submission.assignedTo} owns next underwriting action on this file.`],
      primaryLink: { label: 'View submission', to: href },
      secondaryLink: { label: 'Open underwriting', to: `${href}?tab=underwriting` },
    },
  ]

  if (topBlocker) {
    items.push({
      id: `${submission.id}-act-flag`,
      kind: 'claim',
      label: topBlocker.title.toLowerCase().includes('payroll')
        ? 'Payroll flagged'
        : 'Clearance item flagged',
      detail: topBlocker.summary,
      timestamp: 'Yesterday · 3:40 PM',
      referenceId: topBlocker.id,
      status: 'Needs action',
      statusVariant: getActivityTypeChipStatus('claim'),
      performedBy: 'Clearance · Automated',
      insuredName: submission.insuredName,
      submissionNumber: submission.submissionNumber,
      claimNumber: topBlocker.id.toUpperCase(),
      summary: `${topBlocker.summary}. ${topBlocker.whyItMatters}`,
      fields: [
        { label: 'Issue', value: topBlocker.title },
        { label: 'Severity', value: topBlocker.severity },
        { label: 'Missing', value: topBlocker.missingDetails.join(', ') || '—' },
        { label: 'Reported', value: topBlocker.reportedAt },
      ],
      insights: [
        'Blocking clearance items hold premium estimation until resolved in Copilot.',
        topBlocker.whyItMatters,
      ],
      primaryLink: { label: 'View submission', to: href },
      secondaryLink: { label: 'View documents', to: docsHref },
    })
  } else if (submission.status === 'Ready') {
    items.push({
      id: `${submission.id}-act-ready`,
      kind: 'quote',
      label: 'Intake cleared for structure',
      detail: `${submission.confidence}% intake complete — ready for structure review`,
      timestamp: 'Yesterday · 3:40 PM',
      referenceId: `CLR-${submission.submissionNumber}`,
      status: 'Ready',
      statusVariant: getActivityTypeChipStatus('quote'),
      performedBy: 'Intake · Automated',
      insuredName: submission.insuredName,
      submissionNumber: submission.submissionNumber,
      quoteNumber: `QTE-${submission.submissionNumber.replace('SUB-', '')}`,
      summary: `Submission ${submission.submissionNumber} cleared intake and is ready for structure recommendation.`,
      fields: [
        { label: 'Milestone', value: 'Intake cleared' },
        { label: 'Submission', value: submission.submissionNumber },
        { label: 'Confidence', value: `${submission.confidence}%` },
        { label: 'Next step', value: 'Review structure options' },
      ],
      insights: [
        'Structure options are available on Overview for underwriter selection.',
        'Risk signals charts refresh with submission-specific loss and exposure history.',
      ],
      primaryLink: { label: 'View submission', to: href },
      secondaryLink: { label: 'Open underwriting', to: `${href}?tab=underwriting` },
    })
  }

  items.push({
    id: `${submission.id}-act-submitted`,
    kind: 'document',
    label: 'Submission received',
    detail: 'Received from producer portal',
    timestamp: 'Yesterday · 11:30 AM',
    referenceId: submission.submissionNumber,
      status: 'Received',
      statusVariant: getActivityTypeChipStatus('document'),
      performedBy: 'Producer portal · Self-service',
    insuredName: submission.insuredName,
    submissionNumber: submission.submissionNumber,
    summary: `Submission ${submission.submissionNumber} for ${submission.insuredName} was received and opened for intake.`,
    fields: [
      { label: 'Document', value: 'Submission package' },
      { label: 'Source', value: 'Producer portal' },
      { label: 'Submission', value: submission.submissionNumber },
      {
        label: 'Submitted',
        value: new Date(submission.submittedAt).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        }),
      },
    ],
    insights: [
      'Intake documents are available on the Documents tab for Copilot review.',
      'Producer portal submission started the clearance checklist.',
    ],
    primaryLink: { label: 'View documents', to: docsHref },
    secondaryLink: { label: 'View submission', to: href },
  })

  // Keep rail density at 4–6 events.
  return items.slice(0, 6)
}

/** Global Activity page account filter — includes seeded submission events for the account. */
export function getActivityForAccount(accountName: string): RecentActivityItem[] {
  const normalized = accountName.trim().toLowerCase()
  if (!normalized) return []

  const fromSubmissions = submissionsMock
    .filter((row) => row.insuredName.trim().toLowerCase() === normalized)
    .flatMap((row) =>
      getSubmissionActivity({
        id: row.id,
        submissionNumber: row.submissionNumber,
        insuredName: row.insuredName,
        status: row.status,
        assignedTo: row.assignedTo,
        submittedAt: row.submittedAt,
        issues: row.issues,
        notes: row.notes,
        confidence: row.confidence,
      }),
    )

  return fromSubmissions
}

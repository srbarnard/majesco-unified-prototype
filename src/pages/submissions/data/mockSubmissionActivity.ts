import type { RecentActivityItem } from '@/app/data/homeMock'
import { submissionsMock } from '@/pages/submissions/data/mockSubmissions'
import type { SubmissionDetailsRecord } from '@/pages/submissions/data/resolveSubmissionContext'
import { isSubmissionAssignmentQueue } from '@/pages/submissions/data/resolveSubmissionContext'

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

/**
 * Record-scoped activity for the Submission Overview activity rail.
 * Uses Home ActivityRail timestamps (Today / Yesterday) so day groups render.
 */
export function getSubmissionActivity(submission: SubmissionActivitySource): RecentActivityItem[] {
  const href = submissionHref(submission.submissionNumber)
  const openBlocking = submission.issues.filter(
    (issue) => issue.severity === 'blocking' && !issue.resolvedAt,
  )
  const topBlocker = openBlocking[0]
  const assignedIsQueue = isSubmissionAssignmentQueue(submission.assignedTo)
  const note = submission.notes[0]

  const items: RecentActivityItem[] = [
    {
      id: `${submission.id}-act-note`,
      kind: 'task',
      label: note ? 'Note added' : 'Intake review updated',
      detail: note ?? 'Intake review notes updated',
      timestamp: 'Today · 10:12 AM',
      referenceId: `NOTE-${submission.submissionNumber}`,
      status: 'Logged',
      statusVariant: 'info',
      performedBy: assignedIsQueue ? 'Intake · System' : `${submission.assignedTo} · Underwriting`,
      insuredName: submission.insuredName,
      submissionNumber: submission.submissionNumber,
      summary: note
        ? `A note was added on ${submission.submissionNumber}: ${note}`
        : `Intake review was updated for ${submission.submissionNumber}.`,
      fields: [
        { label: 'Submission', value: submission.submissionNumber },
        { label: 'Author', value: assignedIsQueue ? 'System' : submission.assignedTo },
      ],
      insights: [],
      primaryLink: { label: 'View submission', to: href },
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
      statusVariant: assignedIsQueue ? 'warning' : 'success',
      performedBy: 'Intake routing · Automated',
      insuredName: submission.insuredName,
      submissionNumber: submission.submissionNumber,
      summary: assignedIsQueue
        ? `Submission ${submission.submissionNumber} was placed in ${submission.assignedTo} pending underwriter pickup.`
        : `Submission ${submission.submissionNumber} was assigned to ${submission.assignedTo}.`,
      fields: [
        { label: 'Submission', value: submission.submissionNumber },
        { label: assignedIsQueue ? 'Queue' : 'Underwriter', value: submission.assignedTo },
      ],
      insights: [],
      primaryLink: { label: 'View submission', to: href },
    },
  ]

  if (topBlocker) {
    items.push({
      id: `${submission.id}-act-flag`,
      kind: 'document',
      label: topBlocker.title.toLowerCase().includes('payroll')
        ? 'Payroll flagged'
        : 'Clearance item flagged',
      detail: topBlocker.summary,
      timestamp: 'Yesterday · 3:40 PM',
      referenceId: topBlocker.id,
      status: 'Needs action',
      statusVariant: 'error',
      performedBy: 'Clearance · Automated',
      insuredName: submission.insuredName,
      submissionNumber: submission.submissionNumber,
      summary: `${topBlocker.summary}. ${topBlocker.whyItMatters}`,
      fields: [
        { label: 'Issue', value: topBlocker.title },
        { label: 'Missing', value: topBlocker.missingDetails.join(', ') || '—' },
      ],
      insights: [],
      primaryLink: { label: 'View submission', to: href },
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
      statusVariant: 'success',
      performedBy: 'Intake · Automated',
      insuredName: submission.insuredName,
      submissionNumber: submission.submissionNumber,
      summary: `Submission ${submission.submissionNumber} cleared intake and is ready for structure recommendation.`,
      fields: [
        { label: 'Submission', value: submission.submissionNumber },
        { label: 'Confidence', value: `${submission.confidence}%` },
      ],
      insights: [],
      primaryLink: { label: 'View submission', to: href },
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
    statusVariant: 'info',
    performedBy: 'Producer portal · Self-service',
    insuredName: submission.insuredName,
    submissionNumber: submission.submissionNumber,
    summary: `Submission ${submission.submissionNumber} for ${submission.insuredName} was received and opened for intake.`,
    fields: [
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
    insights: [],
    primaryLink: { label: 'View submission', to: href },
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

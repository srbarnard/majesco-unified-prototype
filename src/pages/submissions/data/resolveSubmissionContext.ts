import type { PolicyParty } from '@/pages/policies/data/mockPolicyDetails'
import type { OverviewStat } from '@/pages/policies/data/mockOverview'
import {
  submissionsMock,
  type SubmissionIssue,
  type SubmissionListRecord,
  type SubmissionStatus,
  type PremiumEstimate,
  type SubmissionReadyInsight,
} from '@/pages/submissions/data/mockSubmissions'

export type SubmissionDetailsRecord = {
  id: string
  submissionNumber: string
  insuredName: string
  status: SubmissionStatus
  linesOfBusiness: string[]
  assignedTo: string
  submittedAt: string
  submittedAtLabel: string
  confidence: number
  hasAlert: boolean
  issues: SubmissionIssue[]
  premiumEstimates?: PremiumEstimate[]
  readyInsights?: SubmissionReadyInsight[]
  notes: string[]
  producer: string
  underwriter: string
  effectiveTarget: string
  copilotSummary: string
  copilotInsights: string[]
  parties: PolicyParty[]
}

function formatSubmittedAt(value: string) {
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function buildFromListRecord(row: SubmissionListRecord): SubmissionDetailsRecord {
  const openIssues = row.issues.filter((issue) => !issue.resolvedAt)
  const blocking = openIssues.filter((issue) => issue.severity === 'blocking').length

  return {
    id: row.id,
    submissionNumber: row.submissionNumber,
    insuredName: row.insuredName,
    status: row.status,
    linesOfBusiness: row.linesOfBusiness,
    assignedTo: row.assignedTo,
    submittedAt: row.submittedAt,
    submittedAtLabel: formatSubmittedAt(row.submittedAt),
    confidence: row.confidence,
    hasAlert: row.hasAlert,
    issues: row.issues,
    premiumEstimates: row.premiumEstimates,
    readyInsights: row.readyInsights,
    notes: row.notes,
    producer: 'Liberty Specialty Group',
    underwriter: row.assignedTo === 'Underwriting Queue' ? 'Unassigned' : row.assignedTo,
    effectiveTarget: 'TBD — pending clearance',
    copilotSummary:
      row.status === 'Blocked'
        ? `Submission **${row.submissionNumber}** for **${row.insuredName}** is **Blocked** with **${blocking}** blocking issue${blocking === 1 ? '' : 's'}. Resolve gaps in Copilot without leaving the intake flow.`
        : `Submission **${row.submissionNumber}** for **${row.insuredName}** is **Ready** for underwriting review with **${row.confidence}%** confidence.`,
    copilotInsights: [
      `${row.status} · ${row.linesOfBusiness.join(', ')}`,
      `Assigned to ${row.assignedTo}`,
      `Submitted ${formatSubmittedAt(row.submittedAt)}`,
      `${openIssues.length} open issue${openIssues.length === 1 ? '' : 's'} · ${row.confidence}% confidence`,
    ],
    parties: [
      {
        id: 'insured',
        role: 'Named insured',
        name: row.insuredName,
        email: 'contact@insured.example',
        defaultExpanded: true,
      },
      {
        id: 'producer',
        role: 'Producer',
        name: 'Liberty Specialty Group',
        email: 'commercial@libertygroup.com',
      },
      {
        id: 'underwriter',
        role: 'Underwriter',
        name: row.assignedTo === 'Underwriting Queue' ? 'Underwriting Queue' : row.assignedTo,
      },
    ],
  }
}

const fallback = buildFromListRecord(submissionsMock[0])

export function resolveSubmissionContext(submissionId: string | undefined): SubmissionDetailsRecord {
  if (!submissionId) return fallback

  const decoded = decodeURIComponent(submissionId)
  const fromList = submissionsMock.find(
    (row) => row.submissionNumber === decoded || row.id === decoded,
  )

  if (fromList) return buildFromListRecord(fromList)

  return {
    ...fallback,
    id: decoded,
    submissionNumber: decoded,
    insuredName: 'Sample Insured',
    copilotSummary: `Placeholder submission record for **${decoded}**.`,
    copilotInsights: ['Sample submission context for prototype navigation'],
  }
}

export function toSubmissionListRecord(details: SubmissionDetailsRecord): SubmissionListRecord {
  return {
    id: details.id,
    submissionNumber: details.submissionNumber,
    status: details.status,
    insuredName: details.insuredName,
    linesOfBusiness: details.linesOfBusiness,
    assignedTo: details.assignedTo,
    submittedAt: details.submittedAt,
    hasAlert: details.hasAlert,
    confidence: details.confidence,
    issues: details.issues,
    premiumEstimates: details.premiumEstimates,
    readyInsights: details.readyInsights,
    notes: details.notes,
  }
}

export function getSubmissionOverviewStats(submission: SubmissionDetailsRecord): OverviewStat[] {
  const openBlocking = submission.issues.filter(
    (issue) => issue.severity === 'blocking' && !issue.resolvedAt,
  ).length

  return [
    {
      id: 'status',
      label: 'Status',
      value: submission.status,
      helperText: openBlocking > 0 ? `${openBlocking} blocking` : 'Clear to proceed',
      tone: submission.status === 'Ready' ? 'success' : 'error',
    },
    {
      id: 'confidence',
      label: 'Confidence',
      value: `${submission.confidence}%`,
      helperText: submission.status === 'Ready' ? 'Ready to proceed' : 'Needs attention',
      tone: submission.confidence >= 85 ? 'success' : submission.confidence >= 45 ? 'warning' : 'error',
    },
    {
      id: 'assigned',
      label: 'Assigned',
      value: submission.assignedTo.split(' ')[0] ?? submission.assignedTo,
      helperText: submission.assignedTo,
      tone: 'info',
    },
    {
      id: 'submitted',
      label: 'Submitted',
      value: submission.submittedAtLabel.replace(/,.*/, ''),
      helperText: submission.submittedAtLabel,
      tone: 'info',
    },
  ]
}

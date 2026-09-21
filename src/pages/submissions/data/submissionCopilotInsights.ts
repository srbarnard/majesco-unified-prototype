import {
  resolvePremiumStructureOptions,
  type SubmissionListRecord,
} from '@/pages/submissions/data/mockSubmissions'

export type SubmissionCopilotEntryMode = 'insight' | 'status'

/** Router location.state when opening a submission Overview from the grid / after quote send. */
export type SubmissionDetailLocationState = {
  openCopilot?: boolean
  entryMode?: SubmissionCopilotEntryMode
  /** Opaque Copilot confirmation payload — typed at the page boundary. */
  sendConfirmation?: {
    submissionId: string
    message: string
    nextUpLine?: string
    followUpActions: string[]
    sentEmail?: {
      to: string
      subject: string
      body: string
      subtitle: string
      documents: unknown[]
    }
  } | null
}

export type SubmissionInsightBriefing = {
  header: string
  subhead: string
  lines: string[]
  quickActions: string[]
  statusQuickActionLabel: string
  /** @deprecated Prefer header + lines for record briefings */
  summary: string
  insights: string[]
}

function blockerQuickActions(blockerTitle: string): string[] {
  const title = blockerTitle.toLowerCase()
  if (title.includes('ofac')) {
    return [
      'Explain the OFAC hold',
      'Draft a note to compliance',
      'What can proceed vs what is frozen',
    ]
  }
  if (title.includes('sov') || title.includes('statement of values')) {
    return [
      'Explain the SOV gap',
      'Draft a note to the producer',
      'What can proceed vs what is frozen',
    ]
  }
  return [
    'View status & resolve issues',
    'Draft producer follow-up',
    'What can proceed vs what is frozen',
  ]
}

/** Insight-first briefing when opening Copilot from the row icon (not the status chip). */
export function buildSubmissionInsightBriefing(
  submission: SubmissionListRecord,
): SubmissionInsightBriefing {
  const openIssues = submission.issues.filter((issue) => !issue.resolvedAt)
  const blocking = openIssues.filter((issue) => issue.severity === 'blocking')
  const warnings = openIssues.filter((issue) => issue.severity === 'warning')
  const lobLabel = submission.linesOfBusiness.join(', ')
  const noteHint = submission.notes[0]
  const header = `${submission.insuredName} · ${submission.submissionNumber}`

  if (submission.status === 'Blocked') {
    const topBlocker = blocking[0]
    const blockerLabel = topBlocker?.title ?? 'Open issues'
    const missing =
      topBlocker?.missingDetails?.length
        ? topBlocker.missingDetails.join(', ')
        : 'Required underwriting details'
    const lines = [
      topBlocker
        ? `${topBlocker.summary}. ${topBlocker.whyItMatters}`
        : 'Open blocking issues must clear before rating can start.',
      `Hold owner · ${submission.assignedTo}`,
      `Missing · ${missing}`,
      'If this stays blocked, the submission remains out of structure review and the producer cannot receive terms.',
    ]
    const statusQuickActionLabel = 'View status & resolve issues'
    const quickActions = [
      statusQuickActionLabel,
      'Assign blocked submission',
      ...blockerQuickActions(blockerLabel).filter((action) => action !== statusQuickActionLabel),
    ]

    return {
      header,
      subhead: `Blocked · ${blockerLabel}`,
      lines,
      quickActions,
      statusQuickActionLabel,
      summary: `**${submission.insuredName}** (${submission.submissionNumber}) is **Blocked** on **${blockerLabel}**.`,
      insights: lines,
    }
  }

  const options = resolvePremiumStructureOptions(submission.premiumEstimates, {
    linesOfBusiness: submission.linesOfBusiness,
    confidence: submission.confidence,
  })
  const recommended = options.find((option) => option.recommended) ?? options[0]
  const structureSummary =
    options.length > 0
      ? options
          .map(
            (option) =>
              `${option.label} ${option.range}${option.recommended ? ' (recommended)' : ''}`,
          )
          .join(' · ')
      : null
  const readyWarning = submission.readyInsights?.find((insight) => insight.severity === 'warning')
  const statusQuickActionLabel =
    options.length > 0 ? 'View status & structure options' : 'View status details'
  const lines = [
    `Intake complete across **${lobLabel}** at **${submission.confidence}%** confidence.`,
    structureSummary
      ? `Structure options · ${structureSummary}`
      : 'Structure options are available in status review.',
    readyWarning
      ? `Watch-out · ${readyWarning.title} — ${readyWarning.summary}`
      : `Assignment · ${submission.assignedTo}`,
    noteHint
      ? `Producer context · ${noteHint}`
      : `Submitted · ${new Date(submission.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
  ]

  return {
    header,
    subhead: submission.approvedPremiumLabel
      ? `Ready · Approved ${submission.approvedPremiumLabel}`
      : options.length > 0
        ? `Ready · ${options.length} structure option${options.length === 1 ? '' : 's'}${recommended ? ` · recommending ${recommended.label}` : ''}`
        : 'Ready · Awaiting structure approval',
    lines,
    quickActions: [statusQuickActionLabel, 'Summarize for underwriter', 'Ask about exposure'],
    statusQuickActionLabel,
    summary: `**${submission.insuredName}** (${submission.submissionNumber}) is intake-complete. Status is **Ready** at **${submission.confidence}%** confidence across **${lobLabel}**.`,
    insights: [
      `Status · Ready${submission.approvedPremiumLabel ? ` · Approved ${submission.approvedPremiumLabel}` : options.length > 0 ? ` · ${options.length} structure options` : ' · Awaiting structure approval'}`,
      ...lines.slice(1),
      warnings.length
        ? `${warnings.length} warning${warnings.length === 1 ? '' : 's'} still open`
        : `Coverage mix · ${lobLabel}`,
    ],
  }
}

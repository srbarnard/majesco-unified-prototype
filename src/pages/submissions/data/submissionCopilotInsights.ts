import {
  resolvePremiumStructureOptions,
  type SubmissionListRecord,
} from '@/pages/submissions/data/mockSubmissions'

export type SubmissionCopilotEntryMode = 'insight' | 'status'

export type SubmissionInsightBriefing = {
  summary: string
  insights: string[]
  statusQuickActionLabel: string
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

  if (submission.status === 'Blocked') {
    const topBlocker = blocking[0]
    return {
      summary: `**${submission.insuredName}** (${submission.submissionNumber}) is in intake with a **Blocked** status. Copilot sees an actionable **${lobLabel}** account at **${submission.confidence}%** confidence — clear the gaps and structure review can start without leaving this list.`,
      insights: [
        `Status · Blocked · ${blocking.length} blocking issue${blocking.length === 1 ? '' : 's'}${warnings.length ? ` · ${warnings.length} warning${warnings.length === 1 ? '' : 's'}` : ''}`,
        topBlocker
          ? `Priority gap · ${topBlocker.title} — ${topBlocker.summary}`
          : 'Priority gap · Review open issues to unblock rating',
        `Assignment · ${submission.assignedTo}`,
        noteHint
          ? `Producer context · ${noteHint}`
          : `Coverage mix · ${lobLabel}`,
        `Confidence · ${submission.confidence}% once required details are captured`,
      ],
      statusQuickActionLabel: 'View status & resolve issues',
    }
  }

  const options = resolvePremiumStructureOptions(submission.premiumEstimates, {
    linesOfBusiness: submission.linesOfBusiness,
    confidence: submission.confidence,
  })
  const recommended = options.find((option) => option.recommended) ?? options[0]
  const readyWarning = submission.readyInsights?.find((insight) => insight.severity === 'warning')

  return {
    summary: `**${submission.insuredName}** (${submission.submissionNumber}) is intake-complete. Status is **Ready** at **${submission.confidence}%** confidence across **${lobLabel}**. Copilot can brief the account here — open status details when you want to review or approve structure options.`,
    insights: [
      `Status · Ready${submission.approvedPremiumLabel ? ` · Approved ${submission.approvedPremiumLabel}` : ' · Awaiting structure approval'}`,
      recommended
        ? `Structure signal · ${recommended.label} at ${recommended.range}${recommended.recommended ? ' (recommended)' : ''}`
        : `Structure signal · Premium options available in status review`,
      readyWarning
        ? `Watch-out · ${readyWarning.title} — ${readyWarning.summary}`
        : `Assignment · ${submission.assignedTo}`,
      options.length === 1
        ? 'Option set · One distinct structure — alternatives were not meaningful'
        : `Option set · ${options.length || 0} distinct structure option${(options.length || 0) === 1 ? '' : 's'} ready for review`,
      noteHint
        ? `Producer context · ${noteHint}`
        : `Submitted · ${new Date(submission.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
    ],
    statusQuickActionLabel:
      options.length > 0 ? 'View status & structure options' : 'View status details',
  }
}

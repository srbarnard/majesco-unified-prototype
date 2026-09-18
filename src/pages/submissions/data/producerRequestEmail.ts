import type { PolicyDocument } from '@/pages/policies/data/mockDocuments'
import type {
  PremiumEstimate,
  SubmissionIssue,
  SubmissionListRecord,
} from '@/pages/submissions/data/mockSubmissions'

/** Default producer contact used across submission Copilot follow-ups. */
export const SUBMISSION_PRODUCER_EMAIL = 'commercial@libertygroup.com'
export const SUBMISSION_PRODUCER_NAME = 'Liberty Specialty Group'

export function isProducerRequestAction(action: string) {
  if (action === 'Request from producer' || action === 'Draft producer follow-up') return true
  return /^Request\b/i.test(action)
}

export type ProducerRequestEmailDraft = {
  issue: SubmissionIssue | null
  action: string
  to: string
  subject: string
  body: string
}

function bulletList(items: string[]) {
  return items.map((item) => `• ${item}`).join('\n')
}

function formatPremiumRange(range: string) {
  return range.replace(/\s*-\s*/g, '–')
}

function insuredShortName(insuredName: string) {
  return insuredName.replace(/,\s*LLC$/i, '')
}

function requestFocusLine(action: string, issue: SubmissionIssue | null) {
  if (action === 'Draft producer follow-up') {
    return 'Please help us clear the open intake gaps so we can continue underwriting.'
  }
  if (/loss runs/i.test(action)) {
    return 'Specifically, please send the most recent 3–5 year auto loss runs (valued within 90 days) and note any open reserves.'
  }
  if (/mvr/i.test(action)) {
    return 'Please provide current MVRs and hire dates for all scheduled drivers.'
  }
  if (/driver roster|driver list/i.test(action)) {
    return 'Please send the current driver roster with license numbers and years of experience.'
  }
  if (/sov|statement of values/i.test(action)) {
    return 'Please send an updated statement of values (buildings, BPP, and business income).'
  }
  if (/payroll/i.test(action)) {
    return 'Please provide annual payroll and a breakdown by role or class code.'
  }
  if (/commodity/i.test(action)) {
    return 'Please send the commodity schedule with average and maximum load values.'
  }
  if (/narrative|operations/i.test(action)) {
    return 'Please provide a short producer narrative covering primary operations and subcontractor usage.'
  }
  if (issue?.title) {
    return `Please send the information needed to clear “${issue.title}”.`
  }
  return 'Please send the supporting information so we can continue the submission.'
}

export function buildProducerRequestEmail(
  submission: SubmissionListRecord,
  action: string,
  issue: SubmissionIssue | null,
): ProducerRequestEmailDraft {
  const missing =
    issue && issue.missingDetails.length > 0
      ? issue.missingDetails
      : openBlockingMissingDetails(submission)

  const subjectFocus = issue?.title ?? 'intake information'
  const subject = `Information needed — ${subjectFocus} (${submission.submissionNumber})`

  const missingBlock =
    missing.length > 0
      ? `\nWe still need:\n${bulletList(missing)}\n`
      : '\n'

  const body = `Hi,

We're reviewing submission ${submission.submissionNumber} for ${submission.insuredName} (${submission.linesOfBusiness.join(', ')}).

${requestFocusLine(action, issue)}
${missingBlock}
Please reply with the details or attach supporting documents at your earliest convenience. Let me know if you have any questions.

Thank you,
Underwriting`

  return {
    issue,
    action,
    to: SUBMISSION_PRODUCER_EMAIL,
    subject,
    body,
  }
}

/** Visual-only PDF chips for the quote package email (no real files generated). */
export function buildQuotePackageAttachments(submission: SubmissionListRecord): PolicyDocument[] {
  const sub = submission.submissionNumber
  return [
    {
      id: `${submission.id}-quote-letter`,
      fileName: `${sub}_Quote-letter.pdf`,
      name: 'Quote letter',
      kind: 'Document',
      description: 'Producer-facing quote letter for the package.',
      aiSummary: 'Cover letter summarizing the recommended structure.',
      tags: ['Quote package'],
      author: 'Underwriting',
      authorDetail: 'Generated package',
      date: '2026-04-15',
      relativeTime: 'Just now',
      activityLabel: 'Submission',
      activityCount: 0,
      fileSizeBytes: 248_000,
    },
    {
      id: `${submission.id}-option-comparison`,
      fileName: `${sub}_Option-comparison.pdf`,
      name: 'Option comparison',
      kind: 'Document',
      description: 'Side-by-side comparison of included quote options.',
      aiSummary: 'Comparison of recommended and alternative structures.',
      tags: ['Quote package'],
      author: 'Underwriting',
      authorDetail: 'Generated package',
      date: '2026-04-15',
      relativeTime: 'Just now',
      activityLabel: 'Submission',
      activityCount: 0,
      fileSizeBytes: 384_000,
    },
  ]
}

function whyTheyDifferLines(
  submission: SubmissionListRecord,
  recommended: PremiumEstimate,
  included: PremiumEstimate[],
) {
  const allOptions = submission.premiumEstimates ?? []
  const includedIds = new Set(included.map((option) => option.label))
  const excluded = allOptions.filter((option) => !includedIds.has(option.label))
  const alternatives = included.filter((option) => option.label !== recommended.label)

  const lines: string[] = [
    `- ${recommended.label} keeps standard deductibles and current limit structure.`,
  ]

  for (const option of alternatives) {
    if (option.label === 'Optimized') {
      lines.push('- Optimized trades some limit and terms for a lower premium.')
    } else {
      lines.push(`- ${option.label}: ${option.rationale}`)
    }
  }

  for (const option of excluded) {
    if (option.label === 'Conservative') {
      lines.push(
        '- Conservative was not included. More limit than this file supports given construction class and short loss history.',
      )
    } else {
      lines.push(`- ${option.label} was not included. ${option.rationale}`)
    }
  }

  return lines.join('\n')
}

function subjectivityLines(submission: SubmissionListRecord) {
  const fromInsights = (submission.readyInsights ?? []).slice(0, 2).map((insight) => {
    if (/loss/i.test(insight.title)) return 'Updated loss runs if the account binds'
    if (/revenue|exposure|growth/i.test(insight.title) || /exposure|revenue/i.test(insight.summary)) {
      return 'Confirm revenue used for exposure'
    }
    return insight.summary.replace(/\.$/, '')
  })

  if (fromInsights.length >= 2) return fromInsights
  return ['Updated loss runs if the account binds', 'Confirm revenue used for exposure']
}

function emailOptionRationale(option: PremiumEstimate) {
  if (option.label === 'Balanced') {
    return 'Standard deductibles. Best fit for current exposures.'
  }
  if (option.label === 'Optimized') {
    return 'Leaner rate and tighter terms on the multi-line package.'
  }
  return option.rationale
}

/** Quote package email after Structure review — cover note + attachment chips (renewal pattern). */
export function buildQuotePackageEmail(
  submission: SubmissionListRecord,
  recommended: PremiumEstimate,
  included: PremiumEstimate[],
): ProducerRequestEmailDraft {
  const alternatives = included.filter((option) => option.label !== recommended.label)

  const recommendedBlock = `Recommended: ${recommended.label}, ${formatPremiumRange(recommended.range)}
${emailOptionRationale(recommended)}`

  const alsoIncludedBlock =
    alternatives.length > 0
      ? `\n\n${alternatives
          .map(
            (option) =>
              `Also included: ${option.label}, ${formatPremiumRange(option.range)}\n${emailOptionRationale(option)}`,
          )
          .join('\n\n')}`
      : ''

  const subject = `Quote available — ${insuredShortName(submission.insuredName)} (${submission.submissionNumber})`
  const body = `Hi,

A quote package is ready for ${submission.insuredName} (${submission.submissionNumber}).

${recommendedBlock}${alsoIncludedBlock}

Why they differ
${whyTheyDifferLines(submission, recommended, included)}

Subjectivities
${subjectivityLines(submission)
  .map((line) => `- ${line}`)
  .join('\n')}

Please review the attached comparison and tell us how you want to present this.

Thank you,
Underwriting`

  return {
    issue: null,
    action: 'Email quote options to producer',
    to: SUBMISSION_PRODUCER_EMAIL,
    subject,
    body,
  }
}

/** Confirmation copy after sending quote options from Structure review. */
export function buildQuotePackageSendConfirmation(
  submission: SubmissionListRecord,
  recommended: PremiumEstimate,
  included: PremiumEstimate[],
  recipient = SUBMISSION_PRODUCER_EMAIL,
) {
  const alternatives = included.filter((option) => option.label !== recommended.label)
  const lines = [
    `Quote options sent to ${recipient} for ${submission.submissionNumber}.`,
    'Attached: quote letter, option comparison.',
    `Recommended: ${recommended.label} ${formatPremiumRange(recommended.range)}.`,
  ]
  for (const option of alternatives) {
    lines.push(`Also sent: ${option.label} ${formatPremiumRange(option.range)}.`)
  }
  lines.push(`${submission.submissionNumber} is now Quoted.`)
  return lines.join('\n')
}

/** Rebuild Quote sent body from a stored package when reopening a Quoted submission. */
export function buildQuoteSentMessageFromPackage(
  submission: SubmissionListRecord,
  recipient = SUBMISSION_PRODUCER_EMAIL,
) {
  const packageSent = submission.quotePackageSent
  if (!packageSent) {
    return [
      `Quote options sent to ${recipient} for ${submission.submissionNumber}.`,
      'Attached: quote letter, option comparison.',
      submission.approvedPremiumLabel
        ? `Recommended: ${submission.approvedPremiumLabel}.`
        : null,
      `${submission.submissionNumber} is now Quoted.`,
    ]
      .filter(Boolean)
      .join('\n')
  }

  const recommended =
    packageSent.included.find((option) => option.label === packageSent.recommendedLabel) ??
    packageSent.included[0]
  const alternatives = packageSent.included.filter(
    (option) => option.label !== packageSent.recommendedLabel,
  )
  const lines = [
    `Quote options sent to ${packageSent.recipient} for ${submission.submissionNumber}.`,
    `Attached: ${packageSent.attachments.join(', ')}.`,
  ]
  if (recommended) {
    lines.push(
      `Recommended: ${recommended.label} ${formatPremiumRange(recommended.range)}.`,
    )
  }
  for (const option of alternatives) {
    lines.push(`Also sent: ${option.label} ${formatPremiumRange(option.range)}.`)
  }
  lines.push(`${submission.submissionNumber} is now Quoted.`)
  return lines.join('\n')
}

/** Decline-to-quote email — cover note only, no quote attachments. */
export function buildDeclineToQuoteEmail(
  submission: SubmissionListRecord,
): ProducerRequestEmailDraft {
  const watchOut = submission.readyInsights?.find((insight) => insight.severity === 'warning')
  const reasonLine = watchOut
    ? `${watchOut.title} — ${watchOut.summary}`
    : 'Current submission details do not meet our appetite for this class.'

  const subject = `Unable to quote — ${insuredShortName(submission.insuredName)} (${submission.submissionNumber})`
  const body = `Hi,

We are declining to quote ${submission.insuredName} (${submission.submissionNumber}) at this time.

${reasonLine}

Please let us know if the account changes and you would like us to reconsider.

Thank you,
Underwriting`

  return {
    issue: null,
    action: 'Decline to quote',
    to: SUBMISSION_PRODUCER_EMAIL,
    subject,
    body,
  }
}

/** Confirmation copy after sending a decline-to-quote email. */
export function buildDeclineToQuoteSendConfirmation(
  submission: SubmissionListRecord,
  recipient = SUBMISSION_PRODUCER_EMAIL,
) {
  return [
    `Decline to quote sent to ${recipient} for ${submission.submissionNumber}.`,
    `${submission.submissionNumber} is now Declined.`,
  ].join('\n')
}

/** Demo underwriter — used to prefer “assigned to you” Ready follow-ups. */
export const SUBMISSIONS_CURRENT_USER = 'Sarah Thompson'

export function findNextReadySubmission(
  rows: SubmissionListRecord[],
  excludeId: string,
  currentUser = SUBMISSIONS_CURRENT_USER,
): SubmissionListRecord | null {
  const ready = rows.filter((row) => row.status === 'Ready' && row.id !== excludeId)
  if (ready.length === 0) return null
  return ready.find((row) => row.assignedTo === currentUser) ?? ready[0] ?? null
}

export function buildQuoteSentNextUpLine(
  next: SubmissionListRecord | null,
  currentUser = SUBMISSIONS_CURRENT_USER,
) {
  if (!next) return 'No other Ready submissions in this queue.'
  const assignee =
    next.assignedTo === currentUser ? 'assigned to you' : `assigned to ${next.assignedTo}`
  return `Next up in this queue: ${next.submissionNumber} ${next.insuredName} · Ready · ${assignee}.`
}

/** Confirmation copy after sending a blocked-submission request-info email. */
export function buildRequestInfoSendConfirmation(
  submission: SubmissionListRecord,
  issue: SubmissionIssue | null,
  recipient = SUBMISSION_PRODUCER_EMAIL,
) {
  const missing =
    issue && issue.missingDetails.length > 0
      ? issue.missingDetails
      : openBlockingMissingDetails(submission)
  const waitingOn =
    missing.length > 0 ? missing.join(', ') : issue?.title ?? 'requested information'

  return `Request sent to **${recipient}** for **${submission.submissionNumber}**. Waiting on **${waitingOn}**.`
}

function openBlockingMissingDetails(submission: SubmissionListRecord) {
  return submission.issues
    .filter((issue) => issue.severity === 'blocking' && !issue.resolvedAt)
    .flatMap((issue) => issue.missingDetails)
    .filter((value, index, all) => all.indexOf(value) === index)
}

export function producerRequestResolvedDetails(issue: SubmissionIssue, action: string): string[] {
  if (issue.missingDetails.length > 0) {
    return issue.missingDetails.map((item) => `${item}: requested from producer via email (“${action}”)`)
  }
  return [`Producer follow-up emailed (“${action}”)`]
}

export type IssueNoteDraft = {
  issue: SubmissionIssue
  action: string
  subject: string
  body: string
}

export function isAddNoteAction(action: string) {
  return action === 'Add a note' || /^Add a note\b/i.test(action)
}

export function buildIssueNoteDraft(
  submission: SubmissionListRecord,
  issue: SubmissionIssue,
  action = 'Add a note',
): IssueNoteDraft {
  const missingBlock =
    issue.missingDetails.length > 0
      ? `\nMissing details still needed:\n${bulletList(issue.missingDetails)}\n`
      : '\n'

  const subject = `Note — ${issue.title} (${submission.submissionNumber})`
  const body = `Submission: ${submission.submissionNumber}
Insured: ${submission.insuredName}
Issue: ${issue.title} (${issue.severity})

Summary:
${issue.summary}

Why it matters:
${issue.whyItMatters}
${missingBlock}
Underwriter notes:
`

  return {
    issue,
    action,
    subject,
    body,
  }
}

export function issueNoteResolvedDetails(issue: SubmissionIssue, action: string): string[] {
  if (issue.missingDetails.length > 0) {
    return issue.missingDetails.map((item) => `${item}: noted on submission (“${action}”)`)
  }
  return [`Note added to submission (“${action}”)`]
}

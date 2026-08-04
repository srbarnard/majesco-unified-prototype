import type { SubmissionIssue, SubmissionListRecord } from '@/pages/submissions/data/mockSubmissions'

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

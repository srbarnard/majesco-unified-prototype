import type { PolicyDocument } from '@/pages/policies/data/mockDocuments'

/**
 * Initial Commercial Auto intake package — fewer docs than policy/quote workspaces.
 * Reflects what a producer typically sends to request a quote.
 */
export const submissionDocumentsMock: PolicyDocument[] = [
  {
    id: 'sdoc-1',
    fileName: 'acord_127_business_auto.pdf',
    name: 'ACORD 127 — Business Auto Section',
    kind: 'Form',
    description: 'Completed Business Auto application section for Commercial Auto quote request.',
    aiSummary:
      'Named insured Atlantic Ridge Construction; operations landscaping/construction; requested CSL $1M and hired/non-owned auto.',
    tags: ['Application', 'ACORD 127'],
    author: 'Maria Alvarez',
    authorDetail: 'Producer portal upload',
    date: '2026-06-22',
    relativeTime: '2d ago',
    activityLabel: 'Submission',
    activityCount: 0,
    fileSizeBytes: 842_000,
  },
  {
    id: 'sdoc-2',
    fileName: 'acord_125_commercial_application.pdf',
    name: 'ACORD 125 — Commercial Insurance Application',
    kind: 'Form',
    description: 'Signed commercial application covering applicant, prior coverage, and loss history attestation.',
    aiSummary: 'Application complete; FEIN and mailing address verified. Prior carrier listed as Travelers.',
    tags: ['Application', 'ACORD 125'],
    author: 'Maria Alvarez',
    authorDetail: 'Producer portal upload',
    date: '2026-06-22',
    relativeTime: '2d ago',
    activityLabel: 'Submission',
    activityCount: 0,
    fileSizeBytes: 1_105_000,
  },
  {
    id: 'sdoc-3',
    fileName: 'vehicle_schedule_12_units.xlsx',
    name: 'Vehicle Schedule — 12 Units',
    kind: 'Document',
    description: 'Scheduled autos with VIN, year/make/model, garaging ZIP, and radius of use.',
    aiSummary: '12 power units listed; majority light trucks. 2 units garaged out of state (CA, OR).',
    tags: ['Fleet', 'Schedule'],
    author: 'Atlantic Ridge Construction, LLC',
    authorDetail: 'Insured worksheet',
    date: '2026-06-21',
    relativeTime: '3d ago',
    activityLabel: 'Submission',
    activityCount: 1,
    fileSizeBytes: 186_000,
  },
  {
    id: 'sdoc-4',
    fileName: 'driver_list_mvr_request.pdf',
    name: 'Driver List & MVR Authorization',
    kind: 'Document',
    description: 'Scheduled drivers with license numbers and signed MVR authorization.',
    aiSummary: '9 drivers listed; MVR authorization signed. 1 driver added mid-term pending experience review.',
    tags: ['Drivers', 'MVR'],
    author: 'Maria Alvarez',
    authorDetail: 'Producer portal upload',
    date: '2026-06-21',
    relativeTime: '3d ago',
    activityLabel: 'Submission',
    activityCount: 0,
    fileSizeBytes: 412_000,
  },
  {
    id: 'sdoc-5',
    fileName: 'loss_runs_5_year_auto.pdf',
    name: 'Five-Year Auto Loss Runs',
    kind: 'Document',
    description: 'Prior carrier loss runs for Commercial Auto (5 years).',
    aiSummary: 'One incurred auto liability claim in prior 3 years; closed within policy limits. No open claims.',
    tags: ['Loss Runs'],
    author: 'Loss Run Service',
    authorDetail: 'Third-party retrieval',
    date: '2026-06-20',
    relativeTime: '4d ago',
    activityLabel: 'Underwriting',
    activityCount: 0,
    fileSizeBytes: 978_000,
  },
]

export const submissionDocumentStoryMock =
  'This Commercial Auto submission includes **5 intake documents** from the producer — applications, vehicle schedule, drivers, and loss runs. The assistant extracted fleet and exposure details with high confidence. Review the **vehicle schedule** and **driver list** before clearing for rating.'

export const submissionDocumentStorySyncedAtMock = '8 min ago'

export const submissionDocumentStoryHighlightsMock = [
  { label: 'ACORD 125 & 127 received from producer', date: '06/22' },
  { label: 'Vehicle schedule uploaded — 12 units', date: '06/21' },
  { label: 'Driver list + MVR authorization on file', date: '06/21' },
  { label: 'Five-year auto loss runs retrieved', date: '06/20' },
]

export function getSubmissionDocuments(_submissionId: string) {
  return submissionDocumentsMock
}

export function getSubmissionDocumentStory(submissionNumber: string) {
  if (submissionNumber === 'SUB-00123') {
    return {
      story: submissionDocumentStoryMock,
      syncedAt: submissionDocumentStorySyncedAtMock,
      highlights: submissionDocumentStoryHighlightsMock,
    }
  }

  return {
    story: `Intake documents for submission **${submissionNumber}** include applications, schedules, and loss history needed to quote Commercial Auto. Select a document to summarize with the assistant.`,
    syncedAt: 'Recently',
    highlights: [] as { label: string; date: string }[],
  }
}

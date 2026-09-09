export type NoteAuthor = {
  initials: string
  name: string
}

export type NoteMessage = {
  id: string
  author: NoteAuthor
  text: string
  createdAt: string
}

export type SubmissionNoteThread = {
  id: string
  submissionId: string
  preview: string
  typeLabel: string
  author: NoteAuthor
  createdAt: string
  replies: NoteMessage[]
}

const you: NoteAuthor = { initials: 'SB', name: 'You' }
const brenda: NoteAuthor = { initials: 'BH', name: 'Brenda Holmes' }
const carmen: NoteAuthor = { initials: 'CR', name: 'Carmen Ruiz' }
const patrick: NoteAuthor = { initials: 'PH', name: 'Patrick Hale' }
const alex: NoteAuthor = { initials: 'AC', name: 'Alex Carter' }

/** Seeded note threads for the submissions Notes drawer (History tab). */
export const submissionNoteThreadsMock: SubmissionNoteThread[] = [
  {
    id: 'note-sub-00123-pay',
    submissionId: 'sub-00123',
    typeLabel: 'Promise to pay',
    preview: 'Customer committed to payment by end of week. Will follow up Friday if not received.',
    author: brenda,
    createdAt: 'Apr 15, 2026 4:15 PM',
    replies: [
      {
        id: 'note-sub-00123-pay-r1',
        author: carmen,
        text: 'Confirmed. Billing team has been notified.',
        createdAt: 'Apr 15, 2026 5:02 PM',
      },
      {
        id: 'note-sub-00123-pay-r2',
        author: brenda,
        text: "Thanks — I'll monitor and update status.",
        createdAt: 'Apr 16, 2026 9:10 AM',
      },
    ],
  },
  {
    id: 'note-sub-00123-payroll',
    submissionId: 'sub-00123',
    typeLabel: 'Missing information',
    preview: 'Requested updated payroll figures for clerical vs field split.',
    author: patrick,
    createdAt: 'Apr 14, 2026 11:22 AM',
    replies: [
      {
        id: 'note-sub-00123-payroll-r1',
        author: alex,
        text: 'Producer sent a revised worksheet this morning.',
        createdAt: 'Apr 14, 2026 2:40 PM',
      },
    ],
  },
  {
    id: 'note-sub-00122-payroll',
    submissionId: 'sub-00122',
    typeLabel: 'Missing information',
    preview: 'Requested updated payroll figures for WC class codes before rating.',
    author: patrick,
    createdAt: 'Apr 14, 2026 11:22 AM',
    replies: [],
  },
  {
    id: 'note-sub-00122-cancel',
    submissionId: 'sub-00122',
    typeLabel: 'Underwriting note',
    preview: 'Policy flagged for possible cancellation if payroll is not received.',
    author: alex,
    createdAt: 'Apr 13, 2026 3:05 PM',
    replies: [
      {
        id: 'note-sub-00122-cancel-r1',
        author: brenda,
        text: 'Producer is chasing the insured. Follow up Thursday.',
        createdAt: 'Apr 13, 2026 4:18 PM',
      },
      {
        id: 'note-sub-00122-cancel-r2',
        author: carmen,
        text: 'Logged on the account. No billing action yet.',
        createdAt: 'Apr 13, 2026 5:01 PM',
      },
      {
        id: 'note-sub-00122-cancel-r3',
        author: patrick,
        text: 'Holding rating until we have the breakdown.',
        createdAt: 'Apr 14, 2026 8:12 AM',
      },
    ],
  },
]

export function formatNoteTimestamp(date = new Date()) {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function buildNoteThreadsForSubmission(
  submissionId: string,
  fallbackNotes: string[] = [],
): SubmissionNoteThread[] {
  const seeded = submissionNoteThreadsMock.filter((thread) => thread.submissionId === submissionId)
  const extras = fallbackNotes
    .filter((note) => !seeded.some((thread) => thread.preview === note || note.includes(thread.preview)))
    .map((note, index) => ({
      id: `${submissionId}-fallback-${index}`,
      submissionId,
      preview: note,
      typeLabel: resolveNoteTypeLabel(note),
      author: you,
      createdAt: formatNoteTimestamp(),
      replies: [],
    }))

  return [...extras, ...seeded]
}

/** Match a Recent activity note event to the Notes drawer thread for reply. */
export function findNoteThreadForActivityNote(
  submissionId: string,
  notes: string[],
  noteText: string,
): SubmissionNoteThread | null {
  const threads = buildNoteThreadsForSubmission(submissionId, notes)
  if (threads.length === 0) return null
  const needle = noteText.trim().toLowerCase()
  if (!needle) return threads[0] ?? null
  return (
    threads.find(
      (thread) =>
        thread.preview.toLowerCase() === needle ||
        needle.includes(thread.preview.toLowerCase()) ||
        thread.preview.toLowerCase().includes(needle),
    ) ??
    threads[0] ??
    null
  )
}

export function buildAllNoteThreads(
  submissions: Array<{ id: string; notes: string[] }>,
): SubmissionNoteThread[] {
  return submissions.flatMap((submission) =>
    buildNoteThreadsForSubmission(submission.id, submission.notes),
  )
}

export function replyCountLabel(count: number) {
  if (count <= 0) return null
  return `${count} ${count === 1 ? 'reply' : 'replies'}`
}

export type NoteTemplate = {
  id: string
  label: string
  applyLabel: string
  summary: string
  fields: string[]
  match: (draft: string) => boolean
  skeleton: (input: { submissionNumber: string; insuredName: string; draft?: string }) => string
}

export const noteTemplates: NoteTemplate[] = [
  {
    id: 'promise-to-pay',
    label: 'Promise to pay',
    applyLabel: 'Apply Promise to pay format',
    summary:
      'Use this template when the insured or producer commits to a payment date. Capture amount, due date, and the next action if it is not honored.',
    fields: [
      'Customer / contact',
      'Past due amount',
      'Invoice or reference numbers',
      'Reason for delay',
      'Agreed payment amount and date',
      'Terms or conditions',
      'Next action if not honored',
    ],
    match: (draft) =>
      /\b(pay|payment|promise|invoice|past due|friday|honor)\b/i.test(draft),
    skeleton: ({ submissionNumber, insuredName, draft }) =>
      `Promise to pay — ${submissionNumber}

Customer / contact: ${insuredName}
Past due amount: 
Invoice or reference numbers: 
Reason for delay: 
Agreed payment amount and date: 
Terms or conditions: 
Next action if not honored: 

Notes:
${draft?.trim() || ''}`,
  },
  {
    id: 'producer-follow-up',
    label: 'Producer follow-up',
    applyLabel: 'Apply Producer follow-up format',
    summary:
      'Structure a producer request so the outstanding item, owner, and follow-up date are clear.',
    fields: [
      'Producer / contact',
      'Outstanding item',
      'Why it is needed',
      'Requested by date',
      'Next follow-up',
    ],
    match: (draft) =>
      /\b(producer|broker|follow[- ]?up|requested|chasing)\b/i.test(draft),
    skeleton: ({ submissionNumber, insuredName, draft }) =>
      `Producer follow-up — ${submissionNumber}

Producer / contact: 
Outstanding item: 
Why it is needed: ${insuredName}
Requested by date: 
Next follow-up: 

Notes:
${draft?.trim() || ''}`,
  },
  {
    id: 'missing-information',
    label: 'Missing information',
    applyLabel: 'Apply Missing information format',
    summary:
      'Document a blocking gap — what is missing, why rating or clearance cannot proceed, and who owns the request.',
    fields: [
      'Missing item',
      'Why it blocks progress',
      'Requested from',
      'Date requested',
      'Impact if not received',
    ],
    match: (draft) =>
      /\b(missing|payroll|loss run|need|required|incomplete|cannot)\b/i.test(draft),
    skeleton: ({ submissionNumber, draft }) =>
      `Missing information — ${submissionNumber}

Missing item: 
Why it blocks progress: 
Requested from: 
Date requested: 
Impact if not received: 

Notes:
${draft?.trim() || ''}`,
  },
  {
    id: 'underwriting-note',
    label: 'Underwriting note',
    applyLabel: 'Apply Underwriting note format',
    summary:
      'Capture underwriting judgment, appetite, and recommended next step for the file.',
    fields: [
      'Observation',
      'Appetite / risk posture',
      'Recommended next step',
      'Owner',
    ],
    match: (draft) =>
      /\b(underwriting|appetite|exposure|risk|clearance|refer)\b/i.test(draft),
    skeleton: ({ submissionNumber, draft }) =>
      `Underwriting note — ${submissionNumber}

Observation: 
Appetite / risk posture: 
Recommended next step: 
Owner: 

Notes:
${draft?.trim() || ''}`,
  },
  {
    id: 'file-note',
    label: 'File note',
    applyLabel: 'Apply File note format',
    summary: 'A general file note with context, decision, and follow-up.',
    fields: ['Context', 'Decision or update', 'Follow-up'],
    match: () => false,
    skeleton: ({ submissionNumber, draft }) =>
      `File note — ${submissionNumber}

Context: 
Decision or update: 
Follow-up: 

Notes:
${draft?.trim() || ''}`,
  },
]

export function detectNoteTemplate(draft: string): NoteTemplate | null {
  const normalized = draft.trim()
  if (normalized.length < 8) return null
  return noteTemplates.find((template) => template.id !== 'file-note' && template.match(normalized)) ?? null
}

export function resolveNoteTypeLabel(draft: string, template?: NoteTemplate | null) {
  return template?.label ?? detectNoteTemplate(draft)?.label ?? 'File note'
}


export type NoteRecordKind = 'policy' | 'claim' | 'quote' | 'account' | 'submission'

export type NoteBoundRecord = {
  kind: NoteRecordKind
  id: string
  /** Primary id shown in chip, e.g. policy number */
  reference: string
  /** Display name, e.g. insured */
  label: string
}

export type NoteAuthor = {
  initials: string
  name: string
}

export type NoteIntentId =
  | 'promise-to-pay'
  | 'cancellation-risk'
  | 'missing-endorsement'
  | 'renewal-document'
  | 'private-scratch'
  | 'general'

export type NoteActionId =
  | 'follow-up-task'
  | 'apply-template'
  | 'make-private'
  | 'save'
  | 'create-follow-up'
  | 'attach-suggested'
  | 'attach-other'

export type NoteFollowUpTask = {
  assignee: string
  priority: 'Low' | 'Normal' | 'Medium' | 'High'
  dueLabel: string
  name?: string
}

export type NoteThreadMessageKind =
  | 'user'
  | 'copilot'
  | 'system'
  | 'draft'
  | 'task-summary'

export type NoteThreadMessage = {
  id: string
  kind: NoteThreadMessageKind
  text: string
  createdAt: string
  author?: NoteAuthor
  /** Chat-style suggested action labels under an assistant turn */
  suggestedActions?: string[]
  /** Missing-field prompts listed under a draft */
  missingFields?: string[]
}

export type NoteAttachment = {
  id: string
  fileName: string
}

/** Saved / history thread — may be unbound until filed on a record. */
export type NoteThread = {
  id: string
  boundRecord: NoteBoundRecord | null
  subject: string
  preview: string
  intent: NoteIntentId
  intentLabel: string
  author: NoteAuthor
  createdAt: string
  isPrivate: boolean
  /** True when persisted without a record bind yet */
  isUnboundDraft: boolean
  followUpTask: NoteFollowUpTask | null
  attachments: NoteAttachment[]
  messages: NoteThreadMessage[]
  replies: NoteThreadMessage[]
}

export type NotesHistoryFilter = 'all' | 'mine' | 'replies' | 'private'

export const NOTE_CURRENT_USER: NoteAuthor = { initials: 'CR', name: 'You' }

export const NOTE_ASSIGNEE_OPTIONS = [
  'CR',
  'Chris Nolan',
  'Brenda Holmes',
  'Sarah Thompson',
  'Dana Patel',
  'Marcus Lee',
  'Jordan Reyes',
] as const

export const NOTE_PRIORITY_OPTIONS = ['Low', 'Medium', 'High'] as const

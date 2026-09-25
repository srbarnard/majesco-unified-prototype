import { NOTE_CURRENT_USER, type NoteThread } from '@/pages/notes/data/noteTypes'

const atlanticPolicy = {
  kind: 'policy' as const,
  id: 'p-1',
  reference: '01-CA-000100005-0',
  label: 'Atlantic Ridge Construction, LLC',
}

const brenda = { initials: 'BH', name: 'Brenda Holmes' }
const carmen = { initials: 'CR', name: 'Carmen Ruiz' }

/** Seeded History for Pacific / Atlantic policy Notes drawer. */
export const policyNoteThreadsMock: NoteThread[] = [
  {
    id: 'note-pol-atlantic-uw',
    boundRecord: atlanticPolicy,
    subject: 'UW read · Atlantic Ridge',
    preview: 'Comfortable with fleet exposure after garaging update. Monitoring Unit 14 claim.',
    intent: 'general',
    intentLabel: 'File note',
    author: brenda,
    createdAt: 'Apr 18, 2026 2:10 PM',
    isPrivate: false,
    isUnboundDraft: false,
    followUpTask: null,
    attachments: [],
    messages: [
      {
        id: 'note-pol-atlantic-uw-m1',
        kind: 'user',
        author: brenda,
        text: 'Comfortable with fleet exposure after garaging update. Monitoring Unit 14 claim.',
        createdAt: 'Apr 18, 2026 2:10 PM',
      },
    ],
    replies: [
      {
        id: 'note-pol-atlantic-uw-r1',
        kind: 'user',
        author: carmen,
        text: 'Agreed — keep an eye on loss runs before renewal bind.',
        createdAt: 'Apr 18, 2026 3:22 PM',
      },
    ],
  },
  {
    id: 'note-pol-atlantic-private',
    boundRecord: atlanticPolicy,
    subject: 'Scratch · broker call',
    preview: 'Scratch notes from broker call — not for the team yet.',
    intent: 'private-scratch',
    intentLabel: 'Private scratch',
    author: NOTE_CURRENT_USER,
    createdAt: 'Apr 17, 2026 11:05 AM',
    isPrivate: true,
    isUnboundDraft: false,
    followUpTask: null,
    attachments: [],
    messages: [
      {
        id: 'note-pol-atlantic-private-m1',
        kind: 'user',
        author: NOTE_CURRENT_USER,
        text: 'Scratch notes from broker call — not for the team yet.',
        createdAt: 'Apr 17, 2026 11:05 AM',
      },
    ],
    replies: [],
  },
]

export function buildHistoryForRecord(recordId: string | null | undefined): NoteThread[] {
  if (!recordId) return policyNoteThreadsMock
  return policyNoteThreadsMock.filter((thread) => thread.boundRecord?.id === recordId)
}

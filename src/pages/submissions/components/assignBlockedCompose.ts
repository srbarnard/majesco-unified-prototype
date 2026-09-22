import type { SubmissionListRecord } from '@/pages/submissions/data/mockSubmissions'

/** Blocked-only options: Underwriting Queue first, then oldest Sub #. */
export function sortBlockedForAssign(rows: SubmissionListRecord[]) {
  return [...rows]
    .filter((row) => row.status === 'Blocked')
    .sort((a, b) => {
      const aQueue = a.assignedTo === 'Underwriting Queue' ? 0 : 1
      const bQueue = b.assignedTo === 'Underwriting Queue' ? 0 : 1
      if (aQueue !== bQueue) return aQueue - bQueue
      return a.submissionNumber.localeCompare(b.submissionNumber)
    })
}

export type AssignThreadTurn = {
  id: string
  role: 'user' | 'copilot'
  text: string
  at: number
}

export type AssignComposeSession = {
  selectedIds: string[]
  focusAssignee: boolean
  openedAt: number
  userTurnId: string
}

export type AssignBlockedPromptSession = {
  nonBlockedCount: number
  totalCount: number
  blockedIds: string[]
  openedAt: number
  userTurnId: string
}

export function formatAssignTurnTime(at: number) {
  return new Date(at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export function buildAssignReceiptText(
  submissions: Pick<SubmissionListRecord, 'submissionNumber'>[],
  assignee: string,
  note: string,
) {
  const notePart = note ? ` Note: ${note}` : ''
  if (submissions.length === 1) {
    return `Assigned ${submissions[0]!.submissionNumber} to ${assignee}.${notePart}`
  }
  return `${submissions.length} submissions assigned to ${assignee}.${notePart}`
}

import { useSyncExternalStore } from 'react'
import type { CreateClaimDraft } from '@/pages/claims/data/createClaimDraft'
import { draftFromRecord } from '@/pages/claims/data/createClaimDraft'
import { getClaim, type ClaimRecord } from '@/pages/claims/data/claimsStore'

export type CreateClaimSavedState = { draft: CreateClaimDraft | null; created: boolean }
export type ClaimThread = { id: string; state: CreateClaimSavedState }
/** What the drawer opens on when a Claims row action targets a claim. */
export type ClaimDrawerIntent = 'assign' | 'note' | 'task' | null

type ClaimDrawerRequest = { key: number; claimNumber: string | null; intent: ClaimDrawerIntent }

/** Completed claims of different lines, shown in Create claim History before anything is filed this session. */
const EXAMPLE_HISTORY_CLAIMS = ['CA141274', 'CP141261', 'WC141249', 'GL141221', 'WC141208'] as const

function exampleThreads(): ClaimThread[] {
  return EXAMPLE_HISTORY_CLAIMS.flatMap((claimNumber) => {
    const record = getClaim(claimNumber)
    if (!record || record.status === 'Draft') return []
    return [{ id: `claim-example-${claimNumber}`, state: { draft: draftFromRecord(record), created: true } }]
  })
}

// Module scope survives the drawer unmounting between opens.
let threads: ClaimThread[] = exampleThreads()
/** The thread the drawer resumes on its next open. */
let activeThread: ClaimThread | null = null
let request: ClaimDrawerRequest = { key: 0, claimNumber: null, intent: null }
let threadSeq = 0
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useClaimDrawerRequest() {
  return useSyncExternalStore(subscribe, () => request, () => request)
}

export function useClaimThreads() {
  return useSyncExternalStore(subscribe, () => threads, () => threads)
}

export function getActiveClaimThread() {
  return activeThread
}

export function setActiveClaimThread(thread: ClaimThread | null) {
  activeThread = thread
  request = { ...request, claimNumber: thread?.state.draft?.claimNumber ?? null, intent: null }
  emit()
}

/** Writes the open History claim's draft back onto its row without moving it in the list. */
export function replaceActiveClaimDraft(draft: CreateClaimDraft) {
  if (!activeThread) return
  const state = { ...activeThread.state, draft }
  activeThread = { ...activeThread, state }
  threads = threads.map((entry) => (entry.id === activeThread?.id ? activeThread : entry))
  emit()
}

export function saveClaimThread(state: CreateClaimSavedState) {
  threadSeq += 1
  activeThread = { id: activeThread?.id ?? `claim-thread-${threadSeq}`, state }
  const saved = activeThread
  threads = [saved, ...threads.filter((entry) => entry.id !== saved.id)]
  request = { ...request, claimNumber: state.draft?.claimNumber ?? null }
  emit()
}

/** Points the drawer at a Claims row (its thread if one exists) and remounts it on that claim. */
/** Keeps the in-progress draft as the active thread (not in History) so it survives the drawer closing. */
export function stashClaimThread(state: CreateClaimSavedState) {
  activeThread = { id: activeThread?.id ?? `claim-thread-${(threadSeq += 1)}`, state }
}

export function focusClaimInDrawer(record: ClaimRecord, intent: ClaimDrawerIntent = null) {
  const existing = threads.find((thread) => thread.state.draft?.claimNumber === record.claimNumber)
  activeThread = existing ?? {
    id: `claim-thread-${(threadSeq += 1)}`,
    state: { draft: draftFromRecord(record), created: record.status !== 'Draft' },
  }
  request = { key: request.key + 1, claimNumber: record.claimNumber, intent }
  emit()
}

/** Leaves a row-opened claim and remounts the drawer on "What happened?". */
export function startNewClaimInDrawer() {
  if (activeThread == null && request.claimNumber == null) return
  activeThread = null
  request = { key: request.key + 1, claimNumber: null, intent: null }
  emit()
}

export function discardClaimThread(claimNumber: string) {
  threads = threads.filter((thread) => thread.state.draft?.claimNumber !== claimNumber)
  if (activeThread?.state.draft?.claimNumber === claimNumber) {
    activeThread = null
    request = { key: request.key + 1, claimNumber: null, intent: null }
  }
  emit()
}

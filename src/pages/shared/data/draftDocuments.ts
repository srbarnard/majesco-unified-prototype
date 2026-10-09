import type { PolicyDocument } from '@/pages/policies/data/mockDocuments'

/** Where a draft file was opened from: the viewer's ← returns there and reopens the drawer. */
export type DraftDocumentOrigin = {
  /** e.g. "Claim", "Task". */
  kind: string
  /** e.g. "Claim CA141288", "New task". */
  label: string
  /** Record the viewer shows the file under. */
  recordTitle: string
  recordSubtitle?: string
  /** Page to return to. */
  path: string
  /** Reopens the drawer with the stashed draft. */
  reopen: () => void
}

type Entry = { document: PolicyDocument; origin: DraftDocumentOrigin }

/** Files read into create drawers (claim, quote, customer, task), keyed by document id. */
const entries = new Map<string, Entry>()

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function displayName(fileName: string) {
  const base = fileName.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim()
  return base ? base[0]!.toUpperCase() + base.slice(1) : fileName
}

/**
 * Registers a file on a draft and returns its document. Re-registering refreshes the origin
 * (the page and draft to return to) but keeps the document.
 */
export function draftDocument(scope: string, fileName: string, origin: DraftDocumentOrigin): PolicyDocument {
  const id = `${slug(scope)}-${slug(fileName)}`
  const document: PolicyDocument = entries.get(id)?.document ?? {
    id,
    fileName,
    name: displayName(fileName),
    kind: 'Document',
    description: `Source document read into ${origin.label}.`,
    aiSummary: `Read while drafting ${origin.label}.`,
    tags: [origin.kind, 'Source document'],
    author: `${origin.kind} intake`,
    authorDetail: `Attached to ${origin.label}`,
    date: new Date().toISOString().slice(0, 10),
    relativeTime: 'Just now',
    activityLabel: origin.kind,
    activityCount: 0,
  }
  entries.set(id, { document, origin })
  return document
}

export function resolveDraftDocument(docId: string): Entry | undefined {
  return entries.get(docId)
}

import { homeDailySummaryBeats } from '@/app/data/homeMock'
import { buildNoteRecordCatalog } from '@/pages/notes/data/noteRecordCatalog'
import type { NoteBoundRecord } from '@/pages/notes/data/noteTypes'

export type NoteEmptyStarter = {
  /** Suggested-actions row label */
  label: string
  /** Text sent into the note thread */
  prefill: string
  /** Optional silent bind after send */
  bindReference?: string
}

/**
 * Home Notes empty starters — derived from Chat Daily summary beats
 * (`homeDailySummaryBeats`), not a parallel list.
 */
export function buildHomeNoteStarters(): NoteEmptyStarter[] {
  // Keep order aligned with daily summary; max 4 blocking items.
  const byId: Record<string, NoteEmptyStarter> = {
    'bb-1': {
      label: 'Note loss-run block on Midwest Fabrication',
      prefill:
        'Loss runs still outstanding on Midwest Fabrication; blocking renewal bind.',
      bindReference: '01-CP-000017809-0',
    },
    'bb-2': {
      label: 'Document OFAC hold on Horizon Fleet',
      prefill:
        'Horizon Fleet submission is on OFAC hold pending compliance clearance.',
      bindReference: '01-CA-000100012-0',
    },
    'bb-3': {
      label: 'Capture pricing-approval status for Red Oak Hospitality',
      prefill:
        'Red Oak Hospitality renewal package is waiting on pricing approval before producer delivery.',
      bindReference: '01-CP-000017810-0',
    },
    'bb-4': {
      label: 'Flag missing SOV on Keystone Commercial Realty',
      prefill:
        'Keystone Commercial Realty is missing an SOV for the property schedule.',
      bindReference: '01-BP-000028511-0',
    },
  }

  return homeDailySummaryBeats.bullets
    .map((bullet) => byId[bullet.id])
    .filter((starter): starter is NoteEmptyStarter => Boolean(starter))
    .slice(0, 4)
}

/** Record-scoped starters when Notes opens on a bound policy/quote/etc. (no document). */
export function buildRecordNoteStarters(record: NoteBoundRecord): NoteEmptyStarter[] {
  const short = record.label.replace(/, LLC$/, '').replace(/ Inc\.$/, '')
  const isAtlantic = /atlantic ridge/i.test(record.label) || record.reference.includes('000100005')

  if (isAtlantic) {
    return [
      {
        label: 'Capture PTP from insured',
        prefill: `Customer says they’ll pay next Friday on ${record.reference}.`,
        bindReference: record.reference,
      },
      {
        label: 'Add UW read on fleet +12',
        prefill: `UW read on ${short}: fleet exposure +12 units this term; monitoring Unit 14 claim before renewal bind.`,
        bindReference: record.reference,
      },
    ]
  }

  return [
    {
      label: `Capture update on ${short}`,
      prefill: `File note on ${record.reference} · ${short}: `,
      bindReference: record.reference,
    },
    {
      label: `Flag follow-up for ${short}`,
      prefill: `Follow-up needed on ${record.reference} · ${short}.`,
      bindReference: record.reference,
    },
  ].slice(0, 2)
}

/**
 * Document-context starters (e.g. renewal_proposal_2026.pdf on a policy).
 * Extract is Chat context — these chips surface the insights, not a summary wall.
 */
export function buildDocumentNoteStarters(
  record: NoteBoundRecord,
  documents: Array<{ id: string; fileName: string }>,
): NoteEmptyStarter[] {
  const primary = documents[0]
  const short = record.label.replace(/, LLC$/, '').replace(/ Inc\.$/, '')
  const fileName = primary?.fileName ?? 'document'

  if (/renewal_proposal/i.test(fileName)) {
    return [
      {
        label: 'Note 22% premium increase driven by +12 fleet units',
        prefill:
          'Renewal premium up 22% to $594,800, driven primarily by +12 fleet units on the schedule.',
        bindReference: record.reference,
      },
      {
        label: 'Capture 30-day rate hold request',
        prefill:
          'Broker requested a 30-day rate hold while the insured reviews the updated fleet schedule.',
        bindReference: record.reference,
      },
      {
        label: 'Flag unchanged ISO / CGL forms vs prior term',
        prefill:
          'No manuscript CGL changes; ISO forms unchanged from prior term — flag for UW confirmation.',
        bindReference: record.reference,
      },
      {
        label: 'Attach this proposal to a UW read',
        prefill: `UW read on ${short}: reviewing ${fileName} — premium to $594,800 (+22%), +12 fleet units, 30-day rate hold.`,
        bindReference: record.reference,
      },
    ]
  }

  return [
    {
      label: `Capture UW read from ${fileName}`,
      prefill: `UW read on ${short} from ${fileName}: `,
      bindReference: record.reference,
    },
    {
      label: `Flag follow-up from ${fileName}`,
      prefill: `Follow-up from ${fileName} on ${record.reference}.`,
      bindReference: record.reference,
    },
    {
      label: `Attach ${fileName} to a note`,
      prefill: `File note with ${fileName} on ${record.reference} · ${short}.`,
      bindReference: record.reference,
    },
  ]
}

export function buildDocumentEmptyBody(
  record: NoteBoundRecord,
  _documents: Array<{ id: string; fileName: string }>,
) {
  const short = record.label.replace(/, LLC$/, '').replace(/ Inc\.$/, '')
  return `This document is on ${record.reference} · ${short}. Add a flag, follow-up, or UW read.`
}

/** Short Chat line after the user starts from a document-backed note. */
export function buildDocumentPulledLine(documents: Array<{ id: string; fileName: string }>) {
  const fileName = documents[0]?.fileName ?? 'document'
  if (/renewal_proposal/i.test(fileName)) {
    return `Pulled from ${fileName} — $594,800 (+22%), +12 units, 30-day rate hold.`
  }
  return `Pulled from ${fileName}.`
}

export const HOME_NOTE_EMPTY_BODY =
  'Add it to the file — a flag, a follow-up, or a read. Chat will classify it and suggest the next step.'

export function buildRecordEmptyBody(record: NoteBoundRecord) {
  const short = record.label.replace(/, LLC$/, '').replace(/ Inc\.$/, '')
  return `Add it to ${record.reference} · ${short} — a flag, a follow-up, or a read. Chat will classify it and suggest the next step.`
}

export function resolveStarterBind(starter: NoteEmptyStarter): NoteBoundRecord | null {
  if (!starter.bindReference) return null
  const catalog = buildNoteRecordCatalog()
  return (
    catalog.find(
      (row) => row.reference.toLowerCase() === starter.bindReference!.toLowerCase(),
    ) ?? null
  )
}

/** History scope chip when Notes is opened on a bound record. */
export function historyScopeLabel(record: NoteBoundRecord | null): string | null {
  if (!record) return null
  if (record.kind === 'policy') return 'On this policy'
  if (record.kind === 'quote') return 'On this quote'
  if (record.kind === 'claim') return 'On this claim'
  if (record.kind === 'submission') return 'On this submission'
  return 'On this record'
}

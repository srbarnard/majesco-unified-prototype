import type { NoteActionId, NoteBoundRecord, NoteIntentId } from '@/pages/notes/data/noteTypes'

export type NoteIntentDefinition = {
  id: NoteIntentId
  label: string
  classifyLine: (record: NoteBoundRecord | null) => string
  fields: string[]
  /** Chips shown after classification (Make private always last). */
  actions: NoteActionId[]
  match: (text: string) => boolean
  buildSubject: (input: { text: string; record: NoteBoundRecord | null }) => string
  buildDraft: (input: { text: string; record: NoteBoundRecord | null }) => string
  detectMissing: (text: string) => string[]
}

function shortPayBy(text: string) {
  const fri = /\b(next\s+)?friday\b/i.test(text)
  if (fri) return 'pay by Fri'
  const match = text.match(/\bby\s+([A-Za-z]+ \d{1,2}|\d{1,2}\/\d{1,2})\b/i)
  if (match?.[1]) return `pay by ${match[1]}`
  return 'payment commitment'
}

/** Pull an insured/account name from free text when no record is bound yet. */
function inferInsuredFromText(text: string): string | null {
  const match = text.match(
    /\b(Midwest Fabrication(?: Inc\.?)?|Horizon Fleet(?: Services(?: LLC)?)?|Red Oak Hospitality(?: Group)?|Keystone Commercial Realty|Atlantic Ridge(?: Construction(?:,? LLC)?)?|Blue Harbor Logistics(?: Inc\.?)?|Silverline Manufacturing(?: Co\.?)?)\b/i,
  )
  return match?.[1] ?? null
}

export const noteIntents: NoteIntentDefinition[] = [
  {
    id: 'promise-to-pay',
    label: 'Promise to pay',
    classifyLine: (record) =>
      record
        ? `Looks like a Promise to Pay on ${record.kind === 'policy' ? 'Policy' : record.kind} ${record.reference}.`
        : 'Looks like a Promise to Pay.',
    fields: [
      'Customer / contact',
      'Past due amount',
      'Invoice or reference numbers',
      'Reason for delay',
      'Agreed payment amount and date',
      'Terms or conditions',
      'Next action if not honored',
    ],
    actions: ['follow-up-task', 'apply-template', 'make-private'],
    match: (text) =>
      /\b(pay|payment|promise|invoice|past due|they'll pay|will pay|ptp)\b/i.test(text),
    buildSubject: ({ text, record }) => {
      const insured = record?.label?.split(',')[0] ?? 'Account'
      return `PTP · ${shortPayBy(text)} · ${insured}`
    },
    buildDraft: ({ text, record }) => {
      const contact = record?.label ?? ''
      const payBy = /\b(next\s+)?friday\b/i.test(text)
        ? 'Friday'
        : text.match(/\bby\s+([^.]+)/i)?.[1]?.trim() || ''
      return [
        `Promise to pay — ${record?.reference ?? 'Record'}`,
        '',
        `Customer / contact: ${contact}`,
        'Past due amount: ',
        'Invoice or reference numbers: ',
        'Reason for delay: ',
        `Agreed payment amount and date: ${payBy ? `— by ${payBy}` : ''}`,
        'Terms or conditions: ',
        'Next action if not honored: Follow up if payment not received',
        '',
        'Notes:',
        text.trim(),
      ].join('\n')
    },
    detectMissing: (text) => {
      const missing: string[] = []
      if (!/\$|\bamount\b|\bdue\b.*\d/i.test(text)) missing.push('Amount')
      if (!/\binvoice\b|#\s*\d/i.test(text)) missing.push('invoice #')
      return missing
    },
  },
  {
    id: 'cancellation-risk',
    label: 'Cancellation risk',
    classifyLine: (record) =>
      record
        ? `Looks like Cancellation risk on ${record.reference}.`
        : 'Looks like a Cancellation risk note.',
    fields: ['Reason', 'Notice dates', 'Amount outstanding', 'Save options'],
    actions: ['follow-up-task', 'apply-template', 'make-private'],
    match: (text) =>
      /\b(cancel|cancellation|non-?pay|lapse|notice of cancel)\b/i.test(text),
    buildSubject: ({ record }) => `Cancel risk · ${record?.label?.split(',')[0] ?? 'Account'}`,
    buildDraft: ({ text, record }) =>
      [
        `Cancellation risk — ${record?.reference ?? 'Record'}`,
        '',
        'Reason: ',
        'Notice dates: ',
        'Amount outstanding: ',
        'Save options: ',
        '',
        'Notes:',
        text.trim(),
      ].join('\n'),
    detectMissing: (text) => {
      const missing: string[] = []
      if (!/\breason\b|because/i.test(text)) missing.push('Reason')
      if (!/\$|\bamount\b/i.test(text)) missing.push('Amount outstanding')
      return missing
    },
  },
  {
    id: 'missing-endorsement',
    label: 'Missing endorsement / form',
    classifyLine: () => 'Looks like a Missing endorsement / form note.',
    fields: ['Form name', 'Who owes it', 'Due date'],
    actions: ['follow-up-task', 'apply-template', 'make-private'],
    match: (text) =>
      /\b(endorsement|form|missing|cg\s?\d|ca\s?\d|owes|outstanding form|loss.?runs?|blocking|sov|ofac|compliance|on hold)\b/i.test(
        text,
      ),
    buildSubject: ({ text, record }) => {
      const form = text.match(/\b(CG|CA|BP)[-\s]?\d+/i)?.[0] ?? 'Form'
      const insured =
        record?.label?.split(',')[0] ?? inferInsuredFromText(text) ?? 'Account'
      return `Missing ${form} · ${insured}`
    },
    buildDraft: ({ text, record }) =>
      [
        `Missing endorsement / form — ${record?.reference ?? 'Record'}`,
        '',
        'Form name: ',
        'Who owes it: ',
        'Due date: ',
        '',
        'Notes:',
        text.trim(),
      ].join('\n'),
    detectMissing: (text) => {
      const missing: string[] = []
      if (!/\b(CG|CA|BP|form)\b/i.test(text)) missing.push('Form name')
      if (!/\bdue\b|\bby\b/i.test(text)) missing.push('Due date')
      return missing
    },
  },
  {
    id: 'renewal-document',
    label: 'Renewal / broker document',
    classifyLine: () => 'Looks like a Renewal / broker document read.',
    fields: [
      'Premium delta',
      'Drivers of change',
      'Broker asks',
      'Coverage vs prior term',
      'Your read',
    ],
    actions: ['follow-up-task', 'apply-template', 'make-private'],
    match: (text) =>
      /\b(renewal|broker|proposal|premium|prior term|delta)\b/i.test(text),
    buildSubject: ({ record }) => `Renewal read · ${record?.label?.split(',')[0] ?? 'Account'}`,
    buildDraft: ({ text, record }) =>
      [
        `Renewal / broker document — ${record?.reference ?? 'Record'}`,
        '',
        'Premium delta: ',
        'Drivers of change: ',
        'Broker asks: ',
        'Coverage vs prior term: ',
        'Your read: ',
        '',
        'Notes:',
        text.trim(),
      ].join('\n'),
    detectMissing: () => [],
  },
  {
    id: 'private-scratch',
    label: 'Private scratch',
    classifyLine: () => 'Private scratch — unstructured and not visible to the team.',
    fields: [],
    actions: ['make-private'],
    match: (text) => /\b(private|scratch|just for me|personal)\b/i.test(text),
    buildSubject: ({ text }) => {
      const preview = text.trim().slice(0, 40)
      return preview.length < text.trim().length ? `${preview}…` : preview || 'Private note'
    },
    buildDraft: ({ text }) => text.trim(),
    detectMissing: () => [],
  },
  {
    id: 'general',
    label: 'File note',
    classifyLine: (record) =>
      record ? `Got it — I’ll treat this as a file note on ${record.reference}.` : 'Got it — file note.',
    fields: ['Context', 'Decision or update', 'Follow-up'],
    actions: ['follow-up-task', 'apply-template', 'make-private'],
    match: () => true,
    buildSubject: ({ text, record }) => {
      const preview = text.trim().slice(0, 36)
      const base = preview.length < text.trim().length ? `${preview}…` : preview
      return record ? `${base} · ${record.label.split(',')[0]}` : base || 'File note'
    },
    buildDraft: ({ text, record }) =>
      [
        `File note — ${record?.reference ?? 'Record'}`,
        '',
        'Context: ',
        'Decision or update: ',
        'Follow-up: ',
        '',
        'Notes:',
        text.trim(),
      ].join('\n'),
    detectMissing: () => [],
  },
]

export function classifyNoteIntent(text: string): NoteIntentDefinition {
  const normalized = text.trim()
  if (!normalized) return noteIntents[noteIntents.length - 1]!
  return (
    noteIntents.find((intent) => intent.id !== 'general' && intent.match(normalized)) ??
    noteIntents[noteIntents.length - 1]!
  )
}

export function templateActionLabel(intentLabel: string) {
  return intentLabel === 'Promise to pay' ? 'Promise to pay note' : `${intentLabel} note`
}

/** Unbound-draft suggested action — file onto a known record (no search field). */
export function fileOnLabel(record: NoteBoundRecord) {
  return `File on ${record.reference}`
}

export function inferDueFromText(text: string): string {
  if (/\b(next\s+)?friday\b/i.test(text)) return 'Friday'
  if (/\btoday\b/i.test(text)) return 'Today'
  if (/\btomorrow\b/i.test(text)) return 'Tomorrow'
  return 'Today'
}

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

export function formatTaskCreatedLine(task: { assignee: string; priority: string; dueLabel: string }) {
  const dueShort = task.dueLabel.replace(/^Due\s+/i, '')
  return `Follow-up created — ${dueShort}, assigned to ${task.assignee}, ${task.priority}.`
}

export function quietBindLine(record: NoteBoundRecord) {
  const kindLabel =
    record.kind === 'policy'
      ? 'policy'
      : record.kind === 'claim'
        ? 'claim'
        : record.kind === 'quote'
          ? 'quote'
          : record.kind === 'submission'
            ? 'submission'
            : 'account'
  return `On ${kindLabel} ${record.reference}`
}

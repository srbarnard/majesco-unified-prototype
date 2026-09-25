import type { NoteBoundRecord } from '@/pages/notes/data/noteTypes'
import { policiesListMock } from '@/pages/policies/data/mockPoliciesList'
import { quotesMock } from '@/pages/quotes/data/mockQuotes'
import { submissionsMock } from '@/pages/submissions/data/mockSubmissions'

/** Searchable catalog for the Notes bind chip picker. */
export function buildNoteRecordCatalog(): NoteBoundRecord[] {
  const policies: NoteBoundRecord[] = policiesListMock.slice(0, 40).map((row) => ({
    kind: 'policy',
    id: row.id,
    reference: row.policyNumber,
    label: row.insuredName,
  }))

  const quotes: NoteBoundRecord[] = quotesMock.slice(0, 30).map((row) => ({
    kind: 'quote',
    id: row.id,
    reference: row.quoteNumber,
    label: row.insured,
  }))

  const submissions: NoteBoundRecord[] = submissionsMock.slice(0, 30).map((row) => ({
    kind: 'submission',
    id: row.id,
    reference: row.submissionNumber,
    label: row.insuredName,
  }))

  const accounts: NoteBoundRecord[] = [
    {
      kind: 'account',
      id: 'acct-atlantic',
      reference: 'Atlantic Ridge Construction',
      label: 'Atlantic Ridge Construction, LLC',
    },
    {
      kind: 'account',
      id: 'acct-midwest',
      reference: 'Midwest Fabrication',
      label: 'Midwest Fabrication Inc.',
    },
  ]

  const claims: NoteBoundRecord[] = [
    {
      kind: 'claim',
      id: 'clm-unit-14',
      reference: 'CLM-2026-014',
      label: 'Atlantic Ridge Construction, LLC',
    },
  ]

  return [...policies, ...quotes, ...submissions, ...accounts, ...claims]
}

export function noteRecordChipLabel(record: NoteBoundRecord) {
  return `${record.reference} · ${record.label.replace(/, LLC$/, '').replace(/ Inc\.$/, '')}`
}

export function noteRecordOptionLabel(record: NoteBoundRecord) {
  const kind = record.kind.charAt(0).toUpperCase() + record.kind.slice(1)
  return `${kind} · ${record.reference} · ${record.label}`
}

export function recordFromContext(
  title?: string | null,
  subtitle?: string | null,
): NoteBoundRecord | null {
  if (!title && !subtitle) return null
  const catalog = buildNoteRecordCatalog()

  if (subtitle) {
    const byRef = catalog.find(
      (row) => row.reference.toLowerCase() === subtitle.trim().toLowerCase(),
    )
    if (byRef) return byRef
  }

  if (title) {
    const byLabel = catalog.find(
      (row) =>
        row.label.toLowerCase() === title.trim().toLowerCase() ||
        row.reference.toLowerCase() === title.trim().toLowerCase(),
    )
    if (byLabel) return byLabel
  }

  if (subtitle && title) {
    const looksLikePolicy = /\d{2}-[A-Z]{2}-\d+/i.test(subtitle)
    return {
      kind: looksLikePolicy ? 'policy' : 'account',
      id: `ctx-${subtitle}`,
      reference: subtitle,
      label: title,
    }
  }

  if (title) {
    return {
      kind: 'account',
      id: `ctx-${title}`,
      reference: title,
      label: title,
    }
  }

  return null
}

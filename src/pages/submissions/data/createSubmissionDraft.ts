import {
  locationsCountSummary,
  locationsToResolve,
  quoteLocationId,
  scheduleLocations,
  type QuoteLocation,
} from '@/pages/quotes/data/createQuoteDraft'
import type { SubmissionIssue, SubmissionListRecord } from '@/pages/submissions/data/mockSubmissions'

/** The intake is the same seven fields on every submission; only their state changes. */
export type SubmissionIntakeField =
  | 'account'
  | 'classCode'
  | 'locations'
  | 'payroll'
  | 'employees'
  | 'lossHistory'
  | 'documents'

export type CreateSubmissionDraft = {
  account: string | null
  classCode: string | null
  locations: QuoteLocation[]
  payroll: string | null
  employees: string | null
  lossHistory: string | null
  documents: string[]
}

export type IntakeState = 'known' | 'blocker' | 'warning'

export type IntakeRow = {
  field: SubmissionIntakeField
  term: string
  value: string | null
  state: IntakeState
  /** Shown while empty, or under a warning. */
  hint: string
}

export const SUBMISSION_INTAKE_FIELDS: SubmissionIntakeField[] = [
  'account',
  'classCode',
  'locations',
  'payroll',
  'employees',
  'lossHistory',
  'documents',
]

export const SUBMISSION_CLASS_OPTIONS = [
  '7219 · Trucking — hauling',
  '8810 · Clerical office',
  '5645 · Carpentry — residential',
  '9082 · Restaurant',
  '0042 · Landscaping',
  '8017 · Retail store',
  '5403 · Carpentry — commercial',
]

const CLASS_KEYWORDS: Array<[RegExp, string]> = [
  [/truck|haul|freight|logistic/i, '7219 · Trucking — hauling'],
  [/clerical|office/i, '8810 · Clerical office'],
  [/restaurant|kitchen|cafe/i, '9082 · Restaurant'],
  [/landscap|lawn/i, '0042 · Landscaping'],
  [/retail|store|shop/i, '8017 · Retail store'],
  [/commercial carpent|commercial construct/i, '5403 · Carpentry — commercial'],
  [/carpent|construct|framing/i, '5645 · Carpentry — residential'],
]

const CLASS_LINES: Record<string, string[]> = {
  '7219': ['Workers Compensation', 'Commercial Auto'],
  '8810': ['Workers Compensation'],
  '5645': ['Workers Compensation', 'General Liability'],
  '5403': ['Workers Compensation', 'General Liability'],
  '9082': ['Workers Compensation', 'General Liability'],
  '0042': ['Workers Compensation', 'General Liability'],
  '8017': ['Workers Compensation', 'General Liability'],
}

export const emptySubmissionDraft = (): CreateSubmissionDraft => ({
  account: null,
  classCode: null,
  locations: [],
  payroll: null,
  employees: null,
  lossHistory: null,
  documents: [],
})

const TERMS: Record<SubmissionIntakeField, string> = {
  account: 'Account',
  classCode: 'Class',
  locations: 'Locations',
  payroll: 'Payroll',
  employees: 'Employees',
  lossHistory: 'Loss history',
  documents: 'Documents',
}

/** Loss runs under three years, or with an open claim, quote with a caveat. */
function lossHistoryWarning(value: string) {
  if (/\bopen\b/i.test(value)) return 'Open claim · confirm reserves before quoting'
  const years = /(\d+)\s*(?:yr|year)/i.exec(value)
  if (years && Number(years[1]) < 3) return 'Under 3 years of loss runs'
  return null
}

export function intakeRows(draft: CreateSubmissionDraft): IntakeRow[] {
  return SUBMISSION_INTAKE_FIELDS.map((field): IntakeRow => {
    const term = TERMS[field]
    switch (field) {
      case 'account':
        return draft.account
          ? { field, term, value: draft.account, state: 'known', hint: '' }
          : { field, term, value: null, state: 'blocker', hint: 'Named insured' }
      case 'classCode':
        return draft.classCode
          ? { field, term, value: draft.classCode, state: 'known', hint: '' }
          : { field, term, value: null, state: 'blocker', hint: 'Governing class code' }
      case 'locations':
        if (draft.locations.length === 0) {
          return { field, term, value: null, state: 'blocker', hint: 'None added' }
        }
        return {
          field,
          term,
          value: locationsCountSummary(draft.locations),
          state: locationsToResolve(draft.locations) > 0 ? 'blocker' : 'known',
          hint: '',
        }
      case 'payroll':
        return draft.payroll
          ? { field, term, value: draft.payroll, state: 'known', hint: '' }
          : { field, term, value: null, state: 'blocker', hint: 'Annual payroll · needed to rate' }
      case 'employees':
        return draft.employees
          ? { field, term, value: draft.employees, state: 'known', hint: '' }
          : { field, term, value: null, state: 'warning', hint: 'Headcount · used to check payroll' }
      case 'lossHistory': {
        if (!draft.lossHistory) {
          return { field, term, value: null, state: 'blocker', hint: '3 years of loss runs' }
        }
        const warning = lossHistoryWarning(draft.lossHistory)
        return warning
          ? { field, term, value: draft.lossHistory, state: 'warning', hint: warning }
          : { field, term, value: draft.lossHistory, state: 'known', hint: '' }
      }
      case 'documents':
        return draft.documents.length > 0
          ? { field, term, value: draft.documents.join(', '), state: 'known', hint: '' }
          : { field, term, value: null, state: 'warning', hint: 'ACORD, loss runs, or payroll report' }
    }
  })
}

export const formatMoney = (raw: string) => {
  const match = /([\d,.]+)\s*(k|m|million|mm)?/i.exec(raw)
  if (!match) return raw
  let amount = Number(match[1].replace(/,/g, ''))
  const unit = match[2]?.toLowerCase()
  if (unit === 'k') amount *= 1_000
  else if (unit) amount *= 1_000_000
  return Number.isFinite(amount) && amount > 0 ? `$${Math.round(amount).toLocaleString('en-US')}` : raw
}

/** Reads what the composer text says about each intake field; anything it doesn't mention stays as is. */
export function applySubmissionText(draft: CreateSubmissionDraft, text: string): CreateSubmissionDraft {
  const next = { ...draft }
  const account = /\b((?:[A-Z][\w&'.-]*\s+){0,4}(?:LLC|Inc\.?|Co\.?|Corp\.?|Company|Group|Logistics|Construction|Partners))(?=[\s,;]|$)/.exec(text)
  if (account) next.account = account[1].trim()

  const classCode = /\b(\d{4})\b/.exec(text)
  const byCode = classCode && SUBMISSION_CLASS_OPTIONS.find((option) => option.startsWith(classCode[1]))
  const byKeyword = CLASS_KEYWORDS.find(([pattern]) => pattern.test(text))?.[1]
  if (byCode || byKeyword) next.classCode = byCode || byKeyword || null

  const payroll =
    /payroll\s*(?:of|is|:)?\s*\$?\s*(\d[\d,.]*\s*(?:k|m|mm|million)?)/i.exec(text) ??
    /\$\s*(\d[\d,.]*\s*(?:k|m|mm|million)?)\s*(?:in\s+|of\s+|annual\s+)*payroll/i.exec(text)
  if (payroll) next.payroll = formatMoney(payroll[1])

  const employees = /(\d[\d,]*)\s*(?:employees|staff|workers|people|ees)\b/i.exec(text)
  if (employees) next.employees = `${employees[1].replace(/,/g, '')} employees`

  const locations = /(\d+)\s*locations?\b(?:\s*(?:in|across|:)\s*([A-Za-z][^;$\d]*?)(?=,?\s*(?:\$|\d)|[.;]|$))?/i.exec(text)
  if (locations && next.locations.length === 0) {
    // Named cities become locations without a street, so each one still needs resolving.
    const places = (locations[2] ?? '')
      .split(/\s*(?:;|\band\b)\s*/i)
      .map((place) => /^([A-Za-z .'-]+),\s*([A-Z]{2})$/.exec(place.trim()))
      .filter((match): match is RegExpExecArray => match != null)
    const count = Math.max(Number(locations[1]), places.length)
    next.locations = Array.from({ length: count }, (_, index): QuoteLocation => ({
      id: quoteLocationId(),
      address: { street: '', city: places[index]?.[1].trim() ?? '', state: places[index]?.[2] ?? '', zip: '' },
      type: null,
    }))
  }

  if (/\b(?:no|zero)\s+(?:losses|claims)\b/i.test(text)) next.lossHistory = '3 years · no losses'
  else {
    const claims = /(\d+)\s*claims?\b([^.;]*)/i.exec(text)
    if (claims) {
      const years = /(\d+)\s*(?:yr|year)/i.exec(text)?.[1] ?? '3'
      const open = /\bopen\b/i.test(claims[2]) ? ', 1 open' : ''
      next.lossHistory = `${years} years · ${claims[1]} claim${claims[1] === '1' ? '' : 's'}${open}`
    }
  }
  return next
}

/** What each attached file contributes; the ACORD names the account, loss runs fill history. */
export function applySubmissionDocuments(draft: CreateSubmissionDraft, names: string[]): CreateSubmissionDraft {
  const next = { ...draft, documents: [...draft.documents] }
  for (const name of names) {
    if (!next.documents.some((existing) => existing.toLowerCase() === name.toLowerCase())) next.documents.push(name)
    if (/loss/i.test(name)) next.lossHistory = next.lossHistory ?? '3 years · 2 claims, 1 open'
    else if (/payroll/i.test(name)) next.payroll = next.payroll ?? '$1,240,000'
    else if (/schedule|sov|location/i.test(name)) next.locations = [...next.locations, ...scheduleLocations()]
    else {
      next.account = next.account ?? 'Harborline Freight Co.'
      next.classCode = next.classCode ?? '7219 · Trucking — hauling'
      if (next.locations.length === 0) {
        next.locations = [
          {
            id: quoteLocationId(),
            address: { street: '1200 Port of Tacoma Rd', city: 'Tacoma', state: 'WA', zip: '98421' },
            type: 'Warehouse',
          },
          {
            id: quoteLocationId(),
            address: { street: '5400 N Lagoon Ave', city: 'Portland', state: 'OR', zip: '97217' },
            type: 'Office',
          },
        ]
      }
      next.employees = next.employees ?? '48 employees'
    }
  }
  return next
}

const ISSUE_COPY: Partial<Record<SubmissionIntakeField, Pick<SubmissionIssue, 'title' | 'summary' | 'whyItMatters' | 'missingDetails'>>> = {
  account: {
    title: 'Missing Named Insured',
    summary: 'The account is not named.',
    whyItMatters: 'The quote is issued to the named insured.',
    missingDetails: ['Named insured'],
  },
  classCode: {
    title: 'Missing Class Code',
    summary: 'No governing class code.',
    whyItMatters: 'Rates are set by class.',
    missingDetails: ['Governing class code'],
  },
  locations: {
    title: 'Incomplete Location Schedule',
    summary: 'Locations are missing or have incomplete addresses.',
    whyItMatters: 'Exposure and state rules depend on location.',
    missingDetails: ['Location addresses'],
  },
  payroll: {
    title: 'Missing Payroll Information',
    summary: 'Annual payroll was not provided.',
    whyItMatters: 'Premium is rated on payroll.',
    missingDetails: ['Annual payroll'],
  },
  employees: {
    title: 'Missing Employee Count',
    summary: 'Headcount was not provided.',
    whyItMatters: 'Headcount checks payroll for understatement.',
    missingDetails: [],
  },
  lossHistory: {
    title: 'Incomplete Loss History',
    summary: 'Loss runs are missing or incomplete.',
    whyItMatters: 'Experience drives the rate and appetite.',
    missingDetails: ['3-year loss runs'],
  },
  documents: {
    title: 'No Supporting Documents',
    summary: 'No ACORD, loss runs, or payroll report attached.',
    whyItMatters: 'Underwriting relies on source documents.',
    missingDetails: [],
  },
}

/** The Submissions row for this intake: blockers become blocking issues, warnings become warnings. */
export function submissionRecordFromDraft(
  draft: CreateSubmissionDraft,
  base: { id: string; submissionNumber: string; assignedTo: string; submittedAt: string; notes: string[] },
): SubmissionListRecord {
  const rows = intakeRows(draft)
  const issues: SubmissionIssue[] = rows
    .filter((row) => row.state !== 'known')
    .map((row) => {
      const copy = ISSUE_COPY[row.field]!
      return {
        id: `${base.id}-${row.field}`,
        ...copy,
        summary: row.state === 'warning' && row.value ? row.hint : copy.summary,
        severity: row.state === 'blocker' ? 'blocking' : 'warning',
        composerPlaceholder: `Add ${row.term.toLowerCase()}…`,
        reportedAt: base.submittedAt,
      }
    })
  const blockers = issues.filter((issue) => issue.severity === 'blocking').length
  const code = draft.classCode?.slice(0, 4) ?? ''
  return {
    id: base.id,
    submissionNumber: base.submissionNumber,
    status: blockers > 0 ? 'Blocked' : 'Ready',
    insuredName: draft.account ?? 'New account',
    linesOfBusiness: CLASS_LINES[code] ?? ['Workers Compensation'],
    assignedTo: base.assignedTo,
    submittedAt: base.submittedAt,
    hasAlert: blockers > 0,
    confidence: Math.max(40, 95 - blockers * 12 - (issues.length - blockers) * 4),
    issues,
    notes: base.notes,
  }
}

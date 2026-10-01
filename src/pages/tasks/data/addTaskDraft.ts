import { customersMock } from '@/pages/customers/data/mockCustomers'
import { insuredsMock } from '@/pages/insureds/data/mockInsureds'
import { insuredIdFromName } from '@/pages/shared/insuredId'
import { policiesListMock } from '@/pages/policies/data/mockPoliciesList'
import { quotesMock } from '@/pages/quotes/data/mockQuotes'
import type { QuoteWizardUploadedFile } from '@/pages/quotes/data/quoteWizardTypes'
import { submissionsMock } from '@/pages/submissions/data/mockSubmissions'
import {
  tasksMock,
  teamMembersMock,
  type TaskDocument,
  type TaskPriority,
  type TaskRecord,
} from '@/pages/tasks/data/mockTasks'

export type AddTaskAttachment = QuoteWizardUploadedFile

export type AddTaskRelatedKind =
  | 'Policy'
  | 'Quote'
  | 'Submission'
  | 'Customer'
  | 'Insured'
  | 'Producer'
  | 'Sub-producer'

/** Records identified by name alone — the row shows "Kind · name" without a number. */
const NAME_ONLY_KINDS = new Set<AddTaskRelatedKind>(['Customer', 'Insured', 'Producer', 'Sub-producer'])

export type AddTaskRelated = {
  kind: AddTaskRelatedKind
  ref: string
  /** Name shown on the row and in the title — whichever name the user referred to. */
  name: string
  /** Insured first, then producer / agency; any of them links this record. */
  names: string[]
}

/** Where the New task drawer was opened — biases Related toward that record type. */
export type AddTaskPageContext = {
  kind: AddTaskRelatedKind | null
  /** Set on a detail page; becomes Related when the sentence names nothing. */
  record: AddTaskRelated | null
}

export type AddTaskDue = {
  label: string
  date: Date
}

export type AddTaskDraft = {
  title: string
  assignee: string | null
  related: AddTaskRelated | null
  priority: TaskPriority | null
  due: AddTaskDue | null
  blocker: string | null
  /** Set when the blocker was sent from the mail rail; cleared if the blocker text changes. */
  blockerEmail: AddTaskBlockerEmailSent | null
  /** Everything the user typed, joined — becomes the task description. */
  notes: string
  attachments: AddTaskAttachment[]
}

export type AddTaskBlockerEmailSent = {
  to: string
  sentAt: Date
}

export const emptyAddTaskDraft: AddTaskDraft = {
  title: '',
  assignee: null,
  related: null,
  priority: null,
  due: null,
  blocker: null,
  blockerEmail: null,
  notes: '',
  attachments: [],
}

const ATTACHMENT_DOCUMENT_TYPES: Partial<Record<AddTaskAttachment['kind'], TaskDocument['type']>> = {
  acord: 'form',
  schedule: 'spreadsheet',
  sov: 'spreadsheet',
  'loss-run': 'pdf',
  email: 'email',
}

function attachmentToDocument(file: AddTaskAttachment): TaskDocument {
  return {
    id: `task-att-${file.id}`,
    name: file.name,
    status: 'Received',
    required: false,
    type: ATTACHMENT_DOCUMENT_TYPES[file.kind],
  }
}

export const ADD_TASK_ACTIONS = [
  'Set priority',
  'Assign to',
  'Link related',
  'Set due date',
  'Add blocker',
] as const

export type AddTaskAction = (typeof ADD_TASK_ACTIONS)[number]

export type AddTaskSeed = {
  label: string
  prefill: string
}

/** Seeds mirror the Tasks Copilot summary — the items a UW is most likely to spin a task off. */
export const ADD_TASK_SEEDS: AddTaskSeed[] = [
  {
    label: 'Create task for past-due reserve review',
    prefill:
      'Create task for past-due reserve review on Midwest Grain Cooperative — assign to Jordan Ellis, high priority, due tomorrow',
  },
  {
    label: 'Assign OFAC hit',
    prefill: 'Clear OFAC screening hit for Atlas Mechanical Services — assign to Compliance Ops, due today',
  },
  {
    label: 'Follow up bind failure',
    prefill: 'Follow up bind failure for Elena Morales — payment authorization declined, assign to Bind Desk',
  },
]

export const ADD_TASK_PRIORITIES: TaskPriority[] = ['High', 'Medium', 'Low']

export const ADD_TASK_ASSIGNEES: string[] = [
  ...new Set([
    ...tasksMock.map((task) => task.assignedTo),
    ...teamMembersMock.map((member) => member.name),
  ]),
]

function relatedRecord(kind: AddTaskRelatedKind, ref: string, names: (string | null | undefined)[]): AddTaskRelated {
  const unique = [...new Set(names.filter((name): name is string => Boolean(name)))]
  return { kind, ref, name: unique[0] ?? ref, names: unique }
}

/** Task-linked records first (the seeds reference them), then each workspace's list. */
export const ADD_TASK_RELATED: AddTaskRelated[] = (() => {
  const seen = new Set<string>()
  const records: AddTaskRelated[] = []
  const add = (record: AddTaskRelated) => {
    const key = `${record.kind}:${record.ref}`
    if (seen.has(key)) return
    seen.add(key)
    records.push(record)
  }
  for (const task of tasksMock) {
    const { policyNumber, quoteNumber, submissionId, insuredName, producer } = task.relatedEntities
    if (!insuredName) continue
    if (policyNumber) add(relatedRecord('Policy', policyNumber, [insuredName, producer]))
    else if (quoteNumber) add(relatedRecord('Quote', quoteNumber, [insuredName, producer]))
    else if (submissionId) add(relatedRecord('Submission', submissionId, [insuredName, producer]))
    else add(relatedRecord(/^Q-/.test(task.refNumber) ? 'Quote' : 'Policy', task.refNumber, [insuredName, producer]))
  }
  for (const policy of policiesListMock) {
    add(relatedRecord('Policy', policy.policyNumber, [policy.insuredName, policy.agency, policy.producer]))
  }
  for (const quote of quotesMock) {
    add(relatedRecord('Quote', quote.quoteNumber, [quote.insured, quote.producer]))
  }
  for (const submission of submissionsMock) {
    add(relatedRecord('Submission', submission.submissionNumber, [submission.insuredName]))
  }
  for (const customer of customersMock) {
    add(relatedRecord('Customer', customer.customerNumber, [customer.name]))
  }
  for (const insured of insuredsMock) {
    add(relatedRecord('Insured', insuredIdFromName(insured.name), [insured.name]))
  }
  return records
})()

export function relatedLabel(related: AddTaskRelated) {
  return NAME_ONLY_KINDS.has(related.kind)
    ? `${related.kind} · ${related.name}`
    : `${related.kind} · ${related.ref} · ${related.name}`
}

/** Catalog record for a grid row, so the row menu and the typeahead link the same entry. */
export const RELATED_BY_LABEL = new Map(ADD_TASK_RELATED.map((record) => [relatedLabel(record), record]))
export const RELATED_OPTIONS = [...RELATED_BY_LABEL.keys()]

/** Typeahead matches a Related option on its label plus every linked name (insured, producer, agency). */
export function relatedSearchText(label: string) {
  const record = RELATED_BY_LABEL.get(label)
  return record ? `${label} ${record.names.join(' ')}` : label
}

export function findRelated(
  kind: AddTaskRelatedKind,
  ref: string,
  names: (string | null | undefined)[],
): AddTaskRelated {
  return ADD_TASK_RELATED.find((record) => record.kind === kind && record.ref === ref) ?? relatedRecord(kind, ref, names)
}

/** What a task is about — used to start a related task from a task row. */
export function relatedForTask(task: TaskRecord): AddTaskRelated | null {
  const { policyNumber, quoteNumber, submissionId, insuredName, producer } = task.relatedEntities
  const names = [insuredName, producer]
  if (policyNumber) return findRelated('Policy', policyNumber, names)
  if (quoteNumber) return findRelated('Quote', quoteNumber, names)
  if (submissionId) return findRelated('Submission', submissionId, names)
  if (insuredName) return findRelated('Insured', insuredIdFromName(insuredName), names)
  return null
}

const PAGE_KINDS: [RegExp, AddTaskRelatedKind][] = [
  [/^\/policies(\/|$)/, 'Policy'],
  [/^\/quotes(\/|$)/, 'Quote'],
  [/^\/submissions(\/|$)/, 'Submission'],
  [/^\/customers(\/|$)/, 'Customer'],
  [/^\/insureds(\/|$)/, 'Insured'],
  [/^\/producers(\/|$)/, 'Producer'],
  [/^\/sub-producers(\/|$)/, 'Sub-producer'],
]

export function resolveTaskPageContext(pathname: string): AddTaskPageContext {
  const kind = PAGE_KINDS.find(([pattern]) => pattern.test(pathname))?.[1] ?? null
  const detailId = pathname.match(/^\/(?:policies|quotes|submissions|insureds)\/([^/]+)/)?.[1]
  if (!kind || !detailId || detailId === 'new') return { kind, record: null }
  const id = decodeURIComponent(detailId)
  const quoteNumber = kind === 'Quote' ? quotesMock.find((quote) => quote.id === id)?.quoteNumber : null
  const ref = quoteNumber ?? id
  const record = ADD_TASK_RELATED.find((item) => item.kind === kind && item.ref === ref) ?? null
  return { kind, record }
}

function startOfDay(date: Date) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function nextWeekday(from: Date, weekday: number) {
  const diff = (weekday - from.getDay() + 7) % 7 || 7
  return addDays(from, diff)
}

export function formatDueLabel(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function buildDueOptions(now = new Date()): AddTaskDue[] {
  const today = startOfDay(now)
  return [
    { label: 'Today', date: today },
    { label: 'Tomorrow', date: addDays(today, 1) },
    { label: 'Friday', date: nextWeekday(today, 5) },
    { label: 'Next week', date: addDays(today, 7) },
  ]
}

const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

function inferDue(text: string): AddTaskDue | null {
  const lower = text.toLowerCase()
  const today = startOfDay(new Date())
  if (/\b(today|eod|end of day)\b/.test(lower)) return { label: 'Today', date: today }
  if (/\btomorrow\b/.test(lower)) return { label: 'Tomorrow', date: addDays(today, 1) }
  if (/\bnext week\b/.test(lower)) return { label: 'Next week', date: addDays(today, 7) }
  const weekday = WEEKDAYS.findIndex((day) => new RegExp(`\\b${day}\\b`).test(lower))
  if (weekday >= 0) {
    const label = WEEKDAYS[weekday]!
    return { label: label[0]!.toUpperCase() + label.slice(1), date: nextWeekday(today, weekday) }
  }
  return null
}

/** Explicit urgency only — a near due date on its own never raises priority. */
const HIGH_PRIORITY =
  /\b(urgent|asap|critical|high[- ]priority|top (?:task|priority)|most important|do (?:this|it) first|number one|past[- ]due)\b|#1\b/

function inferPriority(text: string): TaskPriority | null {
  const lower = text.toLowerCase()
  if (HIGH_PRIORITY.test(lower)) return 'High'
  if (/\b(low priority|low-priority|whenever|no rush)\b/.test(lower)) return 'Low'
  if (/\b(medium priority|normal priority)\b/.test(lower)) return 'Medium'
  return null
}

function capitalizeName(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0]!.toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

const ASSIGN_VERB = /\bassign(?:ed)?\s+(?:it\s+)?(?:to\s+)?([a-z][a-z'-]+(?:\s+[a-z][a-z'-]+)?)/i
const DELEGATE_VERB = /\b(?:ask|have|tell|remind)\s+([a-z][a-z'-]+(?:\s+[A-Z][a-z'-]+)?)\s+to\b/i
const NOT_A_NAME = new Set(['me', 'myself', 'someone', 'team', 'the', 'a', 'an', 'it', 'this', 'that'])

function inferAssignee(text: string, insuredWords: Set<string>): string | null {
  const lower = text.toLowerCase()
  const full = ADD_TASK_ASSIGNEES.find((name) => lower.includes(name.toLowerCase()))
  if (full) return full
  // Bare first names ("chris", "@maria") on people, not queues — unless the word names an insured.
  const people = ADD_TASK_ASSIGNEES.filter((name) => /^[A-Z][a-z]+ [A-Z][a-z]+$/.test(name))
  for (const name of people) {
    const first = name.split(' ')[0]!.toLowerCase()
    if (insuredWords.has(first)) continue
    if (new RegExp(`(^|[^a-z])@?${first}\\b`).test(lower)) return name
  }
  // "assign Joan" — someone outside the directory still becomes the assignee.
  const match = text.match(ASSIGN_VERB) ?? text.match(DELEGATE_VERB)
  if (match) {
    const words = match[1]!.split(/\s+/).filter((word) => !NOT_A_NAME.has(word.toLowerCase()))
    const candidate = words.slice(0, /^[A-Z]/.test(words[1] ?? '') ? 2 : 1).join(' ')
    if (candidate && !/^(due|high|low|medium|by|today|tomorrow)$/i.test(candidate)) return capitalizeName(candidate)
  }
  return null
}

const GENERIC_INSURED_WORDS = new Set(['multiple', 'the', 'group', 'services', 'partners', 'insurance'])

function leadWord(name: string) {
  const lead = name.toLowerCase().split(/[\s&,]+/)[0] ?? ''
  return lead.length >= 4 && !GENERIC_INSURED_WORDS.has(lead) ? lead : null
}

type RelatedMatch = { record: AddTaskRelated; name: string; strength: number }

/**
 * Best record the sentence refers to. Stronger evidence wins (ref number > full name > short name >
 * lead word); ties go to the page's record type, then insured names over producer names.
 */
export function inferRelated(text: string, context: AddTaskPageContext | undefined): AddTaskRelated | null {
  const lower = text.toLowerCase()
  const matches: RelatedMatch[] = []
  for (const record of ADD_TASK_RELATED) {
    if (lower.includes(record.ref.toLowerCase())) {
      matches.push({ record, name: record.names[0] ?? record.name, strength: 4 })
      continue
    }
    record.names.forEach((name, index) => {
      const full = name.toLowerCase()
      const short = full.split(/\s+/).slice(0, 2).join(' ')
      const lead = index === 0 ? leadWord(name) : null
      const strength = lower.includes(full)
        ? 3
        : short.length > 6 && short !== full && lower.includes(short)
          ? 2
          : lead && new RegExp(`\\b${lead}\\b`).test(lower)
            ? 1
            : 0
      if (strength > 0) matches.push({ record, name, strength: strength - index * 0.01 })
    })
  }
  if (matches.length === 0) return context?.record ?? null
  const onPage = (match: RelatedMatch) => (context?.kind != null && match.record.kind === context.kind ? 1 : 0)
  matches.sort(
    (a, b) =>
      Math.round(b.strength) - Math.round(a.strength) || onPage(b) - onPage(a) || b.strength - a.strength,
  )
  const best = matches[0]!
  return { ...best.record, name: best.name }
}

function inferBlocker(text: string): string | null {
  const match = text.match(/\b(?:blocked by|blocker:?|waiting on)\s+([^.,;—-]+)/i)
  return match ? match[1]!.trim() : null
}

/** Recognized work types → short grid-friendly labels. Checked in order; first match wins. */
const TITLE_RULES: [RegExp, string][] = [
  [/\bconvert\w*\b[^.]*\bquotes?\b|\bquotes?\b[^.]*\bconver(?:t|sion)\b/, 'Convert quote'],
  [/\brenewal\b.*\bsign|\bsign\w*\b.*\brenewal\b/, 'Renewal signature'],
  [/\b(ofac|sanction\w*|sdn)\b/, 'OFAC hit review'],
  [/\bbind (failure|failed)\b|\bpayment authori[sz]ation declined\b/, 'Bind failure follow-up'],
  [/\bpast[- ]due reserve\b/, 'Past-due reserve review'],
  [/\breserves?\b/, 'Reserve review'],
  [/\bloss runs?\b/, 'Loss runs review'],
  [/\b(certificate|coi)\b/, 'Certificate request'],
  [/\breinstat\w*/, 'Reinstatement review'],
  [/\b(cancell?ation|non[- ]?payment)\b/, 'Cancellation review'],
  [/\b(endorsement|additional insured)\b/, 'Endorsement'],
  [/\binspection\b/, 'Inspection review'],
  [/\baudit\b/, 'Premium audit'],
  [/\b(fnol|claim)\b/, 'Claim follow-up'],
]

const TITLE_MAX_WORDS = 6
const TITLE_MAX_CHARS = 72

function capitalizeFirst(value: string) {
  return value ? value[0]!.toUpperCase() + value.slice(1) : value
}

/** Verb + object from the lead clause when no rule matches ("Call producer about renewal questionnaire"). */
const PRIORITY_PHRASE =
  /\b(?:this is\s+)?(?:your|my|our|the)?\s*(?:top (?:task|priority)|#1|number one|most important)(?:\s+(?:task|thing))?(?:\s+(?:for\s+)?(?:the day|today))?\b|\b(?:urgent|asap|critical)\b/gi

function fallbackTitleLabel(text: string, related: AddTaskRelated | null): string {
  let clause = text.replace(PRIORITY_PHRASE, ' ').split(/[.\n?!]/).find((part) => part.trim()) ?? text
  clause = clause
    .replace(/^\s*(please\s+)?(create|add|make|open)\s+(a\s+)?task\s*(to|for|:)?\s*/i, '')
    .replace(/^\s*(please\s+)?(ask|tell|have)\s+[a-z]+(\s+[a-z]+)?\s+to\s+/i, '')
    .replace(/^\s*(i|we)\s+(need|have)\s+to\s+/i, '')
    .replace(/^\s*please\s+/i, '')
  const insuredPattern = related
    ? new RegExp(related.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    : null
  const splitClause = (value: string) => {
    const head =
      value.split(/\s+[—–-]\s+|[,;]|\s+(?:for|on|at)\s+|\s+(?:and\s+)?(?:assign(?:ed)?|due|by)\b/i)[0] ?? value
    return insuredPattern ? head.replace(insuredPattern, '') : head
  }
  // "Follow up on renewal rate" keeps its object: "Follow up — renewal rate".
  const phrasal = clause.match(/^\s*(follow up|check in|circle back|touch base)\s+(?:on|about|with|re:?)\s+(.+)/i)
  if (phrasal) {
    const object = splitClause(phrasal[2]!).trim().split(/\s+/).slice(0, TITLE_MAX_WORDS - 2).join(' ')
    if (object) return `${capitalizeFirst(phrasal[1]!.toLowerCase())} — ${object}`
  }
  clause = splitClause(clause)
  const words = clause.trim().split(/\s+/).filter(Boolean).slice(0, TITLE_MAX_WORDS)
  return capitalizeFirst(words.join(' '))
}

function inferTitle(text: string, related: AddTaskRelated | null): string {
  const lower = text.toLowerCase()
  const rule = TITLE_RULES.find(([pattern]) => pattern.test(lower))
  let label = rule ? rule[1] : fallbackTitleLabel(text, related)
  if (!label) return ''
  if (related && !label.toLowerCase().includes(related.name.toLowerCase())) {
    label = `${label} — ${related.name}`
  }
  return label.length > TITLE_MAX_CHARS ? `${label.slice(0, TITLE_MAX_CHARS - 1).trimEnd()}…` : label
}

/** Infer structured fields from free text. Fields not mentioned stay null. */
export function inferFromText(text: string, context?: AddTaskPageContext): Partial<AddTaskDraft> {
  const trimmed = text.trim()
  if (!trimmed) return {}
  const related = inferRelated(trimmed, context)
  const insuredWords = new Set(related ? related.names.join(' ').toLowerCase().split(/[\s&,]+/) : [])
  const assignee = inferAssignee(trimmed, insuredWords)
  return {
    title: inferTitle(trimmed, related),
    assignee,
    related,
    priority: inferPriority(trimmed),
    due: inferDue(trimmed),
    blocker: inferBlocker(trimmed),
  }
}

/**
 * Composer text overrides any field it mentions ("due Friday, assign Chris").
 * The title is the exception — once set, follow-up messages don't rename the task.
 */
export function mergeDraft(base: AddTaskDraft, inferred: Partial<AddTaskDraft>): AddTaskDraft {
  return {
    title: base.title || inferred.title || '',
    assignee: inferred.assignee ?? base.assignee,
    related: inferred.related ?? base.related,
    priority: inferred.priority ?? base.priority,
    due: inferred.due ?? base.due,
    blocker: inferred.blocker ?? base.blocker,
    blockerEmail: inferred.blocker && inferred.blocker !== base.blocker ? null : base.blockerEmail,
    notes: base.notes,
    attachments: base.attachments,
  }
}

let createdCounter = 0

export function buildTaskFromDraft(draft: AddTaskDraft, now = new Date()): TaskRecord {
  createdCounter += 1
  const due = draft.due?.date ?? addDays(startOfDay(now), 3)
  const dueInDays = Math.round((startOfDay(due).getTime() - startOfDay(now).getTime()) / 86_400_000)
  const related = draft.related
  const refOf = (kind: AddTaskRelatedKind) => (related?.kind === kind ? related.ref : null)
  const ref = `TSK-${String(90_000 + createdCounter).padStart(6, '0')}`
  const assignee = draft.assignee ?? 'Unassigned'

  return {
    id: `task-new-${now.getTime()}`,
    taskName: draft.title || 'Untitled task',
    assigner: 'You',
    assignedTo: assignee,
    team: 'Commercial UW — Midwest',
    priority: draft.priority ?? 'Medium',
    priorityReason: draft.priority ? 'Set when the task was created' : 'Default priority',
    status: draft.assignee ? 'Pending' : 'Unassigned',
    displayStatus: draft.blocker ? 'Blocked' : 'Open',
    nextAction: draft.blocker ? `Resolve blocker: ${draft.blocker}` : 'Review and start task',
    theme: 'Exception handling',
    assignedDate: now.toISOString().slice(0, 10),
    dueDate: due.toISOString().slice(0, 10),
    assignedLabel: formatDueLabel(now),
    dueLabel: formatDueLabel(due),
    ageIndicator: dueInDays <= 0 ? 'Due today' : `Due in ${dueInDays} day${dueInDays === 1 ? '' : 's'}`,
    refNumber: ref,
    referenceType: related?.kind === 'Quote' ? 'Quote' : 'Policy',
    agingDays: 0,
    isPastDue: false,
    hasAlert: false,
    hasAiInsights: false,
    description: draft.notes || draft.title,
    copilotInsights: [],
    documents: draft.attachments.map(attachmentToDocument),
    blockingIssues: draft.blocker,
    notes: null,
    relatedEntities: {
      policyNumber: refOf('Policy'),
      quoteNumber: refOf('Quote'),
      insuredName: related?.names[0] ?? null,
      producer: related?.names[1] ?? null,
      submissionId: refOf('Submission'),
      claimNumber: null,
    },
  }
}

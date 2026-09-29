import type { QuoteWizardUploadedFile } from '@/pages/quotes/data/quoteWizardTypes'
import {
  tasksMock,
  teamMembersMock,
  type TaskDocument,
  type TaskPriority,
  type TaskRecord,
} from '@/pages/tasks/data/mockTasks'

export type AddTaskAttachment = QuoteWizardUploadedFile

export type AddTaskPolicyLink = {
  policyNumber: string
  insuredName: string
}

export type AddTaskDue = {
  label: string
  date: Date
}

export type AddTaskDraft = {
  title: string
  assignee: string | null
  policy: AddTaskPolicyLink | null
  priority: TaskPriority | null
  due: AddTaskDue | null
  blocker: string | null
  /** Everything the user typed, joined — becomes the task description. */
  notes: string
  attachments: AddTaskAttachment[]
}

export const emptyAddTaskDraft: AddTaskDraft = {
  title: '',
  assignee: null,
  policy: null,
  priority: null,
  due: null,
  blocker: null,
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
  'Link policy',
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

export const ADD_TASK_POLICIES: AddTaskPolicyLink[] = (() => {
  const seen = new Set<string>()
  const links: AddTaskPolicyLink[] = []
  for (const task of tasksMock) {
    const { policyNumber, insuredName } = task.relatedEntities
    if (!policyNumber || !insuredName || seen.has(policyNumber)) continue
    seen.add(policyNumber)
    links.push({ policyNumber, insuredName })
  }
  return links
})()

/** Insureds with no policy yet (quotes, bind failures) can still be linked by name. */
const INSURED_ONLY: AddTaskPolicyLink[] = tasksMock
  .filter((task) => !task.relatedEntities.policyNumber && task.relatedEntities.insuredName)
  .map((task) => ({
    policyNumber: task.refNumber,
    insuredName: task.relatedEntities.insuredName!,
  }))

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

function inferPriority(text: string): TaskPriority | null {
  const lower = text.toLowerCase()
  if (/\b(urgent|asap|critical|high priority|high-priority|past[- ]due)\b/.test(lower)) return 'High'
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

const POLICY_CATALOG = [...ADD_TASK_POLICIES, ...INSURED_ONLY]
const GENERIC_INSURED_WORDS = new Set(['multiple', 'the', 'group', 'services', 'partners', 'insurance'])

function insuredLeadWord(link: AddTaskPolicyLink) {
  const lead = link.insuredName.toLowerCase().split(/[\s&,]+/)[0] ?? ''
  return lead.length >= 4 && !GENERIC_INSURED_WORDS.has(lead) ? lead : null
}

function inferPolicy(text: string): AddTaskPolicyLink | null {
  const lower = text.toLowerCase()
  const byNumber = POLICY_CATALOG.find((link) => lower.includes(link.policyNumber.toLowerCase()))
  if (byNumber) return byNumber
  const byName = POLICY_CATALOG.find((link) => {
    const insured = link.insuredName.toLowerCase()
    const shortName = insured.split(/\s+/).slice(0, 2).join(' ')
    return lower.includes(insured) || (shortName.length > 6 && lower.includes(shortName))
  })
  if (byName) return byName
  // Single-word mentions like "sarah" or "midwest" link on the insured's lead word.
  return (
    POLICY_CATALOG.find((link) => {
      const lead = insuredLeadWord(link)
      return lead != null && new RegExp(`\\b${lead}\\b`).test(lower)
    }) ?? null
  )
}

function inferBlocker(text: string): string | null {
  const match = text.match(/\b(?:blocked by|blocker:?|waiting on)\s+([^.,;—-]+)/i)
  return match ? match[1]!.trim() : null
}

/** Recognized work types → short grid-friendly labels. Checked in order; first match wins. */
const TITLE_RULES: [RegExp, string][] = [
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
function fallbackTitleLabel(text: string, policy: AddTaskPolicyLink | null): string {
  let clause = text.split(/[.\n?!]/)[0] ?? text
  clause = clause
    .replace(/^\s*(please\s+)?(create|add|make|open)\s+(a\s+)?task\s*(to|for|:)?\s*/i, '')
    .replace(/^\s*(please\s+)?(ask|tell|have)\s+[a-z]+(\s+[a-z]+)?\s+to\s+/i, '')
    .replace(/^\s*(i|we)\s+(need|have)\s+to\s+/i, '')
    .replace(/^\s*please\s+/i, '')
  const insuredPattern = policy
    ? new RegExp(policy.insuredName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
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

function inferTitle(text: string, policy: AddTaskPolicyLink | null): string {
  const lower = text.toLowerCase()
  const rule = TITLE_RULES.find(([pattern]) => pattern.test(lower))
  let label = rule ? rule[1] : fallbackTitleLabel(text, policy)
  if (!label) return ''
  if (policy && !label.toLowerCase().includes(policy.insuredName.toLowerCase())) {
    label = `${label} — ${policy.insuredName}`
  }
  return label.length > TITLE_MAX_CHARS ? `${label.slice(0, TITLE_MAX_CHARS - 1).trimEnd()}…` : label
}

/** Infer structured fields from free text. Fields not mentioned stay null. */
export function inferFromText(text: string): Partial<AddTaskDraft> {
  const trimmed = text.trim()
  if (!trimmed) return {}
  const policy = inferPolicy(trimmed)
  const insuredWords = new Set(policy ? policy.insuredName.toLowerCase().split(/[\s&,]+/) : [])
  const assignee = inferAssignee(trimmed, insuredWords)
  return {
    title: inferTitle(trimmed, policy),
    assignee,
    policy,
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
    policy: inferred.policy ?? base.policy,
    priority: inferred.priority ?? base.priority,
    due: inferred.due ?? base.due,
    blocker: inferred.blocker ?? base.blocker,
    notes: base.notes,
    attachments: base.attachments,
  }
}

let createdCounter = 0

export function buildTaskFromDraft(draft: AddTaskDraft, now = new Date()): TaskRecord {
  createdCounter += 1
  const due = draft.due?.date ?? addDays(startOfDay(now), 3)
  const dueInDays = Math.round((startOfDay(due).getTime() - startOfDay(now).getTime()) / 86_400_000)
  const isPolicy = Boolean(draft.policy && /^[A-Z]{2}-\d{4}-\d{3}$/.test(draft.policy.policyNumber))
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
    referenceType: 'Policy',
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
      policyNumber: isPolicy ? draft.policy!.policyNumber : null,
      quoteNumber: null,
      insuredName: draft.policy?.insuredName ?? null,
      producer: null,
      submissionId: null,
      claimNumber: null,
    },
  }
}

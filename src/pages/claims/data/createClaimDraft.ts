import {
  claimPrefix,
  nextClaimNumber,
  type ClaimRecord,
  type ClaimStatus,
  type ClaimTask,
} from '@/pages/claims/data/claimsStore'
import { insuredLocations, matchingInsuredLocations } from '@/pages/claims/data/policyLocations'
import { policiesListMock } from '@/pages/policies/data/mockPoliciesList'

export type ClaimPolicy = { insured: string; product: string; policyNumber: string }

export type CreateClaimDraft = {
  claimNumber: string
  policy: ClaimPolicy | null
  dateOfLoss: string | null
  location: string | null
  description: string | null
  policeReport: string | null
  sources: string[]
  /** Who reported the loss and how; `name` is null until the reporter says who they are. */
  reporter: { name: string | null; method: ClaimReportMethod } | null
  /** Present only when a source names the other party. */
  claimant: { name: string; email: string | null } | null
  /** `missing` = no source says either way; the blocker asks to mark it unknown. */
  airbag: 'missing' | 'unknown' | 'deployed' | 'not deployed' | null
  /** `off-schedule` = driver missing from the DOL driver schedule; the blocker refers coverage. */
  driver: { name: string; status: 'off-schedule' | 'referred' | 'scheduled' } | null
  /** One entry per vehicle: what it is and its damage. */
  vehicles: string[]
  injuries: string | null
  /** Tasks raised while drafting (e.g. the coverage referral); carried onto the Claims row. */
  tasks: ClaimTask[]
  /** Notes added while drafting; carried onto the Claims row. */
  notes?: ClaimRecord['notes']
  /** Person or queue the claim is created assigned to; unset reads as the current user. */
  assignee?: string
}

export type ClaimReportMethod = 'Phone' | 'Loss notice'

export const CLAIM_CURRENT_USER = 'Chris Reynolds'

export const CLAIM_QUEUES = ['Auto claims queue', 'Property claims queue', 'Liability claims queue', "Workers' comp claims queue"]

/** Policy lookup keyed by policy number; searchable by number or insured. */
export const CLAIM_POLICIES = new Map<string, ClaimPolicy>(
  policiesListMock.map((policy) => [
    policy.policyNumber,
    { insured: policy.insuredName, product: policy.product, policyNumber: policy.policyNumber },
  ]),
)
export const CLAIM_POLICY_NUMBERS = [...CLAIM_POLICIES.keys()]

export function emptyClaimDraft(): CreateClaimDraft {
  return {
    claimNumber: nextClaimNumber('CL'),
    policy: null,
    dateOfLoss: null,
    location: null,
    description: null,
    policeReport: null,
    sources: [],
    reporter: null,
    claimant: null,
    airbag: null,
    driver: null,
    vehicles: [],
    injuries: null,
    tasks: [],
  }
}

/** What reading the chosen loss notice, police report, and scene photos yields. */
export function documentClaimDraft(sources: string[]): CreateClaimDraft {
  return {
    claimNumber: nextClaimNumber('CA', 'CA141288'),
    policy: { insured: 'Continental Delivery LLC', product: 'Commercial Auto', policyNumber: '01-CA-000100044-0' },
    dateOfLoss: '2026-07-14',
    location: 'I-64 westbound near Louisville, KY',
    description: 'Insured box truck rear-ended a sedan in slowed traffic.',
    policeReport: 'Jefferson County PD · Report 26-071442',
    sources,
    reporter: { name: 'Harborview Agency', method: 'Loss notice' },
    claimant: { name: 'Dana Whitfield', email: null },
    airbag: 'missing',
    driver: { name: 'Marcus Reyes', status: 'off-schedule' },
    vehicles: [
      'Insured 2022 Isuzu NPR box truck, front bumper and grille',
      'Claimant 2019 Honda Accord, rear bumper and trunk',
    ],
    injuries: 'Claimant reports neck pain; treated and released at the scene',
    tasks: [],
  }
}

const ISO_DATE = /\b(20\d{2})-(\d{2})-(\d{2})\b/
const US_DATE = /\b(\d{1,2})\/(\d{1,2})\/(20\d{2})\b/
/** Month/day with no year, e.g. 10/10. A slash-year stays with US_DATE. */
const US_SHORT = /\b(\d{1,2})\/(\d{1,2})\b(?!\/)/
const MONTHS: Record<string, number> = {
  january: 1,
  jan: 1,
  february: 2,
  feb: 2,
  march: 3,
  mar: 3,
  april: 4,
  apr: 4,
  may: 5,
  june: 6,
  jun: 6,
  july: 7,
  jul: 7,
  august: 8,
  aug: 8,
  september: 9,
  sept: 9,
  sep: 9,
  october: 10,
  oct: 10,
  november: 11,
  nov: 11,
  december: 12,
  dec: 12,
}
const MONTH_NAME = Object.keys(MONTHS)
  .sort((a, b) => b.length - a.length)
  .join('|')
/** "october 10th", "on October 10", "October 10, 2026". */
const NAMED_DATE = new RegExp(
  String.raw`\b(?:on\s+)?(${MONTH_NAME})\.?\s+(\d{1,2})(?:st|nd|rd|th)?(?:(?:,\s*|\s+)(20\d{2}))?\b`,
  'i',
)
const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/
/** A place runs to the end of its clause; ", TN" after a city stays part of it. */
const PLACE_END = String.raw`(?=\s+on\s|\s+\d{1,2}\/\d|\s+20\d{2}-|\s+(?:and|when|while)\s|,(?!\s*[A-Z]{2}\b)|[.;]|$)`
const LOCATION = new RegExp(String.raw`\b(?:at|near)\s+([^.;]+?(?:,\s*[A-Z]{2}\b)?)` + PLACE_END)
const ROAD = new RegExp(
  String.raw`\bon\s+((?:I-?\s?\d+|(?:Highway|Hwy|Route|Rt\.?|US)\s?-?\d+|(?:[A-Z][\w'.]*\s+)+(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Dr|Drive|Ln|Lane|Way|Pkwy|Parkway|Hwy)\b)[^.;]*?(?:,\s*[A-Z]{2}\b)?)` +
    PLACE_END,
)
const DAMAGE = /\b(damag|dent|smash|crush|broke|crack|shatter|bumper|windshield|fender|totaled|flood|leak|fire|burn|roof)/i
/** A line is a vehicle only when the loss names one. "Fire" and "warehouse" do not. */
const VEHICLE = /\b(vehicles?|cars?|autos?|trucks?|box\s+trucks?|vans?|suvs?|motorcycles?|sedans?|pickups?|trailers?|buses|rear[-\s]?ended)\b/i
/** Perils that describe property damage rather than a vehicle. */
const PROPERTY_PERIL = /\b(fires?|burns?|flood(?:ing|ed|s)?|leaks?|roofs?|smoke)\b/i
const INJURY = /\b(injur|hurt|pain|ambulance|hospital|ER|whiplash|bleeding)\b/i
/** Stored ahead of a property line so the damage list can label it Property. */
export const PROPERTY_DAMAGE_PREFIX = 'Property · '
export const VEHICLE_DAMAGE_PREFIX = 'Vehicle · '

/** Damage words with the place name removed: "Warehouse fire" → "fire". */
function propertyDamageDetail(clause: string): string | null {
  if (VEHICLE.test(clause) || !PROPERTY_PERIL.test(clause)) return null
  const detail = clause
    .replace(/\b(storefronts?|store\s*fronts?|retail|stores?|shops?|warehouses?|offices?|buildings?|garages?)\b/gi, ' ')
    .replace(
      /\b(?:on\s+)?(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?\s+\d{1,2}(?:st|nd|rd|th)?(?:(?:,\s*|\s+)20\d{2})?\b/gi,
      ' ',
    )
    .replace(/\b\d{1,2}\/\d{1,2}(?:\/20\d{2})?\b/g, ' ')
    .replace(/\b(?:yesterday|today|last night|this (?:morning|afternoon|evening))\b/gi, ' ')
    .replace(/\b(the|a|an|at|in|on|our|my)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!detail || !PROPERTY_PERIL.test(detail)) return null
  return detail
}

function isoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

/** A real calendar day, or null. Yearless dates use the current year. */
function isoFromParts(year: number, month: number, day: number): string | null {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) return null
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function parseLossDate(text: string): string | null {
  const iso = text.match(ISO_DATE)
  if (iso) {
    const parsed = isoFromParts(Number(iso[1]), Number(iso[2]), Number(iso[3]))
    if (parsed) return parsed
  }
  const us = text.match(US_DATE)
  if (us) {
    const parsed = isoFromParts(Number(us[3]), Number(us[1]), Number(us[2]))
    if (parsed) return parsed
  }
  const named = text.match(NAMED_DATE)
  if (named) {
    const month = MONTHS[named[1].toLowerCase()]
    const year = named[3] ? Number(named[3]) : new Date().getFullYear()
    const parsed = isoFromParts(year, month, Number(named[2]))
    if (parsed) return parsed
  }
  const short = text.match(US_SHORT)
  if (short) {
    const parsed = isoFromParts(new Date().getFullYear(), Number(short[1]), Number(short[2]))
    if (parsed) return parsed
  }
  if (/\b(yesterday|last night)\b/i.test(text)) return isoDate(new Date(Date.now() - 86_400_000))
  if (/\b(today|this (morning|afternoon|evening))\b/i.test(text)) return isoDate(new Date())
  return null
}

/** Sentences and the clauses inside them, so each fact gets only its own part of the narrative. */
function clauses(text: string) {
  return text
    .split(/(?<=[.;!?])\s+|,\s+(?![A-Z]{2}\b)|\s+(?:and|but)\s+(?=(?:the|a|an|our|my|his|her|their|he|she|they|we|I|it|nobody|no one)\b)/)
    .map((part) => part.trim())
    .filter(Boolean)
}

/** Fills only empty facts from free text; never overwrites what a source already said. */
export function applyClaimText(draft: CreateClaimDraft, text: string): CreateClaimDraft {
  const next = { ...draft }
  const date = parseLossDate(text)
  if (date && !next.dateOfLoss) next.dateOfLoss = date
  const email = text.match(EMAIL)?.[0]
  if (email && next.claimant && !next.claimant.email) next.claimant = { ...next.claimant, email }
  if (/airbags?/i.test(text) && (next.airbag === 'missing' || next.airbag === 'unknown')) {
    next.airbag = /(not|didn'?t|did not|no)\b.*deploy|no airbag/i.test(text) ? 'not deployed' : 'deployed'
  }
  // A named kind of site ("storefront", "warehouse") resolves only to that policy's location.
  // Several matches stay empty so the thread can ask, and a road is not guessed over them.
  let matchedSites = 0
  if (!next.location && next.policy) {
    const sites = matchingInsuredLocations(text, insuredLocations(next.policy))
    matchedSites = sites.length
    if (sites.length === 1) next.location = sites[0].address
  }
  const near = matchedSites > 1 ? null : (text.match(ROAD) ?? text.match(LOCATION))
  if (near && !next.location) next.location = near[1].trim()
  if (!next.injuries) {
    if (/\b(no one (was )?(hurt|injured)|no injur|nobody (was )?hurt)/i.test(text)) next.injuries = 'None reported'
    else {
      const injured = clauses(text).find((clause) => INJURY.test(clause))
      if (injured) next.injuries = injured
    }
  }
  if (next.vehicles.length === 0) {
    const damaged = clauses(text).find((clause) => DAMAGE.test(clause) && !INJURY.test(clause))
    if (damaged && VEHICLE.test(damaged)) next.vehicles = [damaged]
    else if (damaged) {
      const detail = propertyDamageDetail(damaged)
      if (detail) next.vehicles = [`${PROPERTY_DAMAGE_PREFIX}${detail}`]
      else next.vehicles = [`${VEHICLE_DAMAGE_PREFIX}${damaged.replace(/[.]+$/g, '')}`]
    }
  }
  if (!email && !next.description && text.split(/\s+/).length >= 4) next.description = text
  return next
}

const NAME = "[A-Z][a-zA-Z'’-]+(?:\\s+[A-Z][a-zA-Z'’-]+)?"
const FULL_NAME = "[A-Z][a-zA-Z'’-]+\\s+[A-Z][a-zA-Z'’-]+"
const CALLER_INTRO = new RegExp(`(?:^|[,.]\\s*|\\s)(?:[Tt]his is|I'm|I am|[Mm]y name is|[Ii]t's)\\s+(${NAME})`)
const CALLER_LEAD = new RegExp(`^\\s*(${FULL_NAME})\\s+(?:from|at|with|of)\\s`)
const CALLER_COMMA = new RegExp(`^\\s*(${FULL_NAME}),`)

function coreName(insured: string) {
  return insured
    .replace(/,?\s+(LLC|Inc\.?|Co\.?|Corp\.?|Company|L\.L\.C\.)$/i, '')
    .trim()
    .toLowerCase()
}

/** Insured whose name the caller mentions, matched without the legal suffix. */
export function policyMentionedIn(text: string): ClaimPolicy | null {
  const lower = text.toLowerCase()
  for (const policy of CLAIM_POLICIES.values()) {
    if (lower.includes(coreName(policy.insured))) return policy
  }
  // Callers shorten the name ("Velocity Courier" for Velocity Courier Services LLC); two leading words are enough.
  for (const policy of CLAIM_POLICIES.values()) {
    const words = coreName(policy.insured).split(/\s+/)
    const lead = words.slice(0, 2).map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    if (words.length >= 3 && new RegExp(`\\b${lead.join('\\s+')}\\b`).test(lower)) return policy
  }
  return null
}

/** Draft from the caller's reply only: who is calling, what happened, and anything else they said. */
export function phoneClaimDraft(text: string): CreateClaimDraft {
  const intro = text.match(CALLER_INTRO) ?? text.match(CALLER_LEAD) ?? text.match(CALLER_COMMA)
  const callerName = intro?.[1]?.trim() ?? null
  // The loss is whatever follows the caller's introduction.
  const afterIntro = intro ? text.slice(text.indexOf(intro[1]) + intro[1].length).replace(/^[^.;,]*[.;,]\s*/, '') : text
  const policy = policyMentionedIn(text)
  const base: CreateClaimDraft = {
    ...emptyClaimDraft(),
    ...(policy ? { policy, claimNumber: nextClaimNumber(claimPrefix(policy.product)) } : {}),
    reporter: { name: callerName, method: 'Phone' },
  }
  const described = afterIntro.trim().split(/\s+/).length >= 4 ? afterIntro.trim() : null
  // The caller's introduction alone is not a loss description.
  const filled = applyClaimText({ ...base, description: described ?? '' }, text)
  return { ...filled, description: described }
}

/** What the caller has said so far, layered under the draft: it fills empty facts and never overwrites one. */
export function applyCallerText(draft: CreateClaimDraft | null, text: string): CreateClaimDraft {
  const heard = phoneClaimDraft(text)
  if (!draft) return heard
  return {
    ...draft,
    ...(draft.policy == null && heard.policy ? { policy: heard.policy, claimNumber: heard.claimNumber } : {}),
    reporter: draft.reporter ?? heard.reporter,
    dateOfLoss: draft.dateOfLoss ?? heard.dateOfLoss,
    location: draft.location ?? heard.location,
    description: draft.description ?? heard.description,
    vehicles: draft.vehicles.length > 0 ? draft.vehicles : heard.vehicles,
    injuries: draft.injuries ?? heard.injuries,
  }
}

export function formatLossDate(iso: string) {
  const [year, month, day] = iso.split('-')
  return `${month}/${day}/${year}`
}

const LOSS_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Known facts: "Oct 10, 2026", read from the ISO parts so the day does not shift. */
export function formatKnownLossDate(iso: string) {
  const [year, month, day] = iso.split('-')
  const monthIndex = Number(month) - 1
  const dayNumber = Number(day)
  if (!year || monthIndex < 0 || monthIndex > 11 || !dayNumber) return formatLossDate(iso)
  return `${LOSS_MONTHS[monthIndex]} ${dayNumber}, ${year}`
}

/** A Claims row opened in the drawer: the facts the list knows, nothing more. */
export function draftFromRecord(record: ClaimRecord): CreateClaimDraft {
  return {
    claimNumber: record.claimNumber,
    policy: record.policyNumber
      ? { insured: record.insured, product: record.product, policyNumber: record.policyNumber }
      : null,
    dateOfLoss: record.dateOfLoss || null,
    location: record.location,
    description: record.description,
    policeReport: null,
    sources: [],
    reporter: null,
    claimant: null,
    airbag: null,
    driver: null,
    vehicles: [],
    injuries: null,
    tasks: [],
  }
}

/** The Claims row a draft writes; keeps assignee, alerts, notes, and tasks from an existing row. */
export function recordFromDraft(draft: CreateClaimDraft, status: ClaimStatus, existing: ClaimRecord | null): ClaimRecord {
  return {
    id: existing?.id ?? `claim-${draft.claimNumber}`,
    claimNumber: draft.claimNumber,
    insured: draft.policy?.insured ?? existing?.insured ?? 'Unmatched insured',
    product: draft.policy?.product ?? existing?.product ?? '—',
    policyNumber: draft.policy?.policyNumber ?? null,
    dateOfLoss: draft.dateOfLoss ?? '',
    location: draft.location,
    description: draft.description,
    status,
    assignee: draft.assignee ?? existing?.assignee ?? 'Unassigned',
    hasAlert: existing?.hasAlert ?? false,
    notes: [
      ...(existing?.notes ?? []),
      ...(draft.notes ?? []).filter((note) => !existing?.notes.some((entry) => entry.id === note.id)),
    ],
    tasks: [
      ...(existing?.tasks ?? []),
      ...draft.tasks.filter((task) => !existing?.tasks.some((entry) => entry.id === task.id)),
    ],
  }
}

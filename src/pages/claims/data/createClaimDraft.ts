import {
  claimPrefix,
  nextClaimNumber,
  type ClaimRecord,
  type ClaimStatus,
  type ClaimTask,
} from '@/pages/claims/data/claimsStore'
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
}

export type ClaimReportMethod = 'Phone' | 'Loss notice'

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

/** Starts a draft on a chosen policy; the loss itself is still unknown. */
export function policyClaimDraft(policy: ClaimPolicy): CreateClaimDraft {
  return { ...emptyClaimDraft(), policy, claimNumber: nextClaimNumber(claimPrefix(policy.product)) }
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
      'Insured 2022 Isuzu NPR box truck · front bumper and grille',
      'Claimant 2019 Honda Accord · rear bumper and trunk',
    ],
    injuries: 'Claimant reports neck pain; treated and released at the scene',
    tasks: [],
  }
}

const ISO_DATE = /\b(20\d{2})-(\d{2})-(\d{2})\b/
const US_DATE = /\b(\d{1,2})\/(\d{1,2})\/(20\d{2})\b/
const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/
const LOCATION = /\b(?:at|near)\s+([^.;]+?)(?=\s+on\s|\s+\d{1,2}\/\d|\s+20\d{2}-|[.;]|$)/

export function parseLossDate(text: string): string | null {
  const iso = text.match(ISO_DATE)
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`
  const us = text.match(US_DATE)
  if (us) return `${us[3]}-${us[1].padStart(2, '0')}-${us[2].padStart(2, '0')}`
  return null
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
  const near = text.match(LOCATION)
  if (near && !next.location) next.location = near[1].trim()
  if (!next.injuries) {
    if (/\b(no one (was )?(hurt|injured)|no injur|nobody (was )?hurt)/i.test(text)) next.injuries = 'None reported'
    else {
      const injured = text.split(/(?<=[.;])\s+/).find((sentence) => /\b(injur|hurt|pain|ambulance|hospital|ER)\b/i.test(sentence))
      if (injured) next.injuries = injured.trim()
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

export function formatLossDate(iso: string) {
  const [year, month, day] = iso.split('-')
  return `${month}/${day}/${year}`
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
    assignee: existing?.assignee ?? 'Unassigned',
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

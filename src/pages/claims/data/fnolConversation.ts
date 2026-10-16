import { insuredLocations } from '@/pages/claims/data/policyLocations'
import { claimPrefix, nextClaimNumber } from '@/pages/claims/data/claimsStore'
import {
  CLAIM_CURRENT_USER,
  CLAIM_POLICIES,
  CLAIM_POLICY_NUMBERS,
  applyCallerText,
  applyClaimText,
  documentClaimDraft,
  emptyClaimDraft,
  formatKnownLossDate,
  phoneClaimDraft,
  policyMentionedIn,
  type ClaimPolicy,
  type CreateClaimDraft,
} from '@/pages/claims/data/createClaimDraft'

/** Conversational first notice. The claim is filed here, not in the Create claim drawer. */
export const FNOL_PATH = '/claims/new'

export const FNOL_OPENING =
  'I will take this first notice with you. Tell me what happened — who was involved, when and where, and what was damaged or who was hurt. You can add a party at any time, or start from a caller, a loss notice, or a policy.'

export const FNOL_PARTY_ROLES = ['Reporter', 'Claimant', 'Driver', 'Witness', 'Passenger', 'Injured', 'Other'] as const

export type FnolPartyRole = (typeof FNOL_PARTY_ROLES)[number] | 'Insured'
export type FnolIntakeMode = 'narrative' | 'caller'

export type FnolParty = {
  id: string
  role: FnolPartyRole
  name: string
  contact: string | null
}

export type FnolRow = {
  term: string
  value: string | null
  hint?: string
  field?: string
  tone?: 'error' | 'warning'
  chevron?: boolean
}

export type FnolTally = {
  known: FnolRow[]
  attention: FnolRow[]
  considerations: FnolRow[]
}

type Fact = { key: string; label: string }

const ROLE_WORD = String.raw`reporter|claimant|driver|witness|passenger|injured(?:\s+person)?|other(?:\s+party)?`
const PERSON = String.raw`[A-Z][a-zA-Z'’-]+(?:\s+[A-Z][a-zA-Z'’-]+)?`
const ADD_PARTY = new RegExp(
  String.raw`\badd(?:\s+a)?\s+party\s+(.+?)\s+as\s+(?:an?\s+)?(${ROLE_WORD})\b`,
  'i',
)
const ROLE_IS = new RegExp(String.raw`\b(?:the\s+)?(?:other\s+)?(${ROLE_WORD})\s+(?:is|was)\s+(${PERSON})`, 'i')
const NAME_IS_ROLE = new RegExp(String.raw`\b(${PERSON})\s+(?:is|was)\s+(?:the\s+)?(?:other\s+)?(${ROLE_WORD})\b`, 'i')
const ROLE_NAME = new RegExp(String.raw`\b(${ROLE_WORD})\s+(${PERSON})`, 'i')
const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/
const PHONE = /\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}/
const DRIVER_NAME = new RegExp(String.raw`\b(?:driven by|driver(?:'s name)?(?:\s+was|\s+is))\s+(${PERSON})`)
const POLICE_REPORT = /\b(?:police\s+)?report\s*(?:number|#|no\.?)?\s*[:#]?\s*([A-Z0-9][A-Z0-9-]{3,})/i

function fnolId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export function createFnolDraft(): CreateClaimDraft {
  return { ...emptyClaimDraft(), assignee: CLAIM_CURRENT_USER }
}

export function normalizeFnolRole(raw: string): FnolPartyRole {
  const role = raw.toLowerCase()
  if (role.startsWith('report')) return 'Reporter'
  if (role.startsWith('claim')) return 'Claimant'
  if (role.startsWith('driv')) return 'Driver'
  if (role.startsWith('wit')) return 'Witness'
  if (role.startsWith('pass')) return 'Passenger'
  if (role.startsWith('inj')) return 'Injured'
  if (role.startsWith('insur')) return 'Insured'
  return 'Other'
}

function contactIn(text: string): string | null {
  return text.match(EMAIL)?.[0] ?? text.match(PHONE)?.[0] ?? null
}

function cleanName(raw: string) {
  return raw.replace(/[,.;:]+$/g, '').replace(/\s+/g, ' ').trim()
}

function partyCommand(text: string) {
  return /^\s*add(?:\s+a)?\s+party\b/i.test(text.trim())
}

/** Pulls parties out of a sentence. A command such as "add party Sam Lee as witness" does not become the loss. */
export function partiesFromText(text: string): Array<Omit<FnolParty, 'id'> & { id?: string }> {
  const found: Array<{ role: FnolPartyRole; name: string }> = []
  const push = (roleRaw: string, nameRaw: string) => {
    const name = cleanName(nameRaw)
    const role = normalizeFnolRole(roleRaw)
    if (!name || name.split(/\s+/).length > 4) return
    if (/^(the|a|an|our|my|this|that)$/i.test(name)) return
    if (found.some((party) => party.role === role && party.name.toLowerCase() === name.toLowerCase())) return
    found.push({ role, name })
  }
  const added = text.match(ADD_PARTY)
  if (added) push(added[2], added[1])
  const roleIs = text.match(ROLE_IS)
  if (roleIs) push(roleIs[1], roleIs[2])
  const nameIs = text.match(NAME_IS_ROLE)
  if (nameIs) push(nameIs[2], nameIs[1])
  if (found.length === 0) {
    const roleName = text.match(ROLE_NAME)
    if (roleName && !/^(is|was|the|our|a)$/i.test(roleName[2])) push(roleName[1], roleName[2])
  }
  const contact = contactIn(text)
  return found.map((party) => ({ ...party, contact }))
}

function ensureParty(parties: FnolParty[], role: FnolPartyRole, name: string, contact: string | null): FnolParty[] {
  const existing = parties.find((party) => party.role === role && party.name.toLowerCase() === name.toLowerCase())
  if (!existing) return [...parties, { id: fnolId('party'), role, name, contact }]
  if (contact && existing.contact !== contact) {
    return parties.map((party) => (party.id === existing.id ? { ...party, contact } : party))
  }
  return parties
}

function applyPartyToDraft(draft: CreateClaimDraft, party: Pick<FnolParty, 'role' | 'name' | 'contact'>): CreateClaimDraft {
  const email = party.contact?.includes('@') ? party.contact : null
  switch (party.role) {
    case 'Reporter':
      return { ...draft, reporter: { name: party.name, method: draft.reporter?.method ?? 'Phone' } }
    case 'Claimant':
      return {
        ...draft,
        claimant: { name: party.name, email: email ?? (draft.claimant?.name === party.name ? draft.claimant.email : null) },
      }
    case 'Driver':
      if (
        draft.driver &&
        (draft.driver.status === 'off-schedule' || draft.driver.status === 'referred') &&
        draft.driver.name.toLowerCase() === party.name.toLowerCase()
      ) {
        return draft
      }
      if (draft.driver && (draft.driver.status === 'off-schedule' || draft.driver.status === 'referred')) {
        return { ...draft, driver: { ...draft.driver, name: party.name } }
      }
      return { ...draft, driver: { name: party.name, status: 'scheduled' } }
    case 'Injured': {
      if (draft.injuries?.includes(party.name)) return draft
      const line = party.contact ? `${party.name} (${party.contact})` : party.name
      const injuries = !draft.injuries || draft.injuries === 'None reported' ? line : `${draft.injuries}; ${line}`
      return { ...draft, injuries }
    }
    default:
      return draft
  }
}

export function syncFnolParties(draft: CreateClaimDraft, parties: FnolParty[]): FnolParty[] {
  let next = parties
  if (draft.policy) next = ensureParty(next, 'Insured', draft.policy.insured, null)
  if (draft.reporter?.name) next = ensureParty(next, 'Reporter', draft.reporter.name, null)
  if (draft.claimant) next = ensureParty(next, 'Claimant', draft.claimant.name, draft.claimant.email)
  if (draft.driver) next = ensureParty(next, 'Driver', draft.driver.name, null)
  return next
}

function policyFromText(text: string): ClaimPolicy | null {
  const lower = text.toLowerCase()
  for (const policyNumber of CLAIM_POLICY_NUMBERS) {
    if (lower.includes(policyNumber.toLowerCase())) return CLAIM_POLICIES.get(policyNumber) ?? null
  }
  return policyMentionedIn(text)
}

export function assignFnolPolicy(draft: CreateClaimDraft, policyNumber: string): CreateClaimDraft | null {
  const policy = CLAIM_POLICIES.get(policyNumber)
  if (!policy) return null
  const prefix = claimPrefix(policy.product)
  const claimNumber = draft.claimNumber.startsWith(prefix) ? draft.claimNumber : nextClaimNumber(prefix)
  return { ...draft, policy, claimNumber }
}

function policeReportFrom(text: string): string | null {
  if (/\bno police report\b|\bpolice (?:were |was )?not called\b/i.test(text)) return 'None filed'
  const match = text.match(POLICE_REPORT)
  if (!match) return null
  if (/^(or|and|the|was|is)$/i.test(match[1])) return null
  return match[1]
}

function driverFrom(text: string): string | null {
  const match = text.match(DRIVER_NAME)
  return match ? cleanName(match[1]) : null
}

/** The shared place parser can run into the next clause ("… IN our van rear-ended…"). Keep the place. */
function trimFnolLocation(location: string) {
  const cut = location.split(/\s+(?:our|my|the|a|an|his|her)\s+(?:van|car|truck|driver|vehicle|sedan|auto)\b/i)[0] ?? location
  return cut.replace(/[.,\s]+$/g, '').trim() || location
}

/** A bumper line and a separate "van rear-ended" line still count as vehicle damage. */
function noteVehicleDamage(draft: CreateClaimDraft, text: string): CreateClaimDraft {
  if (draft.vehicles.length > 0 || !text.trim()) return draft
  const line = text
    .split(/(?<=[.;!?])\s+/)
    .map((part) => part.trim())
    .find(
      (part) =>
        /\b(bumper|fender|windshield|grille|hood|door|quarter panel|headlight)\b/i.test(part) ||
        (/\bdamag/i.test(part) && /\b(van|car|truck|sedan|vehicle|auto)\b/i.test(part)),
    )
  if (!line) return draft
  return { ...draft, vehicles: [`Vehicle · ${line.replace(/[.]+$/g, '')}`] }
}

function looksLikeAuto(draft: CreateClaimDraft) {
  if (/auto|vehicle/i.test(draft.policy?.product ?? '')) return true
  if (draft.driver) return true
  return draft.vehicles.some((entry) => !entry.startsWith('Property · '))
}

function factsOf(draft: CreateClaimDraft, parties: FnolParty[]): Fact[] {
  const rows: Fact[] = [{ key: 'claim', label: `claim ${draft.claimNumber}` }]
  if (draft.policy) rows.push({ key: 'policy', label: draft.policy.insured })
  if (draft.dateOfLoss) rows.push({ key: 'date', label: formatKnownLossDate(draft.dateOfLoss) })
  if (draft.location) rows.push({ key: `location:${draft.location}`, label: draft.location })
  if (draft.description) rows.push({ key: `description:${draft.description}`, label: 'what happened' })
  if (draft.reporter?.name) rows.push({ key: 'reporter', label: `${draft.reporter.name} as the reporter` })
  if (draft.claimant) {
    rows.push({
      key: 'claimant',
      label: draft.claimant.email ? `${draft.claimant.name} · ${draft.claimant.email}` : `${draft.claimant.name} as the claimant`,
    })
  }
  if (draft.driver) rows.push({ key: `driver:${draft.driver.name}:${draft.driver.status}`, label: `${draft.driver.name} as the driver` })
  if (draft.vehicles.length) rows.push({ key: `vehicles:${draft.vehicles.join('|')}`, label: 'the damage' })
  if (draft.injuries) rows.push({ key: `injuries:${draft.injuries}`, label: draft.injuries === 'None reported' ? 'no injuries' : 'injuries' })
  if (draft.policeReport) {
    rows.push({
      key: `police:${draft.policeReport}`,
      label: draft.policeReport === 'None filed' ? 'no police report' : 'the police report',
    })
  }
  if (draft.airbag && draft.airbag !== 'missing') {
    const label =
      draft.airbag === 'deployed' ? 'airbags deployed' : draft.airbag === 'not deployed' ? 'airbags not deployed' : 'airbags unknown'
    rows.push({ key: `airbag:${draft.airbag}`, label })
  }
  if (draft.sources.length) rows.push({ key: `sources:${draft.sources.join('|')}`, label: 'the documents' })
  for (const party of parties) {
    if (party.role === 'Insured' || party.role === 'Reporter' || party.role === 'Claimant' || party.role === 'Driver') continue
    rows.push({
      key: `party:${party.role}:${party.name}`,
      label: party.contact ? `${party.name} as ${party.role.toLowerCase()} · ${party.contact}` : `${party.name} as ${party.role.toLowerCase()}`,
    })
  }
  return rows
}

export function fnolCaptured(
  before: { draft: CreateClaimDraft; parties: FnolParty[] },
  after: { draft: CreateClaimDraft; parties: FnolParty[] },
) {
  const prev = new Map(factsOf(before.draft, before.parties).map((fact) => [fact.key, fact.label]))
  const labels: string[] = []
  for (const fact of factsOf(after.draft, after.parties)) {
    if (prev.get(fact.key) !== fact.label && !labels.includes(fact.label)) labels.push(fact.label)
  }
  return labels
}

function listPhrase(items: string[]) {
  const shown = items.slice(0, 4)
  const extra = items.length - shown.length
  const body = shown.join(', ')
  return extra > 0 ? `${body}, and ${extra} more` : body
}

export function fnolAsk(field: string | undefined, term: string) {
  switch (field) {
    case 'policy':
      return 'Which policy or insured should this attach to?'
    case 'description':
      return 'What happened?'
    case 'dateOfLoss':
      return 'When did the loss happen?'
    case 'location':
      return 'Where did it happen?'
    case 'damage':
      return 'What was damaged, or who was hurt?'
    case 'claimantEmail':
      return 'How should we reach the claimant — an email or a phone number?'
    case 'airbag':
      return 'Did the airbags deploy?'
    case 'driver':
      return 'That driver is not on the schedule for the date of loss. Refer them to coverage, or correct the name.'
    default:
      return `Still needed: ${term}.`
  }
}

export function fnolReply(captured: string[], attention: FnolRow[]) {
  const lead =
    captured.length === 0 ? 'I did not catch a new fact in that.' : `Captured ${listPhrase(captured)}.`
  const next = attention[0]
  if (!next) return `${lead} Needs attention is clear — you can submit the claim, or add another party.`
  return `${lead} ${fnolAsk(next.field, next.term)}`
}

function applyNarrative(draft: CreateClaimDraft, text: string, mode: FnolIntakeMode) {
  const narrative = partyCommand(text) ? '' : text
  if (!narrative.trim()) return draft
  return mode === 'caller' ? applyCallerText(draft, narrative) : applyClaimText(draft, narrative)
}

export function ingestFnolTurn(input: {
  draft: CreateClaimDraft
  parties: FnolParty[]
  text: string
  files?: string[]
  mode: FnolIntakeMode
}) {
  const before = { draft: input.draft, parties: input.parties }
  let draft = input.draft
  let parties = input.parties
  const files = input.files ?? []
  if (files.length > 0) {
    const names = [...new Set([...draft.sources, ...files])]
    // A file is the loss only when the conversation has not already matched a policy or described it.
    const assignee = draft.assignee
    draft =
      draft.policy != null || draft.description != null
        ? { ...draft, sources: names }
        : { ...documentClaimDraft(names), assignee }
  }
  const text = input.text.trim()
  if (text) {
    // A caller introduction ("This is Maria Chen…") is a phone turn even before that mode is selected.
    const caller =
      files.length === 0 && !partyCommand(text) && (input.mode === 'caller' || Boolean(phoneClaimDraft(text).reporter?.name))
    draft = caller ? applyCallerText(draft, text) : applyNarrative(draft, text, 'narrative')
    if (draft.location) {
      const location = trimFnolLocation(draft.location)
      if (location !== draft.location) draft = { ...draft, location }
    }
    draft = noteVehicleDamage(draft, text)
  }
  if (!draft.policy) {
    const policy = policyFromText(text)
    if (policy) {
      const assigned = assignFnolPolicy(draft, policy.policyNumber)
      if (assigned) draft = assigned
    }
  }
  if (!draft.policeReport) {
    const report = policeReportFrom(text)
    if (report) draft = { ...draft, policeReport: report }
  }
  if (!draft.driver) {
    const driver = driverFrom(text)
    if (driver) draft = { ...draft, driver: { name: driver, status: 'scheduled' } }
  }
  for (const party of partiesFromText(text)) {
    parties = ensureParty(parties, party.role, party.name, party.contact)
    const stored = parties.find((item) => item.role === party.role && item.name.toLowerCase() === party.name.toLowerCase())
    if (stored) draft = applyPartyToDraft(draft, stored)
  }
  parties = syncFnolParties(draft, parties)
  return { draft, parties, captured: fnolCaptured(before, { draft, parties }) }
}

export function addFnolParty(
  draft: CreateClaimDraft,
  parties: FnolParty[],
  input: { role: FnolPartyRole; name: string; contact: string },
) {
  const name = input.name.trim()
  const contact = input.contact.trim() || null
  if (!name || input.role === 'Insured') return { draft, parties, captured: [] as string[] }
  const before = { draft, parties }
  const nextParties = ensureParty(parties, input.role, name, contact)
  const stored = nextParties.find((party) => party.role === input.role && party.name.toLowerCase() === name.toLowerCase())
  const nextDraft = stored ? applyPartyToDraft(draft, stored) : draft
  const synced = syncFnolParties(nextDraft, nextParties)
  return { draft: nextDraft, parties: synced, captured: fnolCaptured(before, { draft: nextDraft, parties: synced }) }
}

export function setFnolPartyContact(draft: CreateClaimDraft, parties: FnolParty[], id: string, contact: string) {
  const party = parties.find((item) => item.id === id)
  if (!party) return { draft, parties, captured: [] as string[] }
  return addFnolParty(draft, parties, { role: party.role, name: party.name, contact })
}

export function removeFnolParty(draft: CreateClaimDraft, parties: FnolParty[], id: string) {
  const party = parties.find((item) => item.id === id)
  if (!party || party.role === 'Insured') return { draft, parties }
  let next = draft
  if (party.role === 'Reporter' && draft.reporter?.name === party.name) next = { ...next, reporter: null }
  if (party.role === 'Claimant' && draft.claimant?.name === party.name) next = { ...next, claimant: null }
  if (party.role === 'Driver' && draft.driver?.name === party.name) next = { ...next, driver: null }
  if (party.role === 'Injured' && next.injuries?.includes(party.name)) {
    const remaining = next.injuries.split('; ').filter((line) => !line.includes(party.name))
    next = { ...next, injuries: remaining.length > 0 ? remaining.join('; ') : null }
  }
  return { draft: next, parties: parties.filter((item) => item.id !== id) }
}

export function referFnolDriver(draft: CreateClaimDraft): CreateClaimDraft {
  if (!draft.driver || draft.driver.status === 'referred') return draft
  const title = `Coverage review: ${draft.driver.name} not on the DOL driver schedule`
  return {
    ...draft,
    driver: { ...draft.driver, status: 'referred' },
    tasks: [
      ...draft.tasks,
      { id: fnolId('task'), title, assignee: draft.assignee ?? CLAIM_CURRENT_USER, dueLabel: 'in 3 days' },
    ],
  }
}

export function setFnolAirbag(draft: CreateClaimDraft, airbag: 'deployed' | 'not deployed' | 'unknown'): CreateClaimDraft {
  return { ...draft, airbag }
}

function blocker(term: string, hint: string, field: string, chevron = false): FnolRow {
  return { term, value: null, hint, tone: 'error', field, ...(chevron ? { chevron: true } : {}) }
}

function consideration(term: string, hint: string, field: string, value: string | null = null): FnolRow {
  return { term, value, hint, tone: 'warning', field }
}

export function fnolLossStarted(draft: CreateClaimDraft, userTurns: number) {
  return userTurns > 0 || draft.policy != null || draft.description != null || draft.sources.length > 0
}

export function buildFnolTally(draft: CreateClaimDraft, parties: FnolParty[], started: boolean): FnolTally {
  const insuredName = draft.policy?.insured ?? null
  const locations = draft.policy ? insuredLocations(draft.policy) : []
  const locationOffSchedule =
    draft.location != null && locations.length > 0 && !locations.some((location) => location.address === draft.location)
  const claimantParty = parties.find((party) => party.role === 'Claimant' && party.name === draft.claimant?.name)
  const claimantReachable = Boolean(draft.claimant?.email || claimantParty?.contact)
  const auto = looksLikeAuto(draft)
  const known: FnolRow[] = [
    ...(draft.reporter
      ? [
          {
            term: 'Reported by',
            value: `${draft.reporter.name ?? 'Caller'} · ${draft.reporter.method === 'Phone' ? 'by phone' : 'loss notice'}`,
            field: 'reporter',
          },
        ]
      : []),
    ...(insuredName ? [{ term: 'Insured', value: insuredName, field: 'policy' }] : []),
    ...(draft.policy
      ? [{ term: 'Policy', value: `${draft.policy.policyNumber} · ${draft.policy.product}`, field: 'policy' }]
      : []),
    ...(draft.dateOfLoss ? [{ term: 'Date of loss', value: formatKnownLossDate(draft.dateOfLoss), field: 'dateOfLoss' }] : []),
    ...(draft.location && !locationOffSchedule ? [{ term: 'Location', value: draft.location, field: 'location' }] : []),
    ...(draft.description ? [{ term: 'What happened', value: draft.description, field: 'description' }] : []),
    { term: 'Assigned to', value: draft.assignee === CLAIM_CURRENT_USER ? 'You' : (draft.assignee ?? 'You'), field: 'assignee' },
    ...(draft.claimant
      ? [
          {
            term: 'Claimant',
            value: draft.claimant.email ? `${draft.claimant.name} · ${draft.claimant.email}` : draft.claimant.name,
            field: 'claimant',
          },
        ]
      : []),
    ...(draft.driver && draft.driver.status !== 'off-schedule'
      ? [
          {
            term: 'Driver',
            value: draft.driver.status === 'referred' ? `${draft.driver.name} · referred to coverage` : draft.driver.name,
            field: 'driver',
          },
        ]
      : []),
    ...draft.vehicles.map((entry, index) => ({
      term: entry.startsWith('Property · ') ? 'Property' : 'Vehicle',
      value: entry.replace(/^Vehicle · /, '').replace(/^Property · /, ''),
      field: `vehicle:${index}`,
    })),
    ...(draft.injuries ? [{ term: 'Injuries', value: draft.injuries, field: 'injuries' }] : []),
    ...(draft.airbag && draft.airbag !== 'missing'
      ? [
          {
            term: 'Airbag deployment',
            value: draft.airbag === 'deployed' ? 'Yes' : draft.airbag === 'not deployed' ? 'No' : 'Unknown',
            field: 'airbag',
          },
        ]
      : []),
    ...(draft.policeReport ? [{ term: 'Police report', value: draft.policeReport, field: 'policeReport' }] : []),
    ...parties
      .filter((party) => party.role === 'Witness' || party.role === 'Passenger' || party.role === 'Other')
      .map((party) => ({
        term: party.role,
        value: party.contact ? `${party.name} · ${party.contact}` : party.name,
        field: `party:${party.id}`,
      })),
    ...draft.tasks.map((task) => ({ term: 'Task', value: task.title })),
  ]
  const attention: FnolRow[] = [
    ...(draft.policy == null ? [blocker('Policy', 'Not matched to a policy yet', 'policy')] : []),
    ...(draft.description == null ? [blocker('What happened', 'Not described yet', 'description')] : []),
    ...(draft.dateOfLoss == null ? [blocker('Date of loss', 'Not reported yet', 'dateOfLoss')] : []),
    ...(draft.location == null ? [blocker('Location', 'Not reported yet', 'location')] : []),
    ...(draft.vehicles.length === 0 && draft.injuries == null
      ? [blocker('Damage or injuries', 'None added', 'damage', true)]
      : []),
    ...(draft.driver?.status === 'off-schedule'
      ? [blocker('Driver not on the DOL schedule', `${draft.driver.name} is not on the driver schedule`, 'driver')]
      : []),
    ...(draft.airbag === 'missing' ? [blocker('Airbag deployment unknown', 'Not in the police report or photos', 'airbag')] : []),
    ...(draft.claimant && !claimantReachable
      ? [blocker('Claimant contact missing', `${draft.claimant.name} · phone or email`, 'claimantEmail')]
      : []),
  ]
  const considerations: FnolRow[] = []
  if (started && draft.sources.length === 0) {
    considerations.push(consideration('Supporting documents', 'Loss notice, police report, or photos', 'documents'))
  }
  if (started && auto && !draft.policeReport) {
    considerations.push(consideration('Police report', 'Optional — add it if one was filed', 'policeReport'))
  }
  if (started && auto && !draft.driver && !parties.some((party) => party.role === 'Driver')) {
    considerations.push(consideration('Driver', 'Not named yet', 'driverName'))
  }
  if (started && locationOffSchedule && draft.location) {
    considerations.push(consideration('Not an insured location', 'Worth a look against the policy schedule', 'location', draft.location))
  }
  if (
    started &&
    draft.vehicles.length >= 2 &&
    !parties.some((party) => party.role === 'Witness')
  ) {
    considerations.push(consideration('Witness', 'None named for a multi-vehicle loss', 'witness'))
  }
  for (const party of parties) {
    if (party.role === 'Insured' || party.contact) continue
    if (party.role === 'Claimant' && !claimantReachable) continue
    if (party.role === 'Driver' && draft.driver?.status === 'off-schedule') continue
    considerations.push(consideration(`${party.role} contact`, `${party.name} · phone or email not captured`, `contact:${party.id}`))
  }
  return { known, attention, considerations }
}

export function fnolCanSubmit(draft: CreateClaimDraft, attention: FnolRow[]) {
  return draft.description != null && attention.length === 0
}

export function fnolSuggestions(draft: CreateClaimDraft, attention: FnolRow[], mode: FnolIntakeMode) {
  const fields = new Set(attention.map((row) => row.field))
  const actions = ['Add a party']
  if (fields.has('driver')) actions.push('Refer to coverage')
  if (fields.has('airbag')) actions.push('Airbags deployed', 'Airbags did not deploy')
  if (!draft.policy) actions.push('Match a policy')
  if (draft.sources.length === 0) actions.push('Attach a loss notice')
  if (mode !== 'caller' && !draft.reporter) actions.push('Caller on the phone')
  return actions
}

export const FNOL_POLICY_NUMBERS = CLAIM_POLICY_NUMBERS

export function fnolPolicyLabel(policyNumber: string) {
  return CLAIM_POLICIES.get(policyNumber)?.insured ?? policyNumber
}

export function fnolPolicySubtitle(policyNumber: string) {
  const policy = CLAIM_POLICIES.get(policyNumber)
  return policy ? `${policy.policyNumber} · ${policy.product}` : undefined
}

export function fnolPolicySearch(policyNumber: string) {
  const policy = CLAIM_POLICIES.get(policyNumber)
  return policy ? `${policy.insured} ${policy.policyNumber} ${policy.product}` : policyNumber
}

import { useSyncExternalStore } from 'react'
import { policiesListMock } from '@/pages/policies/data/mockPoliciesList'

export type ClaimStatus = 'Draft' | 'Reported' | 'Open' | 'In review' | 'Coverage referral' | 'Closed'

export type ClaimNote = { id: string; text: string; at: string }
export type ClaimTask = { id: string; title: string; assignee: string; dueLabel: string }
export type ClaimPartyRecord = { name: string; role: string; contact: string | null }

export type ClaimRecord = {
  id: string
  claimNumber: string
  insured: string
  product: string
  policyNumber: string | null
  /** ISO date (YYYY-MM-DD); empty while a draft has no date yet. */
  dateOfLoss: string
  location: string | null
  description: string | null
  status: ClaimStatus
  assignee: string
  hasAlert: boolean
  notes: ClaimNote[]
  tasks: ClaimTask[]
  /** Parties captured while the claim was filed. Claim details adds the insured and adjuster itself. */
  parties?: ClaimPartyRecord[]
}

export const CLAIM_ASSIGNEES = ['Jennifer Collins', 'James Anderson', 'Priya Shah', 'Marcus Lee', 'Elena Ruiz', 'Daniel Okafor']

const PRODUCT_PREFIX: Record<string, string> = {
  'Commercial Auto': 'CA',
  'General Liability': 'GL',
  'Commercial General Liability': 'GL',
  'Umbrella Liability': 'UM',
  "Workers' Compensation": 'WC',
  'Commercial Property': 'CP',
  'Commercial Package': 'CP',
  'Business Owners Policy': 'BP',
}

export function claimPrefix(product: string | undefined) {
  return (product && PRODUCT_PREFIX[product]) || 'CL'
}

type LossTemplate = { description: string; location: string }

const LOSSES: Record<string, LossTemplate[]> = {
  CA: [
    { description: 'Insured van backed into a parked car at a customer site.', location: 'Customer lot, Columbus, OH' },
    { description: 'Box truck sideswiped a pickup while merging.', location: 'I-70 eastbound near Indianapolis, IN' },
    { description: 'Delivery vehicle struck a pedestrian crossing outside the crosswalk.', location: 'Main St and 4th Ave, Dayton, OH' },
    { description: 'Hail damage to three fleet vehicles parked overnight.', location: 'Insured yard, Wichita, KS' },
    { description: 'Insured driver rear-ended at a red light; other driver cited.', location: 'US-31 near Carmel, IN' },
  ],
  GL: [
    { description: 'Customer slipped on a wet floor near the entrance.', location: 'Insured premises, Chicago, IL' },
    { description: 'Visitor tripped over a cable at a job site.', location: 'Job site, Milwaukee, WI' },
    { description: 'Third-party property damaged during an installation.', location: 'Client office, St. Louis, MO' },
    { description: 'Guest reports food-borne illness after an event.', location: 'Banquet hall, Louisville, KY' },
  ],
  WC: [
    { description: 'Employee strained back lifting stock in the warehouse.', location: 'Warehouse, Gary, IN' },
    { description: 'Laceration to hand while operating a saw.', location: 'Fabrication shop, Toledo, OH' },
    { description: 'Fall from a ladder while servicing a rooftop unit.', location: 'Customer roof, Fort Wayne, IN' },
    { description: 'Repetitive strain reported by a line worker.', location: 'Plant 2, Peoria, IL' },
  ],
  CP: [
    { description: 'Burst pipe flooded the ground floor overnight.', location: 'Main building, Des Moines, IA' },
    { description: 'Kitchen fire damaged the hood and walk-in cooler.', location: 'Restaurant, Lexington, KY' },
    { description: 'Wind tore roofing off the east wing.', location: 'Warehouse, Omaha, NE' },
    { description: 'Break-in with stolen equipment and a damaged door.', location: 'Storefront, Cincinnati, OH' },
  ],
}

const STATUS_CYCLE: ClaimStatus[] = ['Open', 'In review', 'Closed', 'Open', 'Reported', 'Closed', 'Coverage referral', 'Open', 'In review', 'Closed']
const ASSIGNEE_CYCLE = [...CLAIM_ASSIGNEES, 'Unassigned']

function isoDaysBefore(iso: string, days: number) {
  const date = new Date(`${iso}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() - days)
  return date.toISOString().slice(0, 10)
}

function record(fields: Omit<ClaimRecord, 'hasAlert' | 'notes' | 'tasks'> & Partial<ClaimRecord>): ClaimRecord {
  return { hasAlert: false, notes: [], tasks: [], ...fields }
}

const draftClaims: ClaimRecord[] = [
  record({ id: 'c-d1', claimNumber: 'CA141285', insured: 'Velocity Courier Services LLC', product: 'Commercial Auto', policyNumber: null, dateOfLoss: '2026-10-06', location: null, description: 'Courier van clipped a mirror in a loading dock.', status: 'Draft', assignee: 'Unassigned' }),
  record({ id: 'c-d2', claimNumber: 'GL141283', insured: 'Lakeside Restaurant Group LLC', product: 'General Liability', policyNumber: null, dateOfLoss: '', location: 'Patio, Lakeside Grill, Madison, WI', description: null, status: 'Draft', assignee: 'Priya Shah' }),
  record({ id: 'c-d3', claimNumber: 'CP141280', insured: 'Red Oak Hospitality Group', product: 'Commercial Property', policyNumber: null, dateOfLoss: '2026-10-02', location: null, description: null, status: 'Draft', assignee: 'Unassigned' }),
]

const policyNumberFor = (insured: string) =>
  policiesListMock.find((policy) => policy.insuredName === insured)?.policyNumber ?? null

const featuredClaims: ClaimRecord[] = ([

  record({ id: 'c-1', claimNumber: 'CA141274', insured: 'Atlantic Ridge Construction, LLC', product: 'Commercial Auto', policyNumber: '01-CA-000100005-0', dateOfLoss: '2026-07-09', location: 'I-95 northbound near Richmond, VA', description: 'Dump truck lost a load of gravel, cracking two windshields.', status: 'Open', assignee: 'Jennifer Collins', hasAlert: true }),
  record({ id: 'c-2', claimNumber: 'CP141261', insured: 'Midwest Fabrication Inc.', product: 'Commercial Package', policyNumber: '01-CP-000017809-0', dateOfLoss: '2026-07-02', location: 'Plant 1, Toledo, OH', description: 'Electrical fire in the paint booth.', status: 'In review', assignee: 'James Anderson' }),
  record({ id: 'c-3', claimNumber: 'GL141255', insured: 'Lakeside Restaurant Group LLC', product: 'General Liability', policyNumber: null, dateOfLoss: '2026-06-28', location: 'Dining room, Madison, WI', description: 'Guest burned by a dropped serving tray.', status: 'Open', assignee: 'Priya Shah' }),
  record({ id: 'c-4', claimNumber: 'WC141249', insured: 'Cascade Mechanical Contractors Inc.', product: "Workers' Compensation", policyNumber: null, dateOfLoss: '2026-06-24', location: 'Job site, Tacoma, WA', description: 'Technician fell from a scissor lift.', status: 'Coverage referral', assignee: 'Marcus Lee', hasAlert: true }),
  record({ id: 'c-5', claimNumber: 'CA141240', insured: 'Velocity Courier Services LLC', product: 'Commercial Auto', policyNumber: null, dateOfLoss: '2026-06-19', location: 'Downtown, Indianapolis, IN', description: 'Courier van rear-ended at a light.', status: 'Reported', assignee: 'Unassigned' }),
  record({ id: 'c-6', claimNumber: 'CP141233', insured: 'Red Oak Hospitality Group', product: 'Commercial Property', policyNumber: null, dateOfLoss: '2026-06-11', location: 'Hotel, Nashville, TN', description: 'Sprinkler discharge damaged two guest floors.', status: 'In review', assignee: 'Jennifer Collins' }),
  record({ id: 'c-7', claimNumber: 'GL141221', insured: 'Monarch Office Solutions LLC', product: 'General Liability', policyNumber: null, dateOfLoss: '2026-05-30', location: 'Client office, Chicago, IL', description: 'Installer damaged a client conference table.', status: 'Closed', assignee: 'Priya Shah' }),
  record({ id: 'c-8', claimNumber: 'CA141214', insured: 'Redwood Ridge Construction LLC', product: 'Commercial Auto', policyNumber: null, dateOfLoss: '2026-05-21', location: 'SR-99 near Fresno, CA', description: 'Pickup slid into a guardrail in rain.', status: 'Open', assignee: 'Marcus Lee' }),
  record({ id: 'c-9', claimNumber: 'WC141208', insured: 'Tri-State Warehousing Co.', product: "Workers' Compensation", policyNumber: null, dateOfLoss: '2026-05-14', location: 'Warehouse, Gary, IN', description: 'Forklift operator crushed a foot.', status: 'Closed', assignee: 'James Anderson' }),
  record({ id: 'c-10', claimNumber: 'CP141197', insured: 'Willow Creek Senior Living LLC', product: 'Commercial Property', policyNumber: null, dateOfLoss: '2026-05-03', location: 'Residence hall, Ann Arbor, MI', description: 'Roof leak damaged the dining hall ceiling.', status: 'Open', assignee: 'Jennifer Collins' }),
] as ClaimRecord[]).map((claim) => ({ ...claim, policyNumber: claim.policyNumber ?? policyNumberFor(claim.insured) }))

const GENERATED_COUNT = 110

/** Deterministic history so the list shows a realistic volume without a backend. */
const generatedClaims: ClaimRecord[] = Array.from({ length: GENERATED_COUNT }, (_, index) => {
  const policy = policiesListMock[(index * 7) % policiesListMock.length]
  const prefix = claimPrefix(policy.product)
  const losses = LOSSES[prefix === 'BP' ? 'CP' : prefix] ?? LOSSES.GL
  const loss = losses[index % losses.length]
  const dateOfLoss = isoDaysBefore('2026-04-28', index * 2 + (index % 3))
  const status = index < 12 ? STATUS_CYCLE[index % 5] : STATUS_CYCLE[index % STATUS_CYCLE.length]
  return record({
    id: `c-g${index + 1}`,
    claimNumber: `${prefix}${141180 - index * 3}`,
    insured: policy.insuredName,
    product: policy.product,
    policyNumber: policy.policyNumber,
    dateOfLoss,
    location: loss.location,
    description: loss.description,
    status,
    assignee: status === 'Reported' ? 'Unassigned' : ASSIGNEE_CYCLE[index % ASSIGNEE_CYCLE.length],
    hasAlert: index % 9 === 0,
  })
})

// Module scope so the claim drawer, the Claims list, and claim details share one table without a backend.
let claims: ClaimRecord[] = [...draftClaims, ...featuredClaims, ...generatedClaims]
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getClaims() {
  return claims
}

export function useClaims() {
  return useSyncExternalStore(subscribe, getClaims, getClaims)
}

export function useClaim(claimNumber: string | null | undefined) {
  const all = useClaims()
  return claimNumber ? all.find((claim) => claim.claimNumber === claimNumber) ?? null : null
}

export function getClaim(claimNumber: string) {
  return claims.find((claim) => claim.claimNumber === claimNumber) ?? null
}

/** Adds a claim to the top, or updates it in place when the claim number already exists. */
export function upsertClaim(claim: ClaimRecord) {
  const existing = getClaim(claim.claimNumber)
  claims = existing
    ? claims.map((entry) => (entry.claimNumber === claim.claimNumber ? { ...claim, id: existing.id } : entry))
    : [claim, ...claims]
  emit()
}

export function updateClaim(claimNumber: string, update: (claim: ClaimRecord) => ClaimRecord) {
  claims = claims.map((claim) => (claim.claimNumber === claimNumber ? update(claim) : claim))
  emit()
}

export function removeClaim(claimNumber: string) {
  claims = claims.filter((claim) => claim.claimNumber !== claimNumber)
  emit()
}

const CLAIM_NUMBER_BASE = 141288

/** Early claim number: `preferred` when it is still free, else the next unused number under `prefix`. */
export function nextClaimNumber(prefix: string, preferred?: string) {
  const taken = new Set(claims.map((claim) => claim.claimNumber))
  if (preferred && !taken.has(preferred)) return preferred
  let next = CLAIM_NUMBER_BASE
  while (taken.has(`${prefix}${next}`)) next += 1
  return `${prefix}${next}`
}

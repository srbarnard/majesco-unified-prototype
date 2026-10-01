import { customersMock, type CustomerRecord } from '@/pages/customers/data/mockCustomers'
import type { QuoteWizardFormData } from '@/pages/quotes/data/quoteWizardTypes'
import {
  ADD_TASK_RELATED,
  inferRelated,
  type AddTaskPageContext,
  type AddTaskRelated,
} from '@/pages/tasks/data/addTaskDraft'

export type CustomerType = 'Business' | 'Individual'
export const CUSTOMER_TYPES: CustomerType[] = ['Business', 'Individual']

export const CUSTOMER_ROLES = [
  'Insured',
  'Prospect',
  'Payor',
  'Additional insured',
  'Certificate holder',
  'Subsidiary',
] as const
export type CustomerRole = (typeof CUSTOMER_ROLES)[number]

/** DBA, tax ID and NAICS describe a business; an individual customer never carries them. */
export const BUSINESS_ONLY_FIELDS = ['dba', 'taxId', 'naics'] as const

/** A customer's Related is its producer or, for a subsidiary, its parent customer. */
export const CUSTOMER_RELATED_RECORDS: AddTaskRelated[] = (() => {
  const insureds = new Set(ADD_TASK_RELATED.map((record) => record.names[0]))
  const producers = new Set<string>()
  for (const record of ADD_TASK_RELATED) {
    if (record.kind !== 'Policy' && record.kind !== 'Quote') continue
    record.names.slice(1).forEach((name) => {
      if (!insureds.has(name)) producers.add(name)
    })
  }
  return [
    ...[...producers].sort().map((name): AddTaskRelated => ({ kind: 'Producer', ref: name, name, names: [name] })),
    ...ADD_TASK_RELATED.filter((record) => record.kind === 'Customer'),
  ]
})()
/** Related options are bare names — no "Producer ·" / "Customer ·" prefix; the subtitle carries the code. */
export const CUSTOMER_RELATED_BY_NAME = new Map<string, AddTaskRelated>()
for (const record of CUSTOMER_RELATED_RECORDS) {
  if (!CUSTOMER_RELATED_BY_NAME.has(record.name)) CUSTOMER_RELATED_BY_NAME.set(record.name, record)
}
export const CUSTOMER_RELATED_OPTIONS = [...CUSTOMER_RELATED_BY_NAME.keys()]
export const PARENT_CUSTOMER_OPTIONS = CUSTOMER_RELATED_OPTIONS.filter(
  (name) => CUSTOMER_RELATED_BY_NAME.get(name)?.kind === 'Customer',
)
export const PRODUCER_OPTIONS = CUSTOMER_RELATED_OPTIONS.filter(
  (name) => CUSTOMER_RELATED_BY_NAME.get(name)?.kind === 'Producer',
)

/** Mock producer code, stable per name (the demo data carries no real codes). */
function producerCode(name: string) {
  let hash = 0
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return `PRD-${10000 + (hash % 90000)}`
}

/** Second line under a Related option: producer code or customer number. */
export function customerRelatedSubtitle(name: string) {
  const record = CUSTOMER_RELATED_BY_NAME.get(name)
  if (!record) return undefined
  return record.kind === 'Producer' ? producerCode(record.name) : record.ref
}

export function customerRelatedValue(related: AddTaskRelated) {
  return related.name
}

export type CustomerAddress = {
  street: string
  city: string
  state: string
  zip: string
  /** Apt / suite; optional second line. */
  unit?: string
}

export type CustomerNaics = { code: string; title: string }

export type CreateCustomerDraft = {
  type: CustomerType | null
  legalName: string
  dba: string | null
  role: CustomerRole | null
  phone: string | null
  email: string | null
  address: CustomerAddress | null
  taxId: string | null
  naics: CustomerNaics | null
  related: AddTaskRelated | null
  /** Locations beyond the mailing address. */
  locations: CustomerAddress[]
  notes: string
}

export const emptyCreateCustomerDraft: CreateCustomerDraft = {
  type: null,
  legalName: '',
  dba: null,
  role: null,
  phone: null,
  email: null,
  address: null,
  taxId: null,
  naics: null,
  related: null,
  locations: [],
  notes: '',
}

/** Seed chips only pick the type; every other row comes from the user or a document. */
export const CREATE_CUSTOMER_TYPE_SEEDS: CustomerType[] = ['Business', 'Individual']
export const UNDER_EXISTING_CUSTOMER_SEED = 'Under an existing customer'

/** Common commercial classes; keywords map plain-language industries to a code. */
export const NAICS_CATALOG: (CustomerNaics & { keywords: RegExp })[] = [
  { code: '722511', title: 'Full-service restaurants', keywords: /\b(restaurant|bistro|diner|grill)\b/ },
  { code: '312120', title: 'Breweries', keywords: /\bbrew(ery|eries|ing)\b/ },
  { code: '722410', title: 'Drinking places', keywords: /\b(bar|pub|taproom|tavern|brewpub)\b/ },
  { code: '721110', title: 'Hotels and motels', keywords: /\b(hotel|motel|resort|hospitality|inn)\b/ },
  { code: '484121', title: 'General freight trucking, long-distance', keywords: /\b(trucking|freight|logistics|carrier|courier)\b/ },
  { code: '493110', title: 'General warehousing and storage', keywords: /\b(warehous\w*|storage|distribution center)\b/ },
  { code: '236220', title: 'Commercial building construction', keywords: /\b(construction|contractor|builder)s?\b/ },
  { code: '238220', title: 'Plumbing and HVAC contractors', keywords: /\b(plumbing|hvac|mechanical contractor)s?\b/ },
  { code: '238210', title: 'Electrical contractors', keywords: /\belectrical\b/ },
  { code: '531120', title: 'Lessors of nonresidential buildings', keywords: /\b(realty|real estate|property management|properties)\b/ },
  { code: '621210', title: 'Offices of dentists', keywords: /\b(dental|dentist)\b/ },
  { code: '621111', title: 'Offices of physicians', keywords: /\b(medical|clinic|physician)s?\b/ },
  { code: '623312', title: 'Assisted living facilities', keywords: /\b(senior living|assisted living)\b/ },
  { code: '424410', title: 'General line grocery wholesalers', keywords: /\b(food distribut\w*|grocery wholesale)\b/ },
  { code: '332710', title: 'Machine shops', keywords: /\b(machine shop|fabrication|manufactur\w*)\b/ },
  { code: '111150', title: 'Corn farming', keywords: /\b(grain|farm|cooperative|agricultur\w*)\b/ },
  { code: '441310', title: 'Automotive parts stores', keywords: /\bauto parts\b/ },
  { code: '532120', title: 'Truck and trailer leasing', keywords: /\bfleet\b/ },
]

/** Typeahead options are industry titles; the code sits on the subtitle line. */
export const NAICS_OPTIONS = NAICS_CATALOG.map((naics) => naics.title)

export function naicsSubtitle(title: string) {
  return NAICS_CATALOG.find((naics) => naics.title === title)?.code
}

export function naicsLabel(naics: CustomerNaics) {
  return `${naics.code} · ${naics.title}`
}

export function naicsFromLabel(label: string): CustomerNaics | null {
  const entry = NAICS_CATALOG.find((naics) => naics.title === label || naicsLabel(naics) === label)
  return entry ? { code: entry.code, title: entry.title } : null
}

export function formatAddress(address: CustomerAddress) {
  const locality = [address.city, [address.state, address.zip].filter(Boolean).join(' ')].filter(Boolean).join(', ')
  return [address.street, address.unit, locality].filter(Boolean).join(', ')
}

/** SSNs show only the last four; EINs are not sensitive on a business record. */
export function formatTaxId(taxId: string) {
  return /^\d{3}-\d{2}-\d{4}$/.test(taxId) ? `SSN •••-••-${taxId.slice(-4)}` : `EIN ${taxId}`
}

const EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/
const PHONE = /(?:\+?1[\s.-]?)?\(?(\d{3})\)?[\s.-]?(\d{3})[\s.-]?(\d{4})\b/
const EIN = /\b(\d{2})-(\d{7})\b/
const SSN = /\b(\d{3})-(\d{2})-(\d{4})\b/
const TAX_ID_CUE = /\b(?:ein|fein|tax\s*id|tin)\b\s*(?:#|number|no\.?|is|:)?\s*/i
const NAICS_CODE = /\bnaics\b\s*(?:code)?\s*(?:#|is|:)?\s*(\d{6})\b/i
// Case-sensitive on purpose: the trade name ends at the first lowercase word ("dba Coastal Taproom referred by …").
const DBA =
  /\b(?:[Dd]\/[Bb]\/[Aa]|[Dd][Bb][Aa]|DBA|[Dd]oing business as)\.?\s+["“]?([A-Z0-9][\w&'’.-]*(?:\s+(?:[A-Z0-9&][\w&'’.-]*|of|and|the))*)["”]?/
const STREET_SUFFIX =
  '(?:St|Street|Ave|Avenue|Blvd|Boulevard|Rd|Road|Dr|Drive|Ln|Lane|Way|Pkwy|Parkway|Ct|Court|Pl|Place|Hwy|Highway|Plaza|Sq|Square|Ter|Terrace|Cir|Circle)'
const ADDRESS = new RegExp(
  `\\b(\\d{1,6}\\s+(?:[NSEW]\\.?\\s+)?[A-Za-z0-9.'’]+(?:\\s+[A-Za-z0-9.'’]+){0,4}?\\s+${STREET_SUFFIX}\\.?(?:\\s+[NSEW]{1,2}\\b)?(?:,?\\s+(?:Suite|Ste\\.?|Unit|#)\\s*[\\w-]+)?)` +
    `(?:,\\s*([A-Za-z][A-Za-z .'-]*?),?\\s+([A-Z]{2})\\b)?(?:\\s+(\\d{5}(?:-\\d{4})?))?`,
)
const ENTITY_SUFFIX =
  '(?:L\\.?L\\.?C\\.?|Inc\\.?|Incorporated|Corp\\.?|Corporation|Company|Co\\.|LLP|L\\.P\\.|LP|Ltd\\.?|PLLC|P\\.C\\.|Group|Partners|Holdings|Cooperative|Association|Trust)'
const ENTITY_NAME = new RegExp(
  `((?:[A-Z0-9][\\w&'’.-]*,?\\s+(?:(?:of|and|&|the)\\s+)?)+${ENTITY_SUFFIX})(?![\\w])`,
  'g',
)
const LEAD_NOISE = new Set([
  'new', 'add', 'create', 'set', 'up', 'onboard', 'please', 'customer', 'business', 'company', 'a', 'an',
  'for', 'insured', 'prospect', 'payor', 'named', 'called', 'legal', 'name', 'is', 'applicant',
])
const INTRODUCER = /\b(?:referred by|via|through|from|producer|agent|agency|broker)\s*$/i
const PERSON_CUE =
  /\b(?:[Ii]ndividual|[Pp]erson|named|called|[Mm]r\.?|[Mm]rs\.?|[Mm]s\.?|[Dd]r\.?)\s+([A-Z][a-z'’-]+(?:\s+[A-Z]\.)?(?:\s+[A-Z][a-z'’-]+){1,2})\b/
const CUSTOMER_CUE = /\bcustomer\s+(?:named\s+|called\s+)?([A-Z][\w&'’.-]*(?:\s+[A-Z&][\w&'’.-]*){0,5})/

/** Names can't span sentences ("…Application. Applicant Coastal Brewing Co. LLC"); abbreviations aren't breaks. */
const SENTENCE_BREAK = /(?<!\b(?:Co|Inc|Corp|Ltd|St|Mr|Mrs|Ms|Dr|Jr|Sr|[A-Z]))\.\s+/
const ABBREVIATION_END = /\b(?:Co|Inc|Corp|Ltd|Jr|Sr|[A-Z])\.$/

function lastSentence(text: string) {
  const sentence = text.split(SENTENCE_BREAK).pop()!
  return sentence.endsWith('.') && !ABBREVIATION_END.test(sentence) ? sentence.slice(0, -1) : sentence
}

function stripLeadNoise(name: string) {
  const words = lastSentence(name.trim().replace(/,$/, '')).split(/\s+/)
  while (words.length > 1 && LEAD_NOISE.has(words[0]!.toLowerCase())) words.shift()
  return words.join(' ')
}

function removeAll(text: string, fragment: string) {
  return text.split(fragment).join(' ')
}

function inferLegalName(text: string): { name: string; entity: boolean; person: boolean } | null {
  for (const match of text.matchAll(ENTITY_NAME)) {
    const before = text.slice(0, match.index)
    if (INTRODUCER.test(before)) continue
    const name = stripLeadNoise(match[1]!)
    if (name.split(/\s+/).length >= 2) return { name, entity: true, person: false }
  }
  const person = text.match(PERSON_CUE)
  if (person) return { name: person[1]!, entity: false, person: true }
  const customer = text.match(CUSTOMER_CUE)
  if (customer) return { name: stripLeadNoise(customer[1]!), entity: false, person: false }
  return null
}

function inferType(text: string, legal: ReturnType<typeof inferLegalName>, ssn: boolean): CustomerType | null {
  if (/\b(individual|person|personal lines|homeowner)\b/i.test(text) || ssn || legal?.person) return 'Individual'
  if (/\b(business|commercial|company|organization|corporation)\b/i.test(text) || legal?.entity) return 'Business'
  return null
}

function inferRole(text: string): CustomerRole | null {
  if (/\bprospect\b/i.test(text)) return 'Prospect'
  if (/\bcertificate holder\b/i.test(text)) return 'Certificate holder'
  if (/\badditional insured\b/i.test(text)) return 'Additional insured'
  if (/\b(payor|payer|bill[- ]to|billing party)\b/i.test(text)) return 'Payor'
  if (/\b(named )?insured\b/i.test(text)) return 'Insured'
  return null
}

function inferTaxId(text: string): { taxId: string; ssn: boolean } | null {
  const ssn = text.match(SSN)
  if (ssn) return { taxId: `${ssn[1]}-${ssn[2]}-${ssn[3]}`, ssn: true }
  const cue = TAX_ID_CUE.exec(text)
  const scope = cue ? text.slice(cue.index + cue[0].length, cue.index + cue[0].length + 14) : text
  const ein = scope.match(cue ? /^(\d{2})-?(\d{7})\b/ : EIN)
  return ein ? { taxId: `${ein[1]}-${ein[2]}`, ssn: false } : null
}

/** An explicit code wins; otherwise the customer's own names, then the rest of the sentence (minus the linked record). */
function inferNaics(text: string, names: string, otherText: string): CustomerNaics | null {
  const code = text.match(NAICS_CODE)?.[1]
  if (code) {
    const known = NAICS_CATALOG.find((naics) => naics.code === code)
    return { code, title: known?.title ?? 'NAICS code' }
  }
  for (const haystack of [names.toLowerCase(), otherText.toLowerCase()]) {
    const match = haystack && NAICS_CATALOG.find((naics) => naics.keywords.test(haystack))
    if (match) return { code: match.code, title: match.title }
  }
  return null
}

function inferAddress(text: string): CustomerAddress | null {
  const match = text.match(ADDRESS)
  if (!match) return null
  return {
    street: match[1]!.trim(),
    city: match[2]?.trim() ?? '',
    state: match[3] ?? '',
    zip: match[4] ?? '',
  }
}

/**
 * "Referred by Harborview Agency" names the producer on some policy, not that policy — a new
 * customer links to the producer itself.
 */
function asProducerWhenIntroducer(related: AddTaskRelated | null, text: string): AddTaskRelated | null {
  if (!related) return null
  const at = text.toLowerCase().indexOf(related.name.toLowerCase())
  const introduced = at >= 0 && INTRODUCER.test(text.slice(0, at))
  if (!introduced && related.names.indexOf(related.name) <= 0) return related
  return { kind: 'Producer', ref: related.name, name: related.name, names: [related.name] }
}

function formatPhone(match: RegExpMatchArray) {
  return `(${match[1]}) ${match[2]}-${match[3]}`
}

export function inferCustomerFromText(
  text: string,
  context?: AddTaskPageContext,
): Partial<CreateCustomerDraft> {
  const trimmed = text.trim()
  if (!trimmed) return {}

  const email = trimmed.match(EMAIL)?.[0] ?? null
  const dbaMatch = trimmed.match(DBA)
  const dba = dbaMatch ? lastSentence(dbaMatch[1]!.trim().split(SENTENCE_BREAK)[0]!) : null
  // Contact details and the DBA are pulled out first so digits and trade names don't leak into other fields.
  let rest = trimmed
  if (email) rest = rest.replace(email, ' ')
  if (dbaMatch && dba) rest = rest.replace(dbaMatch[0].slice(0, dbaMatch[0].indexOf(dba) + dba.length), ' ')
  const tax = inferTaxId(rest)
  if (tax) rest = rest.replace(tax.ssn ? SSN : new RegExp(tax.taxId.replace('-', '-?')), ' ')
  const naicsCode = rest.match(NAICS_CODE)
  if (naicsCode) rest = rest.replace(naicsCode[0], ' ')
  const address = inferAddress(rest)
  if (address) rest = rest.replace(ADDRESS, ' ')
  const phoneMatch = rest.match(PHONE)
  const parent = inferParentCustomer(rest)
  if (parent) rest = removeAll(rest, parent.name)

  const legal = inferLegalName(rest)
  const relatedText = [legal?.name, dba].reduce<string>((acc, name) => (name ? removeAll(acc, name) : acc), rest)
  const related =
    parent ??
    asCustomerRelated(
      asProducerWhenIntroducer(
        inferRelated(relatedText, context ? { kind: context.kind, record: null } : undefined),
        relatedText,
      ),
    )

  const inferred: Partial<CreateCustomerDraft> = {}
  const type = inferType(trimmed, legal, tax?.ssn ?? false)
  if (type) inferred.type = type
  if (legal) inferred.legalName = legal.name
  if (dba) inferred.dba = dba
  const role = parent ? 'Subsidiary' : inferRole(trimmed)
  if (role) inferred.role = role
  if (phoneMatch) inferred.phone = formatPhone(phoneMatch)
  if (email) inferred.email = email
  if (address) inferred.address = address
  if (tax) inferred.taxId = tax.taxId
  const otherText = (related?.names ?? []).reduce(removeAll, relatedText)
  const naics = inferNaics(trimmed, [legal?.name, dba].filter(Boolean).join(' '), otherText)
  if (naics) inferred.naics = naics
  if (related) inferred.related = related
  return inferred.type === 'Individual' ? withoutBusinessFields(inferred) : inferred
}

function withoutBusinessFields<T extends Partial<CreateCustomerDraft>>(draft: T): T {
  const next: Partial<CreateCustomerDraft> = { ...draft }
  for (const field of BUSINESS_ONLY_FIELDS) {
    if (field in next) next[field] = null
  }
  return next as T
}

const PARENT_CUE = /\b(?:subsidiary of|division of|owned by|under|parent(?:\s+(?:company|customer))?(?:\s+is)?:?)\s+/gi

/** "Subsidiary of Midwest Grain Cooperative" links the existing customer as the parent. */
function inferParentCustomer(text: string): AddTaskRelated | null {
  for (const cue of text.matchAll(PARENT_CUE)) {
    const after = text.slice(cue.index + cue[0].length).toLowerCase()
    const parent = CUSTOMER_RELATED_RECORDS.find(
      (record) => record.kind === 'Customer' && after.startsWith(record.name.toLowerCase()),
    )
    if (parent) return parent
  }
  return null
}

/** Policies, quotes and submissions aren't a customer's Related — only producers and parent customers are. */
function asCustomerRelated(related: AddTaskRelated | null): AddTaskRelated | null {
  if (!related) return null
  if (related.kind === 'Producer' || related.kind === 'Sub-producer' || related.kind === 'Customer') return related
  return null
}

export function mergeCustomerDraft(
  base: CreateCustomerDraft,
  inferred: Partial<CreateCustomerDraft>,
): CreateCustomerDraft {
  return normalizeCustomerDraft({
    ...base,
    type: inferred.type ?? base.type,
    legalName: inferred.legalName || base.legalName,
    dba: inferred.dba ?? base.dba,
    role: inferred.role ?? base.role,
    phone: inferred.phone ?? base.phone,
    email: inferred.email ?? base.email,
    address: inferred.address ?? base.address,
    taxId: inferred.taxId ?? base.taxId,
    naics: inferred.naics ?? base.naics,
    related: inferred.related ?? base.related,
  })
}

export function normalizeCustomerDraft(draft: CreateCustomerDraft): CreateCustomerDraft {
  return draft.type === 'Individual' ? withoutBusinessFields(draft) : draft
}

/** Fields that should be captured for this customer type, in card order. */
export function customerFieldsFor(type: CustomerType | null) {
  const fields = ['legalName', 'phone', 'email', 'address', 'taxId', 'naics', 'related'] as const
  return fields.filter((field) => type !== 'Individual' || !(BUSINESS_ONLY_FIELDS as readonly string[]).includes(field))
}

/** Parse free-typed field edits the same way the composer does (e.g. "415 555 0142"). */
export function parseCustomerField<K extends 'phone' | 'email' | 'address' | 'taxId'>(
  field: K,
  value: string,
): CreateCustomerDraft[K] | null {
  switch (field) {
    case 'phone': {
      const match = value.match(PHONE)
      return (match ? formatPhone(match) : value.trim()) as CreateCustomerDraft[K]
    }
    case 'email':
      return (value.match(EMAIL)?.[0] ?? value.trim()) as CreateCustomerDraft[K]
    case 'address':
      return (inferAddress(value) ?? { street: value.trim(), city: '', state: '', zip: '' }) as CreateCustomerDraft[K]
    case 'taxId': {
      const tax = inferTaxId(value) ?? inferTaxId(`EIN ${value}`)
      return (tax?.taxId ?? value.trim()) as CreateCustomerDraft[K]
    }
  }
  return null
}

/** Existing customer with the same legal name — surfaced before a duplicate is created. */
export function findDuplicateCustomer(legalName: string, created: CustomerRecord[] = []) {
  const normalize = (name: string) =>
    name.toLowerCase().replace(/[.,'’]/g, '').replace(/\b(llc|inc|corp|co|company|corporation|ltd)\b/g, '').trim()
  const target = normalize(legalName)
  if (!target) return null
  return [...created, ...customersMock].find((customer) => normalize(customer.name) === target) ?? null
}

function nextCustomerNumber(created: CustomerRecord[]) {
  const numbers = [...created, ...customersMock].map((customer) => Number(customer.customerNumber.replace(/\D/g, '')))
  return `CUS-${Math.max(100000, ...numbers) + 1}`
}

/** Insured details for the New quote wizard, handed over by "Start quote". */
export function buildQuotePrefillFromDraft(
  draft: CreateCustomerDraft,
  customerNumber: string,
): Partial<QuoteWizardFormData> {
  const address = draft.address ? formatAddress(draft.address) : ''
  return {
    name: draft.legalName,
    email: draft.email ?? '',
    address,
    industryNaics: draft.naics ? `${draft.naics.code} - ${draft.naics.title}` : '',
    phone: draft.phone ?? '',
    taxId: draft.taxId ?? '',
    customerNumber,
    showAdditionalDetails: true,
    primaryLocation: address,
    additionalLocations: draft.locations.map(formatAddress),
  }
}

export function buildCustomerFromDraft(
  draft: CreateCustomerDraft,
  created: CustomerRecord[],
  now = new Date(),
): CustomerRecord {
  return {
    id: `cust-new-${now.getTime()}`,
    customerNumber: nextCustomerNumber(created),
    name: draft.legalName,
    email: draft.email ?? '',
    attention: draft.role === 'Prospect' ? 'New prospect' : 'New customer',
    insuredCount: 0,
    customerSince: [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('-'),
    activePolicies: 0,
    openQuotes: 0,
    openClaims: 0,
    billingStatus: 'Current',
    twp: 0,
    contactName: draft.type === 'Individual' ? draft.legalName : '—',
    contactPhone: draft.phone ?? '',
    address: draft.address ? [draft.address.street, draft.address.unit].filter(Boolean).join(', ') : '',
    city: draft.address?.city ?? '',
    state: draft.address?.state ?? '',
    zip: draft.address?.zip ?? '',
  }
}

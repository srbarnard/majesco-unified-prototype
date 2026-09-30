import { customersMock, type CustomerRecord } from '@/pages/customers/data/mockCustomers'
import {
  inferRelated,
  type AddTaskPageContext,
  type AddTaskRelated,
} from '@/pages/tasks/data/addTaskDraft'

export type CustomerType = 'Business' | 'Individual'
export const CUSTOMER_TYPES: CustomerType[] = ['Business', 'Individual']

export const CUSTOMER_ROLES = ['Insured', 'Prospect', 'Payor', 'Additional insured', 'Certificate holder'] as const
export type CustomerRole = (typeof CUSTOMER_ROLES)[number]

export type CustomerAddress = { street: string; city: string; state: string; zip: string }

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
  notes: '',
}

export const CREATE_CUSTOMER_SEEDS: { label: string; prefill: string }[] = [
  {
    label: 'Business insured',
    prefill:
      'New business customer Coastal Brewing Co. LLC dba Coastal Taproom, insured, 415-555-0142, ops@coastalbrewing.com, 88 Harbor Way, San Francisco, CA 94107, EIN 94-3345120, referred by Harborview Agency',
  },
  {
    label: 'Individual prospect',
    prefill: 'Individual prospect named Priya Raman, priya.raman@example.com, (312) 555-0199',
  },
]

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

export const NAICS_OPTIONS = NAICS_CATALOG.map(naicsLabel)

export function naicsLabel(naics: CustomerNaics) {
  return `${naics.code} · ${naics.title}`
}

export function naicsFromLabel(label: string): CustomerNaics | null {
  const entry = NAICS_CATALOG.find((naics) => naicsLabel(naics) === label)
  return entry ? { code: entry.code, title: entry.title } : null
}

export function formatAddress(address: CustomerAddress) {
  const locality = [address.city, [address.state, address.zip].filter(Boolean).join(' ')].filter(Boolean).join(', ')
  return [address.street, locality].filter(Boolean).join(', ')
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
  'for', 'insured', 'prospect', 'payor', 'named', 'called', 'legal', 'name', 'is',
])
const INTRODUCER = /\b(?:referred by|via|through|from|producer|agent|agency|broker)\s*$/i
const PERSON_CUE =
  /\b(?:individual|person|named|called|mr\.?|mrs\.?|ms\.?|dr\.?)\s+([A-Z][a-z'’-]+(?:\s+[A-Z]\.)?(?:\s+[A-Z][a-z'’-]+){1,2})\b/
const CUSTOMER_CUE = /\bcustomer\s+(?:named\s+|called\s+)?([A-Z][\w&'’.-]*(?:\s+[A-Z&][\w&'’.-]*){0,5})/

function stripLeadNoise(name: string) {
  const words = name.trim().replace(/,$/, '').split(/\s+/)
  while (words.length > 1 && LEAD_NOISE.has(words[0]!.toLowerCase())) words.shift()
  return words.join(' ')
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
  const dba = trimmed.match(DBA)?.[1]?.trim() ?? null
  // Contact details and the DBA are pulled out first so digits and trade names don't leak into other fields.
  let rest = trimmed
  if (email) rest = rest.replace(email, ' ')
  if (dba) rest = rest.replace(DBA, ' ')
  const tax = inferTaxId(rest)
  if (tax) rest = rest.replace(tax.ssn ? SSN : new RegExp(tax.taxId.replace('-', '-?')), ' ')
  const naicsCode = rest.match(NAICS_CODE)
  if (naicsCode) rest = rest.replace(naicsCode[0], ' ')
  const address = inferAddress(rest)
  if (address) rest = rest.replace(ADDRESS, ' ')
  const phoneMatch = rest.match(PHONE)

  const legal = inferLegalName(rest)
  const relatedText = [legal?.name, dba].reduce<string>((acc, name) => (name ? acc.replace(name, ' ') : acc), rest)
  const related = asProducerWhenIntroducer(
    inferRelated(relatedText, context ? { kind: context.kind, record: null } : undefined),
    relatedText,
  )

  const inferred: Partial<CreateCustomerDraft> = {}
  const type = inferType(trimmed, legal, tax?.ssn ?? false)
  if (type) inferred.type = type
  if (legal) inferred.legalName = legal.name
  if (dba) inferred.dba = dba
  const role = inferRole(trimmed)
  if (role) inferred.role = role
  if (phoneMatch) inferred.phone = formatPhone(phoneMatch)
  if (email) inferred.email = email
  if (address) inferred.address = address
  if (tax) inferred.taxId = tax.taxId
  const otherText = (related?.names ?? []).reduce((acc, name) => acc.replace(name, ' '), relatedText)
  const naics = inferNaics(trimmed, [legal?.name, dba].filter(Boolean).join(' '), otherText)
  if (naics) inferred.naics = naics
  if (related) inferred.related = related
  return inferred
}

export function mergeCustomerDraft(
  base: CreateCustomerDraft,
  inferred: Partial<CreateCustomerDraft>,
): CreateCustomerDraft {
  return {
    ...base,
    type: inferred.type ?? base.type,
    legalName: inferred.legalName || base.legalName,
    dba: inferred.dba ?? base.dba,
    role: inferred.role ?? base.role,
    phone: inferred.phone ?? base.phone,
    email: inferred.email ?? base.email,
    address: inferred.address ?? base.address,
    taxId: inferred.taxId ?? base.taxId,
    // A keyword guess never replaces a code the user picked or typed.
    naics: base.naics ?? inferred.naics ?? null,
    related: inferred.related ?? base.related,
  }
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
    address: draft.address?.street ?? '',
    city: draft.address?.city ?? '',
    state: draft.address?.state ?? '',
    zip: draft.address?.zip ?? '',
  }
}

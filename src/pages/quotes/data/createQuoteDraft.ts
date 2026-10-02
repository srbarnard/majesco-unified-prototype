import {
  inferCustomerFromText,
  parseCustomerField,
  type CustomerAddress,
  type CustomerNaics,
  type CustomerType,
} from '@/pages/customers/data/createCustomerDraft'

export const QUOTE_COVERAGES = [
  'General Liability',
  "Workers' Compensation",
  'Commercial Auto',
  'Inland Marine',
  'Commercial Property',
] as const

export type QuoteCoverage = (typeof QUOTE_COVERAGES)[number]

export const QUOTE_LOCATION_TYPES = [
  'Primary',
  'Office',
  'Warehouse',
  'Retail',
  'Manufacturing',
  'Restaurant',
  'Other',
] as const

export type QuoteLocationType = (typeof QUOTE_LOCATION_TYPES)[number]

export type QuoteLocation = {
  id: string
  address: CustomerAddress
  type: QuoteLocationType | null
}

export type CreateQuoteDraft = {
  type: CustomerType | null
  name: string
  email: string | null
  address: CustomerAddress | null
  naics: CustomerNaics | null
  revenue: number | null
  employees: number | null
  payroll: number | null
  locations: QuoteLocation[]
  vehicleCount: number
  /** The description mentioned vehicles; Commercial Auto starts checked. */
  mentionsVehicles: boolean
  /** Explicit check / uncheck by the user; wins over inferred defaults. */
  coverageChoices: Partial<Record<QuoteCoverage, boolean>>
}

export const emptyCreateQuoteDraft: CreateQuoteDraft = {
  type: null,
  name: '',
  email: null,
  address: null,
  naics: null,
  revenue: null,
  employees: null,
  payroll: null,
  locations: [],
  vehicleCount: 0,
  mentionsVehicles: false,
  coverageChoices: {},
}

let locationCounter = 0
export function quoteLocationId() {
  locationCounter += 1
  return `loc-${Date.now()}-${locationCounter}`
}

export const PRIMARY_LOCATION_ID = 'loc-primary'

/** The insured's Address is the first location until the user edits that row. */
export function withPrimaryLocation(draft: CreateQuoteDraft): CreateQuoteDraft {
  if (!draft.address || draft.locations.some((location) => location.id === PRIMARY_LOCATION_ID)) return draft
  return {
    ...draft,
    locations: [{ id: PRIMARY_LOCATION_ID, address: draft.address, type: 'Primary' }, ...draft.locations],
  }
}

const SCHEDULE_ROWS: [string, string, string, string, QuoteLocationType][] = [
  ['88 Harbor Way', 'San Francisco', 'CA', '94107', 'Office'],
  ['2100 Mission St', 'San Francisco', 'CA', '94110', 'Retail'],
  ['710 Bryant St', 'San Francisco', 'CA', '94107', 'Warehouse'],
  ['1550 Bryant St', 'San Francisco', 'CA', '94103', 'Manufacturing'],
  ['3401 Broadway', 'Oakland', 'CA', '94611', 'Retail'],
  ['925 Embarcadero', 'Oakland', 'CA', '94606', 'Warehouse'],
  ['40 Washington St', 'Santa Clara', 'CA', '95050', 'Office'],
  ['1880 El Camino Real', 'Palo Alto', 'CA', '94306', 'Restaurant'],
  ['250 Main St', 'Redwood City', 'CA', '94063', 'Retail'],
  ['6200 Stoneridge Mall Rd', 'Pleasanton', 'CA', '94588', 'Office'],
  ['1 Ferry Bldg', 'San Francisco', 'CA', '94111', 'Restaurant'],
  ['4500 Great America Pkwy', 'Santa Clara', 'CA', '95054', 'Warehouse'],
  ['77 Dock Rd', '', '', '', 'Warehouse'],
  ['Bayshore Yard', '', '', '', 'Other'],
]

export function isAddressComplete(address: CustomerAddress) {
  return [address.street, address.city, address.state, address.zip].every((part) => part.trim() !== '')
}

/** Spreadsheets can't be parsed client-side; a dropped schedule stands in with a representative SOV, incomplete rows included. */
export function scheduleLocations(): QuoteLocation[] {
  return SCHEDULE_ROWS.map(([street, city, state, zip, type]) => ({
    id: quoteLocationId(),
    address: { street, city, state, zip },
    type,
  }))
}

export type QuoteFileKind = 'locations' | 'payroll' | 'vehicles' | 'document'

/** Payroll and vehicle names win over the generic spreadsheet match. */
export function quoteFileKind(fileName: string): QuoteFileKind {
  if (/payroll|wage|941|class[\s_-]?code/i.test(fileName)) return 'payroll'
  if (/vehicle|fleet|auto|vin|driver/i.test(fileName)) return 'vehicles'
  if (/schedule|sov|location|propert|\.(xlsx?|csv)$/i.test(fileName)) return 'locations'
  return 'document'
}

/** Representative values for a dropped payroll file; only fills holes. */
export function applyPayrollSchedule(draft: CreateQuoteDraft): CreateQuoteDraft {
  return {
    ...draft,
    payroll: draft.payroll ?? 1_850_000,
    employees: draft.employees ?? 42,
  }
}

/** Representative values for a dropped vehicle schedule; only fills holes. */
export function applyVehicleSchedule(draft: CreateQuoteDraft): CreateQuoteDraft {
  return {
    ...draft,
    vehicleCount: draft.vehicleCount || 8,
    mentionsVehicles: true,
  }
}

const MONEY = '\\$?\\s*(\\d[\\d,]*(?:\\.\\d+)?)\\s*(m|mm|million|k|thousand|b|billion)?\\b'
const REVENUE = new RegExp(
  `(?:${MONEY}\\s*(?:in\\s+)?(?:annual\\s+|yearly\\s+)?(?:revenue|sales|receipts))|(?:(?:revenue|sales|receipts)\\s*(?:of|is|:|around|about)?\\s*${MONEY})`,
  'i',
)
const PAYROLL = new RegExp(`(?:${MONEY}\\s*(?:in\\s+|of\\s+)?payroll)|(?:payroll\\s*(?:of|is|:|around|about)?\\s*${MONEY})`, 'i')
const EMPLOYEES = /\b(\d[\d,]*)\s+(?:full[- ]time\s+)?(?:employees|staff|workers|people|ftes?|headcount)\b/i
const VEHICLE_COUNT = /\b(\d[\d,]*)\s+(?:vehicles?|trucks?|vans?|cars?|autos?|tractors?|trailers?|power units?)\b/i
const VEHICLE_MENTION = /\b(vehicles?|trucks?|vans?|fleet|cars?|autos?|drivers?|tractors?|trailers?|delivery)\b/i

function moneyValue(amount: string | undefined, unit: string | undefined) {
  if (!amount) return null
  const value = Number(amount.replace(/,/g, ''))
  if (!Number.isFinite(value)) return null
  const scale = /^(m|mm|million)$/i.test(unit ?? '')
    ? 1_000_000
    : /^(k|thousand)$/i.test(unit ?? '')
      ? 1_000
      : /^(b|billion)$/i.test(unit ?? '')
        ? 1_000_000_000
        : 1
  return Math.round(value * scale)
}

function moneyFrom(match: RegExpMatchArray | null) {
  if (!match) return null
  return moneyValue(match[1] ?? match[3], match[2] ?? match[4])
}

/** "$4.2M", "850k", "1,200,000" → whole dollars. */
export function parseMoney(text: string) {
  const match = text.trim().match(new RegExp(`^${MONEY}$`, 'i'))
  return match ? moneyValue(match[1], match[2]) : null
}

export function parseCount(text: string) {
  const digits = text.replace(/[^\d]/g, '')
  return digits ? Number(digits) : null
}

export function formatMoney(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`
  return `$${value}`
}

export function inferQuoteFromText(text: string): Partial<CreateQuoteDraft> {
  const trimmed = text.trim()
  if (!trimmed) return {}
  const customer = inferCustomerFromText(trimmed)
  const inferred: Partial<CreateQuoteDraft> = {}
  if (customer.type) inferred.type = customer.type
  if (customer.legalName) inferred.name = customer.legalName
  if (customer.email) inferred.email = customer.email
  if (customer.address) inferred.address = customer.address
  if (customer.naics) inferred.naics = customer.naics
  const revenue = moneyFrom(trimmed.match(REVENUE))
  if (revenue) inferred.revenue = revenue
  const payroll = moneyFrom(trimmed.match(PAYROLL))
  if (payroll) inferred.payroll = payroll
  const employees = trimmed.match(EMPLOYEES)?.[1]
  if (employees) inferred.employees = Number(employees.replace(/,/g, ''))
  const vehicles = trimmed.match(VEHICLE_COUNT)?.[1]
  if (vehicles) inferred.vehicleCount = Number(vehicles.replace(/,/g, ''))
  if (VEHICLE_MENTION.test(trimmed)) inferred.mentionsVehicles = true
  return inferred
}

export function mergeQuoteDraft(base: CreateQuoteDraft, inferred: Partial<CreateQuoteDraft>): CreateQuoteDraft {
  return {
    ...base,
    type: inferred.type ?? base.type,
    name: inferred.name || base.name,
    email: inferred.email ?? base.email,
    address: inferred.address ?? base.address,
    naics: inferred.naics ?? base.naics,
    revenue: inferred.revenue ?? base.revenue,
    employees: inferred.employees ?? base.employees,
    payroll: inferred.payroll ?? base.payroll,
    vehicleCount: inferred.vehicleCount || base.vehicleCount,
    mentionsVehicles: base.mentionsVehicles || Boolean(inferred.mentionsVehicles),
    locations: inferred.locations ?? base.locations,
  }
}

export function coverageChecked(draft: CreateQuoteDraft, coverage: QuoteCoverage) {
  const choice = draft.coverageChoices[coverage]
  if (choice != null) return choice
  return coverage === 'Commercial Auto' && (draft.mentionsVehicles || draft.vehicleCount > 0)
}

export function parseQuoteAddress(text: string) {
  return text.trim() ? parseCustomerField('address', text) : null
}

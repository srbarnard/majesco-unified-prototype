import type { QuoteWizardFormData } from '../data/quoteWizardTypes'
import { markAiFilled } from '../data/quoteWizardDefaults'

type ParseResult = Partial<QuoteWizardFormData> & { aiFilledFields?: string[] }

const LANDSCAPING_PATTERN = /landscap/i
const PRINCETON_PATTERN = /princeton/i
const NJ_PATTERN = /\b(nj|new jersey)\b/i
const EMAIL_PATTERN = /[\w.+-]+@[\w.-]+\.\w+/

function titleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function extractEmail(text: string) {
  return text.match(EMAIL_PATTERN)?.[0] ?? ''
}

function extractEmployeeCount(text: string) {
  const match = text.match(/(\d+)\s*(employees?|workers?|staff)/i)
  return match?.[1] ?? ''
}

function extractRevenue(text: string) {
  const millionMatch = text.match(/\$?\s*([\d,.]+)\s*m(illion)?/i)
  if (millionMatch) {
    const raw = millionMatch[1].replace(/,/g, '')
    const value = Number(raw)
    if (Number.isFinite(value)) return String(value * 1_000_000)
  }

  const plainMatch = text.match(/revenue[^$0-9]*\$?\s*([\d,]+)/i)
  if (plainMatch) return plainMatch[1].replace(/,/g, '')

  return ''
}

function extractPayroll(text: string) {
  const match = text.match(/payroll[^$0-9]*\$?\s*([\d,]+)/i)
  return match?.[1]?.replace(/,/g, '') ?? ''
}

function extractVehicleCount(text: string) {
  const match = text.match(/(\d+)\s*(vehicles?|trucks?|autos?)/i)
  return match?.[1] ?? ''
}

function mentionsVehicles(text: string) {
  return /\b(vehicle|vehicles|truck|trucks|auto|fleet)\b/i.test(text)
}

function mentionsEquipment(text: string) {
  return /\b(equipment|tools|machinery|mower|mowers)\b/i.test(text)
}

export function parseInsuredDetailsInput(text: string, current: QuoteWizardFormData): ParseResult {
  const normalized = text.trim()
  if (!normalized) return {}

  const result: ParseResult = {}
  const filled: string[] = []

  const email = extractEmail(normalized)
  if (email) {
    result.email = email
    filled.push('email')
  }

  if (LANDSCAPING_PATTERN.test(normalized)) {
    result.name = 'Greenleaf Landscaping'
    result.industryNaics = '561730 - Landscaping Services'
    filled.push('name', 'industryNaics')
  } else {
    const withoutEmail = normalized.replace(EMAIL_PATTERN, '').trim()
    const words = withoutEmail.split(/\s+(?:in|at|located)\s+/i)
    if (words[0] && !result.name) {
      result.name = titleCase(words[0].replace(/[.,]/g, ''))
      filled.push('name')
    }
  }

  if (PRINCETON_PATTERN.test(normalized) || NJ_PATTERN.test(normalized)) {
    const hasStreet = /\d+\s+\w+\s+(st|street|ave|avenue|rd|road)/i.test(normalized)
    result.address = hasStreet
      ? normalized.match(/\d+\s+[\w\s]+(?:,\s*)?princeton[^.]*(?:nj|new jersey)?/i)?.[0] ?? '123 Main St, Princeton, NJ 08540'
      : 'Princeton, NJ'
    filled.push('address')
  }

  if (result.address && !result.primaryLocation) {
    result.primaryLocation = result.address.includes('123 Main')
      ? result.address
      : '123 Main St, Princeton, NJ 08540'
    filled.push('primaryLocation')
  }

  return {
    ...result,
    aiFilledFields: markAiFilled(current.aiFilledFields, ...filled),
  }
}

export function parseRiskProfileInput(text: string, current: QuoteWizardFormData): ParseResult {
  const normalized = text.trim()
  if (!normalized) return {}

  const result: ParseResult = {}
  const filled: string[] = []

  const employees = extractEmployeeCount(normalized)
  if (employees) {
    result.employeeCount = employees
    filled.push('employeeCount')
  }

  const revenue = extractRevenue(normalized)
  if (revenue) {
    result.annualRevenue = revenue
    filled.push('annualRevenue')
  }

  const payroll = extractPayroll(normalized)
  if (payroll) {
    result.payroll = payroll
    filled.push('payroll')
  }

  const exposures = [...current.operationalExposures]
  if (mentionsVehicles(normalized) && !exposures.includes('vehicles')) {
    exposures.push('vehicles')
    filled.push('operationalExposures')
  }
  if (mentionsEquipment(normalized) && !exposures.includes('equipment')) {
    exposures.push('equipment')
    filled.push('operationalExposures')
  }
  if (filled.includes('operationalExposures')) {
    result.operationalExposures = exposures
  }

  const vehicleCount = extractVehicleCount(normalized)
  if (vehicleCount) {
    result.vehicleCount = vehicleCount
    filled.push('vehicleCount')
  }

  if (!result.annualRevenue && /\$?\s*850,?000/i.test(normalized)) {
    result.annualRevenue = '850000'
    filled.push('annualRevenue')
  }

  return {
    ...result,
    aiFilledFields: markAiFilled(current.aiFilledFields, ...filled),
  }
}

export function parseExposuresInput(text: string, current: QuoteWizardFormData): ParseResult {
  const normalized = text.trim()
  if (!normalized) return {}

  const result: ParseResult = {}
  const filled: string[] = []

  const addressMatch = normalized.match(/\d+\s+[\w\s.]+(?:,\s*)?[\w\s]+(?:\d{5})?/i)
  if (addressMatch) {
    result.primaryLocation = addressMatch[0]
    filled.push('primaryLocation')
  }

  const revenue = extractRevenue(normalized)
  if (revenue) {
    result.annualRevenue = revenue
    filled.push('annualRevenue')
  }

  const payroll = extractPayroll(normalized)
  if (payroll) {
    result.payroll = payroll
    filled.push('payroll')
  }

  if (!result.primaryLocation && PRINCETON_PATTERN.test(normalized)) {
    result.primaryLocation = current.primaryLocation || '123 Main St, Princeton, NJ 08540'
    filled.push('primaryLocation')
  }

  return {
    ...result,
    aiFilledFields: markAiFilled(current.aiFilledFields, ...filled),
  }
}

export function parseWizardNaturalLanguage(
  stepIndex: number,
  text: string,
  current: QuoteWizardFormData,
): ParseResult {
  switch (stepIndex) {
    case 0:
      return parseInsuredDetailsInput(text, current)
    case 1:
      return parseRiskProfileInput(text, current)
    case 2:
      return parseExposuresInput(text, current)
    default:
      return {}
  }
}

export function applyWizardParseResult(
  current: QuoteWizardFormData,
  parsed: ParseResult,
): QuoteWizardFormData {
  const { aiFilledFields, ...fields } = parsed
  return {
    ...current,
    ...fields,
    aiFilledFields: aiFilledFields ?? current.aiFilledFields,
  }
}

export function formatCurrency(value: string) {
  const numeric = Number(value.replace(/[^\d.]/g, ''))
  if (!Number.isFinite(numeric) || numeric === 0) return ''
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(numeric)
}

export function estimatePremium(form: QuoteWizardFormData) {
  const revenue = Number(form.annualRevenue.replace(/[^\d.]/g, '')) || 0
  const payroll = Number(form.payroll.replace(/[^\d.]/g, '')) || 0
  const coverageCount = form.selectedCoverages.length || 1
  const base = revenue * 0.004 + payroll * 0.012 + coverageCount * 850
  return Math.round(Math.max(base, 2400))
}

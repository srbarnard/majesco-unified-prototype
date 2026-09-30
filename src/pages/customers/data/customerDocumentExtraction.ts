import {
  CUSTOMER_TYPES,
  inferCustomerFromText,
  parseCustomerField,
  type CreateCustomerDraft,
} from '@/pages/customers/data/createCustomerDraft'
import type { AddTaskPageContext } from '@/pages/tasks/data/addTaskDraft'

export type CustomerDocumentKind = 'acord125' | 'brokerEmail' | 'vcard' | 'document'

export type CustomerDocumentExtraction = {
  fileName: string
  kind: CustomerDocumentKind
  inferred: Partial<CreateCustomerDraft>
}

/**
 * Binary formats (PDF, Word, Outlook .msg, images) can't be read client-side, so they stand in with
 * representative extracted text. Each sample deliberately omits some fields so those rows stay needed.
 */
const SIMULATED_TEXT: Record<Exclude<CustomerDocumentKind, 'vcard'>, string> = {
  acord125:
    'ACORD 125 Commercial Insurance Application. Applicant Coastal Brewing Co. LLC DBA Coastal Taproom. ' +
    'Mailing address 88 Harbor Way, San Francisco, CA 94107. Business phone 415-555-0142. FEIN 94-3345120. ' +
    'NAICS 312120. Producer Harborview Agency.',
  brokerEmail:
    'Subject: New account — Maple Street Bistro LLC. Hi team, please set up Maple Street Bistro LLC as a prospect. ' +
    'Owner contact owner@maplestreetbistro.com, (646) 555-0187. Sent via Harborview Agency.',
  document:
    'Declarations page. Named insured Bayside Dental Group PLLC, 410 Shoreline Dr, Tampa, FL 33606. Dental practice.',
}

export function classifyCustomerDocument(fileName: string): CustomerDocumentKind {
  const lower = fileName.toLowerCase()
  if (lower.endsWith('.vcf')) return 'vcard'
  if (/acord|\b125\b|application/.test(lower)) return 'acord125'
  if (/\.(eml|msg)$/.test(lower) || /email|broker|fwd|re[_ -]/.test(lower)) return 'brokerEmail'
  return 'document'
}

/** Short type shown on a file chip: ACORD / vCard / Email, else the file extension (PDF, DOCX…). */
export function customerDocumentTypeLabel(fileName: string): string | null {
  if (classifyCustomerDocument(fileName) === 'acord125') return 'ACORD'
  if (/\.vcf$/i.test(fileName)) return 'vCard'
  if (/\.(eml|msg)$/i.test(fileName)) return 'Email'
  return fileName.match(/\.([a-z0-9]+)$/i)?.[1]?.toUpperCase() ?? null
}

const readsAsText = (fileName: string) => /\.(vcf|eml|txt|csv)$/i.test(fileName)

function unfoldVCard(text: string) {
  return text.replace(/\r\n/g, '\n').replace(/\n[ \t]/g, '')
}

/** vCard 3/4: FN, ORG, TEL, EMAIL, ADR (;;street;city;region;postal;country), KIND. */
export function parseVCard(text: string): Partial<CreateCustomerDraft> {
  const props = new Map<string, string>()
  for (const line of unfoldVCard(text).split('\n')) {
    const colon = line.indexOf(':')
    if (colon < 0) continue
    const key = line.slice(0, colon).split(';')[0]!.split('.').pop()!.toUpperCase()
    if (!props.has(key)) props.set(key, line.slice(colon + 1).trim())
  }
  const org = props.get('ORG')?.split(';')[0]?.trim()
  const fullName = props.get('FN')?.trim()
  const isOrg = props.get('KIND')?.toLowerCase() === 'org' || (Boolean(org) && !fullName)

  const inferred: Partial<CreateCustomerDraft> = {}
  inferred.type = CUSTOMER_TYPES[isOrg ? 0 : 1]
  const legalName = isOrg ? org : fullName
  if (legalName) inferred.legalName = legalName
  const tel = props.get('TEL')?.replace(/^tel:/i, '')
  if (tel) inferred.phone = parseCustomerField('phone', tel)
  const email = props.get('EMAIL')?.replace(/^mailto:/i, '')
  if (email) inferred.email = parseCustomerField('email', email)
  const adr = props.get('ADR')?.split(';')
  if (adr && (adr[2] || adr[3])) {
    inferred.address = {
      street: adr[2]?.trim() ?? '',
      city: adr[3]?.trim() ?? '',
      state: adr[4]?.trim() ?? '',
      zip: adr[5]?.trim() ?? '',
    }
  }
  return inferred
}

/** Headers are skipped except Subject so the sender's own address isn't taken as the customer's. */
function emailBody(text: string) {
  const normalized = text.replace(/\r\n/g, '\n')
  const split = normalized.indexOf('\n\n')
  if (split < 0) return normalized
  const subject = normalized.slice(0, split).match(/^subject:\s*(.+)$/im)?.[1] ?? ''
  return [subject, normalized.slice(split + 2)].filter(Boolean).join('. ')
}

export async function extractCustomerFromFile(
  file: File,
  context?: AddTaskPageContext,
): Promise<CustomerDocumentExtraction> {
  const kind = classifyCustomerDocument(file.name)
  const base = { fileName: file.name, kind }

  if (readsAsText(file.name)) {
    const text = await file.text().catch(() => '')
    if (kind === 'vcard') return { ...base, inferred: parseVCard(text) }
    const body = /\.eml$/i.test(file.name) ? emailBody(text) : text
    return { ...base, inferred: inferCustomerFromText(body, context) }
  }

  if (kind === 'vcard') return { ...base, inferred: {} }
  return { ...base, inferred: inferCustomerFromText(SIMULATED_TEXT[kind], context) }
}

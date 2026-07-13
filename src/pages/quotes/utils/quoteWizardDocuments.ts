import type {
  OperationalExposure,
  QuoteWizardFormData,
  QuoteWizardUploadedFile,
} from '../data/quoteWizardTypes'
import { markAiFilled } from '../data/quoteWizardDefaults'

const ACCEPTED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.png', '.jpg', '.jpeg', '.eml', '.msg']

/** Demo payload applied when files are dropped — simulates ACORD + schedule extraction. */
const DEMO_DOCUMENT_EXTRACTION = {
  name: 'Greenleaf Landscaping',
  email: 'bob.smith@greenleaf.com',
  address: '123 Main St, Princeton, NJ 08540',
  industryNaics: '561730 - Landscaping Services',
  phone: '(609) 555-0142',
  taxId: '12-3456789',
  customerNumber: 'CUS-10482',
  brokerNumber: 'BRK-22091',
  showAdditionalDetails: true,
  annualRevenue: '1200000',
  employeeCount: '12',
  payroll: '680000',
  operationalExposures: ['vehicles', 'equipment'] as OperationalExposure[],
  vehicleCount: '4',
  vehicleType: 'light',
  equipmentValue: '185000',
  equipmentTypes: ['Mobile', 'Transported'],
  primaryLocation: '123 Main St, Princeton, NJ 08540',
  additionalLocations: ['48 Oak Lane, Trenton, NJ 08608'],
} as const

const DEMO_AI_FILLED_FIELDS = [
  'name',
  'email',
  'address',
  'industryNaics',
  'phone',
  'taxId',
  'customerNumber',
  'brokerNumber',
  'annualRevenue',
  'employeeCount',
  'payroll',
  'operationalExposures',
  'vehicleCount',
  'vehicleType',
  'equipmentValue',
  'equipmentTypes',
  'primaryLocation',
  'additionalLocations',
] as const

export function inferFileKind(name: string): QuoteWizardUploadedFile['kind'] {
  const lower = name.toLowerCase()
  if (/acord|125|126|130|140|application/.test(lower)) return 'acord'
  if (/schedule|fleet|driver|vehicle|equipment/.test(lower)) return 'schedule'
  if (/loss.?run|claim/.test(lower)) return 'loss-run'
  if (/sov|statement.?of.?values/.test(lower)) return 'sov'
  if (/\.eml|\.msg|email|broker/.test(lower)) return 'email'
  if (/\.pdf$/.test(lower)) return 'acord'
  return 'other'
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function createUploadedFile(file: File): QuoteWizardUploadedFile {
  return {
    id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
    name: file.name,
    kind: inferFileKind(file.name),
    sizeLabel: formatFileSize(file.size),
  }
}

export function isAcceptedWizardFile(file: File) {
  const lower = file.name.toLowerCase()
  return ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext))
}

export function mockExtractFromDocuments(files: QuoteWizardUploadedFile[]): Partial<QuoteWizardFormData> {
  if (files.length === 0) return {}

  return {
    ...DEMO_DOCUMENT_EXTRACTION,
    operationalExposures: [...DEMO_DOCUMENT_EXTRACTION.operationalExposures],
    equipmentTypes: [...DEMO_DOCUMENT_EXTRACTION.equipmentTypes],
    additionalLocations: [...DEMO_DOCUMENT_EXTRACTION.additionalLocations],
    aiFilledFields: [...DEMO_AI_FILLED_FIELDS],
  }
}

export function mergeUploadedFiles(
  current: QuoteWizardUploadedFile[],
  incoming: QuoteWizardUploadedFile[],
) {
  const seen = new Set(current.map((file) => file.name.toLowerCase()))
  const next = [...current]
  incoming.forEach((file) => {
    if (!seen.has(file.name.toLowerCase())) {
      next.push(file)
      seen.add(file.name.toLowerCase())
    }
  })
  return next
}

export function applyDocumentExtraction(
  form: QuoteWizardFormData,
  files: QuoteWizardUploadedFile[],
): QuoteWizardFormData {
  const extracted = mockExtractFromDocuments(files)
  const aiFilledFields = markAiFilled(form.aiFilledFields, ...(extracted.aiFilledFields ?? []))
  return {
    ...form,
    ...extracted,
    uploadedFiles: files,
    aiFilledFields,
  }
}

export function kindLabel(kind: QuoteWizardUploadedFile['kind']) {
  switch (kind) {
    case 'acord':
      return 'ACORD'
    case 'schedule':
      return 'Schedule'
    case 'loss-run':
      return 'Loss run'
    case 'sov':
      return 'SOV'
    case 'email':
      return 'Email'
    default:
      return 'Document'
  }
}

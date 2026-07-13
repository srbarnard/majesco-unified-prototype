export const QUOTE_WIZARD_STEPS = [
  { id: 'insured', label: 'Insured Details' },
  { id: 'risk', label: 'Risk Profile' },
  { id: 'exposures', label: 'Exposures & Locations' },
  { id: 'coverages', label: 'Coverages & Pricing' },
  { id: 'review', label: 'Review & Submit' },
] as const

export type QuoteWizardStepId = (typeof QUOTE_WIZARD_STEPS)[number]['id']

export type OperationalExposure = 'vehicles' | 'equipment'

export type QuoteWizardUploadedFile = {
  id: string
  name: string
  kind: 'acord' | 'schedule' | 'loss-run' | 'email' | 'sov' | 'other'
  sizeLabel: string
}

export type QuoteWizardFormData = {
  uploadedFiles: QuoteWizardUploadedFile[]
  name: string
  email: string
  address: string
  industryNaics: string
  phone: string
  taxId: string
  customerNumber: string
  brokerNumber: string
  showAdditionalDetails: boolean
  annualRevenue: string
  employeeCount: string
  payroll: string
  operationalExposures: OperationalExposure[]
  vehicleCount: string
  vehicleType: string
  equipmentValue: string
  equipmentTypes: string[]
  primaryLocation: string
  additionalLocations: string[]
  allocationDetails: string
  selectedCoverages: string[]
  aiFilledFields: string[]
}

export type QuoteWizardCopilotAction = {
  label: string
  field?: keyof QuoteWizardFormData | 'continue' | 'clear' | 'applySample' | 'applyFromDocuments'
  apply?: Partial<QuoteWizardFormData>
}

export type QuoteWizardCopilotState = {
  confidence: number
  statusLabel: string
  headline: string
  message: string
  proTip?: string
  actions: QuoteWizardCopilotAction[]
  showContinue: boolean
  showCoverageBundle?: boolean
  fieldStatuses?: Array<{ label: string; captured: boolean }>
}

export const COVERAGE_OPTIONS = [
  { id: 'gl', label: 'General Liability', description: 'Premises / operations and products-completed operations.' },
  { id: 'wc', label: "Workers' Compensation", description: 'Payroll by class code, experience modification.' },
  { id: 'ca', label: 'Commercial Auto', description: 'Owned, hired & non-owned auto — liability and physical damage.' },
  { id: 'im', label: 'Inland Marine', description: 'Mobile equipment, tools, cargo & property in transit.' },
  { id: 'cp', label: 'Commercial Property', description: 'Buildings, business personal property & income (COPE).' },
  { id: 'umbrella', label: 'Umbrella / Excess', description: 'Excess limits sitting over the primary lines.' },
] as const

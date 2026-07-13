import type { QuoteWizardFormData } from './quoteWizardTypes'

export const emptyQuoteWizardForm: QuoteWizardFormData = {
  uploadedFiles: [],
  name: '',
  email: '',
  address: '',
  industryNaics: '',
  phone: '',
  taxId: '',
  customerNumber: '',
  brokerNumber: '',
  showAdditionalDetails: false,
  annualRevenue: '',
  employeeCount: '',
  payroll: '',
  operationalExposures: [],
  vehicleCount: '',
  vehicleType: '',
  equipmentValue: '',
  equipmentTypes: [],
  primaryLocation: '',
  additionalLocations: [],
  allocationDetails: '',
  selectedCoverages: [],
  aiFilledFields: [],
}

export function markAiFilled(fields: string[], ...keys: string[]) {
  const next = new Set(fields)
  keys.forEach((key) => next.add(key))
  return Array.from(next)
}

export type CustomersListFilters = {
  attentions: string[]
  billingStatuses: string[]
}

export const CUSTOMER_ATTENTION_OPTIONS = [
  'Issuance hold · billing',
  'Past due 30d · hold pending',
  'Renews in 8 days',
  '3 renewals · 45d · +9%',
  'Above appetite · referral',
  'Contact change · unreconciled',
  'Waiting on producer',
  'Merge unresolved · low conf',
  'Cross-sell fit · umbrella',
  'No action needed',
] as const

export const CUSTOMER_BILLING_STATUS_OPTIONS = ['Past due', 'Current'] as const

export const emptyCustomersListFilters: CustomersListFilters = {
  attentions: [],
  billingStatuses: [],
}

export function countActiveCustomersFilters(filters: CustomersListFilters) {
  return filters.attentions.length + filters.billingStatuses.length
}

export function hasActiveCustomersFilters(filters: CustomersListFilters) {
  return countActiveCustomersFilters(filters) > 0
}

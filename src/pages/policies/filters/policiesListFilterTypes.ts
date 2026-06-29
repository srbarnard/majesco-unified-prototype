import {
  EFFECTIVE_DATE_PRESET_OPTIONS,
  emptyListFilters,
  hasActiveListFilters,
  type EffectiveDatePreset,
  type ListFilters,
} from '@/design-system/filters/listFilterTypes'

export const POLICY_PRODUCT_OPTIONS = [
  'Commercial Auto',
  'Umbrella Liability',
  'Commercial General Liability',
  "Workers' Compensation",
  'Business Owners Policy',
  'Commercial Package',
] as const

export const POLICY_PRODUCER_OPTIONS = [
  'Atlas Insurance',
  'Blue Ridge Insurance',
  'ClearPath Insurance',
  'Evergreen Risk',
  'Harborview Agency',
] as const

export const POLICY_STATUS_OPTIONS = ['Open', 'In review', 'Quoted', 'Declined'] as const

export type PolicyProduct = (typeof POLICY_PRODUCT_OPTIONS)[number]
export type PolicyProducer = (typeof POLICY_PRODUCER_OPTIONS)[number]
export type PolicyStatus = (typeof POLICY_STATUS_OPTIONS)[number]

export type DatePreset = EffectiveDatePreset
export type PoliciesListFilters = ListFilters

export const emptyPoliciesListFilters = emptyListFilters
export const DATE_PRESET_OPTIONS = EFFECTIVE_DATE_PRESET_OPTIONS
export const hasActiveFilters = hasActiveListFilters

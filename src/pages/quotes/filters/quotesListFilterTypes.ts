import {
  emptyListFilters,
  hasActiveListFilters,
  type ListFilters,
} from '@/design-system/filters/listFilterTypes'

export const QUOTE_PRODUCT_OPTIONS = [
  'Commercial Auto',
  'Commercial Package',
  'Umbrella',
  'General Liability',
  'Property',
  'Commercial Property',
  'BOP',
  'Workers Compensation',
  'Motor Truck Cargo',
] as const

export const QUOTE_PRODUCER_OPTIONS = [
  'Atlantic Ridge Construction, LLC',
  'Blue Harbor Logistics Inc.',
  'Maple Grove Property Management',
  'Silverline Manufacturing Co.',
  'Northshore Medical Group, P.C.',
  'Keystone Commercial Realty',
  'Summit Outdoor Equipment, Inc.',
  'Red Oak Hospitality Group',
  'Evergreen Food Distributors',
  'Horizon Fleet Services, LLC',
] as const

export const QUOTE_FILTER_STATUS_OPTIONS = ['Open', 'In review', 'Quoted', 'Declined'] as const

export type QuoteFilterStatus = (typeof QUOTE_FILTER_STATUS_OPTIONS)[number]
export type QuotesListFilters = ListFilters

export const QUOTES_UPDATED_PRESET_OPTIONS = [
  { value: '', label: 'Select' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '2-days-ago', label: '2 days ago' },
  { value: 'custom', label: 'Custom range' },
] as const

export const emptyQuotesListFilters = emptyListFilters
export const hasActiveQuotesFilters = hasActiveListFilters

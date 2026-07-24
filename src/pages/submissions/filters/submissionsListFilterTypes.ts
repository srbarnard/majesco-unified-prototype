import {
  emptyListFilters,
  hasActiveListFilters,
  type ListFilters,
} from '@/design-system/filters/listFilterTypes'

export const SUBMISSION_PRODUCT_OPTIONS = [
  'Commercial Auto',
  'General Liability',
  'Workers Compensation',
  'Commercial Package',
  'Umbrella',
  'Inland Marine',
  'Professional Liability',
  'Commercial Property',
  'BOP',
  'Motor Truck Cargo',
] as const

export const SUBMISSION_ASSIGNEE_OPTIONS = [
  'Underwriting Queue',
  'Sarah Thompson',
  'Dana Patel',
  'Marcus Lee',
  'Jordan Reyes',
  'Ava Chen',
  'Chris Nolan',
  'Priya Shah',
] as const

export const SUBMISSION_FILTER_STATUS_OPTIONS = ['Ready', 'Blocked'] as const

export type SubmissionFilterStatus = (typeof SUBMISSION_FILTER_STATUS_OPTIONS)[number]
export type SubmissionsListFilters = ListFilters

export const SUBMISSIONS_UPDATED_PRESET_OPTIONS = [
  { value: '', label: 'Select' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '2-days-ago', label: '2 days ago' },
  { value: 'custom', label: 'Custom range' },
] as const

export const emptySubmissionsListFilters = emptyListFilters
export const hasActiveSubmissionsFilters = hasActiveListFilters

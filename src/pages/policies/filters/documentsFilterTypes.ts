export type DocumentDatePreset = '' | 'today' | 'last-7-days' | 'last-30-days' | 'custom'

export type DocumentsFilters = {
  tags: string[]
  authors: string[]
  kinds: string[]
  activityLabels: string[]
  datePreset: DocumentDatePreset
  dateStart: string
  dateEnd: string
}

export const DOCUMENT_KIND_OPTIONS = ['Document', 'Form', 'Package'] as const

export const DOCUMENT_TAG_OPTIONS = [
  '2026 Renewal',
  'Package',
  'END-12',
  'Correspondence',
  'Quote PDF',
  'v3 Rated',
  'Coverage Summary',
  'Underwriting',
  'Application',
  'Fleet',
  'Rating Input',
  'Loss Runs',
] as const

export const DOCUMENT_AUTHOR_OPTIONS = [
  'Maria Alvarez',
  'System',
  'Underwriting Bot',
  'Loss Control',
  'Jordan Ellis',
  'Rating Engine',
  'Atlantic Ridge Construction, LLC',
  'Loss Run Service',
] as const

export const DOCUMENT_ACTIVITY_OPTIONS = [
  'Policy',
  'Endorsement',
  'Quote',
  'Underwriting',
  'Submission',
] as const

export const DOCUMENT_DATE_PRESET_OPTIONS = [
  { value: '', label: 'Select' },
  { value: 'today', label: 'Today' },
  { value: 'last-7-days', label: 'Last 7 days' },
  { value: 'last-30-days', label: 'Last 30 days' },
  { value: 'custom', label: 'Custom range' },
] as const

export const emptyDocumentsFilters: DocumentsFilters = {
  tags: [],
  authors: [],
  kinds: [],
  activityLabels: [],
  datePreset: '',
  dateStart: '',
  dateEnd: '',
}

export function hasActiveDocumentsFilters(filters: DocumentsFilters) {
  return (
    filters.tags.length > 0 ||
    filters.authors.length > 0 ||
    filters.kinds.length > 0 ||
    filters.activityLabels.length > 0 ||
    filters.datePreset !== ''
  )
}

export function countActiveDocumentsFilters(filters: DocumentsFilters) {
  let count = 0
  if (filters.tags.length > 0) count += 1
  if (filters.authors.length > 0) count += 1
  if (filters.kinds.length > 0) count += 1
  if (filters.activityLabels.length > 0) count += 1
  if (filters.datePreset !== '') count += 1
  return count
}

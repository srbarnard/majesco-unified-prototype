export type EffectiveDatePreset = '' | 'today' | 'next-7-days' | 'next-30-days' | 'custom'

export type ListFilters = {
  products: string[]
  producers: string[]
  statuses: string[]
  effectiveDatePreset: EffectiveDatePreset
  effectiveDateStart: string
  effectiveDateEnd: string
  updatedPreset: string
  updatedStart: string
  updatedEnd: string
}

export const emptyListFilters: ListFilters = {
  products: [],
  producers: [],
  statuses: [],
  effectiveDatePreset: '',
  effectiveDateStart: '',
  effectiveDateEnd: '',
  updatedPreset: '',
  updatedStart: '',
  updatedEnd: '',
}

export const EFFECTIVE_DATE_PRESET_OPTIONS: { value: EffectiveDatePreset; label: string }[] = [
  { value: '', label: 'Select' },
  { value: 'today', label: 'Today' },
  { value: 'next-7-days', label: 'Next 7 days' },
  { value: 'next-30-days', label: 'Next 30 days' },
  { value: 'custom', label: 'Custom range' },
]

export type PresetOption = { value: string; label: string }

export function hasActiveListFilters(filters: ListFilters) {
  return (
    filters.products.length > 0 ||
    filters.producers.length > 0 ||
    filters.statuses.length > 0 ||
    filters.effectiveDatePreset !== '' ||
    filters.updatedPreset !== ''
  )
}

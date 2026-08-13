export type InsuredsListFilters = {
  activityStatuses: string[]
  zipCodes: string[]
  premiumMin: string
  premiumMax: string
  incurredLossMin: string
  incurredLossMax: string
}

export const INSURED_ACTIVITY_STATUS_OPTIONS = ['Upcoming renewals', 'Open quotes', 'Open claims'] as const

export const INSURED_ZIP_OPTIONS = [
  '10111',
  '19103',
  '33139',
  '37203',
  '45241',
  '55401',
  '60201',
  '60607',
  '60614',
  '68102',
  '75261',
  '78701',
  '80202',
  '85034',
  '92101',
  '94105',
  '97204',
  '98101',
  '98106',
] as const

export const INSURED_CURRENCY_RANGE_OPTIONS = [
  { value: '', label: 'Any' },
  { value: '250000', label: '$250,000' },
  { value: '500000', label: '$500,000' },
  { value: '750000', label: '$750,000' },
  { value: '1000000', label: '$1,000,000' },
  { value: '1500000', label: '$1,500,000' },
  { value: '2000000', label: '$2,000,000' },
  { value: '3000000', label: '$3,000,000' },
  { value: '4000000', label: '$4,000,000' },
] as const

export const emptyInsuredsListFilters: InsuredsListFilters = {
  activityStatuses: [],
  zipCodes: [],
  premiumMin: '',
  premiumMax: '',
  incurredLossMin: '',
  incurredLossMax: '',
}

export function hasActiveInsuredsFilters(filters: InsuredsListFilters) {
  return (
    filters.activityStatuses.length > 0 ||
    filters.zipCodes.length > 0 ||
    Boolean(filters.premiumMin) ||
    Boolean(filters.premiumMax) ||
    Boolean(filters.incurredLossMin) ||
    Boolean(filters.incurredLossMax)
  )
}

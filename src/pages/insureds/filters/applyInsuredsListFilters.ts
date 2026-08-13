import type { InsuredListRecord } from '@/pages/insureds/data/mockInsureds'
import type { InsuredsListFilters } from '@/pages/insureds/filters/insuredsListFilterTypes'

function parseBound(value: string) {
  if (!value) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function matchesActivity(row: InsuredListRecord, statuses: string[]) {
  if (statuses.length === 0) return true
  return statuses.some((status) => {
    if (status === 'Upcoming renewals') return (row.upcomingRenewals ?? 0) > 0
    if (status === 'Open quotes') return (row.openQuotes ?? 0) > 0
    if (status === 'Open claims') return (row.openClaims ?? 0) > 0
    return false
  })
}

function matchesRange(value: number, min: string, max: string) {
  const minValue = parseBound(min)
  const maxValue = parseBound(max)
  if (minValue != null && value < minValue) return false
  if (maxValue != null && value > maxValue) return false
  return true
}

export function applyInsuredsListFilters(rows: InsuredListRecord[], filters: InsuredsListFilters) {
  return rows.filter((row) => {
    if (!matchesActivity(row, filters.activityStatuses)) return false
    if (filters.zipCodes.length > 0 && !filters.zipCodes.includes(row.zip)) return false
    if (!matchesRange(row.premiumInForce, filters.premiumMin, filters.premiumMax)) return false
    if (!matchesRange(row.totalIncurredLoss, filters.incurredLossMin, filters.incurredLossMax)) return false
    return true
  })
}

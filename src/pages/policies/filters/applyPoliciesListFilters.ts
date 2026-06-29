import {
  matchesEffectiveDatePreset,
  matchesUpdatedDatePreset,
} from '@/design-system/filters/datePresetMatching'
import type { PolicyListRecord } from '@/pages/policies/data/mockPoliciesList'
import type { PoliciesListFilters } from '@/pages/policies/filters/policiesListFilterTypes'

export function applyPoliciesListFilters(
  rows: PolicyListRecord[],
  filters: PoliciesListFilters,
  referenceDate = new Date(),
) {
  return rows.filter((row) => {
    if (filters.products.length > 0 && !filters.products.includes(row.product)) {
      return false
    }

    if (filters.producers.length > 0 && !filters.producers.includes(row.producer)) {
      return false
    }

    if (filters.statuses.length > 0 && !filters.statuses.includes(row.status)) {
      return false
    }

    if (
      !matchesEffectiveDatePreset(
        row.effectiveDate,
        filters.effectiveDatePreset,
        filters.effectiveDateStart,
        filters.effectiveDateEnd,
        referenceDate,
      )
    ) {
      return false
    }

    if (
      !matchesUpdatedDatePreset(
        row.lastUpdated,
        filters.updatedPreset,
        filters.updatedStart,
        filters.updatedEnd,
        referenceDate,
      )
    ) {
      return false
    }

    return true
  })
}

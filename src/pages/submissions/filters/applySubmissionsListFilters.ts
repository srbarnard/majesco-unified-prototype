import {
  matchesEffectiveDatePreset,
  matchesUpdatedDatePreset,
} from '@/design-system/filters/datePresetMatching'
import type { SubmissionListRecord } from '@/pages/submissions/data/mockSubmissions'
import type { SubmissionsListFilters } from '@/pages/submissions/filters/submissionsListFilterTypes'

function matchesLob(row: SubmissionListRecord, products: string[]) {
  if (products.length === 0) return true
  return row.linesOfBusiness.some((lob) => products.includes(lob))
}

export function applySubmissionsListFilters(
  rows: SubmissionListRecord[],
  filters: SubmissionsListFilters,
  referenceDate = new Date(),
) {
  return rows.filter((row) => {
    if (!matchesLob(row, filters.products)) {
      return false
    }

    if (filters.producers.length > 0 && !filters.producers.includes(row.assignedTo)) {
      return false
    }

    if (filters.statuses.length > 0 && !filters.statuses.includes(row.status)) {
      return false
    }

    // Reuse effective-date presets against submittedAt date portion.
    const submittedDate = row.submittedAt.slice(0, 10)
    if (
      !matchesEffectiveDatePreset(
        submittedDate,
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
        submittedDate,
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

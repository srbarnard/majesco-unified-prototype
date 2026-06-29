import {
  matchesEffectiveDatePreset,
  matchesUpdatedDatePreset,
} from '@/design-system/filters/datePresetMatching'
import type { Quote } from '@/pages/quotes/data/mockQuotes'
import type { QuotesListFilters } from '@/pages/quotes/filters/quotesListFilterTypes'

function matchesQuoteProduct(row: Quote, products: string[]) {
  if (products.length === 0) return true
  return row.products.some((product) => products.includes(product))
}

export function applyQuotesListFilters(
  rows: Quote[],
  filters: QuotesListFilters,
  referenceDate = new Date(),
) {
  return rows.filter((row) => {
    if (!matchesQuoteProduct(row, filters.products)) {
      return false
    }

    if (filters.producers.length > 0 && !filters.producers.includes(row.producer)) {
      return false
    }

    if (filters.statuses.length > 0 && !filters.statuses.includes(row.filterStatus)) {
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

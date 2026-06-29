import { ListFilterPanel } from '@/design-system/components/ListFilterPanel'
import { EFFECTIVE_DATE_PRESET_OPTIONS } from '@/design-system/filters/listFilterTypes'
import {
  QUOTE_FILTER_STATUS_OPTIONS,
  QUOTE_PRODUCER_OPTIONS,
  QUOTE_PRODUCT_OPTIONS,
  QUOTES_UPDATED_PRESET_OPTIONS,
  emptyQuotesListFilters,
  type QuotesListFilters,
} from '@/pages/quotes/filters/quotesListFilterTypes'

type QuotesFilterPanelProps = {
  appliedFilters: QuotesListFilters
  onApply: (filters: QuotesListFilters) => void
  onClose?: () => void
}

export function QuotesFilterPanel({ appliedFilters, onApply, onClose }: QuotesFilterPanelProps) {
  return (
    <ListFilterPanel
      appliedFilters={appliedFilters}
      onApply={onApply}
      onClose={onClose}
      productOptions={QUOTE_PRODUCT_OPTIONS}
      producerOptions={QUOTE_PRODUCER_OPTIONS}
      statusOptions={QUOTE_FILTER_STATUS_OPTIONS}
      effectiveDatePresetOptions={EFFECTIVE_DATE_PRESET_OPTIONS}
      updatedPresetOptions={QUOTES_UPDATED_PRESET_OPTIONS}
      emptyFilters={emptyQuotesListFilters}
    />
  )
}

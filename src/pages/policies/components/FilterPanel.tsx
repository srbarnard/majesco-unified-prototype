import { ListFilterPanel } from '@/design-system/components/ListFilterPanel'
import {
  DATE_PRESET_OPTIONS,
  POLICY_PRODUCER_OPTIONS,
  POLICY_PRODUCT_OPTIONS,
  POLICY_STATUS_OPTIONS,
  emptyPoliciesListFilters,
  type PoliciesListFilters,
} from '@/pages/policies/filters/policiesListFilterTypes'

type FilterPanelProps = {
  appliedFilters: PoliciesListFilters
  onApply: (filters: PoliciesListFilters) => void
  onClose?: () => void
}

export function FilterPanel({ appliedFilters, onApply, onClose }: FilterPanelProps) {
  return (
    <ListFilterPanel
      appliedFilters={appliedFilters}
      onApply={onApply}
      onClose={onClose}
      productOptions={POLICY_PRODUCT_OPTIONS}
      producerOptions={POLICY_PRODUCER_OPTIONS}
      statusOptions={POLICY_STATUS_OPTIONS}
      effectiveDatePresetOptions={DATE_PRESET_OPTIONS}
      updatedPresetOptions={DATE_PRESET_OPTIONS}
      emptyFilters={emptyPoliciesListFilters}
    />
  )
}

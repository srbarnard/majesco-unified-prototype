import { ListFilterPanel } from '@/design-system/components/ListFilterPanel'
import { EFFECTIVE_DATE_PRESET_OPTIONS } from '@/design-system/filters/listFilterTypes'
import {
  SUBMISSION_ASSIGNEE_OPTIONS,
  SUBMISSION_FILTER_STATUS_OPTIONS,
  SUBMISSION_PRODUCT_OPTIONS,
  SUBMISSIONS_UPDATED_PRESET_OPTIONS,
  emptySubmissionsListFilters,
  type SubmissionsListFilters,
} from '@/pages/submissions/filters/submissionsListFilterTypes'

type SubmissionsFilterPanelProps = {
  appliedFilters: SubmissionsListFilters
  onApply: (filters: SubmissionsListFilters) => void
  onClose?: () => void
}

export function SubmissionsFilterPanel({
  appliedFilters,
  onApply,
  onClose,
}: SubmissionsFilterPanelProps) {
  return (
    <ListFilterPanel
      appliedFilters={appliedFilters}
      onApply={onApply}
      onClose={onClose}
      productOptions={[...SUBMISSION_PRODUCT_OPTIONS]}
      producerOptions={[...SUBMISSION_ASSIGNEE_OPTIONS]}
      statusOptions={[...SUBMISSION_FILTER_STATUS_OPTIONS]}
      effectiveDatePresetOptions={EFFECTIVE_DATE_PRESET_OPTIONS}
      updatedPresetOptions={SUBMISSIONS_UPDATED_PRESET_OPTIONS}
      emptyFilters={emptySubmissionsListFilters}
    />
  )
}

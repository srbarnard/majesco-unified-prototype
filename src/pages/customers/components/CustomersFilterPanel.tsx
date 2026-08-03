import { useEffect, useState } from 'react'
import {
  FilterMultiSelect,
  FilterPanelShell,
} from '@/design-system/components/ListFilterPanel/filterPanelPrimitives'
import {
  CUSTOMER_ATTENTION_OPTIONS,
  CUSTOMER_BILLING_STATUS_OPTIONS,
  emptyCustomersListFilters,
  type CustomersListFilters,
} from '@/pages/customers/filters/customersListFilterTypes'

type CustomersFilterPanelProps = {
  appliedFilters: CustomersListFilters
  onApply: (filters: CustomersListFilters) => void
  onClose?: () => void
}

export function CustomersFilterPanel({ appliedFilters, onApply, onClose }: CustomersFilterPanelProps) {
  const [draft, setDraft] = useState<CustomersListFilters>(appliedFilters)

  useEffect(() => {
    setDraft(appliedFilters)
  }, [appliedFilters])

  return (
    <FilterPanelShell
      onClose={onClose}
      onClearAll={() => {
        setDraft(emptyCustomersListFilters)
        onApply(emptyCustomersListFilters)
      }}
      onApply={() => onApply(draft)}
    >
      <FilterMultiSelect
        label="Attention"
        options={CUSTOMER_ATTENTION_OPTIONS}
        value={draft.attentions}
        onChange={(attentions) => setDraft((current) => ({ ...current, attentions }))}
      />
      <FilterMultiSelect
        label="Billing status"
        options={CUSTOMER_BILLING_STATUS_OPTIONS}
        value={draft.billingStatuses}
        onChange={(billingStatuses) => setDraft((current) => ({ ...current, billingStatuses }))}
      />
    </FilterPanelShell>
  )
}

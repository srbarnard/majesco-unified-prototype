import { useEffect, useMemo, useState } from 'react'
import {
  FilterMinMaxSelect,
  FilterMultiSelect,
  FilterPanelShell,
} from '@/design-system/components/ListFilterPanel/filterPanelPrimitives'
import {
  INSURED_ACTIVITY_STATUS_OPTIONS,
  INSURED_CURRENCY_RANGE_OPTIONS,
  INSURED_ZIP_OPTIONS,
  emptyInsuredsListFilters,
  type InsuredsListFilters,
} from '@/pages/insureds/filters/insuredsListFilterTypes'

type InsuredsFilterPanelProps = {
  appliedFilters: InsuredsListFilters
  onApply: (filters: InsuredsListFilters) => void
  onClose?: () => void
}

export function InsuredsFilterPanel({ appliedFilters, onApply, onClose }: InsuredsFilterPanelProps) {
  const [draft, setDraft] = useState<InsuredsListFilters>(appliedFilters)
  const rangeOptions = useMemo(() => [...INSURED_CURRENCY_RANGE_OPTIONS], [])

  useEffect(() => {
    setDraft(appliedFilters)
  }, [appliedFilters])

  return (
    <FilterPanelShell
      onClose={onClose}
      onClearAll={() => {
        setDraft(emptyInsuredsListFilters)
        onApply(emptyInsuredsListFilters)
      }}
      onApply={() => onApply(draft)}
    >
      <FilterMultiSelect
        label="Activity & Status"
        options={INSURED_ACTIVITY_STATUS_OPTIONS}
        value={draft.activityStatuses}
        onChange={(activityStatuses) => setDraft((current) => ({ ...current, activityStatuses }))}
      />
      <FilterMultiSelect
        label="ZIP Code"
        options={INSURED_ZIP_OPTIONS}
        value={draft.zipCodes}
        onChange={(zipCodes) => setDraft((current) => ({ ...current, zipCodes }))}
      />
      <FilterMinMaxSelect
        label="Premium In-Force range"
        options={rangeOptions}
        min={draft.premiumMin}
        max={draft.premiumMax}
        onMinChange={(premiumMin) => setDraft((current) => ({ ...current, premiumMin }))}
        onMaxChange={(premiumMax) => setDraft((current) => ({ ...current, premiumMax }))}
      />
      <FilterMinMaxSelect
        label="Total incurred loss range"
        options={rangeOptions}
        min={draft.incurredLossMin}
        max={draft.incurredLossMax}
        onMinChange={(incurredLossMin) => setDraft((current) => ({ ...current, incurredLossMin }))}
        onMaxChange={(incurredLossMax) => setDraft((current) => ({ ...current, incurredLossMax }))}
      />
    </FilterPanelShell>
  )
}

import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import { useEffect, useState } from 'react'
import {
  FilterMultiSelect,
  FilterPanelShell,
  FilterPresetField,
} from '@/design-system/components/ListFilterPanel/filterPanelPrimitives'
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
  const [draft, setDraft] = useState<PoliciesListFilters>(appliedFilters)

  useEffect(() => {
    setDraft(appliedFilters)
  }, [appliedFilters])

  const handleClearAll = () => {
    setDraft(emptyPoliciesListFilters)
    onApply(emptyPoliciesListFilters)
  }

  const handleApply = () => {
    onApply(draft)
  }

  return (
    <FilterPanelShell onClose={onClose} onClearAll={handleClearAll} onApply={handleApply}>
      <FilterMultiSelect
        label="Product"
        options={POLICY_PRODUCT_OPTIONS}
        value={draft.products}
        onChange={(products) => setDraft((current) => ({ ...current, products }))}
      />
      <FilterMultiSelect
        label="Producer"
        options={POLICY_PRODUCER_OPTIONS}
        value={draft.producers}
        onChange={(producers) => setDraft((current) => ({ ...current, producers }))}
      />
      <FilterMultiSelect
        label="Status"
        options={POLICY_STATUS_OPTIONS}
        value={draft.statuses}
        onChange={(statuses) => setDraft((current) => ({ ...current, statuses }))}
      />
      <FilterPresetField
        label="Effective date"
        preset={draft.effectiveDatePreset}
        start={draft.effectiveDateStart}
        end={draft.effectiveDateEnd}
        presetOptions={DATE_PRESET_OPTIONS}
        onPresetChange={(effectiveDatePreset) =>
          setDraft((current) => ({
            ...current,
            effectiveDatePreset: effectiveDatePreset as PoliciesListFilters['effectiveDatePreset'],
            effectiveDateStart: effectiveDatePreset === 'custom' ? current.effectiveDateStart : '',
            effectiveDateEnd: effectiveDatePreset === 'custom' ? current.effectiveDateEnd : '',
          }))
        }
        onStartChange={(effectiveDateStart) => setDraft((current) => ({ ...current, effectiveDateStart }))}
        onEndChange={(effectiveDateEnd) => setDraft((current) => ({ ...current, effectiveDateEnd }))}
      />
      <FilterPresetField
        label="Expiration date"
        preset={draft.expirationDatePreset}
        start=""
        end=""
        presetOptions={DATE_PRESET_OPTIONS}
        onPresetChange={(expirationDatePreset) =>
          setDraft((current) => ({
            ...current,
            expirationDatePreset: expirationDatePreset as PoliciesListFilters['expirationDatePreset'],
          }))
        }
        onStartChange={() => undefined}
        onEndChange={() => undefined}
      />
      <FilterPresetField
        label="Updated"
        preset={draft.updatedPreset}
        start={draft.updatedStart}
        end={draft.updatedEnd}
        presetOptions={DATE_PRESET_OPTIONS}
        onPresetChange={(updatedPreset) =>
          setDraft((current) => ({
            ...current,
            updatedPreset,
            updatedStart: updatedPreset === 'custom' ? current.updatedStart : '',
            updatedEnd: updatedPreset === 'custom' ? current.updatedEnd : '',
          }))
        }
        onStartChange={(updatedStart) => setDraft((current) => ({ ...current, updatedStart }))}
        onEndChange={(updatedEnd) => setDraft((current) => ({ ...current, updatedEnd }))}
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={draft.openClaimsOnly}
            onChange={(event) =>
              setDraft((current) => ({ ...current, openClaimsOnly: event.target.checked }))
            }
            size="small"
          />
        }
        label="Open claims only"
        sx={{ ml: 0, alignItems: 'flex-start' }}
      />
    </FilterPanelShell>
  )
}

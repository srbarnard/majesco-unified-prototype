import { useEffect, useState } from 'react'
import {
  EFFECTIVE_DATE_PRESET_OPTIONS,
  type ListFilters,
  type PresetOption,
} from '@/design-system/filters/listFilterTypes'
import {
  FilterMultiSelect,
  FilterPanelShell,
  FilterPresetField,
} from './filterPanelPrimitives'

export type ListFilterPanelProps = {
  appliedFilters: ListFilters
  onApply: (filters: ListFilters) => void
  onClose?: () => void
  productOptions: readonly string[]
  producerOptions: readonly string[]
  statusOptions: readonly string[]
  effectiveDatePresetOptions?: readonly PresetOption[]
  updatedPresetOptions?: readonly PresetOption[]
  emptyFilters: ListFilters
}

export function ListFilterPanel({
  appliedFilters,
  onApply,
  onClose,
  productOptions,
  producerOptions,
  statusOptions,
  effectiveDatePresetOptions = EFFECTIVE_DATE_PRESET_OPTIONS,
  updatedPresetOptions = EFFECTIVE_DATE_PRESET_OPTIONS,
  emptyFilters,
}: ListFilterPanelProps) {
  const [draft, setDraft] = useState<ListFilters>(appliedFilters)

  useEffect(() => {
    setDraft(appliedFilters)
  }, [appliedFilters])

  const handleClearAll = () => {
    setDraft(emptyFilters)
    onApply(emptyFilters)
  }

  const handleApply = () => {
    onApply(draft)
  }

  return (
    <FilterPanelShell onClose={onClose} onClearAll={handleClearAll} onApply={handleApply}>
      <FilterMultiSelect
        label="Product"
        options={productOptions}
        value={draft.products}
        onChange={(products) => setDraft((current) => ({ ...current, products }))}
      />
      <FilterMultiSelect
        label="Producer"
        options={producerOptions}
        value={draft.producers}
        onChange={(producers) => setDraft((current) => ({ ...current, producers }))}
      />
      <FilterMultiSelect
        label="Status"
        options={statusOptions}
        value={draft.statuses}
        onChange={(statuses) => setDraft((current) => ({ ...current, statuses }))}
      />
      <FilterPresetField
        label="Effective date"
        preset={draft.effectiveDatePreset}
        start={draft.effectiveDateStart}
        end={draft.effectiveDateEnd}
        presetOptions={effectiveDatePresetOptions}
        onPresetChange={(effectiveDatePreset) =>
          setDraft((current) => ({
            ...current,
            effectiveDatePreset: effectiveDatePreset as ListFilters['effectiveDatePreset'],
            effectiveDateStart: effectiveDatePreset === 'custom' ? current.effectiveDateStart : '',
            effectiveDateEnd: effectiveDatePreset === 'custom' ? current.effectiveDateEnd : '',
          }))
        }
        onStartChange={(effectiveDateStart) => setDraft((current) => ({ ...current, effectiveDateStart }))}
        onEndChange={(effectiveDateEnd) => setDraft((current) => ({ ...current, effectiveDateEnd }))}
      />
      <FilterPresetField
        label="Updated"
        preset={draft.updatedPreset}
        start={draft.updatedStart}
        end={draft.updatedEnd}
        presetOptions={updatedPresetOptions}
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
    </FilterPanelShell>
  )
}

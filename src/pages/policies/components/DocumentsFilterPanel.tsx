import { useEffect, useState } from 'react'
import {
  FilterMultiSelect,
  FilterPanelShell,
  FilterPresetField,
} from '@/design-system/components/ListFilterPanel/filterPanelPrimitives'
import {
  DOCUMENT_ACTIVITY_OPTIONS,
  DOCUMENT_AUTHOR_OPTIONS,
  DOCUMENT_DATE_PRESET_OPTIONS,
  DOCUMENT_KIND_OPTIONS,
  DOCUMENT_TAG_OPTIONS,
  emptyDocumentsFilters,
  type DocumentsFilters,
} from '@/pages/policies/filters/documentsFilterTypes'

type DocumentsFilterPanelProps = {
  appliedFilters: DocumentsFilters
  onApply: (filters: DocumentsFilters) => void
  onClose?: () => void
}

export function DocumentsFilterPanel({ appliedFilters, onApply, onClose }: DocumentsFilterPanelProps) {
  const [draft, setDraft] = useState<DocumentsFilters>(appliedFilters)

  useEffect(() => {
    setDraft(appliedFilters)
  }, [appliedFilters])

  const handleClearAll = () => {
    setDraft(emptyDocumentsFilters)
    onApply(emptyDocumentsFilters)
  }

  const handleApply = () => {
    onApply(draft)
  }

  return (
    <FilterPanelShell onClose={onClose} onClearAll={handleClearAll} onApply={handleApply}>
      <FilterMultiSelect
        label="Tag"
        options={DOCUMENT_TAG_OPTIONS}
        value={draft.tags}
        onChange={(tags) => setDraft((current) => ({ ...current, tags }))}
      />
      <FilterMultiSelect
        label="Author"
        options={DOCUMENT_AUTHOR_OPTIONS}
        value={draft.authors}
        onChange={(authors) => setDraft((current) => ({ ...current, authors }))}
      />
      <FilterPresetField
        label="Policy date"
        preset={draft.datePreset}
        start={draft.dateStart}
        end={draft.dateEnd}
        presetOptions={DOCUMENT_DATE_PRESET_OPTIONS}
        onPresetChange={(datePreset) =>
          setDraft((current) => ({
            ...current,
            datePreset: datePreset as DocumentsFilters['datePreset'],
            dateStart: datePreset === 'custom' ? current.dateStart : '',
            dateEnd: datePreset === 'custom' ? current.dateEnd : '',
          }))
        }
        onStartChange={(dateStart) => setDraft((current) => ({ ...current, dateStart }))}
        onEndChange={(dateEnd) => setDraft((current) => ({ ...current, dateEnd }))}
      />
      <FilterMultiSelect
        label="Activity"
        options={DOCUMENT_ACTIVITY_OPTIONS}
        value={draft.activityLabels}
        onChange={(activityLabels) => setDraft((current) => ({ ...current, activityLabels }))}
      />
      <FilterMultiSelect
        label="Type"
        options={DOCUMENT_KIND_OPTIONS}
        value={draft.kinds}
        onChange={(kinds) => setDraft((current) => ({ ...current, kinds }))}
      />
    </FilterPanelShell>
  )
}

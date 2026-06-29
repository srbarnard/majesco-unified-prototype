import { useEffect, useState } from 'react'
import {
  FilterMultiSelect,
  FilterPanelShell,
  FilterPresetField,
} from '@/design-system/components/ListFilterPanel'
import {
  TASKS_AGING_PRESET_OPTIONS,
  TASKS_DUE_DATE_PRESET_OPTIONS,
  TASK_ASSIGNED_TO_OPTIONS,
  TASK_PRIORITY_OPTIONS,
  TASK_REFERENCE_TYPE_OPTIONS,
  TASK_STATUS_OPTIONS,
  emptyTasksFilters,
  type AgingPreset,
  type DueDatePreset,
  type TasksFilters,
} from '@/pages/tasks/filters/tasksFilterTypes'

type TasksFilterPanelProps = {
  appliedFilters: TasksFilters
  onApply: (filters: TasksFilters) => void
  onClose?: () => void
}

export function TasksFilterPanel({ appliedFilters, onApply, onClose }: TasksFilterPanelProps) {
  const [draft, setDraft] = useState<TasksFilters>(appliedFilters)

  useEffect(() => {
    setDraft(appliedFilters)
  }, [appliedFilters])

  const handleClearAll = () => {
    setDraft(emptyTasksFilters)
    onApply(emptyTasksFilters)
  }

  const handleApply = () => {
    onApply(draft)
  }

  return (
    <FilterPanelShell onClose={onClose} onClearAll={handleClearAll} onApply={handleApply}>
      <FilterMultiSelect
        label="Assigned to"
        options={TASK_ASSIGNED_TO_OPTIONS}
        value={draft.assignedTo}
        onChange={(assignedTo) => setDraft((current) => ({ ...current, assignedTo }))}
      />
      <FilterMultiSelect
        label="Status"
        options={TASK_STATUS_OPTIONS}
        value={draft.statuses}
        onChange={(statuses) =>
          setDraft((current) => ({ ...current, statuses: statuses as TasksFilters['statuses'] }))
        }
      />
      <FilterMultiSelect
        label="Priority"
        options={TASK_PRIORITY_OPTIONS}
        value={draft.priorities}
        onChange={(priorities) =>
          setDraft((current) => ({ ...current, priorities: priorities as TasksFilters['priorities'] }))
        }
      />
      <FilterMultiSelect
        label="Reference type"
        options={TASK_REFERENCE_TYPE_OPTIONS}
        value={draft.referenceTypes}
        onChange={(referenceTypes) =>
          setDraft((current) => ({
            ...current,
            referenceTypes: referenceTypes as TasksFilters['referenceTypes'],
          }))
        }
      />
      <FilterPresetField
        label="Due date"
        preset={draft.dueDatePreset}
        start={draft.dueDateStart}
        end={draft.dueDateEnd}
        presetOptions={TASKS_DUE_DATE_PRESET_OPTIONS}
        onPresetChange={(dueDatePreset) =>
          setDraft((current) => ({
            ...current,
            dueDatePreset: dueDatePreset as DueDatePreset,
            dueDateStart: dueDatePreset === 'custom' ? current.dueDateStart : '',
            dueDateEnd: dueDatePreset === 'custom' ? current.dueDateEnd : '',
          }))
        }
        onStartChange={(dueDateStart) => setDraft((current) => ({ ...current, dueDateStart }))}
        onEndChange={(dueDateEnd) => setDraft((current) => ({ ...current, dueDateEnd }))}
      />
      <FilterPresetField
        label="Aging"
        preset={draft.agingPreset}
        start={draft.agingStart}
        end={draft.agingEnd}
        presetOptions={TASKS_AGING_PRESET_OPTIONS}
        customRange="number"
        onPresetChange={(agingPreset) =>
          setDraft((current) => ({
            ...current,
            agingPreset: agingPreset as AgingPreset,
            agingStart: agingPreset === 'custom' ? current.agingStart : '',
            agingEnd: agingPreset === 'custom' ? current.agingEnd : '',
          }))
        }
        onStartChange={(agingStart) => setDraft((current) => ({ ...current, agingStart }))}
        onEndChange={(agingEnd) => setDraft((current) => ({ ...current, agingEnd }))}
      />
    </FilterPanelShell>
  )
}

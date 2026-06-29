import type { TaskPriority, TaskReferenceType, TaskStatus } from '@/pages/tasks/data/mockTasks'
import { tasksMock } from '@/pages/tasks/data/mockTasks'
import type { PresetOption } from '@/design-system/filters/listFilterTypes'

export type DueDatePreset = '' | 'today' | 'this-week' | 'past-due' | 'custom'
export type AgingPreset = '' | '0-3' | '4-7' | '8-14' | '15-30' | 'over-30' | 'custom'

export type TasksFilters = {
  assignedTo: string[]
  statuses: TaskStatus[]
  priorities: TaskPriority[]
  referenceTypes: TaskReferenceType[]
  dueDatePreset: DueDatePreset
  dueDateStart: string
  dueDateEnd: string
  agingPreset: AgingPreset
  agingStart: string
  agingEnd: string
}

export const emptyTasksFilters: TasksFilters = {
  assignedTo: [],
  statuses: [],
  priorities: [],
  referenceTypes: [],
  dueDatePreset: '',
  dueDateStart: '',
  dueDateEnd: '',
  agingPreset: '',
  agingStart: '',
  agingEnd: '',
}

export function hasActiveTasksFilters(filters: TasksFilters) {
  return (
    filters.assignedTo.length > 0 ||
    filters.statuses.length > 0 ||
    filters.priorities.length > 0 ||
    filters.referenceTypes.length > 0 ||
    filters.dueDatePreset !== '' ||
    filters.agingPreset !== ''
  )
}

export const TASK_ASSIGNED_TO_OPTIONS = [
  ...new Set(tasksMock.map((task) => task.assignedTo)),
].sort((a, b) => a.localeCompare(b))

export const TASK_STATUS_OPTIONS: TaskStatus[] = [
  'Pending',
  'Started',
  'Suspended',
  'Discarded',
  'Completed',
  'Unassigned',
]

export const TASK_PRIORITY_OPTIONS: TaskPriority[] = ['High', 'Medium', 'Low']

export const TASK_REFERENCE_TYPE_OPTIONS: TaskReferenceType[] = ['Quote', 'Policy', 'Claim']

export const TASKS_DUE_DATE_PRESET_OPTIONS: PresetOption[] = [
  { value: '', label: 'Select' },
  { value: 'today', label: 'Today' },
  { value: 'this-week', label: 'This week' },
  { value: 'past-due', label: 'Past due' },
  { value: 'custom', label: 'Custom range' },
]

export const TASKS_AGING_PRESET_OPTIONS: PresetOption[] = [
  { value: '', label: 'Select' },
  { value: '0-3', label: '0-3 days' },
  { value: '4-7', label: '4-7 days' },
  { value: '8-14', label: '8-14 days' },
  { value: '15-30', label: '15-30 days' },
  { value: 'over-30', label: 'Over 30 days' },
  { value: 'custom', label: 'Custom range' },
]

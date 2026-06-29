import type { Theme } from '@mui/material/styles'
import type { StatusChipProps } from '@/design-system/components'
import type { TaskRecord } from '@/pages/tasks/data/mockTasks'

/**
 * Approved status → chip variant mapping (design system).
 * info = blue (in progress/active), warning = amber (pending/due soon),
 * error = red (exception/failed), success = green, default = neutral gray.
 */
export const TASK_DISPLAY_STATUS_VARIANTS: Record<string, StatusChipProps['status']> = {
  'In review': 'info',
  'In progress': 'info',
  Scheduled: 'info',
  'Pending documents': 'warning',
  'Pending insured': 'warning',
  Open: 'default',
  'Waiting on internal': 'default',
  Exception: 'error',
  Failed: 'error',
  Completed: 'success',
}

export function getTaskStatusChipVariant(displayStatus: string): StatusChipProps['status'] {
  const mapped = TASK_DISPLAY_STATUS_VARIANTS[displayStatus]
  if (mapped) return mapped

  const normalized = displayStatus.toLowerCase()
  if (normalized.includes('fail') || normalized.includes('exception') || normalized.includes('blocked')) {
    return 'error'
  }
  if (normalized.includes('complete')) {
    return 'success'
  }
  if (normalized.includes('progress') || normalized.includes('review') || normalized.includes('scheduled')) {
    return 'info'
  }
  if (normalized.includes('pending') || normalized.includes('due soon')) {
    return 'warning'
  }
  return 'default'
}

export function getTaskPriorityChipVariant(priority: TaskRecord['priority']): StatusChipProps['status'] {
  if (priority === 'High') return 'error'
  if (priority === 'Medium') return 'warning'
  return 'default'
}

/** Dot color aligned with StatusChip palette for the same priority. */
export function getPriorityIndicatorColor(theme: Theme, priority: TaskRecord['priority']) {
  const variant = getTaskPriorityChipVariant(priority)
  if (variant === 'error') return theme.figmaPalette.red[500]
  if (variant === 'warning') return theme.figmaPalette.amber[600]
  if (variant === 'success') return theme.figmaPalette.green[700]
  return theme.figmaPalette.grey[500]
}

export function getTaskDocumentChipVariant(status: string): StatusChipProps['status'] {
  const normalized = status.toLowerCase()
  if (normalized.includes('missing')) return 'warning'
  if (normalized.includes('received') || normalized.includes('complete')) return 'success'
  return 'default'
}

export function getTaskSlaTone(task: TaskRecord) {
  if (task.isPastDue || task.ageIndicator.toLowerCase().includes('past due')) {
    return 'error.main' as const
  }
  if (
    task.ageIndicator.toLowerCase().includes('today') ||
    task.ageIndicator.toLowerCase().includes('sla')
  ) {
    return 'warning.main' as const
  }
  return 'text.primary' as const
}

export function isTaskSlaUrgent(task: TaskRecord) {
  return getTaskSlaTone(task) !== 'text.primary'
}

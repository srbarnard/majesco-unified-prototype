import type { Theme } from '@mui/material/styles'
import type { StatusChipProps } from '@/design-system/components'
import type { TaskDocument, TaskDocumentType, TaskRecord } from '@/pages/tasks/data/mockTasks'

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
  return 'info'
}

/** Dot color aligned with StatusChip palette for the same priority. */
export function getPriorityIndicatorColor(theme: Theme, priority: TaskRecord['priority']) {
  const variant = getTaskPriorityChipVariant(priority)
  if (variant === 'error') return theme.figmaPalette.red[500]
  if (variant === 'warning') return theme.figmaPalette.amber[600]
  if (variant === 'success') return theme.figmaPalette.green[700]
  if (variant === 'info') {
    // Match priority task cards (`AnalyticsSurfaceTone` info `.value`)
    return theme.palette.mode === 'dark'
      ? theme.figmaPalette.lightBlue[200]
      : theme.figmaPalette.lightBlue[900]
  }
  return theme.figmaPalette.grey[500]
}

export function getTaskDocumentChipVariant(status: string): StatusChipProps['status'] {
  const normalized = status.toLowerCase()
  if (normalized.includes('missing')) return 'warning'
  if (normalized.includes('received') || normalized.includes('complete')) return 'success'
  if (normalized.includes('not required') || normalized.includes('optional')) return 'info'
  return 'default'
}

export function resolveTaskDocumentType(document: Pick<TaskDocument, 'name' | 'type'>): TaskDocumentType {
  if (document.type) return document.type
  const name = document.name.toLowerCase()
  if (/\b(photo|image|jpg|png)\b/.test(name)) return 'image'
  if (/\b(xlsx|xls|csv|payroll|worksheet|schedule|sov)\b/.test(name)) return 'spreadsheet'
  if (/\b(email|correspondence|thread)\b/.test(name)) return 'email'
  if (/\b(package|bundle|packet)\b/.test(name)) return 'package'
  if (/\b(acord|form|application|authorization|clearance|memo)\b/.test(name)) return 'form'
  return 'pdf'
}

/** File extension label for attachment chips (e.g. PDF, ZIP, XLSX). */
export function getTaskDocumentExtension(document: Pick<TaskDocument, 'name' | 'type'>): string {
  switch (resolveTaskDocumentType(document)) {
    case 'spreadsheet':
      return 'XLSX'
    case 'image':
      return 'JPG'
    case 'package':
      return 'ZIP'
    case 'email':
      return 'EML'
    case 'form':
    case 'pdf':
    default:
      return 'PDF'
  }
}

export function formatTaskDocumentChipLabel(document: Pick<TaskDocument, 'name' | 'type'>): string {
  return `${document.name} ∙ ${getTaskDocumentExtension(document)}`
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

import type { TaskRecord } from '@/pages/tasks/data/mockTasks'
import type { AgingPreset, DueDatePreset, TasksFilters } from '@/pages/tasks/filters/tasksFilterTypes'

function startOfDay(date: Date) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

function endOfDay(date: Date) {
  const next = new Date(date)
  next.setHours(23, 59, 59, 999)
  return next
}

function parseIsoDate(value: string) {
  return startOfDay(new Date(value))
}

function matchesDueDatePreset(
  dueDate: string,
  preset: DueDatePreset,
  start: string,
  end: string,
  referenceDate: Date,
) {
  if (!preset) return true

  const due = parseIsoDate(dueDate)
  const today = startOfDay(referenceDate)

  if (preset === 'today') {
    return due.getTime() === today.getTime()
  }

  if (preset === 'past-due') {
    return due.getTime() < today.getTime()
  }

  if (preset === 'this-week') {
    const day = today.getDay()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - day)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    return due >= startOfDay(weekStart) && due <= endOfDay(weekEnd)
  }

  if (preset === 'custom') {
    if (start && due < parseIsoDate(start)) return false
    if (end && due > endOfDay(parseIsoDate(end))) return false
    return Boolean(start || end)
  }

  return true
}

function matchesAgingPreset(
  agingDays: number,
  preset: AgingPreset,
  start: string,
  end: string,
) {
  if (!preset) return true

  if (preset === '0-3') return agingDays <= 3
  if (preset === '4-7') return agingDays >= 4 && agingDays <= 7
  if (preset === '8-14') return agingDays >= 8 && agingDays <= 14
  if (preset === '15-30') return agingDays >= 15 && agingDays <= 30
  if (preset === 'over-30') return agingDays > 30

  if (preset === 'custom') {
    const min = start ? Number(start) : undefined
    const max = end ? Number(end) : undefined
    if (min !== undefined && agingDays < min) return false
    if (max !== undefined && agingDays > max) return false
    return Boolean(start || end)
  }

  return true
}

export function applyTasksFilters(
  rows: TaskRecord[],
  filters: TasksFilters,
  referenceDate = new Date('2026-06-26'),
) {
  return rows.filter((row) => {
    if (filters.assignedTo.length > 0 && !filters.assignedTo.includes(row.assignedTo)) {
      return false
    }

    if (filters.statuses.length > 0 && !filters.statuses.includes(row.status)) {
      return false
    }

    if (filters.priorities.length > 0 && !filters.priorities.includes(row.priority)) {
      return false
    }

    if (filters.referenceTypes.length > 0 && !filters.referenceTypes.includes(row.referenceType)) {
      return false
    }

    if (
      !matchesDueDatePreset(
        row.dueDate,
        filters.dueDatePreset,
        filters.dueDateStart,
        filters.dueDateEnd,
        referenceDate,
      )
    ) {
      return false
    }

    if (
      !matchesAgingPreset(
        row.agingDays,
        filters.agingPreset,
        filters.agingStart,
        filters.agingEnd,
      )
    ) {
      return false
    }

    return true
  })
}

export function countTasksByAssignedTo(rows: TaskRecord[]) {
  const counts = new Map<string, number>()
  for (const row of rows) {
    counts.set(row.assignedTo, (counts.get(row.assignedTo) ?? 0) + 1)
  }
  return counts
}

export function countTasksByStatus(rows: TaskRecord[]) {
  const counts = new Map<string, number>()
  for (const row of rows) {
    counts.set(row.status, (counts.get(row.status) ?? 0) + 1)
  }
  return counts
}

export function countTasksByPriority(rows: TaskRecord[]) {
  const counts = new Map<string, number>()
  for (const row of rows) {
    counts.set(row.priority, (counts.get(row.priority) ?? 0) + 1)
  }
  return counts
}

export function countTasksByReferenceType(rows: TaskRecord[]) {
  const counts = new Map<string, number>()
  for (const row of rows) {
    counts.set(row.referenceType, (counts.get(row.referenceType) ?? 0) + 1)
  }
  return counts
}

export function countDueDatePresets(rows: TaskRecord[], referenceDate = new Date('2026-06-26')) {
  let today = 0
  let thisWeek = 0
  let pastDue = 0

  for (const row of rows) {
    if (matchesDueDatePreset(row.dueDate, 'today', '', '', referenceDate)) today += 1
    if (matchesDueDatePreset(row.dueDate, 'this-week', '', '', referenceDate)) thisWeek += 1
    if (matchesDueDatePreset(row.dueDate, 'past-due', '', '', referenceDate)) pastDue += 1
  }

  return { today, thisWeek, pastDue }
}

export function countAgingPresets(rows: TaskRecord[]) {
  let days0to3 = 0
  let days4to7 = 0
  let days8to14 = 0
  let days15to30 = 0
  let over30 = 0

  for (const row of rows) {
    if (matchesAgingPreset(row.agingDays, '0-3', '', '')) days0to3 += 1
    if (matchesAgingPreset(row.agingDays, '4-7', '', '')) days4to7 += 1
    if (matchesAgingPreset(row.agingDays, '8-14', '', '')) days8to14 += 1
    if (matchesAgingPreset(row.agingDays, '15-30', '', '')) days15to30 += 1
    if (matchesAgingPreset(row.agingDays, 'over-30', '', '')) over30 += 1
  }

  return { days0to3, days4to7, days8to14, days15to30, over30 }
}

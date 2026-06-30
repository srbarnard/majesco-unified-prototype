import type { PolicyDocument } from '@/pages/policies/data/mockDocuments'
import type { DocumentsFilters } from '@/pages/policies/filters/documentsFilterTypes'

function startOfDay(date: Date) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

function parseDate(value: string) {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : startOfDay(parsed)
}

function matchesDocumentDatePreset(
  value: string,
  preset: DocumentsFilters['datePreset'],
  customStart: string,
  customEnd: string,
  referenceDate = new Date(),
) {
  if (!preset) return true

  const target = parseDate(value)
  if (!target) return false

  const today = startOfDay(referenceDate)

  if (preset === 'today') {
    return target.getTime() === today.getTime()
  }

  if (preset === 'last-7-days') {
    const start = new Date(today)
    start.setDate(start.getDate() - 7)
    return target >= start && target <= today
  }

  if (preset === 'last-30-days') {
    const start = new Date(today)
    start.setDate(start.getDate() - 30)
    return target >= start && target <= today
  }

  if (preset === 'custom') {
    const start = customStart ? parseDate(customStart) : null
    const end = customEnd ? parseDate(customEnd) : null
    if (!start && !end) return true
    if (start && target < start) return false
    if (end && target > end) return false
    return true
  }

  return true
}

export function applyDocumentsFilters(
  rows: PolicyDocument[],
  filters: DocumentsFilters,
  referenceDate = new Date(),
) {
  return rows.filter((row) => {
    if (filters.tags.length > 0 && !row.tags.some((tag) => filters.tags.includes(tag))) {
      return false
    }

    if (filters.authors.length > 0 && !filters.authors.includes(row.author)) {
      return false
    }

    if (filters.kinds.length > 0 && !filters.kinds.includes(row.kind)) {
      return false
    }

    if (filters.activityLabels.length > 0 && !filters.activityLabels.includes(row.activityLabel)) {
      return false
    }

    if (
      !matchesDocumentDatePreset(
        row.date,
        filters.datePreset,
        filters.dateStart,
        filters.dateEnd,
        referenceDate,
      )
    ) {
      return false
    }

    return true
  })
}

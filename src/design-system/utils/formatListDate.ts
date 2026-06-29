const DEFAULT_REFERENCE = new Date('2026-06-26T12:00:00')

function startOfDay(date: Date) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

/** MM/DD/YYYY — same format used on Policies and Quotes list tables. */
export function formatListDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  })
}

export function formatRelativeListDate(value: string, referenceDate: Date = DEFAULT_REFERENCE) {
  const date = startOfDay(new Date(value))
  const today = startOfDay(referenceDate)
  const dayDiff = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (dayDiff === 0) return 'Today'
  if (dayDiff === 1) return 'Tomorrow'
  if (dayDiff === -1) return 'Yesterday'

  return formatListDate(value)
}

export function formatTaskDueDate(value: string, referenceDate: Date = DEFAULT_REFERENCE) {
  const date = startOfDay(new Date(value))
  const today = startOfDay(referenceDate)

  if (date.getTime() < today.getTime()) {
    return 'Past due'
  }

  return formatRelativeListDate(value, referenceDate)
}

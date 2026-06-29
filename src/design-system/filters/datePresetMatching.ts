import type { EffectiveDatePreset } from '@/design-system/filters/listFilterTypes'

function startOfDay(date: Date) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

function parseDate(value: string) {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : startOfDay(parsed)
}

export function matchesEffectiveDatePreset(
  value: string,
  preset: EffectiveDatePreset,
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

  if (preset === 'next-7-days') {
    const end = new Date(today)
    end.setDate(end.getDate() + 7)
    return target >= today && target <= end
  }

  if (preset === 'next-30-days') {
    const end = new Date(today)
    end.setDate(end.getDate() + 30)
    return target >= today && target <= end
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

export function matchesUpdatedDatePreset(
  value: string,
  preset: string,
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

  if (preset === 'yesterday') {
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    return target.getTime() === yesterday.getTime()
  }

  if (preset === '2-days-ago') {
    const twoDaysAgo = new Date(today)
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
    return target.getTime() === twoDaysAgo.getTime()
  }

  if (preset === 'next-7-days') {
    const end = new Date(today)
    end.setDate(end.getDate() + 7)
    return target >= today && target <= end
  }

  if (preset === 'next-30-days') {
    const end = new Date(today)
    end.setDate(end.getDate() + 30)
    return target >= today && target <= end
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

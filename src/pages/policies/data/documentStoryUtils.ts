import type { DocumentStoryHighlight } from '@/pages/policies/components/DocumentStoryCard'
import type { PolicyDocument } from '@/pages/policies/data/mockDocuments'

export type DocumentStoryStats = {
  totalDocuments: number
  visibleDocuments: number
  addedThisMonth: number
  updatedThisWeek: number
  lastActivityRelative: string
  endorsementCount: number
  renewalCount: number
}

function parseDocumentDate(value: string) {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function sortByDateDesc(documents: PolicyDocument[]) {
  return [...documents].sort((a, b) => {
    const aDate = parseDocumentDate(a.date)?.getTime() ?? 0
    const bDate = parseDocumentDate(b.date)?.getTime() ?? 0
    return bDate - aDate
  })
}

function formatHighlightDate(value: string) {
  const parsed = parseDocumentDate(value)
  if (!parsed) return value
  return parsed.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })
}

function isWithinDays(value: string, days: number, referenceDate = new Date()) {
  const parsed = parseDocumentDate(value)
  if (!parsed) return false
  const start = new Date(referenceDate)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - days)
  return parsed >= start
}

function isWithinCurrentMonth(value: string, referenceDate = new Date()) {
  const parsed = parseDocumentDate(value)
  if (!parsed) return false
  return (
    parsed.getFullYear() === referenceDate.getFullYear() &&
    parsed.getMonth() === referenceDate.getMonth()
  )
}

export function buildDocumentStoryStats(
  allDocuments: PolicyDocument[],
  visibleDocuments: PolicyDocument[],
  referenceDate = new Date(),
): DocumentStoryStats {
  const sorted = sortByDateDesc(allDocuments)
  const latest = sorted[0]

  return {
    totalDocuments: allDocuments.length,
    visibleDocuments: visibleDocuments.length,
    addedThisMonth: allDocuments.filter((doc) => isWithinCurrentMonth(doc.date, referenceDate)).length,
    updatedThisWeek: allDocuments.filter((doc) => isWithinDays(doc.date, 7, referenceDate)).length,
    lastActivityRelative: latest?.relativeTime ?? '—',
    endorsementCount: allDocuments.filter((doc) => doc.activityLabel === 'Endorsement').length,
    renewalCount: allDocuments.filter((doc) => doc.tags.some((tag) => tag.includes('Renewal'))).length,
  }
}

export function buildDocumentStorySummary(
  documents: PolicyDocument[],
  fallbackSummary: string,
  referenceDate = new Date(),
): string {
  if (documents.length === 0) {
    return 'No documents match the current filters. Adjust search or filters to view document history.'
  }

  const sorted = sortByDateDesc(documents)
  const latest = sorted[0]
  const recentCount = documents.filter((doc) => isWithinDays(doc.date, 30, referenceDate)).length
  const activityAreas = [...new Set(sorted.slice(0, 8).map((doc) => doc.activityLabel))].slice(0, 4)

  if (documents.length <= 6) {
    return fallbackSummary
  }

  const latestDate = parseDocumentDate(latest.date)
  const formattedLatestDate = latestDate
    ? latestDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
    : latest.date

  return `This policy has ${documents.length} documents on file. The most recent activity was ${latest.kind.toLowerCase()} "${latest.name}" on ${formattedLatestDate}. In the last 30 days, ${recentCount} document${recentCount === 1 ? '' : 's'} were added or updated across ${activityAreas.join(', ').toLowerCase()} activity.`
}

export function buildDocumentStoryHighlights(
  documents: PolicyDocument[],
  limit = 5,
): DocumentStoryHighlight[] {
  return sortByDateDesc(documents).slice(0, limit).map((doc) => ({
    label: doc.aiSummary.length > 72 ? `${doc.aiSummary.slice(0, 69)}…` : doc.aiSummary,
    date: formatHighlightDate(doc.date),
  }))
}

export function remainingHighlightCount(documents: PolicyDocument[], limit = 5) {
  return Math.max(0, documents.length - limit)
}

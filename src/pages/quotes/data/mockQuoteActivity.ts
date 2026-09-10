import type { RecentActivityItem } from '@/app/data/homeMock'
import { getActivityTypeChipStatus } from '@/app/pages/home/activityVisuals'
import type { QuoteDetailsRecord } from '@/pages/quotes/data/mockQuoteDetails'

type QuoteActivitySource = Pick<
  QuoteDetailsRecord,
  'id' | 'quoteNumber' | 'insuredName' | 'status' | 'premium' | 'producer' | 'underwriter' | 'version' | 'product'
>

function quoteHref(quoteNumber: string) {
  return `/quotes/${encodeURIComponent(quoteNumber)}`
}

function documentsHref(quoteNumber: string) {
  return `/quotes/${encodeURIComponent(quoteNumber)}?tab=documents`
}

export function quoteActivitySubtitle(item: RecentActivityItem) {
  if (item.status) return `${item.detail} · ${item.status}`
  return item.detail
}

/**
 * Record-scoped activity for the Quote Overview activity rail.
 * Uses Home ActivityRail day stamps (Today / Yesterday) so groups render.
 */
export function getQuoteActivity(quote: QuoteActivitySource): RecentActivityItem[] {
  const href = quoteHref(quote.quoteNumber)
  const docsHref = documentsHref(quote.quoteNumber)
  const underwriter = `${quote.underwriter} · Underwriting`

  return [
    {
      id: `${quote.id}-act-rated`,
      kind: 'quote',
      label: 'Quote rated',
      detail: `${quote.version} · ${quote.premium}`,
      timestamp: 'Today · 11:20 AM',
      referenceId: quote.quoteNumber,
      status: quote.status,
      statusVariant: getActivityTypeChipStatus('quote'),
      performedBy: underwriter,
      insuredName: quote.insuredName,
      quoteNumber: quote.quoteNumber,
      summary: `${quote.quoteNumber} was rated to ${quote.version} at ${quote.premium} for ${quote.insuredName}.`,
      fields: [
        { label: 'Quote', value: quote.quoteNumber },
        { label: 'Product', value: quote.product },
        { label: 'Premium', value: quote.premium },
        { label: 'Version', value: quote.version },
      ],
      insights: ['Coverage mix is ready for producer presentment after the latest rating pass.'],
      primaryLink: { label: 'View quote', to: href },
      secondaryLink: { label: 'View documents', to: docsHref },
    },
    {
      id: `${quote.id}-act-exception`,
      kind: 'task',
      label: 'VIN decode exception',
      detail: 'Trim mismatch flagged on 1 scheduled unit',
      timestamp: 'Today · 9:48 AM',
      referenceId: `EXC-${quote.quoteNumber}`,
      status: 'Open',
      statusVariant: 'warning',
      performedBy: 'Rating · Automated',
      insuredName: quote.insuredName,
      quoteNumber: quote.quoteNumber,
      summary: `A VIN decode exception remains open on ${quote.quoteNumber} — trim mismatch on one scheduled vehicle.`,
      fields: [
        { label: 'Task name', value: 'Resolve VIN exception' },
        { label: 'Quote', value: quote.quoteNumber },
        { label: 'Severity', value: 'Blocking presentment' },
        { label: 'Owner', value: quote.underwriter },
      ],
      insights: ['Clear the VIN exception before releasing the proposal package.'],
      primaryLink: { label: 'View quote', to: href },
      secondaryLink: { label: 'View documents', to: docsHref },
    },
    {
      id: `${quote.id}-act-docs`,
      kind: 'document',
      label: 'Rating worksheet attached',
      detail: 'Producer portal upload · commercial auto schedule',
      timestamp: 'Yesterday · 4:15 PM',
      referenceId: `DOC-${quote.quoteNumber}`,
      status: 'Attached',
      statusVariant: getActivityTypeChipStatus('document'),
      performedBy: `${quote.producer} · Producer`,
      insuredName: quote.insuredName,
      quoteNumber: quote.quoteNumber,
      summary: `A rating worksheet was attached to ${quote.quoteNumber} from the producer portal.`,
      fields: [
        { label: 'Document', value: 'Rating worksheet' },
        { label: 'Quote', value: quote.quoteNumber },
        { label: 'Source', value: 'Producer portal' },
        { label: 'Uploaded by', value: quote.producer },
      ],
      insights: ['Latest schedule supports the v3 rated premium.'],
      primaryLink: { label: 'View documents', to: docsHref },
      secondaryLink: { label: 'View quote', to: href },
    },
    {
      id: `${quote.id}-act-referral`,
      kind: 'task',
      label: 'Out-of-state garaging referral',
      detail: '2 units garaged in OR — UW review',
      timestamp: 'Yesterday · 1:02 PM',
      referenceId: `REF-${quote.quoteNumber}`,
      status: 'In review',
      statusVariant: 'info',
      performedBy: underwriter,
      insuredName: quote.insuredName,
      quoteNumber: quote.quoteNumber,
      summary: `Referral opened on ${quote.quoteNumber} for two Oregon-garaged units outside the primary CA territory.`,
      fields: [
        { label: 'Task name', value: 'Review out-of-state garaging' },
        { label: 'Quote', value: quote.quoteNumber },
        { label: 'Units', value: '2 · Oregon' },
        { label: 'Assignee', value: quote.underwriter },
      ],
      insights: ['Confirm territory factors before binding authority is released.'],
      primaryLink: { label: 'View quote', to: href },
      secondaryLink: { label: 'View documents', to: docsHref },
    },
  ]
}

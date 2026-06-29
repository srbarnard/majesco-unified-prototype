import { quotesMock } from '@/pages/quotes/data/mockQuotes'
import {
  quoteDetailsMock,
  quoteOverviewStatsMock,
  quoteUnderwritingNotesMock,
  type QuoteDetailsRecord,
} from '@/pages/quotes/data/mockQuoteDetails'

function formatPremium(value: number) {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`
  }
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

function formatQuoteDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function resolveQuoteContext(quoteId: string | undefined): QuoteDetailsRecord {
  if (!quoteId || decodeURIComponent(quoteId) === quoteDetailsMock.quoteNumber) {
    return quoteDetailsMock
  }

  const decoded = decodeURIComponent(quoteId)
  const fromList = quotesMock.find((row) => row.quoteNumber === decoded || row.id === decoded)

  if (fromList) {
    return {
      ...quoteDetailsMock,
      id: fromList.quoteNumber,
      quoteNumber: fromList.quoteNumber,
      insuredName: fromList.insured,
      status: fromList.status,
      product: fromList.products.join(' · '),
      effectiveDate: formatQuoteDate(fromList.effectiveDate),
      premium: formatPremium(fromList.premium),
      producer: fromList.producer,
      version: `v1 — ${fromList.status}`,
      copilotSummary: `Quote **${fromList.quoteNumber}** for **${fromList.insured}** is **${fromList.status}** with a quoted premium of **${formatPremium(fromList.premium)}** effective **${formatQuoteDate(fromList.effectiveDate)}**.`,
      copilotInsights: [
        `${fromList.status} · ${fromList.products.join(', ')}`,
        `Producer: ${fromList.producer}`,
        `Last updated ${fromList.updatedLabel}`,
      ],
    }
  }

  return {
    ...quoteDetailsMock,
    id: decoded,
    quoteNumber: decoded,
    insuredName: 'Sample Insured',
    copilotSummary: `Placeholder quote record for **${decoded}**.`,
    copilotInsights: ['Sample quote context for prototype navigation'],
  }
}

export function getQuoteOverviewStats(quote: QuoteDetailsRecord) {
  if (quote.quoteNumber === quoteDetailsMock.quoteNumber) {
    return quoteOverviewStatsMock
  }

  return quoteOverviewStatsMock.map((stat) => {
    if (stat.id === 'premium') return { ...stat, value: quote.premium }
    if (stat.id === 'product') return { ...stat, value: quote.product.split(' ')[0] ?? quote.product }
    if (stat.id === 'effective') {
      const short = quote.effectiveDate.replace(/,\s*\d{4}$/, '')
      return { ...stat, value: short.split(' ').slice(0, 2).join(' ') }
    }
    return stat
  })
}

export function getQuoteUnderwritingNotes(quote: QuoteDetailsRecord) {
  if (quote.quoteNumber === quoteDetailsMock.quoteNumber) {
    return quoteUnderwritingNotesMock
  }

  return [`Underwriting notes for ${quote.quoteNumber} will appear here.`]
}

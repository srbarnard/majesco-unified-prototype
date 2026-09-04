import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useGridApiRef } from '@mui/x-data-grid-premium'
import { useCallback, useMemo, useState } from 'react'
import { useRightTool } from '@/app/contexts/RightToolContext'
import {
  useRegisterRightToolCopilot,
  useRegisterRightToolFilter,
} from '@/app/hooks/useRightToolRegistration'
import { ListDataGridToolbar } from '@/design-system/components'
import { layoutTokens } from '@/design-system/tokens/layout'
import { listPageContentOverflowSx } from '@/design-system/tokens/tableLayout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { useQuotesLookupFromUrl } from '@/hooks/useLookupFromUrl'
import { useSearchQueryFromUrl } from '@/hooks/useSearchQueryFromUrl'
import { QuotesAnalyticsTab } from '@/pages/quotes/components/QuotesAnalyticsTab'
import { QuotesDataGrid } from '@/pages/quotes/components/QuotesDataGrid'
import { QuotesFilterPanel } from '@/pages/quotes/components/QuotesFilterPanel'
import { QuotesHeader } from '@/pages/quotes/components/QuotesHeader'
import type { QuotesTab } from '@/pages/quotes/components/QuotesTabs'
import { QUOTES_TOTAL_ROWS, quotesMock, type Quote } from '@/pages/quotes/data/mockQuotes'
import { applyQuotesListFilters } from '@/pages/quotes/filters/applyQuotesListFilters'
import {
  emptyQuotesListFilters,
  hasActiveQuotesFilters,
  type QuotesListFilters,
} from '@/pages/quotes/filters/quotesListFilterTypes'

const LIST_SECTION_GAP = layoutTokens.listSectionVerticalGap

function matchesSearch(row: Quote, query: string) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true

  const fields = [row.quoteNumber, row.insured, row.producer, row.status, row.updatedLabel, ...row.products]
  return fields.some((value) => value.toLowerCase().includes(normalized))
}

export function QuotesPage() {
  const apiRef = useGridApiRef()
  const { activeTool, openTool, closeTool } = useRightTool()
  const [activeTab, setActiveTab] = useState<QuotesTab>('all')
  const [copilotQuoteFocus, setCopilotQuoteFocus] = useState<Quote | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [appliedFilters, setAppliedFilters] = useState<QuotesListFilters>(emptyQuotesListFilters)

  const handleLookupApplied = useCallback(() => {
    openTool('filter')
    setCopilotQuoteFocus(null)
  }, [openTool])

  useQuotesLookupFromUrl(setAppliedFilters, handleLookupApplied)

  useSearchQueryFromUrl(useCallback((query) => {
    setSearchQuery(query)
  }, []))

  const filteredRows = useMemo(() => {
    const withFilters = applyQuotesListFilters(quotesMock, appliedFilters)
    return withFilters.filter((row) => matchesSearch(row, searchQuery))
  }, [appliedFilters, searchQuery])

  const filtersActive = hasActiveQuotesFilters(appliedFilters)

  useRegisterRightToolCopilot(
    {
      context: 'quotes',
      focusedQuote: copilotQuoteFocus,
      onBackToSummary: copilotQuoteFocus ? () => setCopilotQuoteFocus(null) : undefined,
      summaryBackLabel: 'Quotes workspace',
    },
    [copilotQuoteFocus],
  )

  const handleApplyFilters = useCallback((filters: QuotesListFilters) => {
    setAppliedFilters(filters)
  }, [])

  useRegisterRightToolFilter(
    activeTab === 'all' ? (
      <QuotesFilterPanel
        appliedFilters={appliedFilters}
        onApply={handleApplyFilters}
        onClose={closeTool}
      />
    ) : null,
    [activeTab, appliedFilters, handleApplyFilters, closeTool],
  )

  const handleQuoteCopilot = useCallback(
    (quote: Quote) => {
      setCopilotQuoteFocus(quote)
      openTool('copilot')
    },
    [openTool],
  )

  const handleTabChange = useCallback(
    (tab: QuotesTab) => {
      setActiveTab(tab)
      if (tab === 'analytics') {
        closeTool()
        setCopilotQuoteFocus(null)
      }
    },
    [closeTool],
  )

  const isAllQuotesTab = activeTab === 'all'
  const contentPx = `${layoutTokens.contentPaddingX}px`
  const activeCopilotQuoteId =
    activeTool === 'copilot' && copilotQuoteFocus ? copilotQuoteFocus.id : null

  return (
    <Box
      sx={{
        display: 'flex',
        flex: 1,
        minHeight: 0,
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ flexShrink: 0 }}>
          <QuotesHeader activeTab={activeTab} onTabChange={handleTabChange} />
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            ...listPageContentOverflowSx(isAllQuotesTab),
            px: contentPx,
            pt: LIST_SECTION_GAP,
            pb: contentPx,
            width: '100%',
            bgcolor: 'background.paper',
          }}
        >
          {isAllQuotesTab ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                minHeight: 0,
                width: '100%',
                gap: LIST_SECTION_GAP,
              }}
            >
              <Box sx={{ flexShrink: 0 }}>
                <ListDataGridToolbar
                  apiRef={apiRef}
                  exportFileName="quotes"
                  exportAriaLabel="Download quotes"
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  searchPlaceholder="Search quotes"
                />
              </Box>
              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                <QuotesDataGrid
                  apiRef={apiRef}
                  rows={filteredRows}
                  onQuoteCopilot={handleQuoteCopilot}
                  activeCopilotQuoteId={activeCopilotQuoteId}
                />
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontFamily: figmaFontFamilyStack.body, textAlign: 'right', flexShrink: 0 }}
              >
                Total Rows: {filtersActive || searchQuery.trim() ? filteredRows.length : QUOTES_TOTAL_ROWS}
              </Typography>
            </Box>
          ) : (
            <QuotesAnalyticsTab />
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default QuotesPage

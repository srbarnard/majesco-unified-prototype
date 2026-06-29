import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useGridApiRef } from '@mui/x-data-grid-premium'
import { useCallback, useMemo, useState } from 'react'
import { ListDataGridToolbar } from '@/design-system/components'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { useQuotesLookupFromUrl } from '@/hooks/useLookupFromUrl'
import { CopilotPanel } from '@/pages/policies/components/CopilotPanel'
import { ResizableRightPanel } from '@/pages/policies/components/ResizableRightPanel'
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
  const [activeTab, setActiveTab] = useState<QuotesTab>('all')
  const [copilotOpen, setCopilotOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [copilotQuoteFocus, setCopilotQuoteFocus] = useState<Quote | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [appliedFilters, setAppliedFilters] = useState<QuotesListFilters>(emptyQuotesListFilters)

  useQuotesLookupFromUrl(setAppliedFilters, useCallback(() => {
    setFilterOpen(true)
    setCopilotOpen(false)
    setCopilotQuoteFocus(null)
  }, []))

  const filteredRows = useMemo(() => {
    const withFilters = applyQuotesListFilters(quotesMock, appliedFilters)
    return withFilters.filter((row) => matchesSearch(row, searchQuery))
  }, [appliedFilters, searchQuery])

  const filtersActive = hasActiveQuotesFilters(appliedFilters)

  const handleToggleFilter = useCallback(() => {
    setFilterOpen((current) => {
      if (!current) {
        setCopilotOpen(false)
        setCopilotQuoteFocus(null)
      }
      return !current
    })
  }, [])

  const handleCloseFilter = useCallback(() => {
    setFilterOpen(false)
  }, [])

  const handleApplyFilters = useCallback((filters: QuotesListFilters) => {
    setAppliedFilters(filters)
  }, [])

  const handleToggleCopilot = useCallback(() => {
    setCopilotOpen((current) => {
      if (current) {
        setCopilotQuoteFocus(null)
        return false
      }
      setFilterOpen(false)
      return true
    })
  }, [])

  const handleCloseCopilot = useCallback(() => {
    setCopilotOpen(false)
    setCopilotQuoteFocus(null)
  }, [])

  const handleQuoteCopilot = useCallback((quote: Quote) => {
    setCopilotQuoteFocus(quote)
    setFilterOpen(false)
    setCopilotOpen(true)
  }, [])

  const handleTabChange = useCallback((tab: QuotesTab) => {
    setActiveTab(tab)
    if (tab === 'analytics') {
      setCopilotOpen(false)
      setFilterOpen(false)
      setCopilotQuoteFocus(null)
    }
  }, [])

  const isAllQuotesTab = activeTab === 'all'
  const contentPx = `${layoutTokens.contentPaddingX}px`

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
          <QuotesHeader
            activeTab={activeTab}
            onTabChange={handleTabChange}
            filterOpen={filterOpen}
            onToggleFilter={handleToggleFilter}
            copilotOpen={copilotOpen}
            onToggleCopilot={handleToggleCopilot}
          />
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: isAllQuotesTab ? 'hidden' : 'auto',
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
                  activeCopilotQuoteId={copilotQuoteFocus?.id ?? null}
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

      <ResizableRightPanel open={filterOpen || copilotOpen}>
        {filterOpen && (
          <QuotesFilterPanel
            appliedFilters={appliedFilters}
            onApply={handleApplyFilters}
            onClose={handleCloseFilter}
          />
        )}
        {copilotOpen && (
          <CopilotPanel
            context="quotes"
            focusedQuote={copilotQuoteFocus}
            onClose={handleCloseCopilot}
          />
        )}
      </ResizableRightPanel>
    </Box>
  )
}

export default QuotesPage

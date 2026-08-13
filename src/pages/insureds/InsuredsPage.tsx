import Box from '@mui/material/Box'
import { useGridApiRef } from '@mui/x-data-grid-premium'
import { useCallback, useMemo, useState } from 'react'
import { layoutTokens } from '@/design-system/tokens/layout'
import { listPageContentOverflowSx } from '@/design-system/tokens/tableLayout'
import { CopilotPanel } from '@/pages/policies/components/CopilotPanel'
import { ResizableRightPanel } from '@/pages/policies/components/ResizableRightPanel'
import { InsuredsAnalyticsTab } from '@/pages/insureds/components/InsuredsAnalyticsTab'
import { InsuredsDataGrid } from '@/pages/insureds/components/InsuredsDataGrid'
import { InsuredsFilterPanel } from '@/pages/insureds/components/InsuredsFilterPanel'
import { InsuredsHeader } from '@/pages/insureds/components/InsuredsHeader'
import { InsuredsToolbar, type InsuredTypeFilter } from '@/pages/insureds/components/InsuredsToolbar'
import type { InsuredsTab } from '@/pages/insureds/components/InsuredsTabs'
import { insuredsMock, type InsuredListRecord } from '@/pages/insureds/data/mockInsureds'
import { resolveInsuredContext } from '@/pages/insureds/data/resolveInsuredContext'
import { applyInsuredsListFilters } from '@/pages/insureds/filters/applyInsuredsListFilters'
import {
  emptyInsuredsListFilters,
  type InsuredsListFilters,
} from '@/pages/insureds/filters/insuredsListFilterTypes'
import { insuredIdFromName } from '@/pages/shared/insuredId'

const LIST_SECTION_GAP = layoutTokens.listSectionVerticalGap

function matchesSearch(row: InsuredListRecord, query: string) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true

  const fields = [
    row.name,
    row.contactName,
    row.contactEmail,
    row.contactPhone,
    row.addressLine1,
    row.cityStateZip,
    row.zip,
    row.insuredType,
  ]
  return fields.some((value) => value.toLowerCase().includes(normalized))
}

export function InsuredsPage() {
  const apiRef = useGridApiRef()
  const [activeTab, setActiveTab] = useState<InsuredsTab>('all')
  const [copilotOpen, setCopilotOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [copilotInsuredFocus, setCopilotInsuredFocus] = useState<InsuredListRecord | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [insuredType, setInsuredType] = useState<InsuredTypeFilter>('All')
  const [appliedFilters, setAppliedFilters] = useState<InsuredsListFilters>(emptyInsuredsListFilters)

  const filteredRows = useMemo(() => {
    const withFilters = applyInsuredsListFilters(insuredsMock, appliedFilters)
    return withFilters.filter((row) => {
      if (insuredType !== 'All' && row.insuredType !== insuredType) return false
      return matchesSearch(row, searchQuery)
    })
  }, [appliedFilters, insuredType, searchQuery])

  const focusedInsuredDetails = useMemo(() => {
    if (!copilotInsuredFocus) return null
    return resolveInsuredContext(insuredIdFromName(copilotInsuredFocus.name))
  }, [copilotInsuredFocus])

  const handleToggleFilter = useCallback(() => {
    setFilterOpen((current) => {
      if (!current) {
        setCopilotOpen(false)
        setCopilotInsuredFocus(null)
      }
      return !current
    })
  }, [])

  const handleCloseFilter = useCallback(() => {
    setFilterOpen(false)
  }, [])

  const handleApplyFilters = useCallback((filters: InsuredsListFilters) => {
    setAppliedFilters(filters)
  }, [])

  const handleToggleCopilot = useCallback(() => {
    setCopilotOpen((current) => {
      if (current) {
        setCopilotInsuredFocus(null)
        return false
      }
      setFilterOpen(false)
      return true
    })
  }, [])

  const handleCloseCopilot = useCallback(() => {
    setCopilotOpen(false)
    setCopilotInsuredFocus(null)
  }, [])

  const handleInsuredCopilot = useCallback((insured: InsuredListRecord) => {
    setCopilotInsuredFocus(insured)
    setFilterOpen(false)
    setCopilotOpen(true)
  }, [])

  const handleTabChange = useCallback((tab: InsuredsTab) => {
    setActiveTab(tab)
    if (tab === 'analytics') {
      setCopilotOpen(false)
      setFilterOpen(false)
      setCopilotInsuredFocus(null)
    }
  }, [])

  const handleCloseMobileRightPanel = useCallback(() => {
    if (filterOpen) {
      handleCloseFilter()
      return
    }
    handleCloseCopilot()
  }, [filterOpen, handleCloseFilter, handleCloseCopilot])

  const isAllInsuredsTab = activeTab === 'all'
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
          <InsuredsHeader
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
            ...listPageContentOverflowSx(isAllInsuredsTab),
            px: contentPx,
            pt: LIST_SECTION_GAP,
            pb: contentPx,
            width: '100%',
            bgcolor: 'background.paper',
          }}
        >
          {isAllInsuredsTab ? (
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
                <InsuredsToolbar
                  apiRef={apiRef}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  insuredType={insuredType}
                  onInsuredTypeChange={setInsuredType}
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
                <InsuredsDataGrid
                  apiRef={apiRef}
                  rows={filteredRows}
                  onInsuredCopilot={handleInsuredCopilot}
                  activeCopilotInsuredId={copilotInsuredFocus?.id ?? null}
                />
              </Box>
            </Box>
          ) : (
            <InsuredsAnalyticsTab />
          )}
        </Box>
      </Box>

      <ResizableRightPanel open={filterOpen || copilotOpen} onClose={handleCloseMobileRightPanel}>
        {filterOpen && (
          <InsuredsFilterPanel
            appliedFilters={appliedFilters}
            onApply={handleApplyFilters}
            onClose={handleCloseFilter}
          />
        )}
        {copilotOpen && (
          <CopilotPanel
            context="insureds"
            focusedInsured={focusedInsuredDetails}
            onClose={handleCloseCopilot}
          />
        )}
      </ResizableRightPanel>
    </Box>
  )
}

export default InsuredsPage

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useGridApiRef } from '@mui/x-data-grid-premium'
import { useCallback, useMemo, useState } from 'react'
import { ListDataGridToolbar } from '@/design-system/components'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { usePoliciesLookupFromUrl } from '@/hooks/useLookupFromUrl'
import { CopilotPanel } from '@/pages/policies/components/CopilotPanel'
import { FilterPanel } from '@/pages/policies/components/FilterPanel'
import { PoliciesListAnalyticsDashboard } from '@/pages/policies/components/PoliciesListAnalyticsDashboard'
import { PoliciesListDataGrid } from '@/pages/policies/components/PoliciesListDataGrid'
import { PoliciesListHeader } from '@/pages/policies/components/PoliciesListHeader'
import type { PoliciesListTab } from '@/pages/policies/components/PoliciesListTabs'
import { ResizableRightPanel } from '@/pages/policies/components/ResizableRightPanel'
import {
  POLICIES_TOTAL_ROWS,
  policiesListMock,
  type PolicyListRecord,
} from '@/pages/policies/data/mockPoliciesList'
import { applyPoliciesListFilters } from '@/pages/policies/filters/applyPoliciesListFilters'
import {
  emptyPoliciesListFilters,
  hasActiveFilters,
  type PoliciesListFilters,
} from '@/pages/policies/filters/policiesListFilterTypes'

const LIST_SECTION_GAP = layoutTokens.listSectionVerticalGap

function matchesSearch(row: PolicyListRecord, query: string) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true

  const fields = [
    row.policyNumber,
    row.insuredName,
    row.agency,
    row.agencyNumber,
    row.underwriter,
  ]
  return fields.some((value) => value.toLowerCase().includes(normalized))
}

export function PoliciesListPage() {
  const apiRef = useGridApiRef()
  const [activeTab, setActiveTab] = useState<PoliciesListTab>('all')
  const [copilotOpen, setCopilotOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [copilotPolicyFocus, setCopilotPolicyFocus] = useState<PolicyListRecord | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [appliedFilters, setAppliedFilters] = useState<PoliciesListFilters>(emptyPoliciesListFilters)

  const handleLookupApplied = useCallback(() => {
    setFilterOpen(true)
    setCopilotOpen(false)
    setCopilotPolicyFocus(null)
  }, [])

  usePoliciesLookupFromUrl(setAppliedFilters, handleLookupApplied)

  const filteredRows = useMemo(() => {
    const withFilters = applyPoliciesListFilters(policiesListMock, appliedFilters)
    return withFilters.filter((row) => matchesSearch(row, searchQuery))
  }, [appliedFilters, searchQuery])

  const filtersActive = hasActiveFilters(appliedFilters)

  const handleToggleFilter = useCallback(() => {
    setFilterOpen((current) => {
      if (!current) {
        setCopilotOpen(false)
        setCopilotPolicyFocus(null)
      }
      return !current
    })
  }, [])

  const handleCloseFilter = useCallback(() => {
    setFilterOpen(false)
  }, [])

  const handleApplyFilters = useCallback((filters: PoliciesListFilters) => {
    setAppliedFilters(filters)
  }, [])

  const handleToggleCopilot = useCallback(() => {
    setCopilotOpen((current) => {
      if (current) {
        setCopilotPolicyFocus(null)
        return false
      }
      setFilterOpen(false)
      return true
    })
  }, [])

  const handleCloseCopilot = useCallback(() => {
    setCopilotOpen(false)
    setCopilotPolicyFocus(null)
  }, [])

  const handlePolicyCopilot = useCallback((policy: PolicyListRecord) => {
    setCopilotPolicyFocus(policy)
    setFilterOpen(false)
    setCopilotOpen(true)
  }, [])

  const handleTabChange = useCallback((tab: PoliciesListTab) => {
    setActiveTab(tab)
    if (tab === 'analytics') {
      setCopilotOpen(false)
      setFilterOpen(false)
      setCopilotPolicyFocus(null)
    }
  }, [])

  const handleCloseMobileRightPanel = useCallback(() => {
    if (filterOpen) {
      handleCloseFilter()
      return
    }
    handleCloseCopilot()
  }, [filterOpen, handleCloseFilter, handleCloseCopilot])

  const isAllPoliciesTab = activeTab === 'all'
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
          <PoliciesListHeader
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
            overflow: isAllPoliciesTab ? 'hidden' : 'auto',
            px: contentPx,
            pt: LIST_SECTION_GAP,
            pb: contentPx,
            width: '100%',
            bgcolor: 'background.paper',
          }}
        >
          {isAllPoliciesTab ? (
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
                  exportFileName="policies"
                  exportAriaLabel="Download policies"
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  searchPlaceholder="Search policies"
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
                <PoliciesListDataGrid
                  apiRef={apiRef}
                  rows={filteredRows}
                  onPolicyCopilot={handlePolicyCopilot}
                  activeCopilotPolicyId={copilotPolicyFocus?.id ?? null}
                />
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontFamily: figmaFontFamilyStack.body, textAlign: 'right', flexShrink: 0 }}
              >
                Total Rows: {filtersActive || searchQuery.trim() ? filteredRows.length : POLICIES_TOTAL_ROWS}
              </Typography>
            </Box>
          ) : (
            <PoliciesListAnalyticsDashboard />
          )}
        </Box>
      </Box>

      <ResizableRightPanel open={filterOpen || copilotOpen} onClose={handleCloseMobileRightPanel}>
        {filterOpen && (
          <FilterPanel
            appliedFilters={appliedFilters}
            onApply={handleApplyFilters}
            onClose={handleCloseFilter}
          />
        )}
        {copilotOpen && (
          <CopilotPanel
            context="policies-list"
            focusedPolicyList={copilotPolicyFocus}
            onClose={handleCloseCopilot}
          />
        )}
      </ResizableRightPanel>
    </Box>
  )
}

export default PoliciesListPage

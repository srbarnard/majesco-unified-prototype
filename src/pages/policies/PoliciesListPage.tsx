import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useGridApiRef } from '@mui/x-data-grid-premium'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { useRightTool } from '@/app/contexts/RightToolContext'
import {
  useRegisterRightToolCopilot,
  useRegisterRightToolFilter,
} from '@/app/hooks/useRightToolRegistration'
import { ListDataGridToolbar } from '@/design-system/components'
import { layoutTokens } from '@/design-system/tokens/layout'
import { listPageContentOverflowSx } from '@/design-system/tokens/tableLayout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { usePoliciesLookupFromUrl } from '@/hooks/useLookupFromUrl'
import { useSearchQueryFromUrl } from '@/hooks/useSearchQueryFromUrl'
import { FilterPanel } from '@/pages/policies/components/FilterPanel'
import { PoliciesListAnalyticsDashboard } from '@/pages/policies/components/PoliciesListAnalyticsDashboard'
import { PoliciesListDataGrid } from '@/pages/policies/components/PoliciesListDataGrid'
import { PoliciesListHeader } from '@/pages/policies/components/PoliciesListHeader'
import type { PoliciesListTab } from '@/pages/policies/components/PoliciesListTabs'
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
  const [searchParams, setSearchParams] = useSearchParams()
  const { activeTool, openTool, closeTool } = useRightTool()
  const [activeTab, setActiveTab] = useState<PoliciesListTab>('all')
  const [copilotPolicyFocus, setCopilotPolicyFocus] = useState<PolicyListRecord | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [appliedFilters, setAppliedFilters] = useState<PoliciesListFilters>(emptyPoliciesListFilters)

  const handleLookupApplied = useCallback(() => {
    openTool('filter')
    setCopilotPolicyFocus(null)
  }, [openTool])

  usePoliciesLookupFromUrl(setAppliedFilters, handleLookupApplied)

  useSearchQueryFromUrl(useCallback((query) => {
    setSearchQuery(query)
  }, []))

  useEffect(() => {
    const focusParam = searchParams.get('policy')
    if (!focusParam) return

    const match = policiesListMock.find(
      (row) =>
        row.policyNumber.toLowerCase() === focusParam.toLowerCase() ||
        row.id.toLowerCase() === focusParam.toLowerCase(),
    )
    if (!match) return

    setCopilotPolicyFocus(match)
    openTool('copilot')

    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)
        next.delete('policy')
        return next
      },
      { replace: true },
    )
  }, [openTool, searchParams, setSearchParams])

  const previousSearchQueryRef = useRef(searchQuery)
  useEffect(() => {
    const previous = previousSearchQueryRef.current
    previousSearchQueryRef.current = searchQuery
    if (!previous.trim() || searchQuery.trim()) return
    setCopilotPolicyFocus(null)
  }, [searchQuery])

  const filteredRows = useMemo(() => {
    const withFilters = applyPoliciesListFilters(policiesListMock, appliedFilters)
    return withFilters.filter((row) => matchesSearch(row, searchQuery))
  }, [appliedFilters, searchQuery])

  const filtersActive = hasActiveFilters(appliedFilters)

  useRegisterRightToolCopilot(
    {
      context: 'policies-list',
      focusedPolicyList: copilotPolicyFocus,
      onBackToSummary: copilotPolicyFocus
        ? () => setCopilotPolicyFocus(null)
        : undefined,
      summaryBackLabel: 'Policies workspace',
    },
    [copilotPolicyFocus],
  )

  const handleApplyFilters = useCallback((filters: PoliciesListFilters) => {
    setAppliedFilters(filters)
  }, [])

  useRegisterRightToolFilter(
    activeTab === 'all' ? (
      <FilterPanel
        appliedFilters={appliedFilters}
        onApply={handleApplyFilters}
        onClose={closeTool}
      />
    ) : null,
    [activeTab, appliedFilters, handleApplyFilters, closeTool],
  )

  const handlePolicyCopilot = useCallback(
    (policy: PolicyListRecord) => {
      setCopilotPolicyFocus(policy)
      openTool('copilot')
    },
    [openTool],
  )

  const handleTabChange = useCallback(
    (tab: PoliciesListTab) => {
      setActiveTab(tab)
      if (tab === 'analytics') {
        closeTool()
        setCopilotPolicyFocus(null)
      }
    },
    [closeTool],
  )

  const isAllPoliciesTab = activeTab === 'all'
  const contentPx = `${layoutTokens.contentPaddingX}px`
  const activeCopilotPolicyId =
    activeTool === 'copilot' && copilotPolicyFocus ? copilotPolicyFocus.id : null

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
          <PoliciesListHeader activeTab={activeTab} onTabChange={handleTabChange} />
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            ...listPageContentOverflowSx(isAllPoliciesTab),
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
                  activeCopilotPolicyId={activeCopilotPolicyId}
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
    </Box>
  )
}

export default PoliciesListPage

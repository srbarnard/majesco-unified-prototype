import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useCallback, useMemo, useState } from 'react'
import { Card } from '@/design-system/components'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { CopilotPanel } from '@/pages/policies/components/CopilotPanel'
import { PoliciesListDataGrid } from '@/pages/policies/components/PoliciesListDataGrid'
import { PoliciesListHeader } from '@/pages/policies/components/PoliciesListHeader'
import { PoliciesListToolbar } from '@/pages/policies/components/PoliciesListToolbar'
import type { PoliciesListTab } from '@/pages/policies/components/PoliciesListTabs'
import { ResizableRightPanel } from '@/pages/policies/components/ResizableRightPanel'
import {
  POLICIES_TOTAL_ROWS,
  policiesListMock,
  type PolicyListRecord,
} from '@/pages/policies/data/mockPoliciesList'

const GUTTER = layoutTokens.contentPaddingX / 8

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
  const [activeTab, setActiveTab] = useState<PoliciesListTab>('all')
  const [copilotOpen, setCopilotOpen] = useState(false)
  const [copilotPolicyFocus, setCopilotPolicyFocus] = useState<PolicyListRecord | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredRows = useMemo(
    () => policiesListMock.filter((row) => matchesSearch(row, searchQuery)),
    [searchQuery],
  )

  const handleToggleCopilot = useCallback(() => {
    setCopilotOpen((current) => {
      if (current) {
        setCopilotPolicyFocus(null)
      }
      return !current
    })
  }, [])

  const handleCloseCopilot = useCallback(() => {
    setCopilotOpen(false)
    setCopilotPolicyFocus(null)
  }, [])

  const handlePolicyCopilot = useCallback((policy: PolicyListRecord) => {
    setCopilotPolicyFocus(policy)
    setCopilotOpen(true)
  }, [])

  const handleTabChange = useCallback((tab: PoliciesListTab) => {
    setActiveTab(tab)
    if (tab === 'analytics') {
      setCopilotOpen(false)
      setCopilotPolicyFocus(null)
    }
  }, [])

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
            pt: 1,
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
                gap: GUTTER,
              }}
            >
              <Box sx={{ flexShrink: 0 }}>
                <PoliciesListToolbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
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
                Total Rows: {POLICIES_TOTAL_ROWS}
              </Typography>
            </Box>
          ) : (
            <Card title="Analytics">
              <Typography variant="body2" color="text.secondary" sx={{ fontFamily: figmaFontFamilyStack.body }}>
                Policy portfolio analytics and renewal metrics will appear here.
              </Typography>
            </Card>
          )}
        </Box>
      </Box>

      <ResizableRightPanel open={copilotOpen}>
        <CopilotPanel
          context="policies-list"
          focusedPolicyList={copilotPolicyFocus}
          onClose={handleCloseCopilot}
        />
      </ResizableRightPanel>
    </Box>
  )
}

export default PoliciesListPage

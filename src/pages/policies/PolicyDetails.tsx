import Box from '@mui/material/Box'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { PolicyAnalyticsDashboard } from '@/pages/policies/components/PolicyAnalyticsDashboard'
import { CopilotPanel } from '@/pages/policies/components/CopilotPanel'
import { type DocumentAttachMode, type DocumentAttachTarget } from '@/pages/policies/components/DocumentAttachComposer'
import { DocumentsFilterPanel } from '@/pages/policies/components/DocumentsFilterPanel'
import { DocumentsTab } from '@/pages/policies/components/DocumentsTab'
import { OverviewTab } from '@/pages/policies/components/OverviewTab'
import { PartiesPanel } from '@/pages/policies/components/PartiesPanel'
import {
  PolicyHeader,
  type RightPanel,
} from '@/pages/policies/components/PolicyHeader'
import { ResizableRightPanel } from '@/pages/policies/components/ResizableRightPanel'
import type { PolicyTab } from '@/pages/policies/components/PolicyTabs'
import { useIsDesktopLayout } from '@/pages/policies/hooks/useIsDesktopLayout'
import {
  resolveOverviewCopilotPanel,
  useCloseCopilotWhenMobile,
  useDesktopCopilotInitialOpen,
} from '@/pages/policies/hooks/useResponsiveCopilotPanel'
import { layoutTokens } from '@/design-system/tokens/layout'
import {
  policyDocumentsCopilotInsights,
  policyDocumentsCopilotSummary,
} from '@/pages/policies/data/documentsCopilotContent'
import { policyDocumentsMock, type PolicyDocument } from '@/pages/policies/data/mockDocuments'
import {
  overviewQuickActionsMock,
  overviewStatsMock,
  overviewTransactionsMock,
  overviewTransactionsOverTimeMock,
} from '@/pages/policies/data/mockOverview'
import { policyDetailsMock } from '@/pages/policies/data/mockPolicyDetails'
import { emptyDocumentsFilters, type DocumentsFilters } from '@/pages/policies/filters/documentsFilterTypes'

function parsePolicyTab(value: string | null): PolicyTab | null {
  if (value === 'overview' || value === 'documents' || value === 'analytics') {
    return value
  }
  return null
}

export function PolicyDetails() {
  const { policyId = policyDetailsMock.policyNumber } = useParams<{ policyId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isDesktop = useIsDesktopLayout()
  const [activeTab, setActiveTab] = useState<PolicyTab>(() => parsePolicyTab(searchParams.get('tab')) ?? 'overview')
  const [starred, setStarred] = useState(true)
  const [emergency, setEmergency] = useState(false)
  const [activeRightPanel, setActiveRightPanel] = useState<RightPanel | null>(null)
  const [documentsFilterOpen, setDocumentsFilterOpen] = useState(false)
  const [appliedDocumentsFilters, setAppliedDocumentsFilters] = useState<DocumentsFilters>(emptyDocumentsFilters)
  const [copilotDocumentFocus, setCopilotDocumentFocus] = useState<PolicyDocument | null>(null)
  const [attachMode, setAttachMode] = useState<DocumentAttachMode | null>(null)

  useDesktopCopilotInitialOpen(isDesktop, activeTab === 'overview' || activeTab === 'documents', 'copilot', setActiveRightPanel)
  useCloseCopilotWhenMobile(isDesktop, activeRightPanel, 'copilot', setActiveRightPanel)

  useEffect(() => {
    const tab = parsePolicyTab(searchParams.get('tab'))
    if (!tab) return

    setActiveTab(tab)
    setCopilotDocumentFocus(null)
    setDocumentsFilterOpen(false)
    setAttachMode(null)

    if (tab === 'overview') {
      setActiveRightPanel((current) => resolveOverviewCopilotPanel(isDesktop, current, 'copilot', 'parties'))
      return
    }

    if (tab === 'documents') {
      setActiveRightPanel(isDesktop ? 'copilot' : null)
      return
    }

    setActiveRightPanel((current) => (current === 'copilot' ? null : current))
  }, [isDesktop, searchParams])

  const handleToggleRightPanel = useCallback((panel: RightPanel) => {
    if (panel === 'copilot') {
      setCopilotDocumentFocus(null)
      setAttachMode(null)
    }
    setActiveRightPanel((current) => {
      if (current === panel) {
        return null
      }
      setDocumentsFilterOpen(false)
      return panel
    })
  }, [])

  const handleToggleDocumentsFilter = useCallback(() => {
    setDocumentsFilterOpen((current) => {
      if (!current) {
        setActiveRightPanel(null)
        setCopilotDocumentFocus(null)
      }
      return !current
    })
  }, [])

  const handleCloseRightPanel = useCallback(() => {
    setActiveRightPanel(null)
    setDocumentsFilterOpen(false)
    setAttachMode(null)
  }, [])

  const handleCloseDocumentsFilter = useCallback(() => {
    setDocumentsFilterOpen(false)
  }, [])

  const handleApplyDocumentsFilters = useCallback((filters: DocumentsFilters) => {
    setAppliedDocumentsFilters(filters)
  }, [])

  const handleTabChange = useCallback((tab: PolicyTab) => {
    setActiveTab(tab)
    setCopilotDocumentFocus(null)
    setDocumentsFilterOpen(false)
    setAttachMode(null)

    if (tab === 'overview') {
      setActiveRightPanel((current) => resolveOverviewCopilotPanel(isDesktop, current, 'copilot', 'parties'))
      return
    }

    if (tab === 'documents') {
      setActiveRightPanel(isDesktop ? 'copilot' : null)
      return
    }

    setActiveRightPanel((current) => (current === 'copilot' ? null : current))
  }, [isDesktop])

  const handleDocumentOpen = useCallback(
    (document: PolicyDocument) => {
      navigate(`/policies/${policyId}/documents/${document.id}`)
    },
    [navigate, policyId],
  )

  const getDocumentHref = useCallback(
    (document: PolicyDocument) => `/policies/${policyId}/documents/${document.id}`,
    [policyId],
  )

  const handleAttachTo = useCallback((target: DocumentAttachTarget, documents: PolicyDocument[]) => {
    setAttachMode({ target, documents })
    setDocumentsFilterOpen(false)
    setCopilotDocumentFocus(documents[0] ?? null)
    setActiveRightPanel('copilot')
  }, [])

  const handleCloseAttach = useCallback(() => {
    setAttachMode(null)
  }, [])

  const handleAttachSave = useCallback(() => {
    setAttachMode(null)
  }, [])

  const showCopilotPanel = activeRightPanel === 'copilot'
  const isDocumentsTab = activeTab === 'documents'
  const rightPanelOpen = documentsFilterOpen || activeRightPanel !== null

  const handleCloseMobileRightPanel = useCallback(() => {
    if (documentsFilterOpen) {
      handleCloseDocumentsFilter()
      return
    }
    handleCloseRightPanel()
  }, [documentsFilterOpen, handleCloseDocumentsFilter, handleCloseRightPanel])

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
          <PolicyHeader
            companyName={policyDetailsMock.companyName}
            policyNumber={policyDetailsMock.policyNumber}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            activeRightPanel={activeRightPanel}
            onToggleRightPanel={handleToggleRightPanel}
            documentsFilterOpen={documentsFilterOpen}
            onToggleDocumentsFilter={handleToggleDocumentsFilter}
            starred={starred}
            onToggleStar={() => setStarred((prev) => !prev)}
            emergency={emergency}
            onToggleEmergency={() => setEmergency((prev) => !prev)}
          />
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: isDocumentsTab ? 'hidden' : 'auto',
            px: `${layoutTokens.contentPaddingX}px`,
            py: `${layoutTokens.contentPaddingX}px`,
            width: '100%',
            bgcolor: 'background.paper',
          }}
        >
          {isDocumentsTab && (
            <DocumentsTab
              documents={policyDocumentsMock}
              appliedFilters={appliedDocumentsFilters}
              onDocumentOpen={handleDocumentOpen}
              getDocumentHref={getDocumentHref}
              onAttachTo={handleAttachTo}
              activeCopilotDocumentId={copilotDocumentFocus?.id ?? null}
            />
          )}
          {activeTab === 'overview' && (
            <OverviewTab
              stats={overviewStatsMock}
              transactionsOverTime={overviewTransactionsOverTimeMock}
              transactions={overviewTransactionsMock}
              quickActions={overviewQuickActionsMock}
            />
          )}
          {activeTab === 'analytics' && <PolicyAnalyticsDashboard policyId={policyId} />}
        </Box>
      </Box>

      <ResizableRightPanel open={rightPanelOpen} onClose={handleCloseMobileRightPanel}>
        {documentsFilterOpen && (
          <DocumentsFilterPanel
            appliedFilters={appliedDocumentsFilters}
            onApply={handleApplyDocumentsFilters}
            onClose={handleCloseDocumentsFilter}
          />
        )}
        {activeRightPanel === 'parties' && <PartiesPanel onClose={handleCloseRightPanel} />}
        {showCopilotPanel && (
          <CopilotPanel
            activePolicyTab={activeTab}
            focusedDocument={copilotDocumentFocus}
            documentsWorkspaceSummary={policyDocumentsCopilotSummary}
            documentsWorkspaceInsights={policyDocumentsCopilotInsights}
            attachMode={attachMode}
            attachContextLabel={policyDetailsMock.policyNumber}
            onCloseAttach={handleCloseAttach}
            onAttachSave={handleAttachSave}
            onClose={() => {
              setCopilotDocumentFocus(null)
              setAttachMode(null)
              handleCloseRightPanel()
            }}
          />
        )}
      </ResizableRightPanel>
    </Box>
  )
}

export default PolicyDetails

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useCallback, useState } from 'react'
import { useParams } from 'react-router'
import { Card } from '@/design-system/components'
import { PolicyAnalyticsDashboard } from '@/pages/policies/components/PolicyAnalyticsDashboard'
import { CopilotPanel } from '@/pages/policies/components/CopilotPanel'
import { type DocumentAttachMode, type DocumentAttachTarget } from '@/pages/policies/components/DocumentAttachComposer'
import { DocumentPreviewWorkspace } from '@/pages/policies/components/DocumentPreviewWorkspace'
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
  policyDocumentStoryImpactInsights,
  policyDocumentStoryImpactSummary,
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

export function PolicyDetails() {
  const { policyId = policyDetailsMock.policyNumber } = useParams<{ policyId: string }>()
  const isDesktop = useIsDesktopLayout()
  const [activeTab, setActiveTab] = useState<PolicyTab>('overview')
  const [starred, setStarred] = useState(true)
  const [emergency, setEmergency] = useState(false)
  const [activeRightPanel, setActiveRightPanel] = useState<RightPanel | null>(null)
  const [documentsFilterOpen, setDocumentsFilterOpen] = useState(false)
  const [appliedDocumentsFilters, setAppliedDocumentsFilters] = useState<DocumentsFilters>(emptyDocumentsFilters)
  const [copilotDocumentFocus, setCopilotDocumentFocus] = useState<PolicyDocument | null>(null)
  const [documentPreview, setDocumentPreview] = useState<PolicyDocument | null>(null)
  const [documentsCopilotMode, setDocumentsCopilotMode] = useState<'workspace' | 'impact'>('workspace')
  const [attachMode, setAttachMode] = useState<DocumentAttachMode | null>(null)

  useDesktopCopilotInitialOpen(isDesktop, activeTab === 'overview', 'copilot', setActiveRightPanel)
  useCloseCopilotWhenMobile(isDesktop, activeRightPanel, 'copilot', setActiveRightPanel)

  const handleToggleRightPanel = useCallback((panel: RightPanel) => {
    if (panel === 'copilot') {
      setDocumentsCopilotMode('workspace')
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
    setDocumentPreview(null)
    setDocumentsFilterOpen(false)
    setDocumentsCopilotMode('workspace')
    setAttachMode(null)

    if (tab === 'overview') {
      setActiveRightPanel((current) => resolveOverviewCopilotPanel(isDesktop, current, 'copilot', 'parties'))
      return
    }

    if (tab === 'documents') {
      setActiveRightPanel(null)
      return
    }

    setActiveRightPanel((current) => (current === 'copilot' ? null : current))
  }, [isDesktop])

  const handleDocumentOpen = useCallback((document: PolicyDocument) => {
    setDocumentPreview(document)
    setCopilotDocumentFocus(document)
    setDocumentsFilterOpen(false)
    setAttachMode(null)
    setActiveRightPanel(null)
  }, [])

  const handleCloseDocumentPreview = useCallback(() => {
    setDocumentPreview(null)
    setCopilotDocumentFocus(null)
    setAttachMode(null)
  }, [])

  const handleAttachTo = useCallback((target: DocumentAttachTarget, documents: PolicyDocument[]) => {
    setAttachMode({ target, documents })
    setDocumentsFilterOpen(false)
    setDocumentsCopilotMode('workspace')
    setCopilotDocumentFocus(documents[0] ?? null)

    if (documentPreview) {
      return
    }

    setDocumentPreview(null)
    setActiveRightPanel('copilot')
  }, [documentPreview])

  const handleCloseAttach = useCallback(() => {
    setAttachMode(null)
  }, [])

  const handleAttachSave = useCallback(() => {
    setAttachMode(null)
  }, [])

  const handleShowStoryImpact = useCallback(() => {
    setCopilotDocumentFocus(null)
    setAttachMode(null)
    setDocumentsCopilotMode('impact')
    setDocumentsFilterOpen(false)
    setActiveRightPanel('copilot')
  }, [])

  const showCopilotPanel = activeRightPanel === 'copilot'
  const isDocumentsTab = activeTab === 'documents'
  const documentPreviewOpen = Boolean(documentPreview)
  const rightPanelOpen = documentsFilterOpen || activeRightPanel !== null || documentPreviewOpen
  const rightPanelVariant = documentPreviewOpen ? 'wide' : 'standard'

  const handleCloseMobileRightPanel = useCallback(() => {
    if (documentPreviewOpen) {
      handleCloseDocumentPreview()
      return
    }
    if (documentsFilterOpen) {
      handleCloseDocumentsFilter()
      return
    }
    handleCloseRightPanel()
  }, [
    documentPreviewOpen,
    documentsFilterOpen,
    handleCloseDocumentPreview,
    handleCloseDocumentsFilter,
    handleCloseRightPanel,
  ])

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
              documentStory={policyDetailsMock.documentStory}
              documentStorySyncedAt={policyDetailsMock.documentStorySyncedAt}
              documentStoryHighlights={policyDetailsMock.documentStoryHighlights}
              appliedFilters={appliedDocumentsFilters}
              onDocumentOpen={handleDocumentOpen}
              onAttachTo={handleAttachTo}
              activePreviewDocumentId={documentPreview?.id ?? null}
              activeCopilotDocumentId={copilotDocumentFocus?.id ?? null}
              onShowStoryImpact={handleShowStoryImpact}
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
          {activeTab === 'communications' && (
            <Card title="Communications">
              <Typography variant="body2" color="text.secondary">
                Policy communications history will appear here.
              </Typography>
            </Card>
          )}
        </Box>
      </Box>

      <ResizableRightPanel open={rightPanelOpen} variant={rightPanelVariant} onClose={handleCloseMobileRightPanel}>
        {documentsFilterOpen && (
          <DocumentsFilterPanel
            appliedFilters={appliedDocumentsFilters}
            onApply={handleApplyDocumentsFilters}
            onClose={handleCloseDocumentsFilter}
          />
        )}
        {documentPreviewOpen && documentPreview && (
          <DocumentPreviewWorkspace
            document={documentPreview}
            context="policy"
            attachMode={attachMode}
            attachContextLabel={policyDetailsMock.policyNumber}
            onClose={handleCloseDocumentPreview}
            onCloseAttach={handleCloseAttach}
            onAttachSave={handleAttachSave}
          />
        )}
        {activeRightPanel === 'parties' && <PartiesPanel onClose={handleCloseRightPanel} />}
        {showCopilotPanel && (
          <CopilotPanel
            activePolicyTab={activeTab}
            focusedDocument={copilotDocumentFocus}
            documentsWorkspaceSummary={policyDocumentsCopilotSummary}
            documentsWorkspaceInsights={policyDocumentsCopilotInsights}
            documentsImpactSummary={policyDocumentStoryImpactSummary}
            documentsImpactInsights={policyDocumentStoryImpactInsights}
            documentsCopilotMode={documentsCopilotMode}
            attachMode={attachMode}
            attachContextLabel={policyDetailsMock.policyNumber}
            onCloseAttach={handleCloseAttach}
            onAttachSave={handleAttachSave}
            onClose={() => {
              setCopilotDocumentFocus(null)
              setDocumentsCopilotMode('workspace')
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

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { Card } from '@/design-system/components'
import { PolicyAnalyticsDashboard } from '@/pages/policies/components/PolicyAnalyticsDashboard'
import { CopilotPanel } from '@/pages/policies/components/CopilotPanel'
import { DocumentsTab } from '@/pages/policies/components/DocumentsTab'
import { OverviewTab } from '@/pages/policies/components/OverviewTab'
import { PartiesPanel } from '@/pages/policies/components/PartiesPanel'
import {
  PolicyHeader,
  type RightPanel,
} from '@/pages/policies/components/PolicyHeader'
import { ResizableRightPanel } from '@/pages/policies/components/ResizableRightPanel'
import type { PolicyTab } from '@/pages/policies/components/PolicyTabs'
import { layoutTokens } from '@/design-system/tokens/layout'
import { policyDocumentsMock, type PolicyDocument } from '@/pages/policies/data/mockDocuments'
import {
  overviewQuickActionsMock,
  overviewStatsMock,
  overviewTransactionsMock,
  overviewTransactionsOverTimeMock,
} from '@/pages/policies/data/mockOverview'
import { policyDetailsMock } from '@/pages/policies/data/mockPolicyDetails'

export function PolicyDetails() {
  const { policyId = policyDetailsMock.policyNumber } = useParams<{ policyId: string }>()
  const [activeTab, setActiveTab] = useState<PolicyTab>('overview')
  const [starred, setStarred] = useState(true)
  const [emergency, setEmergency] = useState(false)
  const [activeRightPanel, setActiveRightPanel] = useState<RightPanel | null>('copilot')
  const [copilotDocumentFocus, setCopilotDocumentFocus] = useState<PolicyDocument | null>(null)

  const handleToggleRightPanel = useCallback((panel: RightPanel) => {
    setActiveRightPanel((current) => {
      if (current === panel) {
        return null
      }
      if (panel === 'copilot' && activeTab === 'documents') {
        return current
      }
      return panel
    })
  }, [activeTab])

  const handleCloseRightPanel = useCallback(() => {
    setActiveRightPanel(null)
  }, [])

  const handleTabChange = useCallback((tab: PolicyTab) => {
    setActiveTab(tab)
    setCopilotDocumentFocus(null)

    if (tab === 'overview') {
      setActiveRightPanel((current) => (current === 'parties' ? current : 'copilot'))
      return
    }

    setActiveRightPanel((current) => (current === 'copilot' ? null : current))
  }, [])

  const handleDocumentCopilot = useCallback((document: PolicyDocument) => {
    setCopilotDocumentFocus(document)
    setActiveRightPanel('copilot')
  }, [])

  const showCopilotPanel =
    activeRightPanel === 'copilot' && (activeTab !== 'documents' || copilotDocumentFocus !== null)

  useEffect(() => {
    if (activeTab === 'documents' && activeRightPanel !== 'copilot') {
      setCopilotDocumentFocus(null)
    }
  }, [activeTab, activeRightPanel])

  const isDocumentsTab = activeTab === 'documents'

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
              onDocumentCopilot={handleDocumentCopilot}
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
          {activeTab === 'communications' && (
            <Card title="Communications">
              <Typography variant="body2" color="text.secondary">
                Policy communications history will appear here.
              </Typography>
            </Card>
          )}
        </Box>
      </Box>

      <ResizableRightPanel open={activeRightPanel !== null && (activeRightPanel !== 'copilot' || showCopilotPanel)}>
        {activeRightPanel === 'parties' && <PartiesPanel onClose={handleCloseRightPanel} />}
        {showCopilotPanel && (
          <CopilotPanel
            activePolicyTab={activeTab}
            focusedDocument={copilotDocumentFocus}
            onClose={() => {
              setCopilotDocumentFocus(null)
              handleCloseRightPanel()
            }}
          />
        )}
      </ResizableRightPanel>
    </Box>
  )
}

export default PolicyDetails

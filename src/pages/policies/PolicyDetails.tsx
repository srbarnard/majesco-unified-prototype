import Box from '@mui/material/Box'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { useFavorites } from '@/app/contexts/FavoritesContext'
import { useRightTool } from '@/app/contexts/RightToolContext'
import {
  useRegisterRightToolCopilot,
  useRegisterRightToolFilter,
  useRegisterRightToolParties,
  useRegisterRightToolRecordContext,
} from '@/app/hooks/useRightToolRegistration'
import { PolicyAnalyticsDashboard } from '@/pages/policies/components/PolicyAnalyticsDashboard'
import { type DocumentAttachMode, type DocumentAttachTarget } from '@/pages/policies/components/DocumentAttachComposer'
import { DocumentsFilterPanel } from '@/pages/policies/components/DocumentsFilterPanel'
import { DocumentsTab } from '@/pages/policies/components/DocumentsTab'
import { OverviewTab } from '@/pages/policies/components/OverviewTab'
import { PartiesPanel } from '@/pages/policies/components/PartiesPanel'
import { PolicyHeader } from '@/pages/policies/components/PolicyHeader'
import type { PolicyTab } from '@/pages/policies/components/PolicyTabs'
import { useIsDesktopLayout } from '@/pages/policies/hooks/useIsDesktopLayout'
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
  const [searchParams, setSearchParams] = useSearchParams()
  const isDesktop = useIsDesktopLayout()
  const { openTool, closeTool, activeTool } = useRightTool()
  const { isFavorite, isHighRisk, toggleFavorite, toggleHighRisk } = useFavorites()
  const [activeTab, setActiveTab] = useState<PolicyTab>(() => parsePolicyTab(searchParams.get('tab')) ?? 'overview')
  const resolvedPolicyId = decodeURIComponent(policyId)
  const starred = isFavorite('policy', resolvedPolicyId)
  const emergency = isHighRisk('policy', resolvedPolicyId)
  const [appliedDocumentsFilters, setAppliedDocumentsFilters] = useState<DocumentsFilters>(emptyDocumentsFilters)
  const [copilotDocumentFocus, setCopilotDocumentFocus] = useState<PolicyDocument | null>(null)
  const [attachMode, setAttachMode] = useState<DocumentAttachMode | null>(null)
  const didInitCopilot = useRef(false)
  const wasDesktop = useRef(isDesktop)

  useRegisterRightToolRecordContext(
    {
      title: policyDetailsMock.companyName,
      subtitle: policyDetailsMock.policyNumber,
    },
    [],
  )

  useRegisterRightToolCopilot(
    {
      activePolicyTab: activeTab,
      focusedDocument: copilotDocumentFocus,
      documentsWorkspaceSummary: policyDocumentsCopilotSummary,
      documentsWorkspaceInsights: policyDocumentsCopilotInsights,
      attachMode,
      attachContextLabel: policyDetailsMock.policyNumber,
      onCloseAttach: () => setAttachMode(null),
      onAttachSave: () => setAttachMode(null),
    },
    [activeTab, attachMode, copilotDocumentFocus],
  )

  const handleApplyDocumentsFilters = useCallback((filters: DocumentsFilters) => {
    setAppliedDocumentsFilters(filters)
  }, [])

  useRegisterRightToolFilter(
    activeTab === 'documents' ? (
      <DocumentsFilterPanel
        appliedFilters={appliedDocumentsFilters}
        onApply={handleApplyDocumentsFilters}
        onClose={closeTool}
      />
    ) : null,
    [activeTab, appliedDocumentsFilters, handleApplyDocumentsFilters, closeTool],
  )

  useRegisterRightToolParties(<PartiesPanel onClose={closeTool} />, [closeTool])

  useEffect(() => {
    if (didInitCopilot.current) return
    didInitCopilot.current = true
    if (isDesktop && (activeTab === 'overview' || activeTab === 'documents')) {
      openTool('copilot')
    }
    // Omit openTool — only one-shot open on mount / first desktop layout.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isDesktop])

  useEffect(() => {
    if (wasDesktop.current && !isDesktop && activeTool === 'copilot') {
      closeTool()
      setAttachMode(null)
      setCopilotDocumentFocus(null)
    }
    wasDesktop.current = isDesktop
  }, [activeTool, closeTool, isDesktop])

  const syncTabPanels = useCallback(
    (tab: PolicyTab) => {
      if (tab === 'overview' || tab === 'documents') {
        if (activeTool === 'parties' || activeTool === 'filter') return
        if (isDesktop) openTool('copilot')
        return
      }
      closeTool()
    },
    [activeTool, closeTool, isDesktop, openTool],
  )

  const syncTabPanelsRef = useRef(syncTabPanels)
  syncTabPanelsRef.current = syncTabPanels

  const tabFromUrl = parsePolicyTab(searchParams.get('tab')) ?? 'overview'

  useEffect(() => {
    setActiveTab(tabFromUrl)
    setCopilotDocumentFocus(null)
    setAttachMode(null)
    // Use ref so openTool/activeTool identity changes cannot re-enter this effect
    // (that loop froze left-nav SPA navigation from Policy Details / Documents).
    syncTabPanelsRef.current(tabFromUrl)
  }, [tabFromUrl])

  const handleTabChange = useCallback(
    (tab: PolicyTab) => {
      setActiveTab(tab)
      setCopilotDocumentFocus(null)
      setAttachMode(null)
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          if (tab === 'overview') {
            next.delete('tab')
          } else {
            next.set('tab', tab)
          }
          return next
        },
        { replace: true },
      )
      syncTabPanels(tab)
    },
    [setSearchParams, syncTabPanels],
  )

  const handleOverviewQuickAction = useCallback(
    (actionId: string) => {
      if (actionId === 'documents') {
        handleTabChange('documents')
        return
      }
      if (actionId === 'note') {
        openTool('notes')
        return
      }
      if (actionId === 'email') {
        openTool('email')
        return
      }
      if (actionId === 'analytics') {
        handleTabChange('analytics')
      }
    },
    [handleTabChange, openTool],
  )

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

  const handleAttachTo = useCallback(
    (target: DocumentAttachTarget, documents: PolicyDocument[]) => {
      setAttachMode({ target, documents })
      setCopilotDocumentFocus(documents[0] ?? null)
      openTool('copilot')
    },
    [openTool],
  )

  const isDocumentsTab = activeTab === 'documents'
  const activeCopilotDocumentId =
    activeTool === 'copilot' && copilotDocumentFocus ? copilotDocumentFocus.id : null

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
            policyNumber={resolvedPolicyId}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            starred={starred}
            onToggleStar={() =>
              toggleFavorite({
                kind: 'policy',
                id: resolvedPolicyId,
                label: resolvedPolicyId,
              })
            }
            emergency={emergency}
            onToggleEmergency={() =>
              toggleHighRisk({
                kind: 'policy',
                id: resolvedPolicyId,
                label: resolvedPolicyId,
              })
            }
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
              activeCopilotDocumentId={activeCopilotDocumentId}
            />
          )}
          {activeTab === 'overview' && (
            <OverviewTab
              stats={overviewStatsMock}
              transactionsOverTime={overviewTransactionsOverTimeMock}
              transactions={overviewTransactionsMock}
              quickActions={overviewQuickActionsMock}
              onQuickAction={handleOverviewQuickAction}
            />
          )}
          {activeTab === 'analytics' && <PolicyAnalyticsDashboard policyId={policyId} />}
        </Box>
      </Box>
    </Box>
  )
}

export default PolicyDetails

import Box from '@mui/material/Box'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import type { RecentActivityItem } from '@/app/data/homeMock'
import { useFavorites } from '@/app/contexts/FavoritesContext'
import { useRightTool } from '@/app/contexts/RightToolContext'
import {
  useRegisterRightToolCopilot,
  useRegisterRightToolCopilotCustom,
  useRegisterRightToolFilter,
  useRegisterRightToolParties,
  useRegisterRightToolRecordContext,
} from '@/app/hooks/useRightToolRegistration'
import { ActivityDetailsPanel } from '@/app/pages/home/ActivityDetailsPanel'
import { layoutTokens } from '@/design-system/tokens/layout'
import { InsuredAnalyticsDashboard } from '@/pages/insureds/components/InsuredAnalyticsDashboard'
import { InsuredContactsPanel } from '@/pages/insureds/components/InsuredContactsPanel'
import { InsuredHeader } from '@/pages/insureds/components/InsuredHeader'
import { InsuredOverviewTab } from '@/pages/insureds/components/InsuredOverviewTab'
import type { InsuredTab } from '@/pages/insureds/components/InsuredTabs'
import {
  getInsuredOverviewStats,
  resolveInsuredContext,
} from '@/pages/insureds/data/resolveInsuredContext'
import {
  getInsuredActivityItems,
  getInsuredClaims,
  getInsuredPolicies,
  getInsuredPrimaryPolicyNumber,
} from '@/pages/insureds/data/mockInsuredOverview'
import { type DocumentAttachMode, type DocumentAttachTarget } from '@/pages/policies/components/DocumentAttachComposer'
import { DocumentsFilterPanel } from '@/pages/policies/components/DocumentsFilterPanel'
import { DocumentsTab } from '@/pages/policies/components/DocumentsTab'
import {
  policyDocumentsCopilotInsights,
  policyDocumentsCopilotSummary,
} from '@/pages/policies/data/documentsCopilotContent'
import { policyDocumentsMock, type PolicyDocument } from '@/pages/policies/data/mockDocuments'
import { useIsDesktopLayout } from '@/pages/policies/hooks/useIsDesktopLayout'
import { emptyDocumentsFilters, type DocumentsFilters } from '@/pages/policies/filters/documentsFilterTypes'

function parseInsuredTab(value: string | null): InsuredTab | null {
  if (value === 'overview' || value === 'documents' || value === 'analytics') {
    return value
  }
  return null
}

const insuredDocumentsCopilotSummary =
  'Account documents span **all policies** for this insured — renewals, endorsements, claims, and correspondence. The latest package arrived **today** from the producer portal.'

const insuredDocumentsCopilotInsights = [
  'Fleet schedule update received — account-wide',
  'Renewal proposal package on Commercial Auto',
  'Loss control report attached to GL',
  'COI issued for Harbor View contract',
  ...policyDocumentsCopilotInsights.slice(0, 2),
]

export function InsuredDetails() {
  const { insuredId } = useParams<{ insuredId: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const insured = useMemo(() => resolveInsuredContext(insuredId), [insuredId])
  const isDesktop = useIsDesktopLayout()
  const { openTool, closeTool, activeTool } = useRightTool()
  const { isFavorite, isHighRisk, toggleFavorite, toggleHighRisk } = useFavorites()
  const [activeTab, setActiveTab] = useState<InsuredTab>(
    () => parseInsuredTab(searchParams.get('tab')) ?? 'overview',
  )
  const resolvedInsuredId = decodeURIComponent(insuredId ?? insured.id)
  const starred = isFavorite('insured', resolvedInsuredId)
  const emergency = isHighRisk('insured', resolvedInsuredId)
  const [appliedDocumentsFilters, setAppliedDocumentsFilters] = useState<DocumentsFilters>(emptyDocumentsFilters)
  const [copilotDocumentFocus, setCopilotDocumentFocus] = useState<PolicyDocument | null>(null)
  const [attachMode, setAttachMode] = useState<DocumentAttachMode | null>(null)
  const [focusedActivity, setFocusedActivity] = useState<RecentActivityItem | null>(null)
  const didInitCopilot = useRef(false)
  const wasDesktop = useRef(isDesktop)

  const policies = useMemo(() => getInsuredPolicies(insured), [insured])
  const claims = useMemo(() => getInsuredClaims(insured), [insured])
  const recentActivity = useMemo(() => getInsuredActivityItems(insured), [insured])
  const primaryPolicyNumber = useMemo(() => getInsuredPrimaryPolicyNumber(insured), [insured])
  const stats = useMemo(() => getInsuredOverviewStats(insured), [insured])

  useEffect(() => {
    setFocusedActivity(null)
    setCopilotDocumentFocus(null)
    setAttachMode(null)
  }, [resolvedInsuredId])

  const isDocumentsTab = activeTab === 'documents'
  const activeActivityId =
    activeTool === 'copilot' && focusedActivity && !isDocumentsTab ? focusedActivity.id : null

  const handleClearActivityFocus = useCallback(() => {
    setFocusedActivity(null)
    openTool('copilot')
  }, [openTool])

  const handleActivitySelect = useCallback(
    (activity: RecentActivityItem) => {
      if (focusedActivity?.id === activity.id) {
        setFocusedActivity(null)
        openTool('copilot')
        return
      }
      setCopilotDocumentFocus(null)
      setAttachMode(null)
      setFocusedActivity(activity)
      openTool('copilot')
    },
    [focusedActivity?.id, openTool],
  )

  useRegisterRightToolRecordContext(
    { title: insured.name, subtitle: insured.status },
    [insured.name, insured.status],
  )

  useRegisterRightToolCopilot(
    {
      context: 'insured',
      focusedInsured: insured,
      activePolicyTab: isDocumentsTab ? 'documents' : 'overview',
      focusedDocument: copilotDocumentFocus,
      documentsWorkspaceSummary: isDocumentsTab ? insuredDocumentsCopilotSummary : policyDocumentsCopilotSummary,
      documentsWorkspaceInsights: isDocumentsTab ? insuredDocumentsCopilotInsights : policyDocumentsCopilotInsights,
      attachMode,
      attachContextLabel: insured.name,
      onCloseAttach: () => setAttachMode(null),
      onAttachSave: () => setAttachMode(null),
    },
    // Primitives only — object `insured` identity would re-fire every render and freeze SPA nav.
    [
      attachMode?.target,
      copilotDocumentFocus?.id,
      insured.id,
      insured.name,
      insured.status,
      isDocumentsTab,
    ],
  )

  useRegisterRightToolCopilotCustom(
    !isDocumentsTab && focusedActivity ? (
      <ActivityDetailsPanel
        activity={focusedActivity}
        onBack={handleClearActivityFocus}
        onClose={() => {
          setFocusedActivity(null)
          closeTool()
        }}
      />
    ) : null,
    [closeTool, focusedActivity?.id, handleClearActivityFocus, isDocumentsTab],
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

  useRegisterRightToolParties(
    <InsuredContactsPanel contacts={insured.contacts} onClose={closeTool} />,
    // Prefer insured id — contacts array identity is fine once `insured` is memoized.
    [insured.id, closeTool],
  )

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
      setFocusedActivity(null)
    }
    wasDesktop.current = isDesktop
  }, [activeTool, closeTool, isDesktop])

  const syncTabPanels = useCallback(
    (tab: InsuredTab) => {
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

  const tabFromUrl = parseInsuredTab(searchParams.get('tab')) ?? 'overview'

  useEffect(() => {
    setActiveTab(tabFromUrl)
    setCopilotDocumentFocus(null)
    setAttachMode(null)
    setFocusedActivity(null)
    // Ref avoids openTool/activeTool identity changes re-entering this effect.
    syncTabPanelsRef.current(tabFromUrl)
  }, [tabFromUrl])

  const handleTabChange = useCallback(
    (tab: InsuredTab) => {
      setActiveTab(tab)
      setCopilotDocumentFocus(null)
      setAttachMode(null)
      setFocusedActivity(null)
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

  const handleDocumentOpen = useCallback(
    (document: PolicyDocument) => {
      navigate(`/policies/${encodeURIComponent(primaryPolicyNumber)}/documents/${document.id}`)
    },
    [navigate, primaryPolicyNumber],
  )

  const getDocumentHref = useCallback(
    (document: PolicyDocument) =>
      `/policies/${encodeURIComponent(primaryPolicyNumber)}/documents/${document.id}`,
    [primaryPolicyNumber],
  )

  const handleAttachTo = useCallback(
    (target: DocumentAttachTarget, documents: PolicyDocument[]) => {
      setAttachMode({ target, documents })
      setCopilotDocumentFocus(documents[0] ?? null)
      setFocusedActivity(null)
      openTool('copilot')
    },
    [openTool],
  )

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
          <InsuredHeader
            insured={insured}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            starred={starred}
            onToggleStar={() =>
              toggleFavorite({
                kind: 'insured',
                id: resolvedInsuredId,
                label: insured.name,
              })
            }
            emergency={emergency}
            onToggleEmergency={() =>
              toggleHighRisk({
                kind: 'insured',
                id: resolvedInsuredId,
                label: insured.name,
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
            <InsuredOverviewTab
              insured={insured}
              stats={stats}
              policies={policies}
              claims={claims}
              recentActivity={recentActivity}
              onActivitySelect={handleActivitySelect}
              activeActivityId={activeActivityId}
            />
          )}
          {activeTab === 'analytics' && <InsuredAnalyticsDashboard insured={insured} />}
        </Box>
      </Box>
    </Box>
  )
}

export default InsuredDetails

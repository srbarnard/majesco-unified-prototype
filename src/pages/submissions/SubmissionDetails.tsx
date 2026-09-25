import Box from '@mui/material/Box'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router'
import { useFavorites } from '@/app/contexts/FavoritesContext'
import { useRightTool, useRightToolDispatch } from '@/app/contexts/RightToolContext'
import type { RecentActivityItem } from '@/app/data/homeMock'
import {
  useRegisterRightToolCopilot,
  useRegisterRightToolCopilotCustom,
  useRegisterRightToolFilter,
  useRegisterRightToolParties,
  useRegisterRightToolRecordContext,
} from '@/app/hooks/useRightToolRegistration'
import { ActivityDetailsPanel } from '@/app/pages/home/ActivityDetailsPanel'
import { layoutTokens } from '@/design-system/tokens/layout'
import { type DocumentAttachMode, type DocumentAttachTarget, quickActionToAttachTarget } from '@/pages/policies/components/DocumentAttachComposer'
import { DocumentsFilterPanel } from '@/pages/policies/components/DocumentsFilterPanel'
import { DocumentsTab } from '@/pages/policies/components/DocumentsTab'
import { PartiesPanel } from '@/pages/policies/components/PartiesPanel'
import { useIsDesktopLayout } from '@/pages/policies/hooks/useIsDesktopLayout'
import {
  submissionDocumentsCopilotInsights,
  submissionDocumentsCopilotSummary,
} from '@/pages/policies/data/documentsCopilotContent'
import type { PolicyDocument } from '@/pages/policies/data/mockDocuments'
import { emptyDocumentsFilters, type DocumentsFilters } from '@/pages/policies/filters/documentsFilterTypes'
import { SubmissionDetailHeader } from '@/pages/submissions/components/SubmissionDetailHeader'
import type { SubmissionDetailTab } from '@/pages/submissions/components/SubmissionDetailTabs'
import { SubmissionOverviewTab } from '@/pages/submissions/components/SubmissionOverviewTab'
import { SubmissionUnderwritingTab } from '@/pages/submissions/components/SubmissionUnderwritingTab'
import { SubmissionsCopilotPanel } from '@/pages/submissions/components/SubmissionsCopilotPanel'
import type { SubmissionsCopilotSendConfirmation } from '@/pages/submissions/components/SubmissionsCopilotPanel'
import type {
  SubmissionCopilotEntryMode,
  SubmissionDetailLocationState,
} from '@/pages/submissions/data/submissionCopilotInsights'
import { isSubmissionNoteActivity } from '@/pages/submissions/data/mockSubmissionActivity'
import { getSubmissionDocuments } from '@/pages/submissions/data/mockSubmissionDocuments'
import {
  resolveSubmissionContext,
  toSubmissionListRecord,
  type SubmissionDetailsRecord,
} from '@/pages/submissions/data/resolveSubmissionContext'
import {
  buildQuotePackageSent,
  submissionsMock,
  syncSubmissionListRecord,
  type SubmissionStatus,
} from '@/pages/submissions/data/mockSubmissions'

function parseSubmissionTab(value: string | null): SubmissionDetailTab | null {
  if (value === 'overview' || value === 'documents' || value === 'underwriting') {
    return value
  }
  // Legacy ?tab=activity bookmarks land on Overview (activity rail lives there now).
  if (value === 'activity') return 'overview'
  return null
}

function formatResolvedTimestamp(date = new Date()) {
  return date
    .toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    .replace(',', '')
    .replace(/\s+(AM|PM)/i, (_, meridiem: string) => meridiem.toLowerCase())
}

function shouldDefaultOpenCopilot(tab: SubmissionDetailTab) {
  return tab === 'overview' || tab === 'documents'
}

function defaultCopilotEntryMode(status: SubmissionStatus): SubmissionCopilotEntryMode {
  // Blocked → Submission briefing; Ready → Structure review; Quoted/Declined → confirmation
  return status === 'Blocked' ? 'insight' : 'status'
}

export function SubmissionDetails() {
  const { submissionId } = useParams<{ submissionId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const locationState = (location.state as SubmissionDetailLocationState | null) ?? null
  const [submission, setSubmission] = useState<SubmissionDetailsRecord>(() =>
    resolveSubmissionContext(submissionId),
  )
  const isDesktop = useIsDesktopLayout()
  const { openTool, closeTool, activeTool } = useRightTool()
  const { setNoteAttachMode } = useRightToolDispatch()
  const { isFavorite, isHighRisk, toggleFavorite, toggleHighRisk } = useFavorites()
  const [activeTab, setActiveTab] = useState<SubmissionDetailTab>(
    () => parseSubmissionTab(searchParams.get('tab')) ?? 'overview',
  )
  const starred = isFavorite('submission', submission.id)
  const emergency = isHighRisk('submission', submission.id)
  const [copilotEntryMode, setCopilotEntryMode] = useState<SubmissionCopilotEntryMode>(() =>
    locationState?.entryMode ?? defaultCopilotEntryMode(resolveSubmissionContext(submissionId).status),
  )
  const [appliedDocumentsFilters, setAppliedDocumentsFilters] = useState<DocumentsFilters>(emptyDocumentsFilters)
  const [copilotDocumentFocus, setCopilotDocumentFocus] = useState<PolicyDocument | null>(null)
  const [attachMode, setAttachMode] = useState<DocumentAttachMode | null>(null)
  const [focusedActivity, setFocusedActivity] = useState<RecentActivityItem | null>(null)
  const [copilotIssueFocusId, setCopilotIssueFocusId] = useState<string | null>(null)
  const [copilotSendConfirmation, setCopilotSendConfirmation] =
    useState<SubmissionsCopilotSendConfirmation | null>(
      () =>
        (locationState?.sendConfirmation as SubmissionsCopilotSendConfirmation | null | undefined) ??
        null,
    )
  const didInitCopilot = useRef(false)
  const wasDesktop = useRef(isDesktop)
  const clearedLocationState = useRef(false)

  useEffect(() => {
    const next = resolveSubmissionContext(submissionId)
    setSubmission(next)
    setFocusedActivity(null)
    setCopilotIssueFocusId(null)
    const state = (window.history.state as SubmissionDetailLocationState | null) ?? null
    setCopilotEntryMode(state?.entryMode ?? defaultCopilotEntryMode(next.status))
    setCopilotSendConfirmation(
      (state?.sendConfirmation as SubmissionsCopilotSendConfirmation | null | undefined) ?? null,
    )
  }, [submissionId])

  useEffect(() => {
    // Keep detail Copilot in structure / confirmation mode for Ready, Quoted, Declined.
    if (
      submission.status === 'Ready' ||
      submission.status === 'Quoted' ||
      submission.status === 'Declined'
    ) {
      setCopilotEntryMode('status')
    }
  }, [submission.status])

  useEffect(() => {
    if (clearedLocationState.current) return
    if (!locationState) return
    clearedLocationState.current = true
    if (locationState.openCopilot !== false && isDesktop) {
      openTool('copilot')
    }
    navigate(location.pathname + location.search, { replace: true, state: null })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const focusedListRecord = useMemo(() => toSubmissionListRecord(submission), [submission])
  const isDocumentsTab = activeTab === 'documents'

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
      setCopilotIssueFocusId(null)
      setCopilotEntryMode(defaultCopilotEntryMode(submission.status))
      setFocusedActivity(activity)
      openTool(isSubmissionNoteActivity(activity) ? 'notes' : 'copilot')
    },
    [focusedActivity?.id, openTool],
  )

  const handleIssueSelect = useCallback(
    (issueId: string) => {
      if (copilotIssueFocusId === issueId) {
        setCopilotIssueFocusId(null)
        setCopilotEntryMode('insight')
        setFocusedActivity(null)
        openTool('copilot')
        return
      }
      setFocusedActivity(null)
      setCopilotDocumentFocus(null)
      setAttachMode(null)
      setCopilotEntryMode('status')
      setCopilotIssueFocusId(issueId)
      openTool('copilot')
    },
    [copilotIssueFocusId, openTool],
  )

  useRegisterRightToolRecordContext(
    { title: submission.insuredName, subtitle: submission.submissionNumber },
    [submission.insuredName, submission.submissionNumber],
  )

  // Documents tab uses standard CopilotPanel; overview uses SubmissionsCopilotPanel
  // (or ActivityDetailsPanel when a Recent activity row is selected).
  useRegisterRightToolCopilot(
    isDocumentsTab
      ? {
          context: 'submission-detail',
          activePolicyTab: 'documents',
          focusedDocument: copilotDocumentFocus,
          documentsWorkspaceSummary: submissionDocumentsCopilotSummary,
          documentsWorkspaceInsights: submissionDocumentsCopilotInsights,
          attachMode,
          attachContextLabel: submission.submissionNumber,
          onCloseAttach: () => setAttachMode(null),
          onAttachSave: () => setAttachMode(null),
          onQuickAction: (action) => {
            const target = quickActionToAttachTarget(action)
            if (target === 'note' && copilotDocumentFocus) {
              setNoteAttachMode({ target: 'note', documents: [copilotDocumentFocus] })
              openTool('notes')
              return
            }
            if (target === 'email' && copilotDocumentFocus) {
              setAttachMode({ target: 'email', documents: [copilotDocumentFocus] })
              openTool('email')
            }
          },
        }
      : null,
    [attachMode?.target, copilotDocumentFocus?.id, isDocumentsTab, submission.submissionNumber],
  )

  useRegisterRightToolCopilotCustom(
    isDocumentsTab ? null : focusedActivity && !isSubmissionNoteActivity(focusedActivity) ? (
      <ActivityDetailsPanel
        activity={focusedActivity}
        onBack={handleClearActivityFocus}
        onClose={() => {
          setFocusedActivity(null)
          closeTool()
        }}
      />
    ) : (
      <SubmissionsCopilotPanel
        key={`detail-copilot-${focusedListRecord.id}-${focusedListRecord.status}`}
        focusedSubmission={focusedListRecord}
        queueSubmissions={submissionsMock}
        entryMode={
          focusedListRecord.status === 'Ready' ||
          focusedListRecord.status === 'Quoted' ||
          focusedListRecord.status === 'Declined'
            ? 'status'
            : copilotEntryMode
        }
        initialIssueId={copilotIssueFocusId}
        onEntryModeChange={(mode) => {
          setCopilotEntryMode(mode)
          if (mode === 'insight') setCopilotIssueFocusId(null)
        }}
        onResolveIssue={(_id, issueId, resolvedDetails) => {
          setSubmission((current) => {
            const issues = current.issues.map((issue) => {
              if (issue.id !== issueId) return issue
              return {
                ...issue,
                resolvedAt: formatResolvedTimestamp(),
                resolvedDetails,
                summary: 'Premium can now be estimated',
              }
            })

            const remainingBlockers = issues.filter(
              (issue) => issue.severity === 'blocking' && !issue.resolvedAt,
            )
            const remainingIssues = issues.filter((issue) => !issue.resolvedAt)
            const nextConfidence = Math.min(96, current.confidence + 9)
            const nextIssueId = remainingBlockers.length === 0 ? null : (remainingIssues[0]?.id ?? null)

            if (remainingBlockers.length === 0) {
              const next = {
                ...current,
                status: 'Ready' as const,
                confidence: Math.max(nextConfidence, 88),
                issues: remainingIssues,
                hasAlert: remainingIssues.some((issue) => issue.severity === 'warning'),
                premiumEstimates: current.premiumEstimates ?? [
                  {
                    label: 'Balanced' as const,
                    range: '$900K - $1.1M',
                    rationale: 'Best fit after blockers cleared — alternatives not yet differentiated.',
                    recommended: true,
                  },
                ],
                readyInsights: current.readyInsights ?? [
                  {
                    id: `${current.id}-depth`,
                    title: 'Limited Loss History Depth',
                    summary: 'Less than 3 years of claims data.',
                    severity: 'warning' as const,
                  },
                ],
              }
              syncSubmissionListRecord(toSubmissionListRecord(next))
              queueMicrotask(() => {
                setCopilotIssueFocusId(null)
                setCopilotEntryMode('status')
                setCopilotSendConfirmation(null)
              })
              return next
            }

            queueMicrotask(() => {
              setCopilotIssueFocusId(nextIssueId)
            })

            return {
              ...current,
              confidence: nextConfidence,
              issues,
              hasAlert: true,
            }
          })
        }}
        onApprovePremiumOption={(_id, recommended, included, recipient) => {
          const quotePackageSent = buildQuotePackageSent(recommended, included, recipient)
          setSubmission((current) => {
            const next = {
              ...current,
              approvedPremiumLabel: recommended.label,
              status: 'Quoted' as const,
              quotePackageSent,
            }
            syncSubmissionListRecord(toSubmissionListRecord(next))
            return next
          })
          setCopilotEntryMode('status')
          setActiveTab('overview')
        }}
        onDeclineSubmission={(_id, _recipient) => {
          setSubmission((current) => {
            const next = {
              ...current,
              status: 'Declined' as const,
              quotePackageSent: undefined,
              approvedPremiumLabel: undefined,
            }
            syncSubmissionListRecord(toSubmissionListRecord(next))
            return next
          })
          setCopilotEntryMode('status')
          setActiveTab('overview')
        }}
        sendConfirmation={
          copilotSendConfirmation &&
          copilotSendConfirmation.submissionId === focusedListRecord.id
            ? copilotSendConfirmation
            : null
        }
        onSendConfirmation={setCopilotSendConfirmation}
        onOpenNextReadySubmission={(next) => {
          setCopilotSendConfirmation(null)
          navigate(`/submissions/${encodeURIComponent(next.submissionNumber)}`, {
            state: {
              openCopilot: true,
              entryMode: 'status',
            } satisfies SubmissionDetailLocationState,
          })
        }}
        onOpenNextBlockedSubmission={(next) => {
          setCopilotSendConfirmation(null)
          navigate(`/submissions/${encodeURIComponent(next.submissionNumber)}`, {
            state: {
              openCopilot: true,
              entryMode: 'status',
            } satisfies SubmissionDetailLocationState,
          })
        }}
        onClose={closeTool}
      />
    ),
    [
      closeTool,
      copilotEntryMode,
      copilotIssueFocusId,
      copilotSendConfirmation,
      focusedActivity,
      focusedListRecord,
      focusedListRecord.status,
      handleClearActivityFocus,
      isDocumentsTab,
      navigate,
    ],
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
    <PartiesPanel parties={submission.parties} onClose={closeTool} />,
    [submission.parties, closeTool],
  )

  useEffect(() => {
    if (didInitCopilot.current) return
    didInitCopilot.current = true
    if (isDesktop && shouldDefaultOpenCopilot(activeTab)) {
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
      setCopilotIssueFocusId(null)
    }
    wasDesktop.current = isDesktop
  }, [activeTool, closeTool, isDesktop])

  // Backdrop / swipe dismiss of the mobile sheet only calls closeTool — clear selection too.
  useEffect(() => {
    if (activeTool != null || !focusedActivity) return
    setFocusedActivity(null)
  }, [activeTool, focusedActivity])

  const syncTabPanels = useCallback(
    (tab: SubmissionDetailTab) => {
      setFocusedActivity(null)
      setCopilotIssueFocusId(null)
      setCopilotEntryMode(defaultCopilotEntryMode(submission.status))
      if (shouldDefaultOpenCopilot(tab)) {
        if (activeTool === 'parties' || activeTool === 'filter') return
        if (isDesktop) openTool('copilot')
        return
      }
      closeTool()
    },
    [activeTool, closeTool, isDesktop, openTool, submission.status],
  )

  const syncTabPanelsRef = useRef(syncTabPanels)
  syncTabPanelsRef.current = syncTabPanels

  const tabFromUrl = parseSubmissionTab(searchParams.get('tab'))

  useEffect(() => {
    if (!tabFromUrl) return

    setActiveTab(tabFromUrl)
    setCopilotDocumentFocus(null)
    setAttachMode(null)
    // Ref avoids openTool/activeTool identity changes re-entering this effect.
    syncTabPanelsRef.current(tabFromUrl)
  }, [tabFromUrl])

  const handleStatusClick = useCallback(() => {
    setFocusedActivity(null)
    setCopilotIssueFocusId(null)
    setCopilotEntryMode('status')
    setAttachMode(null)
    openTool('copilot')
  }, [openTool])

  const handleTabChange = useCallback(
    (tab: SubmissionDetailTab) => {
      setActiveTab(tab)
      setCopilotDocumentFocus(null)
      setAttachMode(null)
      setFocusedActivity(null)
      setCopilotIssueFocusId(null)
      syncTabPanels(tab)
    },
    [syncTabPanels],
  )

  const handleDocumentOpen = useCallback(
    (document: PolicyDocument) => {
      navigate(`/submissions/${submissionId}/documents/${document.id}`)
    },
    [navigate, submissionId],
  )

  const getDocumentHref = useCallback(
    (document: PolicyDocument) => `/submissions/${submissionId}/documents/${document.id}`,
    [submissionId],
  )

  const handleAttachTo = useCallback(
    (target: DocumentAttachTarget, documents: PolicyDocument[]) => {
      if (target === 'note') {
        setNoteAttachMode({ target: 'note', documents })
        openTool('notes')
        return
      }
      setNoteAttachMode(null)
      setAttachMode({ target, documents })
      setCopilotDocumentFocus(documents[0] ?? null)
      openTool('copilot')
    },
    [openTool, setNoteAttachMode],
  )

  const handleAssign = useCallback(() => {
    openTool('parties')
  }, [openTool])

  const activeCopilotDocumentId =
    activeTool === 'copilot' && copilotDocumentFocus ? copilotDocumentFocus.id : null
  const activeActivityId =
    focusedActivity &&
    ((activeTool === 'copilot' && !isSubmissionNoteActivity(focusedActivity)) ||
      (activeTool === 'notes' && isSubmissionNoteActivity(focusedActivity)))
      ? focusedActivity.id
      : null
  const activeIssueId =
    activeTool === 'copilot' && !focusedActivity && copilotIssueFocusId
      ? copilotIssueFocusId
      : null

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
          <SubmissionDetailHeader
            submission={submission}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onStatusClick={handleStatusClick}
            starred={starred}
            onToggleStar={() =>
              toggleFavorite({
                kind: 'submission',
                id: submission.id,
                label: submission.submissionNumber,
              })
            }
            emergency={emergency}
            onToggleEmergency={() =>
              toggleHighRisk({
                kind: 'submission',
                id: submission.id,
                label: submission.submissionNumber,
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
              documents={getSubmissionDocuments(submission.id)}
              appliedFilters={appliedDocumentsFilters}
              onDocumentOpen={handleDocumentOpen}
              getDocumentHref={getDocumentHref}
              onAttachTo={handleAttachTo}
              activeCopilotDocumentId={activeCopilotDocumentId}
            />
          )}
          {activeTab === 'overview' && (
            <SubmissionOverviewTab
              submission={submission}
              onActivitySelect={handleActivitySelect}
              activeActivityId={activeActivityId}
              onIssueSelect={handleIssueSelect}
              activeIssueId={activeIssueId}
            />
          )}
          {activeTab === 'underwriting' && (
            <SubmissionUnderwritingTab submission={submission} onAssign={handleAssign} />
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default SubmissionDetails

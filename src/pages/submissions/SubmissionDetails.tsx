import Box from '@mui/material/Box'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { useFavorites } from '@/app/contexts/FavoritesContext'
import { useRightTool } from '@/app/contexts/RightToolContext'
import type { RecentActivityItem } from '@/app/data/homeMock'
import {
  useRegisterRightToolCopilot,
  useRegisterRightToolCopilotCustom,
  useRegisterRightToolFilter,
  useRegisterRightToolNotesCustom,
  useRegisterRightToolParties,
  useRegisterRightToolRecordContext,
} from '@/app/hooks/useRightToolRegistration'
import { ActivityDetailsPanel } from '@/app/pages/home/ActivityDetailsPanel'
import { layoutTokens } from '@/design-system/tokens/layout'
import { type DocumentAttachMode, type DocumentAttachTarget } from '@/pages/policies/components/DocumentAttachComposer'
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
import { SubmissionsNotesPanel } from '@/pages/submissions/components/SubmissionsNotesPanel'
import type { SubmissionCopilotEntryMode } from '@/pages/submissions/data/submissionCopilotInsights'
import { isSubmissionNoteActivity } from '@/pages/submissions/data/mockSubmissionActivity'
import { findNoteThreadForActivityNote } from '@/pages/submissions/data/mockSubmissionNotes'
import { getSubmissionDocuments } from '@/pages/submissions/data/mockSubmissionDocuments'
import {
  resolveSubmissionContext,
  toSubmissionListRecord,
  type SubmissionDetailsRecord,
} from '@/pages/submissions/data/resolveSubmissionContext'
import type { PremiumEstimate } from '@/pages/submissions/data/mockSubmissions'

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

export function SubmissionDetails() {
  const { submissionId } = useParams<{ submissionId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [submission, setSubmission] = useState<SubmissionDetailsRecord>(() =>
    resolveSubmissionContext(submissionId),
  )
  const isDesktop = useIsDesktopLayout()
  const { openTool, closeTool, activeTool } = useRightTool()
  const { isFavorite, isHighRisk, toggleFavorite, toggleHighRisk } = useFavorites()
  const [activeTab, setActiveTab] = useState<SubmissionDetailTab>(
    () => parseSubmissionTab(searchParams.get('tab')) ?? 'overview',
  )
  const starred = isFavorite('submission', submission.id)
  const emergency = isHighRisk('submission', submission.id)
  const [copilotEntryMode, setCopilotEntryMode] = useState<SubmissionCopilotEntryMode>('insight')
  const [appliedDocumentsFilters, setAppliedDocumentsFilters] = useState<DocumentsFilters>(emptyDocumentsFilters)
  const [copilotDocumentFocus, setCopilotDocumentFocus] = useState<PolicyDocument | null>(null)
  const [attachMode, setAttachMode] = useState<DocumentAttachMode | null>(null)
  const [focusedActivity, setFocusedActivity] = useState<RecentActivityItem | null>(null)
  const [copilotIssueFocusId, setCopilotIssueFocusId] = useState<string | null>(null)
  const didInitCopilot = useRef(false)
  const wasDesktop = useRef(isDesktop)

  useEffect(() => {
    setSubmission(resolveSubmissionContext(submissionId))
    setFocusedActivity(null)
    setCopilotIssueFocusId(null)
  }, [submissionId])

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
      setCopilotEntryMode('insight')
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
        }
      : null,
    [attachMode?.target, copilotDocumentFocus?.id, isDocumentsTab, submission.submissionNumber],
  )

  const focusedNoteThreadId = useMemo(() => {
    if (!focusedActivity || !isSubmissionNoteActivity(focusedActivity)) return null
    return (
      findNoteThreadForActivityNote(submission.id, submission.notes, focusedActivity.detail)?.id ?? null
    )
  }, [focusedActivity, submission.id, submission.notes])

  useRegisterRightToolNotesCustom(
    !isDocumentsTab && focusedActivity && focusedNoteThreadId ? (
      <SubmissionsNotesPanel
        focusedSubmission={focusedListRecord}
        initialThreadId={focusedNoteThreadId}
        onBack={handleClearActivityFocus}
        onClose={() => {
          setFocusedActivity(null)
          closeTool()
        }}
        onSaveNote={(_submissionId, note) => {
          setSubmission((current) => ({
            ...current,
            notes: [note, ...current.notes.filter((existing) => existing !== note)],
          }))
        }}
      />
    ) : null,
    [closeTool, focusedActivity, focusedListRecord, focusedNoteThreadId, handleClearActivityFocus, isDocumentsTab],
  )

  useRegisterRightToolCopilotCustom(
    isDocumentsTab ? null : focusedActivity && !focusedNoteThreadId ? (
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
        focusedSubmission={focusedListRecord}
        entryMode={copilotEntryMode}
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

            queueMicrotask(() => {
              setCopilotIssueFocusId(nextIssueId)
              if (!nextIssueId) setCopilotEntryMode('insight')
            })

            if (remainingBlockers.length === 0) {
              return {
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
            }

            return {
              ...current,
              confidence: nextConfidence,
              issues,
              hasAlert: true,
            }
          })
        }}
        onApprovePremiumOption={(_id, option: PremiumEstimate) => {
          setSubmission((current) => ({
            ...current,
            approvedPremiumLabel: option.label,
          }))
        }}
        onClose={closeTool}
      />
    ),
    [
      closeTool,
      copilotEntryMode,
      copilotIssueFocusId,
      focusedActivity,
      focusedListRecord,
      focusedNoteThreadId,
      handleClearActivityFocus,
      isDocumentsTab,
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

  const syncTabPanels = useCallback(
    (tab: SubmissionDetailTab) => {
      setFocusedActivity(null)
      setCopilotIssueFocusId(null)
      setCopilotEntryMode('insight')
      if (shouldDefaultOpenCopilot(tab)) {
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
      setAttachMode({ target, documents })
      setCopilotDocumentFocus(documents[0] ?? null)
      openTool('copilot')
    },
    [openTool],
  )

  const handleAssign = useCallback(() => {
    openTool('parties')
  }, [openTool])

  const activeCopilotDocumentId =
    activeTool === 'copilot' && copilotDocumentFocus ? copilotDocumentFocus.id : null
  const activeActivityId =
    focusedActivity &&
    ((activeTool === 'copilot' && !focusedNoteThreadId) ||
      (activeTool === 'notes' && Boolean(focusedNoteThreadId)))
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

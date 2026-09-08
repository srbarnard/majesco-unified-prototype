import Box from '@mui/material/Box'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { useRightTool } from '@/app/contexts/RightToolContext'
import {
  useRegisterRightToolCopilot,
  useRegisterRightToolCopilotCustom,
  useRegisterRightToolFilter,
  useRegisterRightToolParties,
  useRegisterRightToolRecordContext,
} from '@/app/hooks/useRightToolRegistration'
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
import type { SubmissionCopilotEntryMode } from '@/pages/submissions/data/submissionCopilotInsights'
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
  const [activeTab, setActiveTab] = useState<SubmissionDetailTab>(
    () => parseSubmissionTab(searchParams.get('tab')) ?? 'overview',
  )
  const [starred, setStarred] = useState(false)
  const [copilotEntryMode, setCopilotEntryMode] = useState<SubmissionCopilotEntryMode>('insight')
  const [appliedDocumentsFilters, setAppliedDocumentsFilters] = useState<DocumentsFilters>(emptyDocumentsFilters)
  const [copilotDocumentFocus, setCopilotDocumentFocus] = useState<PolicyDocument | null>(null)
  const [attachMode, setAttachMode] = useState<DocumentAttachMode | null>(null)
  const didInitCopilot = useRef(false)
  const wasDesktop = useRef(isDesktop)

  useEffect(() => {
    setSubmission(resolveSubmissionContext(submissionId))
  }, [submissionId])

  const focusedListRecord = useMemo(() => toSubmissionListRecord(submission), [submission])
  const isDocumentsTab = activeTab === 'documents'

  useRegisterRightToolRecordContext(
    { title: submission.insuredName, subtitle: submission.submissionNumber },
    [submission.insuredName, submission.submissionNumber],
  )

  // Documents tab uses standard CopilotPanel; overview uses SubmissionsCopilotPanel.
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

  useRegisterRightToolCopilotCustom(
    isDocumentsTab ? null : (
      <SubmissionsCopilotPanel
        focusedSubmission={focusedListRecord}
        entryMode={copilotEntryMode}
        onEntryModeChange={setCopilotEntryMode}
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
    [closeTool, copilotEntryMode, focusedListRecord, isDocumentsTab],
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
  }, [activeTab, isDesktop, openTool])

  useEffect(() => {
    if (wasDesktop.current && !isDesktop && activeTool === 'copilot') {
      closeTool()
      setAttachMode(null)
      setCopilotDocumentFocus(null)
    }
    wasDesktop.current = isDesktop
  }, [activeTool, closeTool, isDesktop])

  const syncTabPanels = useCallback(
    (tab: SubmissionDetailTab) => {
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
    setCopilotEntryMode('status')
    setAttachMode(null)
    openTool('copilot')
  }, [openTool])

  const handleTabChange = useCallback(
    (tab: SubmissionDetailTab) => {
      setActiveTab(tab)
      setCopilotDocumentFocus(null)
      setAttachMode(null)
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

  const handleOverviewQuickAction = useCallback(
    (actionId: string) => {
      if (actionId === 'documents') {
        handleTabChange('documents')
        return
      }
      if (actionId === 'assign') {
        openTool('parties')
        return
      }
      if (actionId === 'note') {
        openTool('notes')
        return
      }
      if (actionId === 'email') {
        openTool('email')
      }
    },
    [handleTabChange, openTool],
  )

  const handleAssign = useCallback(() => {
    openTool('parties')
  }, [openTool])

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
          <SubmissionDetailHeader
            submission={submission}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onStatusClick={handleStatusClick}
            starred={starred}
            onToggleStar={() => setStarred((prev) => !prev)}
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
              onQuickAction={handleOverviewQuickAction}
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

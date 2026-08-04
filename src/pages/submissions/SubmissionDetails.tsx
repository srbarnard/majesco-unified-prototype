import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { Card } from '@/design-system/components'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { CopilotPanel } from '@/pages/policies/components/CopilotPanel'
import { type DocumentAttachMode, type DocumentAttachTarget } from '@/pages/policies/components/DocumentAttachComposer'
import { DocumentsFilterPanel } from '@/pages/policies/components/DocumentsFilterPanel'
import { DocumentsTab } from '@/pages/policies/components/DocumentsTab'
import { PartiesPanel } from '@/pages/policies/components/PartiesPanel'
import { ResizableRightPanel } from '@/pages/policies/components/ResizableRightPanel'
import { useIsDesktopLayout } from '@/pages/policies/hooks/useIsDesktopLayout'
import {
  resolveOverviewCopilotPanel,
  useCloseCopilotWhenMobile,
  useDesktopCopilotInitialOpen,
} from '@/pages/policies/hooks/useResponsiveCopilotPanel'
import {
  submissionDocumentsCopilotInsights,
  submissionDocumentsCopilotSummary,
} from '@/pages/policies/data/documentsCopilotContent'
import type { PolicyDocument } from '@/pages/policies/data/mockDocuments'
import { emptyDocumentsFilters, type DocumentsFilters } from '@/pages/policies/filters/documentsFilterTypes'
import { SubmissionDetailHeader, type SubmissionRightPanel } from '@/pages/submissions/components/SubmissionDetailHeader'
import type { SubmissionDetailTab } from '@/pages/submissions/components/SubmissionDetailTabs'
import { SubmissionOverviewTab } from '@/pages/submissions/components/SubmissionOverviewTab'
import { SubmissionsCopilotPanel } from '@/pages/submissions/components/SubmissionsCopilotPanel'
import type { SubmissionCopilotEntryMode } from '@/pages/submissions/data/submissionCopilotInsights'
import { getSubmissionDocuments } from '@/pages/submissions/data/mockSubmissionDocuments'
import {
  getSubmissionOverviewStats,
  resolveSubmissionContext,
  toSubmissionListRecord,
  type SubmissionDetailsRecord,
} from '@/pages/submissions/data/resolveSubmissionContext'
import type { PremiumEstimate } from '@/pages/submissions/data/mockSubmissions'

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

function parseSubmissionTab(value: string | null): SubmissionDetailTab | null {
  if (value === 'overview' || value === 'documents' || value === 'underwriting' || value === 'activity') {
    return value
  }
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

export function SubmissionDetails() {
  const { submissionId } = useParams<{ submissionId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [submission, setSubmission] = useState<SubmissionDetailsRecord>(() =>
    resolveSubmissionContext(submissionId),
  )
  const isDesktop = useIsDesktopLayout()
  const [activeTab, setActiveTab] = useState<SubmissionDetailTab>(
    () => parseSubmissionTab(searchParams.get('tab')) ?? 'overview',
  )
  const [starred, setStarred] = useState(false)
  const [activeRightPanel, setActiveRightPanel] = useState<SubmissionRightPanel | null>(null)
  const [copilotEntryMode, setCopilotEntryMode] = useState<SubmissionCopilotEntryMode>('insight')
  const [documentsFilterOpen, setDocumentsFilterOpen] = useState(false)
  const [appliedDocumentsFilters, setAppliedDocumentsFilters] = useState<DocumentsFilters>(emptyDocumentsFilters)
  const [copilotDocumentFocus, setCopilotDocumentFocus] = useState<PolicyDocument | null>(null)
  const [attachMode, setAttachMode] = useState<DocumentAttachMode | null>(null)

  useEffect(() => {
    setSubmission(resolveSubmissionContext(submissionId))
  }, [submissionId])

  useDesktopCopilotInitialOpen(
    isDesktop,
    activeTab === 'overview' || activeTab === 'documents',
    'copilot',
    setActiveRightPanel,
  )
  useCloseCopilotWhenMobile(isDesktop, activeRightPanel, 'copilot', setActiveRightPanel)

  useEffect(() => {
    const tab = parseSubmissionTab(searchParams.get('tab'))
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

  const focusedListRecord = useMemo(() => toSubmissionListRecord(submission), [submission])
  const stats = useMemo(() => getSubmissionOverviewStats(submission), [submission])
  const isDocumentsTab = activeTab === 'documents'
  const showDocumentsCopilot = isDocumentsTab && activeRightPanel === 'copilot'
  const showSubmissionCopilot = !isDocumentsTab && activeRightPanel === 'copilot'
  const rightPanelOpen = documentsFilterOpen || activeRightPanel !== null

  const handleToggleRightPanel = useCallback((panel: SubmissionRightPanel) => {
    if (panel === 'copilot') {
      setCopilotDocumentFocus(null)
      setAttachMode(null)
      setCopilotEntryMode('insight')
    }
    setActiveRightPanel((current) => {
      if (current === panel) return null
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

  const handleCloseMobileRightPanel = useCallback(() => {
    if (documentsFilterOpen) {
      handleCloseDocumentsFilter()
      return
    }
    handleCloseRightPanel()
  }, [documentsFilterOpen, handleCloseDocumentsFilter, handleCloseRightPanel])

  const handleStatusClick = useCallback(() => {
    setCopilotEntryMode('status')
    setDocumentsFilterOpen(false)
    setAttachMode(null)
    setActiveRightPanel('copilot')
  }, [])

  const handleTabChange = useCallback(
    (tab: SubmissionDetailTab) => {
      setActiveTab(tab)
      setCopilotDocumentFocus(null)
      setDocumentsFilterOpen(false)
      setAttachMode(null)

      if (tab === 'overview') {
        setActiveRightPanel((current) =>
          resolveOverviewCopilotPanel(isDesktop, current, 'copilot', 'parties'),
        )
        return
      }

      if (tab === 'documents') {
        setActiveRightPanel(isDesktop ? 'copilot' : null)
        return
      }

      setActiveRightPanel((current) => (current === 'copilot' ? null : current))
    },
    [isDesktop],
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

  const handleResolveIssue = useCallback(
    (_submissionId: string, issueId: string, resolvedDetails: string[]) => {
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
    },
    [],
  )

  const handleApprovePremiumOption = useCallback(
    (_submissionId: string, option: PremiumEstimate) => {
      setSubmission((current) => ({
        ...current,
        approvedPremiumLabel: option.label,
      }))
    },
    [],
  )

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
            activeRightPanel={activeRightPanel}
            onToggleRightPanel={handleToggleRightPanel}
            documentsFilterOpen={documentsFilterOpen}
            onToggleDocumentsFilter={handleToggleDocumentsFilter}
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
              activeCopilotDocumentId={copilotDocumentFocus?.id ?? null}
            />
          )}
          {activeTab === 'overview' && (
            <SubmissionOverviewTab submission={submission} stats={stats} />
          )}
          {activeTab === 'underwriting' && (
            <Card title="Underwriting">
              <Stack spacing={1.5}>
                {(submission.notes.length > 0
                  ? submission.notes
                  : ['Underwriting notes for this submission will appear here.']
                ).map((note) => (
                  <Typography key={note} variant="body2" color="text.secondary" sx={bodySx}>
                    {note}
                  </Typography>
                ))}
              </Stack>
            </Card>
          )}
          {activeTab === 'activity' && (
            <Card title="Activity">
              <Typography variant="body2" color="text.secondary" sx={bodySx}>
                Intake, clearance, and producer activity for this submission will appear here.
              </Typography>
            </Card>
          )}
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
        {activeRightPanel === 'parties' && (
          <PartiesPanel parties={submission.parties} onClose={handleCloseRightPanel} />
        )}
        {showDocumentsCopilot && (
          <CopilotPanel
            context="submission-detail"
            activePolicyTab="documents"
            focusedDocument={copilotDocumentFocus}
            documentsWorkspaceSummary={submissionDocumentsCopilotSummary}
            documentsWorkspaceInsights={submissionDocumentsCopilotInsights}
            attachMode={attachMode}
            attachContextLabel={submission.submissionNumber}
            onCloseAttach={handleCloseAttach}
            onAttachSave={handleAttachSave}
            onClose={() => {
              setCopilotDocumentFocus(null)
              setAttachMode(null)
              handleCloseRightPanel()
            }}
          />
        )}
        {showSubmissionCopilot && (
          <SubmissionsCopilotPanel
            focusedSubmission={focusedListRecord}
            entryMode={copilotEntryMode}
            onEntryModeChange={setCopilotEntryMode}
            onResolveIssue={handleResolveIssue}
            onApprovePremiumOption={handleApprovePremiumOption}
            onClose={handleCloseRightPanel}
          />
        )}
      </ResizableRightPanel>
    </Box>
  )
}

export default SubmissionDetails

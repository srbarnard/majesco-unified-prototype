import Box from '@mui/material/Box'
import { useGridApiRef, type GridRowSelectionModel } from '@mui/x-data-grid-premium'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useRightTool } from '@/app/contexts/RightToolContext'
import {
  useRegisterRightToolCopilotCustom,
  useRegisterRightToolFilter,
  useRegisterRightToolRecordContext,
} from '@/app/hooks/useRightToolRegistration'
import { useSearchQueryFromUrl } from '@/hooks/useSearchQueryFromUrl'
import { layoutTokens } from '@/design-system/tokens/layout'
import { listPageContentOverflowSx } from '@/design-system/tokens/tableLayout'
import { SubmissionsAnalyticsTab } from '@/pages/submissions/components/SubmissionsAnalyticsTab'
import { SubmissionsCopilotPanel } from '@/pages/submissions/components/SubmissionsCopilotPanel'
import type { SubmissionsCopilotSendConfirmation } from '@/pages/submissions/components/SubmissionsCopilotPanel'
import { SubmissionsDataGrid } from '@/pages/submissions/components/SubmissionsDataGrid'
import { SubmissionsFilterPanel } from '@/pages/submissions/components/SubmissionsFilterPanel'
import { SubmissionsHeader } from '@/pages/submissions/components/SubmissionsHeader'
import { DiscardSubmissionDialog } from '@/pages/submissions/components/DiscardSubmissionDialog'
import type { SubmissionsTab } from '@/pages/submissions/components/SubmissionsTabs'
import { SubmissionsToolbar } from '@/pages/submissions/components/SubmissionsToolbar'
import {
  buildQuotePackageSent,
  submissionsMock,
  syncSubmissionListRecord,
  type PremiumEstimate,
  type SubmissionListRecord,
} from '@/pages/submissions/data/mockSubmissions'
import type { SubmissionDetailLocationState } from '@/pages/submissions/data/submissionCopilotInsights'
import { applySubmissionsListFilters } from '@/pages/submissions/filters/applySubmissionsListFilters'
import {
  emptySubmissionsListFilters,
  type SubmissionsListFilters,
} from '@/pages/submissions/filters/submissionsListFilterTypes'

const LIST_SECTION_GAP = layoutTokens.listSectionVerticalGap

function matchesSearch(row: SubmissionListRecord, query: string) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true

  const fields = [
    row.submissionNumber,
    row.insuredName,
    row.status,
    row.assignedTo,
    ...row.linesOfBusiness,
  ]
  return fields.some((value) => value.toLowerCase().includes(normalized))
}

function formatResolvedTimestamp(date = new Date()) {
  return date.toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).replace(',', '').replace(/\s+(AM|PM)/i, (_, meridiem: string) => meridiem.toLowerCase())
}

export function SubmissionsPage() {
  const navigate = useNavigate()
  const apiRef = useGridApiRef()
  const [searchParams, setSearchParams] = useSearchParams()
  const { activeTool, openTool, closeTool } = useRightTool()
  const [rows, setRows] = useState<SubmissionListRecord[]>(submissionsMock)
  const [activeTab, setActiveTab] = useState<SubmissionsTab>('all')
  const [copilotSubmissionFocus, setCopilotSubmissionFocus] = useState<SubmissionListRecord | null>(null)
  const [notesTarget, setNotesTarget] = useState<SubmissionListRecord | null>(null)
  const [discardTargets, setDiscardTargets] = useState<SubmissionListRecord[] | null>(null)
  const [copilotEntryMode, setCopilotEntryMode] = useState<'insight' | 'status'>('insight')
  const [copilotIssueFocusId, setCopilotIssueFocusId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [appliedFilters, setAppliedFilters] = useState<SubmissionsListFilters>(emptySubmissionsListFilters)
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([])

  useSearchQueryFromUrl(useCallback((query) => {
    setSearchQuery(query)
  }, []))

  useEffect(() => {
    const focusParam =
      searchParams.get('submission') ??
      searchParams.get('askCopilot') ??
      searchParams.get('copilot')
    if (!focusParam) return

    const match = rows.find(
      (row) =>
        row.submissionNumber.toLowerCase() === focusParam.toLowerCase() ||
        row.id.toLowerCase() === focusParam.toLowerCase(),
    )
    if (!match) return

    const issueParam = searchParams.get('issue')
    const matchedIssue = issueParam
      ? match.issues.find((issue) => {
          const needle = issueParam.toLowerCase()
          return (
            issue.id.toLowerCase() === needle ||
            issue.title.toLowerCase() === needle ||
            issue.title.toLowerCase().includes(needle)
          )
        })
      : null

    setCopilotSubmissionFocus(match)
    setRowSelectionModel([match.id])
    setCopilotEntryMode(matchedIssue ? 'status' : 'insight')
    setCopilotIssueFocusId(matchedIssue?.id ?? null)
    setNotesTarget(null)
    openTool('copilot')

    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)
        next.delete('submission')
        next.delete('askCopilot')
        next.delete('copilot')
        next.delete('issue')
        return next
      },
      { replace: true },
    )
  }, [openTool, rows, searchParams, setSearchParams])

  const previousSearchQueryRef = useRef(searchQuery)
  useEffect(() => {
    const previous = previousSearchQueryRef.current
    previousSearchQueryRef.current = searchQuery
    if (!previous.trim() || searchQuery.trim()) return
    setCopilotSubmissionFocus(null)
    setCopilotEntryMode('insight')
    setCopilotIssueFocusId(null)
    setRowSelectionModel([])
  }, [searchQuery])

  const filteredRows = useMemo(() => {
    const withFilters = applySubmissionsListFilters(rows, appliedFilters)
    return withFilters.filter((row) => matchesSearch(row, searchQuery))
  }, [appliedFilters, rows, searchQuery])

  const selectedSubmissions = useMemo(() => {
    const selectedIds = new Set(rowSelectionModel.map(String))
    return filteredRows.filter((row) => selectedIds.has(row.id))
  }, [filteredRows, rowSelectionModel])

  const focusedSubmission = useMemo(() => {
    if (!copilotSubmissionFocus) return null
    return rows.find((row) => row.id === copilotSubmissionFocus.id) ?? null
  }, [copilotSubmissionFocus, rows])

  const notesSubmission = useMemo(() => {
    if (!notesTarget) return null
    return rows.find((row) => row.id === notesTarget.id) ?? notesTarget
  }, [notesTarget, rows])

  const closeSidePanels = useCallback(() => {
    closeTool()
    setCopilotSubmissionFocus(null)
    setCopilotIssueFocusId(null)
    setNotesTarget(null)
  }, [closeTool])

  const handleAskCopilot = useCallback(
    (submission: SubmissionListRecord) => {
      setCopilotSubmissionFocus(submission)
      setRowSelectionModel([submission.id])
      setCopilotEntryMode('insight')
      setCopilotIssueFocusId(null)
      setNotesTarget(null)
      openTool('copilot')
    },
    [openTool],
  )

  const handleOpenStatusCopilot = useCallback(
    (submission: SubmissionListRecord) => {
      setCopilotSubmissionFocus(submission)
      setRowSelectionModel([submission.id])
      setCopilotEntryMode('status')
      setCopilotIssueFocusId(null)
      setNotesTarget(null)
      openTool('copilot')
    },
    [openTool],
  )

  const handleRowSelectionModelChange = useCallback(
    (model: GridRowSelectionModel) => {
      setRowSelectionModel(model)
      if (model.length === 0) {
        setCopilotSubmissionFocus(null)
        setCopilotEntryMode('insight')
        setCopilotIssueFocusId(null)
        return
      }
      if (model.length > 1) {
        setCopilotSubmissionFocus(null)
        setCopilotEntryMode('insight')
        setCopilotIssueFocusId(null)
        setNotesTarget(null)
        openTool('copilot')
        return
      }
      const selected = rows.find((row) => row.id === String(model[0]))
      if (selected) {
        setCopilotSubmissionFocus(selected)
        setCopilotEntryMode('insight')
        setCopilotIssueFocusId(null)
        setNotesTarget(null)
        openTool('copilot')
      }
    },
    [openTool, rows],
  )

  const handleAddNote = useCallback(
    (submission: SubmissionListRecord) => {
      setNotesTarget(submission)
      setCopilotSubmissionFocus(null)
      openTool('notes')
    },
    [openTool],
  )

  const handleTabChange = useCallback(
    (tab: SubmissionsTab) => {
      setActiveTab(tab)
      if (tab === 'analytics') {
        closeSidePanels()
      }
    },
    [closeSidePanels],
  )

  const handleResolveIssue = useCallback(
    (submissionId: string, issueId: string, resolvedDetails: string[]) => {
      let becameReady = false
      setRows((current) =>
        current.map((row) => {
          if (row.id !== submissionId) return row

          const issues = row.issues.map((issue) => {
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
          const nextConfidence = Math.min(96, row.confidence + 9)

          if (remainingBlockers.length === 0) {
            becameReady = true
            const next: SubmissionListRecord = {
              ...row,
              status: 'Ready' as const,
              confidence: Math.max(nextConfidence, 88),
              issues: remainingIssues,
              hasAlert: remainingIssues.some((issue) => issue.severity === 'warning'),
              premiumEstimates: row.premiumEstimates ?? [
                {
                  label: 'Balanced' as const,
                  range: '$900K - $1.1M',
                  rationale: 'Best fit after blockers cleared — alternatives not yet differentiated.',
                  recommended: true,
                },
              ],
              readyInsights: row.readyInsights ?? [
                {
                  id: `${row.id}-depth`,
                  title: 'Limited Loss History Depth',
                  summary: 'Less than 3 years of claims data.',
                  severity: 'warning' as const,
                },
              ],
            }
            syncSubmissionListRecord(next)
            return next
          }

          return {
            ...row,
            confidence: nextConfidence,
            issues,
            hasAlert: true,
          }
        }),
      )
      if (becameReady) {
        setCopilotEntryMode('status')
        setCopilotIssueFocusId(null)
        setCopilotSendConfirmation(null)
      }
    },
    [],
  )

  const handleApprovePremiumOption = useCallback(
    (
      submissionId: string,
      recommended: PremiumEstimate,
      included: PremiumEstimate[],
      recipient: string,
    ) => {
      const quotePackageSent = buildQuotePackageSent(recommended, included, recipient)
      setRows((current) =>
        current.map((row) => {
          if (row.id !== submissionId) return row
          const next: SubmissionListRecord = {
            ...row,
            approvedPremiumLabel: recommended.label,
            status: 'Quoted',
            quotePackageSent,
          }
          syncSubmissionListRecord(next)
          return next
        }),
      )
    },
    [],
  )

  const handleDeclineSubmission = useCallback((submissionId: string, _recipient: string) => {
    setRows((current) =>
      current.map((row) => {
        if (row.id !== submissionId) return row
        const next: SubmissionListRecord = {
          ...row,
          status: 'Declined',
          quotePackageSent: undefined,
          approvedPremiumLabel: undefined,
        }
        syncSubmissionListRecord(next)
        return next
      }),
    )
  }, [])

  const [copilotSendConfirmation, setCopilotSendConfirmation] =
    useState<SubmissionsCopilotSendConfirmation | null>(null)

  const handleAfterQuotePackageSent = useCallback(
    (submission: SubmissionListRecord, confirmation: SubmissionsCopilotSendConfirmation) => {
      navigate(`/submissions/${encodeURIComponent(submission.submissionNumber)}`, {
        state: {
          openCopilot: true,
          entryMode: 'status',
          sendConfirmation: confirmation,
        } satisfies SubmissionDetailLocationState,
      })
    },
    [navigate],
  )

  const handleAfterDeclineSent = useCallback(
    (submission: SubmissionListRecord, confirmation: SubmissionsCopilotSendConfirmation) => {
      navigate(`/submissions/${encodeURIComponent(submission.submissionNumber)}`, {
        state: {
          openCopilot: true,
          entryMode: 'status',
          sendConfirmation: confirmation,
        } satisfies SubmissionDetailLocationState,
      })
    },
    [navigate],
  )

  const handleOpenNextReadySubmission = useCallback(
    (submission: SubmissionListRecord) => {
      setCopilotSendConfirmation(null)
      setCopilotSubmissionFocus(submission)
      setRowSelectionModel([submission.id])
      setCopilotEntryMode('status')
      setCopilotIssueFocusId(null)
      setNotesTarget(null)
      openTool('copilot')
    },
    [openTool],
  )

  const handleShowReadyOnly = useCallback(() => {
    setAppliedFilters((current) => ({
      ...current,
      statuses: ['Ready'],
    }))
  }, [])

  const handleDiscardSelected = useCallback(() => {
    if (selectedSubmissions.length === 0) return
    setDiscardTargets(selectedSubmissions)
  }, [selectedSubmissions])

  const handleDiscardOne = useCallback((submission: SubmissionListRecord) => {
    setDiscardTargets([submission])
  }, [])

  const handleConfirmDiscard = useCallback((_reason: string) => {
    const targets = discardTargets ?? []
    const discardedIds = new Set(targets.map((row) => row.id))
    if (discardedIds.size === 0) return

    setRows((current) => current.filter((row) => !discardedIds.has(row.id)))
    setRowSelectionModel((current) => current.filter((id) => !discardedIds.has(String(id))))
    if (copilotSubmissionFocus && discardedIds.has(copilotSubmissionFocus.id)) {
      setCopilotSubmissionFocus(null)
      setCopilotIssueFocusId(null)
      setCopilotEntryMode('insight')
    }
    if (notesTarget && discardedIds.has(notesTarget.id)) {
      setNotesTarget(null)
    }
    setDiscardTargets(null)
  }, [copilotSubmissionFocus, discardTargets, notesTarget])

  const handleToggleAlert = useCallback((submission: SubmissionListRecord) => {
    setRows((current) =>
      current.map((row) =>
        row.id === submission.id ? { ...row, hasAlert: !row.hasAlert } : row,
      ),
    )
  }, [])

  const isAllTab = activeTab === 'all'
  const contentPx = `${layoutTokens.contentPaddingX}px`

  const copilotFocusForPanel =
    selectedSubmissions.length > 1 && !copilotSubmissionFocus ? null : focusedSubmission

  useRegisterRightToolRecordContext(
    notesSubmission
      ? { title: notesSubmission.insuredName, subtitle: notesSubmission.submissionNumber }
      : focusedSubmission
        ? { title: focusedSubmission.insuredName, subtitle: focusedSubmission.submissionNumber }
        : null,
    [focusedSubmission, notesSubmission],
  )

  const selectedSubmissionKey = selectedSubmissions.map((row) => row.id).join(',')

  useRegisterRightToolCopilotCustom(
    <SubmissionsCopilotPanel
      focusedSubmission={copilotFocusForPanel}
      selectedSubmissions={selectedSubmissions}
      queueSubmissions={filteredRows}
      entryMode={copilotEntryMode}
      initialIssueId={copilotIssueFocusId}
      onEntryModeChange={setCopilotEntryMode}
      onResolveIssue={handleResolveIssue}
      onApprovePremiumOption={handleApprovePremiumOption}
      onDeclineSubmission={handleDeclineSubmission}
      onAfterQuotePackageSent={handleAfterQuotePackageSent}
      onAfterDeclineSent={handleAfterDeclineSent}
      sendConfirmation={
        copilotSendConfirmation &&
        copilotFocusForPanel &&
        copilotSendConfirmation.submissionId === copilotFocusForPanel.id
          ? copilotSendConfirmation
          : null
      }
      onSendConfirmation={setCopilotSendConfirmation}
      onOpenNextReadySubmission={handleOpenNextReadySubmission}
      onShowReadyOnly={handleShowReadyOnly}
      onClearFocus={() => {
        setCopilotSubmissionFocus(null)
        setCopilotEntryMode('insight')
        setCopilotIssueFocusId(null)
        setRowSelectionModel([])
        setCopilotSendConfirmation(null)
      }}
      onClose={closeTool}
    />,
    [
      closeTool,
      copilotEntryMode,
      copilotFocusForPanel?.id,
      copilotFocusForPanel?.status,
      copilotFocusForPanel?.approvedPremiumLabel,
      copilotFocusForPanel?.confidence,
      copilotFocusForPanel?.issues,
      copilotFocusForPanel?.premiumEstimates,
      copilotIssueFocusId,
      copilotSendConfirmation,
      handleApprovePremiumOption,
      handleDeclineSubmission,
      handleAfterQuotePackageSent,
      handleAfterDeclineSent,
      handleOpenNextReadySubmission,
      handleResolveIssue,
      handleShowReadyOnly,
      filteredRows,
      selectedSubmissionKey,
    ],
  )

  useRegisterRightToolFilter(
    activeTab === 'all' ? (
      <SubmissionsFilterPanel
        appliedFilters={appliedFilters}
        onApply={setAppliedFilters}
        onClose={closeTool}
      />
    ) : null,
    [activeTab, appliedFilters, closeTool],
  )

  const activeCopilotSubmissionId =
    activeTool === 'copilot' && focusedSubmission ? focusedSubmission.id : null

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
          <SubmissionsHeader
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onCreateSubmission={() => navigate('/quotes/new')}
          />
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            ...listPageContentOverflowSx(isAllTab),
            px: contentPx,
            pt: LIST_SECTION_GAP,
            pb: contentPx,
            width: '100%',
            bgcolor: 'background.paper',
          }}
        >
          {isAllTab ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                minHeight: 0,
                width: '100%',
                gap: LIST_SECTION_GAP,
              }}
            >
              <Box sx={{ flexShrink: 0 }}>
                <SubmissionsToolbar
                  apiRef={apiRef}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectionCount={rowSelectionModel.length}
                  onDiscard={handleDiscardSelected}
                />
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
                <SubmissionsDataGrid
                  apiRef={apiRef}
                  rows={filteredRows}
                  rowSelectionModel={rowSelectionModel}
                  onRowSelectionModelChange={handleRowSelectionModelChange}
                  onAskCopilot={handleAskCopilot}
                  onOpenStatusCopilot={handleOpenStatusCopilot}
                  onAddNote={handleAddNote}
                  onDiscard={handleDiscardOne}
                  onToggleAlert={handleToggleAlert}
                  activeCopilotSubmissionId={activeCopilotSubmissionId}
                />
              </Box>
            </Box>
          ) : (
            <SubmissionsAnalyticsTab />
          )}
        </Box>
      </Box>

      <DiscardSubmissionDialog
        open={Boolean(discardTargets?.length)}
        submissions={discardTargets ?? []}
        onClose={() => setDiscardTargets(null)}
        onConfirm={handleConfirmDiscard}
      />
    </Box>
  )
}

export default SubmissionsPage

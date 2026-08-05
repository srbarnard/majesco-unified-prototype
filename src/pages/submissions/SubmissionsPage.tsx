import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useGridApiRef, type GridRowSelectionModel } from '@mui/x-data-grid-premium'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { layoutTokens } from '@/design-system/tokens/layout'
import { listPageContentOverflowSx } from '@/design-system/tokens/tableLayout'
import { ResizableRightPanel } from '@/pages/policies/components/ResizableRightPanel'
import { SubmissionsAnalyticsTab } from '@/pages/submissions/components/SubmissionsAnalyticsTab'
import { SubmissionsCopilotPanel } from '@/pages/submissions/components/SubmissionsCopilotPanel'
import { SubmissionsDataGrid } from '@/pages/submissions/components/SubmissionsDataGrid'
import { SubmissionsFilterPanel } from '@/pages/submissions/components/SubmissionsFilterPanel'
import { SubmissionsHeader } from '@/pages/submissions/components/SubmissionsHeader'
import { SubmissionsNotesPanel } from '@/pages/submissions/components/SubmissionsNotesPanel'
import type { SubmissionsTab } from '@/pages/submissions/components/SubmissionsTabs'
import { SubmissionsToolbar } from '@/pages/submissions/components/SubmissionsToolbar'
import {
  SUBMISSIONS_TOTAL_ROWS,
  submissionsMock,
  type PremiumEstimate,
  type SubmissionListRecord,
} from '@/pages/submissions/data/mockSubmissions'
import { applySubmissionsListFilters } from '@/pages/submissions/filters/applySubmissionsListFilters'
import {
  emptySubmissionsListFilters,
  hasActiveSubmissionsFilters,
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
  const [rows, setRows] = useState<SubmissionListRecord[]>(submissionsMock)
  const [activeTab, setActiveTab] = useState<SubmissionsTab>('all')
  const [copilotOpen, setCopilotOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [copilotSubmissionFocus, setCopilotSubmissionFocus] = useState<SubmissionListRecord | null>(null)
  const [copilotEntryMode, setCopilotEntryMode] = useState<'insight' | 'status'>('insight')
  const [searchQuery, setSearchQuery] = useState('')
  const [appliedFilters, setAppliedFilters] = useState<SubmissionsListFilters>(emptySubmissionsListFilters)
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([])

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

    setCopilotSubmissionFocus(match)
    setCopilotEntryMode('insight')
    setFilterOpen(false)
    setNotesOpen(false)
    setCopilotOpen(true)

    const next = new URLSearchParams(searchParams)
    next.delete('submission')
    next.delete('askCopilot')
    next.delete('copilot')
    setSearchParams(next, { replace: true })
  }, [rows, searchParams, setSearchParams])

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

  const closeSidePanels = useCallback(() => {
    setFilterOpen(false)
    setNotesOpen(false)
    setCopilotOpen(false)
    setCopilotSubmissionFocus(null)
  }, [])

  const handleToggleFilter = useCallback(() => {
    setFilterOpen((current) => {
      if (!current) {
        setCopilotOpen(false)
        setNotesOpen(false)
        setCopilotSubmissionFocus(null)
      }
      return !current
    })
  }, [])

  const handleToggleNotes = useCallback(() => {
    setNotesOpen((current) => {
      if (!current) {
        setCopilotOpen(false)
        setFilterOpen(false)
      }
      return !current
    })
  }, [])

  const handleToggleCopilot = useCallback(() => {
    setCopilotOpen((current) => {
      if (current) {
        setCopilotSubmissionFocus(null)
        return false
      }
      setCopilotEntryMode('insight')
      setFilterOpen(false)
      setNotesOpen(false)
      return true
    })
  }, [])

  const handleCloseFilter = useCallback(() => setFilterOpen(false), [])
  const handleCloseNotes = useCallback(() => setNotesOpen(false), [])
  const handleCloseCopilot = useCallback(() => {
    setCopilotOpen(false)
    setCopilotSubmissionFocus(null)
  }, [])

  const handleAskCopilot = useCallback((submission: SubmissionListRecord) => {
    setCopilotSubmissionFocus(submission)
    setCopilotEntryMode('insight')
    setFilterOpen(false)
    setNotesOpen(false)
    setCopilotOpen(true)
  }, [])

  const handleOpenStatusCopilot = useCallback((submission: SubmissionListRecord) => {
    setCopilotSubmissionFocus(submission)
    setCopilotEntryMode('status')
    setFilterOpen(false)
    setNotesOpen(false)
    setCopilotOpen(true)
  }, [])

  const handleRowSelectionModelChange = useCallback((model: GridRowSelectionModel) => {
    setRowSelectionModel(model)
    if (model.length > 1) {
      setCopilotSubmissionFocus(null)
      setCopilotEntryMode('insight')
      setFilterOpen(false)
      setNotesOpen(false)
      setCopilotOpen(true)
      return
    }
    if (model.length === 1) {
      const selected = rows.find((row) => row.id === String(model[0]))
      if (selected) {
        setCopilotSubmissionFocus(selected)
        setCopilotEntryMode('insight')
        setFilterOpen(false)
        setNotesOpen(false)
        setCopilotOpen(true)
      }
    }
  }, [rows])

  const handleAddNote = useCallback((submission: SubmissionListRecord) => {
    setCopilotSubmissionFocus(submission)
    setFilterOpen(false)
    setCopilotOpen(false)
    setNotesOpen(true)
  }, [])

  const handleTabChange = useCallback((tab: SubmissionsTab) => {
    setActiveTab(tab)
    if (tab === 'analytics') {
      closeSidePanels()
    }
  }, [closeSidePanels])

  const handleCloseMobileRightPanel = useCallback(() => {
    if (filterOpen) {
      handleCloseFilter()
      return
    }
    if (notesOpen) {
      handleCloseNotes()
      return
    }
    handleCloseCopilot()
  }, [filterOpen, notesOpen, handleCloseFilter, handleCloseNotes, handleCloseCopilot])

  const handleResolveIssue = useCallback(
    (submissionId: string, issueId: string, resolvedDetails: string[]) => {
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
            return {
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
          }

          return {
            ...row,
            confidence: nextConfidence,
            issues,
            hasAlert: true,
          }
        }),
      )
    },
    [],
  )

  const handleApprovePremiumOption = useCallback((submissionId: string, option: PremiumEstimate) => {
    setRows((current) =>
      current.map((row) =>
        row.id === submissionId ? { ...row, approvedPremiumLabel: option.label } : row,
      ),
    )
  }, [])

  const handleDiscardSelected = useCallback(() => {
    const selectedIds = new Set(rowSelectionModel.map(String))
    setRows((current) => current.filter((row) => !selectedIds.has(row.id)))
    setRowSelectionModel([])
    if (copilotSubmissionFocus && selectedIds.has(copilotSubmissionFocus.id)) {
      setCopilotSubmissionFocus(null)
    }
  }, [copilotSubmissionFocus, rowSelectionModel])

  const handleDiscardOne = useCallback((submission: SubmissionListRecord) => {
    setRows((current) => current.filter((row) => row.id !== submission.id))
    setRowSelectionModel((current) => current.filter((id) => String(id) !== submission.id))
    if (copilotSubmissionFocus?.id === submission.id) {
      setCopilotSubmissionFocus(null)
    }
  }, [copilotSubmissionFocus])

  const handleToggleAlert = useCallback((submission: SubmissionListRecord) => {
    setRows((current) =>
      current.map((row) =>
        row.id === submission.id ? { ...row, hasAlert: !row.hasAlert } : row,
      ),
    )
  }, [])

  const isAllTab = activeTab === 'all'
  const contentPx = `${layoutTokens.contentPaddingX}px`
  const rightPanelOpen = filterOpen || notesOpen || copilotOpen

  // When multi-selecting without an explicit Ask Copilot focus, show summarize
  const copilotFocusForPanel =
    selectedSubmissions.length > 1 && !copilotSubmissionFocus ? null : focusedSubmission

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
            filterOpen={filterOpen}
            onToggleFilter={handleToggleFilter}
            notesOpen={notesOpen}
            onToggleNotes={handleToggleNotes}
            copilotOpen={copilotOpen}
            onToggleCopilot={handleToggleCopilot}
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
                  activeCopilotSubmissionId={focusedSubmission?.id ?? null}
                />
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontFamily: figmaFontFamilyStack.body, textAlign: 'right', flexShrink: 0 }}
              >
                Total Rows:{' '}
                {hasActiveSubmissionsFilters(appliedFilters) || searchQuery.trim()
                  ? filteredRows.length
                  : Math.max(SUBMISSIONS_TOTAL_ROWS, rows.length)}
              </Typography>
            </Box>
          ) : (
            <SubmissionsAnalyticsTab />
          )}
        </Box>
      </Box>

      <ResizableRightPanel open={rightPanelOpen} onClose={handleCloseMobileRightPanel}>
        {filterOpen && (
          <SubmissionsFilterPanel
            appliedFilters={appliedFilters}
            onApply={setAppliedFilters}
            onClose={handleCloseFilter}
          />
        )}
        {notesOpen && (
          <SubmissionsNotesPanel
            focusedSubmission={focusedSubmission}
            onClose={handleCloseNotes}
          />
        )}
        {copilotOpen && (
          <SubmissionsCopilotPanel
            focusedSubmission={copilotFocusForPanel}
            selectedSubmissions={selectedSubmissions}
            entryMode={copilotEntryMode}
            onEntryModeChange={setCopilotEntryMode}
            onResolveIssue={handleResolveIssue}
            onApprovePremiumOption={handleApprovePremiumOption}
            onClose={handleCloseCopilot}
          />
        )}
      </ResizableRightPanel>
    </Box>
  )
}

export default SubmissionsPage

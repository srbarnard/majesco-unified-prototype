import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router'
import { Card } from '@/design-system/components'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { PartiesPanel } from '@/pages/policies/components/PartiesPanel'
import { ResizableRightPanel } from '@/pages/policies/components/ResizableRightPanel'
import { useIsDesktopLayout } from '@/pages/policies/hooks/useIsDesktopLayout'
import {
  resolveOverviewCopilotPanel,
  useCloseCopilotWhenMobile,
  useDesktopCopilotInitialOpen,
} from '@/pages/policies/hooks/useResponsiveCopilotPanel'
import { SubmissionDetailHeader, type SubmissionRightPanel } from '@/pages/submissions/components/SubmissionDetailHeader'
import type { SubmissionDetailTab } from '@/pages/submissions/components/SubmissionDetailTabs'
import { SubmissionOverviewTab } from '@/pages/submissions/components/SubmissionOverviewTab'
import { SubmissionsCopilotPanel } from '@/pages/submissions/components/SubmissionsCopilotPanel'
import {
  getSubmissionOverviewStats,
  resolveSubmissionContext,
  toSubmissionListRecord,
  type SubmissionDetailsRecord,
} from '@/pages/submissions/data/resolveSubmissionContext'

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

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
  const [submission, setSubmission] = useState<SubmissionDetailsRecord>(() =>
    resolveSubmissionContext(submissionId),
  )
  const isDesktop = useIsDesktopLayout()
  const [activeTab, setActiveTab] = useState<SubmissionDetailTab>('overview')
  const [starred, setStarred] = useState(false)
  const [activeRightPanel, setActiveRightPanel] = useState<SubmissionRightPanel | null>(null)

  useEffect(() => {
    setSubmission(resolveSubmissionContext(submissionId))
  }, [submissionId])

  useDesktopCopilotInitialOpen(isDesktop, activeTab === 'overview', 'copilot', setActiveRightPanel)
  useCloseCopilotWhenMobile(isDesktop, activeRightPanel, 'copilot', setActiveRightPanel)

  const focusedListRecord = useMemo(() => toSubmissionListRecord(submission), [submission])
  const stats = useMemo(() => getSubmissionOverviewStats(submission), [submission])

  const handleToggleRightPanel = useCallback((panel: SubmissionRightPanel) => {
    setActiveRightPanel((current) => (current === panel ? null : panel))
  }, [])

  const handleCloseRightPanel = useCallback(() => {
    setActiveRightPanel(null)
  }, [])

  const handleStatusClick = useCallback(() => {
    setActiveRightPanel('copilot')
  }, [])

  const handleTabChange = useCallback(
    (tab: SubmissionDetailTab) => {
      setActiveTab(tab)
      if (tab === 'overview') {
        setActiveRightPanel((current) =>
          resolveOverviewCopilotPanel(isDesktop, current, 'copilot', 'parties'),
        )
        return
      }
      setActiveRightPanel((current) => (current === 'copilot' ? null : current))
    },
    [isDesktop],
  )

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
              { label: 'Optimized' as const, range: '$1.1M - $1.3M' },
              { label: 'Balanced' as const, range: '$900K - $1.1M' },
              { label: 'Conservative' as const, range: '$1.3M - $1.6M' },
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

  const showCopilotPanel = activeRightPanel === 'copilot'
  const rightPanelOpen = activeRightPanel !== null

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
            overflow: 'auto',
            px: `${layoutTokens.contentPaddingX}px`,
            py: `${layoutTokens.contentPaddingX}px`,
            width: '100%',
            bgcolor: 'background.paper',
          }}
        >
          {activeTab === 'overview' && (
            <SubmissionOverviewTab submission={submission} stats={stats} />
          )}
          {activeTab === 'documents' && (
            <Card title="Documents">
              <Typography variant="body2" color="text.secondary" sx={bodySx}>
                Submission intake documents and attachments will appear here.
              </Typography>
            </Card>
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

      <ResizableRightPanel open={rightPanelOpen} onClose={handleCloseRightPanel}>
        {activeRightPanel === 'parties' && (
          <PartiesPanel parties={submission.parties} onClose={handleCloseRightPanel} />
        )}
        {showCopilotPanel && (
          <SubmissionsCopilotPanel
            focusedSubmission={focusedListRecord}
            onResolveIssue={handleResolveIssue}
            onClose={handleCloseRightPanel}
          />
        )}
      </ResizableRightPanel>
    </Box>
  )
}

export default SubmissionDetails

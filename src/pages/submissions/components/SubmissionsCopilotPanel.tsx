import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import BlockIcon from '@mui/icons-material/Block'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import CloseIcon from '@mui/icons-material/Close'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Button, CopilotIcon, InsightCallout } from '@/design-system/components'
import { accentSubtle, accentSubtleHover } from '@/design-system/theme/themeSurfaces'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { CopilotComposer } from '@/pages/policies/components/CopilotComposer'
import {
  DEFAULT_COPILOT_CONFIDENCE_TIERS,
  getCopilotConfidenceStatusLabel,
} from '@/pages/policies/components/copilot/copilotConfidence'
import { CopilotConfidenceIndicator } from '@/pages/policies/components/copilot/CopilotConfidenceIndicator'
import { useAnimatedConfidence } from '@/pages/policies/components/copilot/useAnimatedConfidence'
import type {
  SubmissionIssue,
  SubmissionListRecord,
} from '@/pages/submissions/data/mockSubmissions'

type SubmissionsCopilotPanelProps = {
  focusedSubmission?: SubmissionListRecord | null
  selectedSubmissions?: SubmissionListRecord[]
  onResolveIssue?: (submissionId: string, issueId: string, resolvedDetails: string[]) => void
  onClose?: () => void
}

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

const headingSx = {
  fontFamily: figmaFontFamilyStack.heading,
  fontWeight: 600,
} as const

const suggestedActionChipSx = {
  textTransform: 'none',
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
  fontSize: '0.75rem',
  lineHeight: 1.3,
  borderRadius: '30px',
  border: 'none',
  boxShadow: 'none',
  color: 'primary.main',
  bgcolor: (theme: Parameters<typeof accentSubtle>[0]) => accentSubtle(theme),
  px: 1.25,
  py: 0.5,
  minHeight: 'auto',
  '&:hover': {
    bgcolor: (theme: Parameters<typeof accentSubtle>[0]) => accentSubtleHover(theme),
    boxShadow: 'none',
  },
} as const

function openBlockingIssues(submission: SubmissionListRecord) {
  return submission.issues.filter((issue) => issue.severity === 'blocking' && !issue.resolvedAt)
}

function openWarningIssues(submission: SubmissionListRecord) {
  return submission.issues.filter((issue) => issue.severity === 'warning' && !issue.resolvedAt)
}

function parseResolvedDetails(issue: SubmissionIssue, message: string): string[] {
  const normalized = message.toLowerCase()

  if (issue.id === 'iss-payroll') {
    const details: string[] = []
    if (/600/.test(normalized) || /total|annual|payroll/.test(normalized)) {
      details.push('Annual payroll: $600,000')
    }
    if (/clerical/.test(normalized)) details.push('Clerical: $100,000')
    if (/driver/.test(normalized)) details.push('Drivers: $300,000')
    if (/field/.test(normalized)) details.push('Field: $200,000')
    if (details.length === 0) {
      details.push('Annual payroll: $600,000', 'Clerical: $100,000', 'Drivers: $300,000', 'Field: $200,000')
    }
    return details
  }

  return [`Captured: ${message.trim()}`]
}

function StatusIconBadge({
  tone,
  children,
}: {
  tone: 'error' | 'warning' | 'success'
  children: ReactNode
}) {
  return (
    <Box
      sx={(theme) => {
        const isLight = theme.palette.mode === 'light'
        const palette =
          tone === 'error'
            ? theme.figmaPalette.red
            : tone === 'warning'
              ? theme.figmaPalette.amber
              : theme.figmaPalette.green
        return {
          width: 32,
          height: 32,
          borderRadius: '10px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          bgcolor: isLight ? palette[100] : palette[900],
          color: isLight ? palette[800] : palette[200],
        }
      }}
    >
      {children}
    </Box>
  )
}

const flatListRowSx = {
  width: '100%',
  display: 'flex',
  alignItems: 'flex-start',
  gap: 1.25,
  px: 2,
  py: 1.5,
  border: 'none',
  borderBottom: 1,
  borderColor: 'divider',
  bgcolor: 'transparent',
  textAlign: 'left' as const,
} as const

function IssueListItem({
  issue,
  onSelect,
}: {
  issue: SubmissionIssue
  onSelect: (issue: SubmissionIssue) => void
}) {
  const isBlocking = issue.severity === 'blocking'
  return (
    <Box
      component="button"
      type="button"
      onClick={() => onSelect(issue)}
      sx={{
        ...flatListRowSx,
        cursor: 'pointer',
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <StatusIconBadge tone={isBlocking ? 'error' : 'warning'}>
        {isBlocking ? (
          <BlockIcon sx={{ fontSize: 18 }} />
        ) : (
          <WarningAmberOutlinedIcon sx={{ fontSize: 18 }} />
        )}
      </StatusIconBadge>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body2" sx={{ ...headingSx, fontSize: '0.875rem', lineHeight: 1.35 }}>
          {issue.title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ ...bodySx, fontSize: '0.8125rem', lineHeight: 1.4, mt: 0.25 }}
        >
          {issue.summary}
        </Typography>
      </Box>
    </Box>
  )
}

function IssueDetailCard({ issue }: { issue: SubmissionIssue }) {
  const isResolved = Boolean(issue.resolvedAt)
  const details = isResolved ? (issue.resolvedDetails ?? []) : issue.missingDetails

  return (
    <Stack spacing={1.5}>
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 0.5 }}>
        <CopilotIcon size={28} />
      </Box>
      <InsightCallout variant="copilot" title={issue.title}>
        <Stack spacing={1.25}>
          <Typography variant="body2" sx={{ ...bodySx, fontStyle: 'italic', fontSize: '0.8125rem' }}>
            {isResolved ? 'Premium can now be estimated' : issue.summary}
          </Typography>
          <Box>
            <Typography variant="body2" sx={{ ...headingSx, fontSize: '0.75rem', mb: 0.5 }}>
              Why this matters
            </Typography>
            <Typography variant="body2" sx={{ ...bodySx, fontSize: '0.8125rem', lineHeight: 1.5 }}>
              {issue.whyItMatters}
            </Typography>
          </Box>
          {details.length > 0 && (
            <Box>
              <Typography variant="body2" sx={{ ...headingSx, fontSize: '0.75rem', mb: 0.5 }}>
                {isResolved ? 'Details' : 'Missing details'}
              </Typography>
              <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2.25 }}>
                {details.map((detail) => (
                  <Typography
                    key={detail}
                    component="li"
                    variant="body2"
                    sx={{ ...bodySx, fontSize: '0.8125rem', lineHeight: 1.45 }}
                  >
                    {detail}
                  </Typography>
                ))}
              </Stack>
            </Box>
          )}
          {issue.resolvedAt && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ ...bodySx, fontSize: '0.75rem', display: 'block', pt: 0.25 }}
            >
              {issue.resolvedAt}
            </Typography>
          )}
        </Stack>
      </InsightCallout>
    </Stack>
  )
}

function ReadyPremiumView({ submission }: { submission: SubmissionListRecord }) {
  return (
    <Box sx={{ mx: -2 }}>
      {(submission.premiumEstimates ?? []).map((estimate) => (
        <Box key={estimate.label} sx={flatListRowSx}>
          <StatusIconBadge tone="success">
            <CheckCircleOutlineIcon sx={{ fontSize: 18 }} />
          </StatusIconBadge>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" sx={{ ...headingSx, fontSize: '0.875rem', lineHeight: 1.35 }}>
              {estimate.label}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ ...bodySx, fontSize: '0.8125rem', lineHeight: 1.4, mt: 0.25 }}
            >
              Estimated: {estimate.range}
            </Typography>
          </Box>
        </Box>
      ))}
      {(submission.readyInsights ?? [])
        .filter((insight) => insight.severity === 'warning')
        .map((insight) => (
          <Box key={insight.id} sx={flatListRowSx}>
            <StatusIconBadge tone="warning">
              <WarningAmberOutlinedIcon sx={{ fontSize: 18 }} />
            </StatusIconBadge>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="body2" sx={{ ...headingSx, fontSize: '0.875rem', lineHeight: 1.35 }}>
                {insight.title}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ ...bodySx, fontSize: '0.8125rem', lineHeight: 1.4, mt: 0.25 }}
              >
                {insight.summary}
              </Typography>
            </Box>
          </Box>
        ))}
    </Box>
  )
}

function SummarizeView({ submissions }: { submissions: SubmissionListRecord[] }) {
  const blocked = submissions.filter((row) => row.status === 'Blocked')
  const ready = submissions.filter((row) => row.status === 'Ready')
  const queueBlocked = blocked.filter((row) => row.assignedTo === 'Underwriting Queue')

  return (
    <Stack spacing={1.75}>
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 0.5 }}>
        <CopilotIcon size={28} />
      </Box>
      <Typography variant="body2" sx={{ ...headingSx, fontSize: '0.9375rem' }}>
        Summarize
      </Typography>
      <Typography variant="body2" sx={{ ...bodySx, lineHeight: 1.6, fontSize: '0.875rem' }}>
        Copilot is monitoring incoming submissions to identify items that require attention across your
        current selection of <strong>{submissions.length}</strong> submissions.
      </Typography>
      <Box>
        <Typography variant="body2" sx={{ ...headingSx, fontSize: '0.8125rem', mb: 0.75 }}>
          At a glance
        </Typography>
        <Stack component="ul" spacing={0.75} sx={{ m: 0, pl: 2.25 }}>
          <Typography component="li" variant="body2" sx={{ ...bodySx, fontSize: '0.8125rem' }}>
            {blocked.length} submission{blocked.length === 1 ? '' : 's'}{' '}
            {blocked.length === 1 ? 'is' : 'are'} blocked and require action
          </Typography>
          <Typography component="li" variant="body2" sx={{ ...bodySx, fontSize: '0.8125rem' }}>
            {ready.length} submission{ready.length === 1 ? '' : 's'}{' '}
            {ready.length === 1 ? 'is' : 'are'} ready for underwriting review
          </Typography>
        </Stack>
      </Box>
      <Box>
        <Typography variant="body2" sx={{ ...headingSx, fontSize: '0.8125rem', mb: 0.75 }}>
          Key observations
        </Typography>
        <Stack component="ul" spacing={0.75} sx={{ m: 0, pl: 2.25 }}>
          <Typography component="li" variant="body2" sx={{ ...bodySx, fontSize: '0.8125rem' }}>
            Most blocked submissions are in the Underwriting Queue
            {queueBlocked.length > 0 ? ` (${queueBlocked.length})` : ''}
          </Typography>
          <Typography component="li" variant="body2" sx={{ ...bodySx, fontSize: '0.8125rem' }}>
            Resolve blockers in Copilot without leaving the list — payroll, loss history, and exposure
            gaps are the top causes
          </Typography>
        </Stack>
      </Box>
      {blocked.length > 0 && (
        <Box>
          <Button size="small" variant="outlined" color="primary" sx={suggestedActionChipSx}>
            Assign blocked submission
          </Button>
        </Box>
      )}
    </Stack>
  )
}

function WorkspaceView() {
  return (
    <Stack spacing={1.75}>
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 0.5 }}>
        <CopilotIcon size={28} />
      </Box>
      <Typography variant="body2" sx={{ ...bodySx, lineHeight: 1.6, fontSize: '0.875rem' }}>
        Copilot is monitoring incoming submissions to identify items that require attention. Select a
        blocked submission — or multi-select rows — to resolve issues in place.
      </Typography>
      <Box>
        <Typography variant="body2" sx={{ ...headingSx, fontSize: '0.8125rem', mb: 0.75 }}>
          At a glance
        </Typography>
        <Stack component="ul" spacing={0.75} sx={{ m: 0, pl: 2.25 }}>
          <Typography component="li" variant="body2" sx={{ ...bodySx, fontSize: '0.8125rem' }}>
            3 submissions are blocked and require action
          </Typography>
          <Typography component="li" variant="body2" sx={{ ...bodySx, fontSize: '0.8125rem' }}>
            Payroll and loss history are the most common blockers
          </Typography>
        </Stack>
      </Box>
      <Box>
        <Typography variant="body2" sx={{ ...headingSx, fontSize: '0.8125rem', mb: 0.75 }}>
          Key observations
        </Typography>
        <Stack component="ul" spacing={0.75} sx={{ m: 0, pl: 2.25 }}>
          <Typography component="li" variant="body2" sx={{ ...bodySx, fontSize: '0.8125rem' }}>
            Most blocked submissions are in the Underwriting Queue
          </Typography>
          <Typography component="li" variant="body2" sx={{ ...bodySx, fontSize: '0.8125rem' }}>
            Ready submissions already include estimated premium ranges
          </Typography>
        </Stack>
      </Box>
      <Box>
        <Button size="small" variant="outlined" color="primary" sx={suggestedActionChipSx}>
          Assign blocked submission
        </Button>
      </Box>
    </Stack>
  )
}

export function SubmissionsCopilotPanel({
  focusedSubmission = null,
  selectedSubmissions = [],
  onResolveIssue,
  onClose,
}: SubmissionsCopilotPanelProps) {
  const [activeIssueId, setActiveIssueId] = useState<string | null>(null)
  const multiSelectMode = selectedSubmissions.length > 1 && !focusedSubmission

  const activeIssue = useMemo(() => {
    if (!focusedSubmission || !activeIssueId) return null
    return focusedSubmission.issues.find((issue) => issue.id === activeIssueId) ?? null
  }, [activeIssueId, focusedSubmission])

  const focusKey = focusedSubmission?.id ?? (multiSelectMode ? 'multi' : 'workspace')

  useEffect(() => {
    setActiveIssueId(null)
  }, [focusKey])

  const confidence = focusedSubmission?.confidence ?? 0
  const showConfidence = Boolean(focusedSubmission && !multiSelectMode)
  const animatedConfidence = useAnimatedConfidence(confidence, focusKey)
  const displayedConfidence = showConfidence ? Math.round(animatedConfidence) : 0
  const confidenceStatusLabel = getCopilotConfidenceStatusLabel(confidence)

  const composerPlaceholder = activeIssue
    ? activeIssue.resolvedAt
      ? 'Add more details or continue...'
      : activeIssue.composerPlaceholder
    : focusedSubmission?.status === 'Blocked'
      ? 'Add more details or continue...'
      : multiSelectMode
        ? 'Ask more...'
        : 'Ask about submissions...'

  const handleSubmit = (message: string) => {
    if (!focusedSubmission) return

    const targetIssue = activeIssue ?? openBlockingIssues(focusedSubmission)[0] ?? null
    if (!targetIssue || targetIssue.severity !== 'blocking' || targetIssue.resolvedAt) return

    const details = parseResolvedDetails(targetIssue, message)
    onResolveIssue?.(focusedSubmission.id, targetIssue.id, details)
    setActiveIssueId(targetIssue.id)
  }

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          px: 2,
          pt: layoutTokens.policyHeaderTopPadding,
          pb: 1.25,
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" sx={{ minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              component="h2"
              sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600 }}
            >
              Copilot
            </Typography>
            {showConfidence && (
              <CopilotConfidenceIndicator
                animatedValue={animatedConfidence}
                displayedValue={displayedConfidence}
                statusLabel={confidenceStatusLabel}
                popoverTitle="Submission confidence"
                popoverDescription="How complete and consistent this submission is based on captured details and underwriting status."
                tiers={DEFAULT_COPILOT_CONFIDENCE_TIERS}
              />
            )}
          </Stack>
          {onClose && (
            <IconButton size="small" onClick={onClose} aria-label="Close Copilot">
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
      </Box>

      <Box sx={{ px: 2, py: 2, flexGrow: 1, overflowY: 'auto', minHeight: 0 }}>
        <Stack spacing={1.75}>
          {focusedSubmission && !multiSelectMode && (
            <Stack direction="row" alignItems="center" spacing={0.25}>
              {activeIssue && (
                <IconButton
                  size="small"
                  aria-label="Back to issues"
                  onClick={() => setActiveIssueId(null)}
                >
                  <ArrowBackIcon fontSize="small" sx={{ color: 'secondary.main' }} />
                </IconButton>
              )}
              <Typography
                variant="body2"
                sx={{
                  ...headingSx,
                  fontSize: '0.875rem',
                  color: 'secondary.main',
                }}
              >
                {focusedSubmission.submissionNumber}
              </Typography>
            </Stack>
          )}

          {multiSelectMode ? (
            <SummarizeView submissions={selectedSubmissions} />
          ) : !focusedSubmission ? (
            <WorkspaceView />
          ) : activeIssue ? (
            <IssueDetailCard issue={activeIssue} />
          ) : focusedSubmission.status === 'Ready' ? (
            <ReadyPremiumView submission={focusedSubmission} />
          ) : (
            <Box sx={{ mx: -2 }}>
              {openBlockingIssues(focusedSubmission).map((issue) => (
                <IssueListItem
                  key={issue.id}
                  issue={issue}
                  onSelect={(next) => setActiveIssueId(next.id)}
                />
              ))}
              {openWarningIssues(focusedSubmission).map((issue) => (
                <IssueListItem
                  key={issue.id}
                  issue={issue}
                  onSelect={(next) => setActiveIssueId(next.id)}
                />
              ))}
            </Box>
          )}
        </Stack>
      </Box>

      <CopilotComposer placeholder={composerPlaceholder} onSubmit={handleSubmit} />
    </Box>
  )
}

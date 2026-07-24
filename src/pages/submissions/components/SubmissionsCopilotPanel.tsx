import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import BlockIcon from '@mui/icons-material/Block'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Button } from '@/design-system/components'
import { accentSubtle, accentSubtleHover } from '@/design-system/theme/themeSurfaces'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import {
  DEFAULT_COPILOT_CONFIDENCE_TIERS,
  getCopilotConfidenceStatusLabel,
} from '@/pages/policies/components/copilot/copilotConfidence'
import { CopilotConfidenceIndicator } from '@/pages/policies/components/copilot/CopilotConfidenceIndicator'
import { CopilotDrawerShell } from '@/pages/policies/components/copilot/CopilotDrawerShell'
import {
  copilotSectionHeadingSx,
  copilotSubtitleSx,
} from '@/pages/policies/components/copilot/copilotDrawerStyles'
import { useAnimatedConfidence } from '@/pages/policies/components/copilot/useAnimatedConfidence'
import type { CopilotAttachedFile } from '@/pages/policies/components/CopilotComposer'
import { kindLabel } from '@/pages/quotes/utils/quoteWizardDocuments'
import {
  submissionsMock,
  type SubmissionIssue,
  type SubmissionListRecord,
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

const quickActionChipSx = {
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

function renderSummaryText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <Box component="strong" key={index} sx={{ fontWeight: 700 }}>
          {part.slice(2, -2)}
        </Box>
      )
    }
    return part
  })
}

function openBlockingIssues(submission: SubmissionListRecord) {
  return submission.issues.filter((issue) => issue.severity === 'blocking' && !issue.resolvedAt)
}

function openWarningIssues(submission: SubmissionListRecord) {
  return submission.issues.filter((issue) => issue.severity === 'warning' && !issue.resolvedAt)
}

function parseResolvedDetails(issue: SubmissionIssue, message: string): string[] {
  const normalized = message.toLowerCase()

  if (issue.id === 'iss-payroll' || /payroll/i.test(issue.title)) {
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

function parseResolvedDetailsFromAttachments(
  issue: SubmissionIssue,
  message: string,
  files: CopilotAttachedFile[],
): string[] {
  const attached = files.map((file) => `Attached ${kindLabel(file.kind)}: ${file.name}`)

  if (message.trim()) {
    return [...parseResolvedDetails(issue, message), ...attached]
  }

  if (issue.missingDetails.length > 0) {
    return [
      ...issue.missingDetails.map((detail) => `${detail}: provided via attached document`),
      ...attached,
    ]
  }

  return attached.length > 0 ? attached : ['Documents attached']
}

function isUploadGuidedAction(action: string) {
  return /upload|attach|import|drop/i.test(action)
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

function IssueDetailCard({
  issue,
  submissionNumber,
  onBack,
  onGuidedResolve,
  onRequestAttach,
}: {
  issue: SubmissionIssue
  submissionNumber: string
  onBack: () => void
  onGuidedResolve?: (issue: SubmissionIssue, action: string) => void
  onRequestAttach?: () => void
}) {
  const isResolved = Boolean(issue.resolvedAt)
  const details = isResolved ? (issue.resolvedDetails ?? []) : issue.missingDetails
  const isGuided = issue.resolutionMode === 'guided' && !isResolved
  const timestamp = issue.resolvedAt ?? issue.reportedAt

  const severityLabel = issue.severity === 'blocking' ? 'Blocking' : 'Needs review'
  const summaryText = isResolved
    ? `**${issue.title}** is cleared for **${submissionNumber}**. ${issue.whyItMatters} Premium can now be estimated.`
    : `**${issue.title}** — ${issue.summary} This is marked **${severityLabel.toLowerCase()}** on **${submissionNumber}** and currently blocks intake until resolved. ${issue.whyItMatters}`

  const insights = isResolved
    ? details.map((detail) => `Resolved · ${detail}`)
    : [
        `${severityLabel} · ${isGuided ? 'Guided actions or document upload' : 'Conversational — ask Copilot or attach docs'}`,
        ...details.map((detail) => `Missing · ${detail}`),
        'Composer · Drop files here or paste details to resolve',
      ]

  const quickActions = isResolved
    ? ['Continue to next issue', 'Summarize submission']
    : isGuided
      ? (issue.guidedActions ?? ['Open guided checklist'])
      : ['Resolve with details below', 'Request from producer', 'Add a note']

  return (
    <Stack spacing={0}>
      <Stack direction="row" alignItems="center" spacing={0.25} sx={{ mb: 1.5 }}>
        <IconButton size="small" aria-label="Back to issues" onClick={onBack} sx={{ ml: -0.75 }}>
          <ArrowBackIcon fontSize="small" sx={{ color: 'secondary.main' }} />
        </IconButton>
        <Typography variant="subtitle2" sx={copilotSubtitleSx}>
          {issue.title}
        </Typography>
      </Stack>

      <Typography variant="caption" color="text.secondary" display="block" sx={{ ...bodySx, mb: 0.75 }}>
        {issue.id} · {submissionNumber} · {timestamp}
      </Typography>

      <Typography variant="body2" sx={{ ...bodySx, lineHeight: 1.6, mb: 2 }}>
        {renderSummaryText(summaryText)}
      </Typography>

      <Typography variant="body2" sx={{ ...copilotSectionHeadingSx, mb: 1 }}>
        Key insights
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2.5, mb: 2 }}>
        {insights.map((insight) => (
          <Typography
            component="li"
            variant="body2"
            color="text.secondary"
            key={insight}
            sx={{ ...bodySx, mb: 0.5 }}
          >
            {insight}
          </Typography>
        ))}
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Typography variant="caption" color="text.secondary" display="block" sx={{ ...bodySx, mb: 1 }}>
        Quick actions
      </Typography>
      <Stack direction="row" flexWrap="wrap" gap={1}>
        {quickActions.map((action) => (
          <Button
            key={action}
            size="small"
            variant="text"
            disableRipple
            sx={quickActionChipSx}
            onClick={() => {
              if (isResolved) {
                if (action === 'Continue to next issue') onBack()
                return
              }
              if (isUploadGuidedAction(action)) {
                onRequestAttach?.()
                return
              }
              if (isGuided || action !== 'Resolve with details below') {
                onGuidedResolve?.(issue, action)
              }
            }}
          >
            {action}
          </Button>
        ))}
      </Stack>
    </Stack>
  )
}

function ReadyPremiumView({ submission }: { submission: SubmissionListRecord }) {
  return (
    <Box sx={{ mx: -2, mb: 0 }}>
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
    </Box>
  )
}

function SummarizeView({ submissions }: { submissions: SubmissionListRecord[] }) {
  const blocked = submissions.filter((row) => row.status === 'Blocked')
  const ready = submissions.filter((row) => row.status === 'Ready')
  const queueBlocked = blocked.filter((row) => row.assignedTo === 'Underwriting Queue')

  const summaryText = `Copilot is monitoring **${submissions.length}** selected submissions. **${blocked.length}** ${blocked.length === 1 ? 'is' : 'are'} blocked and **${ready.length}** ${ready.length === 1 ? 'is' : 'are'} ready for underwriting review.`

  const insights = [
    `${blocked.length} submission${blocked.length === 1 ? '' : 's'} blocked and require action`,
    `${ready.length} submission${ready.length === 1 ? '' : 's'} ready for underwriting review`,
    queueBlocked.length > 0
      ? `Most blocked submissions are in the Underwriting Queue (${queueBlocked.length})`
      : 'Blocked submissions are assigned across underwriters',
    'Resolve blockers in Copilot without leaving the list — payroll, loss history, and exposure gaps are the top causes',
  ]

  return (
    <>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ ...bodySx, mb: 0.75 }}>
        {submissions.length} selected
      </Typography>
      <Typography variant="body2" sx={{ ...bodySx, lineHeight: 1.6, mb: 2 }}>
        {renderSummaryText(summaryText)}
      </Typography>
      <Typography variant="body2" sx={{ ...copilotSectionHeadingSx, mb: 1 }}>
        Key insights
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2.5, mb: 2 }}>
        {insights.map((insight) => (
          <Typography
            component="li"
            variant="body2"
            color="text.secondary"
            key={insight}
            sx={{ ...bodySx, mb: 0.5 }}
          >
            {insight}
          </Typography>
        ))}
      </Box>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="caption" color="text.secondary" display="block" sx={{ ...bodySx, mb: 1 }}>
        Quick actions
      </Typography>
      <Stack direction="row" flexWrap="wrap" gap={1}>
        {['Assign blocked submission', 'Summarize blockers', 'Open first blocked'].map((action) => (
          <Button key={action} size="small" variant="text" disableRipple sx={quickActionChipSx}>
            {action}
          </Button>
        ))}
      </Stack>
    </>
  )
}

function WorkspaceView() {
  const blocked = submissionsMock.filter((row) => row.status === 'Blocked').length
  const ready = submissionsMock.filter((row) => row.status === 'Ready').length
  const queueBlocked = submissionsMock.filter(
    (row) => row.status === 'Blocked' && row.assignedTo === 'Underwriting Queue',
  ).length

  const summaryText = `Copilot is monitoring **${submissionsMock.length}** incoming submissions to identify items that require attention. Select a blocked submission — or multi-select rows — to resolve issues in place.`

  const insights = [
    `${blocked} submissions are blocked and require action`,
    `${ready} submissions are ready for underwriting review`,
    `Payroll, loss history, and exposure gaps remain the most common blockers`,
    queueBlocked > 0
      ? `Most blocked volume sits in the Underwriting Queue (${queueBlocked})`
      : 'Blocked submissions are assigned across underwriters',
  ]

  return (
    <>
      <Typography variant="body2" sx={{ ...bodySx, lineHeight: 1.6, mb: 2 }}>
        {summaryText}
      </Typography>
      <Typography variant="body2" sx={{ ...copilotSectionHeadingSx, mb: 1 }}>
        Key insights
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2.5, mb: 2 }}>
        {insights.map((insight) => (
          <Typography
            component="li"
            variant="body2"
            color="text.secondary"
            key={insight}
            sx={{ ...bodySx, mb: 0.5 }}
          >
            {insight}
          </Typography>
        ))}
      </Box>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="caption" color="text.secondary" display="block" sx={{ ...bodySx, mb: 1 }}>
        Quick actions
      </Typography>
      <Stack direction="row" flexWrap="wrap" gap={1}>
        {['Assign blocked submission', 'Show blocked only', 'Open intake summary'].map((action) => (
          <Button key={action} size="small" variant="text" disableRipple sx={quickActionChipSx}>
            {action}
          </Button>
        ))}
      </Stack>
    </>
  )
}

export function SubmissionsCopilotPanel({
  focusedSubmission = null,
  selectedSubmissions = [],
  onResolveIssue,
  onClose,
}: SubmissionsCopilotPanelProps) {
  const [activeIssueId, setActiveIssueId] = useState<string | null>(null)
  const [attachRequestKey, setAttachRequestKey] = useState<number | null>(null)
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

  const handleSubmit = (message: string, files: CopilotAttachedFile[] = []) => {
    if (!focusedSubmission) return

    const targetIssue = activeIssue ?? openBlockingIssues(focusedSubmission)[0] ?? null
    if (!targetIssue || targetIssue.severity !== 'blocking' || targetIssue.resolvedAt) return

    const details =
      files.length > 0
        ? parseResolvedDetailsFromAttachments(targetIssue, message, files)
        : message.trim()
          ? parseResolvedDetails(targetIssue, message)
          : null

    if (!details) return

    onResolveIssue?.(focusedSubmission.id, targetIssue.id, details)
    setActiveIssueId(targetIssue.id)
  }

  const handleGuidedResolve = (issue: SubmissionIssue, action: string) => {
    if (!focusedSubmission || issue.resolvedAt) return
    if (isUploadGuidedAction(action)) {
      setAttachRequestKey((key) => (key ?? 0) + 1)
      return
    }
    const details =
      issue.missingDetails.length > 0
        ? issue.missingDetails.map((item) => `${item}: captured via “${action}”`)
        : [`Resolved via “${action}”`]
    onResolveIssue?.(focusedSubmission.id, issue.id, details)
    setActiveIssueId(issue.id)
  }

  const composerPlaceholder = activeIssue
    ? activeIssue.resolvedAt
      ? 'Add more details or continue...'
      : activeIssue.resolutionMode === 'guided'
        ? 'Drop supporting docs here, or paste details if you already have them...'
        : activeIssue.composerPlaceholder.includes('...')
          ? activeIssue.composerPlaceholder.replace(
              /\.\.\.$/,
              ' — or drop supporting documents here...',
            )
          : `${activeIssue.composerPlaceholder} — or drop supporting documents here`
    : focusedSubmission?.status === 'Blocked'
      ? 'Add details or drop documents to resolve...'
      : multiSelectMode
        ? 'Ask more...'
        : 'Ask about submissions...'

  const summaryTitle = activeIssue
    ? 'Issue details'
    : multiSelectMode
      ? 'Selection summary'
      : focusedSubmission?.status === 'Ready'
        ? 'Premium outlook'
        : focusedSubmission
          ? 'Submission issues'
          : 'Intake summary'

  return (
    <CopilotDrawerShell
      onClose={onClose}
      composerPlaceholder={composerPlaceholder}
      chatFocusKey={`${focusKey}:${activeIssueId ?? 'list'}`}
      attachRequestKey={attachRequestKey}
      onComposerSubmit={handleSubmit}
      headerTrailing={
        showConfidence ? (
          <CopilotConfidenceIndicator
            animatedValue={animatedConfidence}
            displayedValue={displayedConfidence}
            statusLabel={confidenceStatusLabel}
            popoverTitle="Submission confidence"
            popoverDescription="How complete and consistent this submission is based on captured details and underwriting status."
            tiers={DEFAULT_COPILOT_CONFIDENCE_TIERS}
          />
        ) : undefined
      }
      toolbarLeading={
        activeIssue ? undefined : (
          <Typography variant="subtitle2" sx={copilotSubtitleSx}>
            {summaryTitle}
          </Typography>
        )
      }
      showToolbar={!activeIssue}
    >
      {multiSelectMode ? (
        <SummarizeView submissions={selectedSubmissions} />
      ) : !focusedSubmission ? (
        <WorkspaceView />
      ) : activeIssue ? (
        <IssueDetailCard
          issue={activeIssue}
          submissionNumber={focusedSubmission.submissionNumber}
          onBack={() => setActiveIssueId(null)}
          onGuidedResolve={handleGuidedResolve}
          onRequestAttach={() => setAttachRequestKey((key) => (key ?? 0) + 1)}
        />
      ) : focusedSubmission.status === 'Ready' ? (
        <>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ ...bodySx, mb: 0.75 }}>
            {focusedSubmission.submissionNumber}
          </Typography>
          <Typography variant="body2" sx={{ ...bodySx, lineHeight: 1.6, mb: 2 }}>
            {renderSummaryText(
              `**${focusedSubmission.insuredName}** — Submission **${focusedSubmission.submissionNumber}** is **Ready** with **${focusedSubmission.confidence}%** confidence. Review premium ranges and remaining warnings before proceeding.`,
            )}
          </Typography>
          <Typography variant="body2" sx={{ ...copilotSectionHeadingSx, mb: 1 }}>
            Key insights
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2.5, mb: 2 }}>
            {(
              (focusedSubmission.readyInsights?.length
                ? focusedSubmission.readyInsights.map(
                    (insight) => `${insight.title} · ${insight.summary}`,
                  )
                : (focusedSubmission.premiumEstimates ?? []).map(
                    (estimate) => `${estimate.label} · Estimated ${estimate.range}`,
                  )
              ) as string[]
            )
              .slice(0, 4)
              .map((insight) => (
                <Typography
                  component="li"
                  variant="body2"
                  color="text.secondary"
                  key={insight}
                  sx={{ ...bodySx, mb: 0.5 }}
                >
                  {insight}
                </Typography>
              ))}
          </Box>
          <ReadyPremiumView submission={focusedSubmission} />
          <Divider sx={{ my: 2 }} />
          <Typography variant="caption" color="text.secondary" display="block" sx={{ ...bodySx, mb: 1 }}>
            Quick actions
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {['Review premium drivers', 'Export briefing', 'Ask about exposure'].map((action) => (
              <Button key={action} size="small" variant="text" disableRipple sx={quickActionChipSx}>
                {action}
              </Button>
            ))}
          </Stack>
        </>
      ) : (
        <>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ ...bodySx, mb: 0.75 }}>
            {focusedSubmission.submissionNumber}
          </Typography>
          <Typography variant="body2" sx={{ ...bodySx, lineHeight: 1.6, mb: 1.5 }}>
            {renderSummaryText(
              `**${focusedSubmission.insuredName}** — Submission **${focusedSubmission.submissionNumber}** is **Blocked**. Select an issue below to resolve it in Copilot.`,
            )}
          </Typography>
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
        </>
      )}
    </CopilotDrawerShell>
  )
}

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import BlockIcon from '@mui/icons-material/Block'
import CloseIcon from '@mui/icons-material/Close'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { useRightTool } from '@/app/contexts/RightToolContext'
import { CopilotQuickActions } from '@/design-system/components'
import { accentSubtle, accentSubtleHover } from '@/design-system/theme/themeSurfaces'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import {
  DocumentAttachPanelContent,
  targetLabels,
} from '@/pages/policies/components/DocumentAttachComposer'
import {
  DEFAULT_COPILOT_CONFIDENCE_TIERS,
  getCopilotConfidenceStatusLabel,
} from '@/pages/policies/components/copilot/copilotConfidence'
import { CopilotConfidenceIndicator } from '@/pages/policies/components/copilot/CopilotConfidenceIndicator'
import { CopilotDrawerShell } from '@/pages/policies/components/copilot/CopilotDrawerShell'
import { CopilotContentTransition } from '@/pages/policies/components/copilot/CopilotContentTransition'
import {
  copilotDrawerHeadingSx,
  copilotSectionHeadingSx,
  copilotSubtitleSx,
} from '@/pages/policies/components/copilot/copilotDrawerStyles'
import { useAnimatedConfidence } from '@/pages/policies/components/copilot/useAnimatedConfidence'
import type { CopilotAttachedFile } from '@/pages/policies/components/CopilotComposer'
import { kindLabel } from '@/pages/quotes/utils/quoteWizardDocuments'
import {
  buildIssueNoteDraft,
  buildDeclineToQuoteEmail,
  buildDeclineToQuoteSendConfirmation,
  buildProducerRequestEmail,
  buildQuotePackageAttachments,
  buildQuotePackageEmail,
  buildQuotePackageSendConfirmation,
  buildQuoteSentMessageFromPackage,
  buildQuoteSentNextUpLine,
  buildRequestInfoSendConfirmation,
  findNextReadySubmission,
  isAddNoteAction,
  isProducerRequestAction,
  producerRequestResolvedDetails,
  SUBMISSION_PRODUCER_EMAIL,
  type IssueNoteDraft,
} from '@/pages/submissions/data/producerRequestEmail'
import {
  resolvePremiumStructureOptions,
  submissionsMock,
  type PremiumEstimate,
  type SubmissionIssue,
  type SubmissionListRecord,
} from '@/pages/submissions/data/mockSubmissions'
import type { PolicyDocument } from '@/pages/policies/data/mockDocuments'
import {
  buildSubmissionInsightBriefing,
  type SubmissionCopilotEntryMode,
} from '@/pages/submissions/data/submissionCopilotInsights'

export type SubmissionsCopilotSentEmail = {
  to: string
  subject: string
  body: string
  subtitle: string
  documents: PolicyDocument[]
}

export type SubmissionsCopilotSendConfirmation = {
  submissionId: string
  message: string
  nextUpLine?: string
  followUpActions: string[]
  sentEmail?: SubmissionsCopilotSentEmail
}

type SubmissionsCopilotPanelProps = {
  focusedSubmission?: SubmissionListRecord | null
  selectedSubmissions?: SubmissionListRecord[]
  /** Full queue used to resolve “next Ready” follow-ups after quote send. */
  queueSubmissions?: SubmissionListRecord[]
  entryMode?: SubmissionCopilotEntryMode
  /** Opens directly into this issue (status mode) when set. */
  initialIssueId?: string | null
  onEntryModeChange?: (mode: SubmissionCopilotEntryMode) => void
  onResolveIssue?: (submissionId: string, issueId: string, resolvedDetails: string[]) => void
  onApprovePremiumOption?: (
    submissionId: string,
    recommended: PremiumEstimate,
    included: PremiumEstimate[],
    recipient: string,
  ) => void
  onDeclineSubmission?: (submissionId: string, recipient: string) => void
  /** After quote send — e.g. navigate list → Quoted detail. */
  onAfterQuotePackageSent?: (
    submission: SubmissionListRecord,
    confirmation: SubmissionsCopilotSendConfirmation,
  ) => void
  /** After decline send — e.g. navigate list → Declined detail. */
  onAfterDeclineSent?: (
    submission: SubmissionListRecord,
    confirmation: SubmissionsCopilotSendConfirmation,
  ) => void
  /** Survives Email-tool unmount — set from the parent page. */
  sendConfirmation?: SubmissionsCopilotSendConfirmation | null
  onSendConfirmation?: (confirmation: SubmissionsCopilotSendConfirmation | null) => void
  onOpenNextReadySubmission?: (submission: SubmissionListRecord) => void
  onShowReadyOnly?: () => void
  onClearFocus?: () => void
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
  isLast = false,
}: {
  issue: SubmissionIssue
  onSelect: (issue: SubmissionIssue) => void
  isLast?: boolean
}) {
  const isBlocking = issue.severity === 'blocking'
  return (
    <Box
      component="button"
      type="button"
      onClick={() => onSelect(issue)}
      sx={{
        ...flatListRowSx,
        borderBottom: isLast ? 'none' : 1,
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
          <ArrowBackIcon fontSize="small" sx={{ color: 'action.active' }} />
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
            color="text.primary"
            key={insight}
            sx={{ ...bodySx, mb: 0.5 }}
          >
            {insight}
          </Typography>
        ))}
      </Box>
      <Divider sx={{ mb: 2 }} />

      <CopilotQuickActions
        actions={quickActions}
        onAction={(action) => {
          if (isResolved) {
            if (action === 'Continue to next issue') onBack()
            return
          }
          if (isUploadGuidedAction(action)) {
            onRequestAttach?.()
            return
          }
          if (isProducerRequestAction(action) || isAddNoteAction(action)) {
            onGuidedResolve?.(issue, action)
            return
          }
          if (isGuided || action !== 'Resolve with details below') {
            onGuidedResolve?.(issue, action)
          }
        }}
      />
    </Stack>
  )
}

function SubmissionInsightView({
  submission,
  onViewStatus,
  onSeedComposer,
  onDraftProducerEmail,
}: {
  submission: SubmissionListRecord
  onViewStatus: () => void
  onSeedComposer?: (message: string) => void
  onDraftProducerEmail?: () => void
}) {
  const briefing = useMemo(() => buildSubmissionInsightBriefing(submission), [submission])

  return (
    <>
      <Typography variant="body2" sx={{ ...bodySx, fontWeight: 600, color: 'text.primary', mb: 0.25 }}>
        {briefing.header}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ ...bodySx, mb: 1.5 }}>
        {briefing.subhead}
      </Typography>
      <Box sx={{ mb: 2 }}>
        {briefing.lines.map((line) => (
          <Typography
            key={line}
            variant="body2"
            color="text.primary"
            sx={{ ...bodySx, lineHeight: 1.55, mb: 0.75 }}
          >
            {renderSummaryText(line)}
          </Typography>
        ))}
      </Box>
      <Divider sx={{ mb: 2 }} />
      <CopilotQuickActions
        actions={briefing.quickActions}
        onAction={(action) => {
          if (action === briefing.statusQuickActionLabel || action === 'View status & resolve issues') {
            onViewStatus()
            return
          }
          if (
            action === 'Draft producer follow-up' ||
            action === 'Draft a note to the producer' ||
            action === 'Draft a note to compliance'
          ) {
            onDraftProducerEmail?.()
            onSeedComposer?.(
              action === 'Draft a note to compliance'
                ? `Draft a note to compliance about the OFAC hold on ${submission.submissionNumber} (${submission.insuredName}).`
                : `Draft a producer follow-up for ${submission.submissionNumber} (${submission.insuredName}) about the open blocker.`,
            )
            return
          }
          if (action === 'Explain the OFAC hold') {
            onSeedComposer?.(
              `Explain the OFAC hold on ${submission.submissionNumber} — why it triggered, what Compliance needs, and how clearance works.`,
            )
            return
          }
          if (action === 'Explain the SOV gap') {
            onSeedComposer?.(
              `Explain the Statement of Values gap on ${submission.submissionNumber} and what the producer must provide to unblock property rating.`,
            )
            return
          }
          if (action === 'What can proceed vs what is frozen') {
            onSeedComposer?.(
              `For ${submission.submissionNumber}, what work can proceed while this blocker remains, and what is frozen until it clears?`,
            )
            return
          }
          if (action === 'Summarize for underwriter') {
            onSeedComposer?.(
              `Summarize ${submission.submissionNumber} for underwriting handoff — account fit, confidence, and recommended next step.`,
            )
            return
          }
          if (action === 'Ask about exposure') {
            onSeedComposer?.(
              `What exposure and appetite considerations should I watch on ${submission.submissionNumber} (${submission.linesOfBusiness.join(', ')})?`,
            )
          }
        }}
      />
    </>
  )
}

function ReadyStructureOptionsView({
  submission,
  onEmailQuoteOptions,
  onDeclineToQuote,
  onSeedComposer,
}: {
  submission: SubmissionListRecord
  onEmailQuoteOptions?: (recommended: PremiumEstimate, included: PremiumEstimate[]) => void
  onDeclineToQuote?: () => void
  onSeedComposer?: (message: string) => void
}) {
  const options = useMemo(
    () =>
      resolvePremiumStructureOptions(submission.premiumEstimates, {
        linesOfBusiness: submission.linesOfBusiness,
        confidence: submission.confidence,
      }),
    [submission.confidence, submission.linesOfBusiness, submission.premiumEstimates],
  )

  const defaultRecommended =
    options.find((option) => option.recommended)?.label ??
    submission.approvedPremiumLabel ??
    options[0]?.label ??
    null

  const [recommendedLabel, setRecommendedLabel] = useState<PremiumEstimate['label'] | null>(
    defaultRecommended,
  )
  const [includedLabels, setIncludedLabels] = useState<PremiumEstimate['label'][]>(() =>
    defaultRecommended ? [defaultRecommended] : [],
  )
  const [uncheckHint, setUncheckHint] = useState(false)

  useEffect(() => {
    const nextRecommended =
      options.find((option) => option.recommended)?.label ??
      options[0]?.label ??
      null
    setRecommendedLabel(nextRecommended)
    setIncludedLabels(nextRecommended ? [nextRecommended] : [])
    setUncheckHint(false)
  }, [options, submission.id])

  const recommended = options.find((option) => option.label === recommendedLabel) ?? options[0]
  const included = options.filter((option) => includedLabels.includes(option.label))
  const includedCount = included.length

  if (options.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ ...bodySx, mb: 2 }}>
        Copilot has not proposed a premium structure yet.
      </Typography>
    )
  }

  const optionWord = options.length === 1 ? 'option' : 'options'
  const summaryText =
    options.length === 1
      ? `**${submission.insuredName}** — Submission **${submission.submissionNumber}** is **Ready** with **${submission.confidence}%** confidence. Copilot is presenting **1** structure option — alternatives were not meaningfully different.`
      : `**${submission.insuredName}** — Submission **${submission.submissionNumber}** is **Ready** with **${submission.confidence}%** confidence. Copilot is presenting **${options.length}** distinct structure ${optionWord}${recommended ? ` · recommending **${recommended.label}**` : ''}.`

  const packageCountLabel = `${includedCount} option${includedCount === 1 ? '' : 's'} in package`
  const helperText = recommended
    ? `Reviewing **${recommended.label}** (recommended) at **${recommended.range}**. ${packageCountLabel}.`
    : null

  const EMAIL_QUOTE_ACTION = 'Email quote options to producer'
  const DECLINE_ACTION = 'Decline to quote'
  const quickActions = [
    EMAIL_QUOTE_ACTION,
    ...(options.length > 1 ? ['Compare options'] : []),
    DECLINE_ACTION,
  ]

  const toggleIncluded = (label: PremiumEstimate['label']) => {
    if (label === recommendedLabel) {
      setUncheckHint(true)
      return
    }
    setUncheckHint(false)
    setIncludedLabels((current) => {
      if (current.includes(label)) {
        return current.filter((item) => item !== label)
      }
      return [...current, label]
    })
  }

  const setAsRecommended = (label: PremiumEstimate['label']) => {
    setUncheckHint(false)
    setRecommendedLabel(label)
    setIncludedLabels((current) => (current.includes(label) ? current : [...current, label]))
  }

  return (
    <>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ ...bodySx, mb: 0.75 }}>
        {submission.submissionNumber}
      </Typography>
      <Typography variant="body2" sx={{ ...bodySx, lineHeight: 1.6, mb: 2 }}>
        {renderSummaryText(summaryText)}
      </Typography>

      {(submission.readyInsights?.length ?? 0) > 0 && (
        <>
          <Typography variant="body2" sx={{ ...copilotSectionHeadingSx, mb: 1 }}>
            Key insights
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2.5, mb: 2 }}>
            {submission.readyInsights!.slice(0, 3).map((insight) => (
              <Typography
                component="li"
                variant="body2"
                color="text.primary"
                key={insight.id}
                sx={{ ...bodySx, mb: 0.5 }}
              >
                {insight.title} · {insight.summary}
              </Typography>
            ))}
          </Box>
        </>
      )}

      <Typography variant="body2" sx={{ ...copilotSectionHeadingSx, mb: 1 }}>
        {options.length === 1 ? 'Proposed structure' : 'Structure options'}
      </Typography>
      <Stack spacing={0} sx={{ mb: 0 }}>
        {options.map((option, index) => {
          const isIncluded = includedLabels.includes(option.label)
          const isRecommended = recommendedLabel === option.label
          const isLast = index === options.length - 1
          return (
            <Box
              key={option.label}
              sx={(theme) => ({
                width: '100%',
                textAlign: 'left',
                border: 'none',
                borderRadius: 0,
                borderBottom: isLast ? 'none' : '1px solid',
                borderColor: 'divider',
                bgcolor: isIncluded ? accentSubtle(theme) : 'transparent',
                px: 1.5,
                py: 1.25,
                transition: 'background-color 0.15s ease',
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: isIncluded ? accentSubtle(theme) : accentSubtleHover(theme),
                },
              })}
            >
              <Stack direction="row" alignItems="flex-start" spacing={1}>
                <Checkbox
                  size="small"
                  checked={isIncluded}
                  onChange={() => toggleIncluded(option.label)}
                  inputProps={{ 'aria-label': `Include ${option.label} in quote package` }}
                  sx={{ p: 0.25, mt: 0.125, flexShrink: 0 }}
                />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1}
                    sx={{ minWidth: 0 }}
                  >
                    <Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ minWidth: 0 }}>
                      <Typography variant="body2" sx={{ ...headingSx, fontSize: '0.875rem' }}>
                        {option.label}
                      </Typography>
                      {isRecommended ? (
                        <Typography
                          variant="caption"
                          sx={{
                            ...bodySx,
                            px: 0.75,
                            py: 0.125,
                            borderRadius: '30px',
                            bgcolor: 'success.main',
                            color: 'success.contrastText',
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                          }}
                        >
                          Recommended
                        </Typography>
                      ) : null}
                    </Stack>
                    {!isRecommended ? (
                      <Button
                        size="small"
                        variant="text"
                        color="primary"
                        onClick={() => setAsRecommended(option.label)}
                        sx={{
                          ...bodySx,
                          flexShrink: 0,
                          minWidth: 0,
                          px: 0.5,
                          py: 0,
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          textTransform: 'none',
                          color: 'text.secondary',
                          '&:hover': { bgcolor: 'transparent', color: 'primary.main' },
                        }}
                      >
                        Set as recommended
                      </Button>
                    ) : null}
                  </Stack>
                  <Typography
                    variant="body2"
                    sx={{ ...headingSx, fontSize: '0.8125rem', mt: 0.5, color: 'text.primary' }}
                  >
                    {option.range}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ ...bodySx, fontSize: '0.75rem', lineHeight: 1.45, mt: 0.5 }}
                  >
                    {option.rationale}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )
        })}
      </Stack>

      {uncheckHint ? (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ ...bodySx, display: 'block', mt: 1, fontSize: '0.75rem' }}
        >
          Set another option as recommended first.
        </Typography>
      ) : null}

      <CopilotContentTransition
        contentKey={`${submission.id}:${recommendedLabel ?? 'none'}:${includedLabels.join('|')}`}
      >
        <>
          {helperText ? (
            <Typography variant="body2" sx={{ ...bodySx, lineHeight: 1.55, mt: 1.5, mb: 0 }}>
              {renderSummaryText(helperText)}
            </Typography>
          ) : null}

          <Divider sx={{ my: 2 }} />
          <CopilotQuickActions
            actions={quickActions}
            onAction={(action) => {
              if (action === DECLINE_ACTION) {
                onDeclineToQuote?.()
                return
              }
              if (!recommended) return
              if (action === EMAIL_QUOTE_ACTION) {
                if (includedCount === 0) return
                onEmailQuoteOptions?.(recommended, included)
                return
              }
              if (action === 'Compare options') {
                const comparison = options
                  .map(
                    (option) =>
                      `${option.label}${option.label === recommendedLabel ? ' (recommended)' : ''}${includedLabels.includes(option.label) ? ' · in package' : ''}: ${option.range} — ${option.rationale}`,
                  )
                  .join('\n')
                onSeedComposer?.(
                  `Compare the ${options.length} structure options for ${submission.submissionNumber}:\n${comparison}\n\nWhich should I prefer and why?`,
                )
              }
            }}
          />
        </>
      </CopilotContentTransition>
    </>
  )
}

function SendConfirmationView({
  submissionNumber,
  message,
  nextUpLine,
  followUpActions,
  onAction,
  onSeedComposer,
}: {
  submissionNumber: string
  message: string
  nextUpLine?: string
  followUpActions: string[]
  onAction?: (action: string) => void
  onSeedComposer?: (message: string) => void
}) {
  return (
    <>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ ...bodySx, mb: 0.75 }}>
        {submissionNumber}
      </Typography>
      <Typography variant="body2" sx={{ ...bodySx, lineHeight: 1.6, mb: nextUpLine ? 1.5 : followUpActions.length > 0 ? 2 : 0, whiteSpace: 'pre-line' }}>
        {renderSummaryText(message)}
      </Typography>
      {nextUpLine ? (
        <Typography variant="body2" sx={{ ...bodySx, lineHeight: 1.55, mb: followUpActions.length > 0 ? 2 : 0 }}>
          {renderSummaryText(nextUpLine)}
        </Typography>
      ) : null}
      {followUpActions.length > 0 ? (
        <>
          <Divider sx={{ my: 2 }} />
          <CopilotQuickActions
            actions={followUpActions}
            onAction={(action) => {
              if (action === 'Schedule producer follow-up') {
                onSeedComposer?.(
                  `Schedule a producer follow-up for ${submissionNumber} to review the quote options.`,
                )
                return
              }
              onAction?.(action)
            }}
          />
        </>
      ) : null}
    </>
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
            color="text.primary"
            key={insight}
            sx={{ ...bodySx, mb: 0.5 }}
          >
            {insight}
          </Typography>
        ))}
      </Box>
      <Divider sx={{ mb: 2 }} />
      <CopilotQuickActions actions={['Assign blocked submission', 'Summarize blockers', 'Open first blocked']} />
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
            color="text.primary"
            key={insight}
            sx={{ ...bodySx, mb: 0.5 }}
          >
            {insight}
          </Typography>
        ))}
      </Box>
      <Divider sx={{ mb: 2 }} />
      <CopilotQuickActions actions={['Assign blocked submission', 'Show blocked only', 'Open intake summary']} />
    </>
  )
}

export function SubmissionsCopilotPanel({
  focusedSubmission = null,
  selectedSubmissions = [],
  queueSubmissions = [],
  entryMode = 'insight',
  initialIssueId = null,
  onEntryModeChange,
  onResolveIssue,
  onApprovePremiumOption,
  onDeclineSubmission,
  onAfterQuotePackageSent,
  onAfterDeclineSent,
  sendConfirmation = null,
  onSendConfirmation,
  onOpenNextReadySubmission,
  onShowReadyOnly,
  onClearFocus,
  onClose,
}: SubmissionsCopilotPanelProps) {
  const { openTool, setEmailAttachMode } = useRightTool()
  const [activeIssueId, setActiveIssueId] = useState<string | null>(null)
  const [attachRequestKey, setAttachRequestKey] = useState<number | null>(null)
  const [seedComposerMessage, setSeedComposerMessage] = useState<string | null>(null)
  const [issueNote, setIssueNote] = useState<IssueNoteDraft | null>(null)
  const multiSelectMode = selectedSubmissions.length > 1 && !focusedSubmission

  const activeIssue = useMemo(() => {
    if (!focusedSubmission || !activeIssueId) return null
    return focusedSubmission.issues.find((issue) => issue.id === activeIssueId) ?? null
  }, [activeIssueId, focusedSubmission])

  const focusKey = focusedSubmission?.id ?? (multiSelectMode ? 'multi' : 'workspace')
  const statusMode = entryMode === 'status'
  const activeConfirmation =
    sendConfirmation && focusedSubmission && sendConfirmation.submissionId === focusedSubmission.id
      ? sendConfirmation
      : null

  const confirmationNextReady = useMemo(() => {
    if (!focusedSubmission) return null
    return findNextReadySubmission(queueSubmissions, focusedSubmission.id)
  }, [focusedSubmission, queueSubmissions])

  useEffect(() => {
    setSeedComposerMessage(null)
    setIssueNote(null)
    if (!statusMode) {
      setActiveIssueId(null)
    }
  }, [focusKey, entryMode, statusMode])

  // Blocked → Ready: drop issue focus so Structure review can mount.
  useEffect(() => {
    if (focusedSubmission?.status === 'Ready' || focusedSubmission?.status === 'Quoted' || focusedSubmission?.status === 'Declined') {
      setActiveIssueId(null)
    }
  }, [focusedSubmission?.id, focusedSubmission?.status])

  // Deep-link / Overview blocker selection — apply when parent targets an issue.
  useEffect(() => {
    if (
      focusedSubmission?.status === 'Blocked' &&
      statusMode &&
      initialIssueId &&
      focusedSubmission.issues.some((issue) => issue.id === initialIssueId)
    ) {
      setActiveIssueId(initialIssueId)
    }
  }, [focusedSubmission, initialIssueId, statusMode])

  const confidence = focusedSubmission?.confidence ?? 0
  const showConfidence = Boolean(focusedSubmission && !multiSelectMode)
  const animatedConfidence = useAnimatedConfidence(confidence, focusKey)
  const displayedConfidence = showConfidence ? Math.round(animatedConfidence) : 0
  const confidenceStatusLabel = getCopilotConfidenceStatusLabel(confidence)

  const openProducerEmail = (action: string, issue: SubmissionIssue | null) => {
    if (!focusedSubmission) return
    setIssueNote(null)
    const draft = buildProducerRequestEmail(focusedSubmission, action, issue)
    const submission = focusedSubmission
    setEmailAttachMode({
      target: 'email',
      documents: [],
      draft: {
        to: draft.to,
        subject: draft.subject,
        body: draft.body,
        subtitle: `Producer follow-up · ${submission.submissionNumber}`,
      },
      onCancel: () => {
        openTool('copilot')
      },
      onSave: () => {
        const isLastBlocker =
          Boolean(issue) &&
          !issue!.resolvedAt &&
          issue!.severity === 'blocking' &&
          openBlockingIssues(submission).every((open) => open.id === issue!.id)
        flushSync(() => {
          if (issue && !issue.resolvedAt && issue.severity === 'blocking') {
            onResolveIssue?.(
              submission.id,
              issue.id,
              producerRequestResolvedDetails(issue, draft.action),
            )
          }
          // Last blocker → Ready Structure review; skip request-sent confirmation.
          if (!isLastBlocker) {
            onSendConfirmation?.({
              submissionId: submission.id,
              message: buildRequestInfoSendConfirmation(
                submission,
                issue,
                draft.to || SUBMISSION_PRODUCER_EMAIL,
              ),
              followUpActions: [],
            })
          } else {
            onSendConfirmation?.(null)
          }
        })
        openTool('copilot')
      },
    })
    openTool('email')
  }

  const openQuotePackageEmail = (recommended: PremiumEstimate, included: PremiumEstimate[]) => {
    if (!focusedSubmission) return
    setIssueNote(null)
    const draft = buildQuotePackageEmail(focusedSubmission, recommended, included)
    const attachments = buildQuotePackageAttachments(focusedSubmission)
    const submission = focusedSubmission
    const recipient = draft.to || SUBMISSION_PRODUCER_EMAIL
    const packageSubtitle = `Quote package · ${submission.submissionNumber} · ${attachments.length} attachments`
    setEmailAttachMode({
      target: 'email',
      documents: attachments,
      draft: {
        to: draft.to,
        subject: draft.subject,
        body: draft.body,
        saveLabel: 'Send quote',
        subtitle: packageSubtitle,
      },
      onCancel: () => {
        openTool('copilot')
      },
      onSave: () => {
        const nextReady = findNextReadySubmission(queueSubmissions, submission.id)
        const confirmation: SubmissionsCopilotSendConfirmation = {
          submissionId: submission.id,
          message: buildQuotePackageSendConfirmation(
            submission,
            recommended,
            included,
            recipient,
          ),
          nextUpLine: buildQuoteSentNextUpLine(nextReady),
          followUpActions: [
            nextReady ? 'Open next Ready submission' : 'Show Ready only',
            'Schedule producer follow-up',
            'View sent email',
          ],
          sentEmail: {
            to: recipient,
            subject: draft.subject,
            body: draft.body,
            subtitle: packageSubtitle,
            documents: attachments,
          },
        }
        flushSync(() => {
          onApprovePremiumOption?.(submission.id, recommended, included, recipient)
          onSendConfirmation?.(confirmation)
        })
        openTool('copilot')
        onAfterQuotePackageSent?.(submission, confirmation)
      },
    })
    openTool('email')
  }

  const openDeclineToQuoteEmail = () => {
    if (!focusedSubmission) return
    setIssueNote(null)
    const draft = buildDeclineToQuoteEmail(focusedSubmission)
    const submission = focusedSubmission
    const recipient = draft.to || SUBMISSION_PRODUCER_EMAIL
    const declineSubtitle = `Decline to quote · ${submission.submissionNumber}`
    setEmailAttachMode({
      target: 'email',
      documents: [],
      draft: {
        to: draft.to,
        subject: draft.subject,
        body: draft.body,
        saveLabel: 'Send',
        subtitle: declineSubtitle,
      },
      onCancel: () => {
        openTool('copilot')
      },
      onSave: () => {
        const nextReady = findNextReadySubmission(queueSubmissions, submission.id)
        const confirmation: SubmissionsCopilotSendConfirmation = {
          submissionId: submission.id,
          message: buildDeclineToQuoteSendConfirmation(submission, recipient),
          nextUpLine: buildQuoteSentNextUpLine(nextReady),
          followUpActions: [
            nextReady ? 'Open next Ready submission' : 'Show Ready only',
            'Schedule producer follow-up',
            'View sent email',
          ],
          sentEmail: {
            to: recipient,
            subject: draft.subject,
            body: draft.body,
            subtitle: declineSubtitle,
            documents: [],
          },
        }
        flushSync(() => {
          onDeclineSubmission?.(submission.id, recipient)
          onSendConfirmation?.(confirmation)
        })
        openTool('copilot')
        onAfterDeclineSent?.(submission, confirmation)
      },
    })
    openTool('email')
  }

  const openSentQuoteEmail = (sent: SubmissionsCopilotSentEmail) => {
    setEmailAttachMode({
      target: 'email',
      documents: sent.documents,
      readOnly: true,
      draft: {
        to: sent.to,
        subject: sent.subject,
        body: sent.body,
        subtitle: `Sent · ${sent.subtitle}`,
      },
      onCancel: () => {
        openTool('copilot')
      },
    })
    openTool('email')
  }

  const handleQuoteConfirmationAction = (action: string) => {
    if (action === 'Open next Ready submission') {
      const next =
        confirmationNextReady ??
        (focusedSubmission ? findNextReadySubmission(queueSubmissions, focusedSubmission.id) : null)
      if (next) onOpenNextReadySubmission?.(next)
      return
    }
    if (action === 'Show Ready only') {
      onShowReadyOnly?.()
      return
    }
    if (action === 'View sent email') {
      if (activeConfirmation?.sentEmail) {
        openSentQuoteEmail(activeConfirmation.sentEmail)
        return
      }
      if (!focusedSubmission?.quotePackageSent) return
      const sent = focusedSubmission.quotePackageSent
      const recommended =
        focusedSubmission.premiumEstimates?.find(
          (option) => option.label === sent.recommendedLabel,
        ) ??
        ({
          label: sent.recommendedLabel,
          range: sent.recommendedRange,
          rationale: '',
          recommended: true,
        } satisfies PremiumEstimate)
      const included = sent.included.map((option) => {
        const fromEstimates = focusedSubmission.premiumEstimates?.find(
          (estimate) => estimate.label === option.label,
        )
        return (
          fromEstimates ??
          ({
            label: option.label,
            range: option.range,
            rationale: '',
            recommended: option.label === sent.recommendedLabel,
          } satisfies PremiumEstimate)
        )
      })
      const draft = buildQuotePackageEmail(focusedSubmission, recommended, included)
      const attachments = buildQuotePackageAttachments(focusedSubmission)
      openSentQuoteEmail({
        to: sent.recipient,
        subject: draft.subject,
        body: draft.body,
        subtitle: `Quote package · ${focusedSubmission.submissionNumber} · ${attachments.length} attachments`,
        documents: attachments,
      })
    }
  }

  const openIssueNote = (issue: SubmissionIssue, action = 'Add a note') => {
    if (!focusedSubmission) return
    setIssueNote(buildIssueNoteDraft(focusedSubmission, issue, action))
  }

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
    const remainingAfter =
      openBlockingIssues(focusedSubmission).filter((issue) => issue.id !== targetIssue.id).length
    setActiveIssueId(remainingAfter === 0 ? null : targetIssue.id)
  }

  const handleGuidedResolve = (issue: SubmissionIssue, action: string) => {
    if (!focusedSubmission || issue.resolvedAt) return
    if (isUploadGuidedAction(action)) {
      setAttachRequestKey((key) => (key ?? 0) + 1)
      return
    }
    if (isProducerRequestAction(action)) {
      openProducerEmail(action, issue)
      return
    }
    if (isAddNoteAction(action)) {
      openIssueNote(issue, action)
      return
    }
    const details =
      issue.missingDetails.length > 0
        ? issue.missingDetails.map((item) => `${item}: captured via “${action}”`)
        : [`Resolved via “${action}”`]
    onResolveIssue?.(focusedSubmission.id, issue.id, details)
    const remainingAfter =
      openBlockingIssues(focusedSubmission).filter((open) => open.id !== issue.id).length
    setActiveIssueId(remainingAfter === 0 ? null : issue.id)
  }

  const handleSaveIssueNote = () => {
    if (!issueNote) return
    // Note is captured in the compose flow; keep the issue open for follow-up resolution.
    setActiveIssueId(issueNote.issue.id)
    setIssueNote(null)
  }

  const composerPlaceholder =
    focusedSubmission?.status === 'Ready'
      ? 'Ask about this submission...'
      : focusedSubmission?.status === 'Quoted'
        ? 'Ask about this submission...'
        : focusedSubmission && !statusMode && !activeIssue
          ? 'Ask about this submission...'
          : activeIssue
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

  const summaryTitle =
    focusedSubmission?.status === 'Quoted'
      ? 'Quote sent'
      : focusedSubmission?.status === 'Declined'
        ? 'Decline sent'
        : focusedSubmission?.status === 'Ready'
          ? 'Structure review'
          : activeConfirmation
            ? 'Request sent'
            : activeIssue
              ? 'Issue details'
              : multiSelectMode
                ? 'Selection summary'
                : focusedSubmission && !statusMode
                  ? 'Submission briefing'
                  : focusedSubmission
                    ? 'Submission issues'
                    : 'Intake summary'

  const panelContentKey = multiSelectMode
    ? `multi:${selectedSubmissions.map((row) => row.id).join('|')}`
    : !focusedSubmission
      ? 'workspace'
      : focusedSubmission.status === 'Quoted'
        ? `quoted:${focusedSubmission.id}:${activeConfirmation ? 'sent' : 'package'}`
        : focusedSubmission.status === 'Declined'
          ? `declined:${focusedSubmission.id}:${activeConfirmation ? 'sent' : 'package'}`
          : focusedSubmission.status === 'Ready'
            ? `ready:${focusedSubmission.id}:structure`
            : activeConfirmation
              ? `confirm:${focusedSubmission.id}:${activeConfirmation.message.slice(0, 40)}`
              : activeIssue
                ? `issue:${focusedSubmission.id}:${activeIssue.id}:${activeIssue.resolvedAt ?? 'open'}`
                : !statusMode
                  ? `insight:${focusedSubmission.id}`
                  : `blocked:${focusedSubmission.id}:list`

  const seedComposer = (message: string) => {
    setSeedComposerMessage(null)
    requestAnimationFrame(() => setSeedComposerMessage(message))
  }

  if (issueNote) {
    const attachMode = {
      target: 'note' as const,
      documents: [],
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
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          spacing={1}
          sx={{
            px: `${layoutTokens.contentPaddingX}px`,
            pt: layoutTokens.policyHeaderTopPadding,
            pb: layoutTokens.contentPaddingX / 8,
            bgcolor: 'background.paper',
            flexShrink: 0,
          }}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle1" component="h2" sx={{ ...copilotDrawerHeadingSx, lineHeight: 1.35, mb: 0.5 }}>
              {targetLabels.note}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={bodySx}>
              Submission note · {focusedSubmission?.submissionNumber}
            </Typography>
          </Box>
          {onClose ? (
            <IconButton size="small" aria-label="Close panel" onClick={onClose} sx={{ mt: -0.25 }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          ) : null}
        </Stack>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            px: `${layoutTokens.contentPaddingX}px`,
            pt: layoutTokens.contentPaddingX / 8,
            pb: layoutTokens.contentPaddingX / 8,
            overflow: 'hidden',
          }}
        >
          <DocumentAttachPanelContent
            attachMode={attachMode}
            contextLabel={focusedSubmission?.submissionNumber}
            initialSubject={issueNote.subject}
            initialBody={issueNote.body}
            onCancel={() => setIssueNote(null)}
            onSave={handleSaveIssueNote}
          />
        </Box>
      </Box>
    )
  }

  return (
    <CopilotDrawerShell
      onClose={onClose}
      composerPlaceholder={composerPlaceholder}
      seedComposerMessage={seedComposerMessage}
      chatFocusKey={`${focusKey}:${entryMode}:${activeIssueId ?? 'list'}:${activeConfirmation ? 'sent' : 'open'}`}
      contentKey={panelContentKey}
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
        activeIssue && !activeConfirmation ? undefined : focusedSubmission && onClearFocus ? (
          <Stack direction="row" alignItems="center" spacing={0.25} sx={{ minWidth: 0 }}>
            <IconButton
              size="small"
              onClick={onClearFocus}
              aria-label="Back to Submissions workspace"
              sx={{ flexShrink: 0, ml: -0.75 }}
            >
              <ArrowBackIcon fontSize="small" sx={{ color: 'action.active' }} />
            </IconButton>
            <Typography variant="subtitle2" noWrap sx={copilotSubtitleSx}>
              {summaryTitle}
            </Typography>
          </Stack>
        ) : (
          <Typography variant="subtitle2" sx={copilotSubtitleSx}>
            {summaryTitle}
          </Typography>
        )
      }
      showToolbar={!activeIssue || Boolean(activeConfirmation)}
    >
      {multiSelectMode ? (
          <SummarizeView submissions={selectedSubmissions} />
        ) : !focusedSubmission ? (
          <WorkspaceView />
        ) : focusedSubmission.status === 'Quoted' ? (
          <SendConfirmationView
            submissionNumber={focusedSubmission.submissionNumber}
            message={
              activeConfirmation?.message ??
              buildQuoteSentMessageFromPackage(focusedSubmission)
            }
            nextUpLine={
              activeConfirmation?.nextUpLine ??
              buildQuoteSentNextUpLine(confirmationNextReady)
            }
            followUpActions={
              activeConfirmation?.followUpActions?.length
                ? activeConfirmation.followUpActions
                : [
                    confirmationNextReady ? 'Open next Ready submission' : 'Show Ready only',
                    'Schedule producer follow-up',
                    ...(activeConfirmation?.sentEmail || focusedSubmission.quotePackageSent
                      ? ['View sent email']
                      : []),
                  ]
            }
            onAction={handleQuoteConfirmationAction}
            onSeedComposer={seedComposer}
          />
        ) : focusedSubmission.status === 'Declined' ? (
          <SendConfirmationView
            submissionNumber={focusedSubmission.submissionNumber}
            message={
              activeConfirmation?.message ??
              buildDeclineToQuoteSendConfirmation(focusedSubmission)
            }
            nextUpLine={
              activeConfirmation?.nextUpLine ??
              buildQuoteSentNextUpLine(confirmationNextReady)
            }
            followUpActions={
              activeConfirmation?.followUpActions?.length
                ? activeConfirmation.followUpActions
                : [
                    confirmationNextReady ? 'Open next Ready submission' : 'Show Ready only',
                    'Schedule producer follow-up',
                    ...(activeConfirmation?.sentEmail ? ['View sent email'] : []),
                  ]
            }
            onAction={handleQuoteConfirmationAction}
            onSeedComposer={seedComposer}
          />
        ) : focusedSubmission.status === 'Ready' ? (
          <ReadyStructureOptionsView
            submission={focusedSubmission}
            onEmailQuoteOptions={openQuotePackageEmail}
            onDeclineToQuote={openDeclineToQuoteEmail}
            onSeedComposer={seedComposer}
          />
        ) : activeConfirmation ? (
          <SendConfirmationView
            submissionNumber={focusedSubmission.submissionNumber}
            message={activeConfirmation.message}
            followUpActions={activeConfirmation.followUpActions}
            onAction={handleQuoteConfirmationAction}
            onSeedComposer={seedComposer}
          />
        ) : activeIssue ? (
          <IssueDetailCard
            issue={activeIssue}
            submissionNumber={focusedSubmission.submissionNumber}
            onBack={() => setActiveIssueId(null)}
            onGuidedResolve={handleGuidedResolve}
            onRequestAttach={() => setAttachRequestKey((key) => (key ?? 0) + 1)}
          />
        ) : !statusMode ? (
          <SubmissionInsightView
            submission={focusedSubmission}
            onViewStatus={() => onEntryModeChange?.('status')}
            onSeedComposer={seedComposer}
            onDraftProducerEmail={() => openProducerEmail('Draft producer follow-up', null)}
          />
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
              {[...openBlockingIssues(focusedSubmission), ...openWarningIssues(focusedSubmission)].map(
                (issue, index, all) => (
                  <IssueListItem
                    key={issue.id}
                    issue={issue}
                    isLast={index === all.length - 1}
                    onSelect={(next) => setActiveIssueId(next.id)}
                  />
                ),
              )}
            </Box>
          </>
        )}
    </CopilotDrawerShell>
  )
}

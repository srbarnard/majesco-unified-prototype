import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CloseIcon from '@mui/icons-material/Close'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import OpenInFullIcon from '@mui/icons-material/OpenInFull'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import { Button } from '@/design-system/components'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import {
  accentSubtle,
  accentSubtleHover,
  surfaceMuted,
} from '@/design-system/theme/themeSurfaces'
import type { PolicyTab } from '@/pages/policies/components/PolicyTabs'
import type { GlobalCopilotView } from '@/app/contexts/GlobalSearchContext'
import { AgenticSearchResults, DailySummaryContent } from '@/pages/policies/components/AgenticSearchResults'
import { CopilotComposer } from '@/pages/policies/components/CopilotComposer'
import {
  DocumentAttachPanelContent,
  quickActionToAttachTarget,
  targetLabels,
  type DocumentAttachMode,
} from '@/pages/policies/components/DocumentAttachComposer'
import type { PolicyDocument } from '@/pages/policies/data/mockDocuments'
import { policyDetailsMock } from '@/pages/policies/data/mockPolicyDetails'
import type { PolicyListRecord } from '@/pages/policies/data/mockPoliciesList'
import { POLICIES_TOTAL_ROWS } from '@/pages/policies/data/mockPoliciesList'
import type { InsuredDetailsRecord } from '@/pages/insureds/data/mockInsuredDetails'
import type { QuoteDetailsRecord } from '@/pages/quotes/data/mockQuoteDetails'
import type { Quote } from '@/pages/quotes/data/mockQuotes'
import { QUOTES_TOTAL_ROWS } from '@/pages/quotes/data/mockQuotes'
import type { TaskRecord } from '@/pages/tasks/data/mockTasks'
import { TASKS_TOTAL_ROWS } from '@/pages/tasks/data/mockTasks'
import { TaskRecommendationChat } from '@/pages/tasks/components/TaskRecommendationChat'

type CopilotPanelProps = {
  activePolicyTab?: PolicyTab
  context?: 'policy' | 'quotes' | 'quote-detail' | 'insured' | 'policies-list' | 'tasks' | 'global'
  globalView?: GlobalCopilotView
  agenticPrompt?: string | null
  focusedDocument?: PolicyDocument | null
  focusedQuote?: Quote | null
  focusedQuoteDetail?: QuoteDetailsRecord | null
  focusedInsured?: InsuredDetailsRecord | null
  focusedPolicyList?: PolicyListRecord | null
  focusedTask?: TaskRecord | null
  seedComposerMessage?: string | null
  onBackToTaskDetails?: () => void
  taskDetailsBackLabel?: string
  documentsWorkspaceSummary?: string
  documentsWorkspaceInsights?: string[]
  documentsImpactSummary?: string
  documentsImpactInsights?: string[]
  documentsCopilotMode?: 'workspace' | 'impact'
  documentsImpactTitle?: string
  documentPreviewMode?: boolean
  documentExtractedText?: string
  documentPreviewInsights?: string[]
  attachMode?: DocumentAttachMode | null
  attachContextLabel?: string
  onCloseAttach?: () => void
  onAttachSave?: (attachMode: DocumentAttachMode) => void
  onQuickAction?: (action: string) => void
  onClose?: () => void
}

const headingSx = {
  fontFamily: figmaFontFamilyStack.heading,
  fontWeight: 600,
} as const

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
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
  bgcolor: (theme) => accentSubtle(theme),
  px: 1.25,
  py: 0.5,
  minHeight: 'auto',
  '&:hover': {
    bgcolor: (theme) => accentSubtleHover(theme),
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

function documentInsights(document: PolicyDocument): string[] {
  return [
    `${document.kind} · ${document.tags.join(', ') || 'Untagged'}`,
    `${document.activityLabel} activity (${document.activityCount})`,
    `Uploaded by ${document.author}`,
  ]
}

function buildDocumentSummary(document: PolicyDocument) {
  return `**${document.name}** — ${document.aiSummary} ${document.description}`
}

function formatQuotePremium(value: number) {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

function formatQuoteDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function quoteInsights(quote: Quote): string[] {
  return [
    `${quote.status} · ${quote.products.join(', ')}`,
    `Producer: ${quote.producer}`,
    `Effective ${formatQuoteDate(quote.effectiveDate)} · Premium ${formatQuotePremium(quote.premium)}`,
  ]
}

function buildQuoteSummary(quote: Quote) {
  const products = quote.products.join(', ')
  return `**${quote.insured}** — Quote **${quote.quoteNumber}** covers **${products}** effective **${formatQuoteDate(quote.effectiveDate)}**. Status is **${quote.status}** with a quoted premium of **${formatQuotePremium(quote.premium)}**.`
}

function buildQuoteDetailSummary(quote: QuoteDetailsRecord) {
  return `**${quote.insuredName}** — Quote **${quote.quoteNumber}** for **${quote.product}** effective **${quote.effectiveDate}**. Status is **${quote.status}** with a quoted premium of **${quote.premium}**.`
}

function quoteDetailInsights(quote: QuoteDetailsRecord): string[] {
  return quote.copilotInsights
}

function buildInsuredSummary(insured: InsuredDetailsRecord) {
  return insured.copilotSummary
}

function insuredInsights(insured: InsuredDetailsRecord): string[] {
  return insured.copilotInsights
}

const insuredQuickActions = ['Portfolio summary', 'Open claims', 'Renewal outlook', 'Contact producer']
const quoteDetailQuickActions = ['Summarize quote', 'Compare versions', 'Send to producer', 'Check rating factors']

const quotesWorkspaceSummary =
  `You are viewing **${QUOTES_TOTAL_ROWS} quotes** in your pipeline. Select a quote from the list or ask Copilot about rating, underwriting, or submission status.`

const quotesWorkspaceInsights = [
  '12 quotes pending issuance or booking',
  '8 quotes referred to underwriting this week',
  'Average quoted premium: $412,000',
]

const quoteQuickActions = ['Summarize quote', 'Compare versions', 'Send to producer', 'Check rating factors']

function policyListInsights(policy: PolicyListRecord): string[] {
  return [
    `${policy.agency} · Agency #${policy.agencyNumber}`,
    `Underwriter: ${policy.underwriter}`,
    `Effective ${formatQuoteDate(policy.effectiveDate)} – Expires ${formatQuoteDate(policy.expirationDate)}`,
  ]
}

function buildPolicyListSummary(policy: PolicyListRecord) {
  return `**${policy.insuredName}** — Policy **${policy.policyNumber}** with **${policy.agency}** effective **${formatQuoteDate(policy.effectiveDate)}** through **${formatQuoteDate(policy.expirationDate)}**. TWP **${formatQuotePremium(policy.twp)}** · FTP **${formatQuotePremium(policy.ftp)}**.`
}

const policiesListWorkspaceSummary =
  `You are viewing **${POLICIES_TOTAL_ROWS} policies** in your book. Select a policy from the list or ask Copilot about renewals, billing, or endorsements.`

const policiesListWorkspaceInsights = [
  '18 policies renewing in the next 90 days',
  '6 policies with open billing activity',
  'Average TWP: $1.42M across active commercial lines',
]

const policyListQuickActions = ['Renewal summary', 'Billing status', 'Endorsement history', 'Coverage overview']

function taskInsights(task: TaskRecord): string[] {
  if (task.copilotInsights.length > 0) {
    return task.copilotInsights.slice(0, 3)
  }
  return [
    `${task.priority} priority · ${task.displayStatus}`,
    `Assigned to ${task.assignedTo} · ${task.team}`,
    `${task.ageIndicator} · Ref ${task.refNumber}`,
  ]
}

function buildTaskSummary(task: TaskRecord) {
  return `**${task.taskName}** — ${task.priority} priority task for **${task.relatedEntities.insuredName ?? 'related account'}**, due **${task.dueLabel}**. ${task.nextAction}`
}

const tasksWorkspaceSummary =
  `You have **${TASKS_TOTAL_ROWS} open tasks** across your team. **12 are high priority** and **3 are past due**. Focus on finalizing proposals and group underwriting items due this week.`

const tasksWorkspaceInsights = [
  '18 high-priority tasks across quotes and policies',
  '3 tasks past due requiring immediate attention',
  '8 tasks assigned to you due this week',
]

const tasksNextSteps = [
  'Review past-due loss run analysis',
  'Complete finalize proposal for Acme Corp',
  'Reassign suspended inspection follow-up',
]

const taskQuickActions = ['Show high priority', 'Show past due']
const focusedTaskQuickActions = ['Summarize task', 'Reassign', 'Mark complete', 'Ask about ref #']

export function CopilotPanel({
  activePolicyTab = 'overview',
  context = 'policy',
  globalView = null,
  agenticPrompt = null,
  focusedDocument,
  focusedQuote,
  focusedQuoteDetail,
  focusedInsured,
  focusedPolicyList,
  focusedTask,
  seedComposerMessage = null,
  onBackToTaskDetails,
  taskDetailsBackLabel = 'Task details',
  documentsWorkspaceSummary,
  documentsWorkspaceInsights,
  documentsImpactSummary,
  documentsImpactInsights,
  documentsCopilotMode = 'workspace',
  documentsImpactTitle = 'Policy impact',
  documentPreviewMode = false,
  documentExtractedText,
  documentPreviewInsights,
  attachMode = null,
  attachContextLabel,
  onCloseAttach,
  onAttachSave,
  onQuickAction,
  onClose,
}: CopilotPanelProps) {
  const [copilotTab, setCopilotTab] = useState<'chat' | 'history'>('chat')
  const [composerMessage, setComposerMessage] = useState('')
  const [internalAttachMode, setInternalAttachMode] = useState<DocumentAttachMode | null>(null)
  const isDocumentsTab = activePolicyTab === 'documents'
  const isQuotesContext = context === 'quotes'
  const isQuoteDetailContext = context === 'quote-detail'
  const isInsuredContext = context === 'insured'
  const isPoliciesListContext = context === 'policies-list'
  const isTasksContext = context === 'tasks'
  const isGlobalContext = context === 'global'
  const isAgenticView = isGlobalContext && globalView === 'agentic-search' && Boolean(agenticPrompt)
  const isDailySummaryView = isGlobalContext && globalView === 'daily-summary'
  const isTaskRecommendationView = Boolean(focusedTask && seedComposerMessage && onBackToTaskDetails)

  useEffect(() => {
    if (attachMode) return
    if (focusedDocument || focusedQuote || focusedQuoteDetail || focusedInsured || focusedPolicyList || focusedTask) {
      setCopilotTab('chat')
    }
  }, [attachMode, focusedDocument, focusedQuote, focusedQuoteDetail, focusedInsured, focusedPolicyList, focusedTask])

  useEffect(() => {
    if (seedComposerMessage) {
      setComposerMessage(seedComposerMessage)
    }
  }, [seedComposerMessage])

  const activeAttachMode = attachMode ?? internalAttachMode
  const isAttachView = Boolean(activeAttachMode)

  const handleQuickActionClick = (action: string) => {
    const attachTarget = quickActionToAttachTarget(action)
    const documents = activeAttachMode?.documents ?? (focusedDocument ? [focusedDocument] : [])

    if (attachTarget && documents.length > 0) {
      if (attachMode) {
        onQuickAction?.(action)
        return
      }
      setInternalAttachMode({ target: attachTarget, documents })
      return
    }
    onQuickAction?.(action)
  }

  const handleCloseAttach = () => {
    if (attachMode) {
      onCloseAttach?.()
      return
    }
    setInternalAttachMode(null)
  }

  const handleAttachSave = (mode: DocumentAttachMode) => {
    onAttachSave?.(mode)
    handleCloseAttach()
  }

  const documentPreviewQuickActions = [
    'Summarize',
    'Draft Email',
    'Create Note',
    'Explain to Underwriters',
    'Copy key terms',
  ]

  const quickActions = documentPreviewMode && focusedDocument
    ? documentPreviewQuickActions
    : focusedTask
    ? focusedTaskQuickActions
    : focusedPolicyList
      ? policyListQuickActions
      : focusedQuoteDetail
        ? quoteDetailQuickActions
        : focusedInsured
          ? insuredQuickActions
          : focusedQuote
            ? quoteQuickActions
            : isDocumentsTab
              ? ['Summary', 'Add Note', 'Send Email', 'Explanation to Underwriters']
              : isTasksContext
                ? taskQuickActions
                : isQuotesContext
                  ? ['Pipeline summary', 'Quotes needing action', 'Compare premiums']
                  : isInsuredContext
                    ? insuredQuickActions
                    : isQuoteDetailContext
                      ? quoteDetailQuickActions
                      : isPoliciesListContext
                        ? ['Renewals due', 'Billing exceptions', 'Portfolio summary']
                        : ['See endorsements', 'Review documents']

  const isDocumentsImpact = isDocumentsTab && !focusedDocument && documentsCopilotMode === 'impact'

  const summaryTitle = focusedDocument
    ? 'Document summary'
    : isDocumentsImpact
      ? documentsImpactTitle
      : isDocumentsTab
        ? 'Document summary'
        : focusedTask
      ? 'Task summary'
      : focusedPolicyList
        ? 'Policy summary'
        : focusedQuoteDetail
          ? 'Quote summary'
          : focusedInsured
            ? 'Insured summary'
            : focusedQuote
              ? 'Quote summary'
              : isTasksContext
                ? 'Summarize'
                : isQuotesContext
                  ? 'Quotes workspace'
                  : isInsuredContext
                    ? 'Insured summary'
                    : isQuoteDetailContext
                      ? 'Quote summary'
                      : isPoliciesListContext
                        ? 'Policies workspace'
                        : 'Policy summary'

  const summaryText = focusedDocument
    ? buildDocumentSummary(focusedDocument)
    : isDocumentsImpact && documentsImpactSummary
      ? documentsImpactSummary
      : isDocumentsTab && documentsWorkspaceSummary
        ? documentsWorkspaceSummary
        : focusedTask
      ? buildTaskSummary(focusedTask)
      : focusedPolicyList
        ? buildPolicyListSummary(focusedPolicyList)
        : focusedQuoteDetail
          ? buildQuoteDetailSummary(focusedQuoteDetail)
          : focusedInsured
            ? buildInsuredSummary(focusedInsured)
            : focusedQuote
              ? buildQuoteSummary(focusedQuote)
              : isTasksContext
                ? tasksWorkspaceSummary
                : isQuotesContext
                  ? quotesWorkspaceSummary
                  : isInsuredContext && focusedInsured
                    ? buildInsuredSummary(focusedInsured)
                    : isQuoteDetailContext && focusedQuoteDetail
                      ? buildQuoteDetailSummary(focusedQuoteDetail)
                      : isPoliciesListContext
                        ? policiesListWorkspaceSummary
                        : policyDetailsMock.copilotSummary

  const insights = documentPreviewMode && documentPreviewInsights
    ? documentPreviewInsights
    : focusedDocument
    ? documentInsights(focusedDocument)
    : isDocumentsImpact && documentsImpactInsights
      ? documentsImpactInsights
      : isDocumentsTab && documentsWorkspaceInsights
        ? documentsWorkspaceInsights
        : focusedTask
      ? taskInsights(focusedTask)
      : focusedPolicyList
        ? policyListInsights(focusedPolicyList)
        : focusedQuoteDetail
          ? quoteDetailInsights(focusedQuoteDetail)
          : focusedInsured
            ? insuredInsights(focusedInsured)
            : focusedQuote
              ? quoteInsights(focusedQuote)
              : isTasksContext
                ? tasksWorkspaceInsights
                : isQuotesContext
                  ? quotesWorkspaceInsights
                  : isInsuredContext && focusedInsured
                    ? insuredInsights(focusedInsured)
                    : isQuoteDetailContext && focusedQuoteDetail
                      ? quoteDetailInsights(focusedQuoteDetail)
                      : isPoliciesListContext
                        ? policiesListWorkspaceInsights
                        : policyDetailsMock.copilotInsights

  const historyEmptyText = isTasksContext
    ? 'Your Copilot conversations for tasks will appear here.'
    : isQuotesContext || isQuoteDetailContext
      ? 'Your Copilot conversations for quotes will appear here.'
      : isInsuredContext
        ? 'Your Copilot conversations for this insured will appear here.'
        : isPoliciesListContext
          ? 'Your Copilot conversations for policies will appear here.'
          : 'Your Copilot conversations for this policy will appear here.'

  const composerPlaceholder = isTaskRecommendationView
    ? 'Ask a follow-up about this recommendation…'
    : isGlobalContext
    ? 'Select a prompt or ask me anything'
    : focusedTask
      ? 'Ask about this task…'
      : focusedPolicyList
        ? 'Ask about this policy…'
        : focusedQuoteDetail
          ? 'Ask about this quote…'
          : focusedInsured
            ? 'Ask about this insured…'
            : focusedQuote
              ? 'Ask about this quote…'
              : isTasksContext
                ? 'Ask more…'
                : isQuotesContext
                  ? 'Ask about your quotes pipeline…'
                  : isInsuredContext
                    ? 'Ask about this insured account…'
                    : isDocumentsTab
                      ? documentPreviewMode
                        ? 'Ask about this document…'
                        : 'Ask about these documents…'
                    : isQuoteDetailContext
                    ? 'Ask about this quote…'
                      : isPoliciesListContext
                        ? 'Ask about your policies book…'
                        : 'Select a prompt or ask me anything'

  return (
    <Box sx={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', bgcolor: 'background.paper', overflow: 'hidden' }}>
      {isAttachView && activeAttachMode ? (
        <>
          <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
            spacing={1}
            sx={{
              px: 2,
              pt: layoutTokens.policyHeaderTopPadding,
              pb: 1.5,
              bgcolor: 'background.paper',
              borderBottom: 1,
              borderColor: 'divider',
              flexShrink: 0,
            }}
          >
            <Stack direction="row" spacing={0.5} alignItems="flex-start" sx={{ minWidth: 0, flex: 1 }}>
              <IconButton
                size="small"
                onClick={handleCloseAttach}
                aria-label="Back to Copilot"
                sx={{ mt: -0.25, flexShrink: 0 }}
              >
                <ArrowBackIcon fontSize="small" />
              </IconButton>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h5" component="h2" sx={{ lineHeight: 1.35, mb: 0.5 }}>
                  {targetLabels[activeAttachMode.target]}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={bodySx}>
                  {activeAttachMode.documents.length} document{activeAttachMode.documents.length === 1 ? '' : 's'} attached
                </Typography>
              </Box>
            </Stack>
            {onClose && (
              <IconButton size="small" onClick={onClose} aria-label="Close panel" sx={{ mt: -0.25 }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>

          <Box
            sx={{
              px: 2,
              py: 2,
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <DocumentAttachPanelContent
              attachMode={activeAttachMode}
              contextLabel={attachContextLabel}
              onCancel={handleCloseAttach}
              onSave={handleAttachSave}
            />
          </Box>
        </>
      ) : (
        <>
      <Box
        sx={{
          px: 2,
          pt: layoutTokens.policyHeaderTopPadding,
          pb: 0,
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" component="h2">
            Copilot
          </Typography>
          {onClose && (
            <IconButton size="small" onClick={onClose} aria-label="Close Copilot">
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>

        <Tabs
          value={copilotTab}
          onChange={(_, value: 'chat' | 'history') => setCopilotTab(value)}
          sx={{
            minHeight: 36,
            '& .MuiTabs-flexContainer': {
              justifyContent: 'center',
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
              bgcolor: 'primary.main',
            },
            '& .MuiTab-root': {
              minHeight: 36,
              minWidth: 'auto',
              textTransform: 'none',
              fontFamily: figmaFontFamilyStack.heading,
              fontWeight: 500,
              fontSize: '0.875rem',
              color: 'text.secondary',
              px: '30px',
              py: 0.75,
            },
            '& .Mui-selected': {
              color: 'primary.main',
              fontWeight: 600,
            },
          }}
        >
          <Tab label="Chat" value="chat" />
          <Tab label="History" value="history" />
        </Tabs>
      </Box>

      <Box sx={{ px: 2, py: 2, flexGrow: 1, overflowY: 'auto', minHeight: 0 }}>
        {copilotTab === 'history' ? (
          <Stack spacing={1.5} alignItems="center" justifyContent="center" sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="subtitle2" sx={headingSx}>
              No chat history yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={bodySx}>
              {historyEmptyText}
            </Typography>
          </Stack>
        ) : isAgenticView && agenticPrompt ? (
          <AgenticSearchResults prompt={agenticPrompt} />
        ) : isDailySummaryView ? (
          <DailySummaryContent />
        ) : isTaskRecommendationView && focusedTask && seedComposerMessage ? (
          <TaskRecommendationChat
            insight={seedComposerMessage}
            task={focusedTask}
            backLabel={taskDetailsBackLabel}
            onBack={onBackToTaskDetails}
          />
        ) : (
          <>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="subtitle2" sx={{ ...headingSx, color: 'secondary.main', fontSize: '1rem' }}>
                {summaryTitle}
              </Typography>
              <Stack direction="row" spacing={0.25}>
                <IconButton size="small" aria-label="Copy summary">
                  <ContentCopyOutlinedIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" aria-label="Expand summary">
                  <OpenInFullIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>
            {focusedDocument && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ ...bodySx, mb: 0.75 }}>
                {focusedDocument.fileName}
              </Typography>
            )}
            {focusedQuoteDetail && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ ...bodySx, mb: 0.75 }}>
                {focusedQuoteDetail.quoteNumber}
              </Typography>
            )}
            {focusedInsured && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ ...bodySx, mb: 0.75 }}>
                {focusedInsured.name}
              </Typography>
            )}
            {focusedQuote && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ ...bodySx, mb: 0.75 }}>
                {focusedQuote.quoteNumber}
              </Typography>
            )}
            {focusedPolicyList && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ ...bodySx, mb: 0.75 }}>
                {focusedPolicyList.policyNumber}
              </Typography>
            )}
            {focusedTask && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ ...bodySx, mb: 0.75 }}>
                {focusedTask.refNumber}
              </Typography>
            )}
            <Typography variant="body2" sx={{ ...bodySx, lineHeight: 1.6, mb: 2 }}>
              {renderSummaryText(summaryText)}
            </Typography>
            {documentPreviewMode && documentExtractedText && (
              <>
                <Typography variant="subtitle2" sx={{ ...headingSx, mb: 1 }}>
                  Extracted text
                </Typography>
                <Box
                  sx={{
                    mb: 2,
                    px: 1.5,
                    py: 1.25,
                    borderRadius: `${layoutTokens.cardRadius}px`,
                    bgcolor: (theme) => surfaceMuted(theme),
                    maxHeight: 140,
                    overflowY: 'auto',
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ ...bodySx, lineHeight: 1.6, whiteSpace: 'pre-wrap', fontSize: '0.8125rem' }}
                  >
                    {documentExtractedText}
                  </Typography>
                </Box>
              </>
            )}
            <Typography variant="subtitle2" sx={{ ...headingSx, mb: 1 }}>
              {isTasksContext && !focusedTask ? 'At a glance' : 'Key insights'}
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2.5, mb: isTasksContext && !focusedTask ? 2 : 2 }}>
              {insights.map((insight) => (
                <Typography component="li" variant="body2" color="text.secondary" key={insight} sx={{ ...bodySx, mb: 0.5 }}>
                  {insight}
                </Typography>
              ))}
            </Box>

            {isTasksContext && !focusedTask && (
              <>
                <Typography variant="subtitle2" sx={{ ...headingSx, mb: 1 }}>
                  Next steps
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 2.5, mb: 2 }}>
                  {tasksNextSteps.map((step) => (
                    <Typography component="li" variant="body2" color="text.secondary" key={step} sx={{ ...bodySx, mb: 0.5 }}>
                      {step}
                    </Typography>
                  ))}
                </Box>
              </>
            )}

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
                  onClick={() => handleQuickActionClick(action)}
                >
                  {action}
                </Button>
              ))}
            </Stack>
          </>
        )}
      </Box>

      {!isAttachView && (
        <CopilotComposer
          placeholder={composerPlaceholder}
          value={composerMessage}
          onChange={setComposerMessage}
        />
      )}
        </>
      )}
    </Box>
  )
}

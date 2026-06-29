import AddIcon from '@mui/icons-material/Add'
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined'
import CheckIcon from '@mui/icons-material/Check'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import CloseIcon from '@mui/icons-material/Close'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined'
import OpenInFullIcon from '@mui/icons-material/OpenInFull'
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import { Button } from '@/design-system/components'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import type { PolicyTab } from '@/pages/policies/components/PolicyTabs'
import type { PolicyDocument } from '@/pages/policies/data/mockDocuments'
import { policyDetailsMock } from '@/pages/policies/data/mockPolicyDetails'
import type { PolicyListRecord } from '@/pages/policies/data/mockPoliciesList'
import { POLICIES_TOTAL_ROWS } from '@/pages/policies/data/mockPoliciesList'
import type { Quote } from '@/pages/quotes/data/mockQuotes'
import { QUOTES_TOTAL_ROWS } from '@/pages/quotes/data/mockQuotes'

type CopilotPanelProps = {
  activePolicyTab?: PolicyTab
  context?: 'policy' | 'quotes' | 'policies-list'
  focusedDocument?: PolicyDocument | null
  focusedQuote?: Quote | null
  focusedPolicyList?: PolicyListRecord | null
  onClose?: () => void
}

type CopilotMode = 'fast' | 'thinking'

const headingSx = {
  fontFamily: figmaFontFamilyStack.heading,
  fontWeight: 600,
} as const

const subtitleSx = {
  fontFamily: figmaFontFamilyStack.heading,
  fontWeight: 500,
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
  bgcolor: (theme: { figmaPalette: { blue: Record<number, string> } }) => theme.figmaPalette.blue[50],
  px: 1.25,
  py: 0.5,
  minHeight: 'auto',
  '&:hover': {
    bgcolor: (theme: { figmaPalette: { blue: Record<number, string> } }) => theme.figmaPalette.blue[100],
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

const modeOptions = [
  {
    value: 'fast' as const,
    label: 'Fast',
    description: 'Quick answers for simple tasks',
    icon: BoltOutlinedIcon,
  },
  {
    value: 'thinking' as const,
    label: 'Thinking',
    description: 'More reasoning for complex tasks',
    icon: PsychologyOutlinedIcon,
  },
]

function ModePopover({
  mode,
  onChange,
}: {
  mode: CopilotMode
  onChange: (mode: CopilotMode) => void
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)
  const activeOption = modeOptions.find((option) => option.value === mode) ?? modeOptions[0]
  const ActiveIcon = activeOption.icon

  return (
    <>
      <Box
        component="button"
        type="button"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        sx={{
          border: 0,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          px: 0.75,
          py: 0.5,
          borderRadius: 1,
          bgcolor: 'transparent',
          color: 'text.primary',
          fontFamily: figmaFontFamilyStack.heading,
          fontWeight: 500,
          fontSize: '0.8125rem',
          lineHeight: 1.2,
          '&:hover': {
            bgcolor: (theme) => theme.figmaPalette.grey[100],
          },
        }}
      >
        <ActiveIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
        {activeOption.label}
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: (theme) => ({
              width: 280,
              borderRadius: `${layoutTokens.cardRadius}px`,
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
              mt: -1,
              overflow: 'hidden',
            }),
          },
        }}
      >
        <Stack divider={<Divider />}>
          <Stack sx={{ py: 0.5 }}>
            {modeOptions.map((option) => {
              const Icon = option.icon
              const selected = mode === option.value
              return (
                <Box
                  key={option.value}
                  component="button"
                  type="button"
                  onClick={() => {
                    onChange(option.value)
                    setAnchorEl(null)
                  }}
                  sx={{
                    border: 0,
                    width: '100%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.25,
                    px: 1.5,
                    py: 1.25,
                    bgcolor: 'background.paper',
                    textAlign: 'left',
                    '&:hover': {
                      bgcolor: (theme) => theme.figmaPalette.grey[50],
                    },
                  }}
                >
                  <Icon sx={{ fontSize: 20, color: 'text.secondary', mt: 0.125 }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ ...headingSx, fontSize: '0.875rem' }}>
                      {option.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ ...bodySx, display: 'block', mt: 0.25 }}>
                      {option.description}
                    </Typography>
                  </Box>
                  {selected && <CheckIcon sx={{ fontSize: 18, color: 'success.main', mt: 0.25 }} />}
                </Box>
              )
            })}
          </Stack>

          <Box
            component="button"
            type="button"
            sx={{
              border: 0,
              width: '100%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 1.5,
              py: 1.25,
              bgcolor: 'background.paper',
              textAlign: 'left',
              '&:hover': {
                bgcolor: (theme) => theme.figmaPalette.grey[50],
              },
            }}
          >
            <Typography variant="body2" sx={{ ...headingSx, fontSize: '0.875rem' }}>
              Model
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <SettingsOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" sx={{ ...subtitleSx, fontSize: '0.8125rem', color: 'text.secondary' }}>
                Auto
              </Typography>
              <ChevronRightIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
            </Stack>
          </Box>
        </Stack>
      </Popover>
    </>
  )
}

function CopilotComposer({ placeholder }: { placeholder: string }) {
  const [mode, setMode] = useState<CopilotMode>('fast')
  const [message, setMessage] = useState('')
  const canSubmit = message.trim().length > 0

  return (
    <Box sx={{ px: 2, py: 2 }}>
      <Box
        sx={(theme) => ({
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: `${layoutTokens.cardRadius}px`,
          bgcolor: 'background.paper',
          boxShadow: layoutTokens.cardShadow,
          overflow: 'hidden',
          '&:focus-within': {
            borderColor: 'primary.main',
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: 0,
          },
        })}
      >
        <TextField
          fullWidth
          multiline
          minRows={2}
          maxRows={5}
          variant="standard"
          placeholder={placeholder}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          slotProps={{
            input: {
              disableUnderline: true,
              sx: {
                ...bodySx,
                fontSize: '0.875rem',
                px: 1.75,
                pt: 1.25,
                pb: 1,
                '&.Mui-focused': {
                  outline: 'none',
                },
              },
            },
          }}
        />

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            px: 1,
            py: 0.75,
            bgcolor: 'background.paper',
            gap: 1,
          }}
        >
          <Stack direction="row" spacing={0.25} alignItems="center">
            <IconButton size="small" aria-label="Add attachment">
              <AddIcon sx={{ fontSize: 20 }} />
            </IconButton>
            <ModePopover mode={mode} onChange={setMode} />
          </Stack>

          <Stack direction="row" spacing={0.25} alignItems="center">
            <IconButton size="small" aria-label="Voice input">
              <MicNoneOutlinedIcon sx={{ fontSize: 20 }} />
            </IconButton>
            <IconButton
              size="small"
              aria-label="Send message"
              disabled={!canSubmit}
              sx={(theme) => ({
                width: 34,
                height: 34,
                bgcolor: canSubmit ? theme.figmaPalette.blue[50] : theme.figmaPalette.grey[100],
                color: canSubmit ? 'primary.main' : theme.figmaPalette.grey[400],
                '&:hover': {
                  bgcolor: canSubmit ? theme.figmaPalette.blue[100] : theme.figmaPalette.grey[100],
                },
                '&.Mui-disabled': {
                  bgcolor: theme.figmaPalette.grey[100],
                  color: theme.figmaPalette.grey[400],
                },
              })}
            >
              <KeyboardArrowUpIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Stack>
        </Stack>
      </Box>

      <Typography
        variant="caption"
        color="text.disabled"
        sx={{ ...bodySx, mt: 1, display: 'block', textAlign: 'center' }}
      >
        Copilot uses AI. Check for mistakes. Terms &amp; conditions.
      </Typography>
    </Box>
  )
}

export function CopilotPanel({
  activePolicyTab = 'overview',
  context = 'policy',
  focusedDocument,
  focusedQuote,
  focusedPolicyList,
  onClose,
}: CopilotPanelProps) {
  const [copilotTab, setCopilotTab] = useState<'chat' | 'history'>('chat')
  const isDocumentsTab = activePolicyTab === 'documents'
  const isQuotesContext = context === 'quotes'
  const isPoliciesListContext = context === 'policies-list'

  useEffect(() => {
    if (focusedDocument || focusedQuote || focusedPolicyList) {
      setCopilotTab('chat')
    }
  }, [focusedDocument, focusedQuote, focusedPolicyList])

  const quickActions = focusedPolicyList
    ? policyListQuickActions
    : focusedQuote
      ? quoteQuickActions
      : isDocumentsTab
        ? ['Summary', 'Add Note', 'Send Email', 'Explanation to Underwriters']
        : isQuotesContext
          ? ['Pipeline summary', 'Quotes needing action', 'Compare premiums']
          : isPoliciesListContext
            ? ['Renewals due', 'Billing exceptions', 'Portfolio summary']
            : ['See endorsements', 'Review documents']

  const summaryTitle = focusedDocument
    ? 'Document summary'
    : focusedPolicyList
      ? 'Policy summary'
      : focusedQuote
        ? 'Quote summary'
        : isQuotesContext
          ? 'Quotes workspace'
          : isPoliciesListContext
            ? 'Policies workspace'
            : 'Policy summary'

  const summaryText = focusedDocument
    ? buildDocumentSummary(focusedDocument)
    : focusedPolicyList
      ? buildPolicyListSummary(focusedPolicyList)
      : focusedQuote
        ? buildQuoteSummary(focusedQuote)
        : isQuotesContext
          ? quotesWorkspaceSummary
          : isPoliciesListContext
            ? policiesListWorkspaceSummary
            : policyDetailsMock.copilotSummary

  const insights = focusedDocument
    ? documentInsights(focusedDocument)
    : focusedPolicyList
      ? policyListInsights(focusedPolicyList)
      : focusedQuote
        ? quoteInsights(focusedQuote)
        : isQuotesContext
          ? quotesWorkspaceInsights
          : isPoliciesListContext
            ? policiesListWorkspaceInsights
            : policyDetailsMock.copilotInsights

  const historyEmptyText = isQuotesContext
    ? 'Your Copilot conversations for quotes will appear here.'
    : isPoliciesListContext
      ? 'Your Copilot conversations for policies will appear here.'
      : 'Your Copilot conversations for this policy will appear here.'

  const composerPlaceholder = focusedPolicyList
    ? 'Ask about this policy…'
    : focusedQuote
      ? 'Ask about this quote…'
      : isQuotesContext
        ? 'Ask about your quotes pipeline…'
        : isPoliciesListContext
          ? 'Ask about your policies book…'
          : 'Select a prompt or ask me anything'

  return (
    <Box sx={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', bgcolor: 'background.paper', overflow: 'hidden' }}>
      <Box
        sx={{
          px: 2,
          pt: layoutTokens.policyHeaderTopPadding,
          pb: 0,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle1" sx={{ ...headingSx, fontSize: '0.9375rem' }}>
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

      <Box sx={{ px: 2, py: 2, flexGrow: 1, overflowY: 'auto' }}>
        {copilotTab === 'history' ? (
          <Stack spacing={1.5} alignItems="center" justifyContent="center" sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="subtitle2" sx={headingSx}>
              No chat history yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={bodySx}>
              {historyEmptyText}
            </Typography>
          </Stack>
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
            <Typography variant="body2" sx={{ ...bodySx, lineHeight: 1.6, mb: 2 }}>
              {renderSummaryText(summaryText)}
            </Typography>
            <Typography variant="subtitle2" sx={{ ...headingSx, mb: 1 }}>
              Key insights
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2.5, mb: 2 }}>
              {insights.map((insight) => (
                <Typography component="li" variant="body2" color="text.secondary" key={insight} sx={{ ...bodySx, mb: 0.5 }}>
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
                <Button key={action} size="small" variant="text" disableRipple sx={quickActionChipSx}>
                  {action}
                </Button>
              ))}
            </Stack>
          </>
        )}
      </Box>

      <CopilotComposer placeholder={composerPlaceholder} />
    </Box>
  )
}

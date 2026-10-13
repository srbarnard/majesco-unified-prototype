import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import type { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { useEffect, useState, type ReactNode } from 'react'
import { Button } from '@/design-system/components'
import { getFigmaColors } from '@/design-system/tokens/figma-colors'
import { draftBodySx } from '@/pages/shared/components/DraftDrawer'
import { filterFooterButtonSx } from '@/design-system/components/ListFilterPanel/filterPanelPrimitives'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { surfaceMuted } from '@/design-system/theme/themeSurfaces'
import {
  getDocumentCopilotExcerpt,
  getDocumentPreviewContent,
} from '@/pages/policies/data/documentPreviewData'
import type { PolicyDocument } from '@/pages/policies/data/mockDocuments'
import {
  formatDocumentFileSize,
  getDocumentFileSizeBytes,
} from '@/pages/policies/data/mockDocuments'
import { TaskDetailAccordion } from '@/pages/tasks/components/TaskDetailSection'
import { QuoteWizardFormField } from '@/pages/quotes/components/wizard/QuoteWizardFormField'
import type { EmailRecipient } from '@/pages/shared/data/emailRecipients'

const contentPaddingX = `${layoutTokens.contentPaddingX}px`

const textActionSx = (theme: Theme) => ({
  ...draftBodySx,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.5,
  px: 1,
  py: 0.5,
  borderRadius: 1.5,
  transition: 'background-color 0.15s ease, color 0.15s ease',
  '&:hover': {
    bgcolor: getFigmaColors(theme.palette.mode).primary.hover,
    color: 'primary.main',
  },
})

export type DocumentAttachTarget = 'note' | 'email' | 'task' | 'submission'

export type DocumentAttachMode = {
  target: DocumentAttachTarget
  documents: PolicyDocument[]
  /** Optional draft fields when opening Email/Notes from a page (producer follow-up, quote package). */
  draft?: {
    to?: string
    subject?: string
    body?: string
    saveLabel?: string
    /** Overrides the Email tool panel heading (e.g. “Email quote”). */
    title?: string
    subtitle?: string
  }
  /** When true, fields are locked and footer shows Close only (sent email review). */
  readOnly?: boolean
  /** Likely recipients, offered as one-tap fills under To. */
  recipients?: EmailRecipient[]
  /** Where Email was opened from; after Send the confirmation offers the way back. */
  returnTo?: { label: string; onReturn: () => void }
  onSave?: (sent?: DocumentAttachSentFields) => void
  onCancel?: () => void
}

/** What the user actually sent — fields may differ from the draft they were given. */
export type DocumentAttachSentFields = {
  to: string
  subject: string
  body: string
}

export const targetLabels: Record<DocumentAttachTarget, string> = {
  note: 'Create Note',
  email: 'Draft Email',
  task: 'Create Task',
  submission: 'Attach to Submission',
}

export const documentViewerAttachLabels: Partial<Record<DocumentAttachTarget, string>> = {
  note: 'Add Note',
  email: 'Email',
}

export const documentAttachMenuItems: { target: DocumentAttachTarget; label: string }[] = [
  { target: 'note', label: 'Note' },
  { target: 'email', label: 'Email' },
  { target: 'task', label: 'Task' },
  { target: 'submission', label: 'Submission' },
]

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

export function defaultAttachSubject(
  target: DocumentAttachTarget,
  documents: PolicyDocument[],
  contextLabel?: string,
) {
  const primary = documents[0]
  if (!primary) return ''

  if (target === 'email') {
    return `Re: ${primary.name}${contextLabel ? ` — ${contextLabel}` : ''}`
  }
  if (target === 'task') {
    return `Review ${primary.name}`
  }
  if (target === 'note') {
    return `Note on ${primary.name}`
  }
  return `Submission attachment — ${primary.name}`
}

export function defaultAttachBody(target: DocumentAttachTarget, documents: PolicyDocument[]) {
  const primary = documents[0]
  if (!primary) return ''

  const preview = getDocumentPreviewContent(primary)
  const excerpt = getDocumentCopilotExcerpt(primary, target === 'email' ? 16 : 10)

  if (target === 'email') {
    return `Hi,

The assistant converted ${primary.fileName} into the message below. Please review and send to your client.

---
${excerpt}
---

${preview.keyInsights[0] ?? primary.aiSummary}

Let me know if you have any questions.

Best regards`
  }

  if (target === 'note') {
    return `Document: ${primary.fileName}

Assistant summary:
${preview.keyInsights.map((insight) => `• ${insight}`).join('\n')}

Extracted text:
${excerpt}

Follow-up:
${primary.aiSummary}`
  }

  if (target === 'task') {
    return `Review the attached document and confirm underwriting impact.\n\n${primary.aiSummary}`
  }

  const attachmentLine =
    documents.length === 1
      ? `Attached: ${primary.fileName}`
      : `Attached (${documents.length}): ${documents.map((doc) => doc.fileName).join(', ')}`

  return `${attachmentLine}\n\nInclude in submission package for underwriting review.`
}

export function quickActionToAttachTarget(action: string): DocumentAttachTarget | null {
  if (action === 'Draft Email' || action === 'Send Email' || action === 'Attach to Email') return 'email'
  if (action === 'Create Note' || action === 'Add Note') return 'note'
  if (action === 'Create Task') return 'task'
  if (action === 'Attach to Submission' || action === 'Submission') return 'submission'
  return null
}

export function getAttachPanelSubtitle(attachMode: DocumentAttachMode): string {
  const { target, documents } = attachMode
  const primary = documents[0]

  if (target === 'email' && primary) {
    return `${formatDocumentFileSize(getDocumentFileSizeBytes(primary))} attachment`
  }

  return `${documents.length} document${documents.length === 1 ? '' : 's'} attached`
}

function documentKindLabel(fileName: string) {
  const ext = fileName.split('.').pop()?.toUpperCase()
  return ext ?? 'FILE'
}

const attachedDocumentChipSx = {
  maxWidth: '100%',
  fontFamily: figmaFontFamilyStack.body,
  fontSize: '0.75rem',
  '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' },
} as const

export function AttachedDocumentChips({
  documents,
  placement = 'above',
}: {
  documents: PolicyDocument[]
  placement?: 'above' | 'below'
}) {
  if (documents.length === 0) return null

  return (
    <Stack
      direction="row"
      flexWrap="wrap"
      gap={0.75}
      sx={placement === 'below' ? { mt: 1.25 } : { mb: 1.25 }}
    >
      {documents.map((doc) => (
        <Chip
          key={doc.id}
          size="small"
          label={`${documentKindLabel(doc.fileName)} · ${doc.fileName}`}
          sx={attachedDocumentChipSx}
        />
      ))}
    </Stack>
  )
}

type DocumentAttachPanelContentProps = {
  attachMode: DocumentAttachMode
  contextLabel?: string
  /** Optional overrides — used for producer follow-ups without attached documents. */
  initialTo?: string
  initialSubject?: string
  initialBody?: string
  /** Override primary footer label (default: Send / Save Note / Create Task). */
  saveLabel?: string
  readOnly?: boolean
  recipients?: EmailRecipient[]
  /** Scrolls with the fields, above them (e.g. Email's intro). */
  header?: ReactNode
  /** Email only: below Send (e.g. suggested actions). */
  afterFields?: ReactNode
  onCancel?: () => void
  onSave?: (attachMode: DocumentAttachMode, sent: DocumentAttachSentFields) => void
}

export function DocumentAttachPanelContent({
  attachMode,
  contextLabel,
  initialTo,
  initialSubject,
  initialBody,
  saveLabel: saveLabelProp,
  readOnly = false,
  recipients = [],
  header,
  afterFields,
  onCancel,
  onSave,
}: DocumentAttachPanelContentProps) {
  const { target, documents } = attachMode
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  useEffect(() => {
    setTo(initialTo ?? '')
    setSubject(initialSubject ?? defaultAttachSubject(target, documents, contextLabel))
    setBody(initialBody ?? defaultAttachBody(target, documents))
  }, [target, documents, contextLabel, initialTo, initialSubject, initialBody])

  const locked = readOnly || Boolean(attachMode.readOnly)

  // Notes use NotesWorkspacePanel — never render subject/textarea here.
  if (target === 'note') return null

  const saveLabel =
    saveLabelProp ??
    (target === 'email' ? 'Send' : target === 'task' ? 'Create Task' : 'Attach')
  const bodySectionTitle =
    target === 'email' ? 'Email message' : target === 'task' ? 'Description' : 'Notes'
  const subjectSectionTitle = target === 'task' ? 'Task name' : 'Subject'
  const bodyFieldLabel =
    target === 'email' ? 'Message' : target === 'task' ? 'Description' : 'Notes'

  return (
    <>
      <Stack
        spacing={target === 'email' ? 2 : 0}
        sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pb: target === 'email' ? 2 : 0 }}
      >
        {header}
        {target === 'email' ? (
          <>
            <QuoteWizardFormField
              label="To"
              value={to}
              onChange={setTo}
              placeholder="Enter recipient email"
              helperText={locked ? undefined : 'Who should receive this email?'}
              fullWidth
              disabled={locked}
            />
            {!locked && recipients.length > 0 ? (
              <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: -1 }} aria-label="Suggested recipients">
                {recipients.map((recipient) => (
                  <Chip
                    key={recipient.email}
                    size="small"
                    variant={to === recipient.email ? 'filled' : 'outlined'}
                    label={`${recipient.role} · ${recipient.name}`}
                    onClick={() => setTo(recipient.email)}
                    sx={attachedDocumentChipSx}
                  />
                ))}
              </Stack>
            ) : null}
            <QuoteWizardFormField
              label="Subject"
              value={subject}
              onChange={setSubject}
              fullWidth
              aiFilled
              disabled={locked}
            />
            <Box>
              <QuoteWizardFormField
                label="Message"
                value={body}
                onChange={setBody}
                multiline
                minRows={8}
                fullWidth
                aiFilled
                disabled={locked}
              />
              <AttachedDocumentChips documents={documents} placement="below" />
            </Box>
            {locked ? (
              <Box>
                <Button size="small" variant="contained" color="primary" onClick={onCancel}>
                  Close
                </Button>
              </Box>
            ) : (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  disabled={!to.trim() || !subject.trim()}
                  onClick={() => onSave?.(attachMode, { to, subject, body })}
                >
                  {saveLabel}
                </Button>
                <Link component="button" type="button" underline="none" color="text.primary" onClick={onCancel} sx={textActionSx}>
                  <CancelOutlinedIcon sx={{ fontSize: 16 }} />
                  Cancel
                </Link>
              </Stack>
            )}
            {afterFields}
          </>
        ) : (
          <>
            {target === 'task' && (
              <TaskDetailAccordion title={subjectSectionTitle} defaultExpanded>
                <QuoteWizardFormField
                  label={subjectSectionTitle}
                  value={subject}
                  onChange={setSubject}
                  fullWidth
                  aiFilled
                  disabled={locked}
                />
              </TaskDetailAccordion>
            )}

            <TaskDetailAccordion title={bodySectionTitle} defaultExpanded>
              <AttachedDocumentChips documents={documents} />
              <QuoteWizardFormField
                label={bodyFieldLabel}
                value={body}
                onChange={setBody}
                multiline
                minRows={target === 'submission' ? 4 : 8}
                fullWidth
                aiFilled
                disabled={locked}
              />
            </TaskDetailAccordion>

            {target === 'submission' && (
              <Box
                sx={{
                  px: 1.5,
                  py: 1.25,
                  borderRadius: `${layoutTokens.cardRadius}px`,
                  bgcolor: (theme) => surfaceMuted(theme),
                  mt: 1.5,
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={bodySx}>
                  Documents will be linked to the active submission package for underwriting review.
                </Typography>
              </Box>
            )}
          </>
        )}
      </Stack>

      {target === 'email' ? null : (
        <Stack
          spacing={1}
          sx={{
            pt: 2,
            flexShrink: 0,
            bgcolor: 'background.paper',
            mx: `calc(-1 * ${contentPaddingX})`,
            px: contentPaddingX,
            pb: 0,
            mt: 'auto',
          }}
        >
          {locked ? (
            <Button variant="contained" color="primary" fullWidth onClick={onCancel} sx={{ ...filterFooterButtonSx, fontWeight: 600 }}>
              Close
            </Button>
          ) : (
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" color="primary" fullWidth onClick={onCancel} sx={filterFooterButtonSx}>
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => onSave?.(attachMode, { to, subject, body })}
                sx={{ ...filterFooterButtonSx, fontWeight: 600 }}
              >
                {saveLabel}
              </Button>
            </Stack>
          )}
        </Stack>
      )}
    </>
  )
}

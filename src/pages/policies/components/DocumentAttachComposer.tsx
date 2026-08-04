import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import { Button } from '@/design-system/components'
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

const contentPaddingX = `${layoutTokens.contentPaddingX}px`

export type DocumentAttachTarget = 'note' | 'email' | 'task' | 'submission'

export type DocumentAttachMode = {
  target: DocumentAttachTarget
  documents: PolicyDocument[]
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

Copilot converted ${primary.fileName} into the message below. Please review and send to your client.

---
${excerpt}
---

${preview.keyInsights[0] ?? primary.aiSummary}

Let me know if you have any questions.

Best regards`
  }

  if (target === 'note') {
    return `Document: ${primary.fileName}

Copilot extracted summary:
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

function AttachedDocumentChips({
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
  onCancel?: () => void
  onSave?: (attachMode: DocumentAttachMode) => void
}

export function DocumentAttachPanelContent({
  attachMode,
  contextLabel,
  initialTo,
  initialSubject,
  initialBody,
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

  const saveLabel = target === 'email' ? 'Send' : target === 'task' ? 'Create Task' : 'Save Note'
  const bodySectionTitle =
    target === 'email' ? 'Email message' : target === 'task' ? 'Description' : target === 'note' ? 'Note' : 'Notes'
  const subjectSectionTitle = target === 'task' ? 'Task name' : 'Subject'
  const bodyFieldLabel =
    target === 'email' ? 'Message' : target === 'task' ? 'Description' : target === 'note' ? 'Note' : 'Notes'

  return (
    <>
      <Stack spacing={target === 'email' ? 2 : 0} sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {target === 'email' ? (
          <>
            <QuoteWizardFormField
              label="To"
              value={to}
              onChange={setTo}
              placeholder="Enter recipient email"
              helperText="Who should receive this email?"
              fullWidth
            />
            <QuoteWizardFormField
              label="Subject"
              value={subject}
              onChange={setSubject}
              fullWidth
              aiFilled
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
              />
              <AttachedDocumentChips documents={documents} placement="below" />
            </Box>
          </>
        ) : (
          <>
            {(target === 'note' || target === 'task') && (
              <TaskDetailAccordion title={subjectSectionTitle} defaultExpanded>
                <QuoteWizardFormField
                  label={subjectSectionTitle}
                  value={subject}
                  onChange={setSubject}
                  fullWidth
                  aiFilled
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
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="inherit" fullWidth onClick={onCancel} sx={filterFooterButtonSx}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => onSave?.(attachMode)}
            sx={{ ...filterFooterButtonSx, fontWeight: 600 }}
          >
            {saveLabel}
          </Button>
        </Stack>
      </Stack>
    </>
  )
}

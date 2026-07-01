import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import { Button, Chip } from '@/design-system/components'
import { filterFooterButtonSx } from '@/design-system/components/ListFilterPanel/filterPanelPrimitives'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { surfaceMuted } from '@/design-system/theme/themeSurfaces'
import {
  TaskDetailSection,
  TaskDetailText,
} from '@/pages/tasks/components/TaskDetailSection'
import type { PolicyDocument } from '@/pages/policies/data/mockDocuments'

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

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    ...bodySx,
    fontSize: '0.875rem',
  },
  '& .MuiInputLabel-root': {
    ...bodySx,
    fontSize: '0.875rem',
  },
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

  const attachmentLine =
    documents.length === 1
      ? `Attached: ${primary.fileName}`
      : `Attached (${documents.length}): ${documents.map((doc) => doc.fileName).join(', ')}`

  if (target === 'email') {
    return `${attachmentLine}\n\n${primary.aiSummary}\n\n`
  }
  if (target === 'note') {
    return `${attachmentLine}\n\n${primary.aiSummary}`
  }
  if (target === 'task') {
    return `Review the attached document and confirm underwriting impact.\n\n${primary.aiSummary}`
  }
  return `${attachmentLine}\n\nInclude in submission package for underwriting review.`
}

export function quickActionToAttachTarget(action: string): DocumentAttachTarget | null {
  if (action === 'Draft Email' || action === 'Send Email') return 'email'
  if (action === 'Create Note' || action === 'Add Note') return 'note'
  if (action === 'Create Task') return 'task'
  if (action === 'Attach to Submission' || action === 'Submission') return 'submission'
  return null
}

type DocumentAttachPanelContentProps = {
  attachMode: DocumentAttachMode
  contextLabel?: string
  onCancel?: () => void
  onSave?: (attachMode: DocumentAttachMode) => void
}

export function DocumentAttachPanelContent({
  attachMode,
  contextLabel,
  onCancel,
  onSave,
}: DocumentAttachPanelContentProps) {
  const { target, documents } = attachMode
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  useEffect(() => {
    setTo('')
    setSubject(defaultAttachSubject(target, documents, contextLabel))
    setBody(defaultAttachBody(target, documents))
  }, [target, documents, contextLabel])

  const saveLabel = target === 'email' ? 'Send' : target === 'task' ? 'Create Task' : 'Save'

  return (
    <>
      <Stack spacing={2} sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <TaskDetailSection title="Attached documents" card>
          <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mb: documents.length === 1 ? 1 : 0 }}>
            {documents.map((doc) => (
              <Chip
                key={doc.id}
                size="small"
                icon={<AttachFileOutlinedIcon sx={{ fontSize: '14px !important' }} />}
                label={doc.fileName}
                variant="outlined"
              />
            ))}
          </Stack>
          {documents.length === 1 && <TaskDetailText>{documents[0].aiSummary}</TaskDetailText>}
        </TaskDetailSection>

        {target === 'email' && (
          <TaskDetailSection title="Recipient" card>
            <TextField
              fullWidth
              size="small"
              label="To"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              placeholder="recipient@example.com"
              sx={fieldSx}
            />
          </TaskDetailSection>
        )}

        {(target === 'email' || target === 'note' || target === 'task') && (
          <TaskDetailSection title={target === 'task' ? 'Task name' : 'Subject'} card>
            <TextField
              fullWidth
              size="small"
              label={target === 'task' ? 'Task name' : 'Subject'}
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              sx={fieldSx}
            />
          </TaskDetailSection>
        )}

        <TaskDetailSection
          title={target === 'task' ? 'Description' : target === 'submission' ? 'Notes' : 'Body'}
          card
        >
          <TextField
            fullWidth
            multiline
            minRows={target === 'submission' ? 4 : 6}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            sx={fieldSx}
          />
        </TaskDetailSection>

        {target === 'submission' && (
          <Box
            sx={{
              px: 1.5,
              py: 1.25,
              borderRadius: `${layoutTokens.cardRadius}px`,
              bgcolor: (theme) => surfaceMuted(theme),
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={bodySx}>
              Documents will be linked to the active submission package for underwriting review.
            </Typography>
          </Box>
        )}
      </Stack>

      <Stack
        spacing={1}
        sx={{
          pt: 2,
          flexShrink: 0,
          bgcolor: 'background.paper',
          mx: -2,
          px: 2,
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

import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { CopilotQuickActions } from '@/design-system/components'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import {
  copilotSectionHeadingSx,
  copilotSubtitleSx,
} from '@/pages/policies/components/copilot/copilotDrawerStyles'
import {
  detectNoteTemplate,
  noteTemplates,
  type NoteTemplate,
} from '@/pages/submissions/data/mockSubmissionNotes'
import type { SubmissionListRecord } from '@/pages/submissions/data/mockSubmissions'

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

function submissionOptionLabel(submission: SubmissionListRecord) {
  return `${submission.submissionNumber} · ${submission.insuredName}`
}

type NotesNewViewProps = {
  submission: SubmissionListRecord | null
  submissions?: SubmissionListRecord[]
  draft: string
  activeTemplate: NoteTemplate | null
  onSelectTemplate: (template: NoteTemplate) => void
  onSelectSubmission?: (submission: SubmissionListRecord | null) => void
}

export function NotesNewView({
  submission,
  submissions = [],
  draft,
  activeTemplate,
  onSelectTemplate,
  onSelectSubmission,
}: NotesNewViewProps) {
  const detected = detectNoteTemplate(draft)
  const suggested = activeTemplate ?? detected

  const summary = activeTemplate
    ? activeTemplate.summary
    : detected
      ? `This reads like a **${detected.label}** note. Apply the format to structure what you typed, or choose a different template.`
      : `Describe what’s happening and I’ll help structure it. Choose a template before you type, or start writing and apply a format when the note is recognized.`

  const insightHeading = activeTemplate ? 'Template fields' : suggested ? 'Suggested structure' : 'Templates help you capture'

  const insights = (suggested ?? noteTemplates[0]).fields

  const actions = suggested
    ? [
        suggested.applyLabel,
        ...noteTemplates.filter((template) => template.id !== suggested.id).map((template) => template.label),
      ]
    : noteTemplates.map((template) => template.label)

  const handleAction = (action: string) => {
    const fromApply = noteTemplates.find((template) => template.applyLabel === action)
    const fromLabel = noteTemplates.find((template) => template.label === action)
    const next = fromApply ?? fromLabel
    if (next) onSelectTemplate(next)
  }

  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="subtitle2" sx={copilotSubtitleSx}>
          New note
        </Typography>
      </Stack>

      {onSelectSubmission ? (
        <Autocomplete
          options={submissions}
          value={submission}
          onChange={(_, next) => onSelectSubmission(next)}
          getOptionLabel={submissionOptionLabel}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderOption={(props, option) => (
            <li {...props} key={option.id}>
              <Typography variant="body2" noWrap sx={bodySx}>
                {submissionOptionLabel(option)}
              </Typography>
            </li>
          )}
          renderInput={(params) => (
            <TextField {...params} placeholder="Apply to submission" size="small" />
          )}
          sx={{ mb: submission ? 1.5 : 0.75 }}
        />
      ) : submission ? (
        <Typography variant="caption" color="text.secondary" display="block" sx={{ ...bodySx, mb: 0.75 }}>
          {submission.submissionNumber} · {submission.insuredName}
        </Typography>
      ) : null}

      {!submission && onSelectSubmission ? (
        <Typography variant="caption" color="text.secondary" display="block" sx={{ ...bodySx, mb: 1.5 }}>
          Choose a submission to apply this note.
        </Typography>
      ) : null}

      <Typography variant="body2" sx={{ ...bodySx, lineHeight: 1.6, mb: 2 }}>
        {summary.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
          part.startsWith('**') && part.endsWith('**') ? (
            <Box component="strong" key={index} sx={{ fontWeight: 700 }}>
              {part.slice(2, -2)}
            </Box>
          ) : (
            part
          ),
        )}
      </Typography>

      <Typography variant="body2" sx={{ ...copilotSectionHeadingSx, mb: 1 }}>
        {insightHeading}
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
      <CopilotQuickActions actions={actions} onAction={handleAction} />
    </>
  )
}

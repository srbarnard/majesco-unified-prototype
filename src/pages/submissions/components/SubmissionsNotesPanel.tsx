import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { surfaceMuted } from '@/design-system/theme/themeSurfaces'
import type { SubmissionListRecord } from '@/pages/submissions/data/mockSubmissions'

type SubmissionsNotesPanelProps = {
  focusedSubmission?: SubmissionListRecord | null
  onClose?: () => void
}

export function SubmissionsNotesPanel({ focusedSubmission, onClose }: SubmissionsNotesPanelProps) {
  const notes = focusedSubmission?.notes?.length
    ? focusedSubmission.notes
    : ['No notes yet. Add context while reviewing submissions in Copilot.']

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
          pb: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography
            variant="subtitle1"
            component="h2"
            sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600 }}
          >
            Notes
          </Typography>
          {onClose && (
            <IconButton size="small" onClick={onClose} aria-label="Close Notes">
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
        {focusedSubmission && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5, fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem' }}
          >
            {focusedSubmission.submissionNumber} · {focusedSubmission.insuredName}
          </Typography>
        )}
      </Box>

      <Box sx={{ px: 2, py: 2, flexGrow: 1, overflowY: 'auto' }}>
        <Stack spacing={1.25}>
          {notes.map((note) => (
            <Box
              key={note}
              sx={(theme) => ({
                px: 1.5,
                py: 1.25,
                borderRadius: `${layoutTokens.cardRadius}px`,
                bgcolor: surfaceMuted(theme),
              })}
            >
              <Typography
                variant="body2"
                sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem', lineHeight: 1.5 }}
              >
                {note}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  )
}

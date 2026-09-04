import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRightTool } from '@/app/contexts/RightToolContext'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import {
  DocumentAttachPanelContent,
  documentViewerAttachLabels,
  type DocumentAttachMode,
} from '@/pages/policies/components/DocumentAttachComposer'
import { copilotDrawerHeadingSx } from '@/pages/policies/components/copilot/copilotDrawerStyles'

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

const noteAttachMode: DocumentAttachMode = { target: 'note', documents: [] }

/** Notes tool — same Create Note / Add Note composer used on documents. */
export function NotesToolPanel() {
  const { recordContext, closeTool } = useRightTool()
  const contextLabel = recordContext
    ? recordContext.subtitle
      ? `${recordContext.title} · ${recordContext.subtitle}`
      : recordContext.title
    : undefined

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
          pb: 0.5,
          bgcolor: 'background.paper',
          flexShrink: 0,
        }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="subtitle1"
            component="h2"
            sx={{ ...copilotDrawerHeadingSx, lineHeight: 1.35, mb: 0.25 }}
          >
            {documentViewerAttachLabels.note ?? 'Add Note'}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={bodySx}>
            {contextLabel ?? 'No record selected'}
          </Typography>
        </Box>
        <IconButton size="small" onClick={closeTool} aria-label="Close Notes" sx={{ mt: -0.25 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Box
        sx={{
          px: `${layoutTokens.contentPaddingX}px`,
          pt: 0.75,
          pb: layoutTokens.contentPaddingX / 8,
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <DocumentAttachPanelContent
          attachMode={noteAttachMode}
          contextLabel={contextLabel}
          initialSubject={contextLabel ? `Note on ${contextLabel}` : 'New note'}
          initialBody=""
          onCancel={closeTool}
          onSave={() => closeTool()}
        />
      </Box>
    </Box>
  )
}

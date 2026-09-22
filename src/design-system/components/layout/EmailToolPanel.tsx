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
  getAttachPanelSubtitle,
  targetLabels,
  type DocumentAttachMode,
} from '@/pages/policies/components/DocumentAttachComposer'
import { copilotDrawerHeadingSx } from '@/pages/policies/components/copilot/copilotDrawerStyles'

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

const emptyEmailAttachMode: DocumentAttachMode = { target: 'email', documents: [] }

function defaultEmailBody(contextLabel?: string) {
  if (!contextLabel) {
    return `Hi,

Please review the details below and let me know if you have any questions.

Best regards`
  }

  return `Hi,

Following up regarding ${contextLabel}. Please review and let me know if you have any questions.

Best regards`
}

/** Email tool — same Draft Email composer used on documents. */
export function EmailToolPanel() {
  const { recordContext, emailAttachMode, closeTool, setEmailAttachMode } = useRightTool()
  const attachMode = emailAttachMode?.target === 'email' ? emailAttachMode : emptyEmailAttachMode
  const hasDocuments = attachMode.documents.length > 0
  const draft = attachMode.draft
  const contextLabel = recordContext
    ? recordContext.subtitle
      ? `${recordContext.title} · ${recordContext.subtitle}`
      : recordContext.title
    : undefined

  const clearDraftAndClose = () => {
    const onCancel = attachMode.onCancel
    setEmailAttachMode(null)
    if (onCancel) {
      onCancel()
    } else {
      closeTool()
    }
  }

  const handleSave = () => {
    const onSave = attachMode.onSave
    setEmailAttachMode(null)
    onSave?.()
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
            {draft?.title ?? documentViewerAttachLabels.email ?? targetLabels.email}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={bodySx}>
            {draft?.subtitle
              ? draft.subtitle
              : hasDocuments
                ? getAttachPanelSubtitle(attachMode)
                : (contextLabel ?? 'No record selected')}
          </Typography>
        </Box>
        <IconButton size="small" onClick={clearDraftAndClose} aria-label="Close Email" sx={{ mt: -0.25 }}>
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
          attachMode={attachMode}
          contextLabel={contextLabel}
          saveLabel={draft?.saveLabel}
          readOnly={Boolean(attachMode.readOnly)}
          {...(draft
            ? {
                initialTo: draft.to,
                initialSubject: draft.subject,
                initialBody: draft.body,
              }
            : hasDocuments
              ? {}
              : {
                  initialSubject: contextLabel ? `Re: ${contextLabel}` : '',
                  initialBody: defaultEmailBody(contextLabel),
                })}
          onCancel={clearDraftAndClose}
          onSave={handleSave}
        />
      </Box>
    </Box>
  )
}

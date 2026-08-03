import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import Box from '@mui/material/Box'
import MuiButton from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { CopilotIcon } from '@/design-system/components'
import { getPanelToggleButtonStyles, isDarkMode } from '@/design-system/theme/themeSurfaces'
import { getFigmaColors } from '@/design-system/tokens/figma-colors'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import type { PolicyDocument } from '@/pages/policies/data/mockDocuments'

type DocumentViewerHeaderProps = {
  document: PolicyDocument
  entityLabel: string
  copilotOpen: boolean
  onToggleCopilot: () => void
  onBack: () => void
}

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

const headingSx = {
  fontFamily: figmaFontFamilyStack.heading,
  fontWeight: 600,
} as const

function formatReceivedTime(document: PolicyDocument) {
  return `received ${document.relativeTime}`
}

function DocumentsHomeButton({ onClick }: { onClick: () => void }) {
  return (
    <Tooltip title="All documents">
      <Box
        component="button"
        type="button"
        onClick={onClick}
        aria-label="Back to documents"
        sx={(theme) => {
          const secondary = getFigmaColors(theme.palette.mode).secondary

          return {
            width: 40,
            height: 40,
            borderRadius: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: 0,
            p: 0,
            cursor: 'pointer',
            bgcolor: isDarkMode(theme) ? theme.figmaPalette.teal[900] : theme.figmaPalette.teal[100],
            color: secondary.main,
            transition: 'background-color 0.15s ease',
            '&:hover': {
              bgcolor: isDarkMode(theme) ? theme.figmaPalette.teal[800] : theme.figmaPalette.teal[200],
            },
            '&:focus-visible': {
              outline: `2px solid ${theme.palette.primary.main}`,
              outlineOffset: 2,
            },
          }
        }}
      >
        <DescriptionOutlinedIcon sx={{ fontSize: 22 }} />
      </Box>
    </Tooltip>
  )
}

export function DocumentViewerHeader({
  document,
  entityLabel,
  copilotOpen,
  onToggleCopilot,
  onBack,
}: DocumentViewerHeaderProps) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'stretch', sm: 'center' }}
      justifyContent="space-between"
      spacing={{ xs: 1.25, sm: 2 }}
      sx={{
        px: `${layoutTokens.contentPaddingX}px`,
        pt: layoutTokens.policyHeaderTopPadding,
        pb: 1.25,
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        flexShrink: 0,
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="flex-start" sx={{ minWidth: 0, flex: 1 }}>
        <DocumentsHomeButton onClick={onBack} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="h6" sx={{ ...headingSx, fontSize: { xs: '1rem', md: '1.125rem' }, lineHeight: 1.35 }}>
            {document.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ ...bodySx, mt: 0.375, fontSize: '0.8125rem' }}>
            {document.fileName} · {entityLabel}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ ...bodySx, display: 'block', mt: 0.5 }}>
            {document.kind} · {formatReceivedTime(document)} · from {document.author}
            {document.authorDetail ? ` (${document.authorDetail})` : ''}
          </Typography>
        </Box>
      </Stack>

      <MuiButton
        size="small"
        variant="text"
        disableRipple
        startIcon={<CopilotIcon size={18} active={copilotOpen} />}
        onClick={onToggleCopilot}
        sx={(theme) => ({
          ...getPanelToggleButtonStyles(theme, copilotOpen),
          fontFamily: figmaFontFamilyStack.body,
          flexShrink: 0,
          alignSelf: { xs: 'flex-end', sm: 'flex-start' },
          '& .MuiButton-startIcon': {
            marginRight: { xs: 0, sm: 0.75 },
          },
          '& .document-viewer-copilot-label': {
            display: { xs: 'none', sm: 'inline' },
          },
        })}
      >
        <span className="document-viewer-copilot-label">Copilot</span>
      </MuiButton>
    </Stack>
  )
}

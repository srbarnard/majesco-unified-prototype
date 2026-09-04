import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { EntityListHomeButton } from '@/design-system/components'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import type { PolicyDocument } from '@/pages/policies/data/mockDocuments'

type DocumentViewerHeaderProps = {
  document: PolicyDocument
  entityLabel: string
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

export function DocumentViewerHeader({
  document,
  entityLabel,
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
        <EntityListHomeButton
          label="All documents"
          icon={DescriptionOutlinedIcon}
          tone="documents"
          onClick={onBack}
        />
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
    </Stack>
  )
}

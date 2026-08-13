import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { copilotSubtitleSx } from './copilotDrawerStyles'

type CopilotDrawerSubHeaderProps = {
  /** Type label in Majesco secondary (Prompt, Agent, Promise to pay, …). */
  title: string
  /** Item name shown in smaller text under the type. */
  detail?: string
  onBack: () => void
  actions?: ReactNode
}

export function CopilotDrawerSubHeader({ title, detail, onBack, actions }: CopilotDrawerSubHeaderProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'auto minmax(0, 1fr) auto',
        columnGap: 0.5,
        alignItems: 'center',
        mb: detail ? 4 : 1.5,
      }}
    >
      <IconButton
        size="small"
        onClick={onBack}
        aria-label={`Back from ${title}`}
        sx={{ ml: -0.75, gridRow: 1, gridColumn: 1 }}
      >
        <ArrowBackIcon fontSize="small" />
      </IconButton>
      <Typography variant="subtitle2" noWrap sx={{ ...copilotSubtitleSx, gridRow: 1, gridColumn: 2, minWidth: 0 }}>
        {title}
      </Typography>
      {actions ? (
        <Stack direction="row" alignItems="center" spacing={0.25} sx={{ gridRow: 1, gridColumn: 3, flexShrink: 0 }}>
          {actions}
        </Stack>
      ) : null}
      {detail ? (
        <Typography
          variant="caption"
          color="text.secondary"
          noWrap
          sx={{
            gridRow: 2,
            gridColumn: 2,
            minWidth: 0,
            mt: 0.15,
            lineHeight: 1.35,
            fontFamily: figmaFontFamilyStack.body,
            fontWeight: 400,
          }}
        >
          {detail}
        </Typography>
      ) : null}
    </Box>
  )
}

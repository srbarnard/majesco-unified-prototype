import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import { copilotSubtitleSx } from './copilotDrawerStyles'

type CopilotDrawerSubHeaderProps = {
  title: string
  onBack: () => void
  actions?: ReactNode
}

export function CopilotDrawerSubHeader({ title, onBack, actions }: CopilotDrawerSubHeaderProps) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ mb: 1.5 }}
    >
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minWidth: 0 }}>
        <IconButton size="small" onClick={onBack} aria-label={`Back from ${title}`} sx={{ ml: -0.75 }}>
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Typography variant="subtitle2" sx={copilotSubtitleSx}>
          {title}
        </Typography>
      </Stack>
      {actions && (
        <Stack direction="row" alignItems="center" spacing={0.25}>
          {actions}
        </Stack>
      )}
    </Stack>
  )
}

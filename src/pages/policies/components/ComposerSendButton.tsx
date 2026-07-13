import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import IconButton from '@mui/material/IconButton'
import { accentSubtle, accentSubtleHover, surfaceSubtle } from '@/design-system/theme/themeSurfaces'

type ComposerSendButtonProps = {
  canSubmit: boolean
  onClick: () => void
  ariaLabel?: string
}

export function ComposerSendButton({
  canSubmit,
  onClick,
  ariaLabel = 'Send message',
}: ComposerSendButtonProps) {
  return (
    <IconButton
      size="small"
      aria-label={ariaLabel}
      disabled={!canSubmit}
      onClick={onClick}
      sx={(theme) => ({
        width: 34,
        height: 34,
        bgcolor: canSubmit ? accentSubtle(theme) : surfaceSubtle(theme),
        color: canSubmit ? 'primary.main' : 'text.disabled',
        '&:hover': {
          bgcolor: canSubmit ? accentSubtleHover(theme) : surfaceSubtle(theme),
        },
        '&.Mui-disabled': {
          bgcolor: surfaceSubtle(theme),
          color: 'text.disabled',
        },
      })}
    >
      <KeyboardArrowUpIcon sx={{ fontSize: 20 }} />
    </IconButton>
  )
}

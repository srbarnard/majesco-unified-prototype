import Box from '@mui/material/Box'
import type { SxProps, Theme } from '@mui/material/styles'

export type CopilotIconProps = {
  size?: number
  /** Blue active mark for selected Copilot controls. */
  active?: boolean
  /** @deprecated Use active instead. White mark for dark backgrounds. */
  inverted?: boolean
  sx?: SxProps<Theme>
}

/** Official Majesco Copilot mark used for Copilot actions and AI summaries. */
export function CopilotIcon({ size = 18, active = false, inverted = false, sx }: CopilotIconProps) {
  const src = active
    ? '/assets/copilot-icon-active.png'
    : '/assets/copilot-icon.png'

  return (
    <Box
      component="img"
      src={src}
      alt=""
      aria-hidden
      sx={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        display: 'block',
        objectFit: 'contain',
        objectPosition: 'center',
        flexShrink: 0,
        overflow: 'visible',
        ...(inverted && !active && { filter: 'brightness(0) invert(1)' }),
        ...sx,
      }}
    />
  )
}

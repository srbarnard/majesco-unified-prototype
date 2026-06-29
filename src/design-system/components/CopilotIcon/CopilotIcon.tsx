import Box from '@mui/material/Box'
import { useColorScheme } from '@mui/material/styles'
import type { SxProps, Theme } from '@mui/material/styles'

export type CopilotIconProps = {
  size?: number
  /** Blue active mark for selected Copilot controls. */
  active?: boolean
  /** Force the white mark (e.g. on a dark or colored background in light mode). */
  inverted?: boolean
  sx?: SxProps<Theme>
}

const COPILOT_ICONS = {
  default: '/assets/copilot-icon.png',
  active: '/assets/copilot-icon-active.png',
  white: '/assets/copilot-icon-white.png',
} as const

function resolveCopilotIconSrc(active: boolean, useWhiteMark: boolean) {
  if (active) return COPILOT_ICONS.active
  if (useWhiteMark) return COPILOT_ICONS.white
  return COPILOT_ICONS.default
}

/** Official Majesco Copilot mark used for Copilot actions and AI summaries. */
export function CopilotIcon({ size = 18, active = false, inverted = false, sx }: CopilotIconProps) {
  const { mode } = useColorScheme()
  const isDarkMode = mode === 'dark'
  const useWhiteMark = inverted || isDarkMode
  const src = resolveCopilotIconSrc(active, useWhiteMark)

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
        ...sx,
      }}
    />
  )
}

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
  inactive: '/assets/copilot-icon.png',
  active: '/assets/copilot-icon-active.png',
  /** Charcoal line mark for active controls on light surfaces in dark mode. */
  activeDark: '/assets/copilot-icon-active-dark.png',
  white: '/assets/copilot-icon-white.png',
} as const

function resolveCopilotIconSrc(active: boolean, inverted: boolean, isDarkMode: boolean) {
  if (inverted) return COPILOT_ICONS.white
  if (isDarkMode) {
    // Active selection chips stay light blue in dark mode — use the charcoal mark.
    return active ? COPILOT_ICONS.activeDark : COPILOT_ICONS.white
  }
  if (active) return COPILOT_ICONS.active
  return COPILOT_ICONS.inactive
}

/** Official Majesco Copilot mark used for Copilot actions and AI summaries. */
export function CopilotIcon({ size = 18, active = false, inverted = false, sx }: CopilotIconProps) {
  const { mode, systemMode } = useColorScheme()
  const resolvedMode = mode === 'system' ? systemMode : mode
  const isDarkMode = resolvedMode === 'dark'
  const src = resolveCopilotIconSrc(active, inverted, isDarkMode)
  const mutedInDarkMode = isDarkMode && !active && !inverted

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
        opacity: mutedInDarkMode ? 0.7 : 1,
        ...sx,
      }}
    />
  )
}

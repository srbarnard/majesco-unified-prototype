import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined'
import { useColorScheme } from '@mui/material/styles'
import type { SxProps, Theme } from '@mui/material/styles'

export type CopilotIconProps = {
  size?: number
  /** Primary mark for selected Chat controls. */
  active?: boolean
  /** Force the white mark (e.g. on a dark or colored background in light mode). */
  inverted?: boolean
  sx?: SxProps<Theme>
}

function resolveCopilotIconColor(active: boolean, inverted: boolean, isDarkMode: boolean) {
  if (inverted) return 'common.white'
  if (isDarkMode) {
    // Active selection chips stay light blue in dark mode — use a charcoal mark.
    return active ? 'grey.900' : 'common.white'
  }
  return active ? 'primary.main' : 'text.secondary'
}

/** Chat mark used for Chat actions and AI summaries. */
export function CopilotIcon({ size = 18, active = false, inverted = false, sx }: CopilotIconProps) {
  const { mode, systemMode } = useColorScheme()
  const resolvedMode = mode === 'system' ? systemMode : mode
  const isDarkMode = resolvedMode === 'dark'
  const mutedInDarkMode = isDarkMode && !active && !inverted

  return (
    <ChatOutlinedIcon
      aria-hidden
      sx={{
        fontSize: size,
        width: size,
        height: size,
        minWidth: size,
        display: 'block',
        flexShrink: 0,
        color: resolveCopilotIconColor(active, inverted, isDarkMode),
        opacity: mutedInDarkMode ? 0.7 : 1,
        ...sx,
      }}
    />
  )
}

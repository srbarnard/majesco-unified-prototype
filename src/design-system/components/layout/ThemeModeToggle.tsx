import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import Box from '@mui/material/Box'
import { useColorScheme } from '@mui/material/styles'
import { accentSubtle, isDarkMode, surfaceSubtle } from '@/design-system/theme/themeSurfaces'

const options = [
  { value: 'light' as const, label: 'Light mode', Icon: LightModeOutlinedIcon },
  { value: 'dark' as const, label: 'Dark mode', Icon: DarkModeOutlinedIcon },
]

type ThemeModeToggleProps = {
  fullWidth?: boolean
}

export function ThemeModeToggle({ fullWidth = false }: ThemeModeToggleProps) {
  const { mode, setMode } = useColorScheme()
  const currentMode = mode === 'dark' ? 'dark' : 'light'

  return (
    <Box
      sx={{
        flexShrink: 0,
        borderTop: 1,
        borderColor: 'divider',
        px: fullWidth ? 2 : 1,
        py: 1.25,
        mt: 'auto',
        display: 'flex',
        justifyContent: fullWidth ? 'stretch' : 'center',
      }}
    >
      <Box
        role="group"
        aria-label="Theme"
        sx={(theme) => ({
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 0.375,
          p: 0.375,
          width: '100%',
          maxWidth: fullWidth ? 'none' : 72,
          borderRadius: '999px',
          bgcolor: surfaceSubtle(theme),
          border: `1px solid ${theme.palette.divider}`,
        })}
      >
        {options.map(({ value, label, Icon }) => {
          const active = currentMode === value
          return (
            <Box
              key={value}
              component="button"
              type="button"
              onClick={() => setMode(value)}
              aria-label={label}
              aria-pressed={active}
              sx={(theme) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                py: 0.75,
                border: 'none',
                borderRadius: '999px',
                cursor: 'pointer',
                bgcolor: active ? 'background.paper' : 'transparent',
                color: active ? 'primary.main' : 'text.secondary',
                boxShadow: active && !isDarkMode(theme) ? '0 1px 2px rgba(0, 0, 0, 0.08)' : 'none',
                outline: active ? `1px solid ${theme.palette.divider}` : 'none',
                transition: 'background-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease',
                '&:hover': {
                  color: active ? 'primary.main' : 'text.primary',
                  bgcolor: active ? undefined : accentSubtle(theme),
                },
                '&:focus-visible': {
                  outline: `2px solid ${theme.palette.primary.main}`,
                  outlineOffset: 1,
                },
              })}
            >
              <Icon sx={{ fontSize: 18 }} />
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

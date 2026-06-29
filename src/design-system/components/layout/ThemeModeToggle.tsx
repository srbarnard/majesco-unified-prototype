import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import Box from '@mui/material/Box'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import { useColorScheme } from '@mui/material/styles'

const options = [
  { value: 'light' as const, label: 'Light', Icon: LightModeOutlinedIcon },
  { value: 'dark' as const, label: 'Dark', Icon: DarkModeOutlinedIcon },
]

const itemSx = (active: boolean) =>
  ({
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    py: 1,
    px: 0.5,
    borderRadius: 1,
    minHeight: 56,
    position: 'relative',
    color: active ? 'primary.main' : 'text.secondary',
    '&.Mui-selected': {
      bgcolor: (theme) =>
        theme.palette.mode === 'dark'
          ? theme.figmaPalette.blue[900]
          : theme.figmaPalette.blue[50],
      color: 'primary.main',
    },
    '&::before': active
      ? {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 8,
          bottom: 8,
          width: 3,
          borderRadius: '0 2px 2px 0',
          bgcolor: 'primary.main',
        }
      : undefined,
  }) as const

export function ThemeModeToggle() {
  const { mode, setMode } = useColorScheme()
  const currentMode = mode === 'dark' ? 'dark' : 'light'

  return (
    <Box
      sx={{
        flexShrink: 0,
        borderTop: 1,
        borderColor: 'divider',
        px: 0.5,
        py: 1,
        mt: 'auto',
      }}
    >
      {options.map(({ value, label, Icon }) => {
        const active = currentMode === value
        return (
          <ListItemButton
            key={value}
            selected={active}
            onClick={() => setMode(value)}
            aria-label={`${label} theme`}
            aria-pressed={active}
            sx={itemSx(active)}
          >
            <ListItemIcon sx={{ minWidth: 0, mb: 0.25, color: 'inherit' }}>
              <Icon sx={{ fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText
              primary={label}
              primaryTypographyProps={{
                variant: 'caption',
                fontWeight: active ? 600 : 500,
                fontSize: '0.6875rem',
                textAlign: 'center',
                lineHeight: 1.2,
              }}
              sx={{ m: 0 }}
            />
          </ListItemButton>
        )
      })}
    </Box>
  )
}
